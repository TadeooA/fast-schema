"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.ValidationError = exports.fast = exports.EnumSchema = exports.LiteralSchema = exports.UnionSchema = void 0;
// Main API - the `fast` object for ultra-performance validation
const types_1 = require("./base/types");
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return types_1.ValidationError; } });
const schema_1 = require("./base/schema");
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return schema_1.Schema; } });
// WASM integration imports (optional - will gracefully degrade if not available)
let wasmModule = null;
try {
    // Dynamic import to avoid breaking when WASM is not available
    Promise.resolve().then(() => __importStar(require('./wasm/index'))).then(module => {
        wasmModule = module;
        console.log('WASM module loaded successfully');
    }).catch(() => {
        // WASM not available - continue with TypeScript only
    });
}
catch {
    // WASM not available
}
const string_1 = require("./primitives/string");
const number_1 = require("./primitives/number");
const index_1 = require("./primitives/index");
const array_1 = require("./complex/array");
const object_1 = require("./complex/object");
const record_1 = require("./complex/record");
const intersection_1 = require("./advanced/intersection");
const conditional_1 = require("./advanced/conditional");
const async_1 = require("./advanced/async");
const formats_1 = require("./advanced/formats");
const performance_1 = require("./advanced/performance");
const composition_1 = require("./advanced/composition");
// Union schema for multiple type options
class UnionSchema extends schema_1.Schema {
    constructor(options) {
        super({
            type: 'union',
            options: options.map(schema => schema.getSchema())
        });
        this.options = options;
    }
    _validate(data) {
        const issues = [];
        // Try each option until one succeeds
        for (let i = 0; i < this.options.length; i++) {
            try {
                const option = this.options[i];
                if (option) {
                    return option._validate(data);
                }
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
                    issues.push(...error.issues.map(issue => ({
                        ...issue,
                        path: [`option_${i}`, ...issue.path]
                    })));
                }
            }
        }
        // If no option succeeded, throw with all collected issues
        throw new types_1.ValidationError([{
                code: 'invalid_union',
                path: [],
                message: `Input did not match any union option. Tried ${this.options.length} options.`
            }]);
    }
}
exports.UnionSchema = UnionSchema;
// Literal schema for specific values
class LiteralSchema extends schema_1.Schema {
    constructor(value) {
        super({ type: 'literal', value });
        this.value = value;
    }
    _validate(data) {
        if (data !== this.value) {
            throw new types_1.ValidationError([{
                    code: 'invalid_literal',
                    path: [],
                    message: `Expected literal value: ${this.value}`,
                    received: typeof data,
                    expected: String(this.value)
                }]);
        }
        return data;
    }
}
exports.LiteralSchema = LiteralSchema;
// Enum schema for string enums
class EnumSchema extends schema_1.Schema {
    constructor(values) {
        super({ type: 'enum', values });
        this.values = values;
    }
    _validate(data) {
        if (typeof data !== 'string' || !this.values.includes(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_enum_value',
                    path: [],
                    message: `Expected one of: ${this.values.join(', ')}`,
                    received: typeof data,
                    expected: this.values.join(' | ')
                }]);
        }
        return data;
    }
}
exports.EnumSchema = EnumSchema;
// Ultra-performance imports
const index_2 = require("./ultra/index");
// Tiered performance system
const index_3 = __importDefault(require("./tiered/index"));
// Main fast API object - ultra-performance validation without Zod compatibility constraints
exports.fast = {
    // Primitive types
    string: () => new string_1.StringSchema(),
    number: () => new number_1.NumberSchema(),
    boolean: () => new index_1.BooleanSchema(),
    null: () => new index_1.NullSchema(),
    undefined: () => new index_1.UndefinedSchema(),
    any: () => new index_1.AnySchema(),
    unknown: () => new index_1.UnknownSchema(),
    never: () => new index_1.NeverSchema(),
    void: () => new index_1.UndefinedSchema(),
    // Complex types
    array: (schema) => new array_1.ArraySchema(schema),
    object: (shape) => new object_1.ObjectSchema(shape),
    record: (valueSchema) => new record_1.RecordSchema(valueSchema),
    // Union and literal types
    union: (schemas) => new UnionSchema(schemas),
    intersection: (schemaA, schemaB) => new intersection_1.IntersectionSchema(schemaA, schemaB),
    literal: (value) => new LiteralSchema(value),
    enum: (values) => new EnumSchema(values),
    // Advanced types
    discriminatedUnion: (discriminator, schemas) => new composition_1.DiscriminatedUnionSchema(discriminator, schemas),
    // Utility functions
    coerce: {
        string: () => new string_1.StringSchema().transform((data) => String(data)),
        number: () => new number_1.NumberSchema().transform((data) => Number(data)),
        boolean: () => new index_1.BooleanSchema().transform((data) => Boolean(data)),
        date: () => new string_1.StringSchema().transform((data) => new Date(data))
    },
    // Schema composition utilities
    deepPartial: (schema) => (0, composition_1.makeDeepPartial)(schema),
    required: (schema) => (0, composition_1.makeRequired)(schema),
    readonly: (schema) => (0, composition_1.makeReadonly)(schema),
    nonNullable: (schema) => (0, composition_1.makeNonNullable)(schema),
    keyof: (schema) => (0, composition_1.keyof)(schema),
    // Conditional validation
    conditional: conditional_1.conditional,
    // Performance utilities
    jit: (schema) => new performance_1.JITSchema(schema),
    batch: (schema) => new performance_1.BatchValidator(schema),
    // Advanced string with extended formats
    advancedString: () => new formats_1.AdvancedStringSchema(),
    // Async validation
    async: (validator) => new async_1.AsyncSchema(validator),
    promise: (schema) => new async_1.PromiseSchema(schema),
    // Type utilities
    instanceof: (ctor) => {
        class InstanceofSchema extends schema_1.Schema {
            _validate(data) {
                if (!(data instanceof ctor)) {
                    throw new types_1.ValidationError([{
                            code: 'invalid_type',
                            path: [],
                            message: `Expected instance of ${ctor.name}`,
                            received: typeof data,
                            expected: ctor.name
                        }]);
                }
                return data;
            }
        }
        return new InstanceofSchema({ type: 'instanceof', constructor: ctor.name });
    },
    // Advanced schemas
    lazy: (getter) => {
        class LazySchema extends schema_1.Schema {
            _validate(data) {
                return getter()._validate(data);
            }
        }
        return new LazySchema({ type: 'lazy' });
    },
    custom: (validator, message) => {
        class CustomSchema extends schema_1.Schema {
            _validate(data) {
                if (!validator(data)) {
                    throw new types_1.ValidationError([{
                            code: 'custom',
                            path: [],
                            message: message || 'Custom validation failed'
                        }]);
                }
                return data;
            }
        }
        return new CustomSchema({ type: 'custom' });
    },
    // Ultra-performance mode (100x target)
    ultra: index_2.ultra,
    // Tiered performance system - choose your speed level
    performance: index_3.default,
    // WASM integration utilities (when available)
    wasm: {
        isAvailable: () => wasmModule?.FastSchemaWasm?.isAvailable() || false,
        test: async () => {
            if (wasmModule?.testWasmIntegration) {
                return wasmModule.testWasmIntegration();
            }
            return { wasmAvailable: false, wasmWorking: false, error: 'WASM module not loaded' };
        },
        hybridize: (schema) => {
            if (wasmModule?.hybridize) {
                return wasmModule.hybridize(schema);
            }
            console.warn('WASM not available, returning original schema');
            return schema;
        },
        optimize: (schema) => {
            if (wasmModule?.smartSchema) {
                return wasmModule.smartSchema(schema);
            }
            console.warn('WASM optimization not available, returning original schema');
            return schema;
        },
        benchmark: async (schema, testData, iterations = 100) => {
            if (wasmModule?.FastSchemaWasm?.benchmark) {
                return wasmModule.FastSchemaWasm.benchmark(schema, testData, iterations);
            }
            throw new Error('WASM benchmarking not available');
        },
        configure: (config) => {
            if (wasmModule?.FastSchemaWasm?.configure) {
                wasmModule.FastSchemaWasm.configure(config);
            }
            else {
                console.warn('WASM configuration not available');
            }
        },
        getMetrics: () => {
            if (wasmModule?.FastSchemaWasm?.getMetrics) {
                return wasmModule.FastSchemaWasm.getMetrics();
            }
            return null;
        },
        resetCaches: () => {
            if (wasmModule?.FastSchemaWasm?.resetCaches) {
                wasmModule.FastSchemaWasm.resetCaches();
            }
            else {
                console.warn('WASM cache reset not available');
            }
        }
    }
};
//# sourceMappingURL=api.js.map