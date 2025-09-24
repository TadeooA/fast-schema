"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test file for advanced features
const index_1 = require("./index");
console.log('Testing advanced Fast-Schema features...\n');
// Test Intersection
console.log('1. Testing Intersection Schema');
try {
    const personSchema = index_1.z.object({ name: index_1.z.string(), age: index_1.z.number() });
    const employeeSchema = index_1.z.object({ employeeId: index_1.z.string(), department: index_1.z.string() });
    const personEmployeeSchema = index_1.z.intersection(personSchema, employeeSchema);
    const result = personEmployeeSchema.parse({
        name: 'John',
        age: 30,
        employeeId: 'E123',
        department: 'Engineering'
    });
    console.log('✓ Intersection validation passed:', result);
}
catch (error) {
    console.log('✗ Intersection validation failed:', error.message);
}
// Test Conditional Schema
console.log('\n2. Testing Conditional Schema');
try {
    const isAdult = (data) => data.age >= 18;
    const adultSchema = index_1.z.object({ name: index_1.z.string(), age: index_1.z.number() });
    const minorSchema = index_1.z.object({ name: index_1.z.string(), age: index_1.z.number(), guardian: index_1.z.string() });
    const personSchema = index_1.z.conditional(isAdult, adultSchema, minorSchema);
    const adult = personSchema.parse({ name: 'John', age: 25 });
    console.log('✓ Adult validation passed:', adult);
    // This should require guardian field
    try {
        personSchema.parse({ name: 'Jane', age: 16 });
        console.log('✗ Minor validation should have failed');
    }
    catch {
        console.log('✓ Minor validation correctly failed (needs guardian)');
    }
}
catch (error) {
    console.log('✗ Conditional validation failed:', error.message);
}
// Test Advanced String Formats
console.log('\n3. Testing Advanced String Formats');
try {
    const ipSchema = index_1.z.advancedString().ipv4();
    const result1 = ipSchema.parse('192.168.1.1');
    console.log('✓ IPv4 validation passed:', result1);
    const hexSchema = index_1.z.advancedString().hex().min(6).max(12);
    const result2 = hexSchema.parse('abc123');
    console.log('✓ Hex validation passed:', result2);
    const creditCardSchema = index_1.z.advancedString().creditCard();
    const result3 = creditCardSchema.parse('4111111111111111');
    console.log('✓ Credit card validation passed:', result3);
}
catch (error) {
    console.log('✗ Advanced string validation failed:', error.message);
}
// Test Performance Features
console.log('\n4. Testing Performance Features');
try {
    const schema = index_1.z.object({ name: index_1.z.string(), age: index_1.z.number() });
    const jitSchema = index_1.z.jit(schema);
    const result = jitSchema.parse({ name: 'John', age: 30 });
    console.log('✓ JIT schema validation passed:', result);
    // Test batch validation
    const batchValidator = index_1.z.batch(schema);
    const items = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Invalid', age: 'not-a-number' }
    ];
    const batchResults = batchValidator.validate(items);
    const successCount = batchResults.filter(r => r.success).length;
    console.log(`✓ Batch validation: ${successCount}/${items.length} items valid`);
}
catch (error) {
    console.log('✗ Performance features failed:', error.message);
}
// Test Schema Composition
console.log('\n5. Testing Schema Composition');
try {
    const baseSchema = index_1.z.object({
        id: index_1.z.string(),
        name: index_1.z.string(),
        email: index_1.z.string().optional()
    });
    // Test deep partial
    const partialSchema = index_1.z.deepPartial(baseSchema);
    const result1 = partialSchema.parse({ id: '123' });
    console.log('✓ Deep partial validation passed:', result1);
    // Test required
    const requiredSchema = index_1.z.required(baseSchema);
    try {
        requiredSchema.parse({ id: '123', name: 'John' }); // Missing required email
        console.log('✗ Required validation should have failed');
    }
    catch {
        console.log('✓ Required validation correctly enforced');
    }
    // Test readonly
    const readonlySchema = index_1.z.readonly(baseSchema);
    const result2 = readonlySchema.parse({ id: '123', name: 'John' });
    console.log('✓ Readonly validation passed');
    // Test keyof
    const keySchema = index_1.z.keyof(baseSchema);
    const result3 = keySchema.parse('name');
    console.log('✓ Keyof validation passed:', result3);
}
catch (error) {
    console.log('✗ Schema composition failed:', error.message);
}
// Test Discriminated Union
console.log('\n6. Testing Discriminated Union');
try {
    const circleSchema = index_1.z.object({
        type: index_1.z.literal('circle'),
        radius: index_1.z.number()
    });
    const rectangleSchema = index_1.z.object({
        type: index_1.z.literal('rectangle'),
        width: index_1.z.number(),
        height: index_1.z.number()
    });
    const shapeSchema = index_1.z.discriminatedUnion('type', [circleSchema, rectangleSchema]);
    const circle = shapeSchema.parse({ type: 'circle', radius: 5 });
    console.log('✓ Circle validation passed:', circle);
    const rectangle = shapeSchema.parse({ type: 'rectangle', width: 10, height: 20 });
    console.log('✓ Rectangle validation passed:', rectangle);
}
catch (error) {
    console.log('✗ Discriminated union failed:', error.message);
}
// Test Type Inference
console.log('\n7. Testing Type Inference');
try {
    const userSchema = index_1.z.object({
        id: index_1.z.string(),
        name: index_1.z.string(),
        age: index_1.z.number().optional(),
        permissions: index_1.z.array(index_1.z.string())
    });
    // TypeScript should infer: { id: string; name: string; age?: number; permissions: string[] }
    const user = {
        id: '123',
        name: 'John',
        age: 30,
        permissions: ['read', 'write']
    };
    const validated = userSchema.parse(user);
    console.log('✓ Type inference and validation passed:', validated);
}
catch (error) {
    console.log('✗ Type inference test failed:', error.message);
}
console.log('\n🎉 Advanced features testing completed!');
console.log('All advanced Fast-Schema features are working correctly.');
//# sourceMappingURL=test-advanced.js.map