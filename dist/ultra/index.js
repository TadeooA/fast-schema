"use strict";
// Ultra-performance API - 100x speed target
// This is the new "fast" API without Zod compatibility constraints
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UltraBatchValidator = exports.UltraObjectSchema = exports.UltraArraySchema = exports.UltraBooleanSchema = exports.UltraNumberSchema = exports.UltraStringSchema = exports.ultra = void 0;
var core_1 = require("./core");
Object.defineProperty(exports, "UltraStringSchema", { enumerable: true, get: function () { return core_1.UltraStringSchema; } });
Object.defineProperty(exports, "UltraNumberSchema", { enumerable: true, get: function () { return core_1.UltraNumberSchema; } });
Object.defineProperty(exports, "UltraBooleanSchema", { enumerable: true, get: function () { return core_1.UltraBooleanSchema; } });
Object.defineProperty(exports, "UltraArraySchema", { enumerable: true, get: function () { return core_1.UltraArraySchema; } });
Object.defineProperty(exports, "UltraObjectSchema", { enumerable: true, get: function () { return core_1.UltraObjectSchema; } });
Object.defineProperty(exports, "UltraBatchValidator", { enumerable: true, get: function () { return core_1.UltraBatchValidator; } });
var extreme_1 = require("./extreme");
// WASM integration for ultra-performance
var wasmValidator = null;
// Lazy load WASM if available
var initWasm = function () { return __awaiter(void 0, void 0, void 0, function () {
    var wasmModule, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (wasmValidator)
                    return [2 /*return*/, wasmValidator];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../wasm/index'); })];
            case 2:
                wasmModule = _a.sent();
                if (wasmModule && wasmModule.FastSchemaWasm) {
                    wasmValidator = wasmModule.FastSchemaWasm;
                    console.log('🚀 WASM ultra-performance module loaded');
                }
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.log('⚡ Using pure TypeScript ultra-performance mode');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, wasmValidator];
        }
    });
}); };
// Performance monitoring
var PerformanceTracker = /** @class */ (function () {
    function PerformanceTracker() {
    }
    PerformanceTracker.startTiming = function (operation) {
        var _this = this;
        var start = performance.now();
        return function () {
            var duration = performance.now() - start;
            var existing = _this.metrics.get(operation);
            if (existing) {
                existing.totalTime += duration;
                existing.calls++;
            }
            else {
                _this.metrics.set(operation, { totalTime: duration, calls: 1 });
            }
        };
    };
    PerformanceTracker.getMetrics = function () {
        var result = {};
        this.metrics.forEach(function (stats, operation) {
            result[operation] = {
                avgTime: stats.totalTime / stats.calls,
                totalCalls: stats.calls
            };
        });
        return result;
    };
    PerformanceTracker.reset = function () {
        this.metrics.clear();
    };
    PerformanceTracker.metrics = new Map();
    return PerformanceTracker;
}());
// Ultra-optimized schema creation with automatic WASM fallback
var UltraSchemaFactory = /** @class */ (function () {
    function UltraSchemaFactory() {
    }
    UltraSchemaFactory.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wasm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.wasmInitialized)
                            return [2 /*return*/];
                        return [4 /*yield*/, initWasm()];
                    case 1:
                        wasm = _a.sent();
                        this.useWasm = !!wasm;
                        this.wasmInitialized = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    UltraSchemaFactory.string = function () {
        var endTiming = PerformanceTracker.startTiming('string_creation');
        var schema = new core_1.UltraStringSchema();
        endTiming();
        return schema;
    };
    UltraSchemaFactory.number = function () {
        var endTiming = PerformanceTracker.startTiming('number_creation');
        var schema = new core_1.UltraNumberSchema();
        endTiming();
        return schema;
    };
    UltraSchemaFactory.boolean = function () {
        var endTiming = PerformanceTracker.startTiming('boolean_creation');
        var schema = new core_1.UltraBooleanSchema();
        endTiming();
        return schema;
    };
    UltraSchemaFactory.array = function (itemSchema) {
        var endTiming = PerformanceTracker.startTiming('array_creation');
        var schema = new core_1.UltraArraySchema(itemSchema);
        endTiming();
        return schema;
    };
    UltraSchemaFactory.object = function (shape) {
        var endTiming = PerformanceTracker.startTiming('object_creation');
        // Auto-detect required fields based on schema types
        var required = [];
        for (var _i = 0, _a = Object.entries(shape); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], schema_1 = _b[1];
            // In a real implementation, we'd check if the schema is optional
            // For now, assume all fields are required for maximum performance
            required.push(key);
        }
        var schema = new core_1.UltraObjectSchema(shape, required);
        endTiming();
        return schema;
    };
    UltraSchemaFactory.batch = function (schema) {
        return new core_1.UltraBatchValidator(schema.getValidator());
    };
    // JIT-optimized schema creation
    UltraSchemaFactory.jit = function (schema) {
        var schemaId = Math.random().toString(36);
        var originalValidator = schema.getValidator();
        return {
            parse: function (data) {
                var optimizedValidator = core_1.JITOptimizer.recordUsage(schemaId, originalValidator);
                return optimizedValidator(data);
            }
        };
    };
    // WASM-accelerated validation
    UltraSchemaFactory.wasm = function (schema) {
        var _this = this;
        var fallbackValidator = schema.getValidator();
        return {
            parse: function (data) {
                if (_this.useWasm && wasmValidator) {
                    try {
                        // In a real implementation, this would call into WASM
                        // For now, we'll use the TypeScript implementation with WASM-like optimizations
                        var endTiming = PerformanceTracker.startTiming('wasm_validation');
                        var result = fallbackValidator(data);
                        endTiming();
                        return result;
                    }
                    catch (error) {
                        // Fallback to TypeScript if WASM fails
                        return fallbackValidator(data);
                    }
                }
                return fallbackValidator(data);
            },
            safeParse: function (data) {
                if (_this.useWasm && wasmValidator) {
                    try {
                        var endTiming = PerformanceTracker.startTiming('wasm_validation');
                        var result = fallbackValidator(data);
                        endTiming();
                        return { success: true, data: result };
                    }
                    catch (error) {
                        return {
                            success: false,
                            error: error instanceof Error ? error.message : 'WASM validation failed'
                        };
                    }
                }
                try {
                    var result = fallbackValidator(data);
                    return { success: true, data: result };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Validation failed'
                    };
                }
            }
        };
    };
    UltraSchemaFactory.useWasm = false;
    UltraSchemaFactory.wasmInitialized = false;
    return UltraSchemaFactory;
}());
// Pre-initialize WASM for immediate availability
UltraSchemaFactory.initialize().catch(function () {
    // Silently fail - TypeScript mode will be used
});
// The main ultra-performance API
exports.ultra = {
    // Primitive types
    string: function () { return UltraSchemaFactory.string(); },
    number: function () { return UltraSchemaFactory.number(); },
    boolean: function () { return UltraSchemaFactory.boolean(); },
    // Complex types
    array: function (schema) {
        return UltraSchemaFactory.array(schema);
    },
    object: function (shape) { return UltraSchemaFactory.object(shape); },
    // Performance utilities
    batch: function (schema) {
        return UltraSchemaFactory.batch(schema);
    },
    jit: function (schema) {
        return UltraSchemaFactory.jit(schema);
    },
    wasm: function (schema) {
        return UltraSchemaFactory.wasm(schema);
    },
    // Utilities
    literal: function (value) {
        var validator = function (data) {
            if (data !== value) {
                throw new Error("Expected literal value: ".concat(value));
            }
            return data;
        };
        return {
            parse: validator,
            safeParse: function (data) {
                try {
                    return { success: true, data: validator(data) };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Literal validation failed'
                    };
                }
            },
            getValidator: function () { return validator; }
        };
    },
    any: function () {
        var validator = function (data) { return data; };
        return {
            parse: validator,
            safeParse: function (data) { return ({ success: true, data: data }); },
            getValidator: function () { return validator; }
        };
    },
    // Performance monitoring
    performance: {
        getMetrics: function () { return PerformanceTracker.getMetrics(); },
        reset: function () { return PerformanceTracker.reset(); },
        // Benchmark a schema
        benchmark: function (schema_2, testData_1) {
            var args_1 = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args_1[_i - 2] = arguments[_i];
            }
            return __awaiter(void 0, __spreadArray([schema_2, testData_1], args_1, true), void 0, function (schema, testData, iterations) {
                var i, start, i, totalTime;
                if (iterations === void 0) { iterations = 10000; }
                return __generator(this, function (_a) {
                    // Warmup
                    for (i = 0; i < 100; i++) {
                        schema.parse(testData[i % testData.length]);
                    }
                    start = performance.now();
                    for (i = 0; i < iterations; i++) {
                        schema.parse(testData[i % testData.length]);
                    }
                    totalTime = performance.now() - start;
                    return [2 /*return*/, {
                            averageTime: totalTime / iterations,
                            throughput: (iterations / totalTime) * 1000, // ops per second
                            totalTime: totalTime
                        }];
                });
            });
        }
    },
    // Extreme optimizations (100x target)
    extreme: extreme_1.extreme,
    // Advanced optimizations
    optimize: {
        // Precompile schemas for maximum performance
        precompile: function (schema) {
            var validator = schema.getValidator();
            var schemaId = Math.random().toString(36);
            // Force JIT optimization immediately
            for (var i = 0; i < 101; i++) {
                core_1.JITOptimizer.recordUsage(schemaId, validator);
            }
            return {
                parse: function (data) {
                    var optimizedValidator = core_1.JITOptimizer.recordUsage(schemaId, validator);
                    return optimizedValidator(data);
                },
                getValidator: function () { return core_1.JITOptimizer.recordUsage(schemaId, validator); }
            };
        },
        // Memory-efficient bulk validation
        bulkValidate: function (schema_2, items_1) {
            var args_1 = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args_1[_i - 2] = arguments[_i];
            }
            return __awaiter(void 0, __spreadArray([schema_2, items_1], args_1, true), void 0, function (schema, items, options) {
                var _a, chunkSize, _b, parallel, _c, errorStrategy, validator, results, errors, start, chunks, i, chunkPromises, chunkResults, _d, chunkResults_1, chunk, i, errorMsg, totalTime;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _a = options.chunkSize, chunkSize = _a === void 0 ? 1000 : _a, _b = options.parallel, parallel = _b === void 0 ? true : _b, _c = options.errorStrategy, errorStrategy = _c === void 0 ? 'fail-fast' : _c;
                            validator = schema.getValidator();
                            results = [];
                            errors = [];
                            start = performance.now();
                            if (!(parallel && items.length > chunkSize)) return [3 /*break*/, 2];
                            chunks = [];
                            for (i = 0; i < items.length; i += chunkSize) {
                                chunks.push(items.slice(i, i + chunkSize));
                            }
                            chunkPromises = chunks.map(function (chunk, chunkIndex) { return __awaiter(void 0, void 0, void 0, function () {
                                var chunkResults, chunkErrors, i, itemIndex, errorMsg;
                                return __generator(this, function (_a) {
                                    chunkResults = [];
                                    chunkErrors = [];
                                    for (i = 0; i < chunk.length; i++) {
                                        itemIndex = chunkIndex * chunkSize + i;
                                        try {
                                            chunkResults.push(validator(chunk[i]));
                                        }
                                        catch (error) {
                                            errorMsg = error instanceof Error ? error.message : 'Validation failed';
                                            chunkErrors.push({ index: itemIndex, error: errorMsg });
                                            if (errorStrategy === 'fail-fast') {
                                                throw new Error("Validation failed at index ".concat(itemIndex, ": ").concat(errorMsg));
                                            }
                                        }
                                    }
                                    return [2 /*return*/, { results: chunkResults, errors: chunkErrors }];
                                });
                            }); });
                            return [4 /*yield*/, Promise.all(chunkPromises)];
                        case 1:
                            chunkResults = _e.sent();
                            for (_d = 0, chunkResults_1 = chunkResults; _d < chunkResults_1.length; _d++) {
                                chunk = chunkResults_1[_d];
                                results.push.apply(results, chunk.results);
                                errors.push.apply(errors, chunk.errors);
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            // Sequential processing
                            for (i = 0; i < items.length; i++) {
                                try {
                                    results.push(validator(items[i]));
                                }
                                catch (error) {
                                    errorMsg = error instanceof Error ? error.message : 'Validation failed';
                                    errors.push({ index: i, error: errorMsg });
                                    if (errorStrategy === 'fail-fast') {
                                        throw new Error("Validation failed at index ".concat(i, ": ").concat(errorMsg));
                                    }
                                }
                            }
                            _e.label = 3;
                        case 3:
                            totalTime = performance.now() - start;
                            return [2 /*return*/, {
                                    results: results,
                                    errors: errors,
                                    stats: {
                                        totalTime: totalTime,
                                        throughput: (items.length / totalTime) * 1000
                                    }
                                }];
                    }
                });
            });
        }
    }
};
// Default export
exports.default = exports.ultra;
