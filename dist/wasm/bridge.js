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
exports.optimizedFast = exports.smartFast = exports.wasmFast = exports.AutoOptimizer = exports.fastWasm = exports.wasmZ = void 0;
exports.createMigrationAdapter = createMigrationAdapter;
exports.withPerformanceMonitoring = withPerformanceMonitoring;
exports.smartSchema = smartSchema;
exports.testWasmIntegration = testWasmIntegration;
exports.getWasmBridgeInstance = getWasmBridgeInstance;
var api_1 = require("../api");
var hybrid_1 = require("./hybrid");
// WASM bridge implementation
var WasmBridge = /** @class */ (function () {
    function WasmBridge() {
        this.initialized = false;
        this.hybridEngine = new hybrid_1.HybridValidationEngine();
        this.initialize();
    }
    WasmBridge.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Give WASM some time to initialize
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 1:
                        // Give WASM some time to initialize
                        _a.sent();
                        this.initialized = true;
                        console.log('WASM bridge initialized');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.warn('WASM bridge initialization failed:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Wrap schema creation methods with hybrid capabilities
    WasmBridge.prototype.wrapString = function () {
        return this.hybridEngine.createHybridSchema(api_1.fast.string());
    };
    WasmBridge.prototype.wrapNumber = function () {
        return this.hybridEngine.createHybridSchema(api_1.fast.number());
    };
    WasmBridge.prototype.wrapBoolean = function () {
        return this.hybridEngine.createHybridSchema(api_1.fast.boolean());
    };
    WasmBridge.prototype.wrapArray = function (schema) {
        var arraySchema = api_1.fast.array(schema);
        return this.hybridEngine.createHybridSchema(arraySchema);
    };
    WasmBridge.prototype.wrapObject = function (shape) {
        var objectSchema = api_1.fast.object(shape);
        return this.hybridEngine.createHybridSchema(objectSchema);
    };
    // WASM utilities
    WasmBridge.prototype.isWasmAvailable = function () {
        return this.hybridEngine.isWasmAvailable();
    };
    WasmBridge.prototype.isWasmInitialized = function () {
        return this.hybridEngine.isWasmInitialized();
    };
    WasmBridge.prototype.getPerformanceMetrics = function () {
        return this.hybridEngine.getMetrics();
    };
    WasmBridge.prototype.resetCaches = function () {
        // Implementation will vary based on WASM module
        console.log('Resetting WASM caches');
    };
    WasmBridge.prototype.benchmark = function (schema_1, testData_1) {
        return __awaiter(this, arguments, void 0, function (schema, testData, iterations) {
            var HybridPerformanceBenchmark, benchmark;
            if (iterations === void 0) { iterations = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./hybrid'); })];
                    case 1:
                        HybridPerformanceBenchmark = (_a.sent()).HybridPerformanceBenchmark;
                        benchmark = new HybridPerformanceBenchmark(this.hybridEngine);
                        return [2 /*return*/, benchmark.benchmark(schema, testData, iterations)];
                }
            });
        });
    };
    WasmBridge.prototype.configure = function (config) {
        this.hybridEngine.updateConfig(config);
    };
    // Create hybrid schema from existing schema
    WasmBridge.prototype.hybridize = function (schema) {
        return this.hybridEngine.createHybridSchema(schema);
    };
    // Auto-detect best validation method for schema
    WasmBridge.prototype.autoHybridize = function (schema) {
        var hybridSchema = this.hybridEngine.createHybridSchema(schema);
        // Auto-configure based on schema characteristics
        var definition = schema.getSchema();
        var config = this.hybridEngine.getConfig();
        // Adjust thresholds based on schema complexity
        if (definition.type === 'object' && definition.shape) {
            var propertyCount = Object.keys(definition.shape).length;
            if (propertyCount > 10) {
                config.performanceThresholds.complexityThreshold = 3; // Lower threshold for complex objects
            }
        }
        if (definition.type === 'array') {
            config.performanceThresholds.batchSizeThreshold = 25; // Lower threshold for arrays
        }
        this.hybridEngine.updateConfig(config);
        return hybridSchema;
    };
    WasmBridge.prototype.getEngine = function () {
        return this.hybridEngine;
    };
    return WasmBridge;
}());
// Global WASM bridge instance
var globalWasmBridge = null;
function getWasmBridge() {
    if (!globalWasmBridge) {
        globalWasmBridge = new WasmBridge();
    }
    return globalWasmBridge;
}
// Enhanced z object with WASM capabilities
exports.wasmZ = {
    // Enhanced primitive types
    string: function () { return getWasmBridge().wrapString(); },
    number: function () { return getWasmBridge().wrapNumber(); },
    boolean: function () { return getWasmBridge().wrapBoolean(); },
    // Enhanced complex types
    array: function (schema) { return getWasmBridge().wrapArray(schema); },
    object: function (shape) {
        return getWasmBridge().wrapObject(shape);
    },
    // WASM utilities
    wasm: {
        isAvailable: function () { return getWasmBridge().isWasmAvailable(); },
        isInitialized: function () { return getWasmBridge().isWasmInitialized(); },
        getPerformanceMetrics: function () { return getWasmBridge().getPerformanceMetrics(); },
        resetCaches: function () { return getWasmBridge().resetCaches(); },
        benchmark: function (schema, testData, iterations) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, getWasmBridge().benchmark(schema, testData, iterations)];
        }); }); },
        configure: function (config) { return getWasmBridge().configure(config); }
    },
    // Hybrid utilities
    hybrid: function (schema) { return getWasmBridge().hybridize(schema); },
    autoHybrid: function (schema) { return getWasmBridge().autoHybridize(schema); }
};
// Compatibility layer for existing usage
exports.fastWasm = exports.wasmZ;
// Migration helper - gradually replace fast with wasmFast
function createMigrationAdapter() {
    return new Proxy(api_1.fast, {
        get: function (target, prop) {
            // If WASM bridge has the property, use it
            if (prop in exports.wasmZ) {
                console.log("[Migration] Using WASM-optimized ".concat(String(prop)));
                return exports.wasmZ[prop];
            }
            // Fallback to original fast
            return target[prop];
        }
    });
}
// Performance monitoring decorator
function withPerformanceMonitoring(fn, name) {
    return (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var start = performance.now();
        var result = fn.apply(void 0, args);
        var duration = performance.now() - start;
        console.log("[Performance] ".concat(name, ": ").concat(duration.toFixed(2), "ms"));
        // Log slow operations
        if (duration > 10) {
            console.warn("[Performance] Slow operation detected: ".concat(name, " took ").concat(duration.toFixed(2), "ms"));
        }
        return result;
    });
}
// Auto-optimization utility
var AutoOptimizer = /** @class */ (function () {
    function AutoOptimizer() {
    }
    AutoOptimizer.recordPerformance = function (schemaType, wasmTime, tsTime) {
        var existing = this.learningData.get(schemaType);
        if (existing) {
            existing.wasmTime = (existing.wasmTime * existing.count + wasmTime) / (existing.count + 1);
            existing.tsTime = (existing.tsTime * existing.count + tsTime) / (existing.count + 1);
            existing.count++;
        }
        else {
            this.learningData.set(schemaType, { wasmTime: wasmTime, tsTime: tsTime, count: 1 });
        }
    };
    AutoOptimizer.getRecommendation = function (schemaType) {
        var data = this.learningData.get(schemaType);
        if (!data || data.count < 5) { // Need at least 5 samples
            return 'unknown';
        }
        // Prefer WASM if it's significantly faster
        if (data.wasmTime < data.tsTime * 0.8) {
            return 'wasm';
        }
        // Prefer TypeScript if WASM is slower
        if (data.wasmTime > data.tsTime * 1.2) {
            return 'typescript';
        }
        return 'unknown';
    };
    AutoOptimizer.getOptimizedSchema = function (schema) {
        var schemaType = schema.getSchema().type;
        var recommendation = this.getRecommendation(schemaType);
        var hybridSchema = exports.wasmZ.hybrid(schema);
        switch (recommendation) {
            case 'wasm':
                hybridSchema.forceWasm();
                console.log("[AutoOptimizer] Using WASM for ".concat(schemaType, " based on learning data"));
                break;
            case 'typescript':
                hybridSchema.forceTypeScript();
                console.log("[AutoOptimizer] Using TypeScript for ".concat(schemaType, " based on learning data"));
                break;
            default:
                console.log("[AutoOptimizer] Using hybrid mode for ".concat(schemaType, " (insufficient data)"));
        }
        return hybridSchema;
    };
    AutoOptimizer.getLearningData = function () {
        return new Map(this.learningData);
    };
    AutoOptimizer.clearLearningData = function () {
        this.learningData.clear();
    };
    AutoOptimizer.learningData = new Map();
    return AutoOptimizer;
}());
exports.AutoOptimizer = AutoOptimizer;
// Smart schema factory with automatic optimization
function smartSchema(schema) {
    return AutoOptimizer.getOptimizedSchema(schema);
}
// Convenience exports for different use cases
exports.wasmFast = exports.wasmZ; // For explicit fast validation
exports.smartFast = createMigrationAdapter(); // For gradual migration
exports.optimizedFast = {
    string: function () { return smartSchema(api_1.fast.string()); },
    number: function () { return smartSchema(api_1.fast.number()); },
    boolean: function () { return smartSchema(api_1.fast.boolean()); },
    array: function (schema) { return smartSchema(api_1.fast.array(schema)); },
    object: function (shape) {
        return smartSchema(api_1.fast.object(shape));
    }
};
// Utility to check if WASM is working correctly
function testWasmIntegration() {
    return __awaiter(this, void 0, void 0, function () {
        var testSchema, testData, wasmStart, wasmResult, wasmTime, tsStart, tsResult, tsTime, wasmWorking, performanceGain;
        return __generator(this, function (_a) {
            try {
                if (!exports.wasmZ.wasm.isAvailable()) {
                    return [2 /*return*/, {
                            wasmAvailable: false,
                            wasmWorking: false,
                            error: 'WASM module not available'
                        }];
                }
                testSchema = exports.wasmZ.object({
                    name: exports.wasmZ.string(),
                    age: exports.wasmZ.number(),
                    active: exports.wasmZ.boolean()
                });
                testData = { name: 'test', age: 25, active: true };
                wasmStart = performance.now();
                wasmResult = testSchema.forceWasm().safeParse(testData);
                wasmTime = performance.now() - wasmStart;
                tsStart = performance.now();
                tsResult = testSchema.forceTypeScript().safeParse(testData);
                tsTime = performance.now() - tsStart;
                wasmWorking = wasmResult.success === tsResult.success;
                performanceGain = tsTime > 0 ? ((tsTime - wasmTime) / tsTime) * 100 : 0;
                return [2 /*return*/, {
                        wasmAvailable: true,
                        wasmWorking: wasmWorking,
                        performanceGain: performanceGain,
                        error: wasmWorking ? undefined : 'WASM validation results differ from TypeScript'
                    }];
            }
            catch (error) {
                return [2 /*return*/, {
                        wasmAvailable: false,
                        wasmWorking: false,
                        error: error instanceof Error ? error.message : 'Unknown error during WASM test'
                    }];
            }
            return [2 /*return*/];
        });
    });
}
// Export the bridge instance for advanced usage
function getWasmBridgeInstance() {
    return getWasmBridge();
}
