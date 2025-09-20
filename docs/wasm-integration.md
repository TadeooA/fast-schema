# WASM Integration Guide

Fast-Schema features a hybrid WASM+TypeScript architecture that provides unprecedented validation performance while maintaining full TypeScript compatibility and graceful fallback.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Hybrid Validation](#hybrid-validation)
- [Performance Optimization](#performance-optimization)
- [Configuration](#configuration)
- [Benchmarking](#benchmarking)
- [Troubleshooting](#troubleshooting)

## Overview

The WASM integration provides:

- **10-100x performance improvement** for complex validations
- **Automatic fallback** to TypeScript when WASM is unavailable
- **Zero API changes** - same interface as pure TypeScript
- **Smart optimization** - automatically chooses the best validation method
- **Memory efficient** - optimized for large datasets

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   TypeScript    │    │   Hybrid Engine  │    │   Rust WASM    │
│   Validation    │◄──►│                  │◄──►│   Validation   │
│   (Fallback)    │    │   Auto-Selection │    │   (Performance) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Getting Started

### Installation

```bash
npm install fast-schema
```

### Basic Usage

The WASM integration is completely transparent - just use the regular API:

```typescript
import { z } from 'fast-schema';

// This automatically uses WASM when available
const schema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email()
});

const result = schema.parse(userData);
```

### Checking WASM Availability

```typescript
import { z, FastSchemaWasm } from 'fast-schema';

// Check if WASM is available
console.log('WASM Available:', z.wasm.isAvailable());
console.log('WASM Available:', FastSchemaWasm.isAvailable());

// Test WASM integration
const testResult = await z.wasm.test();
console.log('WASM Test:', testResult);
// Output: { wasmAvailable: true, wasmWorking: true, performanceGain: 85.2 }
```

## Hybrid Validation

### Automatic Hybridization

Schemas are automatically optimized based on complexity and data size:

```typescript
const complexSchema = z.object({
  users: z.array(z.object({
    profile: z.object({
      personal: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        age: z.number().min(18)
      }),
      preferences: z.object({
        notifications: z.boolean(),
        theme: z.string()
      })
    })
  }))
});

// Automatically uses WASM for complex validations
const result = complexSchema.parse(largeDataset);
```

### Manual Hybridization

Force WASM usage for specific schemas:

```typescript
// Create hybrid schema explicitly
const hybridSchema = z.wasm.hybridize(baseSchema);

// Or use optimization
const optimizedSchema = z.wasm.optimize(baseSchema);

// Access performance information
const perfInfo = hybridSchema.getPerformanceInfo();
console.log(perfInfo);
// Output: {
//   wasmAvailable: true,
//   wasmStats: { compiledComplexity: 15, cacheHits: 42 },
//   hybridMetrics: { wasmValidations: 100, typeScriptValidations: 5 }
// }
```

### FastSchemaWasm API

```typescript
import { FastSchemaWasm } from 'fast-schema';

// Different optimization levels
const basicSchema = FastSchemaWasm.z.string();
const fastSchema = FastSchemaWasm.fast.string();
const smartSchema = FastSchemaWasm.smart.string();
const optimizedSchema = FastSchemaWasm.optimized.string();

// Each provides different optimization strategies
```

### Fallback Behavior

The system gracefully falls back to TypeScript when needed:

```typescript
const schema = z.wasm.hybridize(baseSchema);

// If WASM fails, automatically uses TypeScript
try {
  const result = schema.parse(data);
  // Works regardless of WASM availability
} catch (error) {
  // Same error handling for both WASM and TypeScript
}
```

## Performance Optimization

### Batch Validation

WASM excels at batch processing:

```typescript
const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
  metadata: z.object({
    tags: z.array(z.string()),
    created: z.string()
  })
});

const hybridSchema = z.wasm.hybridize(itemSchema);

// Batch validate large datasets
const items = Array.from({ length: 10000 }, createTestItem);

if (hybridSchema.validateMany) {
  // Use WASM batch validation if available
  const results = hybridSchema.validateMany(items);
} else {
  // Fallback to individual validation
  const results = items.map(item => hybridSchema.safeParse(item));
}
```

### Ultra-Fast Primitive Validation

For primitive types with extreme performance requirements:

```typescript
import { WasmUltraFastValidator } from 'fast-schema';

// Create ultra-fast validator for specific types
const stringValidator = new WasmUltraFastValidator('string', {
  minLength: 2,
  maxLength: 100
});

const values = ['hello', 'world', 'test', 'invalid_value_123'];
const { results, stats } = stringValidator.validateBatch(values);

console.log(stats);
// Output: {
//   validCount: 3,
//   totalCount: 4,
//   performanceUs: 23.5,
//   throughputPerSecond: 170212
// }
```

### Memory Management

```typescript
// Reset caches when needed
z.wasm.resetCaches();
FastSchemaWasm.resetCaches();

// Get memory information
const memInfo = hybridSchema.getMemoryInfo();
console.log(memInfo);
// Output: {
//   regexCacheSize: 15,
//   estimatedComplexity: 42,
//   maxDepth: 4
// }
```

## Configuration

### Hybrid Engine Configuration

```typescript
// Configure the hybrid validation engine
z.wasm.configure({
  preferWasm: true,              // Prefer WASM when available
  autoFallback: true,            // Automatically fallback on errors
  performanceThresholds: {
    minDataSize: 100,            // Minimum data size for WASM
    complexityThreshold: 5,      // Schema complexity threshold
    batchSizeThreshold: 50       // Minimum batch size for WASM
  },
  enableMetrics: true,           // Collect performance metrics
  wasmInitTimeout: 5000          // WASM initialization timeout (ms)
});
```

### Per-Schema Configuration

```typescript
import { createHybridEngine } from 'fast-schema';

// Create custom hybrid engine
const customEngine = createHybridEngine({
  preferWasm: true,
  performanceThresholds: {
    minDataSize: 50,             // Lower threshold for this engine
    complexityThreshold: 3,
    batchSizeThreshold: 25
  }
});

// Use custom engine for specific schemas
const hybridSchema = customEngine.createHybridSchema(baseSchema);
```

### Auto-Optimization

The system learns from usage patterns:

```typescript
import { AutoOptimizer } from 'fast-schema';

// System automatically learns optimal validation methods
const optimizedSchema = AutoOptimizer.getOptimizedSchema(baseSchema);

// View learning data
const learningData = AutoOptimizer.getLearningData();
console.log(learningData);

// Clear learning data if needed
AutoOptimizer.clearLearningData();
```

## Benchmarking

### Built-in Benchmarking

```typescript
const schema = z.object({
  data: z.array(z.object({
    id: z.number(),
    value: z.string(),
    metadata: z.object({
      tags: z.array(z.string())
    })
  }))
});

// Generate test data
const testData = Array.from({ length: 1000 }, generateTestItem);

// Run benchmark
const benchmark = await z.wasm.benchmark(schema, [testData], 100);

console.log(benchmark);
// Output: {
//   wasmResults: { averageTime: 2.3, throughput: 43478 },
//   typeScriptResults: { averageTime: 12.7, throughput: 7874 },
//   recommendation: 'wasm'
// }
```

### Performance Monitoring

```typescript
// Get real-time metrics
const metrics = z.wasm.getMetrics();
console.log(metrics);
// Output: {
//   totalValidations: 1542,
//   wasmValidations: 1398,
//   typeScriptValidations: 144,
//   wasmErrors: 2,
//   averageWasmTime: 1.8,
//   averageTypeScriptTime: 8.4,
//   lastUpdated: "2023-10-15T14:30:22.123Z"
// }

// Reset metrics
FastSchemaWasm.clearLearningData();
```

### Custom Performance Tests

```typescript
import { HybridPerformanceBenchmark } from 'fast-schema';

const benchmark = new HybridPerformanceBenchmark();

const results = await benchmark.benchmark(
  schema,
  testDataArray,
  iterations = 1000
);

console.log(`WASM: ${results.wasmResults.averageTime}ms`);
console.log(`TypeScript: ${results.typeScriptResults.averageTime}ms`);
console.log(`Recommendation: ${results.recommendation}`);
```

## Troubleshooting

### Common Issues

#### WASM Module Not Loading

```typescript
// Check WASM availability
const testResult = await z.wasm.test();

if (!testResult.wasmAvailable) {
  console.log('WASM Error:', testResult.error);
  // Possible causes:
  // - WASM module not built
  // - Module loading timeout
  // - Browser doesn't support WASM
  // - Network issues in browser environment
}
```

#### Performance Not Improving

```typescript
// Check if WASM is actually being used
const hybridSchema = z.wasm.hybridize(schema);

const perfInfo = hybridSchema.getPerformanceInfo();
if (!perfInfo.wasmAvailable) {
  console.log('WASM not being used - check thresholds');

  // Adjust thresholds
  z.wasm.configure({
    performanceThresholds: {
      minDataSize: 10,         // Lower threshold
      complexityThreshold: 1,  // Lower threshold
      batchSizeThreshold: 5    // Lower threshold
    }
  });
}
```

#### Memory Issues

```typescript
// Monitor memory usage
const memInfo = hybridSchema.getMemoryInfo();
console.log('Memory usage:', memInfo);

// Reset caches if memory usage is high
if (memInfo.regexCacheSize > 1000) {
  z.wasm.resetCaches();
}

// Use batch processing for large datasets
const batchProcessor = new WasmBatchProcessor(schema, 1000);
const results = batchProcessor.validateDataset(largeDataset);
```

### Debugging WASM Integration

```typescript
// Enable debug mode
z.wasm.configure({
  enableMetrics: true,
  performanceThresholds: {
    minDataSize: 0,  // Force WASM usage for debugging
    complexityThreshold: 0,
    batchSizeThreshold: 0
  }
});

// Test WASM integration step by step
const integrationTest = await z.wasm.test();
console.log('Integration Test:', integrationTest);

// Check metrics after validation
const schema = z.wasm.hybridize(z.string());
schema.parse('test');

const metrics = z.wasm.getMetrics();
console.log('After validation:', metrics);
```

### Browser vs Node.js

#### Browser Environment

```typescript
// In browsers, WASM loading is asynchronous
import { waitForWasm } from 'fast-schema/utils';

// Wait for WASM to initialize
const wasmReady = await waitForWasm(5000); // 5 second timeout

if (wasmReady) {
  // WASM is available
  const hybridSchema = z.wasm.hybridize(schema);
} else {
  // Use TypeScript only
  console.log('Using TypeScript fallback');
}
```

#### Node.js Environment

```typescript
// In Node.js, check for WASM module availability
try {
  const wasmModule = require('fast-schema-wasm');
  console.log('WASM module loaded');
} catch (error) {
  console.log('WASM module not available:', error.message);
  // Ensure the package includes the WASM build
}
```

### Performance Expectations

| Scenario | TypeScript | WASM | Improvement |
|----------|------------|------|-------------|
| Simple string validation | 0.01ms | 0.01ms | ~1x |
| Complex object validation | 0.5ms | 0.1ms | ~5x |
| Large array validation | 10ms | 1ms | ~10x |
| Batch validation (1000 items) | 100ms | 5ms | ~20x |
| Very complex nested schemas | 50ms | 2ms | ~25x |

### Best Practices

1. **Let the system auto-optimize** - don't force WASM unless needed
2. **Use batch validation** for large datasets
3. **Monitor performance metrics** to understand usage patterns
4. **Configure thresholds** based on your specific use cases
5. **Handle fallback gracefully** - ensure your app works without WASM
6. **Reset caches periodically** in long-running applications
7. **Test WASM integration** in your deployment environment

For more advanced usage patterns, see the [Performance Guide](./performance-guide.md) and [API Reference](./api-reference.md).