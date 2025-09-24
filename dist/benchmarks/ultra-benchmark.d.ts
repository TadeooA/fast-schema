interface UltraBenchmarkResult {
    name: string;
    standardMode: {
        avgTime: number;
        throughput: number;
    };
    ultraMode: {
        avgTime: number;
        throughput: number;
    };
    improvement: number;
    target: number;
    achieved: boolean;
}
export declare class UltraPerformanceBenchmark {
    private iterations;
    benchmarkStringValidation(): Promise<UltraBenchmarkResult>;
    benchmarkNumberValidation(): Promise<UltraBenchmarkResult>;
    benchmarkObjectValidation(): Promise<UltraBenchmarkResult>;
    benchmarkBatchValidation(): Promise<UltraBenchmarkResult>;
    benchmarkJITOptimization(): Promise<UltraBenchmarkResult>;
    private benchmarkSchema;
    runFullUltraBenchmarkSuite(): Promise<UltraBenchmarkResult[]>;
    stressTestUltraPerformance(): Promise<void>;
}
export declare const runUltraPerformanceBenchmark: () => Promise<UltraBenchmarkResult[]>;
export declare const runUltraStressTest: () => Promise<void>;
export declare const runUltraBenchmarkCLI: () => Promise<void>;
export {};
//# sourceMappingURL=ultra-benchmark.d.ts.map