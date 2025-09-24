"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastSchemaWasm = exports.loadWasmBindings = exports.ESMWrapper = exports.NodeWasmLoader = exports.getWasmBridgeInstance = exports.testWasmIntegration = exports.smartSchema = exports.AutoOptimizer = exports.withPerformanceMonitoring = exports.createMigrationAdapter = exports.optimizedFast = exports.smartFast = exports.wasmFast = exports.fastWasm = exports.wasmZ = exports.hybridize = exports.setGlobalHybridEngine = exports.getGlobalHybridEngine = exports.createHybridEngine = exports.HybridPerformanceBenchmark = exports.HybridSchema = exports.HybridValidationEngine = exports.createWasmSchema = exports.WasmUltraFastValidator = exports.WasmBatchProcessor = exports.WasmSchemaAdapter = void 0;
// WASM module exports - Hybrid WASM+TypeScript validation system
var adapter_1 = require("./adapter");
Object.defineProperty(exports, "WasmSchemaAdapter", { enumerable: true, get: function () { return adapter_1.WasmSchemaAdapter; } });
Object.defineProperty(exports, "WasmBatchProcessor", { enumerable: true, get: function () { return adapter_1.WasmBatchProcessor; } });
Object.defineProperty(exports, "WasmUltraFastValidator", { enumerable: true, get: function () { return adapter_1.WasmUltraFastValidator; } });
Object.defineProperty(exports, "createWasmSchema", { enumerable: true, get: function () { return adapter_1.createWasmSchema; } });
var hybrid_1 = require("./hybrid");
Object.defineProperty(exports, "HybridValidationEngine", { enumerable: true, get: function () { return hybrid_1.HybridValidationEngine; } });
Object.defineProperty(exports, "HybridSchema", { enumerable: true, get: function () { return hybrid_1.HybridSchema; } });
Object.defineProperty(exports, "HybridPerformanceBenchmark", { enumerable: true, get: function () { return hybrid_1.HybridPerformanceBenchmark; } });
Object.defineProperty(exports, "createHybridEngine", { enumerable: true, get: function () { return hybrid_1.createHybridEngine; } });
Object.defineProperty(exports, "getGlobalHybridEngine", { enumerable: true, get: function () { return hybrid_1.getGlobalHybridEngine; } });
Object.defineProperty(exports, "setGlobalHybridEngine", { enumerable: true, get: function () { return hybrid_1.setGlobalHybridEngine; } });
Object.defineProperty(exports, "hybridize", { enumerable: true, get: function () { return hybrid_1.hybridize; } });
var bridge_1 = require("./bridge");
Object.defineProperty(exports, "wasmZ", { enumerable: true, get: function () { return bridge_1.wasmZ; } });
Object.defineProperty(exports, "fastWasm", { enumerable: true, get: function () { return bridge_1.fastWasm; } });
Object.defineProperty(exports, "wasmFast", { enumerable: true, get: function () { return bridge_1.wasmFast; } });
Object.defineProperty(exports, "smartFast", { enumerable: true, get: function () { return bridge_1.smartFast; } });
Object.defineProperty(exports, "optimizedFast", { enumerable: true, get: function () { return bridge_1.optimizedFast; } });
Object.defineProperty(exports, "createMigrationAdapter", { enumerable: true, get: function () { return bridge_1.createMigrationAdapter; } });
Object.defineProperty(exports, "withPerformanceMonitoring", { enumerable: true, get: function () { return bridge_1.withPerformanceMonitoring; } });
Object.defineProperty(exports, "AutoOptimizer", { enumerable: true, get: function () { return bridge_1.AutoOptimizer; } });
Object.defineProperty(exports, "smartSchema", { enumerable: true, get: function () { return bridge_1.smartSchema; } });
Object.defineProperty(exports, "testWasmIntegration", { enumerable: true, get: function () { return bridge_1.testWasmIntegration; } });
Object.defineProperty(exports, "getWasmBridgeInstance", { enumerable: true, get: function () { return bridge_1.getWasmBridgeInstance; } });
var node_loader_1 = require("./node-loader");
Object.defineProperty(exports, "NodeWasmLoader", { enumerable: true, get: function () { return node_loader_1.NodeWasmLoader; } });
var esm_wrapper_1 = require("./esm-wrapper");
Object.defineProperty(exports, "ESMWrapper", { enumerable: true, get: function () { return esm_wrapper_1.ESMWrapper; } });
Object.defineProperty(exports, "loadWasmBindings", { enumerable: true, get: function () { return esm_wrapper_1.loadWasmBindings; } });
// Main WASM integration API
class FastSchemaWasm {
    // Quick access to different validation variants
    static get z() { return bridge_2.wasmZ; }
    static get fast() { return bridge_2.wasmFast; }
    static get smart() { return bridge_2.smartFast; }
    static get optimized() { return bridge_2.optimizedFast; }
    // WASM utilities
    static isAvailable() {
        return bridge_2.wasmZ.wasm.isAvailable();
    }
    static async test() {
        return (0, bridge_2.testWasmIntegration)();
    }
    static configure(config) {
        return bridge_2.wasmZ.wasm.configure(config);
    }
    static getMetrics() {
        return bridge_2.wasmZ.wasm.getPerformanceMetrics();
    }
    static resetCaches() {
        return bridge_2.wasmZ.wasm.resetCaches();
    }
    // Performance analysis
    static async benchmark(schema, testData, iterations = 100) {
        return bridge_2.wasmZ.wasm.benchmark(schema, testData, iterations);
    }
    // Auto-optimization
    static optimizeSchema(schema) {
        return (0, bridge_2.smartSchema)(schema);
    }
    static getLearningData() {
        return bridge_2.AutoOptimizer.getLearningData();
    }
    static clearLearningData() {
        return bridge_2.AutoOptimizer.clearLearningData();
    }
}
exports.FastSchemaWasm = FastSchemaWasm;
// Default export for convenience
exports.default = FastSchemaWasm;
// Import statements for easier usage
const bridge_2 = require("./bridge");
//# sourceMappingURL=index.js.map