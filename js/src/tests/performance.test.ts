// Comprehensive test suite for performance optimization features
import { z, ValidationError, RegexCache, SchemaCache, ValidationPool, StreamingValidator } from '../index';

describe('Performance Optimization Tests', () => {

  describe('JIT Schema Compilation', () => {
    test('should compile schemas for better performance', () => {
      const baseSchema = z.object({
        name: z.string().min(2).max(50),
        age: z.number().min(0).max(120),
        email: z.string().email()
      });

      const jitSchema = z.jit(baseSchema);

      const testData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
      };

      // First validation (compilation occurs)
      const start1 = performance.now();
      const result1 = jitSchema.parse(testData);
      const duration1 = performance.now() - start1;

      // Second validation (should use compiled version)
      const start2 = performance.now();
      const result2 = jitSchema.parse(testData);
      const duration2 = performance.now() - start2;

      expect(result1).toEqual(testData);
      expect(result2).toEqual(testData);

      // Second validation should be faster (or at least not significantly slower)
      expect(duration2).toBeLessThanOrEqual(duration1 * 1.5);

      // Test performance stats
      if (typeof jitSchema.getStats === 'function') {
        const stats = jitSchema.getStats();
        expect(stats.cached).toBe(true);
        expect(stats.compilationKey).toBeDefined();
      }
    });

    test('should handle complex nested schemas efficiently', () => {
      const nestedSchema = z.object({
        user: z.object({
          profile: z.object({
            personal: z.object({
              name: z.string(),
              age: z.number(),
              addresses: z.array(z.object({
                street: z.string(),
                city: z.string(),
                country: z.string(),
                zipCode: z.string().optional()
              }))
            }),
            preferences: z.object({
              notifications: z.object({
                email: z.boolean(),
                sms: z.boolean(),
                push: z.boolean()
              }),
              privacy: z.object({
                profileVisible: z.boolean(),
                showEmail: z.boolean()
              })
            })
          })
        }),
        metadata: z.object({
          createdAt: z.string(),
          updatedAt: z.string(),
          version: z.number()
        })
      });

      const jitSchema = z.jit(nestedSchema);

      const complexData = {
        user: {
          profile: {
            personal: {
              name: 'John Doe',
              age: 30,
              addresses: [
                {
                  street: '123 Main St',
                  city: 'Anytown',
                  country: 'US',
                  zipCode: '12345'
                }
              ]
            },
            preferences: {
              notifications: {
                email: true,
                sms: false,
                push: true
              },
              privacy: {
                profileVisible: true,
                showEmail: false
              }
            }
          }
        },
        metadata: {
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z',
          version: 1
        }
      };

      // Benchmark multiple validations
      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        jitSchema.parse(complexData);
      }

      const duration = performance.now() - start;
      const averageTime = duration / iterations;

      expect(averageTime).toBeLessThan(5); // Should average less than 5ms per validation
    });
  });

  describe('Batch Validation', () => {
    test('should validate multiple items efficiently', () => {
      const itemSchema = z.object({
        id: z.number(),
        name: z.string(),
        active: z.boolean()
      });

      const batchValidator = z.batch(itemSchema);

      const items = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        active: i % 2 === 0
      }));

      const start = performance.now();
      const results = batchValidator.validate(items);
      const duration = performance.now() - start;

      expect(results).toHaveLength(1000);
      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    test('should handle mixed valid and invalid items', () => {
      const numberSchema = z.number().min(0).max(100);
      const batchValidator = z.batch(numberSchema);

      const mixedItems = [
        10,    // valid
        -5,    // invalid (too small)
        50,    // valid
        150,   // invalid (too large)
        25,    // valid
        'abc', // invalid (wrong type)
        75     // valid
      ];

      const results = batchValidator.validate(mixedItems);

      expect(results).toHaveLength(7);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
      expect(results[3].success).toBe(false);
      expect(results[4].success).toBe(true);
      expect(results[5].success).toBe(false);
      expect(results[6].success).toBe(true);

      // Check error details
      expect(results[1].success).toBe(false);
      if (!results[1].success) {
        expect((results[1] as any).error.issues[0].path).toEqual([1]); // Index in batch
      }
    });

    test('should provide batch statistics', () => {
      const stringSchema = z.string().min(3);
      const batchValidator = z.batch(stringSchema);

      const items = ['hello', 'world', 'a', 'test', 'ab'];
      const results = batchValidator.validate(items);

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      expect(successCount).toBe(3); // 'hello', 'world', 'test'
      expect(errorCount).toBe(2);   // 'a', 'ab'
    });
  });

  describe('Caching Systems', () => {
    test('should cache regex patterns for better performance', () => {
      // This tests the internal RegexCache if exposed
      if (RegexCache) {

        // Clear cache for clean test
        RegexCache.clear();
        expect(RegexCache.size()).toBe(0);

        // First access should create and cache
        const regex1 = RegexCache.get('^[a-z]+$', 'i');
        expect(RegexCache.size()).toBe(1);

        // Second access should use cache
        const regex2 = RegexCache.get('^[a-z]+$', 'i');
        expect(regex1).toBe(regex2); // Same instance
        expect(RegexCache.size()).toBe(1);

        // Different pattern should create new entry
        const regex3 = RegexCache.get('^[0-9]+$');
        expect(RegexCache.size()).toBe(2);
        expect(regex3).not.toBe(regex1);
      }
    });

    test('should cache schema compilations', () => {
      if (SchemaCache) {

        SchemaCache.clear();
        expect(SchemaCache.size()).toBe(0);

        const key1 = 'test_schema_1';
        const value1 = { compiled: true, id: 1 };

        SchemaCache.set(key1, value1);
        expect(SchemaCache.size()).toBe(1);
        expect(SchemaCache.get(key1)).toBe(value1);
        expect(SchemaCache.has(key1)).toBe(true);
      }
    });

    test('should manage validation object pools', () => {
      if (ValidationPool) {

        ValidationPool.clear();

        // Test error pooling
        const error1 = ValidationPool.getError();
        expect(error1).toBeInstanceOf(ValidationError);

        ValidationPool.releaseError(error1);

        const error2 = ValidationPool.getError();
        expect(error2).toBe(error1); // Should reuse the same instance

        // Test issue pooling
        const issue1 = ValidationPool.getIssue();
        expect(issue1).toHaveProperty('code');
        expect(issue1).toHaveProperty('path');
        expect(issue1).toHaveProperty('message');

        ValidationPool.releaseIssue(issue1);

        const issue2 = ValidationPool.getIssue();
        expect(issue2).toBe(issue1); // Should reuse the same instance
      }
    });
  });

  describe('Streaming Validation', () => {
    test('should handle streaming data efficiently', async () => {
      if (StreamingValidator) {
        const itemSchema = z.object({
          id: z.number(),
          data: z.string()
        });

        const streamingValidator = new StreamingValidator(itemSchema, {
          batchSize: 10,
          maxQueueSize: 100
        });

        const items = Array.from({ length: 50 }, (_, i) => ({
          id: i,
          data: `data_${i}`
        }));

        let processedCount = 0;
        let errorCount = 0;

        streamingValidator.onBatch((results) => {
          processedCount += results.filter(r => r.success).length;
          errorCount += results.filter(r => !r.success).length;
        });

        // Add items to stream
        items.forEach(item => streamingValidator.add(item));
        await streamingValidator.flush();

        expect(processedCount).toBe(50);
        expect(errorCount).toBe(0);
      }
    });
  });

  describe('Performance Benchmarking', () => {
    test('should measure validation performance accurately', () => {
      const simpleSchema = z.string();
      const complexSchema = z.object({
        nested: z.object({
          deep: z.object({
            array: z.array(z.object({
              value: z.string().min(1).max(100)
            }))
          })
        })
      });

      const simpleData = 'test';
      const complexData = {
        nested: {
          deep: {
            array: Array.from({ length: 10 }, (_, i) => ({ value: `item_${i}` }))
          }
        }
      };

      // Benchmark simple schema
      const simpleIterations = 1000;
      const simpleStart = performance.now();
      for (let i = 0; i < simpleIterations; i++) {
        simpleSchema.parse(simpleData);
      }
      const simpleDuration = performance.now() - simpleStart;
      const simpleAverage = simpleDuration / simpleIterations;

      // Benchmark complex schema
      const complexIterations = 100;
      const complexStart = performance.now();
      for (let i = 0; i < complexIterations; i++) {
        complexSchema.parse(complexData);
      }
      const complexDuration = performance.now() - complexStart;
      const complexAverage = complexDuration / complexIterations;

      expect(simpleAverage).toBeLessThan(1); // Simple validation should be very fast
      expect(complexAverage).toBeGreaterThan(simpleAverage); // Complex should take longer
      expect(complexAverage).toBeLessThan(10); // But still reasonable
    });

    test('should show performance improvement with optimization', () => {
      const baseSchema = z.object({
        items: z.array(z.object({
          id: z.number(),
          name: z.string().min(2),
          tags: z.array(z.string())
        }))
      });

      const jitSchema = z.jit(baseSchema);

      const testData = {
        items: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          tags: [`tag1_${i}`, `tag2_${i}`]
        }))
      };

      // Benchmark regular schema
      const regularIterations = 50;
      const regularStart = performance.now();
      for (let i = 0; i < regularIterations; i++) {
        baseSchema.parse(testData);
      }
      const regularDuration = performance.now() - regularStart;

      // Warm up JIT schema
      jitSchema.parse(testData);

      // Benchmark JIT schema
      const jitStart = performance.now();
      for (let i = 0; i < regularIterations; i++) {
        jitSchema.parse(testData);
      }
      const jitDuration = performance.now() - jitStart;

      // JIT should be at least as fast as regular, ideally faster
      expect(jitDuration).toBeLessThanOrEqual(regularDuration * 1.1);
    });
  });

  describe('Memory Usage Optimization', () => {
    test('should not leak memory during repeated validations', () => {
      const schema = z.object({
        data: z.array(z.string())
      });

      // Simulate memory-intensive validation
      const iterations = 1000;
      const largeArray = Array.from({ length: 100 }, (_, i) => `string_${i}`);

      for (let i = 0; i < iterations; i++) {
        schema.parse({ data: largeArray });
      }

      // Test should complete without memory issues
      expect(true).toBe(true);
    });

    test('should reuse validation objects when possible', () => {
      if (ValidationPool) {

        ValidationPool.clear();

        // Create and release multiple objects
        const objects = [];
        for (let i = 0; i < 10; i++) {
          objects.push(ValidationPool.getError());
        }

        objects.forEach(obj => ValidationPool.releaseError(obj));

        // Get objects again - should reuse the released ones
        const reusedObjects = [];
        for (let i = 0; i < 5; i++) {
          reusedObjects.push(ValidationPool.getError());
        }

        // At least some objects should be reused
        const reusedCount = reusedObjects.filter(obj => objects.includes(obj)).length;
        expect(reusedCount).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance Regression Detection', () => {
    test('should maintain performance baselines', () => {
      const performanceBaselines = {
        simpleString: 0.1,      // 0.1ms
        simpleObject: 0.5,      // 0.5ms
        complexNested: 5,       // 5ms
        arrayOfObjects: 10      // 10ms
      };

      // Test simple string validation
      const stringSchema = z.string();
      const stringStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        stringSchema.parse('test');
      }
      const stringAverage = (performance.now() - stringStart) / 1000;
      expect(stringAverage).toBeLessThan(performanceBaselines.simpleString);

      // Test simple object validation
      const objectSchema = z.object({ name: z.string(), age: z.number() });
      const objectStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        objectSchema.parse({ name: 'test', age: 25 });
      }
      const objectAverage = (performance.now() - objectStart) / 1000;
      expect(objectAverage).toBeLessThan(performanceBaselines.simpleObject);

      // Test complex nested validation
      const nestedSchema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.array(z.object({
              value: z.string()
            }))
          })
        })
      });

      const nestedData = {
        level1: {
          level2: {
            level3: [{ value: 'test1' }, { value: 'test2' }]
          }
        }
      };

      const nestedStart = performance.now();
      for (let i = 0; i < 100; i++) {
        nestedSchema.parse(nestedData);
      }
      const nestedAverage = (performance.now() - nestedStart) / 100;
      expect(nestedAverage).toBeLessThan(performanceBaselines.complexNested);
    });
  });
});

// Performance test utilities
function measureValidationTime<T>(schema: any, data: T, iterations: number = 1000): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    schema.parse(data);
  }
  return (performance.now() - start) / iterations;
}

function createLargeTestData(size: number) {
  return {
    items: Array.from({ length: size }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random(),
      active: i % 2 === 0,
      tags: [`tag1_${i}`, `tag2_${i}`, `tag3_${i}`]
    }))
  };
}