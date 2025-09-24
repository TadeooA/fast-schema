export interface BenchmarkResult {
    name: string;
    averageTime: number;
    throughput: number;
    memoryUsage?: number;
    iterations: number;
    standardDeviation: number;
    percentiles: {
        p50: number;
        p95: number;
        p99: number;
    };
}
export interface BenchmarkSuite {
    name: string;
    results: BenchmarkResult[];
    comparison?: {
        baseline: string;
        improvements: Record<string, number>;
    };
}
export declare class PerformanceBenchmark {
    private warmupIterations;
    private measureIterations;
    private memoryMeasurement;
    constructor(options?: {
        warmupIterations?: number;
        measureIterations?: number;
        memoryMeasurement?: boolean;
    });
    benchmark(name: string, fn: () => void, iterations?: number): Promise<BenchmarkResult>;
    benchmarkSchema(name: string, schema: any, testData: unknown[], iterations?: number): Promise<BenchmarkResult>;
    compare(schemas: Record<string, any>, testData: unknown[], options?: {
        iterations?: number;
        warmupRuns?: number;
        measureMemory?: boolean;
    }): Promise<BenchmarkSuite>;
    static formatResults(suite: BenchmarkSuite): string;
}
export declare class BenchmarkSuites {
    static runBasicTypes(): Promise<BenchmarkSuite>;
    static runComplexObjects(): Promise<BenchmarkSuite>;
    static runArrayValidation(): Promise<BenchmarkSuite>;
    static runStringFormats(): Promise<BenchmarkSuite>;
    static runRegressionSuite(): Promise<BenchmarkSuite[]>;
}
export declare class RegressionTester {
    private baselines;
    setBaseline(name: string, result: BenchmarkResult): void;
    checkRegression(name: string, current: BenchmarkResult, threshold?: number): {
        hasRegression: boolean;
        improvement: number;
        message: string;
    };
    runRegressionCheck(): Promise<void>;
}
export declare const measurePerformance: <T>(name: string, fn: () => T, iterations?: number) => Promise<BenchmarkResult>;
export declare const compareSchemas: (schemas: Record<string, any>, testData: unknown[], options?: {
    iterations?: number;
    measureMemory?: boolean;
}) => Promise<BenchmarkSuite>;
export declare const runBenchmarkCLI: () => Promise<void>;
//# sourceMappingURL=index.d.ts.map