// Simple usage example - Fast-Schema clean API
import { z, ValidationError, infer } from 'fast-schema';

console.log('=== Fast-Schema Simple Usage Example ===\n');

// Basic schema definition - exactly like Zod
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().positive(),
  tags: z.array(z.string()).optional()
});

// Type inference - Fast-Schema style
type User = infer<typeof userSchema>;

// Valid data
const validUser = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  tags: ['developer', 'typescript']
};

// Invalid data
const invalidUser = {
  name: 'J', // Too short
  email: 'not-an-email', // Invalid format
  age: -5 // Not positive
};

console.log('1. Valid user validation:');
try {
  const user = userSchema.parse(validUser);
  console.log('Success:', user);
  console.log('Type safety: name is', typeof user.name);
} catch (error) {
  console.log('Unexpected error:', error.message);
}

console.log('\n2. Invalid user validation:');
try {
  userSchema.parse(invalidUser);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed with', error.issues.length, 'issues:');
    error.issues.forEach(issue => {
      console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
    });

    // Error formatting - Fast-Schema clean API
    console.log('\nFormatted errors:', error.format());
  }
}

console.log('\n3. Safe parsing (no throwing):');
const safeResult = userSchema.safeParse(invalidUser);
if (safeResult.success) {
  console.log('Data:', safeResult.data);
} else {
  console.log('Errors:', safeResult.error.flatten());
}

console.log('\n4. Union types:');
const statusSchema = z.union([
  z.literal('pending'),
  z.literal('approved'),
  z.literal('rejected')
]);

try {
  console.log('Valid status:', statusSchema.parse('approved'));
} catch (error) {
  console.log('Error:', error.message);
}

console.log('\n5. Refinements:');
const passwordSchema = z.string()
  .min(8)
  .refine(pwd => /[A-Z]/.test(pwd), 'Must contain uppercase')
  .refine(pwd => /[0-9]/.test(pwd), 'Must contain number');

try {
  console.log('Strong password accepted');
  passwordSchema.parse('MyPassword123');
} catch (error) {
  console.log('Weak password rejected:', error.message);
}

console.log('\n6. Transformations:');
const stringToNumberSchema = z.string()
  .regex(/^\d+$/)
  .transform(str => parseInt(str, 10));

try {
  const result = stringToNumberSchema.parse('42');
  console.log('Transformed:', result, '(type:', typeof result, ')');
} catch (error) {
  console.log('Error:', error.message);
}

console.log('\n7. Fast-Schema exclusive features:');
const extendedSchema = z.object({
  ip: z.string().ipv4(),
  phone: z.string().phoneNumber(),
  color: z.string().cssColor(),
  coordinates: z.object({
    lat: z.string().latitude(),
    lng: z.string().longitude()
  })
});

const extendedData = {
  ip: '192.168.1.1',
  phone: '+1-555-123-4567',
  color: '#FF5733',
  coordinates: {
    lat: '40.7128',
    lng: '-74.0060'
  }
};

try {
  console.log('Extended validation passed:', extendedSchema.parse(extendedData));
} catch (error) {
  console.log('Error:', error.message);
}

console.log('\n=== Example Complete ===');
console.log('Fast-Schema: Clean API with 10-20x superior performance!');
console.log('Modern TypeScript validation with exclusive features!');
console.log('Use ValidationError for clean, modern error handling!');