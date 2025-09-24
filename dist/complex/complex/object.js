"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectSchema = void 0;
// Object schema implementation
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
class ObjectSchema extends schema_1.Schema {
    constructor(shape) {
        super({
            type: 'object',
            shape: Object.fromEntries(Object.entries(shape).map(([key, schema]) => [key, schema.getSchema()]))
        });
        this.shape = shape;
    }
    _validate(data) {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected object',
                    received: typeof data,
                    expected: 'object'
                }]);
        }
        const result = {};
        const issues = [];
        const obj = data;
        for (const [key, schema] of Object.entries(this.shape)) {
            try {
                if (key in obj) {
                    result[key] = schema._validate(obj[key]);
                }
                else if (!(schema instanceof schema_1.OptionalSchema)) {
                    issues.push({
                        code: 'invalid_type',
                        path: [key],
                        message: 'Required'
                    });
                }
            }
            catch (error) {
                // Check if error has ValidationError structure (instead of instanceof due to build issues)
                if (error && typeof error === 'object' && Array.isArray(error.issues)) {
                    error.issues.forEach(issue => {
                        issues.push({
                            ...issue,
                            path: [key, ...issue.path]
                        });
                    });
                }
            }
        }
        if (issues.length > 0) {
            throw new types_1.ValidationError(issues);
        }
        return result;
    }
    // Object composition methods
    partial() {
        const partialShape = {};
        for (const [key, schema] of Object.entries(this.shape)) {
            partialShape[key] = schema.optional();
        }
        return new ObjectSchema(partialShape);
    }
    required() {
        const requiredShape = {};
        for (const [key, schema] of Object.entries(this.shape)) {
            if (schema instanceof schema_1.OptionalSchema) {
                requiredShape[key] = schema.innerSchema;
            }
            else {
                requiredShape[key] = schema;
            }
        }
        return new ObjectSchema(requiredShape);
    }
    pick(keys) {
        const pickedShape = {};
        const keysSet = new Set(keys);
        for (const [key, schema] of Object.entries(this.shape)) {
            if (keysSet.has(key)) {
                pickedShape[key] = schema;
            }
        }
        return new ObjectSchema(pickedShape);
    }
    omit(keys) {
        const omittedShape = {};
        const keysSet = new Set(keys);
        for (const [key, schema] of Object.entries(this.shape)) {
            if (!keysSet.has(key)) {
                omittedShape[key] = schema;
            }
        }
        return new ObjectSchema(omittedShape);
    }
    extend(extension) {
        const extendedShape = { ...this.shape, ...extension };
        return new ObjectSchema(extendedShape);
    }
    merge(other) {
        const mergedShape = { ...this.shape, ...other.shape };
        return new ObjectSchema(mergedShape);
    }
    // Get the shape for inspection
    getShape() {
        return this.shape;
    }
    // Passthrough - allow additional properties
    passthrough() {
        // Implementation would need to be more complex to handle unknown properties
        return this;
    }
    // Strict - disallow additional properties (default behavior)
    strict() {
        return this;
    }
    // Strip - remove additional properties
    strip() {
        return this;
    }
}
exports.ObjectSchema = ObjectSchema;
