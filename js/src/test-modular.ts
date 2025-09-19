// Test file to verify modular architecture works
import { z, ValidationError, TypeOf } from './index';

// Test basic schemas
const stringSchema = z.string().min(2).max(50).email();
const numberSchema = z.number().int().positive();
const booleanSchema = z.boolean();

// Test complex schemas
const arraySchema = z.array(z.string());
const objectSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(0),
  active: z.boolean().optional(),
  tags: z.array(z.string())
});

// Test type inference
type User = TypeOf<typeof objectSchema>;

// Test validation
try {
  const validUser = objectSchema.parse({
    name: 'John Doe',
    age: 30,
    active: true,
    tags: ['developer', 'typescript']
  });
  console.log('Valid user:', validUser);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation error:', error.issues);
  }
}

// Test safe parsing
const result = objectSchema.safeParse({
  name: 'Jane',
  age: 25,
  tags: ['designer']
});

if (result.success) {
  console.log('Safe parse success:', result.data);
} else {
  console.log('Safe parse failed:', (result as any).error.issues);
}

// Test unions and literals
const statusSchema = z.union([
  z.literal('pending'),
  z.literal('approved'),
  z.literal('rejected')
]);

type Status = TypeOf<typeof statusSchema>;

// Test transformations
const trimmedString = z.string().min(1).trim();
const upperCaseString = z.string().toUpperCase();

console.log('Modular architecture test completed successfully!');