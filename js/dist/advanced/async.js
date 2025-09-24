"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseSchema = exports.AsyncRefinementSchema = exports.AsyncSchema = void 0;
// Async validation schemas
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
class AsyncSchema extends schema_1.Schema {
    constructor(asyncValidator, syncFallback) {
        super({
            type: 'async',
            hasSyncFallback: !!syncFallback
        });
        this.asyncValidator = asyncValidator;
        this.syncFallback = syncFallback;
    }
    _validate(data) {
        // For sync validation, use fallback if available
        if (this.syncFallback) {
            return this.syncFallback._validate(data);
        }
        throw new types_1.ValidationError([{
                code: 'async_validation_required',
                path: [],
                message: 'This schema requires async validation. Use parseAsync() instead.'
            }]);
    }
    // Async validation methods
    async parseAsync(data) {
        try {
            return await this.asyncValidator(data);
        }
        catch (error) {
            if (error instanceof types_1.ValidationError) {
                throw error;
            }
            throw new types_1.ValidationError([{
                    code: 'async_validation_failed',
                    path: [],
                    message: error instanceof Error ? error.message : 'Async validation failed'
                }]);
        }
    }
    async safeParseAsync(data) {
        try {
            const result = await this.parseAsync(data);
            return { success: true, data: result };
        }
        catch (error) {
            if (error instanceof types_1.ValidationError) {
                return { success: false, error };
            }
            return {
                success: false,
                error: new types_1.ValidationError([{
                        code: 'unknown_error',
                        path: [],
                        message: error instanceof Error ? error.message : 'Unknown async error'
                    }])
            };
        }
    }
}
exports.AsyncSchema = AsyncSchema;
// Async refinement schema
class AsyncRefinementSchema extends schema_1.Schema {
    constructor(innerSchema, asyncPredicate, message) {
        super({
            type: 'async_refinement',
            innerSchema: innerSchema.getSchema(),
            message
        });
        this.innerSchema = innerSchema;
        this.asyncPredicate = asyncPredicate;
        this.message = message;
    }
    _validate(data) {
        // Sync validation of inner schema only
        return this.innerSchema._validate(data);
    }
    async parseAsync(data) {
        // First validate with inner schema
        const validated = this.innerSchema._validate(data);
        // Then apply async refinement
        const isValid = await this.asyncPredicate(validated);
        if (!isValid) {
            throw new types_1.ValidationError([{
                    code: 'async_refinement_failed',
                    path: [],
                    message: this.message
                }]);
        }
        return validated;
    }
    async safeParseAsync(data) {
        try {
            const result = await this.parseAsync(data);
            return { success: true, data: result };
        }
        catch (error) {
            if (error instanceof types_1.ValidationError) {
                return { success: false, error };
            }
            return {
                success: false,
                error: new types_1.ValidationError([{
                        code: 'unknown_error',
                        path: [],
                        message: error instanceof Error ? error.message : 'Unknown async error'
                    }])
            };
        }
    }
}
exports.AsyncRefinementSchema = AsyncRefinementSchema;
// Promise schema for validating promises
class PromiseSchema extends schema_1.Schema {
    constructor(valueSchema) {
        super({
            type: 'promise',
            valueSchema: valueSchema.getSchema()
        });
        this.valueSchema = valueSchema;
    }
    _validate(data) {
        if (!(data instanceof Promise)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected Promise',
                    received: typeof data,
                    expected: 'Promise'
                }]);
        }
        return data;
    }
    // Override parseAsync to handle Promise validation
    parseAsync(data) {
        // First validate that the data is a Promise
        const promise = this._validate(data);
        // Return the promise that will resolve to the validated value
        return promise.then(resolved => {
            const validated = this.valueSchema._validate(resolved);
            return Promise.resolve(validated);
        });
    }
    safeParseAsync(data) {
        try {
            const result = this.parseAsync(data);
            return result.then(data => ({ success: true, data })).catch(error => ({
                success: false,
                error: error instanceof types_1.ValidationError ? error : new types_1.ValidationError([{
                        code: 'unknown_error',
                        path: [],
                        message: error instanceof Error ? error.message : 'Unknown promise error'
                    }])
            }));
        }
        catch (error) {
            return Promise.resolve({
                success: false,
                error: error instanceof types_1.ValidationError ? error : new types_1.ValidationError([{
                        code: 'unknown_error',
                        path: [],
                        message: error instanceof Error ? error.message : 'Unknown promise error'
                    }])
            });
        }
    }
}
exports.PromiseSchema = PromiseSchema;
//# sourceMappingURL=async.js.map