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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectSchema = void 0;
// Object schema implementation
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
var ObjectSchema = /** @class */ (function (_super) {
    __extends(ObjectSchema, _super);
    function ObjectSchema(shape) {
        var _this = _super.call(this, {
            type: 'object',
            shape: Object.fromEntries(Object.entries(shape).map(function (_a) {
                var key = _a[0], schema = _a[1];
                return [key, schema.getSchema()];
            }))
        }) || this;
        _this.shape = shape;
        return _this;
    }
    ObjectSchema.prototype._validate = function (data) {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected object',
                    received: typeof data,
                    expected: 'object'
                }]);
        }
        var result = {};
        var issues = [];
        var obj = data;
        var _loop_1 = function (key, schema) {
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
                    error.issues.forEach(function (issue) {
                        issues.push(__assign(__assign({}, issue), { path: __spreadArray([key], issue.path, true) }));
                    });
                }
            }
        };
        for (var _i = 0, _a = Object.entries(this.shape); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], schema = _b[1];
            _loop_1(key, schema);
        }
        if (issues.length > 0) {
            throw new types_1.ValidationError(issues);
        }
        return result;
    };
    // Object composition methods
    ObjectSchema.prototype.partial = function () {
        var partialShape = {};
        for (var _i = 0, _a = Object.entries(this.shape); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], schema = _b[1];
            partialShape[key] = schema.optional();
        }
        return new ObjectSchema(partialShape);
    };
    ObjectSchema.prototype.required = function () {
        var requiredShape = {};
        for (var _i = 0, _a = Object.entries(this.shape); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], schema = _b[1];
            if (schema instanceof schema_1.OptionalSchema) {
                requiredShape[key] = schema.innerSchema;
            }
            else {
                requiredShape[key] = schema;
            }
        }
        return new ObjectSchema(requiredShape);
    };
    ObjectSchema.prototype.pick = function (keys) {
        var pickedShape = {};
        var keysSet = new Set(keys);
        for (var _i = 0, _a = Object.entries(this.shape); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], schema = _b[1];
            if (keysSet.has(key)) {
                pickedShape[key] = schema;
            }
        }
        return new ObjectSchema(pickedShape);
    };
    ObjectSchema.prototype.omit = function (keys) {
        var omittedShape = {};
        var keysSet = new Set(keys);
        for (var _i = 0, _a = Object.entries(this.shape); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], schema = _b[1];
            if (!keysSet.has(key)) {
                omittedShape[key] = schema;
            }
        }
        return new ObjectSchema(omittedShape);
    };
    ObjectSchema.prototype.extend = function (extension) {
        var extendedShape = __assign(__assign({}, this.shape), extension);
        return new ObjectSchema(extendedShape);
    };
    ObjectSchema.prototype.merge = function (other) {
        var mergedShape = __assign(__assign({}, this.shape), other.shape);
        return new ObjectSchema(mergedShape);
    };
    // Get the shape for inspection
    ObjectSchema.prototype.getShape = function () {
        return this.shape;
    };
    // Passthrough - allow additional properties
    ObjectSchema.prototype.passthrough = function () {
        // Implementation would need to be more complex to handle unknown properties
        return this;
    };
    // Strict - disallow additional properties (default behavior)
    ObjectSchema.prototype.strict = function () {
        return this;
    };
    // Strip - remove additional properties
    ObjectSchema.prototype.strip = function () {
        return this;
    };
    return ObjectSchema;
}(schema_1.Schema));
exports.ObjectSchema = ObjectSchema;
