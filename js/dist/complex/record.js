"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordSchema = void 0;
// Record schema implementation
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
class RecordSchema extends schema_1.Schema {
    constructor(valueSchema) {
        super({
            type: 'record',
            valueType: valueSchema.getSchema()
        });
        this.valueSchema = valueSchema;
    }
    _validate(data) {
        if (data === null || data === undefined) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    expected: 'object',
                    received: data === null ? 'null' : 'undefined',
                    path: [],
                    message: 'Expected object, received ' + (data === null ? 'null' : 'undefined')
                }]);
        }
        if (typeof data !== 'object') {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    expected: 'object',
                    received: typeof data,
                    path: [],
                    message: `Expected object, received ${typeof data}`
                }]);
        }
        const result = {};
        const issues = [];
        for (const [key, value] of Object.entries(data)) {
            try {
                result[key] = this.valueSchema._validate(value);
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
                    error.issues.forEach(issue => {
                        issues.push({
                            ...issue,
                            path: [key, ...issue.path]
                        });
                    });
                }
                else {
                    issues.push({
                        code: 'custom',
                        path: [key],
                        message: error instanceof Error ? error.message : 'Validation failed'
                    });
                }
            }
        }
        if (issues.length > 0) {
            throw new types_1.ValidationError(issues);
        }
        return result;
    }
}
exports.RecordSchema = RecordSchema;
//# sourceMappingURL=record.js.map