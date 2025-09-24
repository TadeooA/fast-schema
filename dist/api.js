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
exports.Schema = exports.ValidationError = exports.fast = exports.EnumSchema = exports.LiteralSchema = exports.UnionSchema = void 0;
// Main API - the `fast` object for ultra-performance validation
var types_1 = require("./base/types");
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return types_1.ValidationError; } });
var schema_1 = require("./base/schema");
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return schema_1.Schema; } });
// WASM integration imports (optional - will gracefully degrade if not available)
var wasmModule = null;
try {
    // Dynamic import to avoid breaking when WASM is not available
    Promise.resolve().then(function () { return require('./wasm/index'); }).then(function (module) {
        wasmModule = module;
        console.log('WASM module loaded successfully');
    }).catch(function () {
        // WASM not available - continue with TypeScript only
    });
}
catch (_a) {
    // WASM not available
}
var string_1 = require("./primitives/string");
var number_1 = require("./primitives/number");
var index_1 = require("./primitives/index");
var array_1 = require("./complex/array");
var object_1 = require("./complex/object");
var record_1 = require("./complex/record");
var intersection_1 = require("./advanced/intersection");
var conditional_1 = require("./advanced/conditional");
var async_1 = require("./advanced/async");
var formats_1 = require("./advanced/formats");
var performance_1 = require("./advanced/performance");
var composition_1 = require("./advanced/composition");
// Union schema for multiple type options
var UnionSchema = /** @class */ (function (_super) {
    __extends(UnionSchema, _super);
    function UnionSchema(options) {
        var _this = _super.call(this, {
            type: 'union',
            options: options.map(function (schema) { return schema.getSchema(); })
        }) || this;
        _this.options = options;
        return _this;
    }
    UnionSchema.prototype._validate = function (data) {
        var issues = [];
        var _loop_1 = function (i) {
            try {
                var option = this_1.options[i];
                if (option) {
                    return { value: option._validate(data) };
                }
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
                    issues.push.apply(issues, error.issues.map(function (issue) { return (__assign(__assign({}, issue), { path: __spreadArray(["option_".concat(i)], issue.path, true) })); }));
                }
            }
        };
        var this_1 = this;
        // Try each option until one succeeds
        for (var i = 0; i < this.options.length; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        // If no option succeeded, throw with all collected issues
        throw new types_1.ValidationError([{
                code: 'invalid_union',
                path: [],
                message: "Input did not match any union option. Tried ".concat(this.options.length, " options.")
            }]);
    };
    return UnionSchema;
}(schema_1.Schema));
exports.UnionSchema = UnionSchema;
// Literal schema for specific values
var LiteralSchema = /** @class */ (function (_super) {
    __extends(LiteralSchema, _super);
    function LiteralSchema(value) {
        var _this = _super.call(this, { type: 'literal', value: value }) || this;
        _this.value = value;
        return _this;
    }
    LiteralSchema.prototype._validate = function (data) {
        if (data !== this.value) {
            throw new types_1.ValidationError([{
                    code: 'invalid_literal',
                    path: [],
                    message: "Expected literal value: ".concat(this.value),
                    received: typeof data,
                    expected: String(this.value)
                }]);
        }
        return data;
    };
    return LiteralSchema;
}(schema_1.Schema));
exports.LiteralSchema = LiteralSchema;
// Enum schema for string enums
var EnumSchema = /** @class */ (function (_super) {
    __extends(EnumSchema, _super);
    function EnumSchema(values) {
        var _this = _super.call(this, { type: 'enum', values: values }) || this;
        _this.values = values;
        return _this;
    }
    EnumSchema.prototype._validate = function (data) {
        if (typeof data !== 'string' || !this.values.includes(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_enum_value',
                    path: [],
                    message: "Expected one of: ".concat(this.values.join(', ')),
                    received: typeof data,
                    expected: this.values.join(' | ')
                }]);
        }
        return data;
    };
    return EnumSchema;
}(schema_1.Schema));
exports.EnumSchema = EnumSchema;
// Ultra-performance imports
var index_2 = require("./ultra/index");
// Tiered performance system
var index_3 = require("./tiered/index");
// Main fast API object - ultra-performance validation without Zod compatibility constraints
exports.fast = {
    // Primitive types
    string: function () { return new string_1.StringSchema(); },
    number: function () { return new number_1.NumberSchema(); },
    boolean: function () { return new index_1.BooleanSchema(); },
    null: function () { return new index_1.NullSchema(); },
    undefined: function () { return new index_1.UndefinedSchema(); },
    any: function () { return new index_1.AnySchema(); },
    unknown: function () { return new index_1.UnknownSchema(); },
    never: function () { return new index_1.NeverSchema(); },
    void: function () { return new index_1.UndefinedSchema(); },
    // Complex types
    array: function (schema) { return new array_1.ArraySchema(schema); },
    object: function (shape) { return new object_1.ObjectSchema(shape); },
    record: function (valueSchema) { return new record_1.RecordSchema(valueSchema); },
    // Union and literal types
    union: function (schemas) { return new UnionSchema(schemas); },
    intersection: function (schemaA, schemaB) { return new intersection_1.IntersectionSchema(schemaA, schemaB); },
    literal: function (value) { return new LiteralSchema(value); },
    enum: function (values) { return new EnumSchema(values); },
    // Advanced types
    discriminatedUnion: function (discriminator, schemas) { return new composition_1.DiscriminatedUnionSchema(discriminator, schemas); },
    // Utility functions
    coerce: {
        string: function () { return new string_1.StringSchema().transform(function (data) { return String(data); }); },
        number: function () { return new number_1.NumberSchema().transform(function (data) { return Number(data); }); },
        boolean: function () { return new index_1.BooleanSchema().transform(function (data) { return Boolean(data); }); },
        date: function () { return new string_1.StringSchema().transform(function (data) { return new Date(data); }); }
    },
    // Schema composition utilities
    deepPartial: function (schema) { return (0, composition_1.makeDeepPartial)(schema); },
    required: function (schema) { return (0, composition_1.makeRequired)(schema); },
    readonly: function (schema) { return (0, composition_1.makeReadonly)(schema); },
    nonNullable: function (schema) { return (0, composition_1.makeNonNullable)(schema); },
    keyof: function (schema) { return (0, composition_1.keyof)(schema); },
    // Conditional validation
    conditional: conditional_1.conditional,
    // Performance utilities
    jit: function (schema) { return new performance_1.JITSchema(schema); },
    batch: function (schema) { return new performance_1.BatchValidator(schema); },
    // Advanced string with extended formats
    advancedString: function () { return new formats_1.AdvancedStringSchema(); },
    // Async validation
    async: function (validator) { return new async_1.AsyncSchema(validator); },
    promise: function (schema) { return new async_1.PromiseSchema(schema); },
    // Type utilities
    instanceof: function (ctor) {
        var InstanceofSchema = /** @class */ (function (_super) {
            __extends(InstanceofSchema, _super);
            function InstanceofSchema() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            InstanceofSchema.prototype._validate = function (data) {
                if (!(data instanceof ctor)) {
                    throw new types_1.ValidationError([{
                            code: 'invalid_type',
                            path: [],
                            message: "Expected instance of ".concat(ctor.name),
                            received: typeof data,
                            expected: ctor.name
                        }]);
                }
                return data;
            };
            return InstanceofSchema;
        }(schema_1.Schema));
        return new InstanceofSchema({ type: 'instanceof', constructor: ctor.name });
    },
    // Advanced schemas
    lazy: function (getter) {
        var LazySchema = /** @class */ (function (_super) {
            __extends(LazySchema, _super);
            function LazySchema() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            LazySchema.prototype._validate = function (data) {
                return getter()._validate(data);
            };
            return LazySchema;
        }(schema_1.Schema));
        return new LazySchema({ type: 'lazy' });
    },
    custom: function (validator, message) {
        var CustomSchema = /** @class */ (function (_super) {
            __extends(CustomSchema, _super);
            function CustomSchema() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            CustomSchema.prototype._validate = function (data) {
                if (!validator(data)) {
                    throw new types_1.ValidationError([{
                            code: 'custom',
                            path: [],
                            message: message || 'Custom validation failed'
                        }]);
                }
                return data;
            };
            return CustomSchema;
        }(schema_1.Schema));
        return new CustomSchema({ type: 'custom' });
    },
    // Ultra-performance mode (100x target)
    ultra: index_2.ultra,
    // Tiered performance system - choose your speed level
    performance: index_3.default,
    // WASM integration utilities (when available)
    wasm: {
        isAvailable: function () { var _a; return ((_a = wasmModule === null || wasmModule === void 0 ? void 0 : wasmModule.FastSchemaWasm) === null || _a === void 0 ? void 0 : _a.isAvailable()) || false; },
        test: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (wasmModule === null || wasmModule === void 0 ? void 0 : wasmModule.testWasmIntegration) {
                    return [2 /*return*/, wasmModule.testWasmIntegration()];
                }
                return [2 /*return*/, { wasmAvailable: false, wasmWorking: false, error: 'WASM module not loaded' }];
            });
        }); },
        hybridize: function (schema) {
            if (wasmModule === null || wasmModule === void 0 ? void 0 : wasmModule.hybridize) {
                return wasmModule.hybridize(schema);
            }
            console.warn('WASM not available, returning original schema');
            return schema;
        },
        optimize: function (schema) {
            if (wasmModule === null || wasmModule === void 0 ? void 0 : wasmModule.smartSchema) {
                return wasmModule.smartSchema(schema);
            }
            console.warn('WASM optimization not available, returning original schema');
            return schema;
        },
        benchmark: function (schema_2, testData_1) {
            var args_1 = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args_1[_i - 2] = arguments[_i];
            }
            return __awaiter(void 0, __spreadArray([schema_2, testData_1], args_1, true), void 0, function (schema, testData, iterations) {
                var _a;
                if (iterations === void 0) { iterations = 100; }
                return __generator(this, function (_b) {
                    if ((_a = wasmModule === null || wasmModule === void 0 ? void 0 : wasmModule.FastSchemaWasm) === null || _a === void 0 ? void 0 : _a.benchmark) {
                        return [2 /*return*/, wasmModule.FastSchemaWasm.benchmark(schema, testData, iterations)];
                    }
                    throw new Error('WASM benchmarking not available');
                });
            });
        },
        configure: function (config) {
            var _a;
            if ((_a = wasmModule === null || wasmModule === void 0 ? void 0 : wasmModule.FastSchemaWasm) === null || _a === void 0 ? void 0 : _a.configure) {
                wasmModule.FastSchemaWasm.configure(config);
            }
            else {
                console.warn('WASM configuration not available');
            }
        },
        getMetrics: function () {
            var _a;
            if ((_a = wasmModule === null || wasmModule === void 0 ? void 0 : wasmModule.FastSchemaWasm) === null || _a === void 0 ? void 0 : _a.getMetrics) {
                return wasmModule.FastSchemaWasm.getMetrics();
            }
            return null;
        },
        resetCaches: function () {
            var _a;
            if ((_a = wasmModule === null || wasmModule === void 0 ? void 0 : wasmModule.FastSchemaWasm) === null || _a === void 0 ? void 0 : _a.resetCaches) {
                wasmModule.FastSchemaWasm.resetCaches();
            }
            else {
                console.warn('WASM cache reset not available');
            }
        }
    }
};
