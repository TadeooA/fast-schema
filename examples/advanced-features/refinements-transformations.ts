// Advanced Refinements and Transformations Example
// Showcasing features beyond basic Zod functionality

import { z } from '../../js/src/index';

console.log("=== Advanced Refinements and Transformations ===\n");

// 1. Complex Data Transformation Pipeline
console.log("1. Data Transformation Pipeline:");

const UserInputSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferences: z.string(), // JSON string
}).transform((data) => ({
  // Transform to normalized format
  firstName: data.fullName.split(' ')[0],
  lastName: data.fullName.split(' ').slice(1).join(' '),
  email: data.email.toLowerCase(),
  age: new Date().getFullYear() - new Date(data.birthDate).getFullYear(),
  birthDate: new Date(data.birthDate),
  preferences: JSON.parse(data.preferences),
})).refine((data) => data.age >= 18, {
  message: "User must be at least 18 years old",
  path: ["age"]
});

const userInput = {
  fullName: "John Smith Doe",
  email: "JOHN.DOE@EXAMPLE.COM",
  birthDate: "1990-05-15",
  preferences: JSON.stringify({ theme: "dark", notifications: true })
};

const transformedUser = UserInputSchema.parse(userInput);
console.log("✅ Transformed user:", JSON.stringify(transformedUser, null, 2));

console.log("\n" + "=".repeat(50) + "\n");

// 2. Advanced Password Validation with Multiple Refinements
console.log("2. Advanced Password Validation:");

const PasswordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter"
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Password must contain at least one lowercase letter"
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Password must contain at least one number"
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Password must contain at least one special character"
  })
  .refine((val) => !/(.)\\1{2,}/.test(val), {
    message: "Password cannot have more than 2 consecutive identical characters"
  })
  .refine((val) => !/password|123456|qwerty/i.test(val), {
    message: "Password cannot contain common weak patterns"
  });

const passwords = [
  "weak",
  "StrongPass123!",
  "password123",
  "Abc123!@#",
  "AAA123bbb!!!",
];

passwords.forEach((password, index) => {
  console.log(`Testing password ${index + 1}: "${password}"`);
  const result = PasswordSchema.safeParse(password);
  if (result.success) {
    console.log("✅ Password is strong");
  } else {
    console.log("❌ Password validation failed:");
    result.error.issues.forEach(issue => {
      console.log(`   - ${issue.message}`);
    });
  }
  console.log();
});

console.log("=".repeat(50) + "\n");

// 3. Conditional Schema with Dynamic Validation
console.log("3. Conditional Schema with Dynamic Validation:");

const ConditionalFormSchema = z.object({
  accountType: z.enum(["personal", "business"]),
  email: z.string().email(),
  name: z.string().min(1),
}).and(
  z.discriminatedUnion("accountType", [
    z.object({
      accountType: z.literal("personal"),
      age: z.number().min(18).max(120),
      socialSecurity: z.string().regex(/^\\d{3}-\\d{2}-\\d{4}$/).optional(),
    }),
    z.object({
      accountType: z.literal("business"),
      companyName: z.string().min(2),
      taxId: z.string().regex(/^\\d{2}-\\d{7}$/),
      employeeCount: z.number().int().min(1),
    }),
  ])
).superRefine((data, ctx) => {
  // Cross-field validation
  if (data.accountType === "business" && data.employeeCount > 1000) {
    if (!data.email.endsWith("@enterprise.com")) {
      ctx.addIssue({
        code: "custom",
        message: "Large businesses must use enterprise email domain",
        path: ["email"]
      });
    }
  }

  if (data.accountType === "personal" && data.name.split(" ").length < 2) {
    ctx.addIssue({
      code: "custom",
      message: "Personal accounts must provide full name",
      path: ["name"]
    });
  }
});

const testForms = [
  {
    accountType: "personal" as const,
    email: "john@gmail.com",
    name: "John Doe",
    age: 25,
  },
  {
    accountType: "business" as const,
    email: "contact@company.com",
    name: "ACME Corp",
    companyName: "ACME Corporation",
    taxId: "12-3456789",
    employeeCount: 50,
  },
  {
    accountType: "business" as const,
    email: "contact@company.com", // Invalid for large business
    name: "BigCorp",
    companyName: "Big Corporation",
    taxId: "98-7654321",
    employeeCount: 5000,
  }
];

testForms.forEach((form, index) => {
  console.log(`Testing form ${index + 1}:`, JSON.stringify(form, null, 2));
  const result = ConditionalFormSchema.safeParse(form);
  if (result.success) {
    console.log("✅ Form is valid");
  } else {
    console.log("❌ Form validation failed:");
    result.error.issues.forEach(issue => {
      console.log(`   - ${issue.path.join('.')}: ${issue.message}`);
    });
  }
  console.log();
});

console.log("=".repeat(50) + "\n");

// 4. Data Preprocessing and Cleanup
console.log("4. Data Preprocessing and Cleanup:");

const CleanupSchema = z.preprocess(
  // Preprocessing function
  (data: any) => {
    if (typeof data === "object" && data !== null) {
      const cleaned: any = {};

      // Remove empty strings and null values
      for (const [key, value] of Object.entries(data)) {
        if (value !== "" && value !== null && value !== undefined) {
          if (typeof value === "string") {
            cleaned[key] = value.trim();
          } else {
            cleaned[key] = value;
          }
        }
      }

      return cleaned;
    }
    return data;
  },
  // Schema to validate after preprocessing
  z.object({
    username: z.string().min(3),
    email: z.string().email(),
    bio: z.string().max(500).optional(),
  })
);

const messyData = [
  {
    username: "  john123  ",
    email: "  JOHN@EXAMPLE.COM  ",
    bio: "I love coding!",
    extra: "", // Will be removed
    nullValue: null, // Will be removed
  },
  {
    username: "",
    email: "invalid-email",
    bio: null,
  }
];

messyData.forEach((data, index) => {
  console.log(`Processing messy data ${index + 1}:`, JSON.stringify(data, null, 2));
  const result = CleanupSchema.safeParse(data);
  if (result.success) {
    console.log("✅ Cleaned data:", JSON.stringify(result.data, null, 2));
  } else {
    console.log("❌ Failed to process:");
    result.error.issues.forEach(issue => {
      console.log(`   - ${issue.path.join('.')}: ${issue.message}`);
    });
  }
  console.log();
});

console.log("=".repeat(50) + "\n");

// 5. Performance Comparison with WASM
console.log("5. Performance Testing with WASM:");

const PerfTestSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2).max(50),
  email: z.string().email(),
  score: z.number().min(0).max(100),
  active: z.boolean(),
});

// Generate test data
const testData = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  score: Math.floor(Math.random() * 101),
  active: Math.random() > 0.5,
}));

console.log(`Testing with ${testData.length} items...`);

// Measure performance
const startTime = performance.now();
let validCount = 0;

for (const item of testData) {
  const result = PerfTestSchema.safeParse(item);
  if (result.success) validCount++;
}

const endTime = performance.now();
const duration = endTime - startTime;
const itemsPerSecond = Math.round(testData.length / (duration / 1000));

console.log(`✅ Validated ${validCount}/${testData.length} items`);
console.log(`⏱️  Time: ${duration.toFixed(2)}ms`);
console.log(`🚀 Throughput: ${itemsPerSecond.toLocaleString()} items/second`);

if (z.isWasmAvailable()) {
  console.log(`🦀 WASM acceleration: ${z.getWasmSpeedBoost()}x faster`);
} else {
  console.log("⚠️  WASM not available, running pure JavaScript");
}

console.log("\n=== Advanced features demonstration completed ===");

export {
  UserInputSchema,
  PasswordSchema,
  ConditionalFormSchema,
  CleanupSchema,
  PerfTestSchema
};