// Main test suite entry point for fast-schema
import { z, ValidationError, FastSchemaWasm } from '../index';

describe('Fast-Schema Test Suite', () => {

  beforeAll(() => {
    console.log('🔬 Running Fast-Schema comprehensive test suite');
    console.log(`📦 WASM Available: ${FastSchemaWasm.isAvailable()}`);
  });

  describe('Basic Functionality', () => {
    test('should export main z object', () => {
      expect(z).toBeDefined();
      expect(typeof z.string).toBe('function');
      expect(typeof z.number).toBe('function');
      expect(typeof z.boolean).toBe('function');
      expect(typeof z.object).toBe('function');
      expect(typeof z.array).toBe('function');
    });

    test('should export ValidationError', () => {
      expect(ValidationError).toBeDefined();
      expect(ValidationError.prototype).toBeInstanceOf(Error);
    });

    test('should export FastSchemaWasm', () => {
      expect(FastSchemaWasm).toBeDefined();
      expect(typeof FastSchemaWasm.isAvailable).toBe('function');
    });

    test('should have WASM utilities on z object', () => {
      expect(z.wasm).toBeDefined();
      expect(typeof z.wasm.isAvailable).toBe('function');
      expect(typeof z.wasm.test).toBe('function');
      expect(typeof z.wasm.hybridize).toBe('function');
    });
  });

  describe('Integration Smoke Tests', () => {
    test('should validate simple types', () => {
      expect(z.string().parse('hello')).toBe('hello');
      expect(z.number().parse(42)).toBe(42);
      expect(z.boolean().parse(true)).toBe(true);
    });

    test('should validate objects', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      const data = { name: 'John', age: 30 };
      expect(schema.parse(data)).toEqual(data);
    });

    test('should validate arrays', () => {
      const schema = z.array(z.string());
      const data = ['a', 'b', 'c'];
      expect(schema.parse(data)).toEqual(data);
    });

    test('should handle validation errors', () => {
      const schema = z.string();
      expect(() => schema.parse(123)).toThrow(ValidationError);
    });

    test('should support safe parsing', () => {
      const schema = z.number();

      const validResult = schema.safeParse(42);
      expect(validResult.success).toBe(true);
      if (validResult.success) {
        expect(validResult.data).toBe(42);
      }

      const invalidResult = schema.safeParse('not a number');
      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe('Advanced Features Smoke Tests', () => {
    test('should support intersections', () => {
      const schemaA = z.object({ a: z.string() });
      const schemaB = z.object({ b: z.number() });
      const intersection = z.intersection(schemaA, schemaB);

      const data = { a: 'test', b: 42 };
      expect(intersection.parse(data)).toEqual(data);
    });

    test('should support conditional validation', () => {
      const hasAge = (data: any) => 'age' in data;
      const withAge = z.object({ name: z.string(), age: z.number() });
      const withoutAge = z.object({ name: z.string() });

      const conditional = z.conditional(hasAge, withAge, withoutAge);

      expect(conditional.parse({ name: 'John', age: 30 })).toEqual({ name: 'John', age: 30 });
      expect(conditional.parse({ name: 'Jane' })).toEqual({ name: 'Jane' });
    });

    test('should support async validation', async () => {
      const asyncValidator = async (data: unknown) => {
        if (typeof data === 'string') {
          return data.toUpperCase();
        }
        throw new Error('Not a string');
      };

      const asyncSchema = z.async(asyncValidator);
      const result = await asyncSchema.parseAsync('hello');
      expect(result).toBe('HELLO');
    });

    test('should support JIT compilation', () => {
      const baseSchema = z.object({
        name: z.string(),
        age: z.number()
      });

      const jitSchema = z.jit(baseSchema);
      const data = { name: 'John', age: 30 };

      expect(jitSchema.parse(data)).toEqual(data);
    });

    test('should support advanced string formats', () => {
      const emailSchema = z.advancedString().email();
      expect(() => emailSchema.parse('invalid')).toThrow();

      // Note: Actual email validation depends on implementation
      // This is a smoke test to ensure the method exists
    });
  });

  describe('WASM Integration Smoke Tests', () => {
    test('should check WASM availability', () => {
      const isAvailable = z.wasm.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });

    test('should create hybrid schemas', () => {
      const baseSchema = z.string();
      const hybridSchema = z.wasm.hybridize(baseSchema);

      expect(hybridSchema.parse('test')).toBe('test');
    });

    test('should handle WASM test', async () => {
      const testResult = await z.wasm.test();
      expect(testResult).toHaveProperty('wasmAvailable');
      expect(testResult).toHaveProperty('wasmWorking');
    });

    test('should provide optimization', () => {
      const schema = z.object({ name: z.string() });
      const optimized = z.wasm.optimize(schema);

      expect(optimized.parse({ name: 'test' })).toEqual({ name: 'test' });
    });
  });

  describe('Performance Smoke Tests', () => {
    test('should handle moderate data sizes efficiently', () => {
      const schema = z.array(z.object({
        id: z.number(),
        name: z.string()
      }));

      const data = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`
      }));

      const start = performance.now();
      const result = schema.parse(data);
      const duration = performance.now() - start;

      expect(result).toHaveLength(100);
      expect(duration).toBeLessThan(50); // Should be fast
    });

    test('should support batch validation', () => {
      const schema = z.string();
      const batchValidator = z.batch(schema);

      const items = ['a', 'b', 'c', 123, 'e']; // Mixed valid/invalid
      const results = batchValidator.validate(items);

      expect(results).toHaveLength(5);
      expect(results[0].success).toBe(true);
      expect(results[3].success).toBe(false); // 123 is not a string
    });
  });

  describe('Error Handling', () => {
    test('should provide detailed error information', () => {
      const schema = z.object({
        name: z.string().min(2),
        age: z.number().min(18)
      });

      try {
        schema.parse({ name: 'A', age: 16 });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.issues.length).toBeGreaterThan(0);
        expect(validationError.issues[0]).toHaveProperty('code');
        expect(validationError.issues[0]).toHaveProperty('message');
        expect(validationError.issues[0]).toHaveProperty('path');
      }
    });

    test('should handle nested validation errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(2)
          })
        })
      });

      try {
        schema.parse({ user: { profile: { name: 'A' } } });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.issues[0].path).toContain('name');
      }
    });
  });

  describe('Type Inference', () => {
    test('should provide correct TypeScript types', () => {
      const userSchema = z.object({
        id: z.string(),
        name: z.string(),
        age: z.number().optional(),
        active: z.boolean()
      });

      type User = z.infer<typeof userSchema>;

      // This should compile correctly with TypeScript
      const user: User = {
        id: '123',
        name: 'John',
        age: 30,
        active: true
      };

      expect(userSchema.parse(user)).toEqual(user);

      // Optional property should work
      const userWithoutAge: User = {
        id: '456',
        name: 'Jane',
        active: false
      };

      expect(userSchema.parse(userWithoutAge)).toEqual(userWithoutAge);
    });
  });

  describe('Backwards Compatibility', () => {
    test('should maintain Zod-like API', () => {
      // These should work like Zod
      expect(typeof z.string).toBe('function');
      expect(typeof z.number).toBe('function');
      expect(typeof z.object).toBe('function');
      expect(typeof z.array).toBe('function');
      expect(typeof z.union).toBe('function');
      expect(typeof z.literal).toBe('function');
      expect(typeof z.enum).toBe('function');
    });

    test('should support Zod-style chaining', () => {
      const schema = z.string().min(2).max(10).optional();

      expect(schema.parse('hello')).toBe('hello');
      expect(schema.parse(undefined)).toBe(undefined);
      expect(() => schema.parse('a')).toThrow(); // Too short
    });
  });

  afterAll(() => {
    console.log('✅ Fast-Schema comprehensive test suite completed successfully');
  });
});

// Helper function for tests
function fail(message: string): never {
  throw new Error(message);
}