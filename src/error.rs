
use serde::{Deserialize, Serialize};
use std::fmt;
use thiserror::Error;

/// Validation result that can contain multiple errors
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ValidationResult {
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub errors: Vec<ValidationError>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub performance: Option<PerformanceStats>,
}

/// Individual validation error
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ValidationError {
    pub path: String,
    pub message: String,
    pub code: ErrorCode,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub received: Option<String>,
}

/// Performance statistics for optimization
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PerformanceStats {
    pub validation_time_ms: f64,
    pub items_validated: usize,
    pub throughput: f64, // items per second
    pub memory_used_bytes: Option<usize>,
}

/// Error codes for programmatic handling
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ErrorCode {
    // Type errors
    InvalidType,

    // String errors
    StringTooShort,
    StringTooLong,
    StringPatternMismatch,
    StringFormatInvalid,

    // Number errors
    NumberTooSmall,
    NumberTooLarge,
    NumberNotInteger,
    NumberNotMultipleOf,

    // Array errors
    ArrayTooShort,
    ArrayTooLong,
    ArrayNotUnique,
    ArrayItemInvalid,

    // Object errors
    ObjectMissingProperty,
    ObjectAdditionalProperty,
    ObjectPropertyInvalid,

    // Composition errors
    OneOfNoMatch,
    OneOfMultipleMatches,

    // HTML/React specific errors
    InvalidHtmlElement,
    InvalidHtmlAttribute,
    MissingRequiredAttribute,
    DeprecatedAttribute,
    InvalidAttributeValue,
    InvalidComponentType,
    MissingRequiredProp,
    InvalidPropType,
    ChildrenNotAllowed,
    InvalidStructure,
    AccessibilityViolation,
    SemanticWarning,
    InvalidFormat,
    InvalidValue,
    UnknownKey,
    Required,
    DeprecatedFeature,
    AllOfFailure,
    AnyOfNoMatch,

    // Schema errors
    SchemaInvalid,
    SchemaCompilationFailed,

    // Runtime errors
    ValidationFailed,
    InternalError,
}

/// Internal errors for the validation engine
#[derive(Error, Debug)]
pub enum FastSchemaError {
    #[error("Schema compilation failed: {0}")]
    SchemaCompilation(String),

    #[error("JSON parsing failed: {0}")]
    JsonParsing(#[from] serde_json::Error),

    #[error("Regex compilation failed: {0}")]
    RegexCompilation(#[from] regex::Error),

    #[error("Validation failed with {0} errors")]
    ValidationFailed(usize),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl ValidationResult {
    /// Create a successful validation result
    pub fn success(data: serde_json::Value) -> Self {
        Self {
            success: true,
            data: Some(data),
            errors: Vec::new(),
            performance: None,
        }
    }

    /// Create a successful result with performance stats
    pub fn success_with_stats(data: serde_json::Value, stats: PerformanceStats) -> Self {
        Self {
            success: true,
            data: Some(data),
            errors: Vec::new(),
            performance: Some(stats),
        }
    }

    /// Create a failed validation result
    pub fn failure(errors: Vec<ValidationError>) -> Self {
        Self {
            success: false,
            data: None,
            errors,
            performance: None,
        }
    }

    /// Create a failed result with performance stats
    pub fn failure_with_stats(errors: Vec<ValidationError>, stats: PerformanceStats) -> Self {
        Self {
            success: false,
            data: None,
            errors,
            performance: Some(stats),
        }
    }

    /// Add an error to the result
    pub fn add_error(&mut self, error: ValidationError) {
        self.errors.push(error);
        self.success = false;
        self.data = None;
    }

    /// Check if result has errors
    pub fn has_errors(&self) -> bool {
        !self.errors.is_empty()
    }

    /// Get error count
    pub fn error_count(&self) -> usize {
        self.errors.len()
    }

    /// Get first error (most common case)
    pub fn first_error(&self) -> Option<&ValidationError> {
        self.errors.first()
    }

    /// Get errors for a specific path
    pub fn errors_for_path(&self, path: &str) -> Vec<&ValidationError> {
        self.errors.iter().filter(|e| e.path == path).collect()
    }

    /// Merge multiple validation results (for parallel validation)
    pub fn merge(results: Vec<ValidationResult>) -> ValidationResult {
        let mut merged_errors = Vec::new();
        let mut all_successful = true;
        let mut merged_data = None;
        let mut total_time = 0.0;
        let mut total_items = 0;

        for result in results {
            if !result.success {
                all_successful = false;
                merged_errors.extend(result.errors);
            } else if merged_data.is_none() {
                merged_data = result.data;
            }

            if let Some(perf) = result.performance {
                total_time += perf.validation_time_ms;
                total_items += perf.items_validated;
            }
        }

        let performance = if total_items > 0 {
            Some(PerformanceStats {
                validation_time_ms: total_time,
                items_validated: total_items,
                throughput: total_items as f64 / (total_time / 1000.0),
                memory_used_bytes: None,
            })
        } else {
            None
        };

        if all_successful {
            Self {
                success: true,
                data: merged_data,
                errors: Vec::new(),
                performance,
            }
        } else {
            Self {
                success: false,
                data: None,
                errors: merged_errors,
                performance,
            }
        }
    }
}

impl ValidationError {
    /// Create a new validation error
    pub fn new(path: String, message: String, code: ErrorCode) -> Self {
        Self {
            path,
            message,
            code,
            expected: None,
            actual: None,
        }
    }

    /// Create an error with expected and actual values
    pub fn with_values(
        path: String,
        message: String,
        code: ErrorCode,
        expected: serde_json::Value,
        actual: serde_json::Value,
    ) -> Self {
        Self {
            path,
            message,
            code,
            expected: Some(expected),
            actual: Some(actual),
        }
    }

    /// Create a type mismatch error
    pub fn type_mismatch(path: String, expected: &str, actual: &serde_json::Value) -> Self {
        let actual_type = match actual {
            serde_json::Value::Null => "null",
            serde_json::Value::Bool(_) => "boolean",
            serde_json::Value::Number(_) => "number",
            serde_json::Value::String(_) => "string",
            serde_json::Value::Array(_) => "array",
            serde_json::Value::Object(_) => "object",
        };

        Self::with_values(
            path,
            format!("Expected {}, got {}", expected, actual_type),
            ErrorCode::InvalidType,
            serde_json::Value::String(expected.to_string()),
            serde_json::Value::String(actual_type.to_string()),
        )
    }

    /// Create a missing property error
    pub fn missing_property(path: String, property: &str) -> Self {
        Self::new(
            format!("{}.{}", path, property),
            format!("Required property '{}' is missing", property),
            ErrorCode::ObjectMissingProperty,
        )
    }

    /// Create a string length error
    pub fn string_length(path: String, actual_length: usize, min: Option<usize>, max: Option<usize>) -> Self {
        let message = match (min, max) {
            (Some(min_len), Some(max_len)) => {
                format!("String length {} is not between {} and {}", actual_length, min_len, max_len)
            }
            (Some(min_len), None) => {
                format!("String length {} is less than minimum {}", actual_length, min_len)
            }
            (None, Some(max_len)) => {
                format!("String length {} is greater than maximum {}", actual_length, max_len)
            }
            (None, None) => "String length validation failed".to_string(),
        };

        let code = if let Some(min_len) = min {
            if actual_length < min_len {
                ErrorCode::StringTooShort
            } else {
                ErrorCode::StringTooLong
            }
        } else {
            ErrorCode::StringTooLong
        };

        Self::with_values(
            path,
            message,
            code,
            serde_json::json!({ "min": min, "max": max }),
            serde_json::json!(actual_length),
        )
    }

    /// Create a number range error
    pub fn number_range(path: String, actual: f64, min: Option<f64>, max: Option<f64>) -> Self {
        let message = match (min, max) {
            (Some(min_val), Some(max_val)) => {
                format!("Number {} is not between {} and {}", actual, min_val, max_val)
            }
            (Some(min_val), None) => {
                format!("Number {} is less than minimum {}", actual, min_val)
            }
            (None, Some(max_val)) => {
                format!("Number {} is greater than maximum {}", actual, max_val)
            }
            (None, None) => "Number range validation failed".to_string(),
        };

        let code = if let Some(min_val) = min {
            if actual < min_val {
                ErrorCode::NumberTooSmall
            } else {
                ErrorCode::NumberTooLarge
            }
        } else {
            ErrorCode::NumberTooLarge
        };

        Self::with_values(
            path,
            message,
            code,
            serde_json::json!({ "min": min, "max": max }),
            serde_json::json!(actual),
        )
    }
}

impl fmt::Display for ValidationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.path, self.message)
    }
}

impl ErrorCode {
    /// Get a human-readable description of the error code
    pub fn description(&self) -> &'static str {
        match self {
            ErrorCode::InvalidType => "Value type does not match schema",
            ErrorCode::StringTooShort => "String is shorter than minimum length",
            ErrorCode::StringTooLong => "String is longer than maximum length",
            ErrorCode::StringPatternMismatch => "String does not match required pattern",
            ErrorCode::StringFormatInvalid => "String format is invalid",
            ErrorCode::NumberTooSmall => "Number is smaller than minimum value",
            ErrorCode::NumberTooLarge => "Number is larger than maximum value",
            ErrorCode::NumberNotInteger => "Number is not an integer",
            ErrorCode::NumberNotMultipleOf => "Number is not a multiple of required value",
            ErrorCode::ArrayTooShort => "Array has fewer items than minimum",
            ErrorCode::ArrayTooLong => "Array has more items than maximum",
            ErrorCode::ArrayNotUnique => "Array contains duplicate items",
            ErrorCode::ArrayItemInvalid => "Array item does not match schema",
            ErrorCode::ObjectMissingProperty => "Required object property is missing",
            ErrorCode::ObjectAdditionalProperty => "Object contains additional properties",
            ErrorCode::ObjectPropertyInvalid => "Object property does not match schema",
            ErrorCode::OneOfNoMatch => "Value does not match any oneOf schemas",
            ErrorCode::OneOfMultipleMatches => "Value matches multiple oneOf schemas",
            ErrorCode::AllOfFailure => "Value does not match all allOf schemas",
            ErrorCode::AnyOfNoMatch => "Value does not match any anyOf schemas",
            ErrorCode::SchemaInvalid => "Schema definition is invalid",
            ErrorCode::SchemaCompilationFailed => "Schema compilation failed",
            ErrorCode::ValidationFailed => "Validation failed",
            ErrorCode::InternalError => "Internal validation error",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validation_result_creation() {
        let success = ValidationResult::success(serde_json::json!({"name": "test"}));
        assert!(success.success);
        assert!(success.errors.is_empty());

        let errors = vec![ValidationError::new(
            "name".to_string(),
            "Required".to_string(),
            ErrorCode::ObjectMissingProperty,
        )];
        let failure = ValidationResult::failure(errors.clone());
        assert!(!failure.success);
        assert_eq!(failure.errors.len(), 1);
    }

    #[test]
    fn test_error_creation() {
        let error = ValidationError::type_mismatch(
            "age".to_string(),
            "number",
            &serde_json::Value::String("not a number".to_string()),
        );

        assert_eq!(error.path, "age");
        assert_eq!(error.code, ErrorCode::InvalidType);
        assert!(error.message.contains("Expected number"));
    }

    #[test]
    fn test_result_merging() {
        let result1 = ValidationResult::success(serde_json::json!(1));
        let result2 = ValidationResult::failure(vec![
            ValidationError::new("test".to_string(), "error".to_string(), ErrorCode::ValidationFailed)
        ]);

        let merged = ValidationResult::merge(vec![result1, result2]);
        assert!(!merged.success);
        assert_eq!(merged.errors.len(), 1);
    }
}