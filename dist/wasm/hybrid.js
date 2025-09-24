"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.HybridPerformanceBenchmark = exports.HybridSchema = exports.HybridValidationEngine = void 0;
exports.createHybridEngine = createHybridEngine;
exports.getGlobalHybridEngine = getGlobalHybridEngine;
exports.setGlobalHybridEngine = setGlobalHybridEngine;
exports.hybridize = hybridize;
// Hybrid WASM+TypeScript validation system
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
var adapter_1 = require("./adapter");
var DEFAULT_THRESHOLDS = {
    minDataSize: 100, // Use WASM for data > 100 bytes
    complexityThreshold: 5, // Use WASM for complex schemas
    batchSizeThreshold: 50 // Use WASM for batches > 50 items
};
var DEFAULT_CONFIG = {
    preferWasm: true,
    autoFallback: true,
    performanceThresholds: DEFAULT_THRESHOLDS,
    enableMetrics: true,
    wasmInitTimeout: 5000
};
// Hybrid validation engine
var HybridValidationEngine = /** @class */ (function () {
    function HybridValidationEngine(config) {
        if (config === void 0) { config = {}; }
        this.wasmAvailable = false;
        this.wasmInitialized = false;
        this.config = __assign(__assign({}, DEFAULT_CONFIG), config);
        this.metrics = this.createEmptyMetrics();
        this.checkWasmAvailability();
    }
    HybridValidationEngine.prototype.createEmptyMetrics = function () {
        return {
            totalValidations: 0,
            wasmValidations: 0,
            typeScriptValidations: 0,
            wasmErrors: 0,
            averageWasmTime: 0,
            averageTypeScriptTime: 0,
            lastUpdated: new Date()
        };
    };
    HybridValidationEngine.prototype.checkWasmAvailability = function () {
        return __awaiter(this, void 0, void 0, function () {
            var timeoutPromise, initPromise, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        timeoutPromise = new Promise(function (_, reject) {
                            setTimeout(function () { return reject(new Error('WASM init timeout')); }, _this.config.wasmInitTimeout);
                        });
                        initPromise = this.initializeWasm();
                        return [4 /*yield*/, Promise.race([initPromise, timeoutPromise])];
                    case 1:
                        _a.sent();
                        this.wasmAvailable = true;
                        this.wasmInitialized = true;
                        console.log('Hybrid validation engine: WASM available');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.warn('Hybrid validation engine: WASM not available, using TypeScript only:', error_1);
                        this.wasmAvailable = false;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HybridValidationEngine.prototype.initializeWasm = function () {
        return __awaiter(this, void 0, void 0, function () {
            var NodeWasmLoader, wasmInstance, possiblePaths, _i, possiblePaths_1, path, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./node-loader'); })];
                    case 1:
                        NodeWasmLoader = (_b.sent()).NodeWasmLoader;
                        if (!NodeWasmLoader.isNodeEnvironment()) return [3 /*break*/, 3];
                        return [4 /*yield*/, NodeWasmLoader.getInstance()];
                    case 2:
                        wasmInstance = _b.sent();
                        if (!wasmInstance) {
                            throw new Error('Failed to load WASM in Node.js');
                        }
                        return [2 /*return*/]; // Successfully loaded
                    case 3:
                        possiblePaths = [
                            '../pkg/fast_schema',
                            './pkg/fast_schema',
                            '../../pkg/fast_schema',
                            'fast_schema',
                            'fast-schema'
                        ];
                        _i = 0, possiblePaths_1 = possiblePaths;
                        _b.label = 4;
                    case 4:
                        if (!(_i < possiblePaths_1.length)) return [3 /*break*/, 9];
                        path = possiblePaths_1[_i];
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, Promise.resolve("".concat(path)).then(function (s) { return require(s); })];
                    case 6:
                        _b.sent();
                        return [2 /*return*/]; // Successfully loaded
                    case 7:
                        _a = _b.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 4];
                    case 9: throw new Error('WASM module not found');
                    case 10:
                        error_2 = _b.sent();
                        throw new Error("WASM initialization failed: ".concat(error_2));
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    // Create a hybrid schema that automatically chooses the best validation method
    HybridValidationEngine.prototype.createHybridSchema = function (schema) {
        return new HybridSchema(schema, this);
    };
    // Determine whether to use WASM for a given validation task
    HybridValidationEngine.prototype.shouldUseWasm = function (data, schema, isBatch, batchSize) {
        if (isBatch === void 0) { isBatch = false; }
        if (batchSize === void 0) { batchSize = 0; }
        if (!this.wasmAvailable || !this.config.preferWasm) {
            return false;
        }
        // Check data size threshold
        var dataSize = this.estimateDataSize(data);
        if (dataSize < this.config.performanceThresholds.minDataSize) {
            return false;
        }
        // Check schema complexity
        var complexity = this.estimateSchemaComplexity(schema);
        if (complexity < this.config.performanceThresholds.complexityThreshold) {
            return false;
        }
        // Check batch size threshold
        if (isBatch && batchSize < this.config.performanceThresholds.batchSizeThreshold) {
            return false;
        }
        return true;
    };
    HybridValidationEngine.prototype.estimateDataSize = function (data) {
        try {
            return JSON.stringify(data).length;
        }
        catch (_a) {
            return 0;
        }
    };
    HybridValidationEngine.prototype.estimateSchemaComplexity = function (schema) {
        var definition = schema.getSchema();
        var complexity = 1;
        if (definition.type === 'object' && definition.shape) {
            complexity += Object.keys(definition.shape).length;
            // Add complexity for nested objects
            for (var _i = 0, _a = Object.values(definition.shape); _i < _a.length; _i++) {
                var value = _a[_i];
                complexity += this.estimateSchemaComplexity(value);
            }
        }
        if (definition.type === 'array' && definition.elementSchema) {
            complexity += this.estimateSchemaComplexity(definition.elementSchema);
        }
        return complexity;
    };
    // Record performance metrics
    HybridValidationEngine.prototype.recordValidation = function (useWasm, duration, error) {
        if (!this.config.enableMetrics)
            return;
        this.metrics.totalValidations++;
        this.metrics.lastUpdated = new Date();
        if (useWasm) {
            this.metrics.wasmValidations++;
            if (error)
                this.metrics.wasmErrors++;
            this.updateAverageTime('wasm', duration);
        }
        else {
            this.metrics.typeScriptValidations++;
            this.updateAverageTime('typescript', duration);
        }
    };
    HybridValidationEngine.prototype.updateAverageTime = function (type, duration) {
        if (type === 'wasm') {
            var count = this.metrics.wasmValidations;
            this.metrics.averageWasmTime = ((this.metrics.averageWasmTime * (count - 1)) + duration) / count;
        }
        else {
            var count = this.metrics.typeScriptValidations;
            this.metrics.averageTypeScriptTime = ((this.metrics.averageTypeScriptTime * (count - 1)) + duration) / count;
        }
    };
    // Get performance metrics
    HybridValidationEngine.prototype.getMetrics = function () {
        return __assign({}, this.metrics);
    };
    // Reset metrics
    HybridValidationEngine.prototype.resetMetrics = function () {
        this.metrics = this.createEmptyMetrics();
    };
    // Configuration management
    HybridValidationEngine.prototype.updateConfig = function (config) {
        this.config = __assign(__assign({}, this.config), config);
    };
    HybridValidationEngine.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    // WASM availability
    HybridValidationEngine.prototype.isWasmAvailable = function () {
        return this.wasmAvailable;
    };
    HybridValidationEngine.prototype.isWasmInitialized = function () {
        return this.wasmInitialized;
    };
    return HybridValidationEngine;
}());
exports.HybridValidationEngine = HybridValidationEngine;
// Hybrid schema wrapper
var HybridSchema = /** @class */ (function (_super) {
    __extends(HybridSchema, _super);
    function HybridSchema(schema, engine) {
        var _this = _super.call(this, schema.getSchema()) || this;
        _this.typeScriptSchema = schema;
        _this.engine = engine;
        _this.initializeWasmAdapter();
        return _this;
    }
    HybridSchema.prototype.initializeWasmAdapter = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.engine.isWasmAvailable()) {
                    try {
                        this.wasmAdapter = new adapter_1.WasmSchemaAdapter(this.typeScriptSchema);
                    }
                    catch (error) {
                        console.warn('Failed to initialize WASM adapter:', error);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    HybridSchema.prototype._validate = function (data) {
        var _a;
        var start = performance.now();
        var useWasm = this.shouldUseWasm(data);
        try {
            if (useWasm && ((_a = this.wasmAdapter) === null || _a === void 0 ? void 0 : _a.isUsingWasm())) {
                var result = this.wasmAdapter._validate(data);
                this.engine.recordValidation(true, performance.now() - start);
                return result;
            }
            else {
                var result = this.typeScriptSchema._validate(data);
                this.engine.recordValidation(false, performance.now() - start);
                return result;
            }
        }
        catch (error) {
            if (useWasm && this.engine.getConfig().autoFallback) {
                console.warn('WASM validation failed, falling back to TypeScript:', error);
                this.engine.recordValidation(true, performance.now() - start, true);
                try {
                    var result = this.typeScriptSchema._validate(data);
                    this.engine.recordValidation(false, performance.now() - start);
                    return result;
                }
                catch (fallbackError) {
                    throw fallbackError;
                }
            }
            throw error;
        }
    };
    HybridSchema.prototype.safeParse = function (data) {
        var _a;
        var start = performance.now();
        var useWasm = this.shouldUseWasm(data);
        try {
            if (useWasm && ((_a = this.wasmAdapter) === null || _a === void 0 ? void 0 : _a.isUsingWasm())) {
                var result = this.wasmAdapter.safeParse(data);
                this.engine.recordValidation(true, performance.now() - start, !result.success);
                return result;
            }
            else {
                var result = this.typeScriptSchema.safeParse(data);
                this.engine.recordValidation(false, performance.now() - start, !result.success);
                return result;
            }
        }
        catch (error) {
            if (useWasm && this.engine.getConfig().autoFallback) {
                console.warn('WASM safeParse failed, falling back to TypeScript:', error);
                this.engine.recordValidation(true, performance.now() - start, true);
                var result = this.typeScriptSchema.safeParse(data);
                this.engine.recordValidation(false, performance.now() - start, !result.success);
                return result;
            }
            // Return error result for safeParse
            return {
                success: false,
                error: error instanceof types_1.ValidationError ? error : new types_1.ValidationError([{
                        code: 'hybrid_error',
                        path: [],
                        message: error instanceof Error ? error.message : 'Unknown validation error'
                    }])
            };
        }
    };
    // Batch validation with automatic WASM selection
    HybridSchema.prototype.validateMany = function (dataArray) {
        var _this = this;
        var _a;
        var start = performance.now();
        var useWasm = this.shouldUseWasm(dataArray, true, dataArray.length);
        try {
            if (useWasm && ((_a = this.wasmAdapter) === null || _a === void 0 ? void 0 : _a.isUsingWasm())) {
                var results = this.wasmAdapter.validateMany(dataArray);
                this.engine.recordValidation(true, performance.now() - start);
                return results;
            }
            else {
                var results = dataArray.map(function (item) { return _this.typeScriptSchema.safeParse(item); });
                this.engine.recordValidation(false, performance.now() - start);
                return results;
            }
        }
        catch (error) {
            if (useWasm && this.engine.getConfig().autoFallback) {
                console.warn('WASM batch validation failed, falling back to TypeScript:', error);
                this.engine.recordValidation(true, performance.now() - start, true);
                var results = dataArray.map(function (item) { return _this.typeScriptSchema.safeParse(item); });
                this.engine.recordValidation(false, performance.now() - start);
                return results;
            }
            throw error;
        }
    };
    HybridSchema.prototype.shouldUseWasm = function (data, isBatch, batchSize) {
        if (isBatch === void 0) { isBatch = false; }
        if (batchSize === void 0) { batchSize = 0; }
        return this.engine.shouldUseWasm(data, this.typeScriptSchema, isBatch, batchSize);
    };
    // Performance information
    HybridSchema.prototype.getPerformanceInfo = function () {
        if (this.wasmAdapter) {
            return {
                wasmAvailable: this.wasmAdapter.isUsingWasm(),
                wasmStats: this.wasmAdapter.getPerformanceStats(),
                memoryInfo: this.wasmAdapter.getMemoryInfo(),
                hybridMetrics: this.engine.getMetrics()
            };
        }
        return {
            wasmAvailable: false,
            hybridMetrics: this.engine.getMetrics()
        };
    };
    // Force validation method
    HybridSchema.prototype.forceWasm = function () {
        if (this.wasmAdapter) {
            this.wasmAdapter.enableWasm();
        }
        return this;
    };
    HybridSchema.prototype.forceTypeScript = function () {
        if (this.wasmAdapter) {
            this.wasmAdapter.disableWasm();
        }
        return this;
    };
    // Memory management
    HybridSchema.prototype.resetCaches = function () {
        if (this.wasmAdapter) {
            this.wasmAdapter.resetCaches();
        }
    };
    return HybridSchema;
}(schema_1.Schema));
exports.HybridSchema = HybridSchema;
// Global hybrid engine instance
var globalHybridEngine = null;
// Factory functions
function createHybridEngine(config) {
    return new HybridValidationEngine(config);
}
function getGlobalHybridEngine() {
    if (!globalHybridEngine) {
        globalHybridEngine = new HybridValidationEngine();
    }
    return globalHybridEngine;
}
function setGlobalHybridEngine(engine) {
    globalHybridEngine = engine;
}
// Utility function to wrap any schema with hybrid capabilities
function hybridize(schema, engine) {
    var hybridEngine = engine || getGlobalHybridEngine();
    return hybridEngine.createHybridSchema(schema);
}
// Performance benchmark utility
var HybridPerformanceBenchmark = /** @class */ (function () {
    function HybridPerformanceBenchmark(engine) {
        this.engine = engine || getGlobalHybridEngine();
    }
    HybridPerformanceBenchmark.prototype.benchmark = function (schema_2, testData_1) {
        return __awaiter(this, arguments, void 0, function (schema, testData, iterations) {
            var hybridSchema, wasmTimes, i, start, typeScriptTimes, i, start, wasmAvg, tsAvg, wasmThroughput, tsThroughput, recommendation;
            var _a;
            if (iterations === void 0) { iterations = 100; }
            return __generator(this, function (_b) {
                hybridSchema = this.engine.createHybridSchema(schema);
                wasmTimes = [];
                if ((_a = hybridSchema['wasmAdapter']) === null || _a === void 0 ? void 0 : _a.isUsingWasm()) {
                    for (i = 0; i < iterations; i++) {
                        start = performance.now();
                        hybridSchema.forceWasm().validateMany(testData);
                        wasmTimes.push(performance.now() - start);
                    }
                }
                typeScriptTimes = [];
                for (i = 0; i < iterations; i++) {
                    start = performance.now();
                    hybridSchema.forceTypeScript().validateMany(testData);
                    typeScriptTimes.push(performance.now() - start);
                }
                wasmAvg = wasmTimes.length > 0 ? wasmTimes.reduce(function (a, b) { return a + b; }, 0) / wasmTimes.length : 0;
                tsAvg = typeScriptTimes.reduce(function (a, b) { return a + b; }, 0) / typeScriptTimes.length;
                wasmThroughput = wasmTimes.length > 0 ? (testData.length * iterations) / (wasmAvg * iterations / 1000) : 0;
                tsThroughput = (testData.length * iterations) / (tsAvg * iterations / 1000);
                if (wasmAvg > 0 && wasmAvg < tsAvg * 0.8) {
                    recommendation = 'wasm';
                }
                else if (wasmAvg > tsAvg * 1.2) {
                    recommendation = 'typescript';
                }
                else {
                    recommendation = 'hybrid';
                }
                return [2 /*return*/, {
                        wasmResults: { averageTime: wasmAvg, throughput: wasmThroughput },
                        typeScriptResults: { averageTime: tsAvg, throughput: tsThroughput },
                        recommendation: recommendation
                    }];
            });
        });
    };
    return HybridPerformanceBenchmark;
}());
exports.HybridPerformanceBenchmark = HybridPerformanceBenchmark;
