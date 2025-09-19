// Basic usage example: Simple validation
const { string, number, object, array, boolean } = require('../../js/dist/index.js');

console.log('Fast-Schema Basic Usage Examples\n');

// 1. String validation
console.log('1. String Validation:');
const nameSchema = string().min(2).max(50);

try {
  const validName = nameSchema.parse('John Doe');
  console.log('Valid name:', validName);
} catch (error) {
  console.log('Invalid name:', error.message);
}

try {
  nameSchema.parse('J'); // Too short
} catch (error) {
  console.log('Name too short:', error.message);
}

// 2. Number validation
console.log('\n2. Number Validation:');
const ageSchema = number().int().min(0).max(120);

try {
  const validAge = ageSchema.parse(25);
  console.log('Valid age:', validAge);
} catch (error) {
  console.log('Invalid age:', error.message);
}

try {
  ageSchema.parse(-5); // Negative age
} catch (error) {
  console.log('Negative age:', error.message);
}

// 3. Email validation
console.log('\n3. Email Validation:');
const emailSchema = string().email();

try {
  const validEmail = emailSchema.parse('user@example.com');
  console.log('Valid email:', validEmail);
} catch (error) {
  console.log('Invalid email:', error.message);
}

try {
  emailSchema.parse('invalid-email');
} catch (error) {
  console.log('Invalid email format:', error.message);
}

// 4. Object validation
console.log('\n4. Object Validation:');
const userSchema = object({
  name: string().min(2),
  age: number().int().positive(),
  email: string().email(),
  isActive: boolean(),
});

const validUser = {
  name: 'Alice Johnson',
  age: 28,
  email: 'alice@example.com',
  isActive: true,
};

try {
  const user = userSchema.parse(validUser);
  console.log('Valid user:', JSON.stringify(user, null, 2));
} catch (error) {
  console.log('Invalid user:', error.message);
}

// 5. Array validation
console.log('\n5. Array Validation:');
const tagsSchema = array(string().min(1));

try {
  const validTags = tagsSchema.parse(['javascript', 'typescript', 'react']);
  console.log('Valid tags:', validTags);
} catch (error) {
  console.log('Invalid tags:', error.message);
}

// 6. Optional fields
console.log('\n6. Optional Fields:');
const profileSchema = object({
  name: string(),
  bio: string().optional(),
  age: number().optional(),
});

try {
  const profile1 = profileSchema.parse({ name: 'John' });
  console.log('Profile without optional fields:', profile1);

  const profile2 = profileSchema.parse({
    name: 'Jane',
    bio: 'Software developer',
    age: 30
  });
  console.log('Profile with optional fields:', profile2);
} catch (error) {
  console.log('Invalid profile:', error.message);
}

// 7. Nested objects
console.log('\n7. Nested Objects:');
const addressSchema = object({
  street: string(),
  city: string(),
  zipCode: string(),
});

const userWithAddressSchema = object({
  name: string(),
  email: string().email(),
  address: addressSchema,
});

const userWithAddress = {
  name: 'Bob Smith',
  email: 'bob@example.com',
  address: {
    street: '123 Main St',
    city: 'New York',
    zipCode: '10001',
  },
};

try {
  const result = userWithAddressSchema.parse(userWithAddress);
  console.log('User with address:', JSON.stringify(result, null, 2));
} catch (error) {
  console.log('Invalid user with address:', error.message);
}

// 8. Safe parsing (no exceptions)
console.log('\n8. Safe Parsing (safeParse):');
const safeEmailSchema = string().email();

const safeResult1 = safeEmailSchema.safeParse('valid@example.com');
if (safeResult1.success) {
  console.log('Safe parse success:', safeResult1.data);
} else {
  console.log('Safe parse failed:', safeResult1.error.message);
}

const safeResult2 = safeEmailSchema.safeParse('invalid-email');
if (safeResult2.success) {
  console.log('Safe parse success:', safeResult2.data);
} else {
  console.log('Safe parse failed:', safeResult2.error.issues[0].message);
}

// 9. Chaining validations
console.log('\n9. Chaining Validations:');
const passwordSchema = string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number');

try {
  const validPassword = passwordSchema.parse('MyPass123');
  console.log('Valid password accepted');
} catch (error) {
  console.log('Invalid password:', error.message);
}

try {
  passwordSchema.parse('weak');
} catch (error) {
  console.log('Weak password rejected:', error.message);
}

console.log('\nFast-Schema basic examples completed!');
console.log('\nKey takeaways:');
console.log('- Use z.* for all schema creation');
console.log('- Handle errors with ValidationError (clean API)');
console.log('- Use safeParse() for non-throwing validation');
console.log('\nNext steps:');
console.log('- Check out modern-api/ for clean API examples');
console.log('- Run benchmarks: npm run benchmark');
console.log('- Run tests: npm test');