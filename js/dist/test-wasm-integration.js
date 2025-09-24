"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test file for WASM integration functionality
const index_1 = require("./index");
console.log('Testing WASM Integration Features...\n');
// Test 1: Check WASM availability
console.log('1. Testing WASM Availability');
try {
    const isAvailable = index_1.z.wasm.isAvailable();
    console.log(`✓ WASM availability check: ${isAvailable ? 'Available' : 'Not Available'}`);
    if (!isAvailable) {
        console.log('ℹ️ WASM not available - tests will demonstrate TypeScript fallback behavior');
    }
}
catch (error) {
    console.log('✗ WASM availability check failed:', error);
}
// Test 2: WASM Integration Test
console.log('\n2. Testing WASM Integration');
index_1.z.wasm.test().then(result => {
    console.log('✓ WASM integration test result:', result);
    if (result.wasmAvailable && result.wasmWorking) {
        console.log(`🚀 WASM is working! Performance gain: ${result.performanceGain?.toFixed(2)}%`);
    }
    else if (result.wasmAvailable && !result.wasmWorking) {
        console.log('⚠️ WASM available but not working correctly:', result.error);
    }
    else {
        console.log('ℹ️ WASM not available, using TypeScript fallback');
    }
}).catch(error => {
    console.log('✗ WASM integration test failed:', error);
});
// Test 3: Schema Hybridization
console.log('\n3. Testing Schema Hybridization');
try {
    const userSchema = index_1.z.object({
        id: index_1.z.string(),
        name: index_1.z.string(),
        email: index_1.z.string(),
        age: index_1.z.number().optional(),
        preferences: index_1.z.object({
            theme: index_1.z.string(),
            notifications: index_1.z.boolean()
        }).optional()
    });
    // Create hybrid version
    const hybridSchema = index_1.z.wasm.hybridize(userSchema);
    const testUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        preferences: {
            theme: 'dark',
            notifications: true
        }
    };
    const result = hybridSchema.safeParse(testUser);
    if (result.success) {
        console.log('✓ Hybrid schema validation passed:', result.data);
    }
    else {
        console.log('✗ Hybrid schema validation failed:', result.error);
    }
}
catch (error) {
    console.log('✗ Schema hybridization failed:', error);
}
// Test 4: Schema Optimization
console.log('\n4. Testing Schema Optimization');
try {
    const complexSchema = index_1.z.object({
        data: index_1.z.array(index_1.z.object({
            id: index_1.z.number(),
            content: index_1.z.string(),
            metadata: index_1.z.object({
                created: index_1.z.string(),
                updated: index_1.z.string(),
                tags: index_1.z.array(index_1.z.string())
            })
        })),
        total: index_1.z.number(),
        page: index_1.z.number(),
        hasMore: index_1.z.boolean()
    });
    const optimizedSchema = index_1.z.wasm.optimize(complexSchema);
    const testData = {
        data: [
            {
                id: 1,
                content: 'Test content',
                metadata: {
                    created: '2023-01-01',
                    updated: '2023-01-02',
                    tags: ['test', 'example']
                }
            }
        ],
        total: 1,
        page: 1,
        hasMore: false
    };
    const result = optimizedSchema.safeParse(testData);
    if (result.success) {
        console.log('✓ Optimized schema validation passed');
    }
    else {
        console.log('✗ Optimized schema validation failed:', result.error);
    }
}
catch (error) {
    console.log('✗ Schema optimization failed:', error);
}
// Test 5: Performance Comparison
console.log('\n5. Testing Performance Comparison');
async function performanceTest() {
    try {
        const schema = index_1.z.array(index_1.z.object({
            id: index_1.z.number(),
            name: index_1.z.string(),
            active: index_1.z.boolean()
        }));
        // Generate test data
        const testData = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            active: i % 2 === 0
        }));
        console.log('Running performance benchmark...');
        const benchmarkResult = await index_1.z.wasm.benchmark(schema, [testData], 10);
        console.log('✓ Performance benchmark completed:', benchmarkResult);
        if (benchmarkResult.recommendation) {
            console.log(`🎯 Recommendation: Use ${benchmarkResult.recommendation} for this schema type`);
        }
    }
    catch (error) {
        console.log('⚠️ Performance benchmark not available:', error);
    }
}
performanceTest();
// Test 6: WASM Metrics
console.log('\n6. Testing WASM Metrics');
try {
    const metrics = index_1.z.wasm.getMetrics();
    if (metrics) {
        console.log('✓ WASM metrics retrieved:', metrics);
    }
    else {
        console.log('ℹ️ WASM metrics not available (expected when WASM is not loaded)');
    }
}
catch (error) {
    console.log('✗ WASM metrics retrieval failed:', error);
}
// Test 7: Configuration
console.log('\n7. Testing WASM Configuration');
try {
    index_1.z.wasm.configure({
        preferWasm: true,
        autoFallback: true,
        performanceThresholds: {
            minDataSize: 50,
            complexityThreshold: 3,
            batchSizeThreshold: 25
        },
        enableMetrics: true
    });
    console.log('✓ WASM configuration updated successfully');
}
catch (error) {
    console.log('✗ WASM configuration failed:', error);
}
// Test 8: FastSchemaWasm Class
console.log('\n8. Testing FastSchemaWasm Class');
try {
    console.log(`FastSchemaWasm.isAvailable(): ${index_1.FastSchemaWasm.isAvailable()}`);
    const metrics = index_1.FastSchemaWasm.getMetrics();
    console.log('FastSchemaWasm metrics:', metrics || 'Not available');
    // Test the convenience z objects
    const testSchema = index_1.FastSchemaWasm.optimized.object({
        name: index_1.FastSchemaWasm.optimized.string(),
        count: index_1.FastSchemaWasm.optimized.number()
    });
    const testResult = testSchema.safeParse({ name: 'test', count: 42 });
    if (testResult.success) {
        console.log('✓ FastSchemaWasm optimized schema works:', testResult.data);
    }
}
catch (error) {
    console.log('✗ FastSchemaWasm class test failed:', error);
}
// Test 9: Batch Validation
console.log('\n9. Testing Batch Validation');
try {
    const itemSchema = index_1.z.object({
        id: index_1.z.number(),
        value: index_1.z.string()
    });
    const items = [
        { id: 1, value: 'test1' },
        { id: 2, value: 'test2' },
        { id: 'invalid', value: 'test3' }, // This should fail
        { id: 4, value: 'test4' }
    ];
    // Use hybrid schema for batch validation
    const hybridSchema = index_1.z.wasm.hybridize(itemSchema);
    if (typeof hybridSchema.validateMany === 'function') {
        const results = hybridSchema.validateMany(items);
        const successCount = results.filter(r => r.success).length;
        console.log(`✓ Batch validation completed: ${successCount}/${items.length} items valid`);
        // Show failed validations
        results.forEach((result, index) => {
            if (!result.success) {
                console.log(`  - Item ${index + 1} failed: ${result.error?.issues[0]?.message}`);
            }
        });
    }
    else {
        console.log('ℹ️ Batch validation method not available on this schema type');
    }
}
catch (error) {
    console.log('✗ Batch validation failed:', error);
}
// Test 10: Memory Management
console.log('\n10. Testing Memory Management');
try {
    index_1.z.wasm.resetCaches();
    console.log('✓ WASM caches reset successfully');
}
catch (error) {
    console.log('✗ WASM cache reset failed:', error);
}
console.log('\n🎉 WASM integration testing completed!');
console.log('📝 Note: Some features may not be available without the WASM module built and loaded.');
console.log('🚀 To enable full WASM functionality, build the Rust module with: wasm-pack build --target bundler');
//# sourceMappingURL=test-wasm-integration.js.map