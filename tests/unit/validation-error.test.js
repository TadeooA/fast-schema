// Unit tests for Fast-Schema ValidationError (clean API)
const { z, ValidationError, SchemaError } = require('../../dist/index.js');

describe('ValidationError (Fast-Schema clean API)', () => {
  describe('Basic error handling', () => {
    const schema = z.string().min(5);

    test('ValidationError is the primary error class', () => {
      expect(() => schema.parse('hi')).toThrow(ValidationError);

      try {
        schema.parse('hi');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.name).toBe('ValidationError');
        expect(error.issues).toBeDefined();
        expect(Array.isArray(error.issues)).toBe(true);
      }
    });

    test('SchemaError is an alias for ValidationError', () => {
      expect(SchemaError).toBe(ValidationError);

      expect(() => schema.parse('hi')).toThrow(SchemaError);
    });

    test('Error contains structured issues', () => {
      try {
        schema.parse('hi');
      } catch (error) {
        expect(error.issues).toHaveLength(1);
        expect(error.issues[0]).toMatchObject({
          code: 'too_small',
          path: [],
          message: expect.stringContaining('at least 5')
        });
      }
    });

    test('Error formatting works correctly', () => {
      try {
        const objectSchema = z.object({
          name: z.string().min(3),
          age: z.number().min(0)
        });

        objectSchema.parse({ name: 'Jo', age: -5 });
      } catch (error) {
        const formatted = error.format();
        expect(formatted.name).toBeDefined();
        expect(formatted.age).toBeDefined();
        expect(formatted.name._errors).toContain(expect.stringContaining('at least 3'));
        expect(formatted.age._errors).toContain(expect.stringContaining('greater than'));
      }
    });

    test('Error flattening works correctly', () => {
      try {
        const objectSchema = z.object({
          user: z.object({
            name: z.string().min(3)
          })
        });

        objectSchema.parse({ user: { name: 'Jo' } });
      } catch (error) {
        const flattened = error.flatten();
        expect(flattened.fieldErrors['user.name']).toBeDefined();
        expect(flattened.fieldErrors['user.name']).toContain(
          expect.stringContaining('at least 3')
        );
      }
    });
  });

  describe('Compatibility layer', () => {
    const schema = z.string().email();

    test('ZodError is still available as alias', () => {
      const { ZodError } = require('../../dist/index.js');

      expect(ZodError).toBe(ValidationError);
      expect(() => schema.parse('invalid')).toThrow(ZodError);
    });

    test('Both APIs work identically', () => {
      let validationError, zodError;

      try {
        schema.parse('invalid-email');
      } catch (error) {
        validationError = error instanceof ValidationError;
        zodError = error instanceof require('../../dist/index.js').ZodError;
      }

      expect(validationError).toBe(true);
      expect(zodError).toBe(true);
    });
  });

  describe('Modern usage patterns', () => {
    test('Recommended pattern with ValidationError', () => {
      const userSchema = z.object({
        email: z.string().email(),
        age: z.number().min(18)
      });

      const result = userSchema.safeParse({
        email: 'invalid-email',
        age: 16
      });

      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
        expect(result.error.issues.length).toBeGreaterThan(0);

        // Modern error handling
        const emailErrors = result.error.issues.filter(
          issue => issue.path.includes('email')
        );
        const ageErrors = result.error.issues.filter(
          issue => issue.path.includes('age')
        );

        expect(emailErrors.length).toBeGreaterThan(0);
        expect(ageErrors.length).toBeGreaterThan(0);
      }
    });
  });
});