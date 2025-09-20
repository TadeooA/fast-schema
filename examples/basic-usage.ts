/**
 * Basic Usage Examples
 * Shows how to get started with Fast-Schema
 */

import { fast } from '../js/src/api';

// 1. Simple string validation
console.log('=== String Validation ===');

const nameSchema = fast.string().min(2).max(50);

try {
  const name = nameSchema.parse("John Doe");
  console.log('✅ Valid name:', name);
} catch (error) {
  console.log('❌ Invalid name:', error.message);
}

// 2. Email validation
console.log('\n=== Email Validation ===');

const emailSchema = fast.string().email();

try {
  const email = emailSchema.parse("user@example.com");
  console.log('✅ Valid email:', email);
} catch (error) {
  console.log('❌ Invalid email:', error.message);
}

// 3. Number validation
console.log('\n=== Number Validation ===');

const ageSchema = fast.number().int().min(0).max(120);

try {
  const age = ageSchema.parse(25);
  console.log('✅ Valid age:', age);
} catch (error) {
  console.log('❌ Invalid age:', error.message);
}

// 4. Basic object validation
console.log('\n=== Object Validation ===');

const userSchema = fast.object({
  name: fast.string().min(2),
  email: fast.string().email(),
  age: fast.number().int().min(18)
});

const userData = {
  name: "Alice Johnson",
  email: "alice@example.com",
  age: 28
};

try {
  const user = userSchema.parse(userData);
  console.log('✅ Valid user:', user);
} catch (error) {
  console.log('❌ Invalid user:', error.message);
}

// 5. Array validation
console.log('\n=== Array Validation ===');

const tagsSchema = fast.array(fast.string()).min(1).max(5);

try {
  const tags = tagsSchema.parse(["typescript", "validation", "performance"]);
  console.log('✅ Valid tags:', tags);
} catch (error) {
  console.log('❌ Invalid tags:', error.message);
}

// 6. Type inference
console.log('\n=== Type Inference ===');

type User = typeof userSchema._output;

const createUser = (userData: unknown): User => {
  return userSchema.parse(userData);
};

const newUser = createUser({
  name: "Bob Smith",
  email: "bob@example.com",
  age: 35
});

console.log('✅ Created user with inferred type:', newUser);

// 7. Safe parsing (no exceptions)
console.log('\n=== Safe Parsing ===');

const result = userSchema.safeParse({
  name: "Charlie",
  email: "invalid-email",
  age: 30
});

if (result.success) {
  console.log('✅ Valid user:', result.data);
} else {
  console.log('❌ Validation errors:', result.error);
}

export { userSchema, nameSchema, emailSchema, ageSchema, tagsSchema };