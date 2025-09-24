"use strict";
// Ultra-performance core for 100x speed target
// This module implements aggressive optimizations without Zod compatibility constraints
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JITOptimizer = exports.UltraBatchValidator = exports.UltraObjectSchema = exports.UltraArraySchema = exports.UltraBooleanSchema = exports.UltraNumberSchema = exports.UltraStringSchema = exports.UltraSchemaCompiler = void 0;
exports.createSuccessResult = createSuccessResult;
exports.createErrorResult = createErrorResult;
// Ultra-fast schema compiler
class UltraSchemaCompiler {
    static compileString(constraints) {
        const cacheKey = JSON.stringify(constraints);
        const cached = this.compiledSchemas.get(`string:${cacheKey}`);
        if (cached)
            return cached;
        const validator = (data) => {
            if (typeof data !== 'string') {
                throw new Error(`Expected string, got ${typeof data}`);
            }
            if (constraints?.min !== undefined && data.length < constraints.min) {
                throw new Error(`String too short: ${data.length} < ${constraints.min}`);
            }
            if (constraints?.max !== undefined && data.length > constraints.max) {
                throw new Error(`String too long: ${data.length} > ${constraints.max}`);
            }
            if (constraints?.format) {
                const regex = this.stringValidators.get(constraints.format);
                if (regex && !regex.test(data)) {
                    throw new Error(`Invalid format: ${constraints.format}`);
                }
            }
            return data;
        };
        this.compiledSchemas.set(`string:${cacheKey}`, validator);
        return validator;
    }
    static compileNumber(constraints) {
        const cacheKey = JSON.stringify(constraints);
        const cached = this.compiledSchemas.get(`number:${cacheKey}`);
        if (cached)
            return cached;
        const validator = (data) => {
            if (typeof data !== 'number' || isNaN(data)) {
                throw new Error(`Expected number, got ${typeof data}`);
            }
            if (constraints?.integer && !Number.isInteger(data)) {
                throw new Error('Expected integer');
            }
            if (constraints?.min !== undefined && data < constraints.min) {
                throw new Error(`Number too small: ${data} < ${constraints.min}`);
            }
            if (constraints?.max !== undefined && data > constraints.max) {
                throw new Error(`Number too large: ${data} > ${constraints.max}`);
            }
            return data;
        };
        this.compiledSchemas.set(`number:${cacheKey}`, validator);
        return validator;
    }
    static compileBoolean() {
        const cached = this.compiledSchemas.get('boolean');
        if (cached)
            return cached;
        const validator = (data) => {
            if (typeof data !== 'boolean') {
                throw new Error(`Expected boolean, got ${typeof data}`);
            }
            return data;
        };
        this.compiledSchemas.set('boolean', validator);
        return validator;
    }
    static compileArray(itemValidator) {
        return (data) => {
            if (!Array.isArray(data)) {
                throw new Error(`Expected array, got ${typeof data}`);
            }
            // Ultra-fast array validation - use for loop for maximum performance
            const result = new Array(data.length);
            for (let i = 0; i < data.length; i++) {
                result[i] = itemValidator(data[i]);
            }
            return result;
        };
    }
    static compileObject(shape, required = []) {
        const requiredSet = new Set(required);
        const shapeKeys = Object.keys(shape);
        return (data) => {
            if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                throw new Error(`Expected object, got ${typeof data}`);
            }
            const obj = data;
            const result = {};
            // Ultra-fast object validation - minimize property access
            for (let i = 0; i < shapeKeys.length; i++) {
                const key = shapeKeys[i];
                const validator = shape[key];
                if (key in obj) {
                    result[key] = validator(obj[key]);
                }
                else if (requiredSet.has(key)) {
                    throw new Error(`Missing required property: ${key}`);
                }
            }
            return result;
        };
    }
}
exports.UltraSchemaCompiler = UltraSchemaCompiler;
_a = UltraSchemaCompiler;
UltraSchemaCompiler.compiledSchemas = new Map();
UltraSchemaCompiler.stringValidators = new Map();
// Pre-compile common regex patterns
(() => {
    _a.stringValidators.set('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    _a.stringValidators.set('uuid', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    _a.stringValidators.set('url', /^https?:\/\/.+/);
    _a.stringValidators.set('datetime', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/);
})();
// Ultra-fast schema classes with minimal overhead
class UltraStringSchema {
    constructor(constraints = {}) {
        this.constraints = constraints;
        this.validator = UltraSchemaCompiler.compileString(constraints);
    }
    min(length) {
        return new UltraStringSchema({ ...this.constraints, min: length });
    }
    max(length) {
        return new UltraStringSchema({ ...this.constraints, max: length });
    }
    email() {
        return new UltraStringSchema({ ...this.constraints, format: 'email' });
    }
    uuid() {
        return new UltraStringSchema({ ...this.constraints, format: 'uuid' });
    }
    url() {
        return new UltraStringSchema({ ...this.constraints, format: 'url' });
    }
    datetime() {
        return new UltraStringSchema({ ...this.constraints, format: 'datetime' });
    }
    parse(data) {
        return this.validator(data);
    }
    safeParse(data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    getValidator() {
        return this.validator;
    }
}
exports.UltraStringSchema = UltraStringSchema;
class UltraNumberSchema {
    constructor(constraints = {}) {
        this.constraints = constraints;
        this.validator = UltraSchemaCompiler.compileNumber(constraints);
    }
    min(value) {
        return new UltraNumberSchema({ ...this.constraints, min: value });
    }
    max(value) {
        return new UltraNumberSchema({ ...this.constraints, max: value });
    }
    int() {
        return new UltraNumberSchema({ ...this.constraints, integer: true });
    }
    positive() {
        return new UltraNumberSchema({ ...this.constraints, min: 0.01 });
    }
    parse(data) {
        return this.validator(data);
    }
    safeParse(data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    getValidator() {
        return this.validator;
    }
}
exports.UltraNumberSchema = UltraNumberSchema;
class UltraBooleanSchema {
    constructor() {
        this.validator = UltraSchemaCompiler.compileBoolean();
    }
    parse(data) {
        return this.validator(data);
    }
    safeParse(data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    getValidator() {
        return this.validator;
    }
}
exports.UltraBooleanSchema = UltraBooleanSchema;
class UltraArraySchema {
    constructor(itemSchema) {
        this.itemSchema = itemSchema;
        this.validator = UltraSchemaCompiler.compileArray(itemSchema.getValidator());
    }
    parse(data) {
        return this.validator(data);
    }
    safeParse(data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    getValidator() {
        return this.validator;
    }
}
exports.UltraArraySchema = UltraArraySchema;
class UltraObjectSchema {
    constructor(shape, required = []) {
        this.shape = shape;
        this.required = required;
        const validators = {};
        for (const [key, schema] of Object.entries(shape)) {
            validators[key] = schema.getValidator();
        }
        this.validator = UltraSchemaCompiler.compileObject(validators, required.map(k => String(k)));
    }
    parse(data) {
        return this.validator(data);
    }
    safeParse(data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    getValidator() {
        return this.validator;
    }
}
exports.UltraObjectSchema = UltraObjectSchema;
// Batch validation for maximum throughput
class UltraBatchValidator {
    constructor(validator) {
        this.validator = validator;
    }
    parseMany(items) {
        const results = new Array(items.length);
        for (let i = 0; i < items.length; i++) {
            results[i] = this.validator(items[i]);
        }
        return results;
    }
    safeParseManyFast(items) {
        try {
            return { success: true, data: this.parseMany(items) };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Batch validation failed' };
        }
    }
    // Parallel validation using Web Workers (when available)
    async parseManyParallel(items, chunkSize = 1000) {
        if (items.length <= chunkSize) {
            return this.parseMany(items);
        }
        // Chunk the array for parallel processing
        const chunks = [];
        for (let i = 0; i < items.length; i += chunkSize) {
            chunks.push(items.slice(i, i + chunkSize));
        }
        // Process chunks in parallel (simplified - would use actual workers in production)
        const results = await Promise.all(chunks.map(chunk => Promise.resolve(this.parseMany(chunk))));
        return results.flat();
    }
}
exports.UltraBatchValidator = UltraBatchValidator;
// Memory pool for reducing allocations
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.pool = [];
        this.createFn = createFn;
        this.resetFn = resetFn;
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(createFn());
        }
    }
    acquire() {
        return this.pool.pop() || this.createFn();
    }
    release(obj) {
        this.resetFn(obj);
        if (this.pool.length < 50) { // Limit pool size
            this.pool.push(obj);
        }
    }
}
// Global object pools for common types
const stringResultPool = new ObjectPool(() => ({ success: true, data: '' }), (obj) => { obj.data = ''; }, 20);
const errorResultPool = new ObjectPool(() => ({ success: false, error: '' }), (obj) => { obj.error = ''; }, 10);
// Ultra-optimized result creation
function createSuccessResult(data) {
    return { success: true, data };
}
function createErrorResult(error) {
    return { success: false, error };
}
// JIT compilation for frequently used schemas
class JITOptimizer {
    static recordUsage(schemaId, validator) {
        const entry = this.hotSchemas.get(schemaId);
        if (entry) {
            entry.count++;
            if (entry.count === this.threshold) {
                // JIT compile the schema
                return this.optimizeValidator(validator);
            }
            return entry.validator;
        }
        else {
            this.hotSchemas.set(schemaId, { count: 1, validator });
            return validator;
        }
    }
    static optimizeValidator(validator) {
        // In a real implementation, this would generate optimized native code
        // For now, we'll just add memoization
        const cache = new Map();
        return (data) => {
            const key = JSON.stringify(data);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = validator(data);
            if (cache.size < 1000) { // Limit cache size
                cache.set(key, result);
            }
            return result;
        };
    }
}
exports.JITOptimizer = JITOptimizer;
JITOptimizer.hotSchemas = new Map();
JITOptimizer.threshold = 100; // Optimize after 100 uses
//# sourceMappingURL=core.js.map