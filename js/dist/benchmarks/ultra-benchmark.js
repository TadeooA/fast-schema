"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runUltraBenchmarkCLI = exports.runUltraStressTest = exports.runUltraPerformanceBenchmark = exports.UltraPerformanceBenchmark = void 0;
// Ultra-performance benchmark targeting 100x improvement
const api_1 = require("../api");
class UltraPerformanceBenchmark {
    constructor() {
        this.iterations = 50000; // High iteration count for accurate ultra-performance measurement
    }
    async benchmarkStringValidation() {
        console.log('🔥 Benchmarking ultra-performance string validation...');
        // Standard mode
        const standardSchema = api_1.fast.string().min(2).max(100).email();
        const ultraSchema = api_1.fast.ultra.string().min(2).max(100).email();
        const testData = [
            'user@example.com',
            'test@domain.org',
            'admin@company.net',
            'developer@startup.io',
            'contact@business.com'
        ];
        // Benchmark standard mode
        const standardResult = await this.benchmarkSchema('Standard String', standardSchema, testData);
        // Benchmark ultra mode
        const ultraResult = await this.benchmarkSchema('Ultra String', ultraSchema, testData);
        const improvement = standardResult.avgTime / ultraResult.avgTime;
        const target = 100;
        return {
            name: 'String Validation',
            standardMode: standardResult,
            ultraMode: ultraResult,
            improvement,
            target,
            achieved: improvement >= target
        };
    }
    async benchmarkNumberValidation() {
        console.log('🔥 Benchmarking ultra-performance number validation...');
        const standardSchema = api_1.fast.number().min(0).max(1000).int();
        const ultraSchema = api_1.fast.ultra.number().min(0).max(1000).int();
        const testData = [1, 42, 100, 250, 999, 0, 500, 750, 123, 456];
        const standardResult = await this.benchmarkSchema('Standard Number', standardSchema, testData);
        const ultraResult = await this.benchmarkSchema('Ultra Number', ultraSchema, testData);
        const improvement = standardResult.avgTime / ultraResult.avgTime;
        const target = 100;
        return {
            name: 'Number Validation',
            standardMode: standardResult,
            ultraMode: ultraResult,
            improvement,
            target,
            achieved: improvement >= target
        };
    }
    async benchmarkObjectValidation() {
        console.log('🔥 Benchmarking ultra-performance object validation...');
        // Standard complex object schema
        const standardSchema = api_1.fast.object({
            id: api_1.fast.string(),
            name: api_1.fast.string().min(2).max(50),
            email: api_1.fast.string().email(),
            age: api_1.fast.number().min(0).max(120),
            active: api_1.fast.boolean(),
            tags: api_1.fast.array(api_1.fast.string())
        });
        // Ultra-optimized object schema
        const ultraSchema = api_1.fast.ultra.object({
            id: api_1.fast.ultra.string(),
            name: api_1.fast.ultra.string().min(2).max(50),
            email: api_1.fast.ultra.string().email(),
            age: api_1.fast.ultra.number().min(0).max(120),
            active: api_1.fast.ultra.boolean(),
            tags: api_1.fast.ultra.array(api_1.fast.ultra.string())
        });
        const testData = Array.from({ length: 10 }, (_, i) => ({
            id: `user_${i}`,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            age: 20 + (i % 50),
            active: i % 2 === 0,
            tags: [`tag${i}`, `category${i % 3}`]
        }));
        const standardResult = await this.benchmarkSchema('Standard Object', standardSchema, testData);
        const ultraResult = await this.benchmarkSchema('Ultra Object', ultraSchema, testData);
        const improvement = standardResult.avgTime / ultraResult.avgTime;
        const target = 100;
        return {
            name: 'Object Validation',
            standardMode: standardResult,
            ultraMode: ultraResult,
            improvement,
            target,
            achieved: improvement >= target
        };
    }
    async benchmarkBatchValidation() {
        console.log('🔥 Benchmarking ultra-performance batch validation...');
        const itemSchema = api_1.fast.object({
            id: api_1.fast.number(),
            name: api_1.fast.string(),
            value: api_1.fast.number()
        });
        const ultraItemSchema = api_1.fast.ultra.object({
            id: api_1.fast.ultra.number(),
            name: api_1.fast.ultra.string(),
            value: api_1.fast.ultra.number()
        });
        // Large dataset for batch testing
        const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            value: Math.random() * 1000
        }));
        // Standard: validate items individually
        const standardStart = performance.now();
        for (let i = 0; i < 100; i++) { // 100 iterations of processing the full dataset
            for (const item of largeDataset) {
                itemSchema.parse(item);
            }
        }
        const standardTime = performance.now() - standardStart;
        // Ultra: batch validation
        const batchValidator = api_1.fast.ultra.batch(ultraItemSchema);
        const ultraStart = performance.now();
        for (let i = 0; i < 100; i++) {
            batchValidator.parseMany(largeDataset);
        }
        const ultraTime = performance.now() - ultraStart;
        const standardAvg = standardTime / 100;
        const ultraAvg = ultraTime / 100;
        const improvement = standardAvg / ultraAvg;
        const target = 50; // Lower target for batch operations
        return {
            name: 'Batch Validation (1000 items)',
            standardMode: {
                avgTime: standardAvg,
                throughput: (largeDataset.length / standardAvg) * 1000
            },
            ultraMode: {
                avgTime: ultraAvg,
                throughput: (largeDataset.length / ultraAvg) * 1000
            },
            improvement,
            target,
            achieved: improvement >= target
        };
    }
    async benchmarkJITOptimization() {
        console.log('🔥 Benchmarking JIT optimization performance...');
        const schema = api_1.fast.ultra.string().email();
        const jitSchema = api_1.fast.ultra.jit(schema);
        const precompiledSchema = api_1.fast.ultra.optimize.precompile(schema);
        const testData = [
            'user@example.com',
            'test@domain.org',
            'admin@company.net'
        ];
        // Standard schema (no JIT)
        const standardResult = await this.benchmarkSchema('Standard Schema', schema, testData);
        // JIT optimized schema
        const jitResult = await this.benchmarkSchema('JIT Schema', jitSchema, testData);
        // Pre-compiled schema
        const precompiledResult = await this.benchmarkSchema('Precompiled Schema', precompiledSchema, testData);
        const jitImprovement = standardResult.avgTime / jitResult.avgTime;
        const precompiledImprovement = standardResult.avgTime / precompiledResult.avgTime;
        const bestImprovement = Math.max(jitImprovement, precompiledImprovement);
        const target = 10; // JIT should provide at least 10x improvement
        return {
            name: 'JIT Optimization',
            standardMode: standardResult,
            ultraMode: precompiledImprovement > jitImprovement ? precompiledResult : jitResult,
            improvement: bestImprovement,
            target,
            achieved: bestImprovement >= target
        };
    }
    async benchmarkSchema(name, schema, testData) {
        // Warmup
        for (let i = 0; i < 1000; i++) {
            schema.parse(testData[i % testData.length]);
        }
        // Force garbage collection if available
        if (typeof global !== 'undefined' && global.gc) {
            global.gc();
        }
        // Benchmark
        const start = performance.now();
        for (let i = 0; i < this.iterations; i++) {
            schema.parse(testData[i % testData.length]);
        }
        const totalTime = performance.now() - start;
        const avgTime = totalTime / this.iterations;
        const throughput = (this.iterations / totalTime) * 1000; // ops per second
        return { avgTime, throughput };
    }
    async runFullUltraBenchmarkSuite() {
        console.log('🚀 Starting Ultra-Performance Benchmark Suite (100x target)\n');
        console.log(`Running ${this.iterations.toLocaleString()} iterations per test...\n`);
        const results = await Promise.all([
            this.benchmarkStringValidation(),
            this.benchmarkNumberValidation(),
            this.benchmarkObjectValidation(),
            this.benchmarkBatchValidation(),
            this.benchmarkJITOptimization()
        ]);
        // Summary report
        console.log('\n🎯 ULTRA-PERFORMANCE BENCHMARK RESULTS\n');
        console.log('========================================\n');
        for (const result of results) {
            const status = result.achieved ? '✅ TARGET ACHIEVED' : '⚠️  TARGET MISSED';
            const improvement = result.improvement.toFixed(2);
            const target = result.target;
            console.log(`📊 ${result.name}`);
            console.log(`   Standard: ${result.standardMode.avgTime.toFixed(4)}ms avg (${Math.round(result.standardMode.throughput).toLocaleString()} ops/sec)`);
            console.log(`   Ultra:    ${result.ultraMode.avgTime.toFixed(4)}ms avg (${Math.round(result.ultraMode.throughput).toLocaleString()} ops/sec)`);
            console.log(`   Improvement: ${improvement}x (Target: ${target}x) ${status}`);
            console.log('');
        }
        const overallTargetsAchieved = results.filter(r => r.achieved).length;
        const totalTargets = results.length;
        console.log(`🏆 OVERALL PERFORMANCE: ${overallTargetsAchieved}/${totalTargets} targets achieved`);
        if (overallTargetsAchieved === totalTargets) {
            console.log('🔥 INCREDIBLE! All ultra-performance targets achieved!');
        }
        else if (overallTargetsAchieved >= totalTargets * 0.8) {
            console.log('🚀 EXCELLENT! Most ultra-performance targets achieved!');
        }
        else {
            console.log('⚡ GOOD! Some ultra-performance targets achieved, room for optimization.');
        }
        const maxImprovement = Math.max(...results.map(r => r.improvement));
        console.log(`📈 Maximum improvement achieved: ${maxImprovement.toFixed(2)}x`);
        if (maxImprovement >= 100) {
            console.log('🎉 100x PERFORMANCE TARGET ACHIEVED! 🎉');
        }
        return results;
    }
    // Stress test for extreme performance
    async stressTestUltraPerformance() {
        console.log('💪 Running stress test for ultra-performance...\n');
        // Create a complex schema
        const ultraSchema = api_1.fast.ultra.object({
            user: api_1.fast.ultra.object({
                id: api_1.fast.ultra.string(),
                profile: api_1.fast.ultra.object({
                    name: api_1.fast.ultra.string().min(2).max(50),
                    email: api_1.fast.ultra.string().email(),
                    preferences: api_1.fast.ultra.object({
                        theme: api_1.fast.ultra.string(),
                        notifications: api_1.fast.ultra.boolean()
                    })
                })
            }),
            items: api_1.fast.ultra.array(api_1.fast.ultra.object({
                id: api_1.fast.ultra.number(),
                name: api_1.fast.ultra.string(),
                tags: api_1.fast.ultra.array(api_1.fast.ultra.string())
            }))
        });
        // Generate stress test data
        const stressData = {
            user: {
                id: 'user_123',
                profile: {
                    name: 'Test User',
                    email: 'test@example.com',
                    preferences: {
                        theme: 'dark',
                        notifications: true
                    }
                }
            },
            items: Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `Item ${i}`,
                tags: [`tag${i}`, `category${i % 10}`]
            }))
        };
        // Stress test with 100,000 validations
        const stressIterations = 100000;
        console.log(`🔥 Stress testing with ${stressIterations.toLocaleString()} complex validations...`);
        const start = performance.now();
        for (let i = 0; i < stressIterations; i++) {
            ultraSchema.parse(stressData);
        }
        const totalTime = performance.now() - start;
        const avgTime = totalTime / stressIterations;
        const throughput = (stressIterations / totalTime) * 1000;
        console.log(`⚡ Stress test completed:`);
        console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
        console.log(`   Average time per validation: ${avgTime.toFixed(6)}ms`);
        console.log(`   Throughput: ${Math.round(throughput).toLocaleString()} validations/sec`);
        if (avgTime < 0.01) { // Less than 0.01ms per validation
            console.log('🏆 ULTRA-PERFORMANCE ACHIEVED! Sub-0.01ms validations!');
        }
        else if (avgTime < 0.1) {
            console.log('🚀 EXCELLENT! Sub-0.1ms validations!');
        }
        else {
            console.log('⚡ GOOD! Room for further optimization.');
        }
    }
}
exports.UltraPerformanceBenchmark = UltraPerformanceBenchmark;
// Export utility functions
const runUltraPerformanceBenchmark = async () => {
    const benchmark = new UltraPerformanceBenchmark();
    return benchmark.runFullUltraBenchmarkSuite();
};
exports.runUltraPerformanceBenchmark = runUltraPerformanceBenchmark;
const runUltraStressTest = async () => {
    const benchmark = new UltraPerformanceBenchmark();
    return benchmark.stressTestUltraPerformance();
};
exports.runUltraStressTest = runUltraStressTest;
// CLI runner
const runUltraBenchmarkCLI = async () => {
    try {
        const results = await (0, exports.runUltraPerformanceBenchmark)();
        console.log('\n' + '='.repeat(50));
        await (0, exports.runUltraStressTest)();
        console.log('\n✅ Ultra-performance benchmark suite completed!');
    }
    catch (error) {
        console.error('❌ Ultra-performance benchmark failed:', error);
        process.exit(1);
    }
};
exports.runUltraBenchmarkCLI = runUltraBenchmarkCLI;
//# sourceMappingURL=ultra-benchmark.js.map