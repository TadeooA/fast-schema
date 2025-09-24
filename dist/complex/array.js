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
exports.ArraySchema = void 0;
// Array schema implementation
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
var ArraySchema = /** @class */ (function (_super) {
    __extends(ArraySchema, _super);
    function ArraySchema(itemSchema) {
        var _this = _super.call(this, { type: 'array', element: itemSchema.getSchema() }) || this;
        _this.itemSchema = itemSchema;
        return _this;
    }
    ArraySchema.prototype._validate = function (data) {
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
                    message: "Array must have at least ".concat(this.minItems, " items")
                }]);
        }
        if (this.maxItems !== undefined && data.length > this.maxItems) {
            throw new types_1.ValidationError([{
                    code: 'too_big',
                    path: [],
                    message: "Array must have at most ".concat(this.maxItems, " items")
                }]);
        }
        var result = [];
        var issues = [];
        var _loop_1 = function (i) {
            try {
                result.push(this_1.itemSchema._validate(data[i]));
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
                    error.issues.forEach(function (issue) {
                        issues.push(__assign(__assign({}, issue), { path: __spreadArray([i], issue.path, true) }));
                    });
                }
            }
        };
        var this_1 = this;
        for (var i = 0; i < data.length; i++) {
            _loop_1(i);
        }
        if (issues.length > 0) {
            throw new types_1.ValidationError(issues);
        }
        return result;
    };
    // Array-specific methods
    ArraySchema.prototype.min = function (count) {
        this.minItems = count;
        return this;
    };
    ArraySchema.prototype.max = function (count) {
        this.maxItems = count;
        return this;
    };
    ArraySchema.prototype.length = function (count) {
        return this.min(count).max(count);
    };
    ArraySchema.prototype.nonempty = function () {
        return this.min(1);
    };
    // Element access
    ArraySchema.prototype.element = function () {
        return this.itemSchema;
    };
    return ArraySchema;
}(schema_1.Schema));
exports.ArraySchema = ArraySchema;
