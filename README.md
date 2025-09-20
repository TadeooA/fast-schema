# Fast-Schema

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**A TypeScript-first schema validation library powered by Rust and WebAssembly.**

Fast-Schema is an experimental validation library that combines the performance of Rust with the developer experience of TypeScript. Currently in active development and building in public.

## Key Features

- Rust and WebAssembly foundation for potential performance gains
- Clean, modern API with ValidationError and type inference
- TypeScript-first design with excellent type safety
- Basic validation for strings, numbers, objects, and arrays
- Zero runtime dependencies beyond the WASM module
- Developer-friendly error messages

## Quick Start

### Installation

```bash
npm install fast-schema
```

### Basic Usage

```javascript
import { fast, ValidationError, infer } from 'fast-schema';

const userSchema = fast.object({
  name: fast.string().min(2).max(50),
  age: fast.number().int().min(18),
  email: fast.string().email(),
  tags: fast.array(fast.string())
});

// Type inference
type User = infer<typeof userSchema>;

// Error handling
try {
  const user = userSchema.parse(userData);
  console.log('Valid user:', user);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.issues);
  }
}

const user = userSchema.parse({
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  tags: ['developer', 'typescript']
});
```

### TypeScript Example

```typescript
import { z, ValidationError, infer } from 'fast-schema';

const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  })
});

// Type inference
type User = infer<typeof UserSchema>;

// Safe parsing
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log('User:', result.data);
} else {
  console.log('Errors:', result.error.flatten());
}
```

## Performance

Fast-Schema is built with Rust and WebAssembly for potential performance improvements:

- Core validation logic written in Rust
- WebAssembly compilation for browser compatibility
- Designed for efficient memory usage
- Early benchmarks show promising results

Note: Performance characteristics are still being optimized and measured as the library develops.

## API Reference

Fast-Schema provides a clean API for schema validation:

### Core Types

```javascript
import { z, ValidationError, infer } from 'fast-schema';

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  active: z.boolean(),
  tags: z.array(z.string()),
  metadata: z.record(z.string())
});

// Type inference
type User = infer<typeof userSchema>;

// Error handling
try {
  const user = userSchema.parse(data);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.issues);
  }
}
```

### Supported Validation Types

```javascript
import { z } from 'fast-schema';

// Basic schema validation
const userSchema = z.object({
  name: z.string().min(2).max(50),
  age: z.number().int().min(0),
  email: z.string().email(),
  tags: z.array(z.string()),
  active: z.boolean(),
  metadata: z.record(z.any()).optional()
});
```

### String Validation

```javascript
const schema = z.string()
  .min(5)                    // Minimum length
  .max(100)                  // Maximum length
  .email()                   // Email validation
  .url()                     // URL validation
  .uuid()                    // UUID validation
  .regex(/^[A-Z]+$/);        // Custom regex
```

### Number Validation

```javascript
const schema = z.number()
  .int()                     // Must be integer
  .positive()                // Must be > 0
  .min(10)                   // Minimum value
  .max(100);                 // Maximum value
```

### Object and Array Validation

```javascript
const objectSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
  address: z.object({
    street: z.string(),
    city: z.string()
  })
});

const arraySchema = z.array(z.string())
  .min(1)                    // Minimum items
  .max(10);                  // Maximum items
```

### Validation Methods

```javascript
// Throws on validation failure
const result = schema.parse(data);

// Returns result object, never throws
const result = schema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error);
}
```

### Error Handling

```javascript
import { z, ValidationError } from 'fast-schema';

try {
  const result = schema.parse(invalidData);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.issues);    // Array of validation issues
    console.log(error.format());  // Formatted error object
    console.log(error.flatten()); // Flattened error format
  }
}
```

## Example Usage

### API Validation

```javascript
const express = require('express');
const { z, ValidationError } = require('fast-schema');

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().min(18)
});

app.post('/users', (req, res) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten()
    });
  }

  const user = result.data;
  res.json({ success: true, user });
});
```

## Migration from Zod

Fast-Schema aims to provide an easy migration path from Zod:

### Basic Migration

```javascript
// Before (Zod)
import { z } from 'zod';

// After (Fast-Schema)
import { z } from 'fast-schema';

// Same schema definition
const schema = z.object({
  name: z.string().min(2),
  age: z.number().positive(),
  email: z.string().email()
});
```

### Error Handling

```javascript
// Fast-Schema provides ValidationError
import { z, ValidationError, infer } from 'fast-schema';

const schema = z.object({
  name: z.string().min(2),
  age: z.number().positive(),
  email: z.string().email()
});

// Type inference works the same way
type User = infer<typeof schema>;

// Error handling
try {
  const user = schema.parse(data);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.issues);
  }
}
```

Note: Migration compatibility is a work in progress. Some Zod features may not be fully implemented yet.

## Development

### Prerequisites

- Rust 1.70+
- Node.js 16+
- wasm-pack

### Building

```bash
# Build WASM module
wasm-pack build

# Run Rust tests
cargo test

# Check WASM target
cargo check --target wasm32-unknown-unknown
```

### Testing

```bash
# Run native Rust tests
cargo test

# Run WASM tests
wasm-pack test --headless --chrome
```

## Current Status

Fast-Schema is in active development. Currently implemented:

- Basic validation types (string, number, boolean, object, array)
- Type inference with `infer<>`
- Error handling with `ValidationError`
- WASM foundation for performance
- Basic compatibility layer

### Work in Progress

- Full Zod API compatibility
- Performance optimizations
- Comprehensive test coverage
- Documentation improvements

## Roadmap

**Current Focus**
- [ ] Complete basic validation types implementation
- [ ] Improve Zod API compatibility
- [ ] Add comprehensive test coverage
- [ ] Benchmark against other libraries
- [ ] Refine error messages and handling

**Future Goals**
- [ ] Advanced string validation (custom formats)
- [ ] Schema composition (union, intersection)
- [ ] Performance optimizations
- [ ] Framework integrations
- [ ] Documentation and examples

## Contributing

Contributions are welcome! This project is building in public and we're looking for:

- Bug reports and feature requests
- Code contributions (especially validation logic)
- Documentation improvements
- Performance testing and benchmarks

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Run `cargo test` and `wasm-pack test --headless --chrome`
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- [Report bugs](https://github.com/TadeooA/fast-schema/issues)
- [Request features](https://github.com/TadeooA/fast-schema/issues)
- [View source](https://github.com/TadeooA/fast-schema)

---

**Fast-Schema is an experimental library building in public. Feedback and contributions are welcome as we work toward a stable release.**