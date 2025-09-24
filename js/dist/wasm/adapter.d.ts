import { Schema } from '../base/schema';
import { SafeParseReturnType } from '../base/types';
export interface WasmValidatorInstance {
    validate(data_json: string): string;
    validate_many(data_array_json: string): string;
    validate_with_options(data_json: string, options_json: string): string;
    get_schema(): string;
    get_stats(): string;
    reset_caches(): void;
    get_memory_info(): string;
}
export interface WasmBatchValidatorInstance {
    validate_dataset(data_array_json: string): string;
    get_batch_stats(): string;
}
export interface WasmUltraFastValidatorInstance {
    validate_batch(values_json: string): string;
}
export interface WasmValidatorConstructor {
    new (schema_json: string): WasmValidatorInstance;
}
export interface WasmBatchValidatorConstructor {
    new (schema_json: string, batch_size: number): WasmBatchValidatorInstance;
}
export interface WasmUltraFastValidatorConstructor {
    new (validator_type: string, config: string): WasmUltraFastValidatorInstance;
}
export interface WasmModule {
    FastValidator: WasmValidatorConstructor;
    FastBatchValidator: WasmBatchValidatorConstructor;
    UltraFastValidator: WasmUltraFastValidatorConstructor;
    FastSchemaUtils: {
        validate_schema(schema_json: string): string;
        get_version(): string;
        analyze_schema_performance(schema_json: string): string;
    };
}
interface WasmPerformanceStats {
    compiled_complexity: number;
    max_depth: number;
    has_patterns: boolean;
    regex_cache_size: number;
    estimated_validation_time_us?: number;
    recommendations?: string[];
}
export declare class WasmSchemaAdapter<T> extends Schema<T> {
    private wasmValidator?;
    private wasmModule?;
    private fallbackSchema;
    private useWasm;
    private wasmSchema;
    constructor(fallbackSchema: Schema<T>);
    private initializeWasm;
    private loadWasmModule;
    private convertToWasmSchema;
    _validate(data: unknown): T;
    private validateWithWasm;
    safeParse(data: unknown): SafeParseReturnType<unknown, T>;
    validateMany(dataArray: unknown[]): Array<SafeParseReturnType<unknown, T>>;
    getPerformanceStats(): WasmPerformanceStats | null;
    resetCaches(): void;
    getMemoryInfo(): any;
    isUsingWasm(): boolean;
    disableWasm(): void;
    enableWasm(): void;
    getTypeScriptSchema(): Schema<T>;
}
export declare function createWasmSchema<T>(fallbackSchema: Schema<T>): WasmSchemaAdapter<T>;
export declare class WasmBatchProcessor<T> {
    private wasmBatchValidator?;
    private fallbackSchema;
    private useWasm;
    private batchSize;
    constructor(schema: Schema<T>, batchSize?: number);
    private initializeWasm;
    private loadWasmModule;
    private convertToWasmSchema;
    validateDataset(dataArray: unknown[]): Array<SafeParseReturnType<unknown, T>>;
    getBatchStats(): any;
    isUsingWasm(): boolean;
}
export declare class WasmUltraFastValidator {
    private wasmValidator?;
    private validatorType;
    private useWasm;
    constructor(validatorType: 'string' | 'number' | 'boolean', config?: any);
    private initializeWasm;
    private loadWasmModule;
    validateBatch(values: unknown[]): {
        results: boolean[];
        stats: any;
    };
    isUsingWasm(): boolean;
}
export {};
//# sourceMappingURL=adapter.d.ts.map