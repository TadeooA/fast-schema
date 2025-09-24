"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockWasmModule = void 0;
// Mock for WASM module during testing
exports.mockWasmModule = {
    FastValidator: class MockFastValidator {
        constructor(schema) { }
        validate(data) { return '{"success":true,"data":null}'; }
        validate_many(data) { return '[{"success":true,"data":null}]'; }
        get_stats() { return '{"complexity":1}'; }
        reset_caches() { }
        get_memory_info() { return '{"usage":0}'; }
    },
    FastBatchValidator: class MockFastBatchValidator {
        constructor(schema, batchSize) { }
        validate_dataset(data) { return '[{"success":true,"data":null}]'; }
        get_batch_stats() { return '{"processed":0}'; }
    },
    UltraFastValidator: class MockUltraFastValidator {
        constructor(type, config) { }
        validate_batch(data) { return '{"results":[],"stats":{}}'; }
    },
    FastSchemaUtils: {
        validate_schema: (schema) => '{"valid":true}',
        get_version: () => '{"version":"0.1.0"}',
        analyze_schema_performance: (schema) => '{"complexity":1}'
    }
};
exports.default = exports.mockWasmModule;
//# sourceMappingURL=wasm-mock.js.map