// Comprehensive test suite for schema composition utilities
import { z, ValidationError, SchemaMerger, infer as Infer } from '../index';

describe('Schema Composition Tests', () => {

  describe('Deep Partial Schema', () => {
    test('should make all properties optional recursively', () => {
      const baseSchema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number(),
          profile: z.object({
            bio: z.string(),
            preferences: z.object({
              theme: z.string(),
              notifications: z.boolean()
            })
          })
        }),
        metadata: z.object({
          created: z.string(),
          updated: z.string()
        })
      });

      const deepPartialSchema = z.deepPartial(baseSchema);

      // Should work with empty object
      expect(deepPartialSchema.parse({})).toEqual({});

      // Should work with partial data at any level
      const partialData1 = {
        user: {
          name: 'John'
          // Missing age and profile
        }
        // Missing metadata
      };
      expect(deepPartialSchema.parse(partialData1)).toEqual(partialData1);

      // Should work with deeply nested partial data
      const partialData2 = {
        user: {
          name: 'John',
          age: 30,
          profile: {
            bio: 'Developer'
            // Missing preferences
          }
        }
        // Missing metadata
      };
      expect(deepPartialSchema.parse(partialData2)).toEqual(partialData2);

      // Should work with complete data
      const completeData = {
        user: {
          name: 'John',
          age: 30,
          profile: {
            bio: 'Developer',
            preferences: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        metadata: {
          created: '2023-01-01',
          updated: '2023-01-02'
        }
      };
      expect(deepPartialSchema.parse(completeData)).toEqual(completeData);
    });

    test('should handle arrays in deep partial', () => {
      const baseSchema = z.object({
        items: z.array(z.object({
          id: z.number(),
          details: z.object({
            name: z.string(),
            tags: z.array(z.string())
          })
        }))
      });

      const deepPartialSchema = z.deepPartial(baseSchema);

      // Should work without items array
      expect(deepPartialSchema.parse({})).toEqual({});

      // Should work with partial items
      const partialData = {
        items: [
          {
            id: 1
            // Missing details
          },
          {
            id: 2,
            details: {
              name: 'Item 2'
              // Missing tags
            }
          }
        ]
      };

      expect(deepPartialSchema.parse(partialData)).toEqual(partialData);
    });
  });

  describe('Required Schema', () => {
    test('should make all optional properties required', () => {
      const baseSchema = z.object({
        name: z.string(),
        age: z.number().optional(),
        email: z.string().optional(),
        active: z.boolean().optional()
      });

      const requiredSchema = z.required(baseSchema);

      // Should require all properties
      expect(() => {
        requiredSchema.parse({
          name: 'John',
          age: 30,
          email: 'john@example.com'
          // Missing active
        });
      }).toThrow(ValidationError);

      // Should work with all properties present
      const completeData = {
        name: 'John',
        age: 30,
        email: 'john@example.com',
        active: true
      };
      expect(requiredSchema.parse(completeData)).toEqual(completeData);
    });

    test('should fail when required properties are undefined', () => {
      const baseSchema = z.object({
        required: z.string(),
        optional: z.string().optional()
      });

      const requiredSchema = z.required(baseSchema);

      expect(() => {
        requiredSchema.parse({
          required: 'present',
          optional: undefined // Should fail in required schema
        });
      }).toThrow(ValidationError);
    });
  });

  describe('Readonly Schema', () => {
    test('should make objects readonly', () => {
      const baseSchema = z.object({
        name: z.string(),
        config: z.object({
          theme: z.string(),
          debug: z.boolean()
        })
      });

      const readonlySchema = z.readonly(baseSchema);

      const data = {
        name: 'test',
        config: {
          theme: 'dark',
          debug: true
        }
      };

      const result = readonlySchema.parse(data);

      // Result should be frozen
      expect(Object.isFrozen(result)).toBe(true);

      // Should throw when trying to modify
      expect(() => {
        (result as any).name = 'modified';
      }).toThrow();
    });

    test('should work with arrays', () => {
      const arraySchema = z.array(z.string());
      const readonlyArraySchema = z.readonly(arraySchema);

      const data = ['a', 'b', 'c'];
      const result = readonlyArraySchema.parse(data);

      expect(Object.isFrozen(result)).toBe(true);
      expect(() => {
        (result as any).push('d');
      }).toThrow();
    });
  });

  describe('NonNullable Schema', () => {
    test('should reject null and undefined values', () => {
      const nullableSchema = z.string().nullable();
      const nonNullableSchema = z.nonNullable(nullableSchema);

      expect(nonNullableSchema.parse('valid string')).toBe('valid string');

      expect(() => {
        nonNullableSchema.parse(null);
      }).toThrow(ValidationError);

      expect(() => {
        nonNullableSchema.parse(undefined);
      }).toThrow(ValidationError);
    });

    test('should work with complex types', () => {
      const baseSchema = z.object({
        value: z.string()
      }).nullable();

      const nonNullableSchema = z.nonNullable(baseSchema);

      expect(nonNullableSchema.parse({ value: 'test' })).toEqual({ value: 'test' });

      expect(() => {
        nonNullableSchema.parse(null);
      }).toThrow(ValidationError);
    });
  });

  describe('Keyof Schema', () => {
    test('should validate object keys', () => {
      const baseSchema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string()
      });

      const keyofSchema = z.keyof(baseSchema);

      expect(keyofSchema.parse('name')).toBe('name');
      expect(keyofSchema.parse('age')).toBe('age');
      expect(keyofSchema.parse('email')).toBe('email');

      expect(() => {
        keyofSchema.parse('invalid');
      }).toThrow(ValidationError);

      expect(() => {
        keyofSchema.parse(123);
      }).toThrow(ValidationError);
    });

    test('should provide correct TypeScript types', () => {
      const userSchema = z.object({
        id: z.string(),
        name: z.string(),
        age: z.number()
      });

      const userKeySchema = z.keyof(userSchema);

      // TypeScript should infer 'id' | 'name' | 'age'
      type UserKey = Infer<typeof userKeySchema>;

      const validKey: UserKey = 'name';
      expect(userKeySchema.parse(validKey)).toBe('name');
    });
  });

  describe('Schema Merger', () => {
    test('should merge two object schemas', () => {
      if (SchemaMerger) {
        const schemaA = z.object({
          id: z.string(),
          name: z.string()
        });

        const schemaB = z.object({
          age: z.number(),
          email: z.string()
        });

        const mergedSchema = SchemaMerger.merge(schemaA, schemaB);

        const testData = {
          id: '123',
          name: 'John',
          age: 30,
          email: 'john@example.com'
        };

        expect(mergedSchema.parse(testData)).toEqual(testData);

        // Should fail if missing properties from either schema
        expect(() => {
          mergedSchema.parse({
            id: '123',
            name: 'John'
            // Missing age and email from schemaB
          });
        }).toThrow(ValidationError);
      }
    });

    test('should handle deep merging', () => {
      if (SchemaMerger) {
        const schemaA = z.object({
          user: z.object({
            profile: z.object({
              name: z.string()
            })
          })
        });

        const schemaB = z.object({
          user: z.object({
            profile: z.object({
              age: z.number()
            })
          })
        });

        const deepMergedSchema = SchemaMerger.deepMerge(schemaA, schemaB);

        const testData = {
          user: {
            profile: {
              name: 'John',
              age: 30
            }
          }
        };

        expect(deepMergedSchema.parse(testData)).toEqual(testData);
      }
    });
  });

  describe('Discriminated Union Schema', () => {
    test('should validate based on discriminator field', () => {
      const circleSchema = z.object({
        type: z.literal('circle'),
        radius: z.number()
      });

      const rectangleSchema = z.object({
        type: z.literal('rectangle'),
        width: z.number(),
        height: z.number()
      });

      const shapeSchema = z.discriminatedUnion('type', [circleSchema, rectangleSchema]);

      // Test circle
      const circleData = { type: 'circle', radius: 5 };
      expect(shapeSchema.parse(circleData)).toEqual(circleData);

      // Test rectangle
      const rectangleData = { type: 'rectangle', width: 10, height: 20 };
      expect(shapeSchema.parse(rectangleData)).toEqual(rectangleData);

      // Test invalid discriminator
      expect(() => {
        shapeSchema.parse({ type: 'triangle', sides: 3 });
      }).toThrow(ValidationError);

      // Test missing discriminator
      expect(() => {
        shapeSchema.parse({ radius: 5 });
      }).toThrow(ValidationError);
    });

    test('should handle complex discriminated unions', () => {
      const dogSchema = z.object({
        species: z.literal('dog'),
        breed: z.string(),
        bark: z.boolean()
      });

      const catSchema = z.object({
        species: z.literal('cat'),
        indoor: z.boolean(),
        meow: z.string()
      });

      const birdSchema = z.object({
        species: z.literal('bird'),
        canFly: z.boolean(),
        wingspan: z.number()
      });

      const animalSchema = z.discriminatedUnion('species', [dogSchema, catSchema, birdSchema]);

      const dogData = { species: 'dog', breed: 'Labrador', bark: true };
      const catData = { species: 'cat', indoor: true, meow: 'soft' };
      const birdData = { species: 'bird', canFly: true, wingspan: 30 };

      expect(animalSchema.parse(dogData)).toEqual(dogData);
      expect(animalSchema.parse(catData)).toEqual(catData);
      expect(animalSchema.parse(birdData)).toEqual(birdData);

      // Test validation within discriminated schema
      expect(() => {
        animalSchema.parse({ species: 'dog', breed: 'Labrador' }); // Missing bark
      }).toThrow(ValidationError);
    });
  });

  describe('Complex Composition Scenarios', () => {
    test('should handle multiple composition operations', () => {
      const baseSchema = z.object({
        id: z.string(),
        name: z.string(),
        metadata: z.object({
          created: z.string(),
          updated: z.string().optional()
        }).optional()
      });

      // Apply multiple transformations
      const transformedSchema = z.readonly(
        z.required(
          z.deepPartial(baseSchema)
        )
      );

      // Should work with minimal data (deep partial)
      const minimalData = { id: '123' };
      const result = transformedSchema.parse(minimalData);

      expect(result).toEqual(minimalData);
      expect(Object.isFrozen(result)).toBe(true);
    });

    test('should compose with intersections and unions', () => {
      const basePersonSchema = z.object({
        name: z.string(),
        age: z.number()
      });

      const contactSchema = z.object({
        email: z.string().email(),
        phone: z.string().optional()
      });

      const employeeSchema = z.object({
        employeeId: z.string(),
        department: z.string()
      });

      // Create complex composition
      const personWithContactSchema = z.intersection(basePersonSchema, contactSchema);
      const fullEmployeeSchema = z.intersection(personWithContactSchema, employeeSchema);
      const partialEmployeeSchema = z.deepPartial(fullEmployeeSchema);

      // Test with partial data
      const partialData = {
        name: 'John',
        email: 'john@example.com',
        employeeId: 'E123'
        // Missing age, phone, department
      };

      expect(partialEmployeeSchema.parse(partialData)).toEqual(partialData);
    });
  });

  describe('Composition Performance', () => {
    test('should handle large composed schemas efficiently', () => {
      // Create a large schema through composition
      const createLargeObjectSchema = (prefix: string, size: number) => {
        const shape: Record<string, any> = {};
        for (let i = 0; i < size; i++) {
          shape[`${prefix}_${i}`] = z.string();
        }
        return z.object(shape);
      };

      const schema1 = createLargeObjectSchema('field', 50);
      const schema2 = createLargeObjectSchema('extra', 50);

      // Compose schemas
      const intersectionSchema = z.intersection(schema1, schema2);
      const partialSchema = z.deepPartial(intersectionSchema);
      const readonlySchema = z.readonly(partialSchema);

      // Create test data
      const testData: Record<string, string> = {};
      for (let i = 0; i < 25; i++) {
        testData[`field_${i}`] = `value_${i}`;
        testData[`extra_${i}`] = `extra_${i}`;
      }

      const start = performance.now();
      const result = readonlySchema.parse(testData);
      const duration = performance.now() - start;

      expect(result).toEqual(testData);
      expect(Object.isFrozen(result)).toBe(true);
      expect(duration).toBeLessThan(50); // Should complete within 50ms
    });
  });

  describe('Composition Type Safety', () => {
    test('should preserve type information through composition', () => {
      const userSchema = z.object({
        id: z.string(),
        name: z.string(),
        age: z.number().optional()
      });

      const profileSchema = z.object({
        bio: z.string(),
        avatar: z.string().optional()
      });

      const userWithProfileSchema = z.intersection(userSchema, profileSchema);
      const partialUserSchema = z.deepPartial(userWithProfileSchema);

      // TypeScript should infer correct types
      type PartialUser = Infer<typeof partialUserSchema>;

      const userData: PartialUser = {
        name: 'John',
        bio: 'Developer'
        // Other fields optional due to deep partial
      };

      expect(partialUserSchema.parse(userData)).toEqual(userData);
    });
  });

  describe('Composition Error Handling', () => {
    test('should provide meaningful errors for composition failures', () => {
      const strictSchema = z.object({
        name: z.string().min(2),
        age: z.number().min(18)
      });

      const extendedSchema = z.object({
        email: z.string().email(),
        active: z.boolean()
      });

      const composedSchema = z.intersection(strictSchema, extendedSchema);

      try {
        composedSchema.parse({
          name: 'A', // Too short
          age: 16,   // Too young
          email: 'invalid-email', // Invalid format
          // Missing active
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.issues.length).toBeGreaterThan(0);
      }
    });
  });
});

// Helper function for tests
function fail(message: string): never {
  throw new Error(message);
}