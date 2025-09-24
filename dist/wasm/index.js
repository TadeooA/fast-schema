"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var FastSchemaWasm = /** @class */ (function () {
    function FastSchemaWasm() {
    }
    Object.defineProperty(FastSchemaWasm, "z", {
        // Quick access to different validation variants
        get: function () { return bridge_2.wasmZ; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FastSchemaWasm, "fast", {
        get: function () { return bridge_2.wasmFast; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FastSchemaWasm, "smart", {
        get: function () { return bridge_2.smartFast; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FastSchemaWasm, "optimized", {
        get: function () { return bridge_2.optimizedFast; },
        enumerable: false,
        configurable: true
    });
    // WASM utilities
    FastSchemaWasm.isAvailable = function () {
        return bridge_2.wasmZ.wasm.isAvailable();
    };
    FastSchemaWasm.test = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, bridge_2.testWasmIntegration)()];
            });
        });
    };
    FastSchemaWasm.configure = function (config) {
        return bridge_2.wasmZ.wasm.configure(config);
    };
    FastSchemaWasm.getMetrics = function () {
        return bridge_2.wasmZ.wasm.getPerformanceMetrics();
    };
    FastSchemaWasm.resetCaches = function () {
        return bridge_2.wasmZ.wasm.resetCaches();
    };
    // Performance analysis
    FastSchemaWasm.benchmark = function (schema_1, testData_1) {
        return __awaiter(this, arguments, void 0, function (schema, testData, iterations) {
            if (iterations === void 0) { iterations = 100; }
            return __generator(this, function (_a) {
                return [2 /*return*/, bridge_2.wasmZ.wasm.benchmark(schema, testData, iterations)];
            });
        });
    };
    // Auto-optimization
    FastSchemaWasm.optimizeSchema = function (schema) {
        return (0, bridge_2.smartSchema)(schema);
    };
    FastSchemaWasm.getLearningData = function () {
        return bridge_2.AutoOptimizer.getLearningData();
    };
    FastSchemaWasm.clearLearningData = function () {
        return bridge_2.AutoOptimizer.clearLearningData();
    };
    return FastSchemaWasm;
}());
exports.FastSchemaWasm = FastSchemaWasm;
// Default export for convenience
exports.default = FastSchemaWasm;
// Import statements for easier usage
var bridge_2 = require("./bridge");
