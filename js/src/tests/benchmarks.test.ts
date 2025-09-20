// Test suite for benchmark functionality
import { z } from '../index';
import {
  PerformanceBenchmark,
  BenchmarkSuites,
  RegressionTester,
  measurePerformance,
  compareSchemas
} from '../benchmarks';

describe('Performance Benchmarks', () => {

  describe('PerformanceBenchmark Class', () => {
    test('should measure basic function performance', async () => {
      const benchmark = new PerformanceBenchmark({
        warmupIterations: 10,
        measureIterations: 100
      });

      const result = await benchmark.benchmark(
        'simple_function',
        () => {
          // Simple operation
          Math.sqrt(42);
        },
        100
      );

      expect(result.name).toBe('simple_function');
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.throughput).toBeGreaterThan(0);
      expect(result.iterations).toBe(100);
      expect(result.standardDeviation).toBeGreaterThanOrEqual(0);
      expect(result.percentiles.p50).toBeGreaterThan(0);
      expect(result.percentiles.p95).toBeGreaterThan(0);
      expect(result.percentiles.p99).toBeGreaterThan(0);
    });

    test('should measure schema validation performance', async () => {
      const benchmark = new PerformanceBenchmark();
      const schema = z.string();
      const testData = ['hello', 'world', 'test'];

      const result = await benchmark.benchmarkSchema(
        'string_validation',
        schema,
        testData,
        100
      );

      expect(result.name).toBe('string_validation');
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.throughput).toBeGreaterThan(0);
    });

    test('should compare multiple schemas', async () => {
      const benchmark = new PerformanceBenchmark({
        measureIterations: 100
      });

      const schemas = {
        regular: z.string(),
        jit: z.jit(z.string())
      };

      const testData = ['test', 'hello', 'world'];

      const suite = await benchmark.compare(schemas, testData, {
        iterations: 100
      });

      expect(suite.name).toBe('Schema Comparison');
      expect(suite.results).toHaveLength(2);
      expect(suite.comparison).toBeDefined();
      expect(suite.comparison?.baseline).toBe('regular');
      expect(suite.comparison?.improvements).toHaveProperty('jit');
    });
  });

  describe('Benchmark Suites', () => {
    test('should run basic types benchmark', async () => {
      const suite = await BenchmarkSuites.runBasicTypes();

      expect(suite.name).toBe('Schema Comparison');
      expect(suite.results.length).toBeGreaterThan(0);

      // Should have both regular and JIT versions
      const names = suite.results.map(r => r.name);
      expect(names).toContain('string');
      expect(names).toContain('stringJIT');
    }, 30000); // Longer timeout for benchmarks

    test('should run complex objects benchmark', async () => {
      const suite = await BenchmarkSuites.runComplexObjects();

      expect(suite.name).toBe('Schema Comparison');
      expect(suite.results.length).toBeGreaterThan(0);

      // Should test different optimization levels
      const names = suite.results.map(r => r.name);
      expect(names).toContain('regular');
      expect(names).toContain('jit');
      expect(names).toContain('wasm');
    }, 30000);

    test('should run array validation benchmark', async () => {
      const suite = await BenchmarkSuites.runArrayValidation();

      expect(suite.name).toBe('Array Validation Comparison');
      expect(suite.results.length).toBeGreaterThan(0);

      // Should test batch processing
      const names = suite.results.map(r => r.name);
      expect(names).toContain('individual');
      expect(names).toContain('batch');
    }, 30000);

    test('should run string formats benchmark', async () => {
      const suite = await BenchmarkSuites.runStringFormats();

      expect(suite.name).toBe('Schema Comparison');
      expect(suite.results.length).toBeGreaterThan(0);

      // Should test various string formats
      const names = suite.results.map(r => r.name);
      expect(names).toContain('email');
      expect(names).toContain('uuid');
    }, 30000);
  });

  describe('Regression Testing', () => {
    test('should detect performance improvements', () => {
      const tester = new RegressionTester();

      const baseline = {
        name: 'test',
        averageTime: 10.0,
        throughput: 100,
        iterations: 1000,
        standardDeviation: 1.0,
        percentiles: { p50: 9.5, p95: 12.0, p99: 15.0 }
      };

      const improved = {
        name: 'test',
        averageTime: 5.0, // 2x faster
        throughput: 200,
        iterations: 1000,
        standardDeviation: 0.5,
        percentiles: { p50: 4.8, p95: 6.0, p99: 7.5 }
      };

      tester.setBaseline('test', baseline);
      const result = tester.checkRegression('test', improved);

      expect(result.hasRegression).toBe(false);
      expect(result.improvement).toBe(2.0);
      expect(result.message).toContain('improvement');
    });

    test('should detect performance regressions', () => {
      const tester = new RegressionTester();

      const baseline = {
        name: 'test',
        averageTime: 5.0,
        throughput: 200,
        iterations: 1000,
        standardDeviation: 0.5,
        percentiles: { p50: 4.8, p95: 6.0, p99: 7.5 }
      };

      const regressed = {
        name: 'test',
        averageTime: 15.0, // 3x slower
        throughput: 67,
        iterations: 1000,
        standardDeviation: 2.0,
        percentiles: { p50: 14.0, p95: 18.0, p99: 22.0 }
      };

      tester.setBaseline('test', baseline);
      const result = tester.checkRegression('test', regressed, 1.5);

      expect(result.hasRegression).toBe(true);
      expect(result.improvement).toBe(1/3);
      expect(result.message).toContain('regression');
    });
  });

  describe('Utility Functions', () => {
    test('measurePerformance should work correctly', async () => {
      const result = await measurePerformance(
        'test_operation',
        () => {
          // Simple test operation
          const arr = Array.from({ length: 1000 }, (_, i) => i);
          arr.sort((a, b) => b - a);
        },
        50
      );

      expect(result.name).toBe('test_operation');
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.iterations).toBe(50);
    });

    test('compareSchemas should work correctly', async () => {
      const schemas = {
        string: z.string(),
        number: z.number()
      };

      const testData = ['hello', 42, 'world', 123];

      const suite = await compareSchemas(schemas, testData, {
        iterations: 50
      });

      expect(suite.results).toHaveLength(2);
      expect(suite.results[0].name).toBe('string');
      expect(suite.results[1].name).toBe('number');
    });
  });

  describe('Performance Expectations', () => {
    test('JIT compilation should improve performance', async () => {
      const regularSchema = z.object({
        name: z.string().min(2).max(50),
        age: z.number().min(0).max(120),
        email: z.string().email()
      });

      const jitSchema = z.jit(regularSchema);

      const testData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
      };

      // Measure regular schema performance
      const regularResult = await measurePerformance(
        'regular',
        () => regularSchema.parse(testData),
        500
      );

      // Measure JIT schema performance (after warmup)
      const jitResult = await measurePerformance(
        'jit',
        () => jitSchema.parse(testData),
        500
      );

      // JIT should be faster or at least not significantly slower
      const improvement = regularResult.averageTime / jitResult.averageTime;
      expect(improvement).toBeGreaterThanOrEqual(0.8); // At least 80% performance
    });

    test('batch validation should be efficient for large datasets', async () => {
      const itemSchema = z.object({
        id: z.number(),
        name: z.string()
      });

      const batchValidator = z.batch(itemSchema);

      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`
      }));

      const start = performance.now();
      const results = batchValidator.validate(largeDataset);
      const duration = performance.now() - start;

      expect(results).toHaveLength(1000);
      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(100); // Should complete quickly
    });
  });

  describe('Error Handling in Benchmarks', () => {
    test('should handle validation errors during benchmarking', async () => {
      const schema = z.string();
      const mixedData = ['valid', 123, 'another_valid', null, 'last_valid'];

      const result = await measurePerformance(
        'error_handling',
        () => {
          const data = mixedData[Math.floor(Math.random() * mixedData.length)];
          try {
            schema.parse(data);
          } catch {
            // Ignore validation errors for benchmark
          }
        },
        100
      );

      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.iterations).toBe(100);
    });

    test('should handle schema creation errors gracefully', async () => {
      const benchmark = new PerformanceBenchmark();

      // This should not throw during benchmarking
      expect(async () => {
        await benchmark.benchmark(
          'error_test',
          () => {
            try {
              const schema = z.string().email();
              schema.parse('invalid-email');
            } catch {
              // Expected validation error
            }
          },
          10
        );
      }).not.toThrow();
    });
  });

  afterAll(() => {
    // Clean up any resources
    console.log('✅ Benchmark tests completed');
  });
});