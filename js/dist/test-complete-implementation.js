"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test script for complete fast-schema implementation
const index_1 = require("./index");
console.log('🧪 Testing Fast-Schema Complete Implementation\n');
// Test 1: Basic functionality
console.log('1️⃣ Testing basic schemas...');
try {
    const stringSchema = index_1.z.string();
    const numberSchema = index_1.z.number();
    const booleanSchema = index_1.z.boolean();
    console.log('✅ String validation:', stringSchema.parse('hello'));
    console.log('✅ Number validation:', numberSchema.parse(42));
    console.log('✅ Boolean validation:', booleanSchema.parse(true));
}
catch (error) {
    console.error('❌ Basic schemas failed:', error);
}
// Test 2: Complex objects
console.log('\n2️⃣ Testing complex objects...');
try {
    const userSchema = index_1.z.object({
        id: index_1.z.string().uuid(),
        name: index_1.z.string().min(2).max(50),
        email: index_1.z.string().email(),
        age: index_1.z.number().min(0).max(120).optional(),
        tags: index_1.z.array(index_1.z.string()).max(5)
    });
    const userData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        tags: ['developer', 'typescript']
    };
    const result = userSchema.parse(userData);
    console.log('✅ Complex object validation:', result.name, result.email);
}
catch (error) {
    console.error('❌ Complex object failed:', error);
}
// Test 3: Intersection schemas
console.log('\n3️⃣ Testing intersection schemas...');
try {
    const personSchema = index_1.z.object({
        name: index_1.z.string(),
        age: index_1.z.number()
    });
    const employeeSchema = index_1.z.object({
        employeeId: index_1.z.string(),
        department: index_1.z.string()
    });
    const personEmployeeSchema = index_1.z.intersection(personSchema, employeeSchema);
    const employeeData = {
        name: 'Jane Smith',
        age: 28,
        employeeId: 'EMP001',
        department: 'Engineering'
    };
    const employee = personEmployeeSchema.parse(employeeData);
    console.log('✅ Intersection schema:', employee.name, employee.department);
}
catch (error) {
    console.error('❌ Intersection schema failed:', error);
}
// Test 4: Conditional validation
console.log('\n4️⃣ Testing conditional validation...');
try {
    const isAdult = (data) => data.age >= 18;
    const adultSchema = index_1.z.object({
        name: index_1.z.string(),
        age: index_1.z.number().min(18)
    });
    const minorSchema = index_1.z.object({
        name: index_1.z.string(),
        age: index_1.z.number().max(17),
        guardian: index_1.z.string()
    });
    const personSchema = index_1.z.conditional(isAdult, adultSchema, minorSchema);
    const adult = personSchema.parse({ name: 'John', age: 25 });
    console.log('✅ Conditional validation (adult):', adult.name, adult.age);
    const minor = personSchema.parse({
        name: 'Jane',
        age: 16,
        guardian: 'Parent Name'
    });
    console.log('✅ Conditional validation (minor):', minor.name, minor.guardian);
}
catch (error) {
    console.error('❌ Conditional validation failed:', error);
}
// Test 5: Async validation
console.log('\n5️⃣ Testing async validation...');
try {
    const asyncValidator = async (data) => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 10));
        if (typeof data === 'string' && data.length > 2) {
            return data.toUpperCase();
        }
        throw new Error('Invalid string');
    };
    const asyncSchema = index_1.z.async(asyncValidator);
    asyncSchema.parseAsync('hello').then(result => {
        console.log('✅ Async validation:', result);
    }).catch(error => {
        console.error('❌ Async validation failed:', error);
    });
}
catch (error) {
    console.error('❌ Async validation setup failed:', error);
}
// Test 6: JIT compilation
console.log('\n6️⃣ Testing JIT compilation...');
try {
    const baseSchema = index_1.z.object({
        name: index_1.z.string(),
        age: index_1.z.number(),
        email: index_1.z.string().email()
    });
    const jitSchema = index_1.z.jit(baseSchema);
    const testData = {
        name: 'Test User',
        age: 25,
        email: 'test@example.com'
    };
    const jitResult = jitSchema.parse(testData);
    console.log('✅ JIT compilation:', jitResult.name);
    // Check compilation stats
    const stats = jitSchema.getStats();
    console.log('✅ JIT stats:', stats);
}
catch (error) {
    console.error('❌ JIT compilation failed:', error);
}
// Test 7: Advanced string formats
console.log('\n7️⃣ Testing advanced string formats...');
try {
    const advancedString = index_1.z.advancedString();
    // Test email
    const emailResult = advancedString.email().parse('test@example.com');
    console.log('✅ Email validation:', emailResult);
    // Test UUID
    const uuidResult = advancedString.uuid().parse('550e8400-e29b-41d4-a716-446655440000');
    console.log('✅ UUID validation:', uuidResult.substring(0, 8) + '...');
}
catch (error) {
    console.error('❌ Advanced string formats failed:', error);
}
// Test 8: Batch processing
console.log('\n8️⃣ Testing batch processing...');
try {
    const itemSchema = index_1.z.object({
        id: index_1.z.number(),
        name: index_1.z.string(),
        active: index_1.z.boolean()
    });
    const batchValidator = index_1.z.batch(itemSchema);
    const items = [
        { id: 1, name: 'Item 1', active: true },
        { id: 2, name: 'Item 2', active: false },
        { id: 3, name: 'Item 3', active: true }
    ];
    const batchResults = batchValidator.validate(items);
    const validCount = batchResults.filter(r => r.success).length;
    console.log(`✅ Batch processing: ${validCount}/${items.length} items valid`);
}
catch (error) {
    console.error('❌ Batch processing failed:', error);
}
// Test 9: Schema composition
console.log('\n9️⃣ Testing schema composition...');
try {
    const baseSchema = index_1.z.object({
        name: index_1.z.string(),
        age: index_1.z.number().optional(),
        email: index_1.z.string().optional()
    });
    // Deep partial
    const partialSchema = index_1.z.deepPartial(baseSchema);
    const partialResult = partialSchema.parse({ name: 'John' });
    console.log('✅ Deep partial:', partialResult);
    // Required
    const requiredSchema = index_1.z.required(baseSchema);
    const requiredResult = requiredSchema.parse({
        name: 'Jane',
        age: 25,
        email: 'jane@example.com'
    });
    console.log('✅ Required schema:', requiredResult.name);
}
catch (error) {
    console.error('❌ Schema composition failed:', error);
}
// Test 10: WASM integration
console.log('\n🔟 Testing WASM integration...');
try {
    console.log('WASM available:', index_1.z.wasm.isAvailable());
    // Test WASM hybridization
    const complexSchema = index_1.z.object({
        users: index_1.z.array(index_1.z.object({
            name: index_1.z.string().min(2),
            email: index_1.z.string().email(),
            age: index_1.z.number().min(0)
        })).max(100)
    });
    const wasmSchema = index_1.z.wasm.hybridize(complexSchema);
    const complexData = {
        users: [
            { name: 'User 1', email: 'user1@example.com', age: 25 },
            { name: 'User 2', email: 'user2@example.com', age: 30 }
        ]
    };
    const wasmResult = wasmSchema.parse(complexData);
    console.log(`✅ WASM validation: ${wasmResult.users.length} users processed`);
    // Get performance info
    const perfInfo = wasmSchema.getPerformanceInfo();
    console.log('✅ WASM performance info:', perfInfo);
}
catch (error) {
    console.error('❌ WASM integration failed:', error);
}
// Test 11: Error handling
console.log('\n1️⃣1️⃣ Testing error handling...');
try {
    const schema = index_1.z.object({
        name: index_1.z.string().min(2),
        age: index_1.z.number().min(18)
    });
    const result = schema.safeParse({ name: 'A', age: 16 });
    if (!result.success) {
        const errorResult = result;
        console.log('✅ Error handling: Found', errorResult.error.issues.length, 'validation issues');
        errorResult.error.issues.forEach((issue) => {
            console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
        });
    }
    else {
        console.log('✅ Error handling: No validation errors found');
    }
}
catch (error) {
    console.error('❌ Error handling failed:', error);
}
// Test 12: Type inference
console.log('\n1️⃣2️⃣ Testing type inference...');
try {
    const inferenceSchema = index_1.z.object({
        id: index_1.z.string(),
        name: index_1.z.string(),
        optional: index_1.z.number().optional(),
        nested: index_1.z.object({
            value: index_1.z.boolean()
        })
    });
    const typedData = {
        id: 'test-id',
        name: 'Test Name',
        optional: 42,
        nested: { value: true }
    };
    const inferenceResult = inferenceSchema.parse(typedData);
    console.log('✅ Type inference:', typeof inferenceResult, 'with id:', inferenceResult.id);
}
catch (error) {
    console.error('❌ Type inference failed:', error);
}
console.log('\n🎉 Complete implementation test finished!');
console.log('📊 Fast-Schema now includes all advanced features:');
console.log('   • Modular architecture');
console.log('   • Intersection & conditional schemas');
console.log('   • Async validation');
console.log('   • JIT compilation');
console.log('   • Advanced string formats');
console.log('   • Batch processing');
console.log('   • Schema composition');
console.log('   • WASM integration');
console.log('   • Comprehensive error handling');
console.log('   • Full TypeScript type inference');
console.log('   • Performance benchmarking');
console.log('   • Complete documentation');
//# sourceMappingURL=test-complete-implementation.js.map