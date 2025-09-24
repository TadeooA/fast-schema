"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test tiered performance system
const api_1 = require("./api");
async function testTieredPerformance() {
    console.log('🎯 TIERED PERFORMANCE SYSTEM DEMO');
    console.log('==================================\n');
    // 1. Show available performance tiers
    console.log('📊 Available Performance Tiers:');
    console.log(`🐌 NORMAL: ${api_1.fast.performance.normal.description}`);
    console.log(`   Expected: ${api_1.fast.performance.normal.expectedSpeedup}`);
    console.log(`   Use cases: ${api_1.fast.performance.normal.useCases.join(', ')}\n`);
    console.log(`⚡ FAST: ${api_1.fast.performance.fast.description}`);
    console.log(`   Expected: ${api_1.fast.performance.fast.expectedSpeedup}`);
    console.log(`   Use cases: ${api_1.fast.performance.fast.useCases.join(', ')}\n`);
    console.log(`🚀 ULTRA: ${api_1.fast.performance.ultra.description}`);
    console.log(`   Expected: ${api_1.fast.performance.ultra.expectedSpeedup}`);
    console.log(`   Use cases: ${api_1.fast.performance.ultra.useCases.join(', ')}\n`);
    // 2. Demonstrate automatic tier selection
    console.log('🤖 Automatic Tier Selection Examples:\n');
    const scenarios = [
        {
            name: 'Prototyping a new app',
            requirements: { environment: 'development', priority: 'ease-of-use' }
        },
        {
            name: 'Production API (moderate load)',
            requirements: { environment: 'production', validationsPerSecond: 5000 }
        },
        {
            name: 'High-traffic microservice',
            requirements: { validationsPerSecond: 50000, dataSize: 'large' }
        },
        {
            name: 'Real-time data processing',
            requirements: { priority: 'maximum-performance', dataSize: 'large' }
        },
        {
            name: 'Mobile app backend',
            requirements: { environment: 'production', dataSize: 'small' }
        }
    ];
    for (const scenario of scenarios) {
        const recommendation = api_1.fast.performance.recommend(scenario.requirements);
        console.log(`📋 ${scenario.name}:`);
        console.log(`   Recommended: ${recommendation.tier.tier.toUpperCase()} tier`);
        console.log(`   Reasoning: ${recommendation.reasoning}`);
        console.log(`   Migration tip: ${recommendation.migration[0]}\n`);
    }
    // 3. Performance comparison with actual benchmarks
    console.log('⚡ Performance Comparison Benchmark:\n');
    const testData = Array.from({ length: 1000 }, (_, i) => ({
        id: `user_${i}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 50),
        active: i % 2 === 0
    }));
    const iterations = 10000;
    // Normal tier schema
    const normalSchema = api_1.fast.performance.normal.object({
        id: api_1.fast.performance.normal.string(),
        email: api_1.fast.performance.normal.string(),
        age: api_1.fast.performance.normal.number(),
        active: api_1.fast.performance.normal.boolean()
    });
    // Fast tier schema
    const fastSchema = api_1.fast.performance.fast.object({
        id: api_1.fast.performance.fast.string(),
        email: api_1.fast.performance.fast.string(),
        age: api_1.fast.performance.fast.number(),
        active: api_1.fast.performance.fast.boolean()
    });
    // Ultra tier schema
    const ultraSchema = api_1.fast.performance.ultra.object({
        id: api_1.fast.performance.ultra.string(),
        email: api_1.fast.performance.ultra.string(),
        age: api_1.fast.performance.ultra.number(),
        active: api_1.fast.performance.ultra.boolean()
    });
    // Benchmark normal tier
    console.log(`Testing NORMAL tier (${iterations.toLocaleString()} iterations)...`);
    const normalStart = performance.now();
    for (let i = 0; i < iterations; i++) {
        const data = testData[i % testData.length];
        normalSchema.parse(data);
    }
    const normalTime = performance.now() - normalStart;
    // Benchmark fast tier
    console.log(`Testing FAST tier (${iterations.toLocaleString()} iterations)...`);
    const fastStart = performance.now();
    for (let i = 0; i < iterations; i++) {
        const data = testData[i % testData.length];
        fastSchema.parse(data);
    }
    const fastTime = performance.now() - fastStart;
    // Benchmark ultra tier
    console.log(`Testing ULTRA tier (${iterations.toLocaleString()} iterations)...`);
    const ultraStart = performance.now();
    for (let i = 0; i < iterations; i++) {
        const data = testData[i % testData.length];
        ultraSchema.parse(data);
    }
    const ultraTime = performance.now() - ultraStart;
    // Calculate improvements
    const fastImprovement = normalTime / fastTime;
    const ultraImprovement = normalTime / ultraTime;
    console.log('\n📈 Benchmark Results:');
    console.log(`NORMAL tier:  ${normalTime.toFixed(2)}ms (${Math.round((iterations / normalTime) * 1000).toLocaleString()} ops/sec)`);
    console.log(`FAST tier:    ${fastTime.toFixed(2)}ms (${Math.round((iterations / fastTime) * 1000).toLocaleString()} ops/sec) - ${fastImprovement.toFixed(1)}x faster`);
    console.log(`ULTRA tier:   ${ultraTime.toFixed(2)}ms (${Math.round((iterations / ultraTime) * 1000).toLocaleString()} ops/sec) - ${ultraImprovement.toFixed(1)}x faster`);
    // 4. Show specific use case examples
    console.log('\n💡 Practical Usage Examples:\n');
    console.log('🐌 NORMAL Tier (Learning/Prototyping):');
    console.log('```typescript');
    console.log('import { fast } from "fast-schema";');
    console.log('');
    console.log('// Simple, familiar API');
    console.log('const schema = fast.performance.normal.object({');
    console.log('  name: fast.performance.normal.string(),');
    console.log('  age: fast.performance.normal.number()');
    console.log('});');
    console.log('```\n');
    console.log('⚡ FAST Tier (Production):');
    console.log('```typescript');
    console.log('import { fast } from "fast-schema";');
    console.log('');
    console.log('// Automatic WASM optimization');
    console.log('const schema = fast.performance.fast.object({');
    console.log('  name: fast.performance.fast.string(),');
    console.log('  age: fast.performance.fast.number()');
    console.log('});');
    console.log('');
    console.log('// Batch processing for arrays');
    console.log('const batchValidator = fast.performance.fast.batch(itemSchema);');
    console.log('batchValidator.validate(largeArray);');
    console.log('```\n');
    console.log('🚀 ULTRA Tier (Maximum Performance):');
    console.log('```typescript');
    console.log('import { fast } from "fast-schema";');
    console.log('');
    console.log('// Pre-compiled validators');
    console.log('const schema = fast.performance.ultra.precompile(');
    console.log('  fast.performance.ultra.object({');
    console.log('    name: fast.performance.ultra.string(),');
    console.log('    age: fast.performance.ultra.number()');
    console.log('  })');
    console.log(');');
    console.log('');
    console.log('// Bulk processing');
    console.log('const result = await fast.performance.ultra.bulk(schema, largeDataset);');
    console.log('```\n');
    // 5. Migration path
    console.log('🔄 Migration Path:\n');
    console.log('1. Start with NORMAL tier for development');
    console.log('2. Move to FAST tier for production (simple import change)');
    console.log('3. Upgrade to ULTRA tier for high-performance scenarios');
    console.log('4. Use automatic tier selection for smart defaults\n');
    console.log('🎯 Recommendation Engine Usage:');
    console.log('```typescript');
    console.log('// Let the system choose for you');
    console.log('const tier = fast.performance.select({');
    console.log('  validationsPerSecond: 10000,');
    console.log('  environment: "production",');
    console.log('  dataSize: "large"');
    console.log('});');
    console.log('');
    console.log('const schema = tier.object({ /* your schema */ });');
    console.log('```');
    console.log('\n✨ Perfect! Now you have tiered performance for every use case!');
}
// Run the demo
testTieredPerformance().catch(console.error);
//# sourceMappingURL=test-tiered-performance.js.map