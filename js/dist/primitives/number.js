"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberSchema = void 0;
// Number schema implementation
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
class NumberSchema extends schema_1.Schema {
    constructor() {
        super({ type: 'number' });
        this.isInteger = false;
        this.isFinite = false;
    }
    _validate(data) {
        if (typeof data !== 'number' || isNaN(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected number',
                    received: typeof data,
                    expected: 'number'
                }]);
        }
        if (this.isFinite && !Number.isFinite(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected finite number'
                }]);
        }
        if (this.isInteger && !Number.isInteger(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected integer'
                }]);
        }
        if (this.minValue !== undefined && data < this.minValue) {
            throw new types_1.ValidationError([{
                    code: 'too_small',
                    path: [],
                    message: `Number must be at least ${this.minValue}`
                }]);
        }
        if (this.maxValue !== undefined && data > this.maxValue) {
            throw new types_1.ValidationError([{
                    code: 'too_big',
                    path: [],
                    message: `Number must be at most ${this.maxValue}`
                }]);
        }
        return data;
    }
    // Range constraints
    min(value) {
        this.minValue = value;
        return this;
    }
    max(value) {
        this.maxValue = value;
        return this;
    }
    // Type constraints
    int() {
        this.isInteger = true;
        return this;
    }
    finite() {
        this.isFinite = true;
        return this;
    }
    // Convenience methods
    positive() {
        return this.min(0.000001);
    }
    nonnegative() {
        return this.min(0);
    }
    negative() {
        return this.max(-0.000001);
    }
    nonpositive() {
        return this.max(0);
    }
    // Mathematical operations
    gte(value) {
        return this.min(value);
    }
    gt(value) {
        return this.min(value + Number.EPSILON);
    }
    lte(value) {
        return this.max(value);
    }
    lt(value) {
        return this.max(value - Number.EPSILON);
    }
    // Special number validations
    multipleOf(value) {
        return this.refine((data) => Math.abs(data % value) < Number.EPSILON, `Number must be a multiple of ${value}`);
    }
    step(value) {
        return this.multipleOf(value);
    }
    // Parsing utilities
    static coerce(data) {
        if (typeof data === 'number')
            return data;
        if (typeof data === 'string') {
            const parsed = Number(data);
            if (!isNaN(parsed))
                return parsed;
        }
        throw new types_1.ValidationError([{
                code: 'invalid_type',
                path: [],
                message: 'Cannot coerce to number',
                received: typeof data,
                expected: 'number'
            }]);
    }
}
exports.NumberSchema = NumberSchema;
//# sourceMappingURL=number.js.map