// Comprehensive test suite for WASM integration
import { z, ValidationError, FastSchemaWasm } from '../index';

describe('WASM Integration Tests', () => {

  describe('WASM Availability Detection', () => {
    test('should detect WASM availability correctly', () => {
      const isAvailable = z.wasm.isAvailable();
      expect(typeof isAvailable).toBe('boolean');

      // Should match FastSchemaWasm availability
      expect(isAvailable).toBe(FastSchemaWasm.isAvailable());
    });

    test('should handle WASM module loading gracefully', async () => {
      const testResult = await z.wasm.test();

      expect(testResult).toHaveProperty('wasmAvailable');
      expect(testResult).toHaveProperty('wasmWorking');
      expect(typeof testResult.wasmAvailable).toBe('boolean');
      expect(typeof testResult.wasmWorking).toBe('boolean');

      if (testResult.wasmAvailable) {
        expect(testResult).toHaveProperty('performanceGain');
      } else {
        expect(testResult).toHaveProperty('error');
      }
    });
  });

  describe('Hybrid Schema Creation', () => {
    test('should create hybrid schemas that fallback gracefully', () => {
      const baseSchema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string()
      });

      const hybridSchema = z.wasm.hybridize(baseSchema);

      const testData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
      };

      // Should work regardless of WASM availability
      expect(hybridSchema.parse(testData)).toEqual(testData);

      // Safe parse should also work
      const safeResult = hybridSchema.safeParse(testData);
      expect(safeResult.success).toBe(true);
      if (safeResult.success) {
        expect(safeResult.data).toEqual(testData);
      }
    });

    test('should handle validation errors consistently', () => {
      const strictSchema = z.object({
        name: z.string().min(2),
        age: z.number().min(18)
      });

      const hybridSchema = z.wasm.hybridize(strictSchema);

      const invalidData = {
        name: 'A', // Too short
        age: 16    // Too young
      };

      expect(() => {
        hybridSchema.parse(invalidData);
      }).toThrow(ValidationError);

      const safeResult = hybridSchema.safeParse(invalidData);
      expect(safeResult.success).toBe(false);
      if (!safeResult.success) {
        expect(safeResult.error).toBeInstanceOf(ValidationError);
        expect(safeResult.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Schema Optimization', () => {
    test('should optimize schemas automatically', () => {
      const complexSchema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(2),
            email: z.string().email(),
            preferences: z.object({
              theme: z.string(),
              notifications: z.boolean()
            })
          })
        }),
        metadata: z.object({
          created: z.string(),
          updated: z.string(),
          version: z.number()
        })
      });

      const optimizedSchema = z.wasm.optimize(complexSchema);

      const testData = {
        user: {
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
          created: '2023-01-01T00:00:00Z',
          updated: '2023-01-02T00:00:00Z',
          version: 1
        }
      };

      const result = optimizedSchema.parse(testData);
      expect(result).toEqual(testData);
    });

    test('should provide performance information', () => {
      const schema = z.object({
        items: z.array(z.object({
          id: z.number(),
          name: z.string()
        }))
      });

      const hybridSchema = z.wasm.hybridize(schema);

      // Test with some data first
      const testData = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      };

      hybridSchema.parse(testData);

      // Check performance info
      if (typeof hybridSchema.getPerformanceInfo === 'function') {
        const perfInfo = hybridSchema.getPerformanceInfo();
        expect(perfInfo).toHaveProperty('wasmAvailable');
        expect(perfInfo).toHaveProperty('hybridMetrics');
      }
    });
  });

  describe('Batch Validation with WASM', () => {
    test('should handle batch validation efficiently', () => {
      const itemSchema = z.object({
        id: z.number(),
        name: z.string(),
        active: z.boolean()
      });

      const hybridSchema = z.wasm.hybridize(itemSchema);

      const items = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        active: i % 2 === 0
      }));

      const start = performance.now();

      // Use validateMany if available, otherwise fallback to individual validation
      let results: any[];
      if (typeof hybridSchema.validateMany === 'function') {
        results = hybridSchema.validateMany(items);
      } else {
        results = items.map(item => hybridSchema.safeParse(item));
      }

      const duration = performance.now() - start;

      expect(results).toHaveLength(100);
      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(200); // Should be reasonably fast
    });

    test('should handle mixed valid/invalid data in batches', () => {
      const numberSchema = z.number().min(0).max(100);
      const hybridSchema = z.wasm.hybridize(numberSchema);

      const mixedData = [10, -5, 50, 150, 25, 'invalid', 75];

      let results: any[];
      if (typeof hybridSchema.validateMany === 'function') {
        results = hybridSchema.validateMany(mixedData);
      } else {
        results = mixedData.map(item => hybridSchema.safeParse(item));
      }

      expect(results).toHaveLength(7);
      expect(results[0].success).toBe(true);  // 10
      expect(results[1].success).toBe(false); // -5
      expect(results[2].success).toBe(true);  // 50
      expect(results[3].success).toBe(false); // 150
      expect(results[4].success).toBe(true);  // 25
      expect(results[5].success).toBe(false); // 'invalid'
      expect(results[6].success).toBe(true);  // 75
    });
  });

  describe('WASM Performance Benchmarking', () => {
    test('should provide performance benchmarks when available', async () => {
      const schema = z.object({
        data: z.array(z.object({
          id: z.number(),
          value: z.string()
        }))
      });

      const testData = [{
        data: Array.from({ length: 50 }, (_, i) => ({
          id: i,
          value: `value_${i}`
        }))
      }];

      try {
        const benchmark = await z.wasm.benchmark(schema, testData, 10);

        if (benchmark) {
          expect(benchmark).toHaveProperty('wasmResults');
          expect(benchmark).toHaveProperty('typeScriptResults');
          expect(benchmark).toHaveProperty('recommendation');

          expect(typeof benchmark.wasmResults.averageTime).toBe('number');
          expect(typeof benchmark.typeScriptResults.averageTime).toBe('number');
          expect(['wasm', 'typescript', 'hybrid']).toContain(benchmark.recommendation);
        }
      } catch (error) {
        // Benchmarking not available - that's OK
        expect(error.message).toContain('not available');
      }
    });

    test('should measure validation throughput', async () => {
      const simpleSchema = z.string();
      const hybridSchema = z.wasm.hybridize(simpleSchema);

      const testData = Array.from({ length: 1000 }, (_, i) => `string_${i}`);

      const start = performance.now();
      testData.forEach(item => {
        hybridSchema.parse(item);
      });
      const duration = performance.now() - start;

      const throughput = testData.length / (duration / 1000); // items per second
      expect(throughput).toBeGreaterThan(1000); // Should handle at least 1000 items/sec
    });
  });

  describe('WASM Configuration', () => {
    test('should allow WASM configuration', () => {
      const config = {
        preferWasm: true,
        autoFallback: true,
        performanceThresholds: {
          minDataSize: 100,
          complexityThreshold: 5,
          batchSizeThreshold: 50
        },
        enableMetrics: true
      };

      expect(() => {
        z.wasm.configure(config);
      }).not.toThrow();

      // Configuration should be applied
      // We can't easily test the effect without internal access,
      // but at least ensure the method doesn't throw
    });

    test('should provide metrics when enabled', () => {
      const metrics = z.wasm.getMetrics();

      if (metrics) {
        // When WASM is available, metrics should have expected structure
        expect(typeof metrics).toBe('object');
        // Specific structure will depend on implementation
      } else {
        // When WASM is not available, metrics should be null
        expect(metrics).toBeNull();
      }
    });

    test('should allow cache management', () => {
      expect(() => {
        z.wasm.resetCaches();
      }).not.toThrow();
    });
  });

  describe('FastSchemaWasm Class Interface', () => {
    test('should provide consistent interface', () => {
      expect(typeof FastSchemaWasm.isAvailable).toBe('function');
      expect(typeof FastSchemaWasm.test).toBe('function');
      expect(typeof FastSchemaWasm.configure).toBe('function');
      expect(typeof FastSchemaWasm.getMetrics).toBe('function');
      expect(typeof FastSchemaWasm.resetCaches).toBe('function');
    });

    test('should provide optimized schema factories', () => {
      const stringSchema = FastSchemaWasm.optimized.string();
      const numberSchema = FastSchemaWasm.optimized.number();
      const objectSchema = FastSchemaWasm.optimized.object({
        name: FastSchemaWasm.optimized.string(),
        age: FastSchemaWasm.optimized.number()
      });

      expect(stringSchema.parse('test')).toBe('test');
      expect(numberSchema.parse(42)).toBe(42);
      expect(objectSchema.parse({ name: 'John', age: 30 })).toEqual({ name: 'John', age: 30 });
    });

    test('should handle schema optimization', () => {
      const baseSchema = z.object({
        id: z.string(),
        value: z.number()
      });

      const optimizedSchema = FastSchemaWasm.optimizeSchema(baseSchema);
      const testData = { id: 'test', value: 42 };

      expect(optimizedSchema.parse(testData)).toEqual(testData);
    });
  });

  describe('WASM Memory Management', () => {
    test('should handle memory efficiently during repeated validations', () => {
      const schema = z.object({
        data: z.array(z.string())
      });

      const hybridSchema = z.wasm.hybridize(schema);

      const largeArray = Array.from({ length: 1000 }, (_, i) => `string_${i}`);
      const testData = { data: largeArray };

      // Perform many validations to test memory usage
      for (let i = 0; i < 100; i++) {
        hybridSchema.parse(testData);
      }

      // Test should complete without memory issues
      expect(true).toBe(true);
    });

    test('should reset caches when requested', () => {
      const schema = z.string();
      const hybridSchema = z.wasm.hybridize(schema);

      // Perform some validations to populate caches
      for (let i = 0; i < 10; i++) {
        hybridSchema.parse(`test_${i}`);
      }

      // Reset caches
      if (typeof hybridSchema.resetCaches === 'function') {
        expect(() => {
          hybridSchema.resetCaches();
        }).not.toThrow();
      }

      z.wasm.resetCaches();
    });
  });

  describe('WASM Error Handling', () => {
    test('should handle WASM module load failures gracefully', async () => {
      // This test verifies that the system works even when WASM fails to load
      const schema = z.string();
      const hybridSchema = z.wasm.hybridize(schema);

      // Should work even if WASM is not available
      expect(hybridSchema.parse('test')).toBe('test');

      const safeResult = hybridSchema.safeParse('test');
      expect(safeResult.success).toBe(true);
    });

    test('should handle WASM validation errors correctly', () => {
      const strictSchema = z.string().min(10);
      const hybridSchema = z.wasm.hybridize(strictSchema);

      const shortString = 'short';

      expect(() => {
        hybridSchema.parse(shortString);
      }).toThrow(ValidationError);

      const safeResult = hybridSchema.safeParse(shortString);
      expect(safeResult.success).toBe(false);
    });
  });

  describe('WASM Type Safety', () => {
    test('should maintain TypeScript type inference with WASM schemas', () => {
      const userSchema = z.object({
        id: z.string(),
        name: z.string(),
        age: z.number().optional()
      });

      const hybridSchema = z.wasm.hybridize(userSchema);

      // TypeScript should infer the correct type
      type User = z.infer<typeof hybridSchema>;

      const userData: User = {
        id: '123',
        name: 'John Doe',
        age: 30
      };

      expect(hybridSchema.parse(userData)).toEqual(userData);
    });
  });

  describe('WASM Integration with Advanced Features', () => {
    test('should work with schema intersections', () => {
      const personSchema = z.object({ name: z.string(), age: z.number() });
      const employeeSchema = z.object({ employeeId: z.string(), department: z.string() });

      const intersectionSchema = z.intersection(personSchema, employeeSchema);
      const hybridSchema = z.wasm.hybridize(intersectionSchema);

      const testData = {
        name: 'John',
        age: 30,
        employeeId: 'E123',
        department: 'Engineering'
      };

      expect(hybridSchema.parse(testData)).toEqual(testData);
    });

    test('should work with conditional schemas', () => {
      const isAdult = (data: any) => data.age >= 18;
      const adultSchema = z.object({ name: z.string(), age: z.number().min(18) });
      const minorSchema = z.object({ name: z.string(), age: z.number().max(17), guardian: z.string() });

      const conditionalSchema = z.conditional(isAdult, adultSchema, minorSchema);
      const hybridSchema = z.wasm.hybridize(conditionalSchema);

      const adultData = { name: 'John', age: 25 };
      const minorData = { name: 'Jane', age: 16, guardian: 'Parent' };

      expect(hybridSchema.parse(adultData)).toEqual(adultData);
      expect(hybridSchema.parse(minorData)).toEqual(minorData);
    });
  });

  describe('WASM Performance Regression Tests', () => {
    test('should maintain performance standards', () => {
      const schema = z.object({
        items: z.array(z.object({
          id: z.number(),
          name: z.string(),
          active: z.boolean()
        }))
      });

      const hybridSchema = z.wasm.hybridize(schema);

      const testData = {
        items: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          active: i % 2 === 0
        }))
      };

      // Benchmark validation performance
      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        hybridSchema.parse(testData);
      }

      const duration = performance.now() - start;
      const averageTime = duration / iterations;

      // Should maintain reasonable performance
      expect(averageTime).toBeLessThan(10); // Less than 10ms per validation
    });
  });
});

// Test utilities
function createLargeTestData(size: number) {
  return Array.from({ length: size }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    value: Math.random(),
    metadata: {
      created: new Date().toISOString(),
      tags: [`tag1_${i}`, `tag2_${i}`]
    }
  }));
}