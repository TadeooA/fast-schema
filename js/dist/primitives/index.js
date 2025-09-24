"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeverSchema = exports.UnknownSchema = exports.AnySchema = exports.UndefinedSchema = exports.NullSchema = exports.BooleanSchema = exports.NumberSchema = exports.StringSchema = void 0;
// Export all primitive schemas
var string_1 = require("./string");
Object.defineProperty(exports, "StringSchema", { enumerable: true, get: function () { return string_1.StringSchema; } });
var number_1 = require("./number");
Object.defineProperty(exports, "NumberSchema", { enumerable: true, get: function () { return number_1.NumberSchema; } });
// Boolean schema
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
class BooleanSchema extends schema_1.Schema {
    constructor() {
        super({ type: 'boolean' });
    }
    _validate(data) {
        if (typeof data !== 'boolean') {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected boolean',
                    received: typeof data,
                    expected: 'boolean'
                }]);
        }
        return data;
    }
    // Boolean-specific methods could go here
    isTrue() {
        return this.refine(data => data === true, 'Must be true');
    }
    isFalse() {
        return this.refine(data => data === false, 'Must be false');
    }
}
exports.BooleanSchema = BooleanSchema;
// Null schema
class NullSchema extends schema_1.Schema {
    constructor() {
        super({ type: 'null' });
    }
    _validate(data) {
        if (data !== null) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected null',
                    received: typeof data,
                    expected: 'null'
                }]);
        }
        return null;
    }
}
exports.NullSchema = NullSchema;
// Undefined schema
class UndefinedSchema extends schema_1.Schema {
    constructor() {
        super({ type: 'undefined' });
    }
    _validate(data) {
        if (data !== undefined) {
            throw new types_1.ValidationError([{
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
exports.UndefinedSchema = UndefinedSchema;
// Any schema
class AnySchema extends schema_1.Schema {
    constructor() {
        super({ type: 'any' });
    }
    _validate(data) {
        return data;
    }
}
exports.AnySchema = AnySchema;
// Unknown schema
class UnknownSchema extends schema_1.Schema {
    constructor() {
        super({ type: 'unknown' });
    }
    _validate(data) {
        return data;
    }
}
exports.UnknownSchema = UnknownSchema;
// Never schema
class NeverSchema extends schema_1.Schema {
    constructor() {
        super({ type: 'never' });
    }
    _validate(data) {
        throw new types_1.ValidationError([{
                code: 'invalid_type',
                path: [],
                message: 'Never type - no value is valid'
            }]);
    }
}
exports.NeverSchema = NeverSchema;
//# sourceMappingURL=index.js.map