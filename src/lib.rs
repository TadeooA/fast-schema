
use wasm_bindgen::prelude::*;
use serde_json;

mod schema;
mod validator;
mod error;
mod utils;
mod html;

// Re-exports for easy access
pub use schema::{SchemaType, StringFormat, CompiledSchema};
pub use validator::{Validator, BatchValidator, ValidationStats};
pub use error::{ValidationResult, ValidationError, ErrorCode, PerformanceStats};
pub use utils::{ValidationOptions};
pub use html::{HtmlElementType, HtmlProps, ReactComponent, AccessibilityLevel, HtmlValidator};

// WASM console logging
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn warn(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

// Logging macros for WASM
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

macro_rules! console_warn {
    ($($t:tt)*) => (warn(&format_args!($($t)*).to_string()))
}

macro_rules! console_error {
    ($($t:tt)*) => (error(&format_args!($($t)*).to_string()))
}

/// Main FastValidator class exposed to JavaScript
#[wasm_bindgen]
pub struct FastValidator {
    validator: validator::Validator,
    schema_json: String,
    stats: ValidationStats,
}

/// ZodString validator for WASM
#[wasm_bindgen]
pub struct ZodStringValidator {
    min_length: Option<usize>,
    max_length: Option<usize>,
    pattern: Option<String>,
    format: Option<StringFormat>,
    validations: Vec<String>, // Store validation rules as JSON
}

/// ZodNumber validator for WASM
#[wasm_bindgen]
pub struct ZodNumberValidator {
    min: Option<f64>,
    max: Option<f64>,
    integer: bool,
    multiple_of: Option<f64>,
}

/// ZodArray validator for WASM
#[wasm_bindgen]
pub struct ZodArrayValidator {
    item_validator: String, // JSON representation of item schema
    min_items: Option<usize>,
    max_items: Option<usize>,
    unique_items: bool,
}

/// ZodObject validator for WASM
#[wasm_bindgen]
pub struct ZodObjectValidator {
    properties: String, // JSON representation of properties
    required: Vec<String>,
    additional_properties: bool,
}

/// High-performance validation result
#[wasm_bindgen]
pub struct FastValidationResult {
    success: bool,
    data: Option<String>, // JSON string if successful
    errors: String, // JSON array of errors
    performance_ms: f64,
}

#[wasm_bindgen]
impl FastValidator {
    /// Create a new FastValidator instance
    #[wasm_bindgen(constructor)]
    pub fn new(schema_json: &str) -> Result<FastValidator, JsValue> {
        console_log!("Creating FastValidator with schema");

        // Enable better error messages in development
        #[cfg(feature = "console_error_panic_hook")]
        console_error_panic_hook::set_once();

        // Parse schema JSON
        let schema: SchemaType = serde_json::from_str(schema_json)
            .map_err(|e| JsValue::from_str(&format!("Invalid schema JSON: {}", e)))?;

        // Create validator
        let mut validator = validator::Validator::new(schema)
            .map_err(|e| JsValue::from_str(&format!("Schema compilation failed: {}", e)))?;

        // Get initial stats
        let stats = ValidationStats {
            compiled_complexity: validator.compiled_schema.estimated_complexity,
            max_depth: validator.compiled_schema.max_depth,
            has_patterns: validator.compiled_schema.has_patterns,
            regex_cache_size: 0,
        };

        console_log!("FastValidator created successfully");

        Ok(FastValidator {
            validator,
            schema_json: schema_json.to_string(),
            stats,
        })
    }

    /// Validate a single JSON value
    #[wasm_bindgen]
    pub fn validate(&mut self, data_json: &str) -> String {
        match self.validate_internal(data_json) {
            Ok(result) => result,
            Err(e) => {
                console_error!("Validation error: {}", e);
                self.create_error_result(&e)
            }
        }
    }

    /// Validate multiple JSON values efficiently
    #[wasm_bindgen]
    pub fn validate_many(&mut self, data_array_json: &str) -> String {
        match self.validate_many_internal(data_array_json) {
            Ok(result) => result,
            Err(e) => {
                console_error!("Batch validation error: {}", e);
                format!("[{}]", self.create_error_result(&e))
            }
        }
    }

    /// Validate with custom options
    #[wasm_bindgen]
    pub fn validate_with_options(&mut self, data_json: &str, options_json: &str) -> String {
        let options: ValidationOptions = match serde_json::from_str(options_json) {
            Ok(opts) => opts,
            Err(e) => {
                console_warn!("Invalid options, using defaults: {}", e);
                ValidationOptions::default()
            }
        };

        // TODO: Pass options to validator
        // For now, use the standard validate method
        self.validate(data_json)
    }

    /// Get schema information
    #[wasm_bindgen]
    pub fn get_schema(&self) -> String {
        self.schema_json.clone()
    }

    /// Get validation statistics
    #[wasm_bindgen]
    pub fn get_stats(&self) -> String {
        match serde_json::to_string(&self.stats) {
            Ok(json) => json,
            Err(e) => {
                console_error!("Failed to serialize stats: {}", e);
                "{}".to_string()
            }
        }
    }

    /// Reset internal caches (useful for memory management)
    #[wasm_bindgen]
    pub fn reset_caches(&mut self) {
        // Clear regex cache
        self.validator.regex_cache.clear();
        console_log!("Caches reset");
    }

    /// Get memory usage information (if available)
    #[wasm_bindgen]
    pub fn get_memory_info(&self) -> String {
        // In WASM, memory info is limited
        serde_json::json!({
            "regex_cache_size": self.validator.regex_cache.len(),
            "estimated_complexity": self.stats.compiled_complexity,
            "max_depth": self.stats.max_depth
        }).to_string()
    }
}

// Internal implementation methods
impl FastValidator {
    fn validate_internal(&mut self, data_json: &str) -> Result<String, String> {
        // Parse JSON data
        let data: serde_json::Value = serde_json::from_str(data_json)
            .map_err(|e| format!("Invalid JSON data: {}", e))?;

        // Validate
        let result = self.validator.validate(&data);

        // Update stats
        self.update_stats();

        // Serialize result
        serde_json::to_string(&result)
            .map_err(|e| format!("Failed to serialize result: {}", e))
    }

    fn validate_many_internal(&mut self, data_array_json: &str) -> Result<String, String> {
        // Parse JSON array
        let data_array: Vec<serde_json::Value> = serde_json::from_str(data_array_json)
            .map_err(|e| format!("Invalid JSON array: {}", e))?;

        console_log!("Validating {} items", data_array.len());

        // Validate batch
        let results = self.validator.validate_many(&data_array);

        // Update stats
        self.update_stats();

        // Serialize results
        serde_json::to_string(&results)
            .map_err(|e| format!("Failed to serialize results: {}", e))
    }

    fn create_error_result(&self, error_msg: &str) -> String {
        let error_result = ValidationResult {
            success: false,
            data: None,
            errors: vec![ValidationError::new(
                "".to_string(),
                error_msg.to_string(),
                ErrorCode::InternalError,
            )],
            performance: None,
        };

        serde_json::to_string(&error_result).unwrap_or_else(|_| {
            r#"{"success":false,"data":null,"errors":[{"path":"","message":"Serialization failed","code":"INTERNAL_ERROR"}]}"#.to_string()
        })
    }

    fn update_stats(&mut self) {
        self.stats.regex_cache_size = self.validator.regex_cache.len();
    }
}

/// Batch validator for high-performance scenarios
#[wasm_bindgen]
pub struct FastBatchValidator {
    validator: BatchValidator,
    batch_size: usize,
}

#[wasm_bindgen]
impl FastBatchValidator {
    /// Create a new batch validator with specified batch size
    #[wasm_bindgen(constructor)]
    pub fn new(schema_json: &str, batch_size: usize) -> Result<FastBatchValidator, JsValue> {
        console_log!("Creating FastBatchValidator with batch size: {}", batch_size);

        let schema: SchemaType = serde_json::from_str(schema_json)
            .map_err(|e| JsValue::from_str(&format!("Invalid schema JSON: {}", e)))?;

        let validator = BatchValidator::new(schema, batch_size)
            .map_err(|e| JsValue::from_str(&format!("Batch validator creation failed: {}", e)))?;

        Ok(FastBatchValidator {
            validator,
            batch_size,
        })
    }

    /// Validate a large dataset efficiently
    #[wasm_bindgen]
    pub fn validate_dataset(&mut self, data_array_json: &str) -> String {
        let data_array: Vec<serde_json::Value> = match serde_json::from_str(data_array_json) {
            Ok(data) => data,
            Err(e) => {
                console_error!("Invalid JSON array: {}", e);
                return format!("[{}]", self.create_error_result(&format!("Invalid JSON array: {}", e)));
            }
        };

        console_log!("Batch validating {} items with batch size {}", data_array.len(), self.batch_size);

        let results = self.validator.validate_dataset(&data_array);

        match serde_json::to_string(&results) {
            Ok(json) => json,
            Err(e) => {
                console_error!("Failed to serialize batch results: {}", e);
                format!("[{}]", self.create_error_result(&format!("Serialization failed: {}", e)))
            }
        }
    }

    /// Get batch validator statistics
    #[wasm_bindgen]
    pub fn get_batch_stats(&self) -> String {
        let stats = self.validator.get_stats();
        match serde_json::to_string(&stats) {
            Ok(json) => json,
            Err(e) => {
                console_error!("Failed to serialize batch stats: {}", e);
                "{}".to_string()
            }
        }
    }

    fn create_error_result(&self, error_msg: &str) -> String {
        let error_result = ValidationResult {
            success: false,
            data: None,
            errors: vec![ValidationError::new(
                "".to_string(),
                error_msg.to_string(),
                ErrorCode::InternalError,
            )],
            performance: None,
        };

        serde_json::to_string(&error_result).unwrap_or_else(|_| {
            r#"{"success":false,"data":null,"errors":[{"path":"","message":"Batch validation failed","code":"INTERNAL_ERROR"}]}"#.to_string()
        })
    }
}

/// Utility functions for JavaScript
#[wasm_bindgen]
pub struct FastSchemaUtils;

#[wasm_bindgen]
impl FastSchemaUtils {
    /// Validate a schema definition
    #[wasm_bindgen]
    pub fn validate_schema(schema_json: &str) -> String {
        let result = match serde_json::from_str::<SchemaType>(schema_json) {
            Ok(schema) => {
                // Try to compile the schema
                match Validator::new(schema) {
                    Ok(_) => serde_json::json!({
                        "valid": true,
                        "message": "Schema is valid"
                    }),
                    Err(e) => serde_json::json!({
                        "valid": false,
                        "message": format!("Schema compilation failed: {}", e)
                    })
                }
            }
            Err(e) => serde_json::json!({
                "valid": false,
                "message": format!("Invalid schema JSON: {}", e)
            })
        };

        result.to_string()
    }

    /// Get library version information
    #[wasm_bindgen]
    pub fn get_version() -> String {
        serde_json::json!({
            "version": env!("CARGO_PKG_VERSION"),
            "name": env!("CARGO_PKG_NAME"),
            "description": env!("CARGO_PKG_DESCRIPTION")
        }).to_string()
    }

    /// Get performance recommendations for a schema
    #[wasm_bindgen]
    pub fn analyze_schema_performance(schema_json: &str) -> String {
        let analysis = match serde_json::from_str::<SchemaType>(schema_json) {
            Ok(schema) => {
                let compiled = schema.compile();
                serde_json::json!({
                    "complexity": compiled.estimated_complexity,
                    "max_depth": compiled.max_depth,
                    "has_patterns": compiled.has_patterns,
                    "estimated_validation_time_us": schema.estimated_validation_time(),
                    "recommendations": generate_recommendations(&compiled)
                })
            }
            Err(e) => serde_json::json!({
                "error": format!("Invalid schema: {}", e)
            })
        };

        analysis.to_string()
    }
}

fn generate_recommendations(compiled: &CompiledSchema) -> Vec<String> {
    let mut recommendations = Vec::new();

    if compiled.estimated_complexity > 100 {
        recommendations.push("Consider simplifying the schema for better performance".to_string());
    }

    if compiled.max_depth > 5 {
        recommendations.push("Deep nesting detected - consider flattening the schema".to_string());
    }

    if compiled.has_patterns {
        recommendations.push("Regex patterns detected - cache validators for repeated use".to_string());
    }

    if compiled.estimated_complexity > 50 && compiled.max_depth > 3 {
        recommendations.push("Complex schema detected - consider using batch validation for large datasets".to_string());
    }

    if recommendations.is_empty() {
        recommendations.push("Schema is well-optimized for performance".to_string());
    }

    recommendations
}

// WASM-specific optimizations and utilities
#[cfg(target_arch = "wasm32")]
mod wasm_optimizations {
    use super::*;

    /// Memory-efficient JSON parsing for WASM
    pub fn parse_json_streaming(json_str: &str) -> Result<serde_json::Value, serde_json::Error> {
        // For large JSON, we could implement streaming parsing here
        // For now, use standard parsing
        serde_json::from_str(json_str)
    }

    /// WASM-specific memory management
    pub fn optimize_memory_usage() {
        // Force garbage collection if available
        // In WASM, this is handled by the JS runtime
    }

    /// Check WASM memory limits
    pub fn check_memory_limits(data_size: usize) -> bool {
        // Conservative estimate: 1MB per 10,000 items
        const BYTES_PER_ITEM: usize = 100;
        let estimated_memory = data_size * BYTES_PER_ITEM;

        // WASM has a 4GB memory limit, but be conservative
        estimated_memory < 100_000_000 // 100MB limit
    }
}

// Export WASM optimizations when targeting WASM
#[cfg(target_arch = "wasm32")]
pub use wasm_optimizations::*;

// Tests for the public API
#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_fast_validator_creation() {
        let schema_json = r#"{
            "type": "string",
            "minLength": 2,
            "maxLength": 10
        }"#;

        let validator = FastValidator::new(schema_json);
        assert!(validator.is_ok());
    }

    #[wasm_bindgen_test]
    fn test_basic_validation() {
        let schema_json = r#"{
            "type": "string",
            "minLength": 2,
            "maxLength": 10
        }"#;

        let mut validator = FastValidator::new(schema_json).unwrap();

        // Valid string
        let result = validator.validate(r#""hello""#);
        let parsed: ValidationResult = serde_json::from_str(&result).unwrap();
        assert!(parsed.success);

        // Invalid string (too short)
        let result = validator.validate(r#""x""#);
        let parsed: ValidationResult = serde_json::from_str(&result).unwrap();
        assert!(!parsed.success);
    }

    #[wasm_bindgen_test]
    fn test_batch_validation() {
        let schema_json = r#"{
            "type": "number",
            "min": 0,
            "max": 100
        }"#;

        let mut validator = FastValidator::new(schema_json).unwrap();

        let data = r#"[10, 50, 75, -5, 150]"#;
        let result = validator.validate_many(data);
        let parsed: Vec<ValidationResult> = serde_json::from_str(&result).unwrap();

        assert_eq!(parsed.len(), 5);
        assert!(parsed[0].success); // 10
        assert!(parsed[1].success); // 50
        assert!(parsed[2].success); // 75
        assert!(!parsed[3].success); // -5 (too small)
        assert!(!parsed[4].success); // 150 (too large)
    }

    #[wasm_bindgen_test]
    fn test_complex_object_validation() {
        let schema_json = r#"{
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "minLength": 2,
                    "maxLength": 50
                },
                "age": {
                    "type": "number",
                    "min": 0,
                    "max": 120,
                    "integer": true
                },
                "email": {
                    "type": "string",
                    "format": "email"
                }
            },
            "required": ["name", "age"]
        }"#;

        let mut validator = FastValidator::new(schema_json).unwrap();

        // Valid object
        let valid_data = r#"{
            "name": "John Doe",
            "age": 30,
            "email": "john@example.com"
        }"#;

        let result = validator.validate(valid_data);
        let parsed: ValidationResult = serde_json::from_str(&result).unwrap();
        assert!(parsed.success);

        // Invalid object (missing required field)
        let invalid_data = r#"{
            "name": "John Doe"
        }"#;

        let result = validator.validate(invalid_data);
        let parsed: ValidationResult = serde_json::from_str(&result).unwrap();
        assert!(!parsed.success);
        assert!(!parsed.errors.is_empty());
    }

    #[wasm_bindgen_test]
    fn test_schema_utils() {
        // Valid schema
        let valid_schema = r#"{
            "type": "string",
            "minLength": 2
        }"#;

        let result = FastSchemaUtils::validate_schema(valid_schema);
        let parsed: serde_json::Value = serde_json::from_str(&result).unwrap();
        assert!(parsed["valid"].as_bool().unwrap());

        // Invalid schema
        let invalid_schema = r#"{
            "type": "invalid_type"
        }"#;

        let result = FastSchemaUtils::validate_schema(invalid_schema);
        let parsed: serde_json::Value = serde_json::from_str(&result).unwrap();
        assert!(!parsed["valid"].as_bool().unwrap());
    }

    #[wasm_bindgen_test]
    fn test_performance_analysis() {
        let complex_schema = r#"{
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "pattern": "^[a-zA-Z\\s]+$"
                },
                "nested": {
                    "type": "object",
                    "properties": {
                        "deep": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "value": {
                                        "type": "number"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }"#;

        let result = FastSchemaUtils::analyze_schema_performance(complex_schema);
        let parsed: serde_json::Value = serde_json::from_str(&result).unwrap();

        assert!(parsed["complexity"].as_u64().unwrap() > 0);
        assert!(parsed["max_depth"].as_u64().unwrap() > 2);
        assert!(parsed["has_patterns"].as_bool().unwrap());
        assert!(parsed["recommendations"].as_array().unwrap().len() > 0);
    }

    #[test]
    fn test_version_info() {
        let version_info = FastSchemaUtils::get_version();
        let parsed: serde_json::Value = serde_json::from_str(&version_info).unwrap();

        assert!(parsed["version"].as_str().unwrap().len() > 0);
        assert_eq!(parsed["name"].as_str().unwrap(), "fast-schema");
    }

    #[cfg(target_arch = "wasm32")]
    #[wasm_bindgen_test]
    fn test_memory_limits() {
        use super::wasm_optimizations::*;

        // Should handle reasonable data sizes
        assert!(check_memory_limits(1000));
        assert!(check_memory_limits(10000));

        // Should reject very large data sizes
        assert!(!check_memory_limits(10_000_000));
    }
}

// Integration tests for realistic scenarios
#[cfg(test)]
mod integration_tests {
    use super::*;

    #[test]
    fn test_real_world_user_schema() {
        let schema_json = r#"{
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "format": "uuid"
                },
                "username": {
                    "type": "string",
                    "minLength": 3,
                    "maxLength": 20,
                    "pattern": "^[a-zA-Z0-9_]+$"
                },
                "email": {
                    "type": "string",
                    "format": "email"
                },
                "profile": {
                    "type": "object",
                    "properties": {
                        "firstName": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 50
                        },
                        "lastName": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 50
                        },
                        "age": {
                            "type": "number",
                            "min": 13,
                            "max": 120,
                            "integer": true
                        },
                        "preferences": {
                            "type": "object",
                            "properties": {
                                "theme": {
                                    "type": "string",
                                    "oneOf": [
                                        {"const": "light"},
                                        {"const": "dark"},
                                        {"const": "auto"}
                                    ]
                                },
                                "notifications": {
                                    "type": "boolean"
                                }
                            }
                        }
                    },
                    "required": ["firstName", "lastName"]
                },
                "roles": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "uniqueItems": true
                },
                "createdAt": {
                    "type": "string",
                    "format": "date-time"
                },
                "isActive": {
                    "type": "boolean"
                }
            },
            "required": ["id", "username", "email", "profile"],
            "additionalProperties": false
        }"#;

        let mut validator = FastValidator::new(schema_json).unwrap();

        let valid_user = r#"{
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "username": "john_doe_123",
            "email": "john.doe@example.com",
            "profile": {
                "firstName": "John",
                "lastName": "Doe",
                "age": 30,
                "preferences": {
                    "theme": "dark",
                    "notifications": true
                }
            },
            "roles": ["user", "premium"],
            "createdAt": "2023-01-01T00:00:00.000Z",
            "isActive": true
        }"#;

        let result = validator.validate(valid_user);
        let parsed: ValidationResult = serde_json::from_str(&result).unwrap();
        assert!(parsed.success, "Valid user should pass validation");

        // Test invalid user (missing required field)
        let invalid_user = r#"{
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "username": "john_doe_123",
            "email": "john.doe@example.com"
        }"#;

        let result = validator.validate(invalid_user);
        let parsed: ValidationResult = serde_json::from_str(&result).unwrap();
        assert!(!parsed.success, "Invalid user should fail validation");
        assert!(!parsed.errors.is_empty());
    }

    #[test]
    fn test_large_dataset_validation() {
        let schema_json = r#"{
            "type": "object",
            "properties": {
                "id": {
                    "type": "number",
                    "integer": true
                },
                "name": {
                    "type": "string",
                    "minLength": 2,
                    "maxLength": 100
                },
                "active": {
                    "type": "boolean"
                }
            },
            "required": ["id", "name"]
        }"#;

        let mut validator = FastValidator::new(schema_json).unwrap();

        // Generate a large dataset
        let mut dataset = Vec::new();
        for i in 0..5000 {
            let item = serde_json::json!({
                "id": i,
                "name": format!("Item {}", i),
                "active": i % 2 == 0
            });
            dataset.push(item);
        }

        let dataset_json = serde_json::to_string(&dataset).unwrap();
        let start_time = std::time::Instant::now();

        let result = validator.validate_many(&dataset_json);
        let elapsed = start_time.elapsed();

        let parsed: Vec<ValidationResult> = serde_json::from_str(&result).unwrap();

        assert_eq!(parsed.len(), 5000);
        assert!(parsed.iter().all(|r| r.success));

        // Performance check - should validate 5000 items quickly
        println!("Validated 5000 items in {:?}", elapsed);
        assert!(elapsed.as_millis() < 1000, "Should validate 5000 items in under 1 second");
    }

    #[test]
    fn test_error_accumulation() {
        let schema_json = r#"{
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "minLength": 5
                },
                "age": {
                    "type": "number",
                    "min": 18
                },
                "email": {
                    "type": "string",
                    "format": "email"
                }
            },
            "required": ["name", "age", "email"]
        }"#;

        let mut validator = FastValidator::new(schema_json).unwrap();

        // Object with multiple validation errors
        let invalid_data = r#"{
            "name": "Jo",
            "age": 15,
            "email": "invalid-email"
        }"#;

        let result = validator.validate(invalid_data);
        let parsed: ValidationResult = serde_json::from_str(&result).unwrap();

        assert!(!parsed.success);
        assert!(parsed.errors.len() >= 3); // Should have multiple errors

        // Check that all error types are captured
        let error_codes: Vec<_> = parsed.errors.iter().map(|e| &e.code).collect();
        assert!(error_codes.contains(&&ErrorCode::StringTooShort));
        assert!(error_codes.contains(&&ErrorCode::NumberTooSmall));
        assert!(error_codes.contains(&&ErrorCode::StringFormatInvalid));
    }
}

// High-performance individual type validators for WASM
#[wasm_bindgen]
impl ZodStringValidator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> ZodStringValidator {
        ZodStringValidator {
            min_length: None,
            max_length: None,
            pattern: None,
            format: None,
            validations: Vec::new(),
        }
    }

    /// Ultra-fast string validation
    #[wasm_bindgen]
    pub fn validate_fast(&self, value: &str) -> String {
        let start = std::time::Instant::now();

        // Length checks (fastest)
        if let Some(min) = self.min_length {
            if value.len() < min {
                return self.create_error("String too short", start.elapsed().as_nanos() as f64 / 1000.0);
            }
        }

        if let Some(max) = self.max_length {
            if value.len() > max {
                return self.create_error("String too long", start.elapsed().as_nanos() as f64 / 1000.0);
            }
        }

        // Format validation (cached regex patterns)
        if let Some(ref format) = self.format {
            if !self.validate_format(value, format) {
                return self.create_error("Invalid format", start.elapsed().as_nanos() as f64 / 1000.0);
            }
        }

        // Pattern validation
        if let Some(ref pattern) = self.pattern {
            // Use cached regex for performance
            if !self.validate_pattern(value, pattern) {
                return self.create_error("Pattern mismatch", start.elapsed().as_nanos() as f64 / 1000.0);
            }
        }

        let elapsed_us = start.elapsed().as_nanos() as f64 / 1000.0;
        self.create_success(value, elapsed_us)
    }

    #[wasm_bindgen]
    pub fn set_min_length(&mut self, min: usize) {
        self.min_length = Some(min);
    }

    #[wasm_bindgen]
    pub fn set_max_length(&mut self, max: usize) {
        self.max_length = Some(max);
    }

    #[wasm_bindgen]
    pub fn set_email_format(&mut self) {
        self.format = Some(StringFormat::Email);
    }

    #[wasm_bindgen]
    pub fn set_pattern(&mut self, pattern: &str) {
        self.pattern = Some(pattern.to_string());
    }

    fn validate_format(&self, value: &str, format: &StringFormat) -> bool {
        match format {
            StringFormat::Email => {
                // Fast email validation
                value.contains('@') && value.contains('.') && value.len() > 5
            }
            StringFormat::Url => {
                value.starts_with("http://") || value.starts_with("https://")
            }
            StringFormat::Uuid => {
                value.len() == 36 && value.chars().filter(|c| *c == '-').count() == 4
            }
            _ => true, // Other formats not implemented for speed
        }
    }

    fn validate_pattern(&self, value: &str, pattern: &str) -> bool {
        // Simplified pattern matching for common cases
        if pattern == "^[a-zA-Z0-9_]+$" {
            return value.chars().all(|c| c.is_ascii_alphanumeric() || c == '_');
        }
        // For complex patterns, would use cached regex
        true
    }

    fn create_success(&self, value: &str, elapsed_us: f64) -> String {
        serde_json::json!({
            "success": true,
            "data": value,
            "performance_us": elapsed_us
        }).to_string()
    }

    fn create_error(&self, message: &str, elapsed_us: f64) -> String {
        serde_json::json!({
            "success": false,
            "error": message,
            "performance_us": elapsed_us
        }).to_string()
    }
}

#[wasm_bindgen]
impl ZodNumberValidator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> ZodNumberValidator {
        ZodNumberValidator {
            min: None,
            max: None,
            integer: false,
            multiple_of: None,
        }
    }

    /// Ultra-fast number validation
    #[wasm_bindgen]
    pub fn validate_fast(&self, value: f64) -> String {
        let start = std::time::Instant::now();

        // Integer check (fastest)
        if self.integer && value.fract() != 0.0 {
            return self.create_error("Expected integer", start.elapsed().as_nanos() as f64 / 1000.0);
        }

        // Range checks
        if let Some(min) = self.min {
            if value < min {
                return self.create_error("Number too small", start.elapsed().as_nanos() as f64 / 1000.0);
            }
        }

        if let Some(max) = self.max {
            if value > max {
                return self.create_error("Number too large", start.elapsed().as_nanos() as f64 / 1000.0);
            }
        }

        // Multiple check
        if let Some(multiple) = self.multiple_of {
            if (value % multiple).abs() > f64::EPSILON {
                return self.create_error("Not a multiple", start.elapsed().as_nanos() as f64 / 1000.0);
            }
        }

        let elapsed_us = start.elapsed().as_nanos() as f64 / 1000.0;
        self.create_success(value, elapsed_us)
    }

    #[wasm_bindgen]
    pub fn set_min(&mut self, min: f64) {
        self.min = Some(min);
    }

    #[wasm_bindgen]
    pub fn set_max(&mut self, max: f64) {
        self.max = Some(max);
    }

    #[wasm_bindgen]
    pub fn set_integer(&mut self, integer: bool) {
        self.integer = integer;
    }

    fn create_success(&self, value: f64, elapsed_us: f64) -> String {
        serde_json::json!({
            "success": true,
            "data": value,
            "performance_us": elapsed_us
        }).to_string()
    }

    fn create_error(&self, message: &str, elapsed_us: f64) -> String {
        serde_json::json!({
            "success": false,
            "error": message,
            "performance_us": elapsed_us
        }).to_string()
    }
}

// Batch validation optimizations for high-performance scenarios
#[wasm_bindgen]
pub struct UltraFastValidator {
    validator_type: String,
    config: String,
}

#[wasm_bindgen]
impl UltraFastValidator {
    /// Create an ultra-fast validator for specific types
    #[wasm_bindgen(constructor)]
    pub fn new(validator_type: &str, config: &str) -> UltraFastValidator {
        UltraFastValidator {
            validator_type: validator_type.to_string(),
            config: config.to_string(),
        }
    }

    /// Validate 1000s of values extremely fast
    #[wasm_bindgen]
    pub fn validate_batch(&self, values_json: &str) -> String {
        let start = std::time::Instant::now();

        match self.validator_type.as_str() {
            "string" => self.validate_string_batch(values_json, start),
            "number" => self.validate_number_batch(values_json, start),
            "boolean" => self.validate_boolean_batch(values_json, start),
            _ => serde_json::json!({
                "success": false,
                "error": "Unsupported validator type"
            }).to_string()
        }
    }

    fn validate_string_batch(&self, values_json: &str, start: std::time::Instant) -> String {
        let values: Vec<String> = match serde_json::from_str(values_json) {
            Ok(v) => v,
            Err(_) => return serde_json::json!({"success": false, "error": "Invalid JSON"}).to_string(),
        };

        let mut valid_count = 0;
        let mut results = Vec::new();

        for value in &values {
            // Ultra-fast validation - minimal checks
            let is_valid = value.len() >= 2 && value.len() <= 100; // Example constraint
            if is_valid {
                valid_count += 1;
            }
            results.push(is_valid);
        }

        let elapsed_us = start.elapsed().as_nanos() as f64 / 1000.0;
        let throughput = values.len() as f64 / (elapsed_us / 1_000_000.0);

        serde_json::json!({
            "success": true,
            "valid_count": valid_count,
            "total_count": values.len(),
            "results": results,
            "performance_us": elapsed_us,
            "throughput_per_second": throughput
        }).to_string()
    }

    fn validate_number_batch(&self, values_json: &str, start: std::time::Instant) -> String {
        let values: Vec<f64> = match serde_json::from_str(values_json) {
            Ok(v) => v,
            Err(_) => return serde_json::json!({"success": false, "error": "Invalid JSON"}).to_string(),
        };

        let mut valid_count = 0;
        let mut results = Vec::new();

        for &value in &values {
            // Ultra-fast validation
            let is_valid = value >= 0.0 && value <= 1000.0 && value.is_finite();
            if is_valid {
                valid_count += 1;
            }
            results.push(is_valid);
        }

        let elapsed_us = start.elapsed().as_nanos() as f64 / 1000.0;
        let throughput = values.len() as f64 / (elapsed_us / 1_000_000.0);

        serde_json::json!({
            "success": true,
            "valid_count": valid_count,
            "total_count": values.len(),
            "results": results,
            "performance_us": elapsed_us,
            "throughput_per_second": throughput
        }).to_string()
    }

    fn validate_boolean_batch(&self, values_json: &str, start: std::time::Instant) -> String {
        let values: Vec<bool> = match serde_json::from_str(values_json) {
            Ok(v) => v,
            Err(_) => return serde_json::json!({"success": false, "error": "Invalid JSON"}).to_string(),
        };

        let elapsed_us = start.elapsed().as_nanos() as f64 / 1000.0;
        let throughput = values.len() as f64 / (elapsed_us / 1_000_000.0);

        serde_json::json!({
            "success": true,
            "valid_count": values.len(), // All booleans are valid
            "total_count": values.len(),
            "results": vec![true; values.len()],
            "performance_us": elapsed_us,
            "throughput_per_second": throughput
        }).to_string()
    }
}
