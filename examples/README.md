# Fast-Schema Examples

This directory contains comprehensive examples showing how to use Fast-Schema in various scenarios.

## Directory Structure

```
examples/
├── basic-usage/                    # Simple examples for beginners
│   ├── simple-validation.js        # Basic validation patterns
│   └── index.ts                   # TypeScript example
├── advanced-usage/                 # Complex real-world examples
│   ├── complex-schemas.js          # Enterprise-level schemas
│   └── refinements-transformations.ts  # Advanced features
└── migration-guide/               # Help migrating from other libraries
    ├── from-zod.js                # Zod migration guide
    └── README.md                  # Migration instructions
```

## Quick Start

### 1. Basic Usage

```bash
# Run basic validation examples
node examples/basic-usage/simple-validation.js
```

This example covers:
- String, number, boolean validation
- Object and array schemas
- Optional fields
- Nested objects
- Safe parsing
- Chaining validations

### 2. Advanced Usage

```bash
# Run complex schema examples
node examples/advanced-usage/complex-schemas.js
```

This example demonstrates:
- API request/response validation
- Configuration file validation
- E-commerce product schemas
- Deeply nested data structures
- Performance testing

### 3. Migration from Zod

```bash
# See migration guide
node examples/migration-guide/from-zod.js
```

## Example Categories

### Basic Validation Patterns

**String Validation:**
```javascript
const { string } = require('fast-schema-wasm');

const nameSchema = string().min(2).max(50);
const emailSchema = string().email();
const urlSchema = string().url();
```

**Number Validation:**
```javascript
const { number } = require('fast-schema-wasm');

const ageSchema = number().int().min(0).max(120);
const priceSchema = number().positive();
```

**Object Validation:**
```javascript
const { object, string, number } = require('fast-schema-wasm');

const userSchema = object({
  name: string().min(2),
  age: number().int().positive(),
  email: string().email()
});
```

### Advanced Patterns

**API Validation:**
```javascript
const CreateUserRequest = object({
  username: string().min(3).max(20),
  email: string().email(),
  password: string().min(8),
  profile: object({
    firstName: string(),
    lastName: string(),
    bio: string().optional()
  })
});
```

**Configuration Validation:**
```javascript
const DatabaseConfig = object({
  host: string(),
  port: number().int().min(1).max(65535),
  ssl: boolean().optional()
});
```

**E-commerce Schemas:**
```javascript
const ProductSchema = object({
  id: string(),
  name: string().min(1).max(200),
  price: number().positive(),
  category: object({
    id: string(),
    name: string()
  }),
  variants: array(object({
    sku: string(),
    price: number().positive(),
    inventory: number().int().min(0)
  }))
});
```

## Real-World Use Cases

### 1. Express.js API Validation

```javascript
const express = require('express');
const { object, string, number } = require('fast-schema-wasm');

const app = express();

const createUserSchema = object({
  name: string().min(2),
  email: string().email(),
  age: number().int().min(18)
});

app.post('/users', (req, res) => {
  try {
    const userData = createUserSchema.parse(req.body);
    // Process validated data
    res.json({ success: true, user: userData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### 2. Configuration Validation

```javascript
const { object, string, number, boolean } = require('fast-schema-wasm');

const configSchema = object({
  database: object({
    host: string(),
    port: number().int(),
    name: string()
  }),
  server: object({
    port: number().int().min(1024),
    cors: boolean()
  })
});

// Validate environment configuration
const config = configSchema.parse(process.env);
```

### 3. Form Validation (Frontend)

```javascript
const { object, string, boolean } = require('fast-schema-wasm');

const contactFormSchema = object({
  name: string().min(2, 'Name must be at least 2 characters'),
  email: string().email('Invalid email address'),
  message: string().min(10, 'Message must be at least 10 characters'),
  newsletter: boolean().optional()
});

// Validate form data
function validateForm(formData) {
  const result = contactFormSchema.safeParse(formData);

  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.flatten()
    };
  }

  return {
    isValid: true,
    data: result.data
  };
}
```

## Performance Examples

All examples include performance measurements to demonstrate Fast-Schema's speed advantage over other validation libraries.

**Typical Performance Results:**
- Simple validation: 50,000+ ops/sec
- Complex objects: 20,000+ ops/sec
- Nested structures: 10,000+ ops/sec
- **5-20x faster than Zod!**

## Running Examples

1. **Build the project first:**
   ```bash
   cd js
   npm run build
   ```

2. **Run individual examples:**
   ```bash
   node examples/basic-usage/simple-validation.js
   node examples/advanced-usage/complex-schemas.js
   node examples/migration-guide/from-zod.js
   ```

3. **Run all examples:**
   ```bash
   npm run examples  # If script is added to package.json
   ```

## Additional Resources

- [API Documentation](../README.md)
- [Migration Guide](migration-guide/README.md)
- [Performance Benchmarks](../benchmarks/)
- [Test Suite](../tests/)

## Contributing Examples

Have a great use case? We'd love to include your example!

1. Create a new file in the appropriate directory
2. Follow the existing code style
3. Include performance measurements
4. Add clear comments explaining the use case
5. Submit a pull request

## Tips for Best Performance

1. **Reuse schema instances** - Don't create schemas in hot paths
2. **Use `safeParse()` for user input** - Avoid exceptions in performance-critical code
3. **Validate early** - Check data at API boundaries
4. **Cache compiled schemas** - For maximum performance
5. **Profile your usage** - Use the built-in performance utilities

Happy validating!