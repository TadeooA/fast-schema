"use strict";
// Split core schema types to separate files for better maintainability
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeverSchema = exports.UnknownSchema = exports.AnySchema = exports.UndefinedSchema = exports.NullSchema = exports.NullableSchema = exports.OptionalSchema = exports.UnionSchema = exports.ObjectSchema = exports.ArraySchema = exports.BooleanSchema = exports.NumberSchema = exports.StringSchema = exports.BaseSchema = exports.Schema = void 0;
var core_1 = require("./core");
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return core_1.Schema; } });
Object.defineProperty(exports, "BaseSchema", { enumerable: true, get: function () { return core_1.BaseSchema; } });
var core_2 = require("./core");
Object.defineProperty(exports, "StringSchema", { enumerable: true, get: function () { return core_2.StringSchema; } });
var core_3 = require("./core");
Object.defineProperty(exports, "NumberSchema", { enumerable: true, get: function () { return core_3.NumberSchema; } });
var core_4 = require("./core");
Object.defineProperty(exports, "BooleanSchema", { enumerable: true, get: function () { return core_4.BooleanSchema; } });
var core_5 = require("./core");
Object.defineProperty(exports, "ArraySchema", { enumerable: true, get: function () { return core_5.ArraySchema; } });
var core_6 = require("./core");
Object.defineProperty(exports, "ObjectSchema", { enumerable: true, get: function () { return core_6.ObjectSchema; } });
var core_7 = require("./core");
Object.defineProperty(exports, "UnionSchema", { enumerable: true, get: function () { return core_7.UnionSchema; } });
var core_8 = require("./core");
Object.defineProperty(exports, "OptionalSchema", { enumerable: true, get: function () { return core_8.OptionalSchema; } });
var core_9 = require("./core");
Object.defineProperty(exports, "NullableSchema", { enumerable: true, get: function () { return core_9.NullableSchema; } });
// Utility schemas
class NullSchema extends Schema {
    constructor() {
        super({ type: 'null' });
    }
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
}
exports.NullSchema = NullSchema;
class UndefinedSchema extends Schema {
    constructor() {
        super({ type: 'undefined' });
    }
    _validate(data) {
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
exports.UndefinedSchema = UndefinedSchema;
class AnySchema extends Schema {
    constructor() {
        super({ type: 'any' });
    }
    _validate(data) {
        return data;
    }
}
exports.AnySchema = AnySchema;
class UnknownSchema extends Schema {
    constructor() {
        super({ type: 'unknown' });
    }
    _validate(data) {
        return data;
    }
}
exports.UnknownSchema = UnknownSchema;
class NeverSchema extends Schema {
    constructor() {
        super({ type: 'never' });
    }
    _validate(data) {
        throw new ValidationError([{
                code: 'invalid_type',
                path: [],
                message: 'Never type - no value is valid'
            }]);
    }
}
exports.NeverSchema = NeverSchema;
//# sourceMappingURL=schemas.js.map