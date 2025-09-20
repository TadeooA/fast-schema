# Performance Optimization Guide

This comprehensive guide covers all performance optimization techniques available in Fast-Schema, from basic optimizations to advanced WASM integration.

## Table of Contents

- [Performance Overview](#performance-overview)
- [JIT Compilation](#jit-compilation)
- [Caching Strategies](#caching-strategies)
- [Batch Processing](#batch-processing)
- [WASM Optimization](#wasm-optimization)
- [Memory Management](#memory-management)
- [Benchmarking](#benchmarking)
- [Best Practices](#best-practices)

## Performance Overview

Fast-Schema provides multiple layers of optimization:

1. **JIT Compilation** - Schema compilation for repeated use
2. **Intelligent Caching** - Regex patterns, schemas, and validation objects
3. **Batch Processing** - Efficient validation of large datasets
4. **WASM Integration** - Native performance for complex validations
5. **Memory Pooling** - Reduced garbage collection overhead

### Performance Characteristics

| Operation | Cold Start | Warmed Up | WASM Enabled |
|-----------|------------|-----------|--------------|
| Simple validation | 0.01ms | 0.005ms | 0.003ms |
| Complex object | 0.5ms | 0.1ms | 0.02ms |
| Large array (1000 items) | 50ms | 10ms | 1ms |
| Deep nesting (5 levels) | 2ms | 0.5ms | 0.1ms |

## JIT Compilation

JIT (Just-In-Time) compilation optimizes schemas for repeated use by pre-compiling validation logic.

### Basic JIT Usage

```typescript
import { z } from 'fast-schema';

const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(0).max(120),
  preferences: z.object({
    theme: z.string(),
    notifications: z.boolean()
  })
});

// Compile schema for better performance
const jitSchema = z.jit(userSchema);

// First validation triggers compilation
const result1 = jitSchema.parse(userData); // ~0.5ms

// Subsequent validations use compiled version
const result2 = jitSchema.parse(userData); // ~0.1ms
const result3 = jitSchema.parse(userData); // ~0.1ms
```

### JIT Performance Analysis

```typescript
// Get compilation statistics
const stats = jitSchema.getStats();
console.log(stats);
// Output: {
//   cached: true,
//   compilationKey: "obj_name_str_email_str_age_num...",
//   cacheSize: 15
// }

// Benchmark JIT vs regular validation
const measureValidation = (schema, data, iterations = 1000) => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    schema.parse(data);
  }
  return (performance.now() - start) / iterations;
};

const regularTime = measureValidation(userSchema, userData);
const jitTime = measureValidation(jitSchema, userData);

console.log(`Regular: ${regularTime.toFixed(3)}ms`);
console.log(`JIT: ${jitTime.toFixed(3)}ms`);
console.log(`Improvement: ${(regularTime / jitTime).toFixed(1)}x`);
```

### When to Use JIT

JIT compilation is most beneficial for:

- **Repeated validations** of the same schema
- **Complex schemas** with deep nesting
- **High-frequency validations** in servers or workers
- **Schemas with many constraints** (string patterns, number ranges)

```typescript
// Good candidates for JIT
const complexApiSchema = z.jit(z.object({
  request: z.object({
    headers: z.object({
      authorization: z.string().regex(/^Bearer\s+.+$/),
      contentType: z.string(),
      userAgent: z.string().optional()
    }),
    body: z.object({
      data: z.array(z.object({
        id: z.string().uuid(),
        type: z.enum(['create', 'update', 'delete']),
        payload: z.record(z.any())
      }))
    })
  })
}));

// Use in request handler
app.post('/api/bulk', (req, res) => {
  const validation = complexApiSchema.safeParse(req);
  if (!validation.success) {
    return res.status(400).json(validation.error);
  }
  // Process validated data...
});
```

## Caching Strategies

Fast-Schema implements multiple caching layers for optimal performance.

### Regex Pattern Caching

```typescript
import { RegexCache } from 'fast-schema';

// Patterns are automatically cached
const emailSchema1 = z.string().email();
const emailSchema2 = z.string().email();
// Both schemas share the same cached regex pattern

// Manual cache management
console.log(`Cached patterns: ${RegexCache.size()}`);

// Get specific pattern (creates if doesn't exist)
const pattern = RegexCache.get('^[a-z]+$', 'i');

// Clear cache when needed (e.g., memory management)
RegexCache.clear();
```

### Schema Compilation Caching

```typescript
import { SchemaCache } from 'fast-schema';

// Compiled schemas are cached by structure
const schema1 = z.jit(z.object({ name: z.string() }));
const schema2 = z.jit(z.object({ name: z.string() }));
// Second schema reuses compilation from first

// Check cache status
console.log(`Compiled schemas: ${SchemaCache.size()}`);

// Manual cache control
SchemaCache.clear(); // Clear all compiled schemas

// Custom cache keys for complex scenarios
const customKey = 'user_validation_v2';
SchemaCache.set(customKey, compiledValidator);
```

### Validation Object Pooling

```typescript
import { ValidationPool } from 'fast-schema';

// Objects are automatically pooled to reduce GC pressure
// This happens internally, but you can control it:

// Check pool status
console.log('Error pool size:', ValidationPool.errorPoolSize);
console.log('Issue pool size:', ValidationPool.issuePoolSize);

// Manual pool management (advanced usage)
ValidationPool.clear(); // Clear all pools

// In high-frequency scenarios, pre-warm pools
for (let i = 0; i < 100; i++) {
  ValidationPool.releaseError(ValidationPool.getError());
  ValidationPool.releaseIssue(ValidationPool.getIssue());
}
```

## Batch Processing

Efficient validation of large datasets using optimized batch operations.

### Basic Batch Validation

```typescript
const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  price: z.number().min(0)
});

const batchValidator = z.batch(itemSchema);

// Validate large dataset
const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  category: 'electronics',
  price: Math.random() * 1000
}));

const results = batchValidator.validate(items);

// Process results efficiently
const validItems = results
  .filter(r => r.success)
  .map(r => r.data);

const errors = results
  .filter(r => !r.success)
  .map((r, index) => ({ index, error: r.error }));

console.log(`Valid: ${validItems.length}, Errors: ${errors.length}`);
```

### Advanced Batch Processing

```typescript
// Custom batch configuration
const batchValidator = z.batch(itemSchema, {
  batchSize: 1000,        // Process in chunks
  parallel: true,         // Use multiple threads if available
  earlyExit: false,       // Continue processing after first error
  includeIndex: true      // Include item index in results
});

// Streaming validation for very large datasets
import { StreamingValidator } from 'fast-schema';

const streamingValidator = new StreamingValidator(itemSchema, {
  batchSize: 500,
  maxQueueSize: 5000,
  onBatch: (results) => {
    // Process each batch as it completes
    console.log(`Processed batch: ${results.length} items`);
  },
  onComplete: (summary) => {
    console.log(`Total: ${summary.total}, Valid: ${summary.valid}`);
  }
});

// Add items to stream
for (const item of largeDataset) {
  streamingValidator.add(item);
}

await streamingValidator.flush();
```

### Memory-Efficient Batch Processing

```typescript
// For very large datasets that don't fit in memory
const processLargeFile = async (filename: string) => {
  const validator = z.batch(itemSchema);
  const batchSize = 1000;
  let processed = 0;

  const stream = fs.createReadStream(filename, { encoding: 'utf8' });
  const lineReader = readline.createInterface({ input: stream });

  let batch: any[] = [];

  for await (const line of lineReader) {
    batch.push(JSON.parse(line));

    if (batch.length >= batchSize) {
      const results = validator.validate(batch);
      processed += results.filter(r => r.success).length;
      batch = []; // Clear batch for garbage collection
    }
  }

  // Process remaining items
  if (batch.length > 0) {
    const results = validator.validate(batch);
    processed += results.filter(r => r.success).length;
  }

  console.log(`Processed ${processed} valid items`);
};
```

## WASM Optimization

Leverage WASM for maximum performance in complex validation scenarios.

### Automatic WASM Usage

```typescript
// WASM is automatically used for complex schemas
const complexSchema = z.object({
  users: z.array(z.object({
    profile: z.object({
      personal: z.object({
        name: z.string().min(2).max(50),
        email: z.string().email(),
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/)
      }),
      professional: z.object({
        title: z.string(),
        company: z.string(),
        experience: z.number().min(0).max(50)
      })
    }),
    permissions: z.array(z.string()),
    metadata: z.object({
      created: z.string().datetime(),
      updated: z.string().datetime(),
      version: z.number()
    })
  })).min(1).max(1000)
});

// This automatically uses WASM when available
const result = complexSchema.parse(complexData);
```

### Manual WASM Optimization

```typescript
// Force WASM usage for specific schemas
const wasmOptimizedSchema = z.wasm.optimize(baseSchema);

// Or create hybrid schema with custom configuration
const hybridSchema = z.wasm.hybridize(baseSchema);

// Control WASM usage
hybridSchema.forceWasm();      // Always use WASM
hybridSchema.forceTypeScript(); // Always use TypeScript

// Get performance information
const perfInfo = hybridSchema.getPerformanceInfo();
console.log(perfInfo);
```

### Ultra-Fast WASM Validation

```typescript
import { WasmUltraFastValidator } from 'fast-schema';

// For extreme performance with primitive types
const stringValidator = new WasmUltraFastValidator('string', {
  minLength: 2,
  maxLength: 100,
  pattern: '^[a-zA-Z0-9_]+$'
});

const values = Array.from({ length: 100000 }, (_, i) => `value_${i}`);

const { results, stats } = stringValidator.validateBatch(values);

console.log(`Validated ${stats.totalCount} items in ${stats.performanceUs}μs`);
console.log(`Throughput: ${stats.throughputPerSecond.toLocaleString()} items/second`);
```

## Memory Management

Optimize memory usage for long-running applications and large datasets.

### Memory Monitoring

```typescript
// Monitor memory usage
const getMemoryUsage = () => {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024)
    };
  }
  return null;
};

console.log('Memory before validation:', getMemoryUsage());

// Perform large validation
const results = batchValidator.validate(largeDataset);

console.log('Memory after validation:', getMemoryUsage());
```

### Cache Management

```typescript
// Periodic cache cleanup for long-running applications
setInterval(() => {
  const regexCacheSize = RegexCache.size();
  const schemaCacheSize = SchemaCache.size();

  // Clear caches if they grow too large
  if (regexCacheSize > 1000) {
    RegexCache.clear();
    console.log('Cleared regex cache');
  }

  if (schemaCacheSize > 500) {
    SchemaCache.clear();
    console.log('Cleared schema cache');
  }

  // Clear validation pools
  ValidationPool.clear();

}, 60000); // Every minute
```

### Memory-Efficient Patterns

```typescript
// Avoid creating new schemas in loops
const schema = z.string(); // Create once

// Good: Reuse schema
for (const item of items) {
  schema.parse(item);
}

// Bad: Creates new schema each iteration
for (const item of items) {
  z.string().parse(item); // Creates new schema each time
}

// Use batch processing for large datasets
const batchValidator = z.batch(schema);
const results = batchValidator.validate(items); // More memory efficient

// Clear references to large objects after processing
let largeResults = batchValidator.validate(largeDataset);
processResults(largeResults);
largeResults = null; // Allow garbage collection
```

## Benchmarking

Comprehensive benchmarking tools to measure and optimize performance.

### Built-in Benchmarking

```typescript
// Benchmark schema performance
const benchmarkSchema = async (schema: any, testData: any[], iterations = 1000) => {
  const results = await z.wasm.benchmark(schema, testData, iterations);

  console.log('Benchmark Results:');
  console.log(`WASM: ${results.wasmResults.averageTime.toFixed(3)}ms`);
  console.log(`TypeScript: ${results.typeScriptResults.averageTime.toFixed(3)}ms`);
  console.log(`WASM Throughput: ${results.wasmResults.throughput.toLocaleString()} items/sec`);
  console.log(`TypeScript Throughput: ${results.typeScriptResults.throughput.toLocaleString()} items/sec`);
  console.log(`Recommendation: ${results.recommendation}`);

  return results;
};

// Test different schema complexities
const simpleSchema = z.string();
const complexSchema = z.object({
  /* complex structure */
});

await benchmarkSchema(simpleSchema, ['test'], 10000);
await benchmarkSchema(complexSchema, [complexData], 1000);
```

### Custom Performance Testing

```typescript
// Create custom benchmark suite
class PerformanceSuite {
  private results: Map<string, number[]> = new Map();

  async benchmark(name: string, fn: () => void, iterations = 1000) {
    const times: number[] = [];

    // Warm up
    for (let i = 0; i < 10; i++) {
      fn();
    }

    // Measure
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      times.push(performance.now() - start);
    }

    this.results.set(name, times);
    return this.getStats(times);
  }

  private getStats(times: number[]) {
    const sorted = times.sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: times.reduce((a, b) => a + b) / times.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  compare(baseline: string, candidate: string) {
    const baselineTimes = this.results.get(baseline);
    const candidateTimes = this.results.get(candidate);

    if (!baselineTimes || !candidateTimes) return null;

    const baselineAvg = baselineTimes.reduce((a, b) => a + b) / baselineTimes.length;
    const candidateAvg = candidateTimes.reduce((a, b) => a + b) / candidateTimes.length;

    return {
      improvement: baselineAvg / candidateAvg,
      speedup: `${((baselineAvg / candidateAvg - 1) * 100).toFixed(1)}%`
    };
  }
}

// Usage
const suite = new PerformanceSuite();

await suite.benchmark('regular', () => schema.parse(data));
await suite.benchmark('jit', () => jitSchema.parse(data));
await suite.benchmark('wasm', () => wasmSchema.parse(data));

console.log(suite.compare('regular', 'jit'));
console.log(suite.compare('regular', 'wasm'));
```

### Regression Testing

```typescript
// Set up performance regression tests
const performanceBaselines = {
  simpleString: 0.01,    // 0.01ms baseline
  complexObject: 0.5,    // 0.5ms baseline
  largeArray: 10,        // 10ms baseline
  deepNesting: 2         // 2ms baseline
};

const checkPerformanceRegression = async () => {
  const results = {};

  // Test simple string validation
  const stringTime = await measureTime(() => {
    for (let i = 0; i < 1000; i++) {
      z.string().parse('test');
    }
  }) / 1000;

  results.simpleString = stringTime;

  // Test complex object validation
  const objectTime = await measureTime(() => {
    for (let i = 0; i < 100; i++) {
      complexSchema.parse(complexData);
    }
  }) / 100;

  results.complexObject = objectTime;

  // Check against baselines
  for (const [test, baseline] of Object.entries(performanceBaselines)) {
    const actual = results[test];
    const regression = actual / baseline;

    if (regression > 1.5) {
      console.warn(`⚠️ Performance regression in ${test}: ${regression.toFixed(2)}x slower`);
    } else if (regression < 0.8) {
      console.log(`🚀 Performance improvement in ${test}: ${(1/regression).toFixed(2)}x faster`);
    } else {
      console.log(`✅ ${test}: ${actual.toFixed(3)}ms (within baseline)`);
    }
  }
};

const measureTime = async (fn: () => void): Promise<number> => {
  const start = performance.now();
  fn();
  return performance.now() - start;
};
```

## Best Practices

### Schema Design for Performance

```typescript
// 1. Use specific types instead of unions when possible
// Good
const statusSchema = z.enum(['active', 'inactive', 'pending']);

// Less optimal
const statusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('pending')
]);

// 2. Place most common validations first in unions
const idSchema = z.union([
  z.string().uuid(),    // Most common case first
  z.number().int(),     // Less common
  z.string().nanoid()   // Least common
]);

// 3. Use discriminated unions for complex polymorphic data
const shapeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('circle'), radius: z.number() }),
  z.object({ type: z.literal('rectangle'), width: z.number(), height: z.number() })
]);
```

### Caching Strategy

```typescript
// 1. Create schemas once, reuse many times
const schemas = {
  user: z.object({ name: z.string(), email: z.string().email() }),
  product: z.object({ id: z.string(), price: z.number() }),
  order: z.object({ userId: z.string(), items: z.array(z.string()) })
};

// 2. Use JIT for frequently used schemas
const frequentSchemas = {
  apiRequest: z.jit(schemas.user),
  dbRecord: z.jit(schemas.product)
};

// 3. Batch process when possible
const userValidator = z.batch(schemas.user);
```

### Memory Management

```typescript
// 1. Monitor and limit cache sizes
const MAX_CACHE_SIZE = 1000;

setInterval(() => {
  if (RegexCache.size() > MAX_CACHE_SIZE) {
    RegexCache.clear();
  }
}, 300000); // Every 5 minutes

// 2. Use streaming for large datasets
const processLargeDataStream = async (dataStream) => {
  const validator = new StreamingValidator(schema, {
    batchSize: 1000,
    onBatch: processBatch
  });

  for await (const item of dataStream) {
    validator.add(item);
  }

  await validator.flush();
};

// 3. Clear references after processing
let results = batchValidator.validate(data);
await processResults(results);
results = null; // Allow GC
```

### WASM Integration

```typescript
// 1. Let the system auto-optimize
const schema = z.object(/* complex schema */);
// System automatically uses WASM when beneficial

// 2. Use explicit optimization for critical paths
const criticalSchema = z.wasm.optimize(schema);

// 3. Monitor WASM performance
const metrics = z.wasm.getMetrics();
if (metrics && metrics.wasmValidations > 0) {
  console.log(`WASM usage: ${metrics.wasmValidations} / ${metrics.totalValidations}`);
}
```

### Development vs Production

```typescript
// Development: Enable detailed metrics
if (process.env.NODE_ENV === 'development') {
  z.wasm.configure({
    enableMetrics: true,
    performanceThresholds: {
      minDataSize: 0,        // Use WASM for everything to test
      complexityThreshold: 0,
      batchSizeThreshold: 0
    }
  });
}

// Production: Optimize for real workload
if (process.env.NODE_ENV === 'production') {
  z.wasm.configure({
    enableMetrics: false,     // Reduce overhead
    performanceThresholds: {
      minDataSize: 100,       // Realistic thresholds
      complexityThreshold: 5,
      batchSizeThreshold: 50
    }
  });

  // Set up periodic cache cleanup
  setInterval(() => {
    RegexCache.clear();
    SchemaCache.clear();
    ValidationPool.clear();
  }, 3600000); // Every hour
}
```

For more detailed information, see [WASM Integration Guide](./wasm-integration.md) and [API Reference](./api-reference.md).