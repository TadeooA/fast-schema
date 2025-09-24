"use strict";
// Extreme optimizations for 100x performance target
// This module implements the most aggressive optimizations possible in JavaScript/TypeScript
Object.defineProperty(exports, "__esModule", { value: true });
exports.extreme = exports.ExtremeBatchValidator = exports.ExtremeObjectSchema = exports.ExtremeArraySchema = exports.ExtremeBooleanSchema = exports.ExtremeNumberSchema = exports.ExtremeStringSchema = exports.ExtremeOptimizer = void 0;
// Pre-computed validation functions with zero overhead
class ExtremeOptimizer {
    // Generate extremely optimized validation functions at compile time
    static compileExtremeString(constraints) {
        const cacheKey = JSON.stringify(constraints);
        let cached = this.functionCache.get(`string:${cacheKey}`);
        if (cached)
            return cached;
        // Generate optimized function code
        let code = '(function(data) {\n';
        // Type check with minimal overhead
        code += '  if (typeof data !== "string") throw new Error("Expected string");\n';
        // Length checks
        if (constraints?.min !== undefined) {
            code += `  if (data.length < ${constraints.min}) throw new Error("Too short");\n`;
        }
        if (constraints?.max !== undefined) {
            code += `  if (data.length > ${constraints.max}) throw new Error("Too long");\n`;
        }
        // Format validation with precompiled regex
        if (constraints?.format === 'email') {
            code += '  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data)) throw new Error("Invalid email");\n';
        }
        else if (constraints?.format === 'uuid') {
            code += '  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data)) throw new Error("Invalid UUID");\n';
        }
        else if (constraints?.format === 'url') {
            code += '  if (!/^https?:\\/\\/.+/.test(data)) throw new Error("Invalid URL");\n';
        }
        code += '  return data;\n})';
        // Compile the function
        const compiledFn = eval(code);
        this.functionCache.set(`string:${cacheKey}`, compiledFn);
        return compiledFn;
    }
    static compileExtremeNumber(constraints) {
        const cacheKey = JSON.stringify(constraints);
        let cached = this.functionCache.get(`number:${cacheKey}`);
        if (cached)
            return cached;
        let code = '(function(data) {\n';
        code += '  if (typeof data !== "number" || isNaN(data)) throw new Error("Expected number");\n';
        if (constraints?.integer) {
            code += '  if (data % 1 !== 0) throw new Error("Expected integer");\n';
        }
        if (constraints?.min !== undefined) {
            code += `  if (data < ${constraints.min}) throw new Error("Too small");\n`;
        }
        if (constraints?.max !== undefined) {
            code += `  if (data > ${constraints.max}) throw new Error("Too large");\n`;
        }
        code += '  return data;\n})';
        const compiledFn = eval(code);
        this.functionCache.set(`number:${cacheKey}`, compiledFn);
        return compiledFn;
    }
    static compileExtremeBoolean() {
        let cached = this.functionCache.get('boolean');
        if (cached)
            return cached;
        const compiledFn = eval('(function(data) { if (typeof data !== "boolean") throw new Error("Expected boolean"); return data; })');
        this.functionCache.set('boolean', compiledFn);
        return compiledFn;
    }
    // Ultra-fast array validation with minimal allocations
    static compileExtremeArray(itemValidator) {
        return (data) => {
            if (!Array.isArray(data))
                throw new Error("Expected array");
            // Pre-allocate result array for maximum performance
            const length = data.length;
            const result = new Array(length);
            // Unrolled loop for small arrays (common case optimization)
            if (length <= 10) {
                for (let i = 0; i < length; i++) {
                    result[i] = itemValidator(data[i]);
                }
            }
            else {
                // Batched processing for large arrays
                let i = 0;
                const batchSize = 100;
                while (i < length) {
                    const end = Math.min(i + batchSize, length);
                    for (let j = i; j < end; j++) {
                        result[j] = itemValidator(data[j]);
                    }
                    i = end;
                }
            }
            return result;
        };
    }
    // Compile object validation to extremely fast native code
    static compileExtremeObject(validators, required = []) {
        const keys = Object.keys(validators);
        const requiredSet = new Set(required);
        // Generate optimized object validation function
        let code = '(function(data) {\n';
        code += '  if (typeof data !== "object" || data === null || Array.isArray(data)) throw new Error("Expected object");\n';
        code += '  const result = {};\n';
        for (const key of keys) {
            if (requiredSet.has(key)) {
                code += `  if (!("${key}" in data)) throw new Error("Missing: ${key}");\n`;
                code += `  result.${key} = validators.${key}(data.${key});\n`;
            }
            else {
                code += `  if ("${key}" in data) result.${key} = validators.${key}(data.${key});\n`;
            }
        }
        code += '  return result;\n})';
        // Create closure with validators
        const fn = new Function('validators', `return ${code}`)(validators);
        return fn;
    }
}
exports.ExtremeOptimizer = ExtremeOptimizer;
ExtremeOptimizer.functionCache = new Map();
// Extreme performance schemas with zero-overhead
class ExtremeStringSchema {
    constructor(constraints = {}) {
        this.constraints = constraints;
        this.validator = ExtremeOptimizer.compileExtremeString(constraints);
    }
    min(length) {
        return new ExtremeStringSchema({ ...this.constraints, min: length });
    }
    max(length) {
        return new ExtremeStringSchema({ ...this.constraints, max: length });
    }
    email() {
        return new ExtremeStringSchema({ ...this.constraints, format: 'email' });
    }
    uuid() {
        return new ExtremeStringSchema({ ...this.constraints, format: 'uuid' });
    }
    url() {
        return new ExtremeStringSchema({ ...this.constraints, format: 'url' });
    }
    // Zero-overhead parsing
    parse(data) {
        return this.validator(data);
    }
    // Extremely fast safe parsing
    safeParse(data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    }
    getValidator() {
        return this.validator;
    }
}
exports.ExtremeStringSchema = ExtremeStringSchema;
class ExtremeNumberSchema {
    constructor(constraints = {}) {
        this.constraints = constraints;
        this.validator = ExtremeOptimizer.compileExtremeNumber(constraints);
    }
    min(value) {
        return new ExtremeNumberSchema({ ...this.constraints, min: value });
    }
    max(value) {
        return new ExtremeNumberSchema({ ...this.constraints, max: value });
    }
    int() {
        return new ExtremeNumberSchema({ ...this.constraints, integer: true });
    }
    parse(data) {
        return this.validator(data);
    }
    safeParse(data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    }
    getValidator() {
        return this.validator;
    }
}
exports.ExtremeNumberSchema = ExtremeNumberSchema;
class ExtremeBooleanSchema {
    constructor() {
        this.validator = ExtremeOptimizer.compileExtremeBoolean();
    }
    parse(data) {
        return this.validator(data);
    }
    safeParse(data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    }
    getValidator() {
        return this.validator;
    }
}
exports.ExtremeBooleanSchema = ExtremeBooleanSchema;
class ExtremeArraySchema {
    constructor(itemSchema, constraints = {}) {
        this.itemSchema = itemSchema;
        this.constraints = {};
        this.constraints = constraints;
        this.validator = this.compileValidator();
    }
    compileValidator() {
        const itemValidator = this.itemSchema.getValidator();
        const { min, max } = this.constraints;
        return (data) => {
            if (!Array.isArray(data))
                throw new Error("Expected array");
            // Length validation
            if (min !== undefined && data.length < min) {
                throw new Error(`Array must have at least ${min} items`);
            }
            if (max !== undefined && data.length > max) {
                throw new Error(`Array must have at most ${max} items`);
            }
            // Pre-allocate result array for maximum performance
            const length = data.length;
            const result = new Array(length);
            // Unrolled loop for small arrays (common case optimization)
            if (length <= 10) {
                for (let i = 0; i < length; i++) {
                    result[i] = itemValidator(data[i]);
                }
            }
            else {
                // Batched processing for large arrays
                let i = 0;
                const batchSize = 100;
                while (i < length) {
                    const end = Math.min(i + batchSize, length);
                    for (let j = i; j < end; j++) {
                        result[j] = itemValidator(data[j]);
                    }
                    i = end;
                }
            }
            return result;
        };
    }
    min(count) {
        return new ExtremeArraySchema(this.itemSchema, { ...this.constraints, min: count });
    }
    max(count) {
        return new ExtremeArraySchema(this.itemSchema, { ...this.constraints, max: count });
    }
    length(count) {
        return new ExtremeArraySchema(this.itemSchema, { ...this.constraints, min: count, max: count });
    }
    parse(data) {
        return this.validator(data);
    }
    safeParse(data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    }
    getValidator() {
        return this.validator;
    }
}
exports.ExtremeArraySchema = ExtremeArraySchema;
class ExtremeObjectSchema {
    constructor(shape, required = []) {
        const validators = {};
        for (const [key, schema] of Object.entries(shape)) {
            validators[key] = schema.getValidator();
        }
        this.validator = ExtremeOptimizer.compileExtremeObject(validators, required.map(k => String(k)));
    }
    parse(data) {
        return this.validator(data);
    }
    safeParse(data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    }
    getValidator() {
        return this.validator;
    }
}
exports.ExtremeObjectSchema = ExtremeObjectSchema;
// Extreme batch validator with memory pooling
class ExtremeBatchValidator {
    constructor(schema) {
        this.resultPool = [];
        this.validator = schema.getValidator();
    }
    parseMany(items) {
        const length = items.length;
        // Get pooled result array or create new one
        let result = this.resultPool.pop();
        if (!result || result.length !== length) {
            result = new Array(length);
        }
        // Ultra-fast validation loop
        for (let i = 0; i < length; i++) {
            result[i] = this.validator(items[i]);
        }
        return result;
    }
    // Return result array to pool for reuse
    returnToPool(result) {
        if (this.resultPool.length < 10) { // Limit pool size
            this.resultPool.push(result);
        }
    }
}
exports.ExtremeBatchValidator = ExtremeBatchValidator;
// Main extreme API
exports.extreme = {
    string: () => new ExtremeStringSchema(),
    number: () => new ExtremeNumberSchema(),
    boolean: () => new ExtremeBooleanSchema(),
    array: (schema) => new ExtremeArraySchema(schema, {}),
    object: (shape) => new ExtremeObjectSchema(shape, Object.keys(shape)),
    batch: (schema) => new ExtremeBatchValidator(schema),
    // Performance utilities
    clearCache: () => {
        ExtremeOptimizer['functionCache'].clear();
    },
    getCacheSize: () => {
        return ExtremeOptimizer['functionCache'].size;
    }
};
exports.default = exports.extreme;
//# sourceMappingURL=extreme.js.map