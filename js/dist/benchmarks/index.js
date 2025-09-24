"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBenchmarkCLI = exports.compareSchemas = exports.measurePerformance = exports.RegressionTester = exports.BenchmarkSuites = exports.PerformanceBenchmark = void 0;
// Performance benchmarking suite for fast-schema
const index_1 = require("../index");
class PerformanceBenchmark {
    constructor(options = {}) {
        this.warmupIterations = 100;
        this.measureIterations = 1000;
        this.memoryMeasurement = false;
        this.warmupIterations = options.warmupIterations ?? 100;
        this.measureIterations = options.measureIterations ?? 1000;
        this.memoryMeasurement = options.memoryMeasurement ?? false;
    }
    async benchmark(name, fn, iterations) {
        const testIterations = iterations ?? this.measureIterations;
        // Warmup phase
        for (let i = 0; i < this.warmupIterations; i++) {
            fn();
        }
        // Force garbage collection if available
        if (typeof global !== 'undefined' && global.gc) {
            global.gc();
        }
        const times = [];
        let memoryBefore = 0;
        let memoryAfter = 0;
        // Memory measurement setup
        if (this.memoryMeasurement && typeof process !== 'undefined') {
            memoryBefore = process.memoryUsage().heapUsed;
        }
        // Measurement phase
        for (let i = 0; i < testIterations; i++) {
            const start = performance.now();
            fn();
            const end = performance.now();
            times.push(end - start);
        }
        // Memory measurement
        if (this.memoryMeasurement && typeof process !== 'undefined') {
            memoryAfter = process.memoryUsage().heapUsed;
        }
        // Calculate statistics
        const sortedTimes = times.sort((a, b) => a - b);
        const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length;
        const standardDeviation = Math.sqrt(variance);
        return {
            name,
            averageTime,
            throughput: 1000 / averageTime, // operations per second
            memoryUsage: this.memoryMeasurement ? memoryAfter - memoryBefore : undefined,
            iterations: testIterations,
            standardDeviation,
            percentiles: {
                p50: sortedTimes[Math.floor(sortedTimes.length * 0.5)],
                p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
                p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)]
            }
        };
    }
    async benchmarkSchema(name, schema, testData, iterations) {
        let dataIndex = 0;
        return this.benchmark(name, () => {
            schema.parse(testData[dataIndex % testData.length]);
            dataIndex++;
        }, iterations);
    }
    async compare(schemas, testData, options = {}) {
        const results = [];
        if (options.warmupRuns) {
            this.warmupIterations = options.warmupRuns;
        }
        if (options.measureMemory) {
            this.memoryMeasurement = options.measureMemory;
        }
        // Run benchmarks for each schema
        for (const [name, schema] of Object.entries(schemas)) {
            const result = await this.benchmarkSchema(name, schema, testData, options.iterations);
            results.push(result);
        }
        // Calculate improvements relative to first result (baseline)
        const baseline = results[0];
        const improvements = {};
        for (const result of results.slice(1)) {
            improvements[result.name] = baseline.averageTime / result.averageTime;
        }
        return {
            name: 'Schema Comparison',
            results,
            comparison: {
                baseline: baseline.name,
                improvements
            }
        };
    }
    static formatResults(suite) {
        let output = `\n=== ${suite.name} ===\n\n`;
        // Results table
        output += '| Schema | Avg Time (ms) | Throughput (ops/sec) | P95 (ms) | P99 (ms) | Memory (bytes) |\n';
        output += '|--------|---------------|---------------------|----------|----------|----------------|\n';
        for (const result of suite.results) {
            const memoryStr = result.memoryUsage ? result.memoryUsage.toLocaleString() : 'N/A';
            output += `| ${result.name} | ${result.averageTime.toFixed(3)} | ${Math.round(result.throughput).toLocaleString()} | ${result.percentiles.p95.toFixed(3)} | ${result.percentiles.p99.toFixed(3)} | ${memoryStr} |\n`;
        }
        // Comparison section
        if (suite.comparison) {
            output += `\n### Performance Improvements (vs ${suite.comparison.baseline})\n\n`;
            for (const [name, improvement] of Object.entries(suite.comparison.improvements)) {
                const speedup = `${improvement.toFixed(1)}x faster`;
                const percentage = `(${((improvement - 1) * 100).toFixed(1)}% improvement)`;
                output += `- **${name}**: ${speedup} ${percentage}\n`;
            }
        }
        return output;
    }
}
exports.PerformanceBenchmark = PerformanceBenchmark;
// Predefined benchmark suites
class BenchmarkSuites {
    static async runBasicTypes() {
        const benchmark = new PerformanceBenchmark();
        const schemas = {
            string: index_1.z.string(),
            number: index_1.z.number(),
            boolean: index_1.z.boolean(),
            stringJIT: index_1.z.jit(index_1.z.string()),
            numberJIT: index_1.z.jit(index_1.z.number()),
            booleanJIT: index_1.z.jit(index_1.z.boolean())
        };
        const testData = [
            ['hello', 'world', 'test', 'validation', 'schema'],
            [1, 2, 3, 42, 100],
            [true, false, true, false, true]
        ];
        return benchmark.compare(schemas, testData.flat(), { iterations: 5000 });
    }
    static async runComplexObjects() {
        const benchmark = new PerformanceBenchmark({ memoryMeasurement: true });
        const userSchema = index_1.z.object({
            id: index_1.z.string().uuid(),
            name: index_1.z.string().min(2).max(50),
            email: index_1.z.string().email(),
            age: index_1.z.number().min(0).max(120),
            preferences: index_1.z.object({
                theme: index_1.z.enum(['light', 'dark']),
                notifications: index_1.z.boolean(),
                language: index_1.z.string().min(2).max(5)
            }),
            tags: index_1.z.array(index_1.z.string()).max(10),
            metadata: index_1.z.record(index_1.z.any()).optional()
        });
        const schemas = {
            regular: userSchema,
            jit: index_1.z.jit(userSchema),
            wasm: index_1.z.wasm.hybridize(userSchema)
        };
        const testData = Array.from({ length: 100 }, (_, i) => ({
            id: `550e8400-e29b-41d4-a716-44665544000${i % 10}`,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            age: 20 + (i % 50),
            preferences: {
                theme: i % 2 === 0 ? 'light' : 'dark',
                notifications: i % 3 === 0,
                language: 'en'
            },
            tags: [`tag${i % 5}`, `category${i % 3}`],
            metadata: { created: Date.now(), index: i }
        }));
        return benchmark.compare(schemas, testData, { iterations: 1000, measureMemory: true });
    }
    static async runArrayValidation() {
        const benchmark = new PerformanceBenchmark();
        const itemSchema = index_1.z.object({
            id: index_1.z.number(),
            name: index_1.z.string(),
            active: index_1.z.boolean()
        });
        const schemas = {
            individual: itemSchema,
            batch: index_1.z.batch(itemSchema),
            jitBatch: index_1.z.batch(index_1.z.jit(itemSchema)),
            wasmBatch: index_1.z.batch(index_1.z.wasm.hybridize(itemSchema))
        };
        const largeArray = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            active: i % 2 === 0
        }));
        const singleItem = largeArray[0];
        const testDataArray = [singleItem]; // Array containing single item for individual validation
        const results = [];
        // Individual validation (validate single item repeatedly)
        results.push(await benchmark.benchmarkSchema('individual', schemas.individual, testDataArray, 1000));
        // Batch validations (validate entire array)
        for (const [name, schema] of Object.entries(schemas)) {
            if (name === 'individual')
                continue;
            const result = await benchmark.benchmark(name, () => {
                if ('validate' in schema) {
                    schema.validate(largeArray);
                }
                else {
                    schema.parse(largeArray);
                }
            }, 50 // Fewer iterations for array operations
            );
            results.push(result);
        }
        return {
            name: 'Array Validation Comparison',
            results,
            comparison: {
                baseline: 'individual',
                improvements: {
                    batch: results[0].averageTime / results[1].averageTime,
                    jitBatch: results[0].averageTime / results[2].averageTime,
                    wasmBatch: results[0].averageTime / results[3].averageTime
                }
            }
        };
    }
    static async runStringFormats() {
        const benchmark = new PerformanceBenchmark();
        const schemas = {
            email: index_1.z.string().email(),
            uuid: index_1.z.string().uuid(),
            url: index_1.z.string().url(),
            datetime: index_1.z.string().datetime(),
            emailJIT: index_1.z.jit(index_1.z.string().email()),
            uuidJIT: index_1.z.jit(index_1.z.string().uuid()),
            urlJIT: index_1.z.jit(index_1.z.string().url()),
            datetimeJIT: index_1.z.jit(index_1.z.string().datetime())
        };
        const testData = [
            'user@example.com',
            'test@domain.org',
            '550e8400-e29b-41d4-a716-446655440000',
            'https://example.com/path',
            '2023-10-15T14:30:00Z'
        ];
        return benchmark.compare(schemas, testData, { iterations: 2000 });
    }
    static async runRegressionSuite() {
        console.log('🏃 Running comprehensive benchmark suite...\n');
        const suites = await Promise.all([
            this.runBasicTypes(),
            this.runComplexObjects(),
            this.runArrayValidation(),
            this.runStringFormats()
        ]);
        return suites;
    }
}
exports.BenchmarkSuites = BenchmarkSuites;
// Regression testing utilities
class RegressionTester {
    constructor() {
        this.baselines = new Map();
    }
    setBaseline(name, result) {
        this.baselines.set(name, result);
    }
    checkRegression(name, current, threshold = 1.5) {
        const baseline = this.baselines.get(name);
        if (!baseline) {
            return {
                hasRegression: false,
                improvement: 1,
                message: `No baseline found for ${name}`
            };
        }
        const improvement = baseline.averageTime / current.averageTime;
        const hasRegression = improvement < (1 / threshold);
        let message;
        if (hasRegression) {
            message = `⚠️ Performance regression in ${name}: ${(current.averageTime / baseline.averageTime).toFixed(2)}x slower`;
        }
        else if (improvement > 1.2) {
            message = `🚀 Performance improvement in ${name}: ${improvement.toFixed(2)}x faster`;
        }
        else {
            message = `✅ ${name}: Performance stable (${improvement.toFixed(2)}x)`;
        }
        return {
            hasRegression,
            improvement,
            message
        };
    }
    async runRegressionCheck() {
        console.log('🔍 Running performance regression tests...\n');
        const suites = await BenchmarkSuites.runRegressionSuite();
        for (const suite of suites) {
            console.log(`\n=== ${suite.name} ===`);
            for (const result of suite.results) {
                const regression = this.checkRegression(result.name, result);
                console.log(regression.message);
            }
        }
    }
}
exports.RegressionTester = RegressionTester;
// Export utilities for manual testing
const measurePerformance = async (name, fn, iterations = 1000) => {
    const benchmark = new PerformanceBenchmark();
    return benchmark.benchmark(name, fn, iterations);
};
exports.measurePerformance = measurePerformance;
const compareSchemas = async (schemas, testData, options) => {
    const benchmark = new PerformanceBenchmark({
        memoryMeasurement: options?.measureMemory
    });
    return benchmark.compare(schemas, testData, options);
};
exports.compareSchemas = compareSchemas;
// CLI interface for running benchmarks
const runBenchmarkCLI = async () => {
    console.log('🔬 Fast-Schema Performance Benchmark Suite\n');
    try {
        const suites = await BenchmarkSuites.runRegressionSuite();
        for (const suite of suites) {
            console.log(PerformanceBenchmark.formatResults(suite));
        }
        console.log('\n✅ Benchmark suite completed successfully!');
    }
    catch (error) {
        console.error('❌ Benchmark suite failed:', error);
        process.exit(1);
    }
};
exports.runBenchmarkCLI = runBenchmarkCLI;
//# sourceMappingURL=index.js.map