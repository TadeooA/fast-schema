import { Schema } from '../base/schema';
import { SafeParseReturnType } from '../base/types';
export interface PerformanceThresholds {
    minDataSize: number;
    complexityThreshold: number;
    batchSizeThreshold: number;
}
export interface HybridConfig {
    preferWasm: boolean;
    autoFallback: boolean;
    performanceThresholds: PerformanceThresholds;
    enableMetrics: boolean;
    wasmInitTimeout: number;
}
export interface ValidationMetrics {
    totalValidations: number;
    wasmValidations: number;
    typeScriptValidations: number;
    wasmErrors: number;
    averageWasmTime: number;
    averageTypeScriptTime: number;
    lastUpdated: Date;
}
export declare class HybridValidationEngine {
    private config;
    private metrics;
    private wasmAvailable;
    private wasmInitialized;
    constructor(config?: Partial<HybridConfig>);
    private createEmptyMetrics;
    private checkWasmAvailability;
    private initializeWasm;
    createHybridSchema<T>(schema: Schema<T>): HybridSchema<T>;
    shouldUseWasm(data: unknown, schema: Schema<any>, isBatch?: boolean, batchSize?: number): boolean;
    private estimateDataSize;
    private estimateSchemaComplexity;
    recordValidation(useWasm: boolean, duration: number, error?: boolean): void;
    private updateAverageTime;
    getMetrics(): ValidationMetrics;
    resetMetrics(): void;
    updateConfig(config: Partial<HybridConfig>): void;
    getConfig(): HybridConfig;
    isWasmAvailable(): boolean;
    isWasmInitialized(): boolean;
}
export declare class HybridSchema<T> extends Schema<T> {
    private typeScriptSchema;
    private wasmAdapter?;
    private engine;
    constructor(schema: Schema<T>, engine: HybridValidationEngine);
    private initializeWasmAdapter;
    _validate(data: unknown): T;
    safeParse(data: unknown): SafeParseReturnType<unknown, T>;
    validateMany(dataArray: unknown[]): Array<SafeParseReturnType<unknown, T>>;
    private shouldUseWasm;
    getPerformanceInfo(): any;
    forceWasm(): this;
    forceTypeScript(): this;
    resetCaches(): void;
}
export declare function createHybridEngine(config?: Partial<HybridConfig>): HybridValidationEngine;
export declare function getGlobalHybridEngine(): HybridValidationEngine;
export declare function setGlobalHybridEngine(engine: HybridValidationEngine): void;
export declare function hybridize<T>(schema: Schema<T>, engine?: HybridValidationEngine): HybridSchema<T>;
export declare class HybridPerformanceBenchmark {
    private engine;
    constructor(engine?: HybridValidationEngine);
    benchmark<T>(schema: Schema<T>, testData: unknown[], iterations?: number): Promise<{
        wasmResults: {
            averageTime: number;
            throughput: number;
        };
        typeScriptResults: {
            averageTime: number;
            throughput: number;
        };
        recommendation: 'wasm' | 'typescript' | 'hybrid';
    }>;
}
//# sourceMappingURL=hybrid.d.ts.map