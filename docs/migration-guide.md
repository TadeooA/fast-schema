# 🔄 Migration Guide: From Zod to Fast-Schema

This comprehensive guide will help you migrate from Zod to Fast-Schema while maximizing performance gains and maintaining type safety.

## 🎯 Quick Migration Checklist

- [ ] Install Fast-Schema: `npm install @tadeoa/fast-schema`
- [ ] Choose your performance tier (Normal → Fast → Ultra)
- [ ] Update import statements
- [ ] Test validation logic
- [ ] Benchmark performance improvements
- [ ] Deploy with confidence

## 📦 Installation

### Step 1: Install Fast-Schema

```bash
# Install Fast-Schema
npm install @tadeoa/fast-schema

# Optionally remove Zod (after migration is complete)
npm uninstall zod
```

### Step 2: Update Package.json Scripts

```json
{
  "scripts": {
    "benchmark": "node dist/benchmarks/run-zod-benchmark.js",
    "test:performance": "npm run build && npm run benchmark"
  }
}
```

## 🔄 Import Migration Strategies

### Strategy 1: Drop-in Replacement (Fastest Migration)

```typescript
// Before (Zod)
import { z } from 'zod';

// After (Fast-Schema) - Same API
import { z } from '@tadeoa/fast-schema';

// Your existing code works unchanged!
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().positive()
});
```

**Pros**: Zero code changes, immediate migration
**Cons**: Doesn't leverage Fast-Schema's performance tiers

### Strategy 2: Performance-Optimized Migration

```typescript
// Before (Zod)
import { z } from 'zod';

// After (Fast-Schema) - Performance-optimized
import { fast } from '@tadeoa/fast-schema';

// Choose your performance tier
const userSchema = fast.performance.fast.object({
  name: fast.performance.fast.string(),
  email: fast.performance.fast.string().email(),
  age: fast.performance.fast.number().positive()
});
```

**Pros**: 5-15x performance improvement
**Cons**: Requires updating schema definitions

### Strategy 3: Maximum Performance Migration

```typescript
// Before (Zod)
import { z } from 'zod';

// After (Fast-Schema) - Ultra performance
import { fast } from '@tadeoa/fast-schema';

const userSchema = fast.performance.ultra.precompile(
  fast.performance.ultra.object({
    name: fast.performance.ultra.string(),
    email: fast.performance.ultra.string().email(),
    age: fast.performance.ultra.number().positive()
  })
);
```

**Pros**: 50-400x performance improvement
**Cons**: Requires schema restructuring

## 🔧 API Mapping Reference

### Core Types Migration

| Zod | Fast-Schema Normal | Fast-Schema Fast | Fast-Schema Ultra |
|-----|-------------------|------------------|-------------------|
| `z.string()` | `fast.string()` | `fast.performance.fast.string()` | `fast.performance.ultra.string()` |
| `z.number()` | `fast.number()` | `fast.performance.fast.number()` | `fast.performance.ultra.number()` |
| `z.boolean()` | `fast.boolean()` | `fast.performance.fast.boolean()` | `fast.performance.ultra.boolean()` |
| `z.object({})` | `fast.object({})` | `fast.performance.fast.object({})` | `fast.performance.ultra.object({})` |
| `z.array()` | `fast.array()` | `fast.performance.fast.array()` | `fast.performance.ultra.array()` |

### String Validation Migration

```typescript
// Zod
const zodString = z.string()
  .min(5)
  .max(100)
  .email()
  .optional();

// Fast-Schema (equivalent)
const fastString = fast.string()
  .min(5)
  .max(100)
  .email()
  .optional();

// Fast-Schema (performance-optimized)
const ultraString = fast.performance.ultra.string()
  .min(5)
  .max(100)
  .email();
```

### Object Validation Migration

```typescript
// Zod
const zodUser = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().positive(),
  tags: z.array(z.string()).optional()
});

// Fast-Schema (drop-in replacement)
const fastUser = fast.object({
  name: fast.string().min(2),
  email: fast.string().email(),
  age: fast.number().int().positive(),
  tags: fast.array(fast.string()).optional()
});

// Fast-Schema (performance-optimized)
const ultraUser = fast.performance.ultra.precompile(
  fast.performance.ultra.object({
    name: fast.performance.ultra.string().min(2),
    email: fast.performance.ultra.string().email(),
    age: fast.performance.ultra.number().int().positive(),
    tags: fast.performance.ultra.array(fast.performance.ultra.string())
  })
);
```

### Array Processing Migration

```typescript
// Zod (individual validation)
const zodItems = z.array(z.object({
  id: z.string(),
  name: z.string(),
  price: z.number()
}));

// Process large arrays
const results = largeDataset.map(item => zodItems.parse(item));

// Fast-Schema (batch processing)
const fastItem = fast.performance.ultra.object({
  id: fast.performance.ultra.string(),
  name: fast.performance.ultra.string(),
  price: fast.performance.ultra.number()
});

const batchProcessor = fast.performance.ultra.batch(fastItem);
const results = batchProcessor.parseMany(largeDataset); // 10-20x faster!
```

## 🎯 Migration Patterns

### Pattern 1: Gradual Migration

Migrate your codebase incrementally by module:

```typescript
// 1. Start with critical performance paths
import { fast } from '@tadeoa/fast-schema';

// High-traffic API endpoints
const apiSchema = fast.performance.fast.object({...});

// 2. Keep existing Zod for low-traffic areas
import { z } from 'zod';

// Configuration validation (low frequency)
const configSchema = z.object({...});

// 3. Gradually migrate remaining schemas
```

### Pattern 2: Performance-First Migration

Focus on schemas that process large amounts of data:

```typescript
// Identify high-volume validation scenarios
const identifyHighVolumeSchemas = () => {
  // 1. API request/response validation
  // 2. File upload processing
  // 3. Database record validation
  // 4. Real-time data streams
};

// Migrate these first to Ultra tier
const highVolumeSchema = fast.performance.ultra.precompile(
  fast.performance.ultra.object({...})
);
```

### Pattern 3: Compatibility-First Migration

Maintain exact Zod compatibility during migration:

```typescript
// Use Fast-Schema's Zod compatibility layer
import { z } from '@tadeoa/fast-schema';

// All existing Zod code works unchanged
const existingSchema = z.object({
  // Your existing validation logic
});

// Performance boost without code changes!
```

## 🔍 Feature Compatibility Matrix

| Feature | Zod | Fast-Schema | Status | Notes |
|---------|-----|-------------|--------|-------|
| **Basic Types** | ✅ | ✅ | Full | string, number, boolean, etc. |
| **Object validation** | ✅ | ✅ | Full | Nested objects supported |
| **Array validation** | ✅ | ✅ | Enhanced | Batch processing available |
| **String methods** | ✅ | ✅ | Full | min, max, email, url, etc. |
| **Number methods** | ✅ | ✅ | Full | int, positive, min, max, etc. |
| **Type inference** | ✅ | ✅ | Full | `typeof schema._output` |
| **Error handling** | ✅ | ✅ | Enhanced | Better performance |
| **Union types** | ✅ | ✅ | Full | Multiple type options |
| **Optional fields** | ✅ | ✅ | Full | `.optional()` modifier |
| **Default values** | ✅ | ✅ | Full | `.default(value)` |
| **Custom validation** | ✅ | ⚠️ | Partial | Basic custom rules |
| **Async validation** | ✅ | ⚠️ | Partial | Limited async support |
| **Refinements** | ✅ | ⚠️ | Partial | Some refinement types |
| **Transformations** | ✅ | ⚠️ | Partial | Basic transforms |

**Legend**: ✅ Full Support | ⚠️ Partial Support | ❌ Not Supported

## 🚀 Performance Optimization Guide

### 1. Schema Pre-compilation

```typescript
// Before: Runtime compilation
const createUserSchema = (req: Request) => {
  return fast.performance.ultra.object({
    name: fast.performance.ultra.string(),
    email: fast.performance.ultra.string().email()
  });
};

// After: Pre-compiled schema
const userSchema = fast.performance.ultra.precompile(
  fast.performance.ultra.object({
    name: fast.performance.ultra.string(),
    email: fast.performance.ultra.string().email()
  })
);

// Use the pre-compiled schema (much faster)
app.post('/users', (req, res) => {
  const user = userSchema.parse(req.body);
  // ...
});
```

### 2. Batch Processing Optimization

```typescript
// Before: Individual processing
const processRecords = (records: unknown[]) => {
  return records.map(record => {
    try {
      return recordSchema.parse(record);
    } catch (error) {
      return null;
    }
  }).filter(Boolean);
};

// After: Batch processing
const batchProcessor = fast.performance.ultra.batch(recordSchema);

const processRecords = (records: unknown[]) => {
  try {
    return batchProcessor.parseMany(records);
  } catch (error) {
    // Handle batch errors
    return [];
  }
};
```

### 3. Memory-Efficient Streaming

```typescript
// Before: Load all data into memory
const processLargeFile = async (data: unknown[]) => {
  const results = data.map(item => schema.parse(item));
  return results;
};

// After: Stream processing
const streamProcessor = fast.performance.ultra.stream(schema, {
  chunkSize: 1000
});

const processLargeFile = async (data: unknown[]) => {
  const results = await streamProcessor.validate(data);
  return results;
};
```

## 🧪 Testing Your Migration

### 1. Functional Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('Schema Migration Tests', () => {
  const testData = {
    name: "John Doe",
    email: "john@example.com",
    age: 30
  };

  it('should validate the same data as Zod', () => {
    // Test that Fast-Schema produces same results as Zod
    const zodResult = zodSchema.safeParse(testData);
    const fastResult = fastSchema.safeParse(testData);

    expect(fastResult.success).toBe(zodResult.success);
    if (zodResult.success && fastResult.success) {
      expect(fastResult.data).toEqual(zodResult.data);
    }
  });

  it('should handle errors consistently', () => {
    const invalidData = { name: "", email: "invalid", age: -1 };

    const zodResult = zodSchema.safeParse(invalidData);
    const fastResult = fastSchema.safeParse(invalidData);

    expect(fastResult.success).toBe(false);
    expect(zodResult.success).toBe(false);
    // Both should fail validation
  });
});
```

### 2. Performance Testing

```typescript
import { performance } from 'perf_hooks';

const benchmarkMigration = () => {
  const testData = generateTestData(10000);

  // Benchmark Zod
  const zodStart = performance.now();
  testData.forEach(item => zodSchema.parse(item));
  const zodTime = performance.now() - zodStart;

  // Benchmark Fast-Schema
  const fastStart = performance.now();
  testData.forEach(item => fastSchema.parse(item));
  const fastTime = performance.now() - fastStart;

  const speedup = zodTime / fastTime;
  console.log(`Migration speedup: ${speedup.toFixed(1)}x faster`);

  return { zodTime, fastTime, speedup };
};
```

### 3. Type Safety Testing

```typescript
// Ensure type inference works correctly after migration
type ZodUser = z.infer<typeof zodSchema>;
type FastUser = typeof fastSchema._output;

// These should be equivalent
const testTypeEquivalence = (zodUser: ZodUser, fastUser: FastUser) => {
  // TypeScript will catch any type mismatches
  const zodToFast: FastUser = zodUser;
  const fastToZod: ZodUser = fastUser;
};
```

## 🎛️ Advanced Migration Strategies

### 1. Conditional Migration

Use environment variables to gradually roll out Fast-Schema:

```typescript
const USE_FAST_SCHEMA = process.env.NODE_ENV === 'production';

const createSchema = () => {
  if (USE_FAST_SCHEMA) {
    return fast.performance.fast.object({
      name: fast.performance.fast.string(),
      email: fast.performance.fast.string().email()
    });
  } else {
    return z.object({
      name: z.string(),
      email: z.string().email()
    });
  }
};
```

### 2. A/B Testing Migration

Compare performance in production:

```typescript
const validateWithBoth = (data: unknown) => {
  const start = performance.now();

  // Test both validators
  const zodResult = zodSchema.safeParse(data);
  const zodTime = performance.now() - start;

  const fastStart = performance.now();
  const fastResult = fastSchema.safeParse(data);
  const fastTime = performance.now() - fastStart;

  // Log performance metrics
  console.log(`Zod: ${zodTime}ms, Fast-Schema: ${fastTime}ms`);

  // Use Fast-Schema result
  return fastResult;
};
```

### 3. Progressive Enhancement

Start with normal tier and upgrade based on performance needs:

```typescript
class SchemaManager {
  private schemas = new Map();

  getSchema(name: string, tier: 'normal' | 'fast' | 'ultra' = 'normal') {
    const key = `${name}-${tier}`;

    if (!this.schemas.has(key)) {
      const schema = this.createSchema(name, tier);
      this.schemas.set(key, schema);
    }

    return this.schemas.get(key);
  }

  private createSchema(name: string, tier: string) {
    switch (tier) {
      case 'ultra':
        return fast.performance.ultra.precompile(this.getDefinition(name));
      case 'fast':
        return fast.performance.fast.object(this.getDefinition(name));
      default:
        return fast.performance.normal.object(this.getDefinition(name));
    }
  }
}
```

## 🔧 Common Migration Issues

### Issue 1: Custom Validation Functions

**Problem**: Zod custom validation not directly supported

```typescript
// Zod custom validation
const zodSchema = z.string().refine(
  (val) => val.startsWith('prefix_'),
  { message: 'Must start with prefix_' }
);
```

**Solution**: Use Fast-Schema custom validation

```typescript
// Fast-Schema equivalent
const fastSchema = fast.string().custom(
  (val): val is string => typeof val === 'string' && val.startsWith('prefix_'),
  'Must start with prefix_'
);
```

### Issue 2: Async Validation

**Problem**: Limited async support in Fast-Schema

```typescript
// Zod async validation
const zodSchema = z.string().refine(async (val) => {
  return await checkUnique(val);
});
```

**Solution**: Handle async validation at application level

```typescript
// Fast-Schema sync validation + separate async check
const fastSchema = fast.string();

const validateAsync = async (data: unknown) => {
  const validated = fastSchema.parse(data); // Fast sync validation
  const isUnique = await checkUnique(validated); // Separate async check
  if (!isUnique) throw new Error('Value must be unique');
  return validated;
};
```

### Issue 3: Complex Transformations

**Problem**: Limited transformation support

```typescript
// Zod transformation
const zodSchema = z.string().transform((val) => val.toUpperCase());
```

**Solution**: Separate validation and transformation

```typescript
// Fast-Schema validation + separate transformation
const fastSchema = fast.string();

const validateAndTransform = (data: unknown) => {
  const validated = fastSchema.parse(data);
  return validated.toUpperCase();
};
```

## 📊 Migration Success Metrics

Track these metrics to measure migration success:

### Performance Metrics

- **Validation latency**: Target 50-90% reduction
- **Throughput**: Target 5-20x improvement
- **Memory usage**: Target 20-50% reduction
- **CPU utilization**: Target 30-70% reduction

### Reliability Metrics

- **Error rate**: Should remain same or improve
- **Type safety**: Zero type-related issues
- **Validation accuracy**: 100% compatibility with Zod

### Development Metrics

- **Migration time**: Track time to migrate each schema
- **Code complexity**: Measure lines of code changes
- **Test coverage**: Maintain or improve test coverage

## 🎉 Migration Checklist

### Pre-Migration

- [ ] Audit existing Zod schemas
- [ ] Identify high-traffic validation paths
- [ ] Set up performance monitoring
- [ ] Create migration test suite

### During Migration

- [ ] Choose appropriate performance tier
- [ ] Update imports and schema definitions
- [ ] Run comprehensive tests
- [ ] Benchmark performance improvements
- [ ] Monitor for any issues

### Post-Migration

- [ ] Measure performance improvements
- [ ] Update documentation
- [ ] Train team on new patterns
- [ ] Monitor production metrics
- [ ] Plan next migration phases

## 🚀 Next Steps

After successful migration:

1. **Optimize further**: Identify bottlenecks and apply Ultra tier
2. **Monitor performance**: Set up alerting for performance regressions
3. **Share learnings**: Document lessons learned for future migrations
4. **Expand usage**: Apply Fast-Schema to new validation scenarios

## 💡 Tips for Success

### DO:
- Start with drop-in replacement for safety
- Benchmark before and after migration
- Use batch processing for large datasets
- Pre-compile schemas for maximum performance
- Test thoroughly in staging environment

### DON'T:
- Migrate everything at once
- Skip performance testing
- Ignore type safety
- Forget to update documentation
- Deploy without monitoring

---

**Ready to migrate?** Start with our [examples](../examples/) and [benchmarks](./benchmarks.md) to see Fast-Schema in action!

*Migration guide last updated: 2024 | For Fast-Schema v0.1.0+*