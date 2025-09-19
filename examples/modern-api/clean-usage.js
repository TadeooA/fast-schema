// Fast-Schema Modern API - Clean, powerful validation without legacy references
// This example shows the recommended usage patterns for new projects

import { z, ValidationError, SchemaType, infer } from 'fast-schema';

console.log('Fast-Schema Modern API Examples\n');

// =============================================================================
// BASIC VALIDATION - Clean API
// =============================================================================

console.log('Basic Validation:');

const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(13).max(120).optional(),
  tags: z.array(z.string()).max(10).optional()
});

// Type inference with Fast-Schema (same as before, but cleaner!)
type User = infer<typeof userSchema>;

const validUser = {
  id: 1,
  name: 'Alice Johnson',
  email: 'alice@example.com',
  age: 28,
  tags: ['developer', 'typescript']
};

try {
  const parsed = userSchema.parse(validUser);
  console.log('Valid user:', parsed);
} catch (error) {
  console.log('Validation failed:', error.message);
}

// =============================================================================
// MODERN ERROR HANDLING - ValidationError (recommended)
// =============================================================================

console.log('\nModern Error Handling:');

const invalidUser = {
  id: -1,        // Invalid: negative
  name: 'A',     // Invalid: too short
  email: 'invalid-email',  // Invalid: not email format
  age: 200       // Invalid: too old
};

try {
  userSchema.parse(invalidUser);
} catch (error) {
  // Modern, clean error handling
  if (error instanceof ValidationError) {
    console.log('Validation failed with', error.issues.length, 'issues:');

    error.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.path.join('.')}: ${issue.message}`);
    });

    // Structured error access
    const formatted = error.format();
    console.log('\nFormatted errors:', JSON.stringify(formatted, null, 2));
  }
}

// =============================================================================
// SAFE PARSING - Recommended pattern
// =============================================================================

console.log('\nSafe Parsing (Recommended):');

const result = userSchema.safeParse(invalidUser);

if (result.success) {
  console.log('User is valid:', result.data);
} else {
  console.log('Validation failed:', result.error.issues.length, 'issues');

  // Group errors by field for better UX
  const errorsByField = result.error.issues.reduce((acc, issue) => {
    const field = issue.path.join('.');
    if (!acc[field]) acc[field] = [];
    acc[field].push(issue.message);
    return acc;
  }, {});

  console.log('Errors by field:', errorsByField);
}

// =============================================================================
// ADVANCED SCHEMAS - Fast-Schema exclusive features
// =============================================================================

console.log('\nAdvanced Fast-Schema Features:');

const advancedSchema = z.object({
  // Standard validations
  username: z.string().min(3).max(20),

  // Fast-Schema exclusive formats (not in Zod!)
  phone: z.string().phoneNumber(),
  ipAddress: z.string().ip(),
  base64Data: z.string().base64(),
  jwt: z.string().jwt(),
  nanoid: z.string().nanoid(),
  cssColor: z.string().cssColor(),
  latitude: z.string().latitude(),
  longitude: z.string().longitude(),
  country: z.string().country(),
  timezone: z.string().timezone(),
  mimeType: z.string().mimeType(),

  // Advanced types
  metadata: z.record(z.any()),
  coordinates: z.tuple([z.number(), z.number()]),
  tags: z.set(z.string()),
  createdAt: z.date(),
  config: z.map(z.string(), z.boolean())
});

// Type inference still works perfectly
type AdvancedData = infer<typeof advancedSchema>;

console.log('Advanced schema created with', Object.keys(advancedSchema.shape).length, 'fields');

// =============================================================================
// REFINEMENTS AND TRANSFORMATIONS
// =============================================================================

console.log('\nRefinements and Transformations:');

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(pwd => /[A-Z]/.test(pwd), 'Must contain uppercase letter')
  .refine(pwd => /[a-z]/.test(pwd), 'Must contain lowercase letter')
  .refine(pwd => /\d/.test(pwd), 'Must contain number')
  .refine(pwd => /[!@#$%^&*]/.test(pwd), 'Must contain special character');

const ageTransform = z.string()
  .transform(str => parseInt(str, 10))
  .refine(num => !isNaN(num), 'Must be a valid number')
  .refine(num => num >= 0, 'Must be positive');

try {
  const password = passwordSchema.parse('SecurePass123!');
  console.log('Strong password validated');

  const age = ageTransform.parse('25');
  console.log('Age transformed:', age, typeof age);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Refinement failed:', error.issues[0].message);
  }
}

// =============================================================================
// SCHEMA COMPOSITION
// =============================================================================

console.log('\nSchema Composition:');

const basePersonSchema = z.object({
  name: z.string(),
  age: z.number()
});

const employeeSchema = basePersonSchema.and(z.object({
  employeeId: z.string(),
  department: z.string()
}));

const customerSchema = basePersonSchema.and(z.object({
  customerId: z.string(),
  orders: z.array(z.string())
}));

// Union for polymorphic data
const personSchema = z.union([employeeSchema, customerSchema]);

type Person = infer<typeof personSchema>;

console.log('Composed schemas ready for polymorphic validation');

// =============================================================================
// PERFORMANCE SHOWCASE
// =============================================================================

console.log('\nPerformance Showcase:');

const simpleSchema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.boolean()
});

const testData = { id: 1, name: 'Test', active: true };
const iterations = 10000;

console.time('Fast-Schema validation');
for (let i = 0; i < iterations; i++) {
  simpleSchema.parse(testData);
}
console.timeEnd('Fast-Schema validation');

console.log(`Validated ${iterations.toLocaleString()} objects successfully!`);
console.log('\nFast-Schema: Modern API, Superior Performance!');

// =============================================================================
// TYPE SAFETY EXAMPLES
// =============================================================================

console.log('\nTypeScript Type Safety:');

// Schema type for function parameters
function processUser(data: SchemaType<typeof userSchema>) {
  // data is fully typed as User
  return `Processing user: ${data.name} (${data.email})`;
}

// Using the clean ValidationError type
function handleValidation(schema: SchemaType<any>, data: unknown): string {
  try {
    const result = schema.parse(data);
    return 'Success';
  } catch (error) {
    if (error instanceof ValidationError) {
      return `Failed: ${error.issues.length} issues`;
    }
    return 'Unknown error';
  }
}

console.log('Type-safe validation functions ready!');