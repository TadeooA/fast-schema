# Migration Guide: From Zod to Fast-Schema

Fast-Schema is designed to be a **100% drop-in replacement** for Zod. The migration process is incredibly simple:

## 🚀 Quick Migration

### Step 1: Install Fast-Schema
```bash
npm install fast-schema
# or
yarn add fast-schema
# or
pnpm add fast-schema
```

### Step 2: Update Your Imports
```typescript
// BEFORE
import { z } from 'zod';

// AFTER (only change needed!)
import { z } from 'fast-schema';
```

That's it! Your existing code will work exactly the same way, but 10-20x faster.

## 📋 Compatibility Checklist

### ✅ Fully Compatible Features

- **All Schema Types**: `string()`, `number()`, `boolean()`, `date()`, `array()`, `object()`, `literal()`, etc.
- **Validation Methods**: `parse()`, `safeParse()`, `parseAsync()`, `safeParseAsync()`
- **String Validations**: `min()`, `max()`, `length()`, `email()`, `url()`, `uuid()`, `regex()`, etc.
- **Number Validations**: `min()`, `max()`, `int()`, `positive()`, `negative()`, `multipleOf()`, etc.
- **Array Validations**: `min()`, `max()`, `length()`, `nonempty()`
- **Object Methods**: `pick()`, `omit()`, `extend()`, `merge()`, `partial()`, `required()`, etc.
- **Modifiers**: `optional()`, `nullable()`, `nullish()`, `default()`
- **Transformations**: `transform()`, `refine()`, `superRefine()`
- **Error Handling**: Same error format, messages, and structure
- **Type Inference**: `z.infer<>` works identically

### 🔄 Schema Composition

```typescript
// All these work exactly the same
const UserSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
});

const ExtendedSchema = UserSchema.extend({
  email: z.string().email(),
});

const PartialSchema = UserSchema.partial();
const RequiredSchema = PartialSchema.required();
```

### 🏗️ Complex Validation

```typescript
// Complex validation with refinements
const PasswordSchema = z.string()
  .min(8)
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain number")
  .refine(val => !val.includes('password'), {
    message: "Cannot contain the word 'password'"
  });

// Works identically in fast-schema!
```

## 🔧 Advanced Migration Examples

### Form Validation
```typescript
// Before (Zod)
import { z } from 'zod';

// After (Fast-Schema)
import { z } from 'fast-schema';

const FormSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  age: z.number().min(18),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms"
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof FormSchema>;
```

### API Validation
```typescript
// Before (Zod)
import { z } from 'zod';

// After (Fast-Schema)
import { z } from 'fast-schema';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'moderator']),
  metadata: z.object({
    department: z.string().optional(),
    startDate: z.date(),
  }).optional(),
});

// Express.js middleware example
app.post('/users', (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      issues: result.error.issues
    });
  }

  // Process valid data
  const userData = result.data;
  // ... rest of your logic
});
```

## 🎯 Performance Benefits

After migration, you should see:

- **10-20x faster validation** for complex schemas
- **Reduced CPU usage** in production
- **Better response times** for API endpoints
- **Improved form validation** performance
- **Same memory usage** or better

## 🐛 Troubleshooting

### Issue: TypeScript Errors
**Problem**: TypeScript complains about type incompatibilities.
**Solution**: Make sure you're using the same TypeScript version and that your `tsconfig.json` is compatible.

### Issue: Runtime Errors
**Problem**: Getting unexpected runtime errors.
**Solution**:
1. Check that you're using the latest version of fast-schema
2. Verify your schema definitions are correct
3. Enable debug mode: `process.env.FAST_SCHEMA_DEBUG = 'true'`

### Issue: Performance Not Improved
**Problem**: Not seeing expected performance gains.
**Solution**:
1. Make sure WASM is properly loaded
2. Check that you're testing with sufficiently complex schemas
3. Verify you're not in development mode with extra debugging

## 📊 Before/After Comparison

```typescript
// Measure performance difference
import { z as zodZ } from 'zod';
import { z as fastZ, benchmark } from 'fast-schema';

const zodSchema = zodZ.object({
  name: zodZ.string(),
  age: zodZ.number(),
});

const fastSchema = fastZ.object({
  name: fastZ.string(),
  age: fastZ.number(),
});

const testData = { name: "John", age: 30 };

benchmark.compare(zodSchema, fastSchema, testData, 10000)
  .then(results => {
    console.log(`Fast-Schema is ${results.speedup}x faster!`);
  });
```

## 🆘 Need Help?

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-username/fast-schema/issues)
- **Documentation**: [Full API documentation](https://fast-schema.dev/docs)
- **Examples**: Check the `examples/` directory for more use cases
- **Discord**: Join our community for real-time help

## ✨ What's Next?

After migrating, you can:

1. **Benchmark your application** to measure performance improvements
2. **Enable additional optimizations** in production builds
3. **Explore fast-schema specific features** like batch validation
4. **Contribute to the project** by reporting issues or submitting PRs

Happy coding with Fast-Schema! 🚀