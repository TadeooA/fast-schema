"use strict";
// Simplified working version for immediate compilation
// This will serve as the base while we fix the complex core.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.fast = exports.NullableSchema = exports.OptionalSchema = exports.ObjectSchema = exports.ArraySchema = exports.BooleanSchema = exports.NumberSchema = exports.StringSchema = exports.BaseSchema = exports.ValidationError = void 0;
class ValidationError extends Error {
    constructor(issues) {
        const message = issues.map(issue => `${issue.path.length > 0 ? issue.path.join('.') + ': ' : ''}${issue.message}`).join('; ');
        super(message);
        this.name = 'ValidationError';
        this.issues = issues;
    }
    format() {
        const formatted = {};
        for (const issue of this.issues) {
            const path = issue.path.join('.');
            if (path) {
                formatted[path] = issue.message;
            }
            else {
                formatted._errors = formatted._errors || [];
                formatted._errors.push(issue.message);
            }
        }
        return formatted;
    }
    flatten() {
        const fieldErrors = {};
        const formErrors = [];
        for (const issue of this.issues) {
            if (issue.path.length > 0) {
                const path = issue.path.join('.');
                fieldErrors[path] = fieldErrors[path] || [];
                fieldErrors[path].push(issue.message);
            }
            else {
                formErrors.push(issue.message);
            }
        }
        return {
            fieldErrors,
            formErrors
        };
    }
}
exports.ValidationError = ValidationError;
class BaseSchema {
    constructor(schema) {
        this.schema = schema;
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
            if (error instanceof ValidationError) {
                return { success: false, error };
            }
            return {
                success: false,
                error: new ValidationError([{
                        code: 'unknown_error',
                        path: [],
                        message: error instanceof Error ? error.message : 'Unknown error'
                    }])
            };
        }
    }
    optional() {
        return new OptionalSchema(this);
    }
    nullable() {
        return new NullableSchema(this);
    }
    getSchema() {
        return this.schema;
    }
}
exports.BaseSchema = BaseSchema;
class StringSchema extends BaseSchema {
    constructor() {
        super({ type: 'string' });
    }
    _validate(data) {
        if (typeof data !== 'string') {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected string',
                    received: typeof data,
                    expected: 'string'
                }]);
        }
        if (this.minLength !== undefined && data.length < this.minLength) {
            throw new ValidationError([{
                    code: 'too_small',
                    path: [],
                    message: `String must be at least ${this.minLength} characters`
                }]);
        }
        if (this.maxLength !== undefined && data.length > this.maxLength) {
            throw new ValidationError([{
                    code: 'too_big',
                    path: [],
                    message: `String must be at most ${this.maxLength} characters`
                }]);
        }
        if (this.pattern && !this.pattern.test(data)) {
            throw new ValidationError([{
                    code: 'invalid_string',
                    path: [],
                    message: 'String does not match required pattern'
                }]);
        }
        return data;
    }
    min(length) {
        this.minLength = length;
        return this;
    }
    max(length) {
        this.maxLength = length;
        return this;
    }
    email() {
        this.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return this;
    }
    url() {
        this.pattern = /^https?:\/\/.+/;
        return this;
    }
}
exports.StringSchema = StringSchema;
class NumberSchema extends BaseSchema {
    constructor() {
        super({ type: 'number' });
        this.isInteger = false;
    }
    _validate(data) {
        if (typeof data !== 'number' || isNaN(data)) {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected number',
                    received: typeof data,
                    expected: 'number'
                }]);
        }
        if (this.isInteger && !Number.isInteger(data)) {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected integer'
                }]);
        }
        if (this.minValue !== undefined && data < this.minValue) {
            throw new ValidationError([{
                    code: 'too_small',
                    path: [],
                    message: `Number must be at least ${this.minValue}`
                }]);
        }
        if (this.maxValue !== undefined && data > this.maxValue) {
            throw new ValidationError([{
                    code: 'too_big',
                    path: [],
                    message: `Number must be at most ${this.maxValue}`
                }]);
        }
        return data;
    }
    min(value) {
        this.minValue = value;
        return this;
    }
    max(value) {
        this.maxValue = value;
        return this;
    }
    int() {
        this.isInteger = true;
        return this;
    }
    positive() {
        return this.min(0.01);
    }
}
exports.NumberSchema = NumberSchema;
class BooleanSchema extends BaseSchema {
    constructor() {
        super({ type: 'boolean' });
    }
    _validate(data) {
        if (typeof data !== 'boolean') {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected boolean',
                    received: typeof data,
                    expected: 'boolean'
                }]);
        }
        return data;
    }
}
exports.BooleanSchema = BooleanSchema;
class ArraySchema extends BaseSchema {
    constructor(itemSchema) {
        super({ type: 'array' });
        this.itemSchema = itemSchema;
    }
    _validate(data) {
        if (!Array.isArray(data)) {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected array',
                    received: typeof data,
                    expected: 'array'
                }]);
        }
        const result = [];
        const issues = [];
        for (let i = 0; i < data.length; i++) {
            try {
                result.push(this.itemSchema._validate(data[i]));
            }
            catch (error) {
                if (error instanceof ValidationError) {
                    error.issues.forEach(issue => {
                        issues.push({
                            ...issue,
                            path: [i, ...issue.path]
                        });
                    });
                }
            }
        }
        if (issues.length > 0) {
            throw new ValidationError(issues);
        }
        return result;
    }
}
exports.ArraySchema = ArraySchema;
class ObjectSchema extends BaseSchema {
    constructor(shape) {
        super({ type: 'object' });
        this.shape = shape;
    }
    _validate(data) {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            throw new ValidationError([{
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
                else if (!(schema instanceof OptionalSchema)) {
                    issues.push({
                        code: 'invalid_type',
                        path: [key],
                        message: 'Required'
                    });
                }
            }
            catch (error) {
                if (error instanceof ValidationError) {
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
            throw new ValidationError(issues);
        }
        return result;
    }
}
exports.ObjectSchema = ObjectSchema;
class OptionalSchema extends BaseSchema {
    constructor(innerSchema) {
        super({ type: 'optional' });
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
class NullableSchema extends BaseSchema {
    constructor(innerSchema) {
        super({ type: 'nullable' });
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
// Main fast object - ultra-performance validation
exports.fast = {
    string: () => new StringSchema(),
    number: () => new NumberSchema(),
    boolean: () => new BooleanSchema(),
    array: (schema) => new ArraySchema(schema),
    object: (shape) => new ObjectSchema(shape),
    // Simple utilities
    literal: (value) => {
        return new StringSchema().min(value.toString().length).max(value.toString().length);
    },
    any: () => new class extends BaseSchema {
        constructor() { super({ type: 'any' }); }
        _validate(data) { return data; }
    },
    unknown: () => new class extends BaseSchema {
        constructor() { super({ type: 'unknown' }); }
        _validate(data) { return data; }
    }
};
//# sourceMappingURL=simple.js.map