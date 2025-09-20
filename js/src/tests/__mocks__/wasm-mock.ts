// Mock for WASM module during testing
export const mockWasmModule = {
  FastValidator: class MockFastValidator {
    constructor(schema: string) {}
    validate(data: string) { return '{"success":true,"data":null}'; }
    validate_many(data: string) { return '[{"success":true,"data":null}]'; }
    get_stats() { return '{"complexity":1}'; }
    reset_caches() {}
    get_memory_info() { return '{"usage":0}'; }
  },

  FastBatchValidator: class MockFastBatchValidator {
    constructor(schema: string, batchSize: number) {}
    validate_dataset(data: string) { return '[{"success":true,"data":null}]'; }
    get_batch_stats() { return '{"processed":0}'; }
  },

  UltraFastValidator: class MockUltraFastValidator {
    constructor(type: string, config: string) {}
    validate_batch(data: string) { return '{"results":[],"stats":{}}'; }
  },

  FastSchemaUtils: {
    validate_schema: (schema: string) => '{"valid":true}',
    get_version: () => '{"version":"0.1.0"}',
    analyze_schema_performance: (schema: string) => '{"complexity":1}'
  }
};

export default mockWasmModule;