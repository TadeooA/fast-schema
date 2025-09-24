/**
 * AJV vs Fast-Schema Performance Benchmark
 * Compares Fast-Schema against AJV, one of the fastest JSON validators
 */
interface BenchmarkResult {
    name: string;
    ajv: {
        time: number;
        throughput: number;
        avgTime: number;
    };
    fastSchema: {
        time: number;
        throughput: number;
        avgTime: number;
    };
    improvement: number;
    speedup: string;
}
export declare class AjvVsFastSchemaBenchmark {
    private iterations;
    private ajv;
    constructor();
    benchmarkStringValidation(): Promise<BenchmarkResult>;
    benchmarkObjectValidation(): Promise<BenchmarkResult>;
    benchmarkArrayValidation(): Promise<BenchmarkResult>;
    benchmarkComplexNestedValidation(): Promise<BenchmarkResult>;
    runFullBenchmarkSuite(): Promise<BenchmarkResult[]>;
}
export declare const runAjvVsFastSchemaBenchmark: () => Promise<BenchmarkResult[]>;
export {};
//# sourceMappingURL=ajv-vs-fastschema.d.ts.map