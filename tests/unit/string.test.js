// Unit tests for ZodString
const { string, ZodError } = require('../../dist/index.js');

describe('ZodString', () => {
  describe('Basic validation', () => {
    const schema = string();

    test('accepts valid strings', () => {
      expect(schema.parse('hello')).toBe('hello');
      expect(schema.parse('')).toBe('');
      expect(schema.parse('with spaces')).toBe('with spaces');
      expect(schema.parse('123')).toBe('123');
    });

    test('rejects non-strings', () => {
      expect(() => schema.parse(123)).toThrow(ZodError);
      expect(() => schema.parse(true)).toThrow(ZodError);
      expect(() => schema.parse(null)).toThrow(ZodError);
      expect(() => schema.parse(undefined)).toThrow(ZodError);
      expect(() => schema.parse({})).toThrow(ZodError);
      expect(() => schema.parse([])).toThrow(ZodError);
    });

    test('safeParse returns correct structure', () => {
      const validResult = schema.safeParse('hello');
      expect(validResult.success).toBe(true);
      expect(validResult.data).toBe('hello');

      const invalidResult = schema.safeParse(123);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toBeInstanceOf(ZodError);
    });
  });

  describe('Length constraints', () => {
    test('min length validation', () => {
      const schema = string().min(3);

      expect(schema.parse('abc')).toBe('abc');
      expect(schema.parse('abcd')).toBe('abcd');
      expect(() => schema.parse('ab')).toThrow(ZodError);
      expect(() => schema.parse('')).toThrow(ZodError);

      const result = schema.safeParse('ab');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('at least 3');
    });

    test('max length validation', () => {
      const schema = string().max(5);

      expect(schema.parse('')).toBe('');
      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('hello world')).toThrow(ZodError);

      const result = schema.safeParse('hello world');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('at most 5');
    });

    test('exact length validation', () => {
      const schema = string().length(5);

      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('hi')).toThrow(ZodError);
      expect(() => schema.parse('hello world')).toThrow(ZodError);

      const result = schema.safeParse('hi');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('at least 5');
    });

    test('combined length constraints', () => {
      const schema = string().min(2).max(10);

      expect(schema.parse('hi')).toBe('hi');
      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('h')).toThrow(ZodError);
      expect(() => schema.parse('this is too long')).toThrow(ZodError);
    });
  });

  describe('Format validation', () => {
    test('email validation', () => {
      const schema = string().email();

      // Valid emails
      expect(schema.parse('test@example.com')).toBe('test@example.com');
      expect(schema.parse('user.name@domain.co.uk')).toBe('user.name@domain.co.uk');

      // Invalid emails
      expect(() => schema.parse('invalid-email')).toThrow(ZodError);
      expect(() => schema.parse('@example.com')).toThrow(ZodError);
      expect(() => schema.parse('test@')).toThrow(ZodError);

      const result = schema.safeParse('invalid');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('Invalid email');
    });

    test('URL validation', () => {
      const schema = string().url();

      // Valid URLs
      expect(schema.parse('https://example.com')).toBe('https://example.com');
      expect(schema.parse('http://localhost:3000')).toBe('http://localhost:3000');

      // Invalid URLs
      expect(() => schema.parse('not-a-url')).toThrow(ZodError);
      expect(() => schema.parse('example.com')).toThrow(ZodError);

      const result = schema.safeParse('invalid');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('Invalid url');
    });

    test('UUID validation', () => {
      const schema = string().uuid();

      // Valid UUIDs
      expect(schema.parse('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400-e29b-41d4-a716-446655440000');

      // Invalid UUIDs
      expect(() => schema.parse('not-a-uuid')).toThrow(ZodError);
      expect(() => schema.parse('550e8400-e29b-41d4-a716')).toThrow(ZodError);

      const result = schema.safeParse('invalid');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('Invalid uuid');
    });
  });

  describe('Pattern validation', () => {
    test('regex pattern matching', () => {
      const schema = string().regex(/^[a-zA-Z0-9_]+$/);

      expect(schema.parse('valid_username123')).toBe('valid_username123');
      expect(schema.parse('ValidUsername')).toBe('ValidUsername');
      expect(() => schema.parse('invalid-username')).toThrow(ZodError);
      expect(() => schema.parse('invalid username')).toThrow(ZodError);
    });

    test('custom regex with message', () => {
      const schema = string().regex(/^\d+$/, 'Must be digits only');

      expect(schema.parse('123')).toBe('123');
      expect(() => schema.parse('abc')).toThrow(ZodError);

      const result = schema.safeParse('abc');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Must be digits only');
    });

    test('startsWith validation', () => {
      const schema = string().startsWith('hello');

      expect(schema.parse('hello world')).toBe('hello world');
      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('hi there')).toThrow(ZodError);

      const result = schema.safeParse('hi');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('start with "hello"');
    });

    test('endsWith validation', () => {
      const schema = string().endsWith('world');

      expect(schema.parse('hello world')).toBe('hello world');
      expect(schema.parse('world')).toBe('world');
      expect(() => schema.parse('hello there')).toThrow(ZodError);

      const result = schema.safeParse('hello');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('end with "world"');
    });

    test('includes validation', () => {
      const schema = string().includes('test');

      expect(schema.parse('this is a test')).toBe('this is a test');
      expect(schema.parse('testing123')).toBe('testing123');
      expect(() => schema.parse('no match here')).toThrow(ZodError);

      const result = schema.safeParse('no match');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('include "test"');
    });
  });

  describe('Chainable validations', () => {
    test('multiple constraints', () => {
      const schema = string()
        .min(3)
        .max(20)
        .email();

      expect(schema.parse('test@example.com')).toBe('test@example.com');
      expect(() => schema.parse('a@example.com')).toThrow(ZodError); // Too short
      expect(() => schema.parse('not-an-email')).toThrow(ZodError); // Not email format
    });
  });

  describe('Optional and nullable', () => {
    test('optional string', () => {
      const schema = string().optional();

      expect(schema.parse('hello')).toBe('hello');
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(null)).toThrow(ZodError);
      expect(() => schema.parse(123)).toThrow(ZodError);
    });

    test('nullable string', () => {
      const schema = string().nullable();

      expect(schema.parse('hello')).toBe('hello');
      expect(schema.parse(null)).toBeNull();
      expect(() => schema.parse(undefined)).toThrow(ZodError);
      expect(() => schema.parse(123)).toThrow(ZodError);
    });

    test('nullish string', () => {
      const schema = string().nullish();

      expect(schema.parse('hello')).toBe('hello');
      expect(schema.parse(null)).toBeNull();
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(123)).toThrow(ZodError);
    });
  });

  describe('Error handling', () => {
    test('provides detailed error information', () => {
      const schema = string().min(5).email();
      const result = schema.safeParse('hi');

      expect(result.success).toBe(false);
      expect(result.error.issues).toHaveLength(2); // min length + email format
      expect(result.error.issues[0].code).toBe('too_small');
      expect(result.error.issues[1].code).toBe('invalid_string');
    });

    test('error formatting works', () => {
      const schema = string().email();
      const result = schema.safeParse('invalid');

      expect(result.success).toBe(false);
      const formatted = result.error.format();
      expect(formatted._errors).toContain('Invalid email');
    });

    test('error flattening works', () => {
      const schema = string().email();
      const result = schema.safeParse('invalid');

      expect(result.success).toBe(false);
      const flattened = result.error.flatten();
      expect(Array.isArray(flattened.formErrors)).toBe(true);
      expect(typeof flattened.fieldErrors).toBe('object');
    });
  });

  describe('Async methods', () => {
    test('parseAsync works', async () => {
      const schema = string();

      const result = await schema.parseAsync('hello');
      expect(result).toBe('hello');

      await expect(schema.parseAsync(123)).rejects.toThrow(ZodError);
    });

    test('safeParseAsync works', async () => {
      const schema = string();

      const validResult = await schema.safeParseAsync('hello');
      expect(validResult.success).toBe(true);
      expect(validResult.data).toBe('hello');

      const invalidResult = await schema.safeParseAsync(123);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toBeInstanceOf(ZodError);
    });
  });
});