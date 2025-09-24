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
exports.RecordSchema = void 0;
// Record schema implementation
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
var RecordSchema = /** @class */ (function (_super) {
    __extends(RecordSchema, _super);
    function RecordSchema(valueSchema) {
        var _this = _super.call(this, {
            type: 'record',
            valueType: valueSchema.getSchema()
        }) || this;
        _this.valueSchema = valueSchema;
        return _this;
    }
    RecordSchema.prototype._validate = function (data) {
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
                    message: "Expected object, received ".concat(typeof data)
                }]);
        }
        var result = {};
        var issues = [];
        var _loop_1 = function (key, value) {
            try {
                result[key] = this_1.valueSchema._validate(value);
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
                    error.issues.forEach(function (issue) {
                        issues.push(__assign(__assign({}, issue), { path: __spreadArray([key], issue.path, true) }));
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
        };
        var this_1 = this;
        for (var _i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            _loop_1(key, value);
        }
        if (issues.length > 0) {
            throw new types_1.ValidationError(issues);
        }
        return result;
    };
    return RecordSchema;
}(schema_1.Schema));
exports.RecordSchema = RecordSchema;
