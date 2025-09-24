"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingValidator = exports.BatchValidator = exports.JITSchema = exports.ValidationPool = exports.SchemaCache = exports.RegexCache = void 0;
// Performance optimization utilities
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
// Cached regex patterns for better performance
class RegexCache {
    static get(pattern, flags) {
        const key = `${pattern}:${flags || ''}`;
        if (!this.cache.has(key)) {
            this.cache.set(key, new RegExp(pattern, flags));
        }
        return this.cache.get(key);
    }
    static clear() {
        this.cache.clear();
    }
    static size() {
        return this.cache.size;
    }
}
exports.RegexCache = RegexCache;
RegexCache.cache = new Map();
// Schema compilation cache
class SchemaCache {
    static get(key) {
        return this.cache.get(key);
    }
    static set(key, value) {
        this.cache.set(key, value);
    }
    static has(key) {
        return this.cache.has(key);
    }
    static clear() {
        this.cache.clear();
    }
    static size() {
        return this.cache.size;
    }
}
exports.SchemaCache = SchemaCache;
SchemaCache.cache = new Map();
// Validation pool for object reuse
class ValidationPool {
    static getError() {
        return this.errorPool.pop() || new types_1.ValidationError([]);
    }
    static releaseError(error) {
        error.issues.length = 0;
        error.message = '';
        if (this.errorPool.length < 100) {
            this.errorPool.push(error);
        }
    }
    static getIssue() {
        return this.issuePool.pop() || {
            code: '',
            path: [],
            message: '',
            received: undefined,
            expected: undefined
        };
    }
    static releaseIssue(issue) {
        issue.code = '';
        issue.path.length = 0;
        issue.message = '';
        issue.received = undefined;
        issue.expected = undefined;
        if (this.issuePool.length < 500) {
            this.issuePool.push(issue);
        }
    }
    static clear() {
        this.errorPool.length = 0;
        this.issuePool.length = 0;
    }
}
exports.ValidationPool = ValidationPool;
ValidationPool.errorPool = [];
ValidationPool.issuePool = [];
// JIT compiled schema for maximum performance
class JITSchema extends schema_1.Schema {
    constructor(baseSchema) {
        super({ type: 'jit', baseSchema: baseSchema.getSchema() });
        this.baseSchema = baseSchema;
        this.compilationKey = this.generateCompilationKey();
    }
    generateCompilationKey() {
        return JSON.stringify(this.baseSchema.getSchema());
    }
    compileValidator() {
        // Check if already compiled
        if (SchemaCache.has(this.compilationKey)) {
            return SchemaCache.get(this.compilationKey);
        }
        // Create optimized validator function
        const validator = (data) => {
            return this.baseSchema._validate(data);
        };
        // Cache the compiled validator
        SchemaCache.set(this.compilationKey, validator);
        return validator;
    }
    _validate(data) {
        if (!this.compiledValidator) {
            this.compiledValidator = this.compileValidator();
        }
        return this.compiledValidator(data);
    }
    // Performance statistics
    getStats() {
        return {
            cached: !!this.compiledValidator,
            compilationKey: this.compilationKey,
            cacheSize: SchemaCache.size()
        };
    }
}
exports.JITSchema = JITSchema;
// Batch validator for processing multiple items efficiently
class BatchValidator {
    constructor(schema) {
        this.pooledErrors = [];
        this.schema = schema;
    }
    validate(items) {
        const results = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const data = this.schema._validate(items[i]);
                results.push({ success: true, data });
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
                    // Add index to error paths
                    const adjustedIssues = error.issues.map(issue => ({
                        ...issue,
                        path: [i, ...issue.path]
                    }));
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
        }
        return results;
    }
    validateParallel(items, chunkSize = 100) {
        return new Promise((resolve) => {
            const results = new Array(items.length);
            let completed = 0;
            // Process in chunks to avoid blocking
            const processChunk = (startIndex) => {
                const endIndex = Math.min(startIndex + chunkSize, items.length);
                for (let i = startIndex; i < endIndex; i++) {
                    try {
                        const data = this.schema._validate(items[i]);
                        results[i] = { success: true, data };
                    }
                    catch (error) {
                        if (error instanceof types_1.ValidationError) {
                            const adjustedIssues = error.issues.map(issue => ({
                                ...issue,
                                path: [i, ...issue.path]
                            }));
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
                }
                completed += (endIndex - startIndex);
                if (completed >= items.length) {
                    resolve(results);
                }
                else {
                    // Use setTimeout to yield control
                    setTimeout(() => processChunk(endIndex), 0);
                }
            };
            processChunk(0);
        });
    }
    getStats() {
        return {
            schemaType: this.schema.getSchema().type,
            pooledErrors: this.pooledErrors.length,
            regexCacheSize: RegexCache.size(),
            schemaCacheSize: SchemaCache.size()
        };
    }
}
exports.BatchValidator = BatchValidator;
// Streaming validator for large datasets
class StreamingValidator {
    constructor(schema, onResult) {
        this.buffer = [];
        this.schema = schema;
        this.onResult = onResult;
    }
    push(item) {
        const index = this.buffer.length;
        this.buffer.push(item);
        if (this.onResult) {
            try {
                const data = this.schema._validate(item);
                this.onResult({ success: true, data }, index);
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
                    this.onResult({ success: false, error }, index);
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
    }
    flush() {
        const batchValidator = new BatchValidator(this.schema);
        const results = batchValidator.validate(this.buffer);
        this.buffer.length = 0;
        return results;
    }
}
exports.StreamingValidator = StreamingValidator;
//# sourceMappingURL=performance.js.map