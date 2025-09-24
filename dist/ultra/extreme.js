"use strict";
// Extreme optimizations for 100x performance target
// This module implements the most aggressive optimizations possible in JavaScript/TypeScript
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extreme = exports.ExtremeBatchValidator = exports.ExtremeObjectSchema = exports.ExtremeArraySchema = exports.ExtremeBooleanSchema = exports.ExtremeNumberSchema = exports.ExtremeStringSchema = exports.ExtremeOptimizer = void 0;
// Pre-computed validation functions with zero overhead
var ExtremeOptimizer = /** @class */ (function () {
    function ExtremeOptimizer() {
    }
    // Generate extremely optimized validation functions at compile time
    ExtremeOptimizer.compileExtremeString = function (constraints) {
        var cacheKey = JSON.stringify(constraints);
        var cached = this.functionCache.get("string:".concat(cacheKey));
        if (cached)
            return cached;
        // Generate optimized function code
        var code = '(function(data) {\n';
        // Type check with minimal overhead
        code += '  if (typeof data !== "string") throw new Error("Expected string");\n';
        // Length checks
        if ((constraints === null || constraints === void 0 ? void 0 : constraints.min) !== undefined) {
            code += "  if (data.length < ".concat(constraints.min, ") throw new Error(\"Too short\");\n");
        }
        if ((constraints === null || constraints === void 0 ? void 0 : constraints.max) !== undefined) {
            code += "  if (data.length > ".concat(constraints.max, ") throw new Error(\"Too long\");\n");
        }
        // Format validation with precompiled regex
        if ((constraints === null || constraints === void 0 ? void 0 : constraints.format) === 'email') {
            code += '  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data)) throw new Error("Invalid email");\n';
        }
        else if ((constraints === null || constraints === void 0 ? void 0 : constraints.format) === 'uuid') {
            code += '  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data)) throw new Error("Invalid UUID");\n';
        }
        else if ((constraints === null || constraints === void 0 ? void 0 : constraints.format) === 'url') {
            code += '  if (!/^https?:\\/\\/.+/.test(data)) throw new Error("Invalid URL");\n';
        }
        code += '  return data;\n})';
        // Compile the function
        var compiledFn = eval(code);
        this.functionCache.set("string:".concat(cacheKey), compiledFn);
        return compiledFn;
    };
    ExtremeOptimizer.compileExtremeNumber = function (constraints) {
        var cacheKey = JSON.stringify(constraints);
        var cached = this.functionCache.get("number:".concat(cacheKey));
        if (cached)
            return cached;
        var code = '(function(data) {\n';
        code += '  if (typeof data !== "number" || isNaN(data)) throw new Error("Expected number");\n';
        if (constraints === null || constraints === void 0 ? void 0 : constraints.integer) {
            code += '  if (data % 1 !== 0) throw new Error("Expected integer");\n';
        }
        if ((constraints === null || constraints === void 0 ? void 0 : constraints.min) !== undefined) {
            code += "  if (data < ".concat(constraints.min, ") throw new Error(\"Too small\");\n");
        }
        if ((constraints === null || constraints === void 0 ? void 0 : constraints.max) !== undefined) {
            code += "  if (data > ".concat(constraints.max, ") throw new Error(\"Too large\");\n");
        }
        code += '  return data;\n})';
        var compiledFn = eval(code);
        this.functionCache.set("number:".concat(cacheKey), compiledFn);
        return compiledFn;
    };
    ExtremeOptimizer.compileExtremeBoolean = function () {
        var cached = this.functionCache.get('boolean');
        if (cached)
            return cached;
        var compiledFn = eval('(function(data) { if (typeof data !== "boolean") throw new Error("Expected boolean"); return data; })');
        this.functionCache.set('boolean', compiledFn);
        return compiledFn;
    };
    // Ultra-fast array validation with minimal allocations
    ExtremeOptimizer.compileExtremeArray = function (itemValidator) {
        return function (data) {
            if (!Array.isArray(data))
                throw new Error("Expected array");
            // Pre-allocate result array for maximum performance
            var length = data.length;
            var result = new Array(length);
            // Unrolled loop for small arrays (common case optimization)
            if (length <= 10) {
                for (var i = 0; i < length; i++) {
                    result[i] = itemValidator(data[i]);
                }
            }
            else {
                // Batched processing for large arrays
                var i = 0;
                var batchSize = 100;
                while (i < length) {
                    var end = Math.min(i + batchSize, length);
                    for (var j = i; j < end; j++) {
                        result[j] = itemValidator(data[j]);
                    }
                    i = end;
                }
            }
            return result;
        };
    };
    // Compile object validation to extremely fast native code
    ExtremeOptimizer.compileExtremeObject = function (validators, required) {
        if (required === void 0) { required = []; }
        var keys = Object.keys(validators);
        var requiredSet = new Set(required);
        // Generate optimized object validation function
        var code = '(function(data) {\n';
        code += '  if (typeof data !== "object" || data === null || Array.isArray(data)) throw new Error("Expected object");\n';
        code += '  const result = {};\n';
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (requiredSet.has(key)) {
                code += "  if (!(\"".concat(key, "\" in data)) throw new Error(\"Missing: ").concat(key, "\");\n");
                code += "  result.".concat(key, " = validators.").concat(key, "(data.").concat(key, ");\n");
            }
            else {
                code += "  if (\"".concat(key, "\" in data) result.").concat(key, " = validators.").concat(key, "(data.").concat(key, ");\n");
            }
        }
        code += '  return result;\n})';
        // Create closure with validators
        var fn = new Function('validators', "return ".concat(code))(validators);
        return fn;
    };
    ExtremeOptimizer.functionCache = new Map();
    return ExtremeOptimizer;
}());
exports.ExtremeOptimizer = ExtremeOptimizer;
// Extreme performance schemas with zero-overhead
var ExtremeStringSchema = /** @class */ (function () {
    function ExtremeStringSchema(constraints) {
        if (constraints === void 0) { constraints = {}; }
        this.constraints = constraints;
        this.validator = ExtremeOptimizer.compileExtremeString(constraints);
    }
    ExtremeStringSchema.prototype.min = function (length) {
        return new ExtremeStringSchema(__assign(__assign({}, this.constraints), { min: length }));
    };
    ExtremeStringSchema.prototype.max = function (length) {
        return new ExtremeStringSchema(__assign(__assign({}, this.constraints), { max: length }));
    };
    ExtremeStringSchema.prototype.email = function () {
        return new ExtremeStringSchema(__assign(__assign({}, this.constraints), { format: 'email' }));
    };
    ExtremeStringSchema.prototype.uuid = function () {
        return new ExtremeStringSchema(__assign(__assign({}, this.constraints), { format: 'uuid' }));
    };
    ExtremeStringSchema.prototype.url = function () {
        return new ExtremeStringSchema(__assign(__assign({}, this.constraints), { format: 'url' }));
    };
    // Zero-overhead parsing
    ExtremeStringSchema.prototype.parse = function (data) {
        return this.validator(data);
    };
    // Extremely fast safe parsing
    ExtremeStringSchema.prototype.safeParse = function (data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    };
    ExtremeStringSchema.prototype.getValidator = function () {
        return this.validator;
    };
    return ExtremeStringSchema;
}());
exports.ExtremeStringSchema = ExtremeStringSchema;
var ExtremeNumberSchema = /** @class */ (function () {
    function ExtremeNumberSchema(constraints) {
        if (constraints === void 0) { constraints = {}; }
        this.constraints = constraints;
        this.validator = ExtremeOptimizer.compileExtremeNumber(constraints);
    }
    ExtremeNumberSchema.prototype.min = function (value) {
        return new ExtremeNumberSchema(__assign(__assign({}, this.constraints), { min: value }));
    };
    ExtremeNumberSchema.prototype.max = function (value) {
        return new ExtremeNumberSchema(__assign(__assign({}, this.constraints), { max: value }));
    };
    ExtremeNumberSchema.prototype.int = function () {
        return new ExtremeNumberSchema(__assign(__assign({}, this.constraints), { integer: true }));
    };
    ExtremeNumberSchema.prototype.parse = function (data) {
        return this.validator(data);
    };
    ExtremeNumberSchema.prototype.safeParse = function (data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    };
    ExtremeNumberSchema.prototype.getValidator = function () {
        return this.validator;
    };
    return ExtremeNumberSchema;
}());
exports.ExtremeNumberSchema = ExtremeNumberSchema;
var ExtremeBooleanSchema = /** @class */ (function () {
    function ExtremeBooleanSchema() {
        this.validator = ExtremeOptimizer.compileExtremeBoolean();
    }
    ExtremeBooleanSchema.prototype.parse = function (data) {
        return this.validator(data);
    };
    ExtremeBooleanSchema.prototype.safeParse = function (data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    };
    ExtremeBooleanSchema.prototype.getValidator = function () {
        return this.validator;
    };
    return ExtremeBooleanSchema;
}());
exports.ExtremeBooleanSchema = ExtremeBooleanSchema;
var ExtremeArraySchema = /** @class */ (function () {
    function ExtremeArraySchema(itemSchema, constraints) {
        if (constraints === void 0) { constraints = {}; }
        this.itemSchema = itemSchema;
        this.constraints = {};
        this.constraints = constraints;
        this.validator = this.compileValidator();
    }
    ExtremeArraySchema.prototype.compileValidator = function () {
        var itemValidator = this.itemSchema.getValidator();
        var _a = this.constraints, min = _a.min, max = _a.max;
        return function (data) {
            if (!Array.isArray(data))
                throw new Error("Expected array");
            // Length validation
            if (min !== undefined && data.length < min) {
                throw new Error("Array must have at least ".concat(min, " items"));
            }
            if (max !== undefined && data.length > max) {
                throw new Error("Array must have at most ".concat(max, " items"));
            }
            // Pre-allocate result array for maximum performance
            var length = data.length;
            var result = new Array(length);
            // Unrolled loop for small arrays (common case optimization)
            if (length <= 10) {
                for (var i = 0; i < length; i++) {
                    result[i] = itemValidator(data[i]);
                }
            }
            else {
                // Batched processing for large arrays
                var i = 0;
                var batchSize = 100;
                while (i < length) {
                    var end = Math.min(i + batchSize, length);
                    for (var j = i; j < end; j++) {
                        result[j] = itemValidator(data[j]);
                    }
                    i = end;
                }
            }
            return result;
        };
    };
    ExtremeArraySchema.prototype.min = function (count) {
        return new ExtremeArraySchema(this.itemSchema, __assign(__assign({}, this.constraints), { min: count }));
    };
    ExtremeArraySchema.prototype.max = function (count) {
        return new ExtremeArraySchema(this.itemSchema, __assign(__assign({}, this.constraints), { max: count }));
    };
    ExtremeArraySchema.prototype.length = function (count) {
        return new ExtremeArraySchema(this.itemSchema, __assign(__assign({}, this.constraints), { min: count, max: count }));
    };
    ExtremeArraySchema.prototype.parse = function (data) {
        return this.validator(data);
    };
    ExtremeArraySchema.prototype.safeParse = function (data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    };
    ExtremeArraySchema.prototype.getValidator = function () {
        return this.validator;
    };
    return ExtremeArraySchema;
}());
exports.ExtremeArraySchema = ExtremeArraySchema;
var ExtremeObjectSchema = /** @class */ (function () {
    function ExtremeObjectSchema(shape, required) {
        if (required === void 0) { required = []; }
        var validators = {};
        for (var _i = 0, _a = Object.entries(shape); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], schema = _b[1];
            validators[key] = schema.getValidator();
        }
        this.validator = ExtremeOptimizer.compileExtremeObject(validators, required.map(function (k) { return String(k); }));
    }
    ExtremeObjectSchema.prototype.parse = function (data) {
        return this.validator(data);
    };
    ExtremeObjectSchema.prototype.safeParse = function (data) {
        try {
            return { success: true, data: this.validator(data) };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    };
    ExtremeObjectSchema.prototype.getValidator = function () {
        return this.validator;
    };
    return ExtremeObjectSchema;
}());
exports.ExtremeObjectSchema = ExtremeObjectSchema;
// Extreme batch validator with memory pooling
var ExtremeBatchValidator = /** @class */ (function () {
    function ExtremeBatchValidator(schema) {
        this.resultPool = [];
        this.validator = schema.getValidator();
    }
    ExtremeBatchValidator.prototype.parseMany = function (items) {
        var length = items.length;
        // Get pooled result array or create new one
        var result = this.resultPool.pop();
        if (!result || result.length !== length) {
            result = new Array(length);
        }
        // Ultra-fast validation loop
        for (var i = 0; i < length; i++) {
            result[i] = this.validator(items[i]);
        }
        return result;
    };
    // Return result array to pool for reuse
    ExtremeBatchValidator.prototype.returnToPool = function (result) {
        if (this.resultPool.length < 10) { // Limit pool size
            this.resultPool.push(result);
        }
    };
    return ExtremeBatchValidator;
}());
exports.ExtremeBatchValidator = ExtremeBatchValidator;
// Main extreme API
exports.extreme = {
    string: function () { return new ExtremeStringSchema(); },
    number: function () { return new ExtremeNumberSchema(); },
    boolean: function () { return new ExtremeBooleanSchema(); },
    array: function (schema) { return new ExtremeArraySchema(schema, {}); },
    object: function (shape) { return new ExtremeObjectSchema(shape, Object.keys(shape)); },
    batch: function (schema) { return new ExtremeBatchValidator(schema); },
    // Performance utilities
    clearCache: function () {
        ExtremeOptimizer['functionCache'].clear();
    },
    getCacheSize: function () {
        return ExtremeOptimizer['functionCache'].size;
    }
};
exports.default = exports.extreme;
