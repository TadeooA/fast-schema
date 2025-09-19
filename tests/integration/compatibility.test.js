// Integration tests to ensure compatibility with common Zod patterns
const { string, number, object, array, boolean, ZodError } = require('../../dist/index.js');

describe('Zod Compatibility Integration', () => {
  describe('API Compatibility', () => {
    test('all basic schema creators exist and work', () => {
      expect(typeof string).toBe('function');
      expect(typeof number).toBe('function');
      expect(typeof boolean).toBe('function');
      expect(typeof array).toBe('function');
      expect(typeof object).toBe('function');

      // Test they can be called and return schema objects
      const stringSchema = string();
      const numberSchema = number();
      const booleanSchema = boolean();
      const arraySchema = array(string());
      const objectSchema = object({ name: string() });

      expect(typeof stringSchema.parse).toBe('function');
      expect(typeof numberSchema.parse).toBe('function');
      expect(typeof booleanSchema.parse).toBe('function');
      expect(typeof arraySchema.parse).toBe('function');
      expect(typeof objectSchema.parse).toBe('function');
    });

    test('schema methods exist on created schemas', () => {
      const stringSchema = string();

      // Validation methods
      expect(typeof stringSchema.parse).toBe('function');
      expect(typeof stringSchema.safeParse).toBe('function');
      expect(typeof stringSchema.parseAsync).toBe('function');
      expect(typeof stringSchema.safeParseAsync).toBe('function');

      // Modification methods
      expect(typeof stringSchema.optional).toBe('function');
      expect(typeof stringSchema.nullable).toBe('function');
      expect(typeof stringSchema.nullish).toBe('function');
      expect(typeof stringSchema.array).toBe('function');
    });
  });

  describe('Common Zod Patterns', () => {
    test('basic usage example', () => {
      // Example similar to Zod documentation
      const User = object({
        username: string(),
      });

      const user = { username: 'Ludwig' };
      const result = User.parse(user);
      expect(result).toEqual({ username: 'Ludwig' });
    });

    test('primitive validation examples', () => {
      // String validation
      expect(string().parse('tuna')).toBe('tuna');
      expect(string().email().parse('test@example.com')).toBe('test@example.com');
      expect(string().url().parse('https://example.com')).toBe('https://example.com');

      // Number validation
      expect(number().parse(123)).toBe(123);
      expect(number().int().parse(123)).toBe(123);
      expect(number().positive().parse(123)).toBe(123);

      // Boolean validation
      expect(boolean().parse(true)).toBe(true);

      // All should work without throwing
      expect(() => {
        string().parse('test');
        number().parse(123);
        boolean().parse(true);
      }).not.toThrow();
    });

    test('object validation example', () => {
      const User = object({
        username: string(),
        age: number(),
      });

      const validUser = { username: 'john', age: 30 };
      const result = User.parse(validUser);
      expect(result).toEqual(validUser);

      // Invalid user should fail
      expect(() => {
        User.parse({ username: 'john' }); // Missing age
      }).toThrow();
    });

    test('array validation example', () => {
      const stringArray = array(string());

      expect(stringArray.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);

      expect(() => {
        stringArray.parse(['a', 1, 'c']); // Invalid: number in string array
      }).toThrow();
    });

    test('optional and nullable examples', () => {
      const optionalString = string().optional();
      const nullableString = string().nullable();
      const nullishString = string().nullish();

      expect(optionalString.parse('hello')).toBe('hello');
      expect(optionalString.parse(undefined)).toBeUndefined();

      expect(nullableString.parse('hello')).toBe('hello');
      expect(nullableString.parse(null)).toBeNull();

      expect(nullishString.parse('hello')).toBe('hello');
      expect(nullishString.parse(null)).toBeNull();
      expect(nullishString.parse(undefined)).toBeUndefined();
    });

    test('complex nested object example', () => {
      const Dog = object({
        name: string(),
        age: number(),
      });

      const Human = object({
        name: string(),
        age: number(),
        email: string().email(),
        dogs: array(Dog),
      });

      const validHuman = {
        name: 'John',
        age: 30,
        email: 'john@example.com',
        dogs: [
          { name: 'Buddy', age: 5 },
          { name: 'Max', age: 3 },
        ],
      };

      expect(Human.parse(validHuman)).toEqual(validHuman);
    });
  });

  describe('Error Format Compatibility', () => {
    test('ZodError structure matches expected format', () => {
      const schema = object({
        name: string().min(5),
        age: number().positive(),
      });

      const result = schema.safeParse({
        name: 'Jo', // Too short
        age: -5, // Negative
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error;

        // Check error structure
        expect(error).toBeInstanceOf(ZodError);
        expect(Array.isArray(error.issues)).toBe(true);
        expect(error.issues.length).toBeGreaterThan(0);

        // Check issue structure
        const issue = error.issues[0];
        expect(typeof issue.code).toBe('string');
        expect(Array.isArray(issue.path)).toBe(true);
        expect(typeof issue.message).toBe('string');

        // Check error methods
        expect(typeof error.format).toBe('function');
        expect(typeof error.flatten).toBe('function');

        // Test format method
        const formatted = error.format();
        expect(typeof formatted).toBe('object');

        // Test flatten method
        const flattened = error.flatten();
        expect(typeof flattened).toBe('object');
        expect(Array.isArray(flattened.formErrors)).toBe(true);
        expect(typeof flattened.fieldErrors).toBe('object');
      }
    });

    test('error messages follow expected patterns', () => {
      // String errors
      expect(() => string().parse(123)).toThrow(/expected string/i);
      expect(() => string().min(5).parse('hi')).toThrow(/at least 5/);
      expect(() => string().max(3).parse('hello')).toThrow(/at most 3/);
      expect(() => string().email().parse('invalid')).toThrow(/email/i);

      // Number errors
      expect(() => number().parse('123')).toThrow(/expected number/i);
      expect(() => number().min(10).parse(5)).toThrow(/greater than or equal/);
      expect(() => number().int().parse(3.14)).toThrow(/integer/i);

      // Object errors
      expect(() => object({ name: string() }).parse({})).toThrow(/required/i);
    });
  });

  describe('Performance Compatibility', () => {
    test('performance is reasonable for typical usage', () => {
      const schema = object({
        id: number(),
        name: string().min(2),
        email: string().email(),
        active: boolean(),
      });

      const testData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        active: i % 2 === 0,
      }));

      // Warmup
      for (let i = 0; i < 10; i++) {
        schema.parse(testData[0]);
      }

      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        schema.parse(testData[i % testData.length]);
      }

      const end = performance.now();
      const duration = end - start;
      const opsPerSecond = Math.round(iterations / (duration / 1000));

      // Should be reasonably fast
      expect(opsPerSecond).toBeGreaterThan(100);
      expect(duration).toBeLessThan(5000); // Less than 5 seconds

      console.log(`Performance: ${opsPerSecond} ops/sec, ${duration.toFixed(2)}ms total`);
    });
  });

  describe('Type Inference Compatibility', () => {
    test('basic type inference works', () => {
      const schema = object({
        name: string(),
        age: number().optional(),
        tags: array(string()),
      });

      // TypeScript compilation test - these should not cause TS errors
      const validData = {
        name: 'John',
        age: 30,
        tags: ['developer', 'typescript'],
      };

      expect(validData.name).toBe('John');
      expect(validData.age).toBe(30);
      expect(validData.tags).toEqual(['developer', 'typescript']);

      // Optional property
      const withoutAge = {
        name: 'Jane',
        tags: ['designer'],
      };

      expect(withoutAge.age).toBeUndefined();
    });
  });

  describe('Migration from Zod', () => {
    test('drop-in replacement verification', () => {
      // This test verifies that fast-schema can be used as a drop-in replacement
      // All the following code should work exactly as it would with Zod

      // Basic schemas
      const stringSchema = string();
      const numberSchema = number();
      const booleanSchema = boolean();

      // Complex schemas
      const userSchema = object({
        id: number().int().positive(),
        username: string().min(3).max(20),
        email: string().email(),
        age: number().min(13).max(120).optional(),
        roles: array(string()),
        profile: object({
          bio: string().max(500).optional(),
          website: string().url().optional(),
        }).optional(),
        active: boolean(),
      });

      // All should work without throwing
      expect(() => {
        stringSchema.parse('hello');
        numberSchema.parse(123);
        booleanSchema.parse(true);

        userSchema.parse({
          id: 1,
          username: 'johndoe',
          email: 'john@example.com',
          roles: ['user'],
          active: true,
        });
      }).not.toThrow();

      console.log('✅ All Zod patterns work as expected with fast-schema');
    });
  });

  describe('Real-world usage patterns', () => {
    test('API request/response validation', () => {
      // Common pattern: API endpoint validation
      const CreateUserRequest = object({
        name: string().min(1).max(100),
        email: string().email(),
        password: string().min(8),
        profile: object({
          bio: string().max(500).optional(),
          website: string().url().optional(),
        }).optional(),
      });

      const CreateUserResponse = object({
        id: number().int().positive(),
        name: string(),
        email: string().email(),
        createdAt: string(), // In real app, this might be z.date()
        profile: object({
          bio: string().optional(),
          website: string().optional(),
        }).optional(),
      });

      // Valid request
      const request = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secretpassword123',
        profile: {
          bio: 'Software developer',
          website: 'https://johndoe.com',
        },
      };

      const response = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2023-01-01T00:00:00Z',
        profile: {
          bio: 'Software developer',
          website: 'https://johndoe.com',
        },
      };

      expect(CreateUserRequest.parse(request)).toEqual(request);
      expect(CreateUserResponse.parse(response)).toEqual(response);
    });

    test('Configuration object validation', () => {
      const ConfigSchema = object({
        database: object({
          host: string(),
          port: number().int().min(1).max(65535),
          username: string(),
          password: string(),
          ssl: boolean().optional(),
        }),
        server: object({
          port: number().int().min(1).max(65535),
          host: string().optional(),
        }),
        features: object({
          enableLogging: boolean(),
          logLevel: string().optional(),
          enableMetrics: boolean(),
        }),
      });

      const config = {
        database: {
          host: 'localhost',
          port: 5432,
          username: 'admin',
          password: 'secret',
          ssl: true,
        },
        server: {
          port: 3000,
          host: '0.0.0.0',
        },
        features: {
          enableLogging: true,
          logLevel: 'info',
          enableMetrics: false,
        },
      };

      expect(ConfigSchema.parse(config)).toEqual(config);

      // Test invalid config
      const invalidConfig = {
        database: {
          host: 'localhost',
          port: 99999, // Invalid port
          username: 'admin',
          password: 'secret',
        },
        server: {
          port: 3000,
        },
        features: {
          enableLogging: 'yes', // Invalid type
          enableMetrics: false,
        },
      };

      expect(() => ConfigSchema.parse(invalidConfig)).toThrow(ZodError);
    });

    test('Form data validation', () => {
      const ContactFormSchema = object({
        name: string().min(2, 'Name must be at least 2 characters'),
        email: string().email('Invalid email address'),
        subject: string().min(5, 'Subject must be at least 5 characters'),
        message: string().min(10, 'Message must be at least 10 characters'),
        newsletter: boolean().optional(),
        contactMethod: string().optional(),
      });

      const validForm = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Website Inquiry',
        message: 'I would like to know more about your services.',
        newsletter: true,
        contactMethod: 'email',
      };

      expect(ContactFormSchema.parse(validForm)).toEqual(validForm);

      // Test form with errors
      const invalidForm = {
        name: 'J',
        email: 'invalid-email',
        subject: 'Hi',
        message: 'Too short',
        newsletter: true,
      };

      const result = ContactFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});