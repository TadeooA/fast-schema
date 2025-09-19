// Unit tests for ZodNumber
const { number, ZodError } = require('../../dist/index.js');

describe('ZodNumber', () => {
  describe('Basic validation', () => {
    const schema = number();

    test('accepts valid numbers', () => {
      expect(schema.parse(42)).toBe(42);
      expect(schema.parse(0)).toBe(0);
      expect(schema.parse(-5)).toBe(-5);
      expect(schema.parse(3.14)).toBe(3.14);
      expect(schema.parse(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('rejects non-numbers', () => {
      expect(() => schema.parse('123')).toThrow(ZodError);
      expect(() => schema.parse(true)).toThrow(ZodError);
      expect(() => schema.parse(null)).toThrow(ZodError);
      expect(() => schema.parse(undefined)).toThrow(ZodError);
      expect(() => schema.parse({})).toThrow(ZodError);
      expect(() => schema.parse([])).toThrow(ZodError);
      expect(() => schema.parse(NaN)).toThrow(ZodError);
      expect(() => schema.parse(Infinity)).toThrow(ZodError);
    });

    test('safeParse returns correct structure', () => {
      const validResult = schema.safeParse(42);
      expect(validResult.success).toBe(true);
      expect(validResult.data).toBe(42);

      const invalidResult = schema.safeParse('123');
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toBeInstanceOf(ZodError);
      expect(invalidResult.error.issues[0].message).toContain('Expected number');
    });
  });

  describe('Range constraints', () => {
    test('min value validation', () => {
      const schema = number().min(10);

      expect(schema.parse(10)).toBe(10);
      expect(schema.parse(15)).toBe(15);
      expect(() => schema.parse(5)).toThrow(ZodError);
      expect(() => schema.parse(-5)).toThrow(ZodError);

      const result = schema.safeParse(5);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('greater than or equal to 10');
    });

    test('max value validation', () => {
      const schema = number().max(100);

      expect(schema.parse(100)).toBe(100);
      expect(schema.parse(50)).toBe(50);
      expect(schema.parse(-10)).toBe(-10);
      expect(() => schema.parse(101)).toThrow(ZodError);
      expect(() => schema.parse(150)).toThrow(ZodError);

      const result = schema.safeParse(150);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('less than or equal to 100');
    });

    test('combined min and max validation', () => {
      const schema = number().min(10).max(100);

      expect(schema.parse(10)).toBe(10);
      expect(schema.parse(50)).toBe(50);
      expect(schema.parse(100)).toBe(100);
      expect(() => schema.parse(5)).toThrow(ZodError);
      expect(() => schema.parse(150)).toThrow(ZodError);
    });
  });

  describe('Integer validation', () => {
    test('int() constraint', () => {
      const schema = number().int();

      expect(schema.parse(42)).toBe(42);
      expect(schema.parse(0)).toBe(0);
      expect(schema.parse(-5)).toBe(-5);
      expect(() => schema.parse(3.14)).toThrow(ZodError);
      expect(() => schema.parse(0.1)).toThrow(ZodError);

      const result = schema.safeParse(3.14);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('Expected integer');
    });

    test('combined int and range validation', () => {
      const schema = number().int().min(1).max(10);

      expect(schema.parse(1)).toBe(1);
      expect(schema.parse(5)).toBe(5);
      expect(schema.parse(10)).toBe(10);
      expect(() => schema.parse(0)).toThrow(ZodError);
      expect(() => schema.parse(11)).toThrow(ZodError);
      expect(() => schema.parse(5.5)).toThrow(ZodError);
    });
  });

  describe('Sign constraints', () => {
    test('positive() validation', () => {
      const schema = number().positive();

      expect(schema.parse(1)).toBe(1);
      expect(schema.parse(0.1)).toBe(0.1);
      expect(schema.parse(100)).toBe(100);
      expect(() => schema.parse(0)).toThrow(ZodError);
      expect(() => schema.parse(-1)).toThrow(ZodError);
      expect(() => schema.parse(-0.1)).toThrow(ZodError);

      const result = schema.safeParse(-5);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('greater than or equal to');
    });

    test('negative() validation', () => {
      const schema = number().negative();

      expect(schema.parse(-1)).toBe(-1);
      expect(schema.parse(-0.1)).toBe(-0.1);
      expect(schema.parse(-100)).toBe(-100);
      expect(() => schema.parse(0)).toThrow(ZodError);
      expect(() => schema.parse(1)).toThrow(ZodError);
      expect(() => schema.parse(0.1)).toThrow(ZodError);

      const result = schema.safeParse(5);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('less than or equal to');
    });

    test('nonnegative() validation', () => {
      const schema = number().nonnegative();

      expect(schema.parse(0)).toBe(0);
      expect(schema.parse(1)).toBe(1);
      expect(schema.parse(100)).toBe(100);
      expect(() => schema.parse(-1)).toThrow(ZodError);
      expect(() => schema.parse(-0.1)).toThrow(ZodError);

      const result = schema.safeParse(-5);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('greater than or equal to 0');
    });

    test('nonpositive() validation', () => {
      const schema = number().nonpositive();

      expect(schema.parse(0)).toBe(0);
      expect(schema.parse(-1)).toBe(-1);
      expect(schema.parse(-100)).toBe(-100);
      expect(() => schema.parse(1)).toThrow(ZodError);
      expect(() => schema.parse(0.1)).toThrow(ZodError);

      const result = schema.safeParse(5);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('less than or equal to 0');
    });
  });

  describe('Chained validations', () => {
    test('multiple constraints', () => {
      const schema = number().int().positive().max(100);

      expect(schema.parse(1)).toBe(1);
      expect(schema.parse(50)).toBe(50);
      expect(schema.parse(100)).toBe(100);
      expect(() => schema.parse(0)).toThrow(ZodError); // Not positive
      expect(() => schema.parse(101)).toThrow(ZodError); // Too big
      expect(() => schema.parse(50.5)).toThrow(ZodError); // Not integer
    });

    test('complex validation chain', () => {
      const schema = number().min(10).max(1000).int();

      expect(schema.parse(10)).toBe(10);
      expect(schema.parse(500)).toBe(500);
      expect(schema.parse(1000)).toBe(1000);
      expect(() => schema.parse(5)).toThrow(ZodError);
      expect(() => schema.parse(1001)).toThrow(ZodError);
      expect(() => schema.parse(50.5)).toThrow(ZodError);
    });
  });

  describe('Optional and nullable', () => {
    test('optional number', () => {
      const schema = number().optional();

      expect(schema.parse(42)).toBe(42);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(null)).toThrow(ZodError);
      expect(() => schema.parse('123')).toThrow(ZodError);
    });

    test('nullable number', () => {
      const schema = number().nullable();

      expect(schema.parse(42)).toBe(42);
      expect(schema.parse(null)).toBeNull();
      expect(() => schema.parse(undefined)).toThrow(ZodError);
      expect(() => schema.parse('123')).toThrow(ZodError);
    });

    test('nullish number', () => {
      const schema = number().nullish();

      expect(schema.parse(42)).toBe(42);
      expect(schema.parse(null)).toBeNull();
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse('123')).toThrow(ZodError);
    });
  });

  describe('Error handling', () => {
    test('provides detailed error information', () => {
      const schema = number().min(10).max(5); // Impossible constraint
      const result = schema.safeParse(7);

      expect(result.success).toBe(false);
      expect(result.error.issues).toHaveLength(1); // Only first error
      expect(result.error.issues[0].code).toBe('too_small');
    });

    test('multiple validation errors', () => {
      const schema = number().min(10).int();
      const result = schema.safeParse(5.5);

      expect(result.success).toBe(false);
      expect(result.error.issues).toHaveLength(2); // min + integer
    });

    test('error formatting works', () => {
      const schema = number().positive();
      const result = schema.safeParse(-5);

      expect(result.success).toBe(false);
      const formatted = result.error.format();
      expect(formatted._errors.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    test('handles large numbers efficiently', () => {
      const schema = number().min(0).max(Number.MAX_SAFE_INTEGER);

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        schema.parse(Math.random() * 1000000);
      }
      const end = Date.now();

      expect(end - start).toBeLessThan(100); // Should complete quickly
    });
  });

  describe('Edge cases', () => {
    test('handles zero correctly', () => {
      const positiveSchema = number().positive();
      const nonnegativeSchema = number().nonnegative();
      const negativeSchema = number().negative();
      const nonpositiveSchema = number().nonpositive();

      expect(() => positiveSchema.parse(0)).toThrow(ZodError);
      expect(nonnegativeSchema.parse(0)).toBe(0);
      expect(() => negativeSchema.parse(0)).toThrow(ZodError);
      expect(nonpositiveSchema.parse(0)).toBe(0);
    });

    test('handles floating point precision', () => {
      const schema = number();

      expect(schema.parse(0.1 + 0.2)).toBeCloseTo(0.3);
      expect(schema.parse(Number.EPSILON)).toBe(Number.EPSILON);
    });

    test('handles large integers', () => {
      const schema = number().int();

      expect(schema.parse(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
      expect(schema.parse(Number.MIN_SAFE_INTEGER)).toBe(Number.MIN_SAFE_INTEGER);
    });
  });

  describe('Async methods', () => {
    test('parseAsync works', async () => {
      const schema = number();

      const result = await schema.parseAsync(42);
      expect(result).toBe(42);

      await expect(schema.parseAsync('123')).rejects.toThrow(ZodError);
    });

    test('safeParseAsync works', async () => {
      const schema = number();

      const validResult = await schema.safeParseAsync(42);
      expect(validResult.success).toBe(true);
      expect(validResult.data).toBe(42);

      const invalidResult = await schema.safeParseAsync('123');
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toBeInstanceOf(ZodError);
    });
  });
});