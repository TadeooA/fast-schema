// Performance comparison: fast-schema vs Zod
const { z } = require('zod');
const { string, number, object, array, boolean } = require('../js/dist/index.js');

// Simple schema comparison for basic types
const simpleSchemas = {
  zod: {
    string: z.string().min(3).max(100),
    number: z.number().positive(),
    boolean: z.boolean(),
    object: z.object({
      name: z.string().min(2),
      age: z.number().min(18),
      email: z.string().email()
    }),
    array: z.array(z.string())
  },
  fastSchema: {
    string: string().min(3).max(100),
    number: number().positive(),
    boolean: boolean(),
    object: object({
      name: string().min(2),
      age: number().min(18),
      email: string().email()
    }),
    array: array(string())
  }
};

// Test data
const testData = {
  string: {
    valid: "Hello World",
    invalid: "Hi" // too short
  },
  number: {
    valid: 42,
    invalid: -5 // negative
  },
  boolean: {
    valid: true,
    invalid: "true" // not boolean
  },
  object: {
    valid: {
      name: "John Doe",
      age: 30,
      email: "john@example.com"
    },
    invalid: {
      name: "J", // too short
      age: 15, // too young
      email: "invalid" // not email
    }
  },
  array: {
    valid: ["one", "two", "three"],
    invalid: [1, 2, 3] // numbers instead of strings
  }
};

// Benchmark function
function benchmark(name, fn, iterations = 10000) {
  console.log(`\nRunning ${name} (${iterations.toLocaleString()} iterations)...`);

  // Warmup
  for (let i = 0; i < 100; i++) {
    try { fn(); } catch {}
  }

  const start = process.hrtime.bigint();

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      fn();
      successCount++;
    } catch {
      errorCount++;
    }
  }

  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
  const opsPerSecond = Math.round((iterations / duration) * 1000);

  console.log(`  Time: ${duration.toFixed(2)}ms`);
  console.log(`  Ops/sec: ${opsPerSecond.toLocaleString()}`);
  console.log(`  Success: ${successCount.toLocaleString()}`);
  console.log(`  Errors: ${errorCount.toLocaleString()}`);

  return { duration, opsPerSecond, successCount, errorCount };
}

// Run all benchmarks
function runAllBenchmarks() {
  console.log("Fast-Schema vs Zod Performance Benchmark");
  console.log("=" + "=".repeat(50));

  const results = {};

  // Test each schema type
  Object.keys(testData).forEach(type => {
    console.log(`\nTesting ${type.toUpperCase()} validation:`);

    // Valid data tests
    const zodValidResults = benchmark(`Zod ${type} (valid)`, () => {
      simpleSchemas.zod[type].parse(testData[type].valid);
    });

    const fastValidResults = benchmark(`FastSchema ${type} (valid)`, () => {
      simpleSchemas.fastSchema[type].parse(testData[type].valid);
    });

    // Invalid data tests (using safeParse to avoid exceptions)
    const zodInvalidResults = benchmark(`Zod ${type} (invalid)`, () => {
      simpleSchemas.zod[type].safeParse(testData[type].invalid);
    });

    const fastInvalidResults = benchmark(`FastSchema ${type} (invalid)`, () => {
      simpleSchemas.fastSchema[type].safeParse(testData[type].invalid);
    });

    const validSpeedup = fastValidResults.opsPerSecond / zodValidResults.opsPerSecond;
    const invalidSpeedup = fastInvalidResults.opsPerSecond / zodInvalidResults.opsPerSecond;

    console.log(`  Valid speedup: ${validSpeedup.toFixed(2)}x`);
    console.log(`  Invalid speedup: ${invalidSpeedup.toFixed(2)}x`);

    results[type] = {
      validSpeedup,
      invalidSpeedup,
      zodValid: zodValidResults,
      fastValid: fastValidResults,
      zodInvalid: zodInvalidResults,
      fastInvalid: fastInvalidResults
    };
  });

  return results;
}

// Memory leak test
function memoryLeakTest() {
  console.log('\nMemory leak test...');

  const schema = object({
    name: string(),
    age: number()
  });

  const testObj = { name: "Test", age: 25 };

  const initialMemory = process.memoryUsage().heapUsed;

  // Run many validations
  for (let i = 0; i < 50000; i++) {
    schema.parse(testObj);
  }

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;

  console.log(`  Memory increase: ${memoryIncrease.toFixed(2)}MB after 50,000 validations`);

  if (memoryIncrease < 5) {
    console.log('  No significant memory leak detected');
  } else {
    console.log('  Potential memory leak detected');
  }
}

// Generate summary report
function generateSummary(results) {
  console.log("\n" + "=".repeat(60));
  console.log("PERFORMANCE SUMMARY");
  console.log("=".repeat(60));

  let totalValidSpeedup = 0;
  let totalInvalidSpeedup = 0;
  let testCount = 0;

  Object.entries(results).forEach(([type, result]) => {
    console.log(`\n${type.toUpperCase()} Performance:`);
    console.log(`  Valid data speedup:   ${result.validSpeedup.toFixed(2)}x`);
    console.log(`  Invalid data speedup: ${result.invalidSpeedup.toFixed(2)}x`);

    totalValidSpeedup += result.validSpeedup;
    totalInvalidSpeedup += result.invalidSpeedup;
    testCount++;
  });

  const avgValidSpeedup = totalValidSpeedup / testCount;
  const avgInvalidSpeedup = totalInvalidSpeedup / testCount;
  const overallAvg = (avgValidSpeedup + avgInvalidSpeedup) / 2;

  console.log(`\nOVERALL AVERAGES:`);
  console.log(`  Valid data average:   ${avgValidSpeedup.toFixed(2)}x faster`);
  console.log(`  Invalid data average: ${avgInvalidSpeedup.toFixed(2)}x faster`);
  console.log(`  Overall average:      ${overallAvg.toFixed(2)}x faster`);

  // Memory usage
  const memory = process.memoryUsage();
  console.log(`\nCurrent Memory Usage:`);
  console.log(`  RSS: ${(memory.rss / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB`);

  // Performance verdict
  if (overallAvg >= 10) {
    console.log("\nEXCELLENT! Fast-Schema is 10x+ faster than Zod!");
  } else if (overallAvg >= 5) {
    console.log("\nGREAT! Fast-Schema is 5x+ faster than Zod!");
  } else if (overallAvg >= 2) {
    console.log("\nGOOD! Fast-Schema is 2x+ faster than Zod!");
  } else if (overallAvg >= 1.5) {
    console.log("\nDECENT! Fast-Schema is 1.5x+ faster than Zod!");
  } else {
    console.log("\nFast-Schema needs optimization to reach target performance.");
  }

  console.log("\n" + "=".repeat(60));
  console.log("Benchmark completed!");

  return {
    avgValidSpeedup,
    avgInvalidSpeedup,
    overallAvg,
    results
  };
}

// Main execution
function main() {
  try {
    const results = runAllBenchmarks();
    memoryLeakTest();
    const summary = generateSummary(results);

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `vs-zod-results-${timestamp}.json`;

    console.log(`\nResults would be saved to: ${filename}`);

    return summary;

  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  simpleSchemas,
  testData,
  benchmark,
  runAllBenchmarks,
  memoryLeakTest,
  generateSummary,
  main
};