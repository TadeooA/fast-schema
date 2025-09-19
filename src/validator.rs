// src/validator.rs
use crate::error::{ValidationResult, ValidationError, ErrorCode};
use crate::schema::{SchemaType, StringFormat, CompiledSchema};
use crate::utils::{
    validate_string_format, PathBuilder, UniqueChecker, ValidationContext,
    ValidationOptions, SchemaOptimizer, json_type_name, is_integer
};
use regex::Regex;
use std::collections::HashMap;
use std::sync::Arc;

/// Main validation engine
pub struct Validator {
    compiled_schema: CompiledSchema,
    regex_cache: HashMap<String, Arc<Regex>>,
}

impl Validator {
    /// Create a new validator with compiled schema
    pub fn new(schema: SchemaType) -> Result<Self, crate::error::FastSchemaError> {
        let compiled_schema = schema.compile();

        Ok(Self {
            compiled_schema,
            regex_cache: HashMap::new(),
        })
    }

    /// Validate a single value
    pub fn validate(&mut self, value: &serde_json::Value) -> ValidationResult {
        let options = ValidationOptions::default();
        let mut context = ValidationContext::new(options);

        let errors = self.validate_value(value, &self.compiled_schema.schema, &mut context);

        if errors.is_empty() {
            if context.options.enable_performance_tracking {
                ValidationResult::success_with_stats(value.clone(), context.performance.finish())
            } else {
                ValidationResult::success(value.clone())
            }
        } else {
            if context.options.enable_performance_tracking {
                ValidationResult::failure_with_stats(errors, context.performance.finish())
            } else {
                ValidationResult::failure(errors)
            }
        }
    }

    /// Validate multiple values efficiently
    pub fn validate_many(&mut self, values: &[serde_json::Value]) -> Vec<ValidationResult> {
        let options = ValidationOptions {
            enable_performance_tracking: true,
            parallel_threshold: 100,
            ..Default::default()
        };

        // Optimize schema for batch processing
        let optimized_schema = SchemaOptimizer::optimize_for_batch(
            &self.compiled_schema.schema,
            values.len()
        );

        // Check if we can parallelize validation
        if SchemaOptimizer::can_parallelize(&optimized_schema, values.len()) {
            self.validate_parallel(values, &optimized_schema, options)
        } else {
            self.validate_sequential(values, &optimized_schema, options)
        }
    }

    /// Sequential validation for smaller datasets or complex schemas
    fn validate_sequential(
        &mut self,
        values: &[serde_json::Value],
        schema: &SchemaType,
        options: ValidationOptions
    ) -> Vec<ValidationResult> {
        let mut results = Vec::with_capacity(values.len());

        for (index, value) in values.iter().enumerate() {
            let mut context = ValidationContext::new(options.clone());
            context.path.push_index(index);
            context.performance.increment_items(1);

            let errors = self.validate_value(value, schema, &mut context);

            if errors.is_empty() {
                results.push(ValidationResult::success_with_stats(
                    value.clone(),
                    context.performance.finish()
                ));
            } else {
                results.push(ValidationResult::failure_with_stats(
                    errors,
                    context.performance.finish()
                ));
            }
        }

        results
    }

    /// Parallel validation for large datasets with simple schemas
    fn validate_parallel(
        &mut self,
        values: &[serde_json::Value],
        schema: &SchemaType,
        options: ValidationOptions
    ) -> Vec<ValidationResult> {
        // For WASM, we'll simulate parallelism with chunked processing
        const CHUNK_SIZE: usize = 1000;

        let mut results = Vec::with_capacity(values.len());

        for chunk in values.chunks(CHUNK_SIZE) {
            let chunk_results = self.validate_chunk(chunk, schema, &options);
            results.extend(chunk_results);
        }

        results
    }

    /// Validate a chunk of values efficiently
    fn validate_chunk(
        &mut self,
        chunk: &[serde_json::Value],
        schema: &SchemaType,
        options: &ValidationOptions
    ) -> Vec<ValidationResult> {
        chunk.iter().enumerate().map(|(index, value)| {
            let mut context = ValidationContext::new(options.clone());
            context.path.push_index(index);
            context.performance.increment_items(1);

            let errors = self.validate_value(value, schema, &mut context);

            if errors.is_empty() {
                ValidationResult::success_with_stats(value.clone(), context.performance.finish())
            } else {
                ValidationResult::failure_with_stats(errors, context.performance.finish())
            }
        }).collect()
    }

    /// Core validation logic
    fn validate_value(
        &mut self,
        value: &serde_json::Value,
        schema: &SchemaType,
        context: &mut ValidationContext,
    ) -> Vec<ValidationError> {
        match schema {
            SchemaType::String { min_length, max_length, pattern, format } => {
                self.validate_string(value, *min_length, *max_length, pattern, format, context)
            }
            SchemaType::Number { min, max, integer, multiple_of } => {
                self.validate_number(value, *min, *max, *integer, *multiple_of, context)
            }
            SchemaType::Boolean => {
                self.validate_boolean(value, context)
            }
            SchemaType::Array { items, min_items, max_items, unique_items } => {
                self.validate_array(value, items, *min_items, *max_items, *unique_items, context)
            }
            SchemaType::Object { properties, required, additional_properties } => {
                self.validate_object(value, properties, required, *additional_properties, context)
            }
            SchemaType::Null => {
                self.validate_null(value, context)
            }
            SchemaType::Any => {
                // Any type is always valid
                Vec::new()
            }
            SchemaType::OneOf { schemas } => {
                self.validate_one_of(value, schemas, context)
            }
            SchemaType::AllOf { schemas } => {
                self.validate_all_of(value, schemas, context)
            }
            SchemaType::AnyOf { schemas } => {
                self.validate_any_of(value, schemas, context)
            }
        }
    }

    /// Validate string type
    fn validate_string(
        &mut self,
        value: &serde_json::Value,
        min_length: Option<usize>,
        max_length: Option<usize>,
        pattern: &Option<String>,
        format: &Option<StringFormat>,
        context: &mut ValidationContext,
    ) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        if let Some(s) = value.as_str() {
            let len = s.chars().count(); // Unicode-aware length

            // Length validation
            if let Some(min) = min_length {
                if len < min {
                    errors.push(ValidationError::string_length(
                        context.path.build(),
                        len,
                        Some(min),
                        max_length,
                    ));
                }
            }

            if let Some(max) = max_length {
                if len > max {
                    errors.push(ValidationError::string_length(
                        context.path.build(),
                        len,
                        min_length,
                        Some(max),
                    ));
                }
            }

            // Pattern validation (cached regex)
            if let Some(pattern_str) = pattern {
                if let Some(regex) = self.get_or_compile_regex(pattern_str) {
                    if !regex.is_match(s) {
                        errors.push(ValidationError::new(
                            context.path.build(),
                            format!("String does not match pattern: {}", pattern_str),
                            ErrorCode::StringPatternMismatch,
                        ));
                    }
                } else {
                    errors.push(ValidationError::new(
                        context.path.build(),
                        format!("Invalid regex pattern: {}", pattern_str),
                        ErrorCode::StringPatternMismatch,
                    ));
                }
            }

            // Format validation
            if let Some(fmt) = format {
                if !validate_string_format(s, fmt) {
                    errors.push(ValidationError::new(
                        context.path.build(),
                        format!("String format '{}' validation failed", fmt_name(fmt)),
                        ErrorCode::StringFormatInvalid,
                    ));
                }
            }
        } else {
            errors.push(ValidationError::type_mismatch(
                context.path.build(),
                "string",
                value,
            ));
        }

        errors
    }

    /// Validate number type
    fn validate_number(
        &mut self,
        value: &serde_json::Value,
        min: Option<f64>,
        max: Option<f64>,
        integer: bool,
        multiple_of: Option<f64>,
        context: &mut ValidationContext,
    ) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        if let Some(n) = value.as_f64() {
            // Integer validation
            if integer && !is_integer(n) {
                errors.push(ValidationError::new(
                    context.path.build(),
                    "Number must be an integer".to_string(),
                    ErrorCode::NumberNotInteger,
                ));
            }

            // Range validation
            if let Some(min_val) = min {
                if n < min_val {
                    errors.push(ValidationError::number_range(
                        context.path.build(),
                        n,
                        Some(min_val),
                        max,
                    ));
                }
            }

            if let Some(max_val) = max {
                if n > max_val {
                    errors.push(ValidationError::number_range(
                        context.path.build(),
                        n,
                        min,
                        Some(max_val),
                    ));
                }
            }

            // Multiple of validation
            if let Some(multiple) = multiple_of {
                if multiple != 0.0 && (n % multiple).abs() > f64::EPSILON {
                    errors.push(ValidationError::new(
                        context.path.build(),
                        format!("Number must be a multiple of {}", multiple),
                        ErrorCode::NumberNotMultipleOf,
                    ));
                }
            }
        } else {
            errors.push(ValidationError::type_mismatch(
                context.path.build(),
                "number",
                value,
            ));
        }

        errors
    }

    /// Validate boolean type
    fn validate_boolean(
        &mut self,
        value: &serde_json::Value,
        context: &mut ValidationContext,
    ) -> Vec<ValidationError> {
        if !value.is_boolean() {
            vec![ValidationError::type_mismatch(
                context.path.build(),
                "boolean",
                value,
            )]
        } else {
            Vec::new()
        }
    }

    /// Validate null type
    fn validate_null(
        &mut self,
        value: &serde_json::Value,
        context: &mut ValidationContext,
    ) -> Vec<ValidationError> {
        if !value.is_null() {
            vec![ValidationError::type_mismatch(
                context.path.build(),
                "null",
                value,
            )]
        } else {
            Vec::new()
        }
    }

    /// Validate array type
    fn validate_array(
        &mut self,
        value: &serde_json::Value,
        items_schema: &SchemaType,
        min_items: Option<usize>,
        max_items: Option<usize>,
        unique_items: bool,
        context: &mut ValidationContext,
    ) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        if let Some(arr) = value.as_array() {
            let len = arr.len();

            // Length validation
            if let Some(min) = min_items {
                if len < min {
                    errors.push(ValidationError::new(
                        context.path.build(),
                        format!("Array must have at least {} items", min),
                        ErrorCode::ArrayTooShort,
                    ));
                }
            }

            if let Some(max) = max_items {
                if len > max {
                    errors.push(ValidationError::new(
                        context.path.build(),
                        format!("Array must have at most {} items", max),
                        ErrorCode::ArrayTooLong,
                    ));
                }
            }

            // Uniqueness validation
            if unique_items {
                let mut unique_checker = UniqueChecker::new();
                for item in arr {
                    if !unique_checker.insert(item) {
                        errors.push(ValidationError::new(
                            context.path.build(),
                            "Array items must be unique".to_string(),
                            ErrorCode::ArrayNotUnique,
                        ));
                        break;
                    }
                }
            }

            // Validate each item
            for (index, item) in arr.iter().enumerate() {
                if !context.should_continue(errors.len()) {
                    break;
                }

                context.path.with_index(index, |ctx| {
                    let item_errors = self.validate_value(item, items_schema, ctx);
                    errors.extend(item_errors);
                });
            }
        } else {
            errors.push(ValidationError::type_mismatch(
                context.path.build(),
                "array",
                value,
            ));
        }

        errors
    }

    /// Validate object type
    fn validate_object(
        &mut self,
        value: &serde_json::Value,
        properties: &HashMap<String, SchemaType>,
        required: &Option<Vec<String>>,
        additional_properties: bool,
        context: &mut ValidationContext,
    ) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        if let Some(obj) = value.as_object() {
            // Check required properties first (fast path)
            if let Some(required_props) = required {
                for prop_name in required_props {
                    if !obj.contains_key(prop_name) {
                        errors.push(ValidationError::missing_property(
                            context.path.build(),
                            prop_name,
                        ));
                    }
                }
            }

            // Validate known properties
            for (prop_name, prop_schema) in properties {
                if let Some(prop_value) = obj.get(prop_name) {
                    if !context.should_continue(errors.len()) {
                        break;
                    }

                    context.path.with_segment(prop_name, |ctx| {
                        let prop_errors = self.validate_value(prop_value, prop_schema, ctx);
                        errors.extend(prop_errors);
                    });
                }
            }

            // Check for additional properties
            if !additional_properties {
                for key in obj.keys() {
                    if !properties.contains_key(key) {
                        errors.push(ValidationError::new(
                            format!("{}.{}", context.path.build(), key),
                            format!("Additional property '{}' is not allowed", key),
                            ErrorCode::ObjectAdditionalProperty,
                        ));
                    }
                }
            }
        } else {
            errors.push(ValidationError::type_mismatch(
                context.path.build(),
                "object",
                value,
            ));
        }

        errors
    }

    /// Validate oneOf constraint
    fn validate_one_of(
        &mut self,
        value: &serde_json::Value,
        schemas: &[SchemaType],
        context: &mut ValidationContext,
    ) -> Vec<ValidationError> {
        let mut valid_count = 0;
        let mut all_errors = Vec::new();

        for (index, schema) in schemas.iter().enumerate() {
            // Create a temporary context to avoid path pollution
            let mut temp_context = ValidationContext::new(context.options.clone());
            temp_context.path = context.path.clone();

            let errors = self.validate_value(value, schema, &mut temp_context);

            if errors.is_empty() {
                valid_count += 1;
            } else {
                all_errors.extend(errors.into_iter().map(|mut e| {
                    e.path = format!("{}[oneOf:{}].{}", context.path.build(), index, e.path);
                    e
                }));
            }
        }

        match valid_count {
            0 => vec![ValidationError::new(
                context.path.build(),
                "Value does not match any oneOf schemas".to_string(),
                ErrorCode::OneOfNoMatch,
            )],
            1 => Vec::new(), // Success
            _ => vec![ValidationError::new(
                context.path.build(),
                format!("Value matches {} oneOf schemas, expected exactly 1", valid_count),
                ErrorCode::OneOfMultipleMatches,
            )],
        }
    }

    /// Validate allOf constraint
    fn validate_all_of(
        &mut self,
        value: &serde_json::Value,
        schemas: &[SchemaType],
        context: &mut ValidationContext,
    ) -> Vec<ValidationError> {
        let mut all_errors = Vec::new();

        for (index, schema) in schemas.iter().enumerate() {
            if !context.should_continue(all_errors.len()) {
                break;
            }

            let mut temp_context = ValidationContext::new(context.options.clone());
            temp_context.path = context.path.clone();

            let errors = self.validate_value(value, schema, &mut temp_context);

            if !errors.is_empty() {
                all_errors.extend(errors.into_iter().map(|mut e| {
                    e.path = format!("{}[allOf:{}].{}", context.path.build(), index, e.path);
                    e
                }));
            }
        }

        all_errors
    }

    /// Validate anyOf constraint
    fn validate_any_of(
        &mut self,
        value: &serde_json::Value,
        schemas: &[SchemaType],
        context: &mut ValidationContext,
    ) -> Vec<ValidationError> {
        let mut all_errors = Vec::new();

        for (index, schema) in schemas.iter().enumerate() {
            let mut temp_context = ValidationContext::new(context.options.clone());
            temp_context.path = context.path.clone();

            let errors = self.validate_value(value, schema, &mut temp_context);

            if errors.is_empty() {
                // Found a matching schema, validation succeeds
                return Vec::new();
            } else {
                all_errors.extend(errors.into_iter().map(|mut e| {
                    e.path = format!("{}[anyOf:{}].{}", context.path.build(), index, e.path);
                    e
                }));
            }
        }

        // No schema matched
        vec![ValidationError::new(
            context.path.build(),
            "Value does not match any anyOf schemas".to_string(),
            ErrorCode::AnyOfNoMatch,
        )]
    }

    /// Get or compile regex pattern (with caching)
    fn get_or_compile_regex(&mut self, pattern: &str) -> Option<Arc<Regex>> {
        if let Some(cached_regex) = self.regex_cache.get(pattern) {
            Some(Arc::clone(cached_regex))
        } else {
            match Regex::new(pattern) {
                Ok(regex) => {
                    let arc_regex = Arc::new(regex);
                    self.regex_cache.insert(pattern.to_string(), Arc::clone(&arc_regex));
                    Some(arc_regex)
                }
                Err(_) => None,
            }
        }
    }
}

/// Get human-readable format name
fn fmt_name(format: &StringFormat) -> &'static str {
    match format {
        StringFormat::Email => "email",
        StringFormat::Uri => "uri",
        StringFormat::Url => "url",
        StringFormat::Uuid => "uuid",
        StringFormat::DateTime => "date-time",
        StringFormat::Date => "date",
        StringFormat::Time => "time",
        StringFormat::Ipv4 => "ipv4",
        StringFormat::Ipv6 => "ipv6",
        StringFormat::Hostname => "hostname",
        StringFormat::JsonPointer => "json-pointer",
        StringFormat::RelativeJsonPointer => "relative-json-pointer",
        StringFormat::Regex => "regex",
    }
}

/// Batch validator for optimized bulk operations
pub struct BatchValidator {
    validator: Validator,
    batch_size: usize,
}

impl BatchValidator {
    pub fn new(schema: SchemaType, batch_size: usize) -> Result<Self, crate::error::FastSchemaError> {
        Ok(Self {
            validator: Validator::new(schema)?,
            batch_size,
        })
    }

    /// Validate large datasets efficiently
    pub fn validate_dataset(&mut self, values: &[serde_json::Value]) -> Vec<ValidationResult> {
        if values.len() <= self.batch_size {
            self.validator.validate_many(values)
        } else {
            let mut results = Vec::with_capacity(values.len());

            for chunk in values.chunks(self.batch_size) {
                let chunk_results = self.validator.validate_many(chunk);
                results.extend(chunk_results);
            }

            results
        }
    }

    /// Get validation statistics for optimization
    pub fn get_stats(&self) -> ValidationStats {
        ValidationStats {
            compiled_complexity: self.validator.compiled_schema.estimated_complexity,
            max_depth: self.validator.compiled_schema.max_depth,
            has_patterns: self.validator.compiled_schema.has_patterns,
            regex_cache_size: self.validator.regex_cache.len(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct ValidationStats {
    pub compiled_complexity: usize,
    pub max_depth: usize,
    pub has_patterns: bool,
    pub regex_cache_size: usize,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_string_validation() {
        let schema = SchemaType::String {
            min_length: Some(2),
            max_length: Some(10),
            pattern: Some(r"^[a-zA-Z]+$".to_string()),
            format: Some(StringFormat::Email),
        };

        let mut validator = Validator::new(schema).unwrap();

        // Valid email
        let result = validator.validate(&json!("test@example.com"));
        assert!(!result.success); // Fails pattern (only letters)

        // Valid pattern but invalid email
        let result = validator.validate(&json!("teststring"));
        assert!(!result.success); // Not an email

        // Too short
        let result = validator.validate(&json!("a"));
        assert!(!result.success);

        // Wrong type
        let result = validator.validate(&json!(123));
        assert!(!result.success);
    }

    #[test]
    fn test_number_validation() {
        let schema = SchemaType::Number {
            min: Some(0.0),
            max: Some(100.0),
            integer: true,
            multiple_of: Some(5.0),
        };

        let mut validator = Validator::new(schema).unwrap();

        // Valid integer multiple of 5
        let result = validator.validate(&json!(25));
        assert!(result.success);

        // Not integer
        let result = validator.validate(&json!(25.5));
        assert!(!result.success);

        // Not multiple of 5
        let result = validator.validate(&json!(23));
        assert!(!result.success);

        // Out of range
        let result = validator.validate(&json!(150));
        assert!(!result.success);
    }

    #[test]
    fn test_object_validation() {
        let mut properties = HashMap::new();
        properties.insert("name".to_string(), SchemaType::String {
            min_length: Some(2),
            max_length: Some(50),
            pattern: None,
            format: None,
        });
        properties.insert("age".to_string(), SchemaType::Number {
            min: Some(0.0),
            max: Some(120.0),
            integer: true,
            multiple_of: None,
        });

        let schema = SchemaType::Object {
            properties,
            required: Some(vec!["name".to_string(), "age".to_string()]),
            additional_properties: false,
        };

        let mut validator = Validator::new(schema).unwrap();

        // Valid object
        let result = validator.validate(&json!({
            "name": "John Doe",
            "age": 30
        }));
        assert!(result.success);

        // Missing required property
        let result = validator.validate(&json!({
            "name": "John Doe"
        }));
        assert!(!result.success);

        // Additional property
        let result = validator.validate(&json!({
            "name": "John Doe",
            "age": 30,
            "extra": "not allowed"
        }));
        assert!(!result.success);
    }

    #[test]
    fn test_array_validation() {
        let schema = SchemaType::Array {
            items: Box::new(SchemaType::Number {
                min: Some(0.0),
                max: None,
                integer: true,
                multiple_of: None,
            }),
            min_items: Some(1),
            max_items: Some(5),
            unique_items: true,
        };

        let mut validator = Validator::new(schema).unwrap();

        // Valid array
        let result = validator.validate(&json!([1, 2, 3]));
        assert!(result.success);

        // Duplicate items
        let result = validator.validate(&json!([1, 2, 2]));
        assert!(!result.success);

        // Too many items
        let result = validator.validate(&json!([1, 2, 3, 4, 5, 6]));
        assert!(!result.success);

        // Empty array
        let result = validator.validate(&json!([]));
        assert!(!result.success);
    }

    #[test]
    fn test_one_of_validation() {
        let schema = SchemaType::OneOf {
            schemas: vec![
                SchemaType::String {
                    min_length: None,
                    max_length: None,
                    pattern: None,
                    format: None,
                },
                SchemaType::Number {
                    min: None,
                    max: None,
                    integer: false,
                    multiple_of: None,
                },
            ],
        };

        let mut validator = Validator::new(schema).unwrap();

        // Valid string
        let result = validator.validate(&json!("test"));
        assert!(result.success);

        // Valid number
        let result = validator.validate(&json!(42));
        assert!(result.success);

        // Invalid type
        let result = validator.validate(&json!(true));
        assert!(!result.success);
    }

    #[test]
    fn test_batch_validation() {
        let schema = SchemaType::String {
            min_length: Some(2),
            max_length: Some(10),
            pattern: None,
            format: None,
        };

        let mut validator = Validator::new(schema).unwrap();

        let values = vec![
            json!("valid1"),
            json!("valid2"),
            json!("x"), // Too short
            json!(123), // Wrong type
            json!("valid3"),
        ];

        let results = validator.validate_many(&values);
        assert_eq!(results.len(), 5);
        assert!(results[0].success);
        assert!(results[1].success);
        assert!(!results[2].success);
        assert!(!results[3].success);
        assert!(results[4].success);
    }

    #[test]
    fn test_performance_tracking() {
        let schema = SchemaType::String {
            min_length: None,
            max_length: None,
            pattern: None,
            format: None,
        };

        let mut validator = Validator::new(schema).unwrap();

        let values: Vec<_> = (0..1000).map(|i| json!(format!("string_{}", i))).collect();
        let results = validator.validate_many(&values);

        assert_eq!(results.len(), 1000);

        // Check that performance stats are included
        if let Some(perf) = &results[0].performance {
            assert!(perf.validation_time_ms >= 0.0);
            assert!(perf.throughput > 0.0);
        }
    }

    #[test]
    fn test_regex_caching() {
        let schema = SchemaType::String {
            min_length: None,
            max_length: None,
            pattern: Some(r"^test_\d+$".to_string()),
            format: None,
        };

        let mut validator = Validator::new(schema).unwrap();

        // First validation compiles regex
        let result1 = validator.validate(&json!("test_123"));
        assert!(result1.success);

        // Second validation should use cached regex
        let result2 = validator.validate(&json!("test_456"));
        assert!(result2.success);

        // Invalid pattern
        let result3 = validator.validate(&json!("invalid"));
        assert!(!result3.success);

        // Verify regex was cached
        assert_eq!(validator.regex_cache.len(), 1);
    }
}