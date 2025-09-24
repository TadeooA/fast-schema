"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeverSchema = exports.UnknownSchema = exports.AnySchema = exports.UndefinedSchema = exports.NullSchema = exports.BooleanSchema = exports.NumberSchema = exports.StringSchema = void 0;
// Export all primitive schemas
var string_1 = require("./string");
Object.defineProperty(exports, "StringSchema", { enumerable: true, get: function () { return string_1.StringSchema; } });
var number_1 = require("./number");
Object.defineProperty(exports, "NumberSchema", { enumerable: true, get: function () { return number_1.NumberSchema; } });
// Boolean schema
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
var BooleanSchema = /** @class */ (function (_super) {
    __extends(BooleanSchema, _super);
    function BooleanSchema() {
        return _super.call(this, { type: 'boolean' }) || this;
    }
    BooleanSchema.prototype._validate = function (data) {
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
    };
    // Boolean-specific methods could go here
    BooleanSchema.prototype.isTrue = function () {
        return this.refine(function (data) { return data === true; }, 'Must be true');
    };
    BooleanSchema.prototype.isFalse = function () {
        return this.refine(function (data) { return data === false; }, 'Must be false');
    };
    return BooleanSchema;
}(schema_1.Schema));
exports.BooleanSchema = BooleanSchema;
// Null schema
var NullSchema = /** @class */ (function (_super) {
    __extends(NullSchema, _super);
    function NullSchema() {
        return _super.call(this, { type: 'null' }) || this;
    }
    NullSchema.prototype._validate = function (data) {
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
    };
    return NullSchema;
}(schema_1.Schema));
exports.NullSchema = NullSchema;
// Undefined schema
var UndefinedSchema = /** @class */ (function (_super) {
    __extends(UndefinedSchema, _super);
    function UndefinedSchema() {
        return _super.call(this, { type: 'undefined' }) || this;
    }
    UndefinedSchema.prototype._validate = function (data) {
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
    };
    return UndefinedSchema;
}(schema_1.Schema));
exports.UndefinedSchema = UndefinedSchema;
// Any schema
var AnySchema = /** @class */ (function (_super) {
    __extends(AnySchema, _super);
    function AnySchema() {
        return _super.call(this, { type: 'any' }) || this;
    }
    AnySchema.prototype._validate = function (data) {
        return data;
    };
    return AnySchema;
}(schema_1.Schema));
exports.AnySchema = AnySchema;
// Unknown schema
var UnknownSchema = /** @class */ (function (_super) {
    __extends(UnknownSchema, _super);
    function UnknownSchema() {
        return _super.call(this, { type: 'unknown' }) || this;
    }
    UnknownSchema.prototype._validate = function (data) {
        return data;
    };
    return UnknownSchema;
}(schema_1.Schema));
exports.UnknownSchema = UnknownSchema;
// Never schema
var NeverSchema = /** @class */ (function (_super) {
    __extends(NeverSchema, _super);
    function NeverSchema() {
        return _super.call(this, { type: 'never' }) || this;
    }
    NeverSchema.prototype._validate = function (data) {
        throw new types_1.ValidationError([{
                code: 'invalid_type',
                path: [],
                message: 'Never type - no value is valid'
            }]);
    };
    return NeverSchema;
}(schema_1.Schema));
exports.NeverSchema = NeverSchema;
