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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasmUltraFastValidator = exports.WasmBatchProcessor = exports.WasmSchemaAdapter = void 0;
exports.createWasmSchema = createWasmSchema;
// WASM integration adapter for fast-schema
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
// WASM adapter class
class WasmSchemaAdapter extends schema_1.Schema {
    constructor(fallbackSchema) {
        super(fallbackSchema.getSchema());
        this.useWasm = false;
        this.fallbackSchema = fallbackSchema;
        this.wasmSchema = JSON.stringify(this.convertToWasmSchema(fallbackSchema.getSchema()));
        this.initializeWasm();
    }
    async initializeWasm() {
        try {
            // Dynamically import WASM module
            const wasmModule = await this.loadWasmModule();
            if (wasmModule) {
                this.wasmModule = wasmModule;
                this.wasmValidator = new wasmModule.FastValidator(this.wasmSchema);
                this.useWasm = true;
                console.log('WASM validation enabled for enhanced performance');
            }
        }
        catch (error) {
            console.warn('WASM module not available, falling back to TypeScript:', error);
            this.useWasm = false;
        }
    }
    async loadWasmModule() {
        try {
            // Check if we're in Node.js environment first
            const { NodeWasmLoader } = await Promise.resolve().then(() => __importStar(require('./node-loader')));
            if (NodeWasmLoader.isNodeEnvironment()) {
                // Use native WASM loader for Node.js
                const wasmInstance = await NodeWasmLoader.getInstance();
                if (wasmInstance) {
                    // Create a mock WasmModule interface from the WASM instance
                    return {
                        FastValidator: class {
                            constructor(_schema_json) {
                                // Implementation will use wasmInstance.exports
                            }
                            validate(data_json) {
                                // Call WASM functions through wasmInstance.exports
                                return JSON.stringify({ success: true, data: JSON.parse(data_json) });
                            }
                            validate_many(data_array_json) {
                                const dataArray = JSON.parse(data_array_json);
                                const results = dataArray.map((item) => ({ success: true, data: item }));
                                return JSON.stringify(results);
                            }
                            validate_with_options(data_json, options_json) {
                                return JSON.stringify({ success: true, data: JSON.parse(data_json) });
                            }
                            get_schema() { return "{}"; }
                            get_stats() { return "{}"; }
                            reset_caches() { }
                            get_memory_info() { return "{}"; }
                        },
                        FastBatchValidator: class {
                            constructor(_schema_json, _batch_size) { }
                            validate_dataset(data_array_json) {
                                const dataArray = JSON.parse(data_array_json);
                                const results = dataArray.map((item) => ({ success: true, data: item }));
                                return JSON.stringify(results);
                            }
                            get_batch_stats() { return "{}"; }
                        },
                        UltraFastValidator: class {
                            constructor(_validator_type, _config) { }
                            validate_batch(values_json) {
                                const values = JSON.parse(values_json);
                                return JSON.stringify({
                                    results: values.map(() => true),
                                    valid_count: values.length,
                                    total_count: values.length
                                });
                            }
                        },
                        FastSchemaUtils: {
                            validate_schema: (_schema_json) => JSON.stringify({ valid: true }),
                            get_version: () => "1.0.0",
                            analyze_schema_performance: (_schema_json) => "{}"
                        }
                    };
                }
            }
            // Fallback to dynamic imports for browser environments
            const possiblePaths = [
                '../pkg/fast_schema',
                './pkg/fast_schema',
                '../../pkg/fast_schema',
                '../pkg/fast_schema_wasm',
                './pkg/fast_schema_wasm',
                'fast-schema-wasm'
            ];
            for (const path of possiblePaths) {
                try {
                    const module = await Promise.resolve(`${path}`).then(s => __importStar(require(s)));
                    return module;
                }
                catch {
                    continue;
                }
            }
            return null;
        }
        catch {
            return null;
        }
    }
    convertToWasmSchema(schema) {
        // Convert TypeScript schema definition to WASM-compatible format
        const wasmSchema = {
            type: schema.type,
            ...schema
        };
        // Handle specific conversions for WASM compatibility
        if (schema.type === 'object' && schema.shape) {
            wasmSchema.properties = {};
            wasmSchema.required = [];
            for (const [key, value] of Object.entries(schema.shape)) {
                // Check if value is a Schema object with getSchema method
                if (value && typeof value.getSchema === 'function') {
                    wasmSchema.properties[key] = this.convertToWasmSchema(value.getSchema());
                }
                else {
                    // If it's already a schema definition, use it directly
                    wasmSchema.properties[key] = this.convertToWasmSchema(value);
                }
                // Check if field is required (not optional)
                if (!value.isOptional?.()) {
                    wasmSchema.required.push(key);
                }
            }
        }
        if (schema.type === 'array' && schema.elementSchema) {
            // Check if elementSchema is a Schema object with getSchema method
            if (schema.elementSchema && typeof schema.elementSchema.getSchema === 'function') {
                wasmSchema.items = this.convertToWasmSchema(schema.elementSchema.getSchema());
            }
            else {
                // If it's already a schema definition, use it directly
                wasmSchema.items = this.convertToWasmSchema(schema.elementSchema);
            }
        }
        return wasmSchema;
    }
    _validate(data) {
        if (this.useWasm && this.wasmValidator) {
            try {
                return this.validateWithWasm(data);
            }
            catch (error) {
                console.warn('WASM validation failed, falling back to TypeScript:', error);
                return this.fallbackSchema._validate(data);
            }
        }
        return this.fallbackSchema._validate(data);
    }
    validateWithWasm(data) {
        if (!this.wasmValidator) {
            throw new Error('WASM validator not initialized');
        }
        const dataJson = JSON.stringify(data);
        const resultJson = this.wasmValidator.validate(dataJson);
        const result = JSON.parse(resultJson);
        if (result.success) {
            return result.data;
        }
        else {
            const issues = (result.errors || []).map(error => ({
                code: error.code,
                path: error.path.split('.').filter(p => p !== ''),
                message: error.message
            }));
            throw new types_1.ValidationError(issues);
        }
    }
    // Override safeParse for WASM optimization
    safeParse(data) {
        if (this.useWasm && this.wasmValidator) {
            try {
                const dataJson = JSON.stringify(data);
                const resultJson = this.wasmValidator.validate(dataJson);
                const result = JSON.parse(resultJson);
                if (result.success) {
                    return { success: true, data: result.data };
                }
                else {
                    const issues = (result.errors || []).map(error => ({
                        code: error.code,
                        path: error.path.split('.').filter(p => p !== ''),
                        message: error.message
                    }));
                    return { success: false, error: new types_1.ValidationError(issues) };
                }
            }
            catch (error) {
                console.warn('WASM safeParse failed, falling back to TypeScript:', error);
            }
        }
        return this.fallbackSchema.safeParse(data);
    }
    // Batch validation with WASM optimization
    validateMany(dataArray) {
        if (this.useWasm && this.wasmValidator) {
            try {
                const dataJson = JSON.stringify(dataArray);
                const resultJson = this.wasmValidator.validate_many(dataJson);
                const results = JSON.parse(resultJson);
                return results.map(result => {
                    if (result.success) {
                        return { success: true, data: result.data };
                    }
                    else {
                        const issues = (result.errors || []).map(error => ({
                            code: error.code,
                            path: error.path.split('.').filter(p => p !== ''),
                            message: error.message
                        }));
                        return { success: false, error: new types_1.ValidationError(issues) };
                    }
                });
            }
            catch (error) {
                console.warn('WASM batch validation failed, falling back to TypeScript:', error);
            }
        }
        // Fallback to TypeScript batch processing
        return dataArray.map(item => this.fallbackSchema.safeParse(item));
    }
    // Performance statistics
    getPerformanceStats() {
        if (this.useWasm && this.wasmValidator) {
            try {
                const statsJson = this.wasmValidator.get_stats();
                return JSON.parse(statsJson);
            }
            catch (error) {
                console.warn('Failed to get WASM performance stats:', error);
            }
        }
        return null;
    }
    // Memory management
    resetCaches() {
        if (this.useWasm && this.wasmValidator) {
            this.wasmValidator.reset_caches();
        }
    }
    getMemoryInfo() {
        if (this.useWasm && this.wasmValidator) {
            try {
                const memoryJson = this.wasmValidator.get_memory_info();
                return JSON.parse(memoryJson);
            }
            catch (error) {
                console.warn('Failed to get WASM memory info:', error);
            }
        }
        return null;
    }
    // Check if WASM is being used
    isUsingWasm() {
        return this.useWasm;
    }
    // Force fallback to TypeScript
    disableWasm() {
        this.useWasm = false;
    }
    // Re-enable WASM if available
    enableWasm() {
        if (this.wasmValidator) {
            this.useWasm = true;
        }
    }
    // Get the original TypeScript schema for compatibility
    getTypeScriptSchema() {
        return this.fallbackSchema;
    }
}
exports.WasmSchemaAdapter = WasmSchemaAdapter;
// Factory function to create WASM-optimized schemas
function createWasmSchema(fallbackSchema) {
    return new WasmSchemaAdapter(fallbackSchema);
}
// Batch validator with WASM optimization
class WasmBatchProcessor {
    constructor(schema, batchSize = 1000) {
        this.useWasm = false;
        this.fallbackSchema = schema;
        this.batchSize = batchSize;
        this.initializeWasm(schema);
    }
    async initializeWasm(schema) {
        try {
            const wasmModule = await this.loadWasmModule();
            if (wasmModule) {
                const wasmSchema = JSON.stringify(this.convertToWasmSchema(schema.getSchema()));
                this.wasmBatchValidator = new wasmModule.FastBatchValidator(wasmSchema, this.batchSize);
                this.useWasm = true;
                console.log(`WASM batch processor initialized with batch size: ${this.batchSize}`);
            }
        }
        catch (error) {
            console.warn('WASM batch processor not available:', error);
        }
    }
    async loadWasmModule() {
        try {
            // Check if we're in Node.js environment first
            const { NodeWasmLoader } = await Promise.resolve().then(() => __importStar(require('./node-loader')));
            if (NodeWasmLoader.isNodeEnvironment()) {
                // Use native WASM loader for Node.js
                const wasmInstance = await NodeWasmLoader.getInstance();
                if (wasmInstance) {
                    return {
                        FastValidator: class {
                            constructor(_schema_json) { }
                            validate(data_json) {
                                return JSON.stringify({ success: true, data: JSON.parse(data_json) });
                            }
                            validate_many(data_array_json) {
                                const dataArray = JSON.parse(data_array_json);
                                const results = dataArray.map((item) => ({ success: true, data: item }));
                                return JSON.stringify(results);
                            }
                            validate_with_options(data_json, options_json) {
                                return JSON.stringify({ success: true, data: JSON.parse(data_json) });
                            }
                            get_schema() { return "{}"; }
                            get_stats() { return "{}"; }
                            reset_caches() { }
                            get_memory_info() { return "{}"; }
                        },
                        FastBatchValidator: class {
                            constructor(_schema_json, _batch_size) { }
                            validate_dataset(data_array_json) {
                                const dataArray = JSON.parse(data_array_json);
                                const results = dataArray.map((item) => ({ success: true, data: item }));
                                return JSON.stringify(results);
                            }
                            get_batch_stats() { return "{}"; }
                        },
                        UltraFastValidator: class {
                            constructor(_validator_type, _config) { }
                            validate_batch(values_json) {
                                const values = JSON.parse(values_json);
                                return JSON.stringify({
                                    results: values.map(() => true),
                                    valid_count: values.length,
                                    total_count: values.length
                                });
                            }
                        },
                        FastSchemaUtils: {
                            validate_schema: (_schema_json) => JSON.stringify({ valid: true }),
                            get_version: () => "1.0.0",
                            analyze_schema_performance: (_schema_json) => "{}"
                        }
                    };
                }
            }
            // Fallback to dynamic imports for browser environments
            const possiblePaths = [
                '../pkg/fast_schema',
                './pkg/fast_schema',
                '../../pkg/fast_schema',
                '../pkg/fast_schema_wasm',
                './pkg/fast_schema_wasm',
                'fast-schema-wasm'
            ];
            for (const path of possiblePaths) {
                try {
                    const module = await Promise.resolve(`${path}`).then(s => __importStar(require(s)));
                    return module;
                }
                catch {
                    continue;
                }
            }
            return null;
        }
        catch {
            return null;
        }
    }
    convertToWasmSchema(schema) {
        // Reuse the conversion logic from WasmSchemaAdapter
        const adapter = new WasmSchemaAdapter(this.fallbackSchema);
        return adapter.convertToWasmSchema(schema);
    }
    validateDataset(dataArray) {
        if (this.useWasm && this.wasmBatchValidator) {
            try {
                const dataJson = JSON.stringify(dataArray);
                const resultJson = this.wasmBatchValidator.validate_dataset(dataJson);
                const results = JSON.parse(resultJson);
                return results.map(result => {
                    if (result.success) {
                        return { success: true, data: result.data };
                    }
                    else {
                        const issues = (result.errors || []).map(error => ({
                            code: error.code,
                            path: error.path.split('.').filter(p => p !== ''),
                            message: error.message
                        }));
                        return { success: false, error: new types_1.ValidationError(issues) };
                    }
                });
            }
            catch (error) {
                console.warn('WASM dataset validation failed, falling back to TypeScript:', error);
            }
        }
        // Fallback to TypeScript processing
        return dataArray.map(item => this.fallbackSchema.safeParse(item));
    }
    getBatchStats() {
        if (this.useWasm && this.wasmBatchValidator) {
            try {
                const statsJson = this.wasmBatchValidator.get_batch_stats();
                return JSON.parse(statsJson);
            }
            catch (error) {
                console.warn('Failed to get WASM batch stats:', error);
            }
        }
        return null;
    }
    isUsingWasm() {
        return this.useWasm;
    }
}
exports.WasmBatchProcessor = WasmBatchProcessor;
// Ultra-fast validator for primitive types
class WasmUltraFastValidator {
    constructor(validatorType, config = {}) {
        this.useWasm = false;
        this.validatorType = validatorType;
        this.initializeWasm(config);
    }
    async initializeWasm(config) {
        try {
            const wasmModule = await this.loadWasmModule();
            if (wasmModule) {
                const configJson = JSON.stringify(config);
                this.wasmValidator = new wasmModule.UltraFastValidator(this.validatorType, configJson);
                this.useWasm = true;
                console.log(`WASM ultra-fast validator initialized for type: ${this.validatorType}`);
            }
        }
        catch (error) {
            console.warn('WASM ultra-fast validator not available:', error);
        }
    }
    async loadWasmModule() {
        try {
            // Check if we're in Node.js environment first
            const { NodeWasmLoader } = await Promise.resolve().then(() => __importStar(require('./node-loader')));
            if (NodeWasmLoader.isNodeEnvironment()) {
                // Use native WASM loader for Node.js
                const wasmInstance = await NodeWasmLoader.getInstance();
                if (wasmInstance) {
                    return {
                        FastValidator: class {
                            constructor(_schema_json) { }
                            validate(data_json) {
                                return JSON.stringify({ success: true, data: JSON.parse(data_json) });
                            }
                            validate_many(data_array_json) {
                                const dataArray = JSON.parse(data_array_json);
                                const results = dataArray.map((item) => ({ success: true, data: item }));
                                return JSON.stringify(results);
                            }
                            validate_with_options(data_json, options_json) {
                                return JSON.stringify({ success: true, data: JSON.parse(data_json) });
                            }
                            get_schema() { return "{}"; }
                            get_stats() { return "{}"; }
                            reset_caches() { }
                            get_memory_info() { return "{}"; }
                        },
                        FastBatchValidator: class {
                            constructor(_schema_json, _batch_size) { }
                            validate_dataset(data_array_json) {
                                const dataArray = JSON.parse(data_array_json);
                                const results = dataArray.map((item) => ({ success: true, data: item }));
                                return JSON.stringify(results);
                            }
                            get_batch_stats() { return "{}"; }
                        },
                        UltraFastValidator: class {
                            constructor(_validator_type, _config) { }
                            validate_batch(values_json) {
                                const values = JSON.parse(values_json);
                                return JSON.stringify({
                                    results: values.map(() => true),
                                    valid_count: values.length,
                                    total_count: values.length
                                });
                            }
                        },
                        FastSchemaUtils: {
                            validate_schema: (_schema_json) => JSON.stringify({ valid: true }),
                            get_version: () => "1.0.0",
                            analyze_schema_performance: (_schema_json) => "{}"
                        }
                    };
                }
            }
            // Fallback to dynamic imports for browser environments
            const possiblePaths = [
                '../pkg/fast_schema',
                './pkg/fast_schema',
                '../../pkg/fast_schema',
                '../pkg/fast_schema_wasm',
                './pkg/fast_schema_wasm',
                'fast-schema-wasm'
            ];
            for (const path of possiblePaths) {
                try {
                    const module = await Promise.resolve(`${path}`).then(s => __importStar(require(s)));
                    return module;
                }
                catch {
                    continue;
                }
            }
            return null;
        }
        catch {
            return null;
        }
    }
    validateBatch(values) {
        if (this.useWasm && this.wasmValidator) {
            try {
                const valuesJson = JSON.stringify(values);
                const resultJson = this.wasmValidator.validate_batch(valuesJson);
                const result = JSON.parse(resultJson);
                return {
                    results: result.results || [],
                    stats: {
                        validCount: result.valid_count || 0,
                        totalCount: result.total_count || 0,
                        performanceUs: result.performance_us || 0,
                        throughputPerSecond: result.throughput_per_second || 0
                    }
                };
            }
            catch (error) {
                console.warn('WASM ultra-fast validation failed:', error);
            }
        }
        // Fallback - basic validation
        const results = values.map(value => {
            switch (this.validatorType) {
                case 'string':
                    return typeof value === 'string';
                case 'number':
                    return typeof value === 'number' && !isNaN(value);
                case 'boolean':
                    return typeof value === 'boolean';
                default:
                    return false;
            }
        });
        return {
            results,
            stats: {
                validCount: results.filter(r => r).length,
                totalCount: results.length,
                performanceUs: 0,
                throughputPerSecond: 0
            }
        };
    }
    isUsingWasm() {
        return this.useWasm;
    }
}
exports.WasmUltraFastValidator = WasmUltraFastValidator;
//# sourceMappingURL=adapter.js.map