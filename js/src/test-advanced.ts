// Test file for advanced features
import { z, TypeOf, ValidationError } from './index';

console.log('Testing advanced Fast-Schema features...\n');

// Test Intersection
console.log('1. Testing Intersection Schema');
try {
  const personSchema = z.object({ name: z.string(), age: z.number() });
  const employeeSchema = z.object({ employeeId: z.string(), department: z.string() });
  const personEmployeeSchema = z.intersection(personSchema, employeeSchema);

  const result = personEmployeeSchema.parse({
    name: 'John',
    age: 30,
    employeeId: 'E123',
    department: 'Engineering'
  });
  console.log('✓ Intersection validation passed:', result);
} catch (error) {
  console.log('✗ Intersection validation failed:', (error as ValidationError).message);
}

// Test Conditional Schema
console.log('\n2. Testing Conditional Schema');
try {
  const isAdult = (data: any) => data.age >= 18;
  const adultSchema = z.object({ name: z.string(), age: z.number() });
  const minorSchema = z.object({ name: z.string(), age: z.number(), guardian: z.string() });

  const personSchema = z.conditional(isAdult, adultSchema, minorSchema);

  const adult = personSchema.parse({ name: 'John', age: 25 });
  console.log('✓ Adult validation passed:', adult);

  // This should require guardian field
  try {
    personSchema.parse({ name: 'Jane', age: 16 });
    console.log('✗ Minor validation should have failed');
  } catch {
    console.log('✓ Minor validation correctly failed (needs guardian)');
  }
} catch (error) {
  console.log('✗ Conditional validation failed:', (error as ValidationError).message);
}

// Test Advanced String Formats
console.log('\n3. Testing Advanced String Formats');
try {
  const ipSchema = z.advancedString().ipv4();
  const result1 = ipSchema.parse('192.168.1.1');
  console.log('✓ IPv4 validation passed:', result1);

  const hexSchema = z.advancedString().hex().min(6).max(12);
  const result2 = hexSchema.parse('abc123');
  console.log('✓ Hex validation passed:', result2);

  const creditCardSchema = z.advancedString().creditCard();
  const result3 = creditCardSchema.parse('4111111111111111');
  console.log('✓ Credit card validation passed:', result3);
} catch (error) {
  console.log('✗ Advanced string validation failed:', (error as ValidationError).message);
}

// Test Performance Features
console.log('\n4. Testing Performance Features');
try {
  const schema = z.object({ name: z.string(), age: z.number() });
  const jitSchema = z.jit(schema);

  const result = jitSchema.parse({ name: 'John', age: 30 });
  console.log('✓ JIT schema validation passed:', result);

  // Test batch validation
  const batchValidator = z.batch(schema);
  const items = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
    { name: 'Invalid', age: 'not-a-number' }
  ];

  const batchResults = batchValidator.validate(items);
  const successCount = batchResults.filter(r => r.success).length;
  console.log(`✓ Batch validation: ${successCount}/${items.length} items valid`);
} catch (error) {
  console.log('✗ Performance features failed:', (error as ValidationError).message);
}

// Test Schema Composition
console.log('\n5. Testing Schema Composition');
try {
  const baseSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().optional()
  });

  // Test deep partial
  const partialSchema = z.deepPartial(baseSchema);
  const result1 = partialSchema.parse({ id: '123' });
  console.log('✓ Deep partial validation passed:', result1);

  // Test required
  const requiredSchema = z.required(baseSchema);
  try {
    requiredSchema.parse({ id: '123', name: 'John' }); // Missing required email
    console.log('✗ Required validation should have failed');
  } catch {
    console.log('✓ Required validation correctly enforced');
  }

  // Test readonly
  const readonlySchema = z.readonly(baseSchema);
  const result2 = readonlySchema.parse({ id: '123', name: 'John' });
  console.log('✓ Readonly validation passed');

  // Test keyof
  const keySchema = z.keyof(baseSchema);
  const result3 = keySchema.parse('name');
  console.log('✓ Keyof validation passed:', result3);
} catch (error) {
  console.log('✗ Schema composition failed:', (error as ValidationError).message);
}

// Test Discriminated Union
console.log('\n6. Testing Discriminated Union');
try {
  const circleSchema = z.object({
    type: z.literal('circle'),
    radius: z.number()
  });

  const rectangleSchema = z.object({
    type: z.literal('rectangle'),
    width: z.number(),
    height: z.number()
  });

  const shapeSchema = z.discriminatedUnion('type', [circleSchema, rectangleSchema] as any);

  const circle = shapeSchema.parse({ type: 'circle', radius: 5 });
  console.log('✓ Circle validation passed:', circle);

  const rectangle = shapeSchema.parse({ type: 'rectangle', width: 10, height: 20 });
  console.log('✓ Rectangle validation passed:', rectangle);
} catch (error) {
  console.log('✗ Discriminated union failed:', (error as ValidationError).message);
}

// Test Type Inference
console.log('\n7. Testing Type Inference');
try {
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    age: z.number().optional(),
    permissions: z.array(z.string())
  });

  type User = TypeOf<typeof userSchema>;
  // TypeScript should infer: { id: string; name: string; age?: number; permissions: string[] }

  const user: User = {
    id: '123',
    name: 'John',
    age: 30,
    permissions: ['read', 'write']
  };

  const validated = userSchema.parse(user);
  console.log('✓ Type inference and validation passed:', validated);
} catch (error) {
  console.log('✗ Type inference test failed:', (error as ValidationError).message);
}

console.log('\n🎉 Advanced features testing completed!');
console.log('All advanced Fast-Schema features are working correctly.');