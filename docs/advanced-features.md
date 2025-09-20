# Advanced Features Documentation

Fast-Schema provides a comprehensive set of advanced validation features that go beyond basic type checking. This guide covers all the advanced capabilities available in the library.

## Table of Contents

- [Intersection Schemas](#intersection-schemas)
- [Conditional Validation](#conditional-validation)
- [Async Validation](#async-validation)
- [Advanced String Formats](#advanced-string-formats)
- [Performance Optimizations](#performance-optimizations)
- [Schema Composition](#schema-composition)
- [Discriminated Unions](#discriminated-unions)

## Intersection Schemas

Intersection schemas allow you to combine multiple schemas, requiring data to validate against all of them.

### Basic Usage

```typescript
import { z } from 'fast-schema';

const personSchema = z.object({
  name: z.string(),
  age: z.number()
});

const employeeSchema = z.object({
  employeeId: z.string(),
  department: z.string()
});

const personEmployeeSchema = z.intersection(personSchema, employeeSchema);

// Valid data must have all properties from both schemas
const validData = {
  name: 'John Doe',
  age: 30,
  employeeId: 'E123',
  department: 'Engineering'
};

const result = personEmployeeSchema.parse(validData);
// Type: { name: string; age: number; employeeId: string; department: string; }
```

### Nested Object Intersections

```typescript
const baseSchema = z.object({
  id: z.string(),
  metadata: z.object({
    created: z.string(),
    version: z.number()
  })
});

const extendedSchema = z.object({
  name: z.string(),
  metadata: z.object({
    updated: z.string(),
    author: z.string()
  })
});

const intersectionSchema = z.intersection(baseSchema, extendedSchema);

// Metadata objects will be merged
const data = {
  id: '123',
  name: 'Test',
  metadata: {
    created: '2023-01-01',
    version: 1,
    updated: '2023-01-02',
    author: 'John'
  }
};
```

### Multiple Intersections

```typescript
const schemaA = z.object({ a: z.string() });
const schemaB = z.object({ b: z.number() });
const schemaC = z.object({ c: z.boolean() });

const tripleIntersection = z.intersection(
  z.intersection(schemaA, schemaB),
  schemaC
);

// Or use the helper methods
const schema = schemaA.and(schemaB).and(schemaC);
```

## Conditional Validation

Conditional schemas apply different validation logic based on the data content.

### Basic Conditional Validation

```typescript
const isAdult = (data: any) => data.age >= 18;

const adultSchema = z.object({
  name: z.string(),
  age: z.number().min(18)
});

const minorSchema = z.object({
  name: z.string(),
  age: z.number().max(17),
  guardian: z.string()
});

const personSchema = z.conditional(isAdult, adultSchema, minorSchema);

// Adult validation
const adult = personSchema.parse({ name: 'John', age: 25 });

// Minor validation (requires guardian)
const minor = personSchema.parse({
  name: 'Jane',
  age: 16,
  guardian: 'Parent Name'
});
```

### Complex Conditional Logic

```typescript
const complexCondition = (data: any) => {
  return data.country === 'US' &&
         data.age >= 21 &&
         data.hasLicense === true;
};

const driverSchema = z.object({
  name: z.string(),
  age: z.number().min(21),
  country: z.literal('US'),
  hasLicense: z.literal(true),
  licenseNumber: z.string()
});

const nonDriverSchema = z.object({
  name: z.string(),
  age: z.number(),
  country: z.string(),
  hasLicense: z.boolean(),
  idNumber: z.string()
});

const conditionalSchema = z.conditional(
  complexCondition,
  driverSchema,
  nonDriverSchema
);
```

### Nested Conditional Schemas

```typescript
const isPremium = (data: any) => data.type === 'premium';
const isBasic = (data: any) => data.type === 'basic';

const premiumSchema = z.object({
  type: z.literal('premium'),
  features: z.array(z.string()).min(5),
  price: z.number().min(50)
});

const basicSchema = z.object({
  type: z.literal('basic'),
  features: z.array(z.string()).max(3),
  price: z.number().max(20)
});

const freeSchema = z.object({
  type: z.literal('free'),
  features: z.array(z.string()).max(1),
  price: z.literal(0)
});

// Nested conditional
const conditionalSchema = z.conditional(
  isPremium,
  premiumSchema,
  z.conditional(isBasic, basicSchema, freeSchema)
);
```

## Async Validation

Fast-Schema supports asynchronous validation for scenarios that require external data sources or complex computations.

### Basic Async Validation

```typescript
const asyncValidator = async (data: unknown): Promise<string> => {
  // Simulate async operation (e.g., database check)
  await new Promise(resolve => setTimeout(resolve, 100));

  if (typeof data === 'string' && data.length > 2) {
    return data.toUpperCase();
  }
  throw new Error('Invalid string');
};

const asyncSchema = z.async(asyncValidator);

// Use parseAsync for async validation
const result = await asyncSchema.parseAsync('hello');
console.log(result); // 'HELLO'

// Safe async parsing
const safeResult = await asyncSchema.safeParseAsync('hi');
if (safeResult.success) {
  console.log(safeResult.data);
} else {
  console.log(safeResult.error);
}
```

### Async Refinements

```typescript
const baseSchema = z.object({
  username: z.string(),
  email: z.string().email()
});

const isUniqueUsername = async (data: { username: string; email: string }): Promise<boolean> => {
  // Simulate database check
  await new Promise(resolve => setTimeout(resolve, 50));
  return data.username !== 'taken_username';
};

const asyncRefinedSchema = z.asyncRefinement(
  baseSchema,
  isUniqueUsername,
  'Username is already taken'
);

const userData = {
  username: 'available_user',
  email: 'test@example.com'
};

const result = await asyncRefinedSchema.parseAsync(userData);
```

### Promise Schema

```typescript
// Validate promises and their resolved values
const stringSchema = z.string();
const promiseSchema = z.promise(stringSchema);

const stringPromise = Promise.resolve('hello');
const validatedPromise = await promiseSchema.parseAsync(stringPromise);

// The result is a promise that resolves to the validated value
const resolvedValue = await validatedPromise; // 'hello'
```

## Advanced String Formats

Extended string validation with specialized formats and patterns.

### Built-in Format Validators

```typescript
const advancedString = z.advancedString();

// Network formats
const ipv4Schema = advancedString.ipv4();
const ipv6Schema = advancedString.ipv6();
const macSchema = advancedString.mac();

// Identifiers
const jwtSchema = advancedString.jwt();
const base64Schema = advancedString.base64();
const hexSchema = advancedString.hex();
const uuidSchema = advancedString.uuid();

// Financial
const creditCardSchema = advancedString.creditCard();
const ibanSchema = advancedString.iban();

// Communication
const phoneSchema = advancedString.phone();

// Visual
const colorSchema = advancedString.color();
const rgbSchema = advancedString.rgb();

// Web formats
const slugSchema = advancedString.slug();

// Date/Time
const iso8601Schema = advancedString.iso8601();
const time24Schema = advancedString.time24();
```

### Chaining with Length Constraints

```typescript
const hexIdSchema = z.advancedString()
  .hex()
  .min(6)
  .max(12);

const result = hexIdSchema.parse('abc123'); // Valid
```

### Custom Patterns

```typescript
const customPattern = z.advancedString()
  .regex(/^[A-Z]{2}\d{4}$/)
  .min(6)
  .max(6);

// Advanced string methods
const processedString = z.advancedString()
  .nonempty()
  .startsWith('prefix_')
  .endsWith('_suffix')
  .includes('_important_');
```

## Performance Optimizations

Fast-Schema provides several performance optimization features for high-throughput scenarios.

### JIT Compilation

```typescript
const baseSchema = z.object({
  name: z.string().min(2).max(50),
  age: z.number().min(0).max(120),
  email: z.string().email()
});

// Compile schema for better performance
const jitSchema = z.jit(baseSchema);

// First validation compiles the schema
const result1 = jitSchema.parse(userData);

// Subsequent validations use compiled version (faster)
const result2 = jitSchema.parse(userData);

// Get compilation statistics
const stats = jitSchema.getStats();
console.log(stats.cached); // true after first use
```

### Batch Validation

```typescript
const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.boolean()
});

const batchValidator = z.batch(itemSchema);

const items = [
  { id: 1, name: 'Item 1', active: true },
  { id: 2, name: 'Item 2', active: false },
  { id: 'invalid', name: 'Item 3', active: true }, // Will fail
];

const results = batchValidator.validate(items);

// Process results
results.forEach((result, index) => {
  if (result.success) {
    console.log(`Item ${index}: Valid`, result.data);
  } else {
    console.log(`Item ${index}: Invalid`, result.error.message);
  }
});
```

### Caching Systems

```typescript
// Regex pattern caching (automatic)
const RegexCache = z.advanced.RegexCache;
console.log(RegexCache.size()); // Number of cached patterns

// Manual cache management
RegexCache.clear(); // Clear all cached patterns

// Schema compilation caching
const SchemaCache = z.advanced.SchemaCache;
console.log(SchemaCache.size()); // Number of cached compilations

// Object pooling for reduced garbage collection
const ValidationPool = z.advanced.ValidationPool;
ValidationPool.clear(); // Reset object pools
```

## Schema Composition

Utilities for composing and transforming schemas.

### Deep Partial

```typescript
const baseSchema = z.object({
  user: z.object({
    name: z.string(),
    profile: z.object({
      bio: z.string(),
      preferences: z.object({
        theme: z.string(),
        notifications: z.boolean()
      })
    })
  })
});

const deepPartialSchema = z.deepPartial(baseSchema);

// All properties become optional recursively
const partialData = {
  user: {
    name: 'John'
    // profile is optional
  }
  // All other properties optional
};

const result = deepPartialSchema.parse(partialData);
```

### Required Schema

```typescript
const baseSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
  email: z.string().optional()
});

const requiredSchema = z.required(baseSchema);

// All properties become required
const data = {
  name: 'John',
  age: 30,        // Now required
  email: 'john@example.com' // Now required
};
```

### Readonly Schema

```typescript
const baseSchema = z.object({
  config: z.object({
    theme: z.string(),
    debug: z.boolean()
  })
});

const readonlySchema = z.readonly(baseSchema);

const result = readonlySchema.parse(data);
// Result is frozen - cannot be modified
console.log(Object.isFrozen(result)); // true
```

### NonNullable Schema

```typescript
const nullableSchema = z.string().nullable();
const nonNullableSchema = z.nonNullable(nullableSchema);

nonNullableSchema.parse('valid'); // OK
nonNullableSchema.parse(null);    // Throws error
```

### Keyof Schema

```typescript
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string()
});

const userKeySchema = z.keyof(userSchema);

userKeySchema.parse('name');  // OK
userKeySchema.parse('email'); // OK
userKeySchema.parse('invalid'); // Throws error

type UserKey = z.infer<typeof userKeySchema>; // 'id' | 'name' | 'email'
```

## Discriminated Unions

Discriminated unions provide efficient validation for polymorphic data structures.

### Basic Discriminated Union

```typescript
const circleSchema = z.object({
  type: z.literal('circle'),
  radius: z.number()
});

const rectangleSchema = z.object({
  type: z.literal('rectangle'),
  width: z.number(),
  height: z.number()
});

const shapeSchema = z.discriminatedUnion('type', [
  circleSchema,
  rectangleSchema
]);

// Validates based on 'type' field
const circle = shapeSchema.parse({
  type: 'circle',
  radius: 5
});

const rectangle = shapeSchema.parse({
  type: 'rectangle',
  width: 10,
  height: 20
});
```

### Complex Discriminated Union

```typescript
const dogSchema = z.object({
  species: z.literal('dog'),
  breed: z.string(),
  bark: z.boolean()
});

const catSchema = z.object({
  species: z.literal('cat'),
  indoor: z.boolean(),
  meow: z.string()
});

const birdSchema = z.object({
  species: z.literal('bird'),
  canFly: z.boolean(),
  wingspan: z.number()
});

const animalSchema = z.discriminatedUnion('species', [
  dogSchema,
  catSchema,
  birdSchema
]);

// TypeScript infers the correct type based on discriminator
const dog = animalSchema.parse({
  species: 'dog',
  breed: 'Labrador',
  bark: true
});
```

## Error Handling

All advanced features provide detailed error information for debugging.

### Error Structure

```typescript
try {
  schema.parse(invalidData);
} catch (error) {
  if (error instanceof ValidationError) {
    error.issues.forEach(issue => {
      console.log({
        code: issue.code,           // Error type
        path: issue.path,           // Location in data
        message: issue.message,     // Human-readable message
        received: issue.received,   // Actual value (if applicable)
        expected: issue.expected    // Expected value (if applicable)
      });
    });
  }
}
```

### Safe Parsing

```typescript
const result = schema.safeParse(data);

if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Invalid:', result.error.issues);
}
```

## Type Inference

All advanced features maintain full TypeScript type inference.

```typescript
const complexSchema = z.intersection(
  z.object({ name: z.string() }),
  z.object({ age: z.number().optional() })
);

type ComplexType = z.infer<typeof complexSchema>;
// Inferred as: { name: string; age?: number; }

const conditionalSchema = z.conditional(
  (data: any) => 'id' in data,
  z.object({ id: z.number(), name: z.string() }),
  z.object({ tempId: z.string(), name: z.string() })
);

type ConditionalType = z.infer<typeof conditionalSchema>;
// Inferred as: { id: number; name: string; } | { tempId: string; name: string; }
```

## Best Practices

1. **Use JIT compilation** for schemas that will be used repeatedly
2. **Implement batch validation** for processing large datasets
3. **Leverage async validation** for external data dependencies
4. **Use discriminated unions** for polymorphic data structures
5. **Apply conditional validation** for context-dependent rules
6. **Compose schemas** using intersection and composition utilities
7. **Handle errors gracefully** with safe parsing methods
8. **Monitor performance** using built-in statistics and caching

For more examples and detailed API documentation, see the [API Reference](./api-reference.md) and [Performance Guide](./performance-guide.md).