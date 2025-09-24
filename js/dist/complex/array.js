"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArraySchema = void 0;
// Array schema implementation
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
class ArraySchema extends schema_1.Schema {
    constructor(itemSchema) {
        super({ type: 'array', element: itemSchema.getSchema() });
        this.itemSchema = itemSchema;
    }
    _validate(data) {
        if (!Array.isArray(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected array',
                    received: typeof data,
                    expected: 'array'
                }]);
        }
        if (this.minItems !== undefined && data.length < this.minItems) {
            throw new types_1.ValidationError([{
                    code: 'too_small',
                    path: [],
                    message: `Array must have at least ${this.minItems} items`
                }]);
        }
        if (this.maxItems !== undefined && data.length > this.maxItems) {
            throw new types_1.ValidationError([{
                    code: 'too_big',
                    path: [],
                    message: `Array must have at most ${this.maxItems} items`
                }]);
        }
        const result = [];
        const issues = [];
        for (let i = 0; i < data.length; i++) {
            try {
                result.push(this.itemSchema._validate(data[i]));
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
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
            throw new types_1.ValidationError(issues);
        }
        return result;
    }
    // Array-specific methods
    min(count) {
        this.minItems = count;
        return this;
    }
    max(count) {
        this.maxItems = count;
        return this;
    }
    length(count) {
        return this.min(count).max(count);
    }
    nonempty() {
        return this.min(1);
    }
    // Element access
    element() {
        return this.itemSchema;
    }
}
exports.ArraySchema = ArraySchema;
//# sourceMappingURL=array.js.map