# 📚 Fast-Schema Examples

This directory contains comprehensive examples demonstrating Fast-Schema's capabilities and performance advantages.

## 🏃‍♂️ Quick Start Examples

### [`basic-usage.ts`](./basic-usage.ts)
Learn the fundamentals of Fast-Schema validation.

**What you'll learn:**
- String, number, and boolean validation
- Object and array validation
- Email and UUID validation
- Type inference with TypeScript
- Error handling patterns
- Safe parsing (no exceptions)

**Run it:**
```bash
npx ts-node examples/basic-usage.ts
```

## ⚡ Performance Examples

### [`performance-tiers.ts`](./performance-tiers.ts)
Explore Fast-Schema's three performance tiers with live benchmarks.

**What you'll learn:**
- NORMAL tier (1x baseline, Zod-compatible)
- FAST tier (10x faster, production-ready)
- ULTRA tier (100x faster, maximum throughput)
- Automatic tier selection
- Performance monitoring
- WASM acceleration

**Performance results:**
- **NORMAL**: Development-friendly baseline
- **FAST**: 5-15x faster with WASM acceleration
- **ULTRA**: 50-400x faster with pre-compilation

**Run it:**
```bash
npx ts-node examples/performance-tiers.ts
```

### [`batch-processing.ts`](./batch-processing.ts)
High-performance validation for large datasets.

**What you'll learn:**
- CSV data processing (1M+ records)
- Stream processing with memory management
- Parallel batch processing
- Error handling in batch operations
- Performance comparison: individual vs batch

**Performance highlights:**
- Process 1M+ records efficiently
- Memory-efficient streaming
- 10-20x faster than individual validation
- Parallel processing for multi-core utilization

**Run it:**
```bash
npx ts-node examples/batch-processing.ts
```

## 🎮 Real-World Examples

### [`api-validation.ts`](./api-validation.ts)
Production-ready API validation examples.

**What you'll learn:**
- User registration validation
- E-commerce product schemas
- Order processing (high-performance)
- Search and filter APIs
- Webhook event validation
- Express.js middleware patterns

**Use cases:**
- REST API endpoints
- Real-time validation
- E-commerce systems
- Webhook processing
- Form validation

**Run it:**
```bash
npx ts-node examples/api-validation.ts
```

## 🔄 Migration Examples

### [`migration-example.ts`](./migration-example.ts)
Complete step-by-step migration from Zod to Fast-Schema.

**What you'll learn:**
- Drop-in replacement strategy
- Performance-optimized migration
- All three tier comparisons
- Batch processing migration
- Type safety verification
- Performance benchmarking

**Migration paths:**
1. **Drop-in replacement**: Zero code changes
2. **Performance-optimized**: 5-15x improvements
3. **Maximum performance**: 50-400x improvements

**Run it:**
```bash
npx ts-node examples/migration-example.ts
```

## 📊 Example Output Samples

### Performance Comparison Results
```
🚀 ZOD vs FAST-SCHEMA: ULTIMATE PERFORMANCE SHOWDOWN
====================================================

📊 String Email Validation:
   Zod:         36.40ms (2,747,509 ops/sec)
   Fast-Schema: 10.37ms (9,639,298 ops/sec)
   🚀 Result:   3.5x faster | 250.8% improvement

📊 Complex Object Validation:
   Zod:         141.37ms (353,680 ops/sec)
   Fast-Schema: 13.89ms (3,599,064 ops/sec)
   🚀 Result:   10.2x faster | 917.6% improvement

📊 Large Array Processing:
   Zod:         1226.42ms (815,379 ops/sec)
   Fast-Schema: 57.94ms (17,258,995 ops/sec)
   🚀 Result:   21.2x faster | 2016.7% improvement

🎯 OVERALL PERFORMANCE ANALYSIS:
   Average speedup: 11.0x faster than Zod
   Maximum speedup: 21.2x faster than Zod
   Consistency: Excellent (all tests > 2x faster)
```

### Batch Processing Results
```
📦 ULTRA Batch Processing
   ✅ 1,000 records processed in 2.45ms
   📈 Batch throughput: 408,163 records/sec
   🚀 Efficiency: 12.3x faster than individual parsing
```

## 🛠️ Running Examples

### Prerequisites
```bash
# Clone the repository
git clone https://github.com/TadeooA/fast-schema.git
cd fast-schema

# Install dependencies
npm install

# Build the project
npm run build
```

### Run Individual Examples
```bash
# Basic usage
npx ts-node examples/basic-usage.ts

# Performance tiers
npx ts-node examples/performance-tiers.ts

# API validation
npx ts-node examples/api-validation.ts

# Batch processing
npx ts-node examples/batch-processing.ts

# Migration example
npx ts-node examples/migration-example.ts
```

## 📈 Performance Expectations

Based on our benchmarks, you can expect these performance improvements:

| Scenario | Zod Baseline | Fast-Schema Normal | Fast-Schema Fast | Fast-Schema Ultra |
|----------|--------------|-------------------|------------------|-------------------|
| **Development** | 1x | 1x (compatible) | 2-3x faster | 5-10x faster |
| **Production API** | 1x | 1-2x faster | 5-15x faster | 20-50x faster |
| **Batch Processing** | 1x | 2-3x faster | 10-20x faster | 50-200x faster |
| **High-throughput** | 1x | 3-5x faster | 15-50x faster | 100-400x faster |

## 🎯 Choosing Examples by Use Case

### I'm new to validation libraries
👉 Start with [`basic-usage.ts`](./basic-usage.ts)

### I want to see performance improvements
👉 Check out [`performance-tiers.ts`](./performance-tiers.ts)

### I'm migrating from Zod
👉 Follow [`migration-example.ts`](./migration-example.ts)

### I need to validate API requests
👉 Study [`api-validation.ts`](./api-validation.ts)

### I'm processing large datasets
👉 Explore [`batch-processing.ts`](./batch-processing.ts)

## 🔗 Additional Resources

- **[Main README](../README.md)**: Project overview and installation
- **[Migration Guide](../docs/migration-guide.md)**: Detailed migration instructions
- **[Benchmark Results](../docs/benchmarks.md)**: Comprehensive performance analysis

## 💡 Tips for Success

### Performance Optimization
1. **Choose the right tier** for your use case
2. **Use batch processing** for large datasets
3. **Pre-compile schemas** for maximum performance
4. **Enable WASM** acceleration when available

### Best Practices
1. **Start with NORMAL tier** for development
2. **Upgrade to FAST tier** for production
3. **Use ULTRA tier** for high-throughput scenarios
4. **Monitor performance** in production

### Common Patterns
1. **API validation**: Use FAST tier with middleware
2. **Batch processing**: Use ULTRA tier with batch processors
3. **Real-time systems**: Use ULTRA tier with pre-compilation
4. **Development**: Use NORMAL tier for debugging

## 🚀 Next Steps

After exploring these examples:

1. **Choose your migration strategy** based on performance needs
2. **Run benchmarks** with your own data
3. **Implement in a test environment** first
4. **Monitor performance gains** in production
5. **Scale up** to higher performance tiers as needed

---

**Ready to achieve 10-100x performance improvements?** Start with the examples that match your use case! 🔥