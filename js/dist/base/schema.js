"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformSchema = exports.RefinementSchema = exports.DefaultSchema = exports.NullableSchema = exports.OptionalSchema = exports.Schema = exports.ValidationError = void 0;
// Core Schema base class with essential methods
const types_1 = require("./types");
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return types_1.ValidationError; } });
class Schema {
    constructor(definition) {
        this.definition = definition;
    }
    parse(data) {
        return this._validate(data);
    }
    safeParse(data) {
        try {
            const result = this._validate(data);
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
                        message: error instanceof Error ? error.message : 'Unknown error'
                    }])
            };
        }
    }
    getSchema() {
        return this.definition;
    }
    // Transformation methods
    optional() {
        return new OptionalSchema(this);
    }
    nullable() {
        return new NullableSchema(this);
    }
    default(value) {
        return new DefaultSchema(this, value);
    }
    // Refinement and transformation
    refine(predicate, message) {
        return new RefinementSchema(this, predicate, message);
    }
    transform(transformer) {
        return new TransformSchema(this, transformer);
    }
    // Async methods
    parseAsync(data) {
        return Promise.resolve(this.parse(data));
    }
    safeParseAsync(data) {
        return Promise.resolve(this.safeParse(data));
    }
    // Brand (nominal typing)
    brand() {
        return this;
    }
    // Catch - handle validation errors
    catch(value) {
        const self = this;
        return new (class extends Schema {
            _validate(data) {
                try {
                    return self._validate(data);
                }
                catch {
                    return value;
                }
            }
        })(this.definition);
    }
    // Pipe - compose with another schema
    pipe(schema) {
        const self = this;
        return new (class extends Schema {
            _validate(data) {
                const intermediate = self._validate(data);
                return schema._validate(intermediate);
            }
        })({ type: 'pipe', schemas: [this.definition, schema.definition] });
    }
}
exports.Schema = Schema;
// Optional schema wrapper
class OptionalSchema extends Schema {
    constructor(innerSchema) {
        super({ type: 'optional', innerSchema: innerSchema.getSchema() });
        this.innerSchema = innerSchema;
    }
    _validate(data) {
        if (data === undefined) {
            return undefined;
        }
        return this.innerSchema._validate(data);
    }
}
exports.OptionalSchema = OptionalSchema;
// Nullable schema wrapper
class NullableSchema extends Schema {
    constructor(innerSchema) {
        super({ type: 'nullable', innerSchema: innerSchema.getSchema() });
        this.innerSchema = innerSchema;
    }
    _validate(data) {
        if (data === null) {
            return null;
        }
        return this.innerSchema._validate(data);
    }
}
exports.NullableSchema = NullableSchema;
// Default value schema
class DefaultSchema extends Schema {
    constructor(innerSchema, defaultValue) {
        super({ type: 'default', innerSchema: innerSchema.getSchema(), defaultValue });
        this.innerSchema = innerSchema;
        this.defaultValue = defaultValue;
    }
    _validate(data) {
        if (data === undefined) {
            return this.defaultValue;
        }
        return this.innerSchema._validate(data);
    }
}
exports.DefaultSchema = DefaultSchema;
// Refinement schema
class RefinementSchema extends Schema {
    constructor(innerSchema, predicate, errorMessage) {
        super({ type: 'refinement', innerSchema: innerSchema.getSchema() });
        this.innerSchema = innerSchema;
        this.predicate = predicate;
        this.errorMessage = errorMessage;
    }
    _validate(data) {
        const validated = this.innerSchema._validate(data);
        if (!this.predicate(validated)) {
            const message = typeof this.errorMessage === 'string'
                ? this.errorMessage
                : this.errorMessage.message;
            const path = typeof this.errorMessage === 'object' && this.errorMessage.path
                ? this.errorMessage.path
                : [];
            throw new types_1.ValidationError([{
                    code: 'custom',
                    path,
                    message
                }]);
        }
        return validated;
    }
}
exports.RefinementSchema = RefinementSchema;
// Transform schema
class TransformSchema extends Schema {
    constructor(innerSchema, transformer) {
        super({ type: 'transform', innerSchema: innerSchema.getSchema() });
        this.innerSchema = innerSchema;
        this.transformer = transformer;
    }
    _validate(data) {
        const validated = this.innerSchema._validate(data);
        return this.transformer(validated);
    }
}
exports.TransformSchema = TransformSchema;
