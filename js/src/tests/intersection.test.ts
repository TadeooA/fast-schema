// Comprehensive test suite for intersection schemas
import { z, ValidationError } from '../index';

describe('Intersection Schema Tests', () => {

  describe('Basic Intersection Validation', () => {
    test('should merge object properties correctly', () => {
      const personSchema = z.object({
        name: z.string(),
        age: z.number()
      });

      const employeeSchema = z.object({
        employeeId: z.string(),
        department: z.string()
      });

      const personEmployeeSchema = z.intersection(personSchema, employeeSchema);

      const validData = {
        name: 'John Doe',
        age: 30,
        employeeId: 'E123',
        department: 'Engineering'
      };

      const result = personEmployeeSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    test('should fail when required properties are missing', () => {
      const schemaA = z.object({ a: z.string() });
      const schemaB = z.object({ b: z.number() });
      const intersectionSchema = z.intersection(schemaA, schemaB);

      expect(() => {
        intersectionSchema.parse({ a: 'test' }); // Missing 'b'
      }).toThrow(ValidationError);

      expect(() => {
        intersectionSchema.parse({ b: 42 }); // Missing 'a'
      }).toThrow(ValidationError);
    });

    test('should validate primitive type intersections', () => {
      const stringSchema = z.string();
      const literalSchema = z.literal('hello');
      const intersectionSchema = z.intersection(stringSchema, literalSchema);

      expect(intersectionSchema.parse('hello')).toBe('hello');

      expect(() => {
        intersectionSchema.parse('world');
      }).toThrow(ValidationError);
    });
  });

  describe('Complex Intersection Scenarios', () => {
    test('should handle nested object intersections', () => {
      const baseSchema = z.object({
        id: z.string(),
        metadata: z.object({
          created: z.string(),
          version: z.number()
        })
      });

      const extendedSchema = z.object({
        name: z.string(),
        metadata: z.object({
          updated: z.string(),
          author: z.string()
        })
      });

      const intersectionSchema = z.intersection(baseSchema, extendedSchema);

      const validData = {
        id: '123',
        name: 'Test',
        metadata: {
          created: '2023-01-01',
          version: 1,
          updated: '2023-01-02',
          author: 'John'
        }
      };

      const result = intersectionSchema.parse(validData);
      expect(result.metadata.created).toBe('2023-01-01');
      expect(result.metadata.updated).toBe('2023-01-02');
    });

    test('should handle multiple intersections', () => {
      const schemaA = z.object({ a: z.string() });
      const schemaB = z.object({ b: z.number() });
      const schemaC = z.object({ c: z.boolean() });

      const tripleIntersection = z.intersection(
        z.intersection(schemaA, schemaB),
        schemaC
      );

      const validData = { a: 'test', b: 42, c: true };
      expect(tripleIntersection.parse(validData)).toEqual(validData);
    });

    test('should handle array intersections', () => {
      const numberArraySchema = z.array(z.number());
      const minLengthSchema = z.array(z.any()).min(2);

      // Note: This is a conceptual test - actual implementation may vary
      const intersectionSchema = z.intersection(numberArraySchema, minLengthSchema);

      expect(() => {
        intersectionSchema.parse([1]); // Too short
      }).toThrow(ValidationError);

      expect(intersectionSchema.parse([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('Intersection Error Handling', () => {
    test('should provide detailed error messages for failed intersections', () => {
      const schemaA = z.object({
        name: z.string().min(2),
        age: z.number().min(18)
      });

      const schemaB = z.object({
        email: z.string(),
        active: z.boolean()
      });

      const intersectionSchema = z.intersection(schemaA, schemaB);

      try {
        intersectionSchema.parse({
          name: 'A', // Too short
          age: 16,   // Too young
          // Missing email and active
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.issues.length).toBeGreaterThan(0);
      }
    });

    test('should handle conflicting property validations', () => {
      const schemaA = z.object({ value: z.string() });
      const schemaB = z.object({ value: z.number() });

      const intersectionSchema = z.intersection(schemaA, schemaB);

      // This should fail as value cannot be both string and number
      expect(() => {
        intersectionSchema.parse({ value: 'test' });
      }).toThrow(ValidationError);

      expect(() => {
        intersectionSchema.parse({ value: 42 });
      }).toThrow(ValidationError);
    });
  });

  describe('Intersection with Optional Properties', () => {
    test('should handle optional properties correctly', () => {
      const baseSchema = z.object({
        required: z.string(),
        optional: z.string().optional()
      });

      const extendedSchema = z.object({
        additional: z.number(),
        optional: z.string() // Make optional required in intersection
      });

      const intersectionSchema = z.intersection(baseSchema, extendedSchema);

      // Should work with optional property present
      const validData1 = {
        required: 'test',
        optional: 'optional',
        additional: 42
      };
      expect(intersectionSchema.parse(validData1)).toEqual(validData1);

      // Should fail if now-required optional property is missing
      expect(() => {
        intersectionSchema.parse({
          required: 'test',
          additional: 42
          // Missing 'optional' which is now required
        });
      }).toThrow(ValidationError);
    });
  });

  describe('Intersection Performance', () => {
    test('should handle large object intersections efficiently', () => {
      const createLargeSchema = (prefix: string, count: number) => {
        const shape: Record<string, any> = {};
        for (let i = 0; i < count; i++) {
          shape[`${prefix}${i}`] = z.string();
        }
        return z.object(shape);
      };

      const schemaA = createLargeSchema('a', 50);
      const schemaB = createLargeSchema('b', 50);
      const intersectionSchema = z.intersection(schemaA, schemaB);

      const createLargeData = () => {
        const data: Record<string, string> = {};
        for (let i = 0; i < 50; i++) {
          data[`a${i}`] = `value_a${i}`;
          data[`b${i}`] = `value_b${i}`;
        }
        return data;
      };

      const start = performance.now();
      const result = intersectionSchema.parse(createLargeData());
      const duration = performance.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe('Intersection Type Safety', () => {
    test('should provide correct TypeScript types', () => {
      const personSchema = z.object({
        name: z.string(),
        age: z.number()
      });

      const employeeSchema = z.object({
        employeeId: z.string(),
        department: z.string()
      });

      const intersectionSchema = z.intersection(personSchema, employeeSchema);

      // TypeScript should infer the correct type
      type IntersectionType = z.infer<typeof intersectionSchema>;

      const data: IntersectionType = {
        name: 'John',
        age: 30,
        employeeId: 'E123',
        department: 'Engineering'
      };

      expect(intersectionSchema.parse(data)).toEqual(data);
    });
  });

  describe('Intersection with Refinements', () => {
    test('should apply refinements from both schemas', () => {
      const positiveNumberSchema = z.number().refine(n => n > 0, 'Must be positive');
      const evenNumberSchema = z.number().refine(n => n % 2 === 0, 'Must be even');

      const positiveEvenSchema = z.intersection(positiveNumberSchema, evenNumberSchema);

      expect(positiveEvenSchema.parse(2)).toBe(2);
      expect(positiveEvenSchema.parse(4)).toBe(4);

      expect(() => {
        positiveEvenSchema.parse(-2); // Negative
      }).toThrow(ValidationError);

      expect(() => {
        positiveEvenSchema.parse(3); // Odd
      }).toThrow(ValidationError);
    });
  });

  describe('Intersection Edge Cases', () => {
    test('should handle empty object intersections', () => {
      const emptySchema1 = z.object({});
      const emptySchema2 = z.object({});
      const intersectionSchema = z.intersection(emptySchema1, emptySchema2);

      expect(intersectionSchema.parse({})).toEqual({});
    });

    test('should handle null and undefined in intersections', () => {
      const nullableSchema = z.string().nullable();
      const requiredSchema = z.string();

      const intersectionSchema = z.intersection(nullableSchema, requiredSchema);

      expect(intersectionSchema.parse('test')).toBe('test');

      expect(() => {
        intersectionSchema.parse(null);
      }).toThrow(ValidationError);
    });

    test('should handle union within intersection', () => {
      const unionSchema = z.union([z.string(), z.number()]);
      const refinedSchema = z.union([z.string(), z.number()]).refine(
        val => val !== 'forbidden' && val !== 999,
        'Forbidden value'
      );

      const intersectionSchema = z.intersection(unionSchema, refinedSchema);

      expect(intersectionSchema.parse('allowed')).toBe('allowed');
      expect(intersectionSchema.parse(42)).toBe(42);

      expect(() => {
        intersectionSchema.parse('forbidden');
      }).toThrow(ValidationError);

      expect(() => {
        intersectionSchema.parse(999);
      }).toThrow(ValidationError);
    });
  });
});

// Helper function for tests
function fail(message: string): never {
  throw new Error(message);
}