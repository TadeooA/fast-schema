
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::html::{HtmlElementType, HtmlProps, ReactComponent};

/// Core schema types supported by FastSchema
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum SchemaType {
    String {
        #[serde(rename = "minLength")]
        min_length: Option<usize>,
        #[serde(rename = "maxLength")]
        max_length: Option<usize>,
        pattern: Option<String>,
        format: Option<StringFormat>,
    },
    Number {
        min: Option<f64>,
        max: Option<f64>,
        #[serde(default)]
        integer: bool,
        multiple_of: Option<f64>,
    },
    Boolean,
    Array {
        items: Box<SchemaType>,
        #[serde(rename = "minItems")]
        min_items: Option<usize>,
        #[serde(rename = "maxItems")]
        max_items: Option<usize>,
        #[serde(rename = "uniqueItems", default)]
        unique_items: bool,
    },
    Object {
        properties: HashMap<String, SchemaType>,
        required: Option<Vec<String>>,
        #[serde(rename = "additionalProperties", default = "default_additional_properties")]
        additional_properties: bool,
    },
    Null,
    Any,
    OneOf {
        #[serde(rename = "oneOf")]
        schemas: Vec<SchemaType>,
    },
    AllOf {
        #[serde(rename = "allOf")]
        schemas: Vec<SchemaType>,
    },
    AnyOf {
        #[serde(rename = "anyOf")]
        schemas: Vec<SchemaType>,
    },

    // Union and intersection types
    Union {
        options: Vec<SchemaType>,
        discriminator: Option<String>,
    },
    Intersection {
        schemas: Vec<SchemaType>,
    },

    // Refinements and transformations
    Refinement {
        base: Box<SchemaType>,
        predicate: RefinementFunction,
        message: Option<String>,
    },
    Transform {
        input: Box<SchemaType>,
        output: Box<SchemaType>,
        transformer: TransformFunction,
    },

    // Conditional and dependent schemas
    Conditional {
        condition: Box<SchemaType>,
        then_schema: Box<SchemaType>,
        else_schema: Option<Box<SchemaType>>,
    },

    // HTML/React validation types
    HtmlElement {
        element_type: HtmlElementType,
        props: HtmlProps,
        children: Option<Box<SchemaType>>,
        validate_dom: bool,
    },
    ReactComponent {
        component: ReactComponent,
    },

    // CSS validation
    CssValue {
        property: String,
        value_type: CssValueType,
        vendor_prefixes: bool,
    },
    CssSelector {
        selector_type: CssSelectorType,
        specificity_limit: Option<u32>,
    },

    // GraphQL types
    GraphQLSchema {
        schema_definition: GraphQLSchemaDefinition,
    },
    GraphQLType {
        type_definition: GraphQLTypeDefinition,
    },
}

fn default_additional_properties() -> bool {
    true
}

/// String format validators
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum StringFormat {
    // Basic formats
    Email,
    Uri,
    Url,
    Uuid,

    // Date/time formats
    DateTime,
    Date,
    Time,
    #[serde(rename = "date-time")]
    DateTimeIso,
    Duration,

    // Network formats
    Ipv4,
    Ipv6,
    Hostname,
    #[serde(rename = "ipv4-cidr")]
    Ipv4Cidr,
    #[serde(rename = "ipv6-cidr")]
    Ipv6Cidr,
    MacAddress,
    Port,

    // Web formats
    #[serde(rename = "css-color")]
    CssColor,
    #[serde(rename = "css-length")]
    CssLength,
    #[serde(rename = "css-selector")]
    CssSelector,
    #[serde(rename = "html-id")]
    HtmlId,
    ClassName,

    // Identifiers
    #[serde(rename = "base64")]
    Base64,
    #[serde(rename = "base64url")]
    Base64Url,
    Jwt,
    Nanoid,
    Cuid,
    #[serde(rename = "object-id")]
    ObjectId,

    // File/Media formats
    #[serde(rename = "mime-type")]
    MimeType,
    #[serde(rename = "file-extension")]
    FileExtension,

    // Geographic formats
    Latitude,
    Longitude,
    Country,
    Language,
    Timezone,

    // Phone/Communication
    #[serde(rename = "phone-number")]
    PhoneNumber,
    #[serde(rename = "postal-code")]
    PostalCode,

    // Crypto/Security
    #[serde(rename = "sha256")]
    Sha256,
    #[serde(rename = "md5")]
    Md5,

    // JSON formats
    JsonPointer,
    RelativeJsonPointer,

    // Custom regex
    Regex,
}

/// Refinement function for custom validation
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum RefinementFunction {
    CustomJs(String), // JavaScript function as string
    Builtin(String),  // Built-in refinement name
}

/// Transform function for data transformation
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum TransformFunction {
    CustomJs(String),    // JavaScript function as string
    Builtin(String),     // Built-in transform name
    Pipeline(Vec<TransformFunction>), // Chain of transforms
}

/// CSS value types for validation
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CssValueType {
    Color,
    Length,
    Percentage,
    Number,
    Integer,
    Angle,
    Time,
    Frequency,
    Resolution,
    String,
    Url,
    Identifier,
    Function,
    Keyword,
    Position,
    Flex,
    Grid,
}

/// CSS selector types
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CssSelectorType {
    Element,
    Class,
    Id,
    Attribute,
    PseudoClass,
    PseudoElement,
    Universal,
    Combinator,
    Complex,
}

/// GraphQL schema definition
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GraphQLSchemaDefinition {
    pub query: Option<String>,
    pub mutation: Option<String>,
    pub subscription: Option<String>,
    pub types: HashMap<String, GraphQLTypeDefinition>,
    pub directives: Vec<GraphQLDirective>,
}

/// GraphQL type definition
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum GraphQLTypeDefinition {
    Object {
        name: String,
        fields: HashMap<String, GraphQLField>,
        interfaces: Vec<String>,
        description: Option<String>,
    },
    Interface {
        name: String,
        fields: HashMap<String, GraphQLField>,
        description: Option<String>,
    },
    Union {
        name: String,
        types: Vec<String>,
        description: Option<String>,
    },
    Enum {
        name: String,
        values: Vec<GraphQLEnumValue>,
        description: Option<String>,
    },
    InputObject {
        name: String,
        fields: HashMap<String, GraphQLInputField>,
        description: Option<String>,
    },
    Scalar {
        name: String,
        description: Option<String>,
        serialize: Option<String>,
        parse_value: Option<String>,
        parse_literal: Option<String>,
    },
}

/// GraphQL field definition
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GraphQLField {
    pub name: String,
    pub type_name: String,
    pub args: HashMap<String, GraphQLArgument>,
    pub description: Option<String>,
    pub deprecation_reason: Option<String>,
}

/// GraphQL input field definition
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GraphQLInputField {
    pub name: String,
    pub type_name: String,
    pub default_value: Option<serde_json::Value>,
    pub description: Option<String>,
}

/// GraphQL argument definition
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GraphQLArgument {
    pub name: String,
    pub type_name: String,
    pub default_value: Option<serde_json::Value>,
    pub description: Option<String>,
}

/// GraphQL enum value definition
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GraphQLEnumValue {
    pub name: String,
    pub value: Option<serde_json::Value>,
    pub description: Option<String>,
    pub deprecation_reason: Option<String>,
}

/// GraphQL directive definition
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GraphQLDirective {
    pub name: String,
    pub description: Option<String>,
    pub locations: Vec<String>,
    pub args: HashMap<String, GraphQLArgument>,
    pub is_repeatable: bool,
}

/// Schema compilation result for optimization
#[derive(Debug, Clone)]
pub struct CompiledSchema {
    pub schema: SchemaType,
    pub required_fields: Vec<String>,
    pub has_patterns: bool,
    pub max_depth: usize,
    pub estimated_complexity: usize,
}

impl SchemaType {
    /// Compile schema for optimized validation
    pub fn compile(&self) -> CompiledSchema {
        let mut required_fields = Vec::new();
        let mut has_patterns = false;
        let max_depth = self.calculate_depth();
        let estimated_complexity = self.estimate_complexity();

        // Extract required fields for quick access
        if let SchemaType::Object { required, properties, .. } = self {
            if let Some(req) = required {
                required_fields = req.clone();
            }

            // Check for patterns in nested schemas
            for (_, prop_schema) in properties {
                if prop_schema.has_patterns() {
                    has_patterns = true;
                    break;
                }
            }
        }

        CompiledSchema {
            schema: self.clone(),
            required_fields,
            has_patterns,
            max_depth,
            estimated_complexity,
        }
    }

    /// Calculate maximum nesting depth
    fn calculate_depth(&self) -> usize {
        match self {
            SchemaType::Array { items, .. } => 1 + items.calculate_depth(),
            SchemaType::Object { properties, .. } => {
                1 + properties
                    .values()
                    .map(|s| s.calculate_depth())
                    .max()
                    .unwrap_or(0)
            }
            SchemaType::OneOf { schemas } |
            SchemaType::AllOf { schemas } |
            SchemaType::AnyOf { schemas } => {
                1 + schemas
                    .iter()
                    .map(|s| s.calculate_depth())
                    .max()
                    .unwrap_or(0)
            }
            _ => 0,
        }
    }

    /// Estimate validation complexity for optimization decisions
    fn estimate_complexity(&self) -> usize {
        match self {
            SchemaType::String { pattern, format, .. } => {
                let mut complexity = 1;
                if pattern.is_some() { complexity += 10; }
                if format.is_some() { complexity += 5; }
                complexity
            }
            SchemaType::Number { .. } => 2,
            SchemaType::Boolean | SchemaType::Null => 1,
            SchemaType::Array { items, .. } => 5 + items.estimate_complexity(),
            SchemaType::Object { properties, .. } => {
                10 + properties.values().map(|s| s.estimate_complexity()).sum::<usize>()
            }
            SchemaType::OneOf { schemas } => {
                20 + schemas.iter().map(|s| s.estimate_complexity()).sum::<usize>()
            }
            SchemaType::AllOf { schemas } => {
                15 + schemas.iter().map(|s| s.estimate_complexity()).sum::<usize>()
            }
            SchemaType::AnyOf { schemas } => {
                10 + schemas.iter().map(|s| s.estimate_complexity()).sum::<usize>()
            }
            SchemaType::Any => 1,
            // TODO: Implement complexity estimation for additional schema types
            _ => 5, // Default complexity for unimplemented types
        }
    }

    /// Check if schema contains regex patterns
    fn has_patterns(&self) -> bool {
        match self {
            SchemaType::String { pattern, .. } => pattern.is_some(),
            SchemaType::Array { items, .. } => items.has_patterns(),
            SchemaType::Object { properties, .. } => {
                properties.values().any(|s| s.has_patterns())
            }
            SchemaType::OneOf { schemas } |
            SchemaType::AllOf { schemas } |
            SchemaType::AnyOf { schemas } => {
                schemas.iter().any(|s| s.has_patterns())
            }
            _ => false,
        }
    }

    /// Get all property names for object schemas (used for optimization)
    pub fn get_property_names(&self) -> Vec<String> {
        match self {
            SchemaType::Object { properties, .. } => {
                properties.keys().cloned().collect()
            }
            _ => Vec::new(),
        }
    }

    /// Check if schema is simple (no nested objects/arrays)
    pub fn is_simple(&self) -> bool {
        match self {
            SchemaType::String { .. } |
            SchemaType::Number { .. } |
            SchemaType::Boolean |
            SchemaType::Null |
            SchemaType::Any => true,
            _ => false,
        }
    }

    /// Get estimated validation time in microseconds (for batch optimization)
    pub fn estimated_validation_time(&self) -> u64 {
        match self {
            SchemaType::String { pattern, format, .. } => {
                let mut time = 1;
                if pattern.is_some() { time += 50; }
                if format.is_some() { time += 10; }
                time
            }
            SchemaType::Number { .. } => 2,
            SchemaType::Boolean | SchemaType::Null | SchemaType::Any => 1,
            SchemaType::Array { items, .. } => 10 + items.estimated_validation_time(),
            SchemaType::Object { properties, .. } => {
                20 + properties.values()
                    .map(|s| s.estimated_validation_time())
                    .sum::<u64>()
            }
            SchemaType::OneOf { schemas } => {
                100 + schemas.iter()
                    .map(|s| s.estimated_validation_time())
                    .sum::<u64>()
            }
            SchemaType::AllOf { schemas } => {
                schemas.iter()
                    .map(|s| s.estimated_validation_time())
                    .sum::<u64>()
            }
            SchemaType::AnyOf { schemas } => {
                // Best case: first schema matches
                schemas.first()
                    .map(|s| s.estimated_validation_time())
                    .unwrap_or(1)
            }
            // TODO: Add timing estimates for additional schema types
            _ => 10, // Default timing for unimplemented types
        }
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_schema_compilation() {
        let schema = SchemaType::Object {
            properties: {
                let mut props = HashMap::new();
                props.insert("name".to_string(), SchemaType::String {
                    min_length: Some(2),
                    max_length: Some(50),
                    pattern: None,
                    format: None,
                });
                props.insert("age".to_string(), SchemaType::Number {
                    min: Some(0.0),
                    max: Some(120.0),
                    integer: true,
                    multiple_of: None,
                });
                props
            },
            required: Some(vec!["name".to_string(), "age".to_string()]),
            additional_properties: true,
        };

        let compiled = schema.compile();
        assert_eq!(compiled.required_fields.len(), 2);
        assert!(compiled.required_fields.contains(&"name".to_string()));
        assert!(compiled.required_fields.contains(&"age".to_string()));
        assert_eq!(compiled.max_depth, 1);
    }

    #[test]
    fn test_complexity_estimation() {
        let simple_schema = SchemaType::String {
            min_length: None,
            max_length: None,
            pattern: None,
            format: None,
        };

        let complex_schema = SchemaType::String {
            min_length: Some(2),
            max_length: Some(50),
            pattern: Some(r"^\w+$".to_string()),
            format: Some(StringFormat::Email),
        };

        assert!(complex_schema.estimate_complexity() > simple_schema.estimate_complexity());
    }
}