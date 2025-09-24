// Fast-Schema - Ultra-fast TypeScript-first schema validation
// Clean, modern API with superior performance
import { Schema, StringSchema, NumberSchema, BooleanSchema, ArraySchema, ObjectSchema, UnionSchema, IntersectionSchema, ValidationError, DebouncedAsyncFunction, ValidationDebounceManager, globalDebounceManager, createDebouncedValidator, debounceAsyncFunction, BatchValidator, ValidationEventEmitter, ValidationMonitor, globalValidationMonitor, RegexCache, SchemaCache, ValidationPool, PerformanceStats, JITConfig, ConditionalSchema, CustomValidationSchema, DynamicSchema, IntrospectableSchema, SchemaSerializer, VersionedSchema, ValidationErrorWithContext, ContextualValidator, createConditionalSchema, createCustomValidator, createDynamicSchema, introspect, createVersionedSchema } from './core';
// Core exports - Fast-Schema's clean API
export { ValidationError, DebouncedAsyncFunction, ValidationDebounceManager, globalDebounceManager, createDebouncedValidator, debounceAsyncFunction, BatchValidator, ValidationEventEmitter, ValidationMonitor, globalValidationMonitor, RegexCache, SchemaCache, ValidationPool, PerformanceStats, JITConfig, ConditionalSchema, CustomValidationSchema, DynamicSchema, IntrospectableSchema, SchemaSerializer, VersionedSchema, ValidationErrorWithContext, ContextualValidator, createConditionalSchema, createCustomValidator, createDynamicSchema, introspect, createVersionedSchema };
// Main Fast-Schema namespace - powerful and intuitive validation API
export const z = {
    // Core types
    string: () => new StringSchema(),
    number: () => new NumberSchema(),
    boolean: () => new BooleanSchema(),
    array: (schema) => new ArraySchema(schema),
    object: (shape) => new ObjectSchema(shape),
    // Union and intersection
    union: (schemas) => new UnionSchema(schemas),
    intersection: (left, right) => new IntersectionSchema(left, right),
    // Utility types
    literal: (value) => {
        return new StringSchema().refine((data) => data === value, `Expected literal value: ${value}`);
    },
    null: () => {
        return new Schema({ type: 'null' });
        {
        }
    },
    _validate(data) {
        if (data !== null) {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected null',
                    received: typeof data,
                    expected: 'null'
                }]);
        }
        return null;
    }
};
undefined: () => {
    return new Schema({ type: 'undefined' });
    {
        _validate(data, unknown);
        undefined;
        {
            if (data !== undefined) {
                throw new ValidationError([{
                        code: 'invalid_type',
                        path: [],
                        message: 'Expected undefined',
                        received: typeof data,
                        expected: 'undefined'
                    }]);
            }
            return undefined;
        }
    }
    ;
},
    void ;
() => z.undefined(),
    any;
() => {
    return new Schema({ type: 'any' });
    {
        _validate(data, unknown);
        any;
        {
            return data;
        }
    }
    ;
},
    unknown;
() => {
    return new Schema({ type: 'unknown' });
    {
        _validate(data, unknown);
        unknown;
        {
            return data;
        }
    }
    ;
},
    never;
() => {
    return new Schema({ type: 'never' });
    {
        _validate(data, unknown);
        never;
        {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Never type - no value is valid'
                }]);
        }
    }
    ;
},
    // Advanced types
    custom;
(validator, message) => {
    return new Schema({ type: 'custom' });
    {
        _validate(data, unknown);
        T;
        {
            if (!validator(data)) {
                throw new ValidationError([{
                        code: 'custom',
                        path: [],
                        message: message || 'Custom validation failed'
                    }]);
            }
            return data;
        }
    }
    ;
},
    // Date type
    date;
() => {
    return new Schema({ type: 'date' });
    {
        _validate(data, unknown);
        Date;
        {
            if (data instanceof Date) {
                if (isNaN(data.getTime())) {
                    throw new ValidationError([{
                            code: 'invalid_date',
                            path: [],
                            message: 'Invalid date'
                        }]);
                }
                return data;
            }
            if (typeof data === 'string' || typeof data === 'number') {
                const parsed = new Date(data);
                if (isNaN(parsed.getTime())) {
                    throw new ValidationError([{
                            code: 'invalid_date',
                            path: [],
                            message: 'Invalid date'
                        }]);
                }
                return parsed;
            }
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected date',
                    received: typeof data,
                    expected: 'date'
                }]);
        }
    }
    ;
},
    // BigInt type
    bigint;
() => {
    return new Schema({ type: 'bigint' });
    {
        _validate(data, unknown);
        bigint;
        {
            if (typeof data === 'bigint') {
                return data;
            }
            if (typeof data === 'string' || typeof data === 'number') {
                try {
                    return BigInt(data);
                }
                catch {
                    throw new ValidationError([{
                            code: 'invalid_type',
                            path: [],
                            message: 'Invalid bigint',
                            received: typeof data,
                            expected: 'bigint'
                        }]);
                }
            }
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected bigint',
                    received: typeof data,
                    expected: 'bigint'
                }]);
        }
    }
    ;
},
    // Symbol type
    symbol;
() => {
    return new Schema({ type: 'symbol' });
    {
        _validate(data, unknown);
        symbol;
        {
            if (typeof data !== 'symbol') {
                throw new ValidationError([{
                        code: 'invalid_type',
                        path: [],
                        message: 'Expected symbol',
                        received: typeof data,
                        expected: 'symbol'
                    }]);
            }
            return data;
        }
    }
    ;
}, ;
Schema;
{
    return new Schema({ type: 'function' });
    {
        _validate(data, unknown);
        Function;
        {
            if (typeof data !== 'function') {
                throw new ValidationError([{
                        code: 'invalid_type',
                        path: [],
                        message: 'Expected function',
                        received: typeof data,
                        expected: 'function'
                    }]);
            }
            return data;
        }
    }
    ;
}
// Record type
record: (valueSchema) => {
    return new Schema({ type: 'record', valueSchema: valueSchema.getSchema() });
    {
        _validate(data, unknown);
        Record < string, T['_output'] > {
            if(, data) { }
        } !== 'object' || data === null || Array.isArray(data);
        {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected object',
                    received: typeof data,
                    expected: 'object'
                }]);
        }
        const result = {};
        const obj = data;
        for (const [key, value] of Object.entries(obj)) {
            try {
                result[key] = valueSchema._validate(value);
            }
            catch (error) {
                if (error instanceof ValidationError) {
                    const issues = error.issues.map(issue => ({
                        ...issue,
                        path: [key, ...issue.path]
                    }));
                    throw new ValidationError(issues);
                }
                throw error;
            }
        }
        return result;
    }
};
// Tuple type
tuple: (schemas) => {
    return new Schema({ type: 'tuple', schemas: schemas.map(s => s.getSchema()) });
    {
        _validate(data, unknown);
        {
            [K in keyof, T];
            T[K]['_output'];
        }
        {
            if (!Array.isArray(data)) {
                throw new ValidationError([{
                        code: 'invalid_type',
                        path: [],
                        message: 'Expected array',
                        received: typeof data,
                        expected: 'array'
                    }]);
            }
            if (data.length !== schemas.length) {
                throw new ValidationError([{
                        code: 'invalid_type',
                        path: [],
                        message: `Expected tuple of length ${schemas.length}, got ${data.length}`
                    }]);
            }
            const result = [];
            for (let i = 0; i < schemas.length; i++) {
                try {
                    result[i] = schemas[i]._validate(data[i]);
                }
                catch (error) {
                    if (error instanceof ValidationError) {
                        const issues = error.issues.map(issue => ({
                            ...issue,
                            path: [i, ...issue.path]
                        }));
                        throw new ValidationError(issues);
                    }
                    throw error;
                }
            }
            return result;
        }
    }
    ;
},
;
// Enum-like functionality
var ;
(function () {
})( || ( = {}));
(values) => {
    return z.union(values.map(val => z.literal(val)));
},
    nativeEnum;
(enumObject) => {
    const values = Object.values(enumObject);
    return z.union(values.map(val => z.literal(val)));
},
    // Discriminated union for advanced type safety
    discriminatedUnion;
(discriminator, schemas) => {
    return z.union(schemas);
},
    // Preprocessing
    preprocess;
(preprocess, schema) => {
    return new Schema({ type: 'preprocess' });
    {
        _validate(data, unknown);
        T['_output'];
        {
            const preprocessed = preprocess(data);
            return schema._validate(preprocessed);
        }
    }
    ;
},
    // Lazy evaluation (for recursive schemas)
    lazy;
(getter) => {
    let cachedSchema = null;
    return new Schema({ type: 'lazy' });
    {
        _validate(data, unknown);
        T['_output'];
        {
            if (!cachedSchema) {
                cachedSchema = getter();
            }
            return cachedSchema._validate(data);
        }
    }
    ;
},
    // Map type
    map;
(keySchema, valueSchema) => {
    return new Schema({ type: 'map' });
    {
        _validate(data, unknown);
        Map < K['_output'], V['_output'] > {
            if() { }
        }(data instanceof Map);
        {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected Map',
                    received: typeof data,
                    expected: 'map'
                }]);
        }
        const result = new Map();
        let index = 0;
        for (const [key, value] of data.entries()) {
            try {
                const validatedKey = keySchema._validate(key);
                const validatedValue = valueSchema._validate(value);
                result.set(validatedKey, validatedValue);
            }
            catch (error) {
                if (error instanceof ValidationError) {
                    const issues = error.issues.map(issue => ({
                        ...issue,
                        path: [index, ...issue.path]
                    }));
                    throw new ValidationError(issues);
                }
                throw error;
            }
            index++;
        }
        return result;
    }
};
// Set type
set: (schema) => {
    return new Schema({ type: 'set' });
    {
        _validate(data, unknown);
        Set < T['_output'] > {
            if() { }
        }(data instanceof Set);
        {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected Set',
                    received: typeof data,
                    expected: 'set'
                }]);
        }
        const result = new Set();
        let index = 0;
        for (const item of data) {
            try {
                const validated = schema._validate(item);
                result.add(validated);
            }
            catch (error) {
                if (error instanceof ValidationError) {
                    const issues = error.issues.map(issue => ({
                        ...issue,
                        path: [index, ...issue.path]
                    }));
                    throw new ValidationError(issues);
                }
                throw error;
            }
            index++;
        }
        return result;
    }
};
// Promise type
promise: (schema) => {
    return new Schema({ type: 'promise' });
    {
        _validate(data, unknown);
        Promise < T['_output'] > {
            if() { }
        }(data instanceof Promise);
        {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected Promise',
                    received: typeof data,
                    expected: 'promise'
                }]);
        }
        return data.then(value => schema._validate(value));
    }
};
// instanceof type
    instanceof ;
(cls) => {
    return new Schema({ type: 'instanceof' });
    {
        _validate(data, unknown);
        InstanceType < T > {
            if() { }
        }(data instanceof cls);
        {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: `Expected instance of ${cls.name}`,
                    received: typeof data,
                    expected: cls.name
                }]);
        }
        return data;
    }
};
// Batch validation methods
batchValidateAsync: async (items, options) => {
    const validator = new BatchValidator(options);
    return validator.validateAsync(items, options);
},
    createBatchValidator;
(options) => {
    return new BatchValidator(options);
},
    // Utility to create batch items from schema and data array
    createBatch;
(schema, dataArray, idGenerator) => {
    return BatchValidator.createBatch(schema, dataArray, idGenerator);
},
    // Advanced validation features
    conditional;
(defaultSchema) => {
    return createConditionalSchema(defaultSchema);
},
    custom;
(baseSchema) => {
    return createCustomValidator(baseSchema);
},
    dynamic;
(generator) => {
    return createDynamicSchema(generator);
},
    introspect;
(schema, metadata) => {
    return introspect(schema, metadata);
},
    versioned;
(version, schema) => {
    return createVersionedSchema(version, schema);
},
    // Schema utilities
    serialize;
(schema) => {
    return SchemaSerializer.serialize(schema);
},
    deserialize;
(serialized) => {
    return SchemaSerializer.deserialize(serialized);
},
    validateWithContext;
(schema, data, context) => {
    return ContextualValidator.validateWithContext(schema, data, context);
};
;
// =============================================================================
// COMPATIBILITY LAYER - For easy migration from other libraries
// =============================================================================
// Zod compatibility aliases (optional for migration)
export { ValidationError as ZodError };
//# sourceMappingURL=main.js.map