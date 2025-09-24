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
exports.StreamingValidator = exports.BatchValidator = exports.JITSchema = exports.ValidationPool = exports.SchemaCache = exports.RegexCache = void 0;
// Performance optimization utilities
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
// Cached regex patterns for better performance
var RegexCache = /** @class */ (function () {
    function RegexCache() {
    }
    RegexCache.get = function (pattern, flags) {
        var key = "".concat(pattern, ":").concat(flags || '');
        if (!this.cache.has(key)) {
            this.cache.set(key, new RegExp(pattern, flags));
        }
        return this.cache.get(key);
    };
    RegexCache.clear = function () {
        this.cache.clear();
    };
    RegexCache.size = function () {
        return this.cache.size;
    };
    RegexCache.cache = new Map();
    return RegexCache;
}());
exports.RegexCache = RegexCache;
// Schema compilation cache
var SchemaCache = /** @class */ (function () {
    function SchemaCache() {
    }
    SchemaCache.get = function (key) {
        return this.cache.get(key);
    };
    SchemaCache.set = function (key, value) {
        this.cache.set(key, value);
    };
    SchemaCache.has = function (key) {
        return this.cache.has(key);
    };
    SchemaCache.clear = function () {
        this.cache.clear();
    };
    SchemaCache.size = function () {
        return this.cache.size;
    };
    SchemaCache.cache = new Map();
    return SchemaCache;
}());
exports.SchemaCache = SchemaCache;
// Validation pool for object reuse
var ValidationPool = /** @class */ (function () {
    function ValidationPool() {
    }
    ValidationPool.getError = function () {
        return this.errorPool.pop() || new types_1.ValidationError([]);
    };
    ValidationPool.releaseError = function (error) {
        error.issues.length = 0;
        error.message = '';
        if (this.errorPool.length < 100) {
            this.errorPool.push(error);
        }
    };
    ValidationPool.getIssue = function () {
        return this.issuePool.pop() || {
            code: '',
            path: [],
            message: '',
            received: undefined,
            expected: undefined
        };
    };
    ValidationPool.releaseIssue = function (issue) {
        issue.code = '';
        issue.path.length = 0;
        issue.message = '';
        issue.received = undefined;
        issue.expected = undefined;
        if (this.issuePool.length < 500) {
            this.issuePool.push(issue);
        }
    };
    ValidationPool.clear = function () {
        this.errorPool.length = 0;
        this.issuePool.length = 0;
    };
    ValidationPool.errorPool = [];
    ValidationPool.issuePool = [];
    return ValidationPool;
}());
exports.ValidationPool = ValidationPool;
// JIT compiled schema for maximum performance
var JITSchema = /** @class */ (function (_super) {
    __extends(JITSchema, _super);
    function JITSchema(baseSchema) {
        var _this = _super.call(this, { type: 'jit', baseSchema: baseSchema.getSchema() }) || this;
        _this.baseSchema = baseSchema;
        _this.compilationKey = _this.generateCompilationKey();
        return _this;
    }
    JITSchema.prototype.generateCompilationKey = function () {
        return JSON.stringify(this.baseSchema.getSchema());
    };
    JITSchema.prototype.compileValidator = function () {
        var _this = this;
        // Check if already compiled
        if (SchemaCache.has(this.compilationKey)) {
            return SchemaCache.get(this.compilationKey);
        }
        // Create optimized validator function
        var validator = function (data) {
            return _this.baseSchema._validate(data);
        };
        // Cache the compiled validator
        SchemaCache.set(this.compilationKey, validator);
        return validator;
    };
    JITSchema.prototype._validate = function (data) {
        if (!this.compiledValidator) {
            this.compiledValidator = this.compileValidator();
        }
        return this.compiledValidator(data);
    };
    // Performance statistics
    JITSchema.prototype.getStats = function () {
        return {
            cached: !!this.compiledValidator,
            compilationKey: this.compilationKey,
            cacheSize: SchemaCache.size()
        };
    };
    return JITSchema;
}(schema_1.Schema));
exports.JITSchema = JITSchema;
// Batch validator for processing multiple items efficiently
var BatchValidator = /** @class */ (function () {
    function BatchValidator(schema) {
        this.pooledErrors = [];
        this.schema = schema;
    }
    BatchValidator.prototype.validate = function (items) {
        var results = [];
        var _loop_1 = function (i) {
            try {
                var data = this_1.schema._validate(items[i]);
                results.push({ success: true, data: data });
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
                    // Add index to error paths
                    var adjustedIssues = error.issues.map(function (issue) { return (__assign(__assign({}, issue), { path: __spreadArray([i], issue.path, true) })); });
                    results.push({
                        success: false,
                        error: new types_1.ValidationError(adjustedIssues)
                    });
                }
                else {
                    results.push({
                        success: false,
                        error: new types_1.ValidationError([{
                                code: 'unknown_error',
                                path: [i],
                                message: error instanceof Error ? error.message : 'Unknown error'
                            }])
                    });
                }
            }
        };
        var this_1 = this;
        for (var i = 0; i < items.length; i++) {
            _loop_1(i);
        }
        return results;
    };
    BatchValidator.prototype.validateParallel = function (items, chunkSize) {
        var _this = this;
        if (chunkSize === void 0) { chunkSize = 100; }
        return new Promise(function (resolve) {
            var results = new Array(items.length);
            var completed = 0;
            // Process in chunks to avoid blocking
            var processChunk = function (startIndex) {
                var endIndex = Math.min(startIndex + chunkSize, items.length);
                var _loop_2 = function (i) {
                    try {
                        var data = _this.schema._validate(items[i]);
                        results[i] = { success: true, data: data };
                    }
                    catch (error) {
                        if (error instanceof types_1.ValidationError) {
                            var adjustedIssues = error.issues.map(function (issue) { return (__assign(__assign({}, issue), { path: __spreadArray([i], issue.path, true) })); });
                            results[i] = {
                                success: false,
                                error: new types_1.ValidationError(adjustedIssues)
                            };
                        }
                        else {
                            results[i] = {
                                success: false,
                                error: new types_1.ValidationError([{
                                        code: 'unknown_error',
                                        path: [i],
                                        message: error instanceof Error ? error.message : 'Unknown error'
                                    }])
                            };
                        }
                    }
                };
                for (var i = startIndex; i < endIndex; i++) {
                    _loop_2(i);
                }
                completed += (endIndex - startIndex);
                if (completed >= items.length) {
                    resolve(results);
                }
                else {
                    // Use setTimeout to yield control
                    setTimeout(function () { return processChunk(endIndex); }, 0);
                }
            };
            processChunk(0);
        });
    };
    BatchValidator.prototype.getStats = function () {
        return {
            schemaType: this.schema.getSchema().type,
            pooledErrors: this.pooledErrors.length,
            regexCacheSize: RegexCache.size(),
            schemaCacheSize: SchemaCache.size()
        };
    };
    return BatchValidator;
}());
exports.BatchValidator = BatchValidator;
// Streaming validator for large datasets
var StreamingValidator = /** @class */ (function () {
    function StreamingValidator(schema, onResult) {
        this.buffer = [];
        this.schema = schema;
        this.onResult = onResult;
    }
    StreamingValidator.prototype.push = function (item) {
        var index = this.buffer.length;
        this.buffer.push(item);
        if (this.onResult) {
            try {
                var data = this.schema._validate(item);
                this.onResult({ success: true, data: data }, index);
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
                    this.onResult({ success: false, error: error }, index);
                }
                else {
                    this.onResult({
                        success: false,
                        error: new types_1.ValidationError([{
                                code: 'unknown_error',
                                path: [],
                                message: error instanceof Error ? error.message : 'Unknown error'
                            }])
                    }, index);
                }
            }
        }
    };
    StreamingValidator.prototype.flush = function () {
        var batchValidator = new BatchValidator(this.schema);
        var results = batchValidator.validate(this.buffer);
        this.buffer.length = 0;
        return results;
    };
    return StreamingValidator;
}());
exports.StreamingValidator = StreamingValidator;
