
use crate::schema::{StringFormat, SchemaType};
use once_cell::sync::Lazy;
use regex::Regex;
use std::collections::{HashMap, HashSet};

/// Compiled regex patterns for string format validation
pub struct FormatValidators {
    email: Regex,
    uri: Regex,
    url: Regex,
    uuid: Regex,
    date_time: Regex,
    date: Regex,
    time: Regex,
    ipv4: Regex,
    ipv6: Regex,
    hostname: Regex,
}

/// Global instance of format validators (compiled once)
static FORMAT_VALIDATORS: Lazy<FormatValidators> = Lazy::new(|| {
    FormatValidators {
        // Email regex (simplified but fast)
        email: Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap(),

        // URI regex
        uri: Regex::new(r"^[a-zA-Z][a-zA-Z0-9+.-]*:").unwrap(),

        // URL regex
        url: Regex::new(r"^https?://[^\s/$.?#].[^\s]*$").unwrap(),

        // UUID regex
        uuid: Regex::new(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$").unwrap(),

        // DateTime regex (ISO 8601)
        date_time: Regex::new(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$").unwrap(),

        // Date regex (ISO 8601)
        date: Regex::new(r"^\d{4}-\d{2}-\d{2}$").unwrap(),

        // Time regex (ISO 8601)
        time: Regex::new(r"^\d{2}:\d{2}:\d{2}(\.\d{3})?$").unwrap(),

        // IPv4 regex
        ipv4: Regex::new(r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$").unwrap(),

        // IPv6 regex (simplified)
        ipv6: Regex::new(r"^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$").unwrap(),

        // Hostname regex
        hostname: Regex::new(r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$").unwrap(),
    }
});

/// Validate string format efficiently
pub fn validate_string_format(value: &str, format: &StringFormat) -> bool {
    match format {
        StringFormat::Email => FORMAT_VALIDATORS.email.is_match(value),
        StringFormat::Uri => FORMAT_VALIDATORS.uri.is_match(value),
        StringFormat::Url => FORMAT_VALIDATORS.url.is_match(value),
        StringFormat::Uuid => {
            // Case-insensitive UUID validation
            let lower_value = value.to_lowercase();
            FORMAT_VALIDATORS.uuid.is_match(&lower_value)
        }
        StringFormat::DateTime => FORMAT_VALIDATORS.date_time.is_match(value),
        StringFormat::Date => FORMAT_VALIDATORS.date.is_match(value),
        StringFormat::Time => FORMAT_VALIDATORS.time.is_match(value),
        StringFormat::Ipv4 => FORMAT_VALIDATORS.ipv4.is_match(value),
        StringFormat::Ipv6 => {
            // Also try full IPv6 validation
            FORMAT_VALIDATORS.ipv6.is_match(value) || is_valid_ipv6_extended(value)
        }
        StringFormat::Hostname => FORMAT_VALIDATORS.hostname.is_match(value),
        StringFormat::JsonPointer => is_valid_json_pointer(value),
        StringFormat::RelativeJsonPointer => is_valid_relative_json_pointer(value),
        StringFormat::Regex => is_valid_regex(value),
    }
}

/// Extended IPv6 validation for compressed notation
fn is_valid_ipv6_extended(value: &str) -> bool {
    // Handle IPv6 compressed notation (::)
    if value.contains("::") {
        let parts: Vec<&str> = value.split("::").collect();
        if parts.len() != 2 {
            return false;
        }

        let left_groups = if parts[0].is_empty() { 0 } else { parts[0].split(':').count() };
        let right_groups = if parts[1].is_empty() { 0 } else { parts[1].split(':').count() };

        // Total groups should not exceed 8
        left_groups + right_groups <= 8
    } else {
        false
    }
}

/// Validate JSON Pointer format (RFC 6901)
fn is_valid_json_pointer(value: &str) -> bool {
    if value.is_empty() || value == "/" {
        return true;
    }

    if !value.starts_with('/') {
        return false;
    }

    // Check for valid escape sequences
    let mut chars = value.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch == '~' {
            match chars.peek() {
                Some('0') | Some('1') => { chars.next(); }
                _ => return false,
            }
        }
    }

    true
}

/// Validate Relative JSON Pointer format
fn is_valid_relative_json_pointer(value: &str) -> bool {
    if value.is_empty() {
        return false;
    }

    // Must start with a number
    let mut chars = value.chars();
    let first_char = chars.next().unwrap();

    if !first_char.is_ascii_digit() {
        return false;
    }

    // Parse the numeric prefix
    let mut num_end = 1;
    for ch in chars {
        if ch.is_ascii_digit() {
            num_end += 1;
        } else {
            break;
        }
    }

    // Rest should be either empty or a valid JSON pointer
    let remainder = &value[num_end..];
    remainder.is_empty() || is_valid_json_pointer(remainder)
}

/// Validate if string is a valid regex pattern
fn is_valid_regex(value: &str) -> bool {
    Regex::new(value).is_ok()
}

/// Path utilities for building validation paths
pub struct PathBuilder {
    segments: Vec<String>,
}

impl PathBuilder {
    pub fn new() -> Self {
        Self { segments: Vec::new() }
    }

    pub fn push(&mut self, segment: &str) {
        self.segments.push(segment.to_string());
    }

    pub fn push_index(&mut self, index: usize) {
        self.segments.push(format!("[{}]", index));
    }

    pub fn pop(&mut self) {
        self.segments.pop();
    }

    pub fn build(&self) -> String {
        if self.segments.is_empty() {
            "".to_string()
        } else {
            self.segments.join(".")
        }
    }

    pub fn with_segment<T>(&mut self, segment: &str, f: impl FnOnce(&mut Self) -> T) -> T {
        self.push(segment);
        let result = f(self);
        self.pop();
        result
    }

    pub fn with_index<T>(&mut self, index: usize, f: impl FnOnce(&mut Self) -> T) -> T {
        self.push_index(index);
        let result = f(self);
        self.pop();
        result
    }
}

/// Array uniqueness checker with optimization for different types
pub struct UniqueChecker {
    strings: HashSet<String>,
    numbers: HashSet<i64>,
    floats: HashSet<u64>, // Use bits representation for floats
    bools: HashSet<bool>,
    others: HashSet<String>, // JSON serialized for complex types
}

impl UniqueChecker {
    pub fn new() -> Self {
        Self {
            strings: HashSet::new(),
            numbers: HashSet::new(),
            floats: HashSet::new(),
            bools: HashSet::new(),
            others: HashSet::new(),
        }
    }

    pub fn insert(&mut self, value: &serde_json::Value) -> bool {
        match value {
            serde_json::Value::String(s) => self.strings.insert(s.clone()),
            serde_json::Value::Number(n) => {
                if let Some(i) = n.as_i64() {
                    self.numbers.insert(i)
                } else if let Some(f) = n.as_f64() {
                    self.floats.insert(f.to_bits())
                } else {
                    false
                }
            }
            serde_json::Value::Bool(b) => self.bools.insert(*b),
            _ => {
                let serialized = serde_json::to_string(value).unwrap_or_default();
                self.others.insert(serialized)
            }
        }
    }

    pub fn len(&self) -> usize {
        self.strings.len() + self.numbers.len() + self.floats.len() + self.bools.len() + self.others.len()
    }
}

/// Performance tracking utilities
#[derive(Debug, Clone)]
pub struct PerformanceTracker {
    start_time: std::time::Instant,
    items_validated: usize,
    memory_start: Option<usize>,
}

impl PerformanceTracker {
    pub fn new() -> Self {
        Self {
            start_time: std::time::Instant::now(),
            items_validated: 0,
            memory_start: None,
        }
    }

    pub fn increment_items(&mut self, count: usize) {
        self.items_validated += count;
    }

    pub fn elapsed_ms(&self) -> f64 {
        self.start_time.elapsed().as_millis() as f64
    }

    pub fn throughput(&self) -> f64 {
        if self.items_validated == 0 {
            0.0
        } else {
            self.items_validated as f64 / (self.elapsed_ms() / 1000.0)
        }
    }

    pub fn finish(&self) -> crate::error::PerformanceStats {
        crate::error::PerformanceStats {
            validation_time_ms: self.elapsed_ms(),
            items_validated: self.items_validated,
            throughput: self.throughput(),
            memory_used_bytes: self.memory_start,
        }
    }
}

/// Schema optimization utilities
pub struct SchemaOptimizer;

impl SchemaOptimizer {
    /// Optimize schema for batch validation
    pub fn optimize_for_batch(schema: &SchemaType, batch_size: usize) -> SchemaType {
        // For large batches, prioritize simple validations first
        if batch_size > 1000 {
            Self::reorder_object_properties(schema)
        } else {
            schema.clone()
        }
    }

    /// Reorder object properties to validate simple types first
    fn reorder_object_properties(schema: &SchemaType) -> SchemaType {
        match schema {
            SchemaType::Object { properties, required, additional_properties } => {
                let mut simple_props = HashMap::new();
                let mut complex_props = HashMap::new();

                for (key, prop_schema) in properties {
                    if prop_schema.is_simple() {
                        simple_props.insert(key.clone(), prop_schema.clone());
                    } else {
                        complex_props.insert(key.clone(), Self::reorder_object_properties(prop_schema));
                    }
                }

                // Merge simple props first, then complex
                let mut optimized_props = simple_props;
                optimized_props.extend(complex_props);

                SchemaType::Object {
                    properties: optimized_props,
                    required: required.clone(),
                    additional_properties: *additional_properties,
                }
            }
            SchemaType::Array { items, min_items, max_items, unique_items } => {
                SchemaType::Array {
                    items: Box::new(Self::reorder_object_properties(items)),
                    min_items: *min_items,
                    max_items: *max_items,
                    unique_items: *unique_items,
                }
            }
            _ => schema.clone(),
        }
    }

    /// Check if validation can be parallelized
    pub fn can_parallelize(schema: &SchemaType, data_size: usize) -> bool {
        // Parallelize for large arrays of simple objects
        data_size > 100 && Self::is_parallelizable_schema(schema)
    }

    fn is_parallelizable_schema(schema: &SchemaType) -> bool {
        match schema {
            SchemaType::Object { properties, .. } => {
                // Objects with mostly simple properties can be parallelized
                let simple_count = properties.values().filter(|s| s.is_simple()).count();
                let total_count = properties.len();

                total_count > 0 && (simple_count as f64 / total_count as f64) > 0.7
            }
            SchemaType::String { pattern, .. } => pattern.is_none(), // Regex can be expensive
            _ => schema.is_simple(),
        }
    }
}

/// Validation context for passing state between validators
pub struct ValidationContext {
    pub path: PathBuilder,
    pub performance: PerformanceTracker,
    pub options: ValidationOptions,
}

#[derive(Debug, Clone)]
pub struct ValidationOptions {
    pub early_exit: bool,
    pub collect_all_errors: bool,
    pub enable_performance_tracking: bool,
    pub max_errors: Option<usize>,
    pub parallel_threshold: usize,
}

impl Default for ValidationOptions {
    fn default() -> Self {
        Self {
            early_exit: false,
            collect_all_errors: true,
            enable_performance_tracking: false,
            max_errors: None,
            parallel_threshold: 1000,
        }
    }
}

impl ValidationContext {
    pub fn new(options: ValidationOptions) -> Self {
        Self {
            path: PathBuilder::new(),
            performance: PerformanceTracker::new(),
            options,
        }
    }

    pub fn should_continue(&self, error_count: usize) -> bool {
        if let Some(max_errors) = self.options.max_errors {
            error_count < max_errors
        } else {
            !self.options.early_exit || error_count == 0
        }
    }
}

/// Utility functions for common operations
pub fn json_type_name(value: &serde_json::Value) -> &'static str {
    match value {
        serde_json::Value::Null => "null",
        serde_json::Value::Bool(_) => "boolean",
        serde_json::Value::Number(_) => "number",
        serde_json::Value::String(_) => "string",
        serde_json::Value::Array(_) => "array",
        serde_json::Value::Object(_) => "object",
    }
}

pub fn is_integer(value: f64) -> bool {
    value.fract() == 0.0 && value.is_finite()
}

pub fn arrays_equal(a: &[serde_json::Value], b: &[serde_json::Value]) -> bool {
    a.len() == b.len() && a.iter().zip(b.iter()).all(|(x, y)| x == y)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_email_validation() {
        assert!(validate_string_format("test@example.com", &StringFormat::Email));
        assert!(!validate_string_format("invalid-email", &StringFormat::Email));
        assert!(!validate_string_format("@example.com", &StringFormat::Email));
        assert!(!validate_string_format("test@", &StringFormat::Email));
    }

    #[test]
    fn test_uuid_validation() {
        assert!(validate_string_format("550e8400-e29b-41d4-a716-446655440000", &StringFormat::Uuid));
        assert!(validate_string_format("550E8400-E29B-41D4-A716-446655440000", &StringFormat::Uuid)); // Case insensitive
        assert!(!validate_string_format("550e8400-e29b-41d4-a716", &StringFormat::Uuid)); // Too short
        assert!(!validate_string_format("not-a-uuid", &StringFormat::Uuid));
    }

    #[test]
    fn test_path_builder() {
        let mut path = PathBuilder::new();
        path.push("user");
        path.push_index(0);
        path.push("name");

        assert_eq!(path.build(), "user.[0].name");

        path.pop();
        assert_eq!(path.build(), "user.[0]");
    }

    #[test]
    fn test_unique_checker() {
        let mut checker = UniqueChecker::new();

        assert!(checker.insert(&serde_json::json!("test")));
        assert!(!checker.insert(&serde_json::json!("test"))); // Duplicate
        assert!(checker.insert(&serde_json::json!(42)));
        assert!(checker.insert(&serde_json::json!(true)));

        assert_eq!(checker.len(), 3);
    }

    #[test]
    fn test_json_pointer_validation() {
        assert!(is_valid_json_pointer(""));
        assert!(is_valid_json_pointer("/"));
        assert!(is_valid_json_pointer("/foo"));
        assert!(is_valid_json_pointer("/foo/bar"));
        assert!(is_valid_json_pointer("/foo/~0bar")); // ~0 = ~
        assert!(is_valid_json_pointer("/foo/~1bar")); // ~1 = /

        assert!(!is_valid_json_pointer("foo")); // Must start with /
        assert!(!is_valid_json_pointer("/foo/~2bar")); // Invalid escape
    }

    #[test]
    fn test_performance_tracker() {
        let mut tracker = PerformanceTracker::new();
        tracker.increment_items(100);

        // Small delay to test timing
        std::thread::sleep(std::time::Duration::from_millis(1));

        let stats = tracker.finish();
        assert_eq!(stats.items_validated, 100);
        assert!(stats.validation_time_ms > 0.0);
        assert!(stats.throughput > 0.0);
    }

    #[test]
    fn test_schema_optimization() {
        let complex_schema = SchemaType::Object {
            properties: {
                let mut props = HashMap::new();
                props.insert("simple_string".to_string(), SchemaType::String {
                    min_length: None,
                    max_length: None,
                    pattern: None,
                    format: None,
                });
                props.insert("complex_array".to_string(), SchemaType::Array {
                    items: Box::new(SchemaType::Object {
                        properties: HashMap::new(),
                        required: None,
                        additional_properties: true,
                    }),
                    min_items: None,
                    max_items: None,
                    unique_items: false,
                });
                props
            },
            required: None,
            additional_properties: true,
        };

        let optimized = SchemaOptimizer::optimize_for_batch(&complex_schema, 2000);

        // Should maintain the same structure but potentially reorder properties
        match optimized {
            SchemaType::Object { properties, .. } => {
                assert!(properties.contains_key("simple_string"));
                assert!(properties.contains_key("complex_array"));
            }
            _ => panic!("Expected object schema"),
        }
    }
}