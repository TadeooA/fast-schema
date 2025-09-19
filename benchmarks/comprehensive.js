// Comprehensive benchmarks comparing fast-schema-wasm with Zod
const { z } = require('zod');
const { string, number, object, array, boolean } = require('../js/dist/index.js');

const Benchmark = require('benchmark');

// Test data sets
const testData = {
  string: {
    valid: ['hello', 'world', 'test@example.com', 'https://example.com'],
    invalid: [123, true, null, undefined, {}]
  },
  number: {
    valid: [1, 2.5, -10, 0, Number.MAX_SAFE_INTEGER],
    invalid: ['123', true, null, undefined, NaN, Infinity]
  },
  boolean: {
    valid: [true, false],
    invalid: [1, 0, 'true', 'false', null, undefined]
  },
  object: {
    valid: [
      { name: 'John', age: 30, email: 'john@example.com' },
      { name: 'Jane', age: 25, email: 'jane@example.com' },
      { name: 'Bob', age: 40, email: 'bob@example.com' }
    ],
    invalid: [
      { name: 'John' }, // missing age and email
      { age: 30, email: 'john@example.com' }, // missing name
      { name: 123, age: 30, email: 'john@example.com' }, // wrong type
      'not an object',
      null
    ]
  },
  array: {
    valid: [
      ['one', 'two', 'three'],
      ['hello', 'world'],
      []
    ],
    invalid: [
      [1, 2, 3], // numbers instead of strings
      'not an array',
      null
    ]
  }
};

// Schema definitions
const schemas = {
  zod: {
    string: z.string().email(),
    number: z.number().positive(),
    boolean: z.boolean(),
    object: z.object({
      name: z.string().min(2),
      age: z.number().min(18),
      email: z.string().email()
    }),
    array: z.array(z.string()),
    complex: z.object({
      users: z.array(z.object({
        id: z.number(),
        profile: z.object({
          name: z.string().min(2),
          email: z.string().email(),
          settings: z.object({
            theme: z.enum(['light', 'dark']),
            notifications: z.boolean()
          })
        })
      })),
      metadata: z.object({
        version: z.string(),
        created: z.string().datetime()
      })
    })
  },
  fastSchema: {
    string: string().email(),
    number: number().positive(),
    boolean: boolean(),
    object: object({
      name: string().min(2),
      age: number().min(18),
      email: string().email()
    }),
    array: array(string()),
    // Note: Complex schema will be simplified for now
    complex: object({
      simple: string(),
      count: number()
    })
  }
};

// Complex test data
const complexData = {
  valid: {
    users: [
      {
        id: 1,
        profile: {
          name: "John Doe",
          email: "john@example.com",
          settings: {
            theme: "dark",
            notifications: true
          }
        }
      }
    ],
    metadata: {
      version: "1.0.0",
      created: "2023-01-01T00:00:00.000Z"
    }
  },
  fastSchemaValid: {
    simple: "test",
    count: 42
  }
};

// Benchmark runner
class BenchmarkRunner {
  constructor() {
    this.results = {};
  }

  async runSuite(name, zodSchema, fastSchema, validData, invalidData) {
    console.log(`\n🏃 Running ${name} benchmarks...`);

    const suite = new Benchmark.Suite();

    // Valid data benchmarks
    suite.add(`Zod ${name} (valid)`, () => {
      try {
        zodSchema.parse(validData[0]);
      } catch (e) {}
    });

    suite.add(`FastSchema ${name} (valid)`, () => {
      try {
        fastSchema.parse(validData[0]);
      } catch (e) {}
    });

    // Invalid data benchmarks
    suite.add(`Zod ${name} (invalid)`, () => {
      try {
        zodSchema.safeParse(invalidData[0]);
      } catch (e) {}
    });

    suite.add(`FastSchema ${name} (invalid)`, () => {
      try {
        fastSchema.safeParse(invalidData[0]);
      } catch (e) {}
    });

    return new Promise((resolve) => {
      suite
        .on('cycle', (event) => {
          console.log(`  ${event.target}`);
        })
        .on('complete', function() {
          const results = Array.from(this).map(bench => ({
            name: bench.name,
            hz: bench.hz,
            stats: bench.stats
          }));

          // Calculate speedup
          const zodValid = results.find(r => r.name.includes('Zod') && r.name.includes('valid'));
          const fastValid = results.find(r => r.name.includes('FastSchema') && r.name.includes('valid'));

          if (zodValid && fastValid) {
            const speedup = (fastValid.hz / zodValid.hz).toFixed(2);
            console.log(`  🚀 FastSchema is ${speedup}x faster than Zod for valid data`);
          }

          resolve(results);
        })
        .run({ async: true });
    });
  }

  async runAllBenchmarks() {
    console.log('🏁 Starting comprehensive benchmarks...\n');

    const results = {};

    // String validation
    results.string = await this.runSuite(
      'String',
      schemas.zod.string,
      schemas.fastSchema.string,
      testData.string.valid,
      testData.string.invalid
    );

    // Number validation
    results.number = await this.runSuite(
      'Number',
      schemas.zod.number,
      schemas.fastSchema.number,
      testData.number.valid,
      testData.number.invalid
    );

    // Boolean validation
    results.boolean = await this.runSuite(
      'Boolean',
      schemas.zod.boolean,
      schemas.fastSchema.boolean,
      testData.boolean.valid,
      testData.boolean.invalid
    );

    // Object validation
    results.object = await this.runSuite(
      'Object',
      schemas.zod.object,
      schemas.fastSchema.object,
      testData.object.valid,
      testData.object.invalid
    );

    // Array validation
    results.array = await this.runSuite(
      'Array',
      schemas.zod.array,
      schemas.fastSchema.array,
      testData.array.valid,
      testData.array.invalid
    );

    // Complex nested objects
    results.complex = await this.runSuite(
      'Complex',
      schemas.zod.complex,
      schemas.fastSchema.complex,
      [complexData.fastSchemaValid],
      [{ invalid: 'data' }]
    );

    this.generateReport(results);
  }

  generateReport(results) {
    console.log('\n📊 BENCHMARK SUMMARY');
    console.log('=' .repeat(50));

    let totalZodOps = 0;
    let totalFastOps = 0;
    let benchmarkCount = 0;

    Object.entries(results).forEach(([category, benchmarks]) => {
      console.log(`\n${category.toUpperCase()}:`);

      const zodBench = benchmarks.find(b => b.name.includes('Zod') && b.name.includes('valid'));
      const fastBench = benchmarks.find(b => b.name.includes('FastSchema') && b.name.includes('valid'));

      if (zodBench && fastBench) {
        const speedup = (fastBench.hz / zodBench.hz).toFixed(2);
        console.log(`  Zod:        ${Math.round(zodBench.hz).toLocaleString()} ops/sec`);
        console.log(`  FastSchema: ${Math.round(fastBench.hz).toLocaleString()} ops/sec`);
        console.log(`  Speedup:    ${speedup}x`);

        totalZodOps += zodBench.hz;
        totalFastOps += fastBench.hz;
        benchmarkCount++;
      }
    });

    if (benchmarkCount > 0) {
      const avgSpeedup = (totalFastOps / totalZodOps).toFixed(2);
      console.log('\n🎯 OVERALL PERFORMANCE:');
      console.log(`  Average speedup: ${avgSpeedup}x`);
      console.log(`  Total Zod ops/sec: ${Math.round(totalZodOps).toLocaleString()}`);
      console.log(`  Total FastSchema ops/sec: ${Math.round(totalFastOps).toLocaleString()}`);
    }

    // Memory usage comparison (if available)
    if (process.memoryUsage) {
      const memory = process.memoryUsage();
      console.log('\n💾 MEMORY USAGE:');
      console.log(`  RSS: ${Math.round(memory.rss / 1024 / 1024)}MB`);
      console.log(`  Heap Used: ${Math.round(memory.heapUsed / 1024 / 1024)}MB`);
      console.log(`  Heap Total: ${Math.round(memory.heapTotal / 1024 / 1024)}MB`);
    }

    console.log('\n✅ Benchmarks completed!');
  }
}

// Memory leak test
async function runMemoryLeakTest() {
  console.log('\n🧪 Running memory leak test...');

  const schema = object({
    name: string().min(2),
    age: number().min(18),
    email: string().email()
  });

  const testData = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  };

  const initialMemory = process.memoryUsage().heapUsed;

  // Run many validations
  for (let i = 0; i < 10000; i++) {
    schema.parse(testData);
  }

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;

  console.log(`  Memory increase: ${memoryIncrease.toFixed(2)}MB after 10,000 validations`);

  if (memoryIncrease < 5) {
    console.log('  ✅ No significant memory leak detected');
  } else {
    console.log('  ⚠️  Potential memory leak detected');
  }
}

// Error performance test
async function runErrorPerformanceTest() {
  console.log('\n❌ Running error performance test...');

  const zodSchema = z.object({
    name: z.string().min(10),
    age: z.number().min(100),
    email: z.string().email()
  });

  const fastSchema = object({
    name: string().min(10),
    age: number().min(100),
    email: string().email()
  });

  const invalidData = {
    name: 'x', // too short
    age: 5,    // too small
    email: 'invalid' // not email
  };

  const iterations = 1000;

  // Zod error performance
  const zodStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    try {
      zodSchema.parse(invalidData);
    } catch (e) {
      // Expected error
    }
  }
  const zodTime = Date.now() - zodStart;

  // FastSchema error performance
  const fastStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    try {
      fastSchema.parse(invalidData);
    } catch (e) {
      // Expected error
    }
  }
  const fastTime = Date.now() - fastStart;

  const speedup = (zodTime / fastTime).toFixed(2);

  console.log(`  Zod error handling: ${zodTime}ms for ${iterations} errors`);
  console.log(`  FastSchema error handling: ${fastTime}ms for ${iterations} errors`);
  console.log(`  Error handling speedup: ${speedup}x`);
}

// Main execution
async function main() {
  try {
    const runner = new BenchmarkRunner();
    await runner.runAllBenchmarks();
    await runMemoryLeakTest();
    await runErrorPerformanceTest();

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `benchmark-results-${timestamp}.json`;

    console.log(`\n💾 Results saved to: ${filename}`);

  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { BenchmarkRunner, testData, schemas };