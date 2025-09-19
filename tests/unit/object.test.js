// Unit tests for ZodObject
const { object, string, number, boolean, array, ZodError } = require('../../dist/index.js');

describe('ZodObject', () => {
  describe('Basic validation', () => {
    const schema = object({
      name: string(),
      age: number(),
    });

    test('accepts valid objects', () => {
      const input = { name: 'John', age: 30 };
      const result = schema.parse(input);
      expect(result).toEqual(input);
    });

    test('rejects non-objects', () => {
      expect(() => schema.parse('string')).toThrow(ZodError);
      expect(() => schema.parse(123)).toThrow(ZodError);
      expect(() => schema.parse(null)).toThrow(ZodError);
      expect(() => schema.parse(undefined)).toThrow(ZodError);
      expect(() => schema.parse([])).toThrow(ZodError);

      const result = schema.safeParse('string');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('Expected object');
    });

    test('validates required properties', () => {
      expect(() => schema.parse({ name: 'John' })).toThrow(ZodError);
      expect(() => schema.parse({ age: 30 })).toThrow(ZodError);
      expect(() => schema.parse({})).toThrow(ZodError);

      const result = schema.safeParse({ name: 'John' });
      expect(result.success).toBe(false);
      expect(result.error.issues.some(issue => issue.message === 'Required')).toBe(true);
    });

    test('validates property types', () => {
      expect(() => schema.parse({ name: 123, age: 30 })).toThrow(ZodError);
      expect(() => schema.parse({ name: 'John', age: 'thirty' })).toThrow(ZodError);

      const result = schema.safeParse({ name: 123, age: 30 });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('name');
    });
  });

  describe('Optional properties', () => {
    const schema = object({
      name: string(),
      age: number().optional(),
      email: string().email().optional(),
    });

    test('allows missing optional properties', () => {
      expect(schema.parse({ name: 'John' })).toEqual({ name: 'John' });
      expect(schema.parse({ name: 'John', age: 30 })).toEqual({ name: 'John', age: 30 });
      expect(schema.parse({ name: 'John', email: 'john@example.com' }))
        .toEqual({ name: 'John', email: 'john@example.com' });
    });

    test('validates optional properties when present', () => {
      expect(() => schema.parse({ name: 'John', age: 'thirty' })).toThrow(ZodError);
      expect(() => schema.parse({ name: 'John', email: 'invalid-email' })).toThrow(ZodError);

      const result = schema.safeParse({ name: 'John', email: 'invalid-email' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('email');
    });
  });

  describe('Nested objects', () => {
    const schema = object({
      user: object({
        profile: object({
          name: string(),
          bio: string().optional(),
        }),
        settings: object({
          theme: string(),
          notifications: boolean(),
        }),
      }),
      metadata: object({
        version: string(),
      }),
    });

    test('validates deeply nested objects', () => {
      const validData = {
        user: {
          profile: {
            name: 'John Doe',
            bio: 'Software developer',
          },
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
        metadata: {
          version: '1.0.0',
        },
      };

      expect(schema.parse(validData)).toEqual(validData);
    });

    test('provides correct error paths for nested failures', () => {
      const invalidData = {
        user: {
          profile: {
            name: '', // Could be invalid depending on constraints
          },
          settings: {
            theme: 123, // Invalid: not string
            notifications: 'yes', // Invalid: not boolean
          },
        },
        metadata: {
          version: 123, // Invalid: not string
        },
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);

      const paths = result.error.issues.map(issue => issue.path.join('.'));
      expect(paths).toContain('user.settings.theme');
      expect(paths).toContain('user.settings.notifications');
      expect(paths).toContain('metadata.version');
    });
  });

  describe('Object methods', () => {
    const baseSchema = object({
      id: number(),
      name: string(),
      email: string().email(),
      active: boolean(),
    });

    test('strict() rejects unknown keys', () => {
      const strictSchema = baseSchema.strict();
      const data = { id: 1, name: 'John', email: 'john@example.com', active: true, extra: 'value' };

      expect(() => strictSchema.parse(data)).toThrow(ZodError);

      const result = strictSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('Unrecognized key');
    });

    test('passthrough() allows unknown keys', () => {
      const passthroughSchema = baseSchema.passthrough();
      const data = { id: 1, name: 'John', email: 'john@example.com', active: true, extra: 'value' };

      const result = passthroughSchema.parse(data);
      expect(result).toEqual(data);
    });

    test('partial() makes all properties optional', () => {
      const partialSchema = baseSchema.partial();

      expect(partialSchema.parse({})).toEqual({});
      expect(partialSchema.parse({ name: 'John' })).toEqual({ name: 'John' });
      expect(partialSchema.parse({ name: 'John', email: 'john@example.com' }))
        .toEqual({ name: 'John', email: 'john@example.com' });

      // Should still validate types when present
      expect(() => partialSchema.parse({ name: 123 })).toThrow(ZodError);
    });
  });

  describe('Unknown keys handling', () => {
    const schema = object({
      name: string(),
      age: number(),
    });

    test('strips unknown keys by default', () => {
      const data = { name: 'John', age: 30, extra: 'value' };
      const result = schema.parse(data);

      expect(result).toEqual({ name: 'John', age: 30 });
      expect(result).not.toHaveProperty('extra');
    });

    test('strict mode in constructor', () => {
      const data = { name: 'John', age: 30, extra: 'value' };

      // Default behavior should strip
      const defaultResult = schema.parse(data);
      expect(defaultResult).not.toHaveProperty('extra');

      // Strict should reject
      const strictSchema = schema.strict();
      expect(() => strictSchema.parse(data)).toThrow(ZodError);
    });
  });

  describe('Array properties', () => {
    const schema = object({
      tags: array(string()),
      scores: array(number()),
      friends: array(object({
        name: string(),
        age: number(),
      })),
    });

    test('validates array properties', () => {
      const validData = {
        tags: ['typescript', 'javascript', 'react'],
        scores: [95, 87, 92],
        friends: [
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 30 },
        ],
      };

      expect(schema.parse(validData)).toEqual(validData);
    });

    test('validates array element types', () => {
      const invalidData = {
        tags: ['typescript', 123, 'react'], // Invalid: number in string array
        scores: [95, 'invalid', 92], // Invalid: string in number array
        friends: [
          { name: 'Alice', age: 'twenty-five' }, // Invalid: string age
        ],
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);

      const paths = result.error.issues.map(issue => issue.path.join('.'));
      expect(paths).toContain('tags.1');
      expect(paths).toContain('scores.1');
      expect(paths).toContain('friends.0.age');
    });
  });

  describe('Complex validation scenarios', () => {
    test('cross-field validation would need custom logic', () => {
      // Note: This would require custom refinements in a full implementation
      const schema = object({
        password: string(),
        confirmPassword: string(),
      });

      // Basic validation works
      const validData = {
        password: 'secret123',
        confirmPassword: 'secret123',
      };

      expect(schema.parse(validData)).toEqual(validData);
    });
  });

  describe('Performance characteristics', () => {
    test('handles large objects efficiently', () => {
      const largeSchema = object(
        Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [
            `field${i}`,
            string().optional(),
          ])
        )
      );

      const largeObject = Object.fromEntries(
        Array.from({ length: 50 }, (_, i) => [`field${i}`, `value${i}`])
      );

      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        largeSchema.parse(largeObject);
      }
      const end = Date.now();

      expect(end - start).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('deep nesting performance', () => {
      // Create deeply nested schema
      let schema = object({ value: string() });
      for (let i = 0; i < 5; i++) {
        schema = object({ nested: schema });
      }

      // Create corresponding data
      let data = { value: 'test' };
      for (let i = 0; i < 5; i++) {
        data = { nested: data };
      }

      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        schema.parse(data);
      }
      const end = Date.now();

      expect(end - start).toBeLessThan(500);
    });
  });

  describe('Error accumulation', () => {
    test('collects multiple validation errors', () => {
      const schema = object({
        name: string().min(2),
        age: number().min(18),
        email: string().email(),
      });

      const invalidData = {
        name: 'J', // Too short
        age: 16, // Too young
        email: 'invalid', // Not email format
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues.length).toBeGreaterThan(0);

      const paths = result.error.issues.map(issue => issue.path[0]);
      expect(paths).toContain('name');
      expect(paths).toContain('age');
      expect(paths).toContain('email');
    });

    test('error formatting for objects', () => {
      const schema = object({
        user: object({
          name: string().min(2),
          email: string().email(),
        }),
      });

      const result = schema.safeParse({
        user: {
          name: 'J',
          email: 'invalid',
        },
      });

      expect(result.success).toBe(false);
      const formatted = result.error.format();
      expect(formatted.user).toBeDefined();
    });
  });

  describe('Async methods', () => {
    test('parseAsync works', async () => {
      const schema = object({ name: string(), age: number() });
      const data = { name: 'John', age: 30 };

      const result = await schema.parseAsync(data);
      expect(result).toEqual(data);

      await expect(schema.parseAsync({ name: 'John' })).rejects.toThrow(ZodError);
    });

    test('safeParseAsync works', async () => {
      const schema = object({ name: string(), age: number() });
      const data = { name: 'John', age: 30 };

      const validResult = await schema.safeParseAsync(data);
      expect(validResult.success).toBe(true);
      expect(validResult.data).toEqual(data);

      const invalidResult = await schema.safeParseAsync({ name: 'John' });
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toBeInstanceOf(ZodError);
    });
  });
});