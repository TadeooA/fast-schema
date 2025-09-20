// Performance benchmarking suite for fast-schema
import { z } from '../index';

export interface BenchmarkResult {
  name: string;
  averageTime: number;
  throughput: number;
  memoryUsage?: number;
  iterations: number;
  standardDeviation: number;
  percentiles: {
    p50: number;
    p95: number;
    p99: number;
  };
}

export interface BenchmarkSuite {
  name: string;
  results: BenchmarkResult[];
  comparison?: {
    baseline: string;
    improvements: Record<string, number>;
  };
}

export class PerformanceBenchmark {
  private warmupIterations = 100;
  private measureIterations = 1000;
  private memoryMeasurement = false;

  constructor(options: {
    warmupIterations?: number;
    measureIterations?: number;
    memoryMeasurement?: boolean;
  } = {}) {
    this.warmupIterations = options.warmupIterations ?? 100;
    this.measureIterations = options.measureIterations ?? 1000;
    this.memoryMeasurement = options.memoryMeasurement ?? false;
  }

  async benchmark(
    name: string,
    fn: () => void,
    iterations?: number
  ): Promise<BenchmarkResult> {
    const testIterations = iterations ?? this.measureIterations;

    // Warmup phase
    for (let i = 0; i < this.warmupIterations; i++) {
      fn();
    }

    // Force garbage collection if available
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }

    const times: number[] = [];
    let memoryBefore = 0;
    let memoryAfter = 0;

    // Memory measurement setup
    if (this.memoryMeasurement && typeof process !== 'undefined') {
      memoryBefore = process.memoryUsage().heapUsed;
    }

    // Measurement phase
    for (let i = 0; i < testIterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      times.push(end - start);
    }

    // Memory measurement
    if (this.memoryMeasurement && typeof process !== 'undefined') {
      memoryAfter = process.memoryUsage().heapUsed;
    }

    // Calculate statistics
    const sortedTimes = times.sort((a, b) => a - b);
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      name,
      averageTime,
      throughput: 1000 / averageTime, // operations per second
      memoryUsage: this.memoryMeasurement ? memoryAfter - memoryBefore : undefined,
      iterations: testIterations,
      standardDeviation,
      percentiles: {
        p50: sortedTimes[Math.floor(sortedTimes.length * 0.5)],
        p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
        p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)]
      }
    };
  }

  async benchmarkSchema(
    name: string,
    schema: any,
    testData: unknown[],
    iterations?: number
  ): Promise<BenchmarkResult> {
    let dataIndex = 0;
    return this.benchmark(
      name,
      () => {
        schema.parse(testData[dataIndex % testData.length]);
        dataIndex++;
      },
      iterations
    );
  }

  async compare(
    schemas: Record<string, any>,
    testData: unknown[],
    options: {
      iterations?: number;
      warmupRuns?: number;
      measureMemory?: boolean;
    } = {}
  ): Promise<BenchmarkSuite> {
    const results: BenchmarkResult[] = [];

    if (options.warmupRuns) {
      this.warmupIterations = options.warmupRuns;
    }

    if (options.measureMemory) {
      this.memoryMeasurement = options.measureMemory;
    }

    // Run benchmarks for each schema
    for (const [name, schema] of Object.entries(schemas)) {
      const result = await this.benchmarkSchema(name, schema, testData, options.iterations);
      results.push(result);
    }

    // Calculate improvements relative to first result (baseline)
    const baseline = results[0];
    const improvements: Record<string, number> = {};

    for (const result of results.slice(1)) {
      improvements[result.name] = baseline.averageTime / result.averageTime;
    }

    return {
      name: 'Schema Comparison',
      results,
      comparison: {
        baseline: baseline.name,
        improvements
      }
    };
  }

  static formatResults(suite: BenchmarkSuite): string {
    let output = `\n=== ${suite.name} ===\n\n`;

    // Results table
    output += '| Schema | Avg Time (ms) | Throughput (ops/sec) | P95 (ms) | P99 (ms) | Memory (bytes) |\n';
    output += '|--------|---------------|---------------------|----------|----------|----------------|\n';

    for (const result of suite.results) {
      const memoryStr = result.memoryUsage ? result.memoryUsage.toLocaleString() : 'N/A';
      output += `| ${result.name} | ${result.averageTime.toFixed(3)} | ${Math.round(result.throughput).toLocaleString()} | ${result.percentiles.p95.toFixed(3)} | ${result.percentiles.p99.toFixed(3)} | ${memoryStr} |\n`;
    }

    // Comparison section
    if (suite.comparison) {
      output += `\n### Performance Improvements (vs ${suite.comparison.baseline})\n\n`;
      for (const [name, improvement] of Object.entries(suite.comparison.improvements)) {
        const speedup = `${improvement.toFixed(1)}x faster`;
        const percentage = `(${((improvement - 1) * 100).toFixed(1)}% improvement)`;
        output += `- **${name}**: ${speedup} ${percentage}\n`;
      }
    }

    return output;
  }
}

// Predefined benchmark suites
export class BenchmarkSuites {
  static async runBasicTypes(): Promise<BenchmarkSuite> {
    const benchmark = new PerformanceBenchmark();

    const schemas = {
      string: z.string(),
      number: z.number(),
      boolean: z.boolean(),
      stringJIT: z.jit(z.string()),
      numberJIT: z.jit(z.number()),
      booleanJIT: z.jit(z.boolean())
    };

    const testData = [
      ['hello', 'world', 'test', 'validation', 'schema'],
      [1, 2, 3, 42, 100],
      [true, false, true, false, true]
    ];

    return benchmark.compare(schemas, testData.flat(), { iterations: 5000 });
  }

  static async runComplexObjects(): Promise<BenchmarkSuite> {
    const benchmark = new PerformanceBenchmark({ memoryMeasurement: true });

    const userSchema = z.object({
      id: z.string().uuid(),
      name: z.string().min(2).max(50),
      email: z.string().email(),
      age: z.number().min(0).max(120),
      preferences: z.object({
        theme: z.enum(['light', 'dark']),
        notifications: z.boolean(),
        language: z.string().min(2).max(5)
      }),
      tags: z.array(z.string()).max(10),
      metadata: z.record(z.any()).optional()
    });

    const schemas = {
      regular: userSchema,
      jit: z.jit(userSchema),
      wasm: z.wasm.hybridize(userSchema)
    };

    const testData = Array.from({ length: 100 }, (_, i) => ({
      id: `550e8400-e29b-41d4-a716-44665544000${i % 10}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + (i % 50),
      preferences: {
        theme: i % 2 === 0 ? 'light' : 'dark',
        notifications: i % 3 === 0,
        language: 'en'
      },
      tags: [`tag${i % 5}`, `category${i % 3}`],
      metadata: { created: Date.now(), index: i }
    }));

    return benchmark.compare(schemas, testData, { iterations: 1000, measureMemory: true });
  }

  static async runArrayValidation(): Promise<BenchmarkSuite> {
    const benchmark = new PerformanceBenchmark();

    const itemSchema = z.object({
      id: z.number(),
      name: z.string(),
      active: z.boolean()
    });

    const schemas = {
      individual: itemSchema,
      batch: z.batch(itemSchema),
      jitBatch: z.batch(z.jit(itemSchema)),
      wasmBatch: z.batch(z.wasm.hybridize(itemSchema))
    };

    const largeArray = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      active: i % 2 === 0
    }));

    const singleItem = largeArray[0];
    const testDataArray = [singleItem]; // Array containing single item for individual validation

    const results: BenchmarkResult[] = [];

    // Individual validation (validate single item repeatedly)
    results.push(await benchmark.benchmarkSchema(
      'individual',
      schemas.individual,
      testDataArray,
      1000
    ));

    // Batch validations (validate entire array)
    for (const [name, schema] of Object.entries(schemas)) {
      if (name === 'individual') continue;

      const result = await benchmark.benchmark(
        name,
        () => {
          if ('validate' in schema) {
            schema.validate(largeArray);
          } else {
            schema.parse(largeArray);
          }
        },
        50 // Fewer iterations for array operations
      );
      results.push(result);
    }

    return {
      name: 'Array Validation Comparison',
      results,
      comparison: {
        baseline: 'individual',
        improvements: {
          batch: results[0].averageTime / results[1].averageTime,
          jitBatch: results[0].averageTime / results[2].averageTime,
          wasmBatch: results[0].averageTime / results[3].averageTime
        }
      }
    };
  }

  static async runStringFormats(): Promise<BenchmarkSuite> {
    const benchmark = new PerformanceBenchmark();

    const schemas = {
      email: z.string().email(),
      uuid: z.string().uuid(),
      url: z.string().url(),
      datetime: z.string().datetime(),
      emailJIT: z.jit(z.string().email()),
      uuidJIT: z.jit(z.string().uuid()),
      urlJIT: z.jit(z.string().url()),
      datetimeJIT: z.jit(z.string().datetime())
    };

    const testData = [
      'user@example.com',
      'test@domain.org',
      '550e8400-e29b-41d4-a716-446655440000',
      'https://example.com/path',
      '2023-10-15T14:30:00Z'
    ];

    return benchmark.compare(schemas, testData, { iterations: 2000 });
  }

  static async runRegressionSuite(): Promise<BenchmarkSuite[]> {
    console.log('🏃 Running comprehensive benchmark suite...\n');

    const suites = await Promise.all([
      this.runBasicTypes(),
      this.runComplexObjects(),
      this.runArrayValidation(),
      this.runStringFormats()
    ]);

    return suites;
  }
}

// Regression testing utilities
export class RegressionTester {
  private baselines: Map<string, BenchmarkResult> = new Map();

  setBaseline(name: string, result: BenchmarkResult): void {
    this.baselines.set(name, result);
  }

  checkRegression(
    name: string,
    current: BenchmarkResult,
    threshold: number = 1.5
  ): {
    hasRegression: boolean;
    improvement: number;
    message: string;
  } {
    const baseline = this.baselines.get(name);

    if (!baseline) {
      return {
        hasRegression: false,
        improvement: 1,
        message: `No baseline found for ${name}`
      };
    }

    const improvement = baseline.averageTime / current.averageTime;
    const hasRegression = improvement < (1 / threshold);

    let message: string;
    if (hasRegression) {
      message = `⚠️ Performance regression in ${name}: ${(current.averageTime / baseline.averageTime).toFixed(2)}x slower`;
    } else if (improvement > 1.2) {
      message = `🚀 Performance improvement in ${name}: ${improvement.toFixed(2)}x faster`;
    } else {
      message = `✅ ${name}: Performance stable (${improvement.toFixed(2)}x)`;
    }

    return {
      hasRegression,
      improvement,
      message
    };
  }

  async runRegressionCheck(): Promise<void> {
    console.log('🔍 Running performance regression tests...\n');

    const suites = await BenchmarkSuites.runRegressionSuite();

    for (const suite of suites) {
      console.log(`\n=== ${suite.name} ===`);

      for (const result of suite.results) {
        const regression = this.checkRegression(result.name, result);
        console.log(regression.message);
      }
    }
  }
}

// Export utilities for manual testing
export const measurePerformance = async <T>(
  name: string,
  fn: () => T,
  iterations: number = 1000
): Promise<BenchmarkResult> => {
  const benchmark = new PerformanceBenchmark();
  return benchmark.benchmark(name, fn, iterations);
};

export const compareSchemas = async (
  schemas: Record<string, any>,
  testData: unknown[],
  options?: { iterations?: number; measureMemory?: boolean }
): Promise<BenchmarkSuite> => {
  const benchmark = new PerformanceBenchmark({
    memoryMeasurement: options?.measureMemory
  });
  return benchmark.compare(schemas, testData, options);
};

// CLI interface for running benchmarks
export const runBenchmarkCLI = async (): Promise<void> => {
  console.log('🔬 Fast-Schema Performance Benchmark Suite\n');

  try {
    const suites = await BenchmarkSuites.runRegressionSuite();

    for (const suite of suites) {
      console.log(PerformanceBenchmark.formatResults(suite));
    }

    console.log('\n✅ Benchmark suite completed successfully!');
  } catch (error) {
    console.error('❌ Benchmark suite failed:', error);
    process.exit(1);
  }
};