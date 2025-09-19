// Basic usage example - showing 100% Zod compatibility

// BEFORE (using Zod)
// import { z } from 'zod';

// AFTER (using fast-schema - only change the import!)
import { z } from '../../js/src/index';

// Define a user schema exactly like in Zod
const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(120).optional(),
  tags: z.array(z.string()).max(10),
  isActive: z.boolean(),
  createdAt: z.date(),
});

// Type inference works exactly like Zod
type User = z.infer<typeof UserSchema>;

// Sample data
const validUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  tags: ["developer", "typescript"],
  isActive: true,
  createdAt: new Date(),
};

const invalidUser = {
  id: -1, // Invalid: not positive
  name: "", // Invalid: too short
  email: "invalid-email", // Invalid: not an email
  age: 150, // Invalid: too old
  tags: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"], // Invalid: too many tags
  isActive: "yes", // Invalid: not boolean
  createdAt: "invalid-date", // Invalid: not a date
};

console.log("=== Fast-Schema Basic Usage Example ===\n");

// Test valid data
console.log("Testing valid user data...");
try {
  const result = UserSchema.parse(validUser);
  console.log("✅ Valid data parsed successfully:");
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.log("❌ Unexpected error:", error);
}

console.log("\n" + "=".repeat(50) + "\n");

// Test invalid data with safeParse
console.log("Testing invalid user data with safeParse...");
const safeResult = UserSchema.safeParse(invalidUser);

if (safeResult.success) {
  console.log("✅ Data is valid:", safeResult.data);
} else {
  console.log("❌ Validation failed with errors:");
  console.log(JSON.stringify(safeResult.error.issues, null, 2));

  // Show formatted errors (Zod-compatible format)
  console.log("\nFormatted errors:");
  const formatted = safeResult.error.format();
  console.log(JSON.stringify(formatted, null, 2));
}

console.log("\n" + "=".repeat(50) + "\n");

// Test schema chaining and transformation
console.log("Testing schema chaining...");

const ChainedSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const validCredentials = {
  username: "john_doe",
  password: "SecurePass123",
  confirmPassword: "SecurePass123",
};

const invalidCredentials = {
  username: "jo", // Too short
  password: "weak", // Too weak
  confirmPassword: "different", // Doesn't match
};

console.log("Testing valid credentials...");
try {
  const result = ChainedSchema.parse(validCredentials);
  console.log("✅ Valid credentials:", result);
} catch (error) {
  console.log("❌ Unexpected error:", error);
}

console.log("\nTesting invalid credentials...");
const invalidResult = ChainedSchema.safeParse(invalidCredentials);
if (!invalidResult.success) {
  console.log("❌ Validation errors:");
  invalidResult.error.issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue.path.join('.')}: ${issue.message}`);
  });
}

console.log("\n" + "=".repeat(50) + "\n");

// Test optional and nullable
console.log("Testing optional and nullable fields...");

const FlexibleSchema = z.object({
  required: z.string(),
  optional: z.string().optional(),
  nullable: z.string().nullable(),
  nullish: z.string().nullish(), // optional and nullable
});

const testCases = [
  { required: "test" },
  { required: "test", optional: "optional" },
  { required: "test", nullable: null },
  { required: "test", nullish: undefined },
  { required: "test", nullish: null },
];

testCases.forEach((testCase, index) => {
  console.log(`Test case ${index + 1}:`, testCase);
  const result = FlexibleSchema.safeParse(testCase);
  console.log(`Result: ${result.success ? '✅ Valid' : '❌ Invalid'}`);
  if (!result.success) {
    console.log("Errors:", result.error.issues.map(i => i.message));
  }
  console.log();
});

console.log("=== Example completed ===");

export { UserSchema, ChainedSchema, FlexibleSchema };