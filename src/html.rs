// HTML/React validation module
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::error::{ValidationError, ErrorCode};

/// HTML element types supported for validation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum HtmlElementType {
    // Text input types
    Input,
    Textarea,
    Select,
    Option,

    // Interactive elements
    Button,
    Checkbox,
    Radio,
    Range,

    // Content elements
    Div,
    Span,
    Paragraph,
    Heading(u8), // h1-h6

    // List elements
    Ul,
    Ol,
    Li,

    // Table elements
    Table,
    Thead,
    Tbody,
    Tr,
    Td,
    Th,

    // Form elements
    Form,
    Label,
    Fieldset,
    Legend,

    // Media elements
    Image,
    Video,
    Audio,
    Canvas,
    Svg,

    // Semantic elements
    Header,
    Footer,
    Nav,
    Main,
    Article,
    Section,
    Aside,

    // Text formatting
    Strong,
    Em,
    Mark,
    Small,
    Del,
    Ins,
    Sub,
    Sup,

    // Links and references
    A,
    Link,

    // Custom React components
    Custom(String),
}

/// HTML props validation schema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HtmlProps {
    pub id: Option<String>,
    pub class_name: Option<String>,
    pub style: Option<HashMap<String, String>>,
    pub data_attributes: Option<HashMap<String, String>>,
    pub aria_attributes: Option<HashMap<String, String>>,
    pub required_props: Vec<String>,
    pub optional_props: Vec<String>,
    pub validate_accessibility: bool,
    pub validate_semantic: bool,
    pub accessibility_level: AccessibilityLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AccessibilityLevel {
    Basic,     // Basic ARIA attributes
    Enhanced,  // WCAG AA compliance
    Strict,    // WCAG AAA compliance
}

/// React component validation schema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReactComponent {
    pub component_name: String,
    pub props_schema: HashMap<String, crate::schema::SchemaType>,
    pub required_props: Vec<String>,
    pub children_allowed: bool,
    pub children_schema: Option<Box<crate::schema::SchemaType>>,
    pub validate_lifecycle: bool,
    pub validate_hooks: bool,
}

/// HTML attribute validation rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HtmlAttributeRules {
    pub allowed_attributes: Vec<String>,
    pub required_attributes: Vec<String>,
    pub deprecated_attributes: Vec<String>,
    pub boolean_attributes: Vec<String>,
    pub url_attributes: Vec<String>,
    pub enum_attributes: HashMap<String, Vec<String>>,
}

impl HtmlElementType {
    /// Get the HTML tag name for this element type
    pub fn tag_name(&self) -> String {
        match self {
            HtmlElementType::Input => "input".to_string(),
            HtmlElementType::Textarea => "textarea".to_string(),
            HtmlElementType::Select => "select".to_string(),
            HtmlElementType::Option => "option".to_string(),
            HtmlElementType::Button => "button".to_string(),
            HtmlElementType::Checkbox => "input".to_string(), // with type="checkbox"
            HtmlElementType::Radio => "input".to_string(),    // with type="radio"
            HtmlElementType::Range => "input".to_string(),    // with type="range"
            HtmlElementType::Div => "div".to_string(),
            HtmlElementType::Span => "span".to_string(),
            HtmlElementType::Paragraph => "p".to_string(),
            HtmlElementType::Heading(level) => format!("h{}", level),
            HtmlElementType::Ul => "ul".to_string(),
            HtmlElementType::Ol => "ol".to_string(),
            HtmlElementType::Li => "li".to_string(),
            HtmlElementType::Table => "table".to_string(),
            HtmlElementType::Thead => "thead".to_string(),
            HtmlElementType::Tbody => "tbody".to_string(),
            HtmlElementType::Tr => "tr".to_string(),
            HtmlElementType::Td => "td".to_string(),
            HtmlElementType::Th => "th".to_string(),
            HtmlElementType::Form => "form".to_string(),
            HtmlElementType::Label => "label".to_string(),
            HtmlElementType::Fieldset => "fieldset".to_string(),
            HtmlElementType::Legend => "legend".to_string(),
            HtmlElementType::Image => "img".to_string(),
            HtmlElementType::Video => "video".to_string(),
            HtmlElementType::Audio => "audio".to_string(),
            HtmlElementType::Canvas => "canvas".to_string(),
            HtmlElementType::Svg => "svg".to_string(),
            HtmlElementType::Header => "header".to_string(),
            HtmlElementType::Footer => "footer".to_string(),
            HtmlElementType::Nav => "nav".to_string(),
            HtmlElementType::Main => "main".to_string(),
            HtmlElementType::Article => "article".to_string(),
            HtmlElementType::Section => "section".to_string(),
            HtmlElementType::Aside => "aside".to_string(),
            HtmlElementType::Strong => "strong".to_string(),
            HtmlElementType::Em => "em".to_string(),
            HtmlElementType::Mark => "mark".to_string(),
            HtmlElementType::Small => "small".to_string(),
            HtmlElementType::Del => "del".to_string(),
            HtmlElementType::Ins => "ins".to_string(),
            HtmlElementType::Sub => "sub".to_string(),
            HtmlElementType::Sup => "sup".to_string(),
            HtmlElementType::A => "a".to_string(),
            HtmlElementType::Link => "link".to_string(),
            HtmlElementType::Custom(name) => name.clone(),
        }
    }

    /// Get the allowed attributes for this element type
    pub fn get_attribute_rules(&self) -> HtmlAttributeRules {
        match self {
            HtmlElementType::Input => HtmlAttributeRules {
                allowed_attributes: vec![
                    "type".to_string(), "value".to_string(), "placeholder".to_string(),
                    "disabled".to_string(), "readonly".to_string(), "required".to_string(),
                    "min".to_string(), "max".to_string(), "step".to_string(),
                    "pattern".to_string(), "autocomplete".to_string(),
                ],
                required_attributes: vec![],
                deprecated_attributes: vec![],
                boolean_attributes: vec![
                    "disabled".to_string(), "readonly".to_string(), "required".to_string(),
                    "checked".to_string(), "autofocus".to_string(),
                ],
                url_attributes: vec![],
                enum_attributes: {
                    let mut map = HashMap::new();
                    map.insert("type".to_string(), vec![
                        "text".to_string(), "password".to_string(), "email".to_string(),
                        "number".to_string(), "tel".to_string(), "url".to_string(),
                        "search".to_string(), "checkbox".to_string(), "radio".to_string(),
                        "submit".to_string(), "reset".to_string(), "button".to_string(),
                        "hidden".to_string(), "file".to_string(), "range".to_string(),
                        "color".to_string(), "date".to_string(), "datetime-local".to_string(),
                        "month".to_string(), "week".to_string(), "time".to_string(),
                    ]);
                    map
                },
            },
            HtmlElementType::Image => HtmlAttributeRules {
                allowed_attributes: vec![
                    "src".to_string(), "alt".to_string(), "width".to_string(),
                    "height".to_string(), "loading".to_string(), "decoding".to_string(),
                ],
                required_attributes: vec!["src".to_string(), "alt".to_string()],
                deprecated_attributes: vec!["align".to_string(), "border".to_string()],
                boolean_attributes: vec![],
                url_attributes: vec!["src".to_string()],
                enum_attributes: {
                    let mut map = HashMap::new();
                    map.insert("loading".to_string(), vec![
                        "eager".to_string(), "lazy".to_string()
                    ]);
                    map.insert("decoding".to_string(), vec![
                        "sync".to_string(), "async".to_string(), "auto".to_string()
                    ]);
                    map
                },
            },
            HtmlElementType::A => HtmlAttributeRules {
                allowed_attributes: vec![
                    "href".to_string(), "target".to_string(), "rel".to_string(),
                    "download".to_string(), "hreflang".to_string(), "type".to_string(),
                ],
                required_attributes: vec![],
                deprecated_attributes: vec!["name".to_string()],
                boolean_attributes: vec!["download".to_string()],
                url_attributes: vec!["href".to_string()],
                enum_attributes: {
                    let mut map = HashMap::new();
                    map.insert("target".to_string(), vec![
                        "_blank".to_string(), "_self".to_string(),
                        "_parent".to_string(), "_top".to_string()
                    ]);
                    map
                },
            },
            HtmlElementType::Button => HtmlAttributeRules {
                allowed_attributes: vec![
                    "type".to_string(), "disabled".to_string(), "form".to_string(),
                    "formaction".to_string(), "formmethod".to_string(),
                ],
                required_attributes: vec![],
                deprecated_attributes: vec![],
                boolean_attributes: vec!["disabled".to_string()],
                url_attributes: vec!["formaction".to_string()],
                enum_attributes: {
                    let mut map = HashMap::new();
                    map.insert("type".to_string(), vec![
                        "submit".to_string(), "reset".to_string(), "button".to_string()
                    ]);
                    map.insert("formmethod".to_string(), vec![
                        "get".to_string(), "post".to_string()
                    ]);
                    map
                },
            },
            _ => HtmlAttributeRules {
                allowed_attributes: vec![
                    "id".to_string(), "class".to_string(), "style".to_string(),
                    "title".to_string(), "lang".to_string(), "dir".to_string(),
                ],
                required_attributes: vec![],
                deprecated_attributes: vec![],
                boolean_attributes: vec![],
                url_attributes: vec![],
                enum_attributes: HashMap::new(),
            },
        }
    }

    /// Check if this element can have children
    pub fn allows_children(&self) -> bool {
        match self {
            HtmlElementType::Input | HtmlElementType::Image |
            HtmlElementType::Link => false,
            _ => true,
        }
    }

    /// Get semantic validation rules
    pub fn get_semantic_rules(&self) -> Vec<String> {
        match self {
            HtmlElementType::Header => vec![
                "Should contain site header or section header content".to_string(),
                "Should not be nested inside other header, footer, or address elements".to_string(),
            ],
            HtmlElementType::Footer => vec![
                "Should contain footer information for its section".to_string(),
                "Should not be nested inside other header, footer, or address elements".to_string(),
            ],
            HtmlElementType::Main => vec![
                "There should be only one main element per page".to_string(),
                "Should not be nested inside article, aside, footer, header, or nav elements".to_string(),
            ],
            HtmlElementType::Nav => vec![
                "Should contain navigation links".to_string(),
                "Not all groups of links need to be in nav elements".to_string(),
            ],
            HtmlElementType::Article => vec![
                "Should contain standalone content that makes sense when distributed independently".to_string(),
            ],
            HtmlElementType::Section => vec![
                "Should have a heading unless it's part of an application".to_string(),
                "Don't use section just for styling - use div instead".to_string(),
            ],
            HtmlElementType::Heading(_) => vec![
                "Heading levels should not be skipped".to_string(),
                "There should typically be only one h1 per page".to_string(),
            ],
            _ => vec![],
        }
    }
}

impl Default for HtmlProps {
    fn default() -> Self {
        HtmlProps {
            id: None,
            class_name: None,
            style: None,
            data_attributes: None,
            aria_attributes: None,
            required_props: vec![],
            optional_props: vec![],
            validate_accessibility: true,
            validate_semantic: true,
            accessibility_level: AccessibilityLevel::Basic,
        }
    }
}

impl Default for AccessibilityLevel {
    fn default() -> Self {
        AccessibilityLevel::Basic
    }
}

/// HTML/React element validator
pub struct HtmlValidator;

impl HtmlValidator {
    /// Validate an HTML element structure
    pub fn validate_html_element(
        value: &serde_json::Value,
        element_type: &HtmlElementType,
        props: &HtmlProps,
        path: &str,
    ) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        if let Some(obj) = value.as_object() {
            // Validate element type
            if let Some(type_value) = obj.get("type") {
                if !Self::validate_element_type(type_value, element_type) {
                    errors.push(ValidationError {
                        path: format!("{}.type", path),
                        message: format!("Expected element type '{}', got '{:?}'",
                                       element_type.tag_name(), type_value),
                        code: ErrorCode::InvalidType,
                        received: Some(format!("{:?}", type_value)),
                        expected: Some(element_type.tag_name()),
                    });
                }
            } else {
                errors.push(ValidationError {
                    path: format!("{}.type", path),
                    message: "HTML element must have a 'type' property".to_string(),
                    code: ErrorCode::Required,
                    received: None,
                    expected: Some(element_type.tag_name()),
                });
            }

            // Validate props
            if let Some(props_value) = obj.get("props") {
                let props_errors = Self::validate_html_props(
                    props_value, element_type, props, &format!("{}.props", path)
                );
                errors.extend(props_errors);
            }

            // Validate children
            if let Some(children_value) = obj.get("children") {
                if !element_type.allows_children() {
                    errors.push(ValidationError {
                        path: format!("{}.children", path),
                        message: format!("Element '{}' cannot have children", element_type.tag_name()),
                        code: ErrorCode::InvalidStructure,
                        received: Some("children".to_string()),
                        expected: None,
                    });
                }
            }

            // Semantic validation
            if props.validate_semantic {
                let semantic_errors = Self::validate_semantic_rules(element_type, obj, path);
                errors.extend(semantic_errors);
            }

        } else {
            errors.push(ValidationError {
                path: path.to_string(),
                message: "Expected React element object".to_string(),
                code: ErrorCode::InvalidType,
                received: Some(format!("{:?}", value)),
                expected: Some("React element object".to_string()),
            });
        }

        errors
    }

    /// Validate React component
    pub fn validate_react_component(
        value: &serde_json::Value,
        component: &ReactComponent,
        path: &str,
    ) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        if let Some(obj) = value.as_object() {
            // Validate component type
            if let Some(type_value) = obj.get("type") {
                if let Some(type_str) = type_value.as_str() {
                    if type_str != component.component_name {
                        errors.push(ValidationError {
                            path: format!("{}.type", path),
                            message: format!("Expected component '{}', got '{}'",
                                           component.component_name, type_str),
                            code: ErrorCode::InvalidType,
                            received: Some(type_str.to_string()),
                            expected: Some(component.component_name.clone()),
                        });
                    }
                }
            }

            // Validate props
            if let Some(props_obj) = obj.get("props").and_then(|p| p.as_object()) {
                // Check required props
                for required_prop in &component.required_props {
                    if !props_obj.contains_key(required_prop) {
                        errors.push(ValidationError {
                            path: format!("{}.props.{}", path, required_prop),
                            message: format!("Required prop '{}' is missing", required_prop),
                            code: ErrorCode::Required,
                            received: None,
                            expected: Some(required_prop.clone()),
                        });
                    }
                }

                // Validate each prop according to schema
                for (prop_name, prop_schema) in &component.props_schema {
                    if let Some(prop_value) = props_obj.get(prop_name) {
                        let prop_path = format!("{}.props.{}", path, prop_name);
                        // Note: This would need to call the main validator
                        // let prop_errors = validate_value(prop_value, prop_schema, &prop_path);
                        // errors.extend(prop_errors);
                    }
                }
            }

            // Validate children
            if !component.children_allowed && obj.contains_key("children") {
                errors.push(ValidationError {
                    path: format!("{}.children", path),
                    message: format!("Component '{}' does not accept children",
                                   component.component_name),
                    code: ErrorCode::InvalidStructure,
                    received: Some("children".to_string()),
                    expected: None,
                });
            }
        }

        errors
    }

    fn validate_element_type(type_value: &serde_json::Value, expected_type: &HtmlElementType) -> bool {
        if let Some(type_str) = type_value.as_str() {
            type_str == expected_type.tag_name()
        } else {
            false
        }
    }

    fn validate_html_props(
        props_value: &serde_json::Value,
        element_type: &HtmlElementType,
        props_schema: &HtmlProps,
        path: &str,
    ) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        if let Some(props_obj) = props_value.as_object() {
            let attr_rules = element_type.get_attribute_rules();

            // Validate required attributes
            for required_attr in &attr_rules.required_attributes {
                if !props_obj.contains_key(required_attr) {
                    errors.push(ValidationError {
                        path: format!("{}.{}", path, required_attr),
                        message: format!("Required attribute '{}' is missing", required_attr),
                        code: ErrorCode::Required,
                        received: None,
                        expected: Some(required_attr.clone()),
                    });
                }
            }

            // Validate each attribute
            for (attr_name, attr_value) in props_obj {
                // Check if attribute is allowed
                if !attr_rules.allowed_attributes.contains(attr_name) &&
                   !attr_name.starts_with("data-") &&
                   !attr_name.starts_with("aria-") &&
                   attr_name != "className" && attr_name != "style" {
                    errors.push(ValidationError {
                        path: format!("{}.{}", path, attr_name),
                        message: format!("Attribute '{}' is not allowed on element '{}'",
                                       attr_name, element_type.tag_name()),
                        code: ErrorCode::UnknownKey,
                        received: Some(attr_name.clone()),
                        expected: None,
                    });
                }

                // Check deprecated attributes
                if attr_rules.deprecated_attributes.contains(attr_name) {
                    errors.push(ValidationError {
                        path: format!("{}.{}", path, attr_name),
                        message: format!("Attribute '{}' is deprecated", attr_name),
                        code: ErrorCode::DeprecatedFeature,
                        received: Some(attr_name.clone()),
                        expected: None,
                    });
                }

                // Validate boolean attributes
                if attr_rules.boolean_attributes.contains(attr_name) {
                    if !attr_value.is_boolean() {
                        errors.push(ValidationError {
                            path: format!("{}.{}", path, attr_name),
                            message: format!("Attribute '{}' must be a boolean", attr_name),
                            code: ErrorCode::InvalidType,
                            received: Some(format!("{:?}", attr_value)),
                            expected: Some("boolean".to_string()),
                        });
                    }
                }

                // Validate URL attributes
                if attr_rules.url_attributes.contains(attr_name) {
                    if let Some(url_str) = attr_value.as_str() {
                        if !Self::is_valid_url(url_str) {
                            errors.push(ValidationError {
                                path: format!("{}.{}", path, attr_name),
                                message: format!("Invalid URL in attribute '{}'", attr_name),
                                code: ErrorCode::InvalidFormat,
                                received: Some(url_str.to_string()),
                                expected: Some("valid URL".to_string()),
                            });
                        }
                    }
                }

                // Validate enum attributes
                if let Some(allowed_values) = attr_rules.enum_attributes.get(attr_name) {
                    if let Some(attr_str) = attr_value.as_str() {
                        if !allowed_values.contains(&attr_str.to_string()) {
                            errors.push(ValidationError {
                                path: format!("{}.{}", path, attr_name),
                                message: format!("Invalid value '{}' for attribute '{}'",
                                               attr_str, attr_name),
                                code: ErrorCode::InvalidValue,
                                received: Some(attr_str.to_string()),
                                expected: Some(format!("one of: {}", allowed_values.join(", "))),
                            });
                        }
                    }
                }
            }

            // Accessibility validation
            if props_schema.validate_accessibility {
                let a11y_errors = Self::validate_accessibility(props_obj, element_type,
                                                             &props_schema.accessibility_level, path);
                errors.extend(a11y_errors);
            }
        }

        errors
    }

    fn validate_semantic_rules(
        element_type: &HtmlElementType,
        element_obj: &serde_json::Map<String, serde_json::Value>,
        path: &str,
    ) -> Vec<ValidationError> {
        let mut errors = Vec::new();
        let rules = element_type.get_semantic_rules();

        // This is a simplified version - in a real implementation,
        // you'd need more context about the document structure
        for rule in rules {
            // Add warnings for semantic violations
            errors.push(ValidationError {
                path: path.to_string(),
                message: format!("Semantic guideline: {}", rule),
                code: ErrorCode::SemanticWarning,
                received: None,
                expected: None,
            });
        }

        errors
    }

    fn validate_accessibility(
        props_obj: &serde_json::Map<String, serde_json::Value>,
        element_type: &HtmlElementType,
        level: &AccessibilityLevel,
        path: &str,
    ) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        match element_type {
            HtmlElementType::Image => {
                if !props_obj.contains_key("alt") {
                    errors.push(ValidationError {
                        path: format!("{}.alt", path),
                        message: "Images must have alt text for accessibility".to_string(),
                        code: ErrorCode::AccessibilityViolation,
                        received: None,
                        expected: Some("alt attribute".to_string()),
                    });
                }
            },
            HtmlElementType::Button => {
                if !props_obj.contains_key("aria-label") &&
                   !props_obj.contains_key("children") {
                    errors.push(ValidationError {
                        path: path.to_string(),
                        message: "Buttons must have accessible text (children or aria-label)".to_string(),
                        code: ErrorCode::AccessibilityViolation,
                        received: None,
                        expected: Some("aria-label or text content".to_string()),
                    });
                }
            },
            HtmlElementType::Input => {
                if let Some(type_val) = props_obj.get("type") {
                    if type_val.as_str() == Some("submit") || type_val.as_str() == Some("button") {
                        if !props_obj.contains_key("value") && !props_obj.contains_key("aria-label") {
                            errors.push(ValidationError {
                                path: path.to_string(),
                                message: "Input buttons must have accessible text".to_string(),
                                code: ErrorCode::AccessibilityViolation,
                                received: None,
                                expected: Some("value or aria-label attribute".to_string()),
                            });
                        }
                    }
                }
            },
            _ => {}
        }

        // Enhanced validation for higher accessibility levels
        match level {
            AccessibilityLevel::Enhanced | AccessibilityLevel::Strict => {
                // Check for color contrast issues (simplified)
                if let Some(style) = props_obj.get("style").and_then(|s| s.as_object()) {
                    if style.contains_key("color") && !style.contains_key("background-color") {
                        errors.push(ValidationError {
                            path: format!("{}.style", path),
                            message: "Color alone should not be used to convey information".to_string(),
                            code: ErrorCode::AccessibilityViolation,
                            received: None,
                            expected: Some("sufficient color contrast".to_string()),
                        });
                    }
                }
            },
            _ => {}
        }

        errors
    }

    fn is_valid_url(url: &str) -> bool {
        url.starts_with("http://") ||
        url.starts_with("https://") ||
        url.starts_with("mailto:") ||
        url.starts_with("tel:") ||
        url.starts_with("ftp://") ||
        url.starts_with("/") ||
        url.starts_with("#")
    }
}