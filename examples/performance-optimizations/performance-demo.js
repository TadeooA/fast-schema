// Performance Optimizations Demo
// Demonstrates JIT compilation, caching, and performance monitoring

const { z } = require('../../js/pkg/fast_schema');

function jitCompilationDemo() {
  console.log('JIT Compilation Performance Demo\n');

  // Create schemas that will benefit from compilation
  const stringSchema = z.string().min(5).max(100);
  const numberSchema = z.number().min(0).max(1000);
  const emailSchema = z.string().email();

  const schemas = [
    { name: 'String Schema', schema: stringSchema, data: 'Hello World' },
    { name: 'Number Schema', schema: numberSchema, data: 42 },
    { name: 'Email Schema', schema: emailSchema, data: 'test@example.com' }
  ];

  console.log('Testing JIT compilation performance...\n');

  schemas.forEach(({ name, schema, data }) => {
    console.log(`${name}:`);

    // Reset performance stats
    schema.resetPerformanceStats();

    // Pre-compilation performance (first 9 validations)
    const preCompileStart = performance.now();
    for (let i = 0; i < 9; i++) {
      try {
        schema.parse(data);
      } catch (error) {
        // Handle errors
      }
    }
    const preCompileTime = performance.now() - preCompileStart;

    const preStats = schema.getPerformanceStats();
    console.log(`  Pre-compilation (9 validations): ${preCompileTime.toFixed(2)}ms`);
    console.log(`  Average per validation: ${preStats.avgTime.toFixed(4)}ms`);
    console.log(`  Compiled: ${preStats.isCompiled}`);

    // Trigger JIT compilation with 10th validation
    schema.parse(data);

    // Post-compilation performance
    const postCompileStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      try {
        schema.parse(data);
      } catch (error) {
        // Handle errors
      }
    }
    const postCompileTime = performance.now() - postCompileStart;

    const postStats = schema.getPerformanceStats();
    console.log(`  Post-compilation (1000 validations): ${postCompileTime.toFixed(2)}ms`);
    console.log(`  Average per validation: ${postStats.avgTime.toFixed(4)}ms`);
    console.log(`  Compiled: ${postStats.isCompiled}`);
    console.log(`  Performance improvement: ${(preStats.avgTime / postStats.avgTime).toFixed(2)}x faster\n`);
  });
}

function cachePerformanceDemo() {
  console.log('Cache Performance Demo\n');

  // Create schemas with different validation patterns
  const patterns = [
    { name: 'Email validation', schema: z.string().email(), data: 'user@example.com' },
    { name: 'IPv4 validation', schema: z.string().ipv4(), data: '192.168.1.1' },
    { name: 'UUID validation', schema: z.string().uuid(), data: '123e4567-e89b-12d3-a456-426614174000' },
    { name: 'Phone validation', schema: z.string().phone(), data: '+1-555-123-4567' },
    { name: 'Credit Card validation', schema: z.string().creditCard(), data: '4532015112830366' }
  ];

  console.log('Testing regex cache performance...\n');

  const iterations = 10000;

  patterns.forEach(({ name, schema, data }) => {
    console.log(`${name}:`);

    // First run - populate cache
    const firstRunStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      try {
        schema.parse(data);
      } catch (error) {
        // Handle errors
      }
    }
    const firstRunTime = performance.now() - firstRunStart;

    // Second run - use cached regex
    const secondRunStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      try {
        schema.parse(data);
      } catch (error) {
        // Handle errors
      }
    }
    const secondRunTime = performance.now() - secondRunStart;

    console.log(`  First run (cache miss): ${firstRunTime.toFixed(2)}ms`);
    console.log(`  Second run (cache hit): ${secondRunTime.toFixed(2)}ms`);
    console.log(`  Cache performance: ${(firstRunTime / secondRunTime).toFixed(2)}x faster\n`);
  });
}

function complexSchemaOptimization() {
  console.log('Complex Schema Optimization Demo\n');

  // Create complex nested schema
  const userSchema = z.object({
    personal: z.object({
      firstName: z.string().min(1).max(50),
      lastName: z.string().min(1).max(50),
      email: z.string().email(),
      phone: z.string().phone().optional()
    }),
    professional: z.object({
      company: z.string().min(1),
      position: z.string().min(1),
      salary: z.number().min(0).max(1000000),
      startDate: z.string(),
      skills: z.array(z.string()).min(1).max(20)
    }),
    preferences: z.object({
      theme: z.string(),
      notifications: z.boolean(),
      privacy: z.object({
        profileVisible: z.boolean(),
        emailVisible: z.boolean(),
        phoneVisible: z.boolean()
      })
    })
  });

  const complexData = {
    personal: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567'
    },
    professional: {
      company: 'Tech Corp',
      position: 'Senior Developer',
      salary: 95000,
      startDate: '2022-01-15',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js']
    },
    preferences: {
      theme: 'dark',
      notifications: true,
      privacy: {
        profileVisible: true,
        emailVisible: false,
        phoneVisible: false
      }
    }
  };

  console.log('Testing complex schema performance...\n');

  // Force compilation immediately
  userSchema.compile();

  const iterations = 1000;

  // Test with optimization
  userSchema.resetPerformanceStats();
  const optimizedStart = performance.now();

  for (let i = 0; i < iterations; i++) {
    try {
      userSchema.parse(complexData);
    } catch (error) {
      // Handle errors
    }
  }

  const optimizedTime = performance.now() - optimizedStart;
  const optimizedStats = userSchema.getPerformanceStats();

  console.log(`Optimized complex schema (${iterations} validations):`);
  console.log(`  Total time: ${optimizedTime.toFixed(2)}ms`);
  console.log(`  Average per validation: ${optimizedStats.avgTime.toFixed(4)}ms`);
  console.log(`  Min time: ${optimizedStats.minTime.toFixed(4)}ms`);
  console.log(`  Max time: ${optimizedStats.maxTime.toFixed(4)}ms`);
  console.log(`  Validations per second: ${Math.round(iterations / (optimizedTime / 1000)).toLocaleString()}`);
}

function memoryUsageDemo() {
  console.log('\nMemory Usage and Pool Demo\n');

  // Create multiple schemas to test memory management
  const schemas = Array.from({ length: 100 }, (_, i) =>
    z.object({
      id: z.number().int().positive(),
      name: z.string().min(1).max(50),
      value: z.number().min(0).max(100),
      active: z.boolean(),
      tags: z.array(z.string()).max(5)
    })
  );

  const testData = {
    id: 42,
    name: 'Test Item',
    value: 75.5,
    active: true,
    tags: ['tag1', 'tag2', 'tag3']
  };

  console.log('Testing memory usage with 100 schemas...\n');

  // Monitor memory before
  const memBefore = process.memoryUsage();

  // Run validations on all schemas
  const iterations = 1000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    for (const schema of schemas) {
      try {
        schema.parse(testData);
      } catch (error) {
        // Handle errors
      }
    }
  }

  const end = performance.now();
  const memAfter = process.memoryUsage();

  console.log(`Performance Results:`);
  console.log(`  Total validations: ${(schemas.length * iterations).toLocaleString()}`);
  console.log(`  Total time: ${(end - start).toFixed(2)}ms`);
  console.log(`  Validations per second: ${Math.round(schemas.length * iterations / ((end - start) / 1000)).toLocaleString()}`);

  console.log(`\nMemory Usage:`);
  console.log(`  Heap used before: ${(memBefore.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Heap used after: ${(memAfter.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Memory increase: ${((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)} MB`);

  // Test garbage collection
  if (global.gc) {
    console.log(`\nTesting garbage collection...`);
    global.gc();
    const memAfterGC = process.memoryUsage();
    console.log(`  Heap after GC: ${(memAfterGC.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Memory freed: ${((memAfter.heapUsed - memAfterGC.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
  }
}

function benchmarkComparison() {
  console.log('\nBenchmark Comparison Demo\n');

  // Create different types of schemas for comparison
  const benchmarks = [
    {
      name: 'Simple String',
      schema: z.string(),
      data: 'test string'
    },
    {
      name: 'String with Length',
      schema: z.string().min(5).max(50),
      data: 'test string with length validation'
    },
    {
      name: 'Email Validation',
      schema: z.string().email(),
      data: 'test@example.com'
    },
    {
      name: 'Number with Range',
      schema: z.number().min(0).max(100),
      data: 42
    },
    {
      name: 'Simple Object',
      schema: z.object({
        id: z.number(),
        name: z.string(),
        active: z.boolean()
      }),
      data: { id: 1, name: 'test', active: true }
    },
    {
      name: 'Complex Object',
      schema: z.object({
        user: z.object({
          id: z.number().int().positive(),
          profile: z.object({
            name: z.string().min(1).max(100),
            email: z.string().email(),
            preferences: z.object({
              theme: z.string(),
              notifications: z.boolean()
            })
          })
        }),
        metadata: z.object({
          created: z.string(),
          updated: z.string()
        })
      }),
      data: {
        user: {
          id: 1,
          profile: {
            name: 'John Doe',
            email: 'john@example.com',
            preferences: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        metadata: {
          created: '2023-01-01',
          updated: '2023-06-01'
        }
      }
    }
  ];

  const iterations = 10000;

  console.log(`Running benchmarks (${iterations} iterations each)...\n`);

  benchmarks.forEach(({ name, schema, data }) => {
    // Force compilation for fair comparison
    schema.compile();
    schema.resetPerformanceStats();

    const start = performance.now();
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        schema.parse(data);
        successCount++;
      } catch (error) {
        // Count errors but continue
      }
    }

    const end = performance.now();
    const duration = end - start;
    const stats = schema.getPerformanceStats();

    console.log(`${name}:`);
    console.log(`  Duration: ${duration.toFixed(2)}ms`);
    console.log(`  Success rate: ${(successCount / iterations * 100).toFixed(1)}%`);
    console.log(`  Avg per validation: ${stats.avgTime.toFixed(4)}ms`);
    console.log(`  Min time: ${stats.minTime.toFixed(4)}ms`);
    console.log(`  Max time: ${stats.maxTime.toFixed(4)}ms`);
    console.log(`  Validations/sec: ${Math.round(iterations / (duration / 1000)).toLocaleString()}`);
    console.log(`  Compiled: ${stats.isCompiled}\n`);
  });
}

function realWorldPerformanceTest() {
  console.log('Real-World Performance Test\n');

  // Simulate a real API validation scenario
  const apiRequestSchema = z.object({
    headers: z.object({
      authorization: z.string().min(1),
      contentType: z.string(),
      userAgent: z.string().optional()
    }),
    body: z.object({
      user: z.object({
        id: z.string().uuid(),
        email: z.string().email(),
        profile: z.object({
          firstName: z.string().min(1).max(50),
          lastName: z.string().min(1).max(50),
          phone: z.string().phone().optional(),
          address: z.object({
            street: z.string(),
            city: z.string(),
            zipCode: z.string(),
            country: z.string()
          }).optional()
        })
      }),
      metadata: z.object({
        timestamp: z.string(),
        version: z.string(),
        clientId: z.string().uuid()
      })
    })
  });

  const testRequest = {
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      contentType: 'application/json',
      userAgent: 'FastSchema-Client/1.0'
    },
    body: {
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        profile: {
          firstName: 'Alice',
          lastName: 'Johnson',
          phone: '+1-555-123-4567',
          address: {
            street: '123 Main St',
            city: 'San Francisco',
            zipCode: '94105',
            country: 'US'
          }
        }
      },
      metadata: {
        timestamp: '2023-06-15T10:30:00Z',
        version: '1.0',
        clientId: '987fcdeb-51a2-43d1-9f12-123456789abc'
      }
    }
  };

  console.log('Simulating API request validation...\n');

  // Pre-compile the schema
  apiRequestSchema.compile();

  const iterations = 5000;
  const start = performance.now();
  let validRequests = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      apiRequestSchema.parse(testRequest);
      validRequests++;
    } catch (error) {
      // Log validation errors in real scenario
    }
  }

  const end = performance.now();
  const duration = end - start;
  const stats = apiRequestSchema.getPerformanceStats();

  console.log(`API Validation Results (${iterations} requests):`);
  console.log(`  Total time: ${duration.toFixed(2)}ms`);
  console.log(`  Valid requests: ${validRequests} (${(validRequests / iterations * 100).toFixed(1)}%)`);
  console.log(`  Avg validation time: ${stats.avgTime.toFixed(4)}ms`);
  console.log(`  Requests per second: ${Math.round(iterations / (duration / 1000)).toLocaleString()}`);
  console.log(`  JIT compiled: ${stats.isCompiled}`);

  // Simulate load testing
  console.log('\nLoad testing simulation...');
  const loadTestRequests = 50000;
  const loadStart = performance.now();

  for (let i = 0; i < loadTestRequests; i++) {
    try {
      apiRequestSchema.parse(testRequest);
    } catch (error) {
      // Handle errors
    }
  }

  const loadEnd = performance.now();
  const loadDuration = loadEnd - loadStart;

  console.log(`Load test (${loadTestRequests} requests):`);
  console.log(`  Duration: ${loadDuration.toFixed(2)}ms`);
  console.log(`  Throughput: ${Math.round(loadTestRequests / (loadDuration / 1000)).toLocaleString()} req/sec`);
  console.log(`  Average latency: ${(loadDuration / loadTestRequests).toFixed(4)}ms per request`);
}

// Run all performance demos
async function main() {
  try {
    jitCompilationDemo();
    cachePerformanceDemo();
    complexSchemaOptimization();
    memoryUsageDemo();
    benchmarkComparison();
    realWorldPerformanceTest();

    console.log('\nAll performance optimization demos completed!');
    console.log('\nNote: Run with --expose-gc flag to test garbage collection');
  } catch (error) {
    console.error('Performance demo failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  jitCompilationDemo,
  cachePerformanceDemo,
  complexSchemaOptimization,
  memoryUsageDemo,
  benchmarkComparison,
  realWorldPerformanceTest
};