"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscriminatedUnionSchema = exports.SchemaMerger = exports.KeyofSchema = exports.NonNullableSchema = exports.ReadonlySchema = exports.RequiredSchema = exports.DeepPartialSchema = void 0;
exports.makeDeepPartial = makeDeepPartial;
exports.makeRequired = makeRequired;
exports.makeReadonly = makeReadonly;
exports.makeNonNullable = makeNonNullable;
exports.keyof = keyof;
// Schema composition and manipulation utilities
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
const object_1 = require("../complex/object");
// Deep partial schema - makes nested objects optional too
class DeepPartialSchema extends schema_1.Schema {
    constructor(innerSchema) {
        super({
            type: 'deep_partial',
            innerSchema: innerSchema.getSchema()
        });
        this.innerSchema = innerSchema;
    }
    _validate(data) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        // For objects, apply deep partial transformation
        if (this.innerSchema instanceof object_1.ObjectSchema) {
            const shape = this.innerSchema.getShape();
            const result = {};
            for (const [key, schema] of Object.entries(shape)) {
                if (key in data) {
                    try {
                        result[key] = makeDeepPartial(schema)._validate(data[key]);
                    }
                    catch (error) {
                        // Skip invalid properties in deep partial
                        continue;
                    }
                }
            }
            return result;
        }
        // For non-objects, just validate normally
        return this.innerSchema._validate(data);
    }
}
exports.DeepPartialSchema = DeepPartialSchema;
// Required schema - opposite of partial
class RequiredSchema extends schema_1.Schema {
    constructor(innerSchema) {
        super({
            type: 'required',
            innerSchema: innerSchema.getSchema()
        });
        this.innerSchema = innerSchema;
    }
    _validate(data) {
        // First validate with inner schema
        const validated = this.innerSchema._validate(data);
        // Check that all properties are present
        const shape = this.innerSchema.getShape();
        const result = validated;
        for (const key of Object.keys(shape)) {
            if (result[key] === undefined) {
                throw new types_1.ValidationError([{
                        code: 'invalid_type',
                        path: [key],
                        message: 'Required property cannot be undefined'
                    }]);
            }
        }
        return result;
    }
}
exports.RequiredSchema = RequiredSchema;
// ReadOnly schema
class ReadonlySchema extends schema_1.Schema {
    constructor(innerSchema) {
        super({
            type: 'readonly',
            innerSchema: innerSchema.getSchema()
        });
        this.innerSchema = innerSchema;
    }
    _validate(data) {
        const validated = this.innerSchema._validate(data);
        return Object.freeze(validated);
    }
}
exports.ReadonlySchema = ReadonlySchema;
// NonNullable schema
class NonNullableSchema extends schema_1.Schema {
    constructor(innerSchema) {
        super({
            type: 'non_nullable',
            innerSchema: innerSchema.getSchema()
        });
        this.innerSchema = innerSchema;
    }
    _validate(data) {
        if (data === null || data === undefined) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Value cannot be null or undefined',
                    received: String(data),
                    expected: 'non-null value'
                }]);
        }
        return this.innerSchema._validate(data);
    }
}
exports.NonNullableSchema = NonNullableSchema;
// Keyof schema for object keys
class KeyofSchema extends schema_1.Schema {
    constructor(objectSchema) {
        const keys = Object.keys(objectSchema.getShape());
        super({
            type: 'keyof',
            keys: keys,
            objectSchema: objectSchema.getSchema()
        });
        this.objectSchema = objectSchema;
    }
    _validate(data) {
        if (typeof data !== 'string') {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected string key',
                    received: typeof data,
                    expected: 'string'
                }]);
        }
        const keys = Object.keys(this.objectSchema.getShape());
        if (!keys.includes(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_enum_value',
                    path: [],
                    message: `Expected one of: ${keys.join(', ')}`,
                    received: data,
                    expected: keys.join(' | ')
                }]);
        }
        return data;
    }
}
exports.KeyofSchema = KeyofSchema;
// Utility functions
function makeDeepPartial(schema) {
    return new DeepPartialSchema(schema);
}
function makeRequired(schema) {
    return new RequiredSchema(schema);
}
function makeReadonly(schema) {
    return new ReadonlySchema(schema);
}
function makeNonNullable(schema) {
    return new NonNullableSchema(schema);
}
function keyof(schema) {
    return new KeyofSchema(schema);
}
// Schema merger utility
class SchemaMerger {
    static merge(schemaA, schemaB) {
        const shapeA = schemaA.getShape();
        const shapeB = schemaB.getShape();
        const mergedShape = { ...shapeA, ...shapeB };
        return new object_1.ObjectSchema(mergedShape);
    }
    static deepMerge(schemaA, schemaB) {
        const shapeA = schemaA.getShape();
        const shapeB = schemaB.getShape();
        const mergedShape = { ...shapeA };
        for (const [key, schema] of Object.entries(shapeB)) {
            if (key in mergedShape) {
                // If both schemas have the same key, try to merge them
                const existingSchema = mergedShape[key];
                if (existingSchema instanceof object_1.ObjectSchema && schema instanceof object_1.ObjectSchema) {
                    mergedShape[key] = this.deepMerge(existingSchema, schema);
                }
                else {
                    // Override with schema B
                    mergedShape[key] = schema;
                }
            }
            else {
                mergedShape[key] = schema;
            }
        }
        return new object_1.ObjectSchema(mergedShape);
    }
}
exports.SchemaMerger = SchemaMerger;
// Discriminated union helper
class DiscriminatedUnionSchema extends schema_1.Schema {
    constructor(discriminator, schemas) {
        super({
            type: 'discriminated_union',
            discriminator: String(discriminator),
            schemas: schemas.map(s => s.getSchema())
        });
        this.discriminator = discriminator;
        this.schemas = schemas;
    }
    _validate(data) {
        if (typeof data !== 'object' || data === null) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected object for discriminated union',
                    received: typeof data,
                    expected: 'object'
                }]);
        }
        const obj = data;
        const discriminatorValue = obj[this.discriminator];
        if (discriminatorValue === undefined) {
            throw new types_1.ValidationError([{
                    code: 'missing_discriminator',
                    path: [this.discriminator],
                    message: `Missing discriminator field: ${String(this.discriminator)}`
                }]);
        }
        // Try each schema until one matches the discriminator
        const errors = [];
        for (const schema of this.schemas) {
            try {
                const result = schema._validate(data);
                // Check if discriminator matches
                if (result[this.discriminator] === discriminatorValue) {
                    return result;
                }
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
                    errors.push(error);
                }
            }
        }
        // If no schema matched, throw combined errors
        const allIssues = errors.flatMap(err => err.issues);
        throw new types_1.ValidationError(allIssues.length > 0 ? allIssues : [{
                code: 'invalid_discriminated_union',
                path: [],
                message: `No schema matched discriminator value: ${discriminatorValue}`
            }]);
    }
}
exports.DiscriminatedUnionSchema = DiscriminatedUnionSchema;
//# sourceMappingURL=composition.js.map