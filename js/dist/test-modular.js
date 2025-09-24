"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test file to verify modular architecture works
const index_1 = require("./index");
// Test basic schemas
const stringSchema = index_1.z.string().min(2).max(50).email();
const numberSchema = index_1.z.number().int().positive();
const booleanSchema = index_1.z.boolean();
// Test complex schemas
const arraySchema = index_1.z.array(index_1.z.string());
const objectSchema = index_1.z.object({
    name: index_1.z.string().min(1),
    age: index_1.z.number().int().min(0),
    active: index_1.z.boolean().optional(),
    tags: index_1.z.array(index_1.z.string())
});
// Test validation
try {
    const validUser = objectSchema.parse({
        name: 'John Doe',
        age: 30,
        active: true,
        tags: ['developer', 'typescript']
    });
    console.log('Valid user:', validUser);
}
catch (error) {
    if (error instanceof index_1.ValidationError) {
        console.log('Validation error:', error.issues);
    }
}
// Test safe parsing
const result = objectSchema.safeParse({
    name: 'Jane',
    age: 25,
    tags: ['designer']
});
if (result.success) {
    console.log('Safe parse success:', result.data);
}
else {
    console.log('Safe parse failed:', result.error.issues);
}
// Test unions and literals
const statusSchema = index_1.z.union([
    index_1.z.literal('pending'),
    index_1.z.literal('approved'),
    index_1.z.literal('rejected')
]);
// Test transformations
const trimmedString = index_1.z.string().min(1).trim();
const upperCaseString = index_1.z.string().toUpperCase();
console.log('Modular architecture test completed successfully!');
//# sourceMappingURL=test-modular.js.map