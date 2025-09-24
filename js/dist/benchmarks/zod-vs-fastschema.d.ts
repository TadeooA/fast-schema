interface BenchmarkResult {
    name: string;
    zod: {
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
export declare class ZodVsFastSchemaBenchmark {
    private iterations;
    benchmarkStringValidation(): Promise<BenchmarkResult>;
    benchmarkObjectValidation(): Promise<BenchmarkResult>;
    benchmarkArrayValidation(): Promise<BenchmarkResult>;
    benchmarkNestedComplexValidation(): Promise<BenchmarkResult>;
    runFullBenchmarkSuite(): Promise<BenchmarkResult[]>;
}
export declare const runZodVsFastSchemaBenchmark: () => Promise<BenchmarkResult[]>;
export {};
//# sourceMappingURL=zod-vs-fastschema.d.ts.map