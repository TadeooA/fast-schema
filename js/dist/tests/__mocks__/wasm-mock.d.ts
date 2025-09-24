export declare const mockWasmModule: {
    FastValidator: {
        new (schema: string): {
            validate(data: string): string;
            validate_many(data: string): string;
            get_stats(): string;
            reset_caches(): void;
            get_memory_info(): string;
        };
    };
    FastBatchValidator: {
        new (schema: string, batchSize: number): {
            validate_dataset(data: string): string;
            get_batch_stats(): string;
        };
    };
    UltraFastValidator: {
        new (type: string, config: string): {
            validate_batch(data: string): string;
        };
    };
    FastSchemaUtils: {
        validate_schema: (schema: string) => string;
        get_version: () => string;
        analyze_schema_performance: (schema: string) => string;
    };
};
export default mockWasmModule;
//# sourceMappingURL=wasm-mock.d.ts.map