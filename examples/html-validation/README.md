# HTML/React Validation Examples

This directory contains comprehensive examples of how to use Fast-Schema's HTML and React component validation features.

## Overview

Fast-Schema extends JSON schema validation to include HTML elements and React components, providing:

- **HTML Element Validation**: Validate structure, attributes, and accessibility
- **React Component Validation**: Type-safe props validation with lifecycle support
- **Accessibility Compliance**: Built-in WCAG AA/AAA compliance checking
- **Semantic Validation**: Ensure proper HTML semantics and structure

## Examples

### 1. Basic Elements (`basic-elements.js`)

Demonstrates validation of common HTML elements:

```javascript
import { div, img, button, input, a, form } from 'fast-schema';

// Basic element validation
const divSchema = div();
const imgSchema = img().validateAccessibility('strict');
const buttonSchema = button().requireProps('onClick');
```

**Features shown:**
- Element type validation
- Required attributes
- Accessibility checking
- Custom props validation
- Children schema validation

### 2. React Components (`react-components.js`)

Shows how to validate React components with complex prop schemas:

```javascript
import { reactComponent, string, number, boolean, object } from 'fast-schema';

const ButtonComponent = reactComponent({
  componentName: 'Button',
  propsSchema: {
    variant: string(),
    size: string(),
    disabled: boolean().optional(),
    children: string()
  },
  requiredProps: ['variant', 'children'],
  childrenAllowed: true
});
```

**Features shown:**
- Component name validation
- Props schema with complex types
- Required props enforcement
- Children validation
- Nested component structures

### 3. Accessibility Validation (`accessibility-validation.js`)

Comprehensive accessibility validation examples:

```javascript
import { img, button, form, htmlElement } from 'fast-schema';

// Strict accessibility validation
const accessibleImg = img().validateAccessibility('strict');
const accessibleButton = button()
  .validateAccessibility('enhanced')
  .requireProps('aria-label');
```

**Features shown:**
- WCAG compliance levels (basic, enhanced, strict)
- ARIA attributes validation
- Semantic HTML validation
- Keyboard navigation support
- Screen reader compatibility

## Usage Patterns

### Basic HTML Element

```javascript
import { div } from 'fast-schema';

const schema = div();
const element = {
  type: 'div',
  props: {
    className: 'container',
    style: { backgroundColor: 'blue' }
  }
};

const result = schema.parse(element);
```

### HTML Element with Accessibility

```javascript
import { img } from 'fast-schema';

const schema = img().validateAccessibility('strict');
const element = {
  type: 'img',
  props: {
    src: '/image.jpg',
    alt: 'Descriptive alt text', // Required for accessibility
    'aria-describedby': 'img-description'
  }
};
```

### React Component

```javascript
import { reactComponent, string, boolean } from 'fast-schema';

const schema = reactComponent({
  componentName: 'MyComponent',
  propsSchema: {
    title: string(),
    visible: boolean().optional()
  },
  requiredProps: ['title']
});

const component = {
  type: 'MyComponent',
  props: {
    title: 'Hello World',
    visible: true
  }
};
```

### Custom HTML Element

```javascript
import { htmlElement } from 'fast-schema';

const schema = htmlElement('my-widget', {
  requiredProps: ['data-id', 'config'],
  validateAccessibility: true,
  accessibilityLevel: 'enhanced'
});
```

## Accessibility Levels

### Basic
- Alt text for images
- Basic ARIA attributes
- Form labels

### Enhanced
- Advanced ARIA support
- Keyboard navigation
- Focus management
- Live regions

### Strict
- Full WCAG AA compliance
- Complex widget patterns
- Screen reader optimization
- Color contrast validation

## Error Handling

Fast-Schema provides detailed error messages for HTML/React validation:

```javascript
try {
  schema.parse(invalidElement);
} catch (error) {
  console.log(error.issues);
  // [
  //   {
  //     code: 'invalid_type',
  //     path: ['props', 'alt'],
  //     message: 'Images must have alt text for accessibility'
  //   }
  // ]
}
```

## Performance

HTML/React validation is optimized for:
- **Fast validation**: 10-20x faster than traditional validators
- **Memory efficiency**: Minimal memory footprint
- **Batch processing**: Validate multiple components efficiently
- **Caching**: Compiled schemas for repeated validation

## Integration

These examples can be run with:

```bash
# Run basic elements example
node examples/html-validation/basic-elements.js

# Run React components example
node examples/html-validation/react-components.js

# Run accessibility validation example
node examples/html-validation/accessibility-validation.js
```

For more advanced usage, see the main documentation and API reference.