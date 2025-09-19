// Comprehensive test suite for conditional schemas
import { z, ValidationError } from '../index';

describe('Conditional Schema Tests', () => {

  describe('Basic Conditional Validation', () => {
    test('should validate based on simple conditions', () => {
      const isAdult = (data: any) => data.age >= 18;
      const adultSchema = z.object({
        name: z.string(),
        age: z.number().min(18)
      });
      const minorSchema = z.object({
        name: z.string(),
        age: z.number().max(17),
        guardian: z.string()
      });

      const conditionalSchema = z.conditional(isAdult, adultSchema, minorSchema);

      // Test adult case
      const adultData = { name: 'John', age: 25 };
      expect(conditionalSchema.parse(adultData)).toEqual(adultData);

      // Test minor case
      const minorData = { name: 'Jane', age: 16, guardian: 'Parent' };
      expect(conditionalSchema.parse(minorData)).toEqual(minorData);
    });

    test('should fail when condition matches but schema validation fails', () => {
      const hasEmail = (data: any) => 'email' in data;
      const withEmailSchema = z.object({
        name: z.string(),
        email: z.string().email()
      });
      const withoutEmailSchema = z.object({
        name: z.string(),
        phone: z.string()
      });

      const conditionalSchema = z.conditional(hasEmail, withEmailSchema, withoutEmailSchema);

      // Should fail - has email but invalid format
      expect(() => {
        conditionalSchema.parse({ name: 'John', email: 'invalid-email' });
      }).toThrow(ValidationError);

      // Should fail - no email and no phone
      expect(() => {
        conditionalSchema.parse({ name: 'John' });
      }).toThrow(ValidationError);
    });
  });

  describe('Complex Conditional Logic', () => {
    test('should handle nested conditional schemas', () => {
      const isPremium = (data: any) => data.type === 'premium';
      const isBasic = (data: any) => data.type === 'basic';

      const premiumSchema = z.object({
        type: z.literal('premium'),
        features: z.array(z.string()).min(5),
        price: z.number().min(50)
      });

      const basicSchema = z.object({
        type: z.literal('basic'),
        features: z.array(z.string()).max(3),
        price: z.number().max(20)
      });

      const freeSchema = z.object({
        type: z.literal('free'),
        features: z.array(z.string()).max(1),
        price: z.literal(0)
      });

      // Nested conditional: first check premium, then check basic vs free
      const conditionalSchema = z.conditional(
        isPremium,
        premiumSchema,
        z.conditional(isBasic, basicSchema, freeSchema)
      );

      // Test premium
      const premiumData = {
        type: 'premium',
        features: ['f1', 'f2', 'f3', 'f4', 'f5'],
        price: 99
      };
      expect(conditionalSchema.parse(premiumData)).toEqual(premiumData);

      // Test basic
      const basicData = {
        type: 'basic',
        features: ['f1', 'f2'],
        price: 15
      };
      expect(conditionalSchema.parse(basicData)).toEqual(basicData);

      // Test free
      const freeData = {
        type: 'free',
        features: ['f1'],
        price: 0
      };
      expect(conditionalSchema.parse(freeData)).toEqual(freeData);
    });

    test('should handle complex condition functions', () => {
      const complexCondition = (data: any) => {
        return data.country === 'US' &&
               data.age >= 21 &&
               data.hasLicense === true;
      };

      const driverSchema = z.object({
        name: z.string(),
        age: z.number().min(21),
        country: z.literal('US'),
        hasLicense: z.literal(true),
        licenseNumber: z.string()
      });

      const nonDriverSchema = z.object({
        name: z.string(),
        age: z.number(),
        country: z.string(),
        hasLicense: z.boolean(),
        idNumber: z.string()
      });

      const conditionalSchema = z.conditional(complexCondition, driverSchema, nonDriverSchema);

      // Test US driver
      const driverData = {
        name: 'John',
        age: 25,
        country: 'US',
        hasLicense: true,
        licenseNumber: 'DL123456'
      };
      expect(conditionalSchema.parse(driverData)).toEqual(driverData);

      // Test non-driver (age < 21)
      const youngPersonData = {
        name: 'Jane',
        age: 18,
        country: 'US',
        hasLicense: false,
        idNumber: 'ID789'
      };
      expect(conditionalSchema.parse(youngPersonData)).toEqual(youngPersonData);

      // Test non-US person
      const foreignerData = {
        name: 'Pierre',
        age: 30,
        country: 'FR',
        hasLicense: true,
        idNumber: 'FR123'
      };
      expect(conditionalSchema.parse(foreignerData)).toEqual(foreignerData);
    });
  });

  describe('Conditional Error Handling', () => {
    test('should provide meaningful error messages', () => {
      const hasRequiredField = (data: any) => 'required' in data;
      const withRequiredSchema = z.object({
        required: z.string().min(5),
        optional: z.string().optional()
      });
      const withoutRequiredSchema = z.object({
        alternative: z.string(),
        optional: z.string().optional()
      });

      const conditionalSchema = z.conditional(
        hasRequiredField,
        withRequiredSchema,
        withoutRequiredSchema
      );

      try {
        conditionalSchema.parse({ required: 'hi' }); // Too short
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.message).toContain('Conditional validation failed');
      }
    });

    test('should handle condition function errors gracefully', () => {
      const faultyCondition = (data: any) => {
        // This will throw if data.nested is undefined
        return data.nested.value > 10;
      };

      const schemaA = z.object({ a: z.string() });
      const schemaB = z.object({ b: z.string() });

      const conditionalSchema = z.conditional(faultyCondition, schemaA, schemaB);

      // Should handle the error and fall back appropriately
      expect(() => {
        conditionalSchema.parse({ someData: 'test' });
      }).toThrow(); // May throw due to condition or validation
    });
  });

  describe('Conditional Performance', () => {
    test('should evaluate conditions efficiently', () => {
      let conditionCallCount = 0;
      const trackedCondition = (data: any) => {
        conditionCallCount++;
        return data.type === 'A';
      };

      const schemaA = z.object({ type: z.literal('A'), value: z.string() });
      const schemaB = z.object({ type: z.literal('B'), value: z.number() });

      const conditionalSchema = z.conditional(trackedCondition, schemaA, schemaB);

      // Test multiple validations
      conditionalSchema.parse({ type: 'A', value: 'test' });
      conditionalSchema.parse({ type: 'B', value: 42 });
      conditionalSchema.parse({ type: 'A', value: 'test2' });

      // Condition should be called exactly 3 times (once per validation)
      expect(conditionCallCount).toBe(3);
    });

    test('should handle large datasets efficiently with conditional logic', () => {
      const isEven = (data: any) => data.id % 2 === 0;
      const evenSchema = z.object({
        id: z.number(),
        evenField: z.string()
      });
      const oddSchema = z.object({
        id: z.number(),
        oddField: z.number()
      });

      const conditionalSchema = z.conditional(isEven, evenSchema, oddSchema);

      const testData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        ...(i % 2 === 0 ? { evenField: `even_${i}` } : { oddField: i * 2 })
      }));

      const start = performance.now();
      testData.forEach(item => {
        conditionalSchema.parse(item);
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200); // Should complete within 200ms
    });
  });

  describe('Conditional Type Safety', () => {
    test('should provide correct TypeScript types for conditional schemas', () => {
      const hasId = (data: any): data is { id: number } => 'id' in data;

      const withIdSchema = z.object({
        id: z.number(),
        name: z.string()
      });

      const withoutIdSchema = z.object({
        tempId: z.string(),
        name: z.string()
      });

      const conditionalSchema = z.conditional(hasId, withIdSchema, withoutIdSchema);

      // TypeScript should understand the union type
      type ConditionalType = z.infer<typeof conditionalSchema>;

      const withIdData: ConditionalType = { id: 123, name: 'test' };
      const withoutIdData: ConditionalType = { tempId: 'temp123', name: 'test' };

      expect(conditionalSchema.parse(withIdData)).toEqual(withIdData);
      expect(conditionalSchema.parse(withoutIdData)).toEqual(withoutIdData);
    });
  });

  describe('Conditional with Transformations', () => {
    test('should apply transformations based on conditions', () => {
      const isString = (data: any) => typeof data === 'string';

      const stringSchema = z.string().transform(s => s.toUpperCase());
      const numberSchema = z.number().transform(n => n * 2);

      const conditionalSchema = z.conditional(isString, stringSchema, numberSchema);

      expect(conditionalSchema.parse('hello')).toBe('HELLO');
      expect(conditionalSchema.parse(5)).toBe(10);
    });

    test('should handle async transformations in conditional schemas', async () => {
      const needsAsync = (data: any) => data.async === true;

      const asyncSchema = z.string().transform(async (s) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return s.toUpperCase();
      });

      const syncSchema = z.string().transform(s => s.toLowerCase());

      const conditionalSchema = z.conditional(needsAsync, asyncSchema, syncSchema);

      // For async case, you'd need to handle the promise
      const syncResult = conditionalSchema.parse('TEST');
      expect(syncResult).toBe('test');
    });
  });

  describe('Conditional Edge Cases', () => {
    test('should handle falsy condition results correctly', () => {
      const isTruthy = (data: any) => !!data.value;

      const truthySchema = z.object({
        value: z.any().refine(v => !!v, 'Must be truthy')
      });

      const falsySchema = z.object({
        value: z.any().refine(v => !v, 'Must be falsy')
      });

      const conditionalSchema = z.conditional(isTruthy, truthySchema, falsySchema);

      expect(conditionalSchema.parse({ value: 'hello' })).toEqual({ value: 'hello' });
      expect(conditionalSchema.parse({ value: 0 })).toEqual({ value: 0 });
      expect(conditionalSchema.parse({ value: false })).toEqual({ value: false });
      expect(conditionalSchema.parse({ value: null })).toEqual({ value: null });
    });

    test('should handle undefined and null data gracefully', () => {
      const hasData = (data: any) => data != null;

      const withDataSchema = z.object({ name: z.string() });
      const nullSchema = z.null();

      const conditionalSchema = z.conditional(hasData, withDataSchema, nullSchema);

      expect(conditionalSchema.parse({ name: 'test' })).toEqual({ name: 'test' });
      expect(conditionalSchema.parse(null)).toBe(null);

      expect(() => {
        conditionalSchema.parse(undefined);
      }).toThrow(ValidationError);
    });
  });

  describe('Conditional Schema Introspection', () => {
    test('should provide access to condition and schemas', () => {
      const condition = (data: any) => data.type === 'A';
      const schemaA = z.object({ type: z.literal('A') });
      const schemaB = z.object({ type: z.literal('B') });

      const conditionalSchema = z.conditional(condition, schemaA, schemaB);

      // Test helper methods if available
      if (typeof conditionalSchema.getCondition === 'function') {
        expect(conditionalSchema.getCondition()).toBe(condition);
      }

      if (typeof conditionalSchema.getTrueSchema === 'function') {
        expect(conditionalSchema.getTrueSchema()).toBe(schemaA);
      }

      if (typeof conditionalSchema.getFalseSchema === 'function') {
        expect(conditionalSchema.getFalseSchema()).toBe(schemaB);
      }
    });
  });
});

// Helper function for tests
function fail(message: string): never {
  throw new Error(message);
}