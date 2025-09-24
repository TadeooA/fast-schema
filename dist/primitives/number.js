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
exports.NumberSchema = void 0;
// Number schema implementation
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
var NumberSchema = /** @class */ (function (_super) {
    __extends(NumberSchema, _super);
    function NumberSchema() {
        var _this = _super.call(this, { type: 'number' }) || this;
        _this.isInteger = false;
        _this.isFinite = false;
        return _this;
    }
    NumberSchema.prototype._validate = function (data) {
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
                    message: "Number must be at least ".concat(this.minValue)
                }]);
        }
        if (this.maxValue !== undefined && data > this.maxValue) {
            throw new types_1.ValidationError([{
                    code: 'too_big',
                    path: [],
                    message: "Number must be at most ".concat(this.maxValue)
                }]);
        }
        return data;
    };
    // Range constraints
    NumberSchema.prototype.min = function (value) {
        this.minValue = value;
        return this;
    };
    NumberSchema.prototype.max = function (value) {
        this.maxValue = value;
        return this;
    };
    // Type constraints
    NumberSchema.prototype.int = function () {
        this.isInteger = true;
        return this;
    };
    NumberSchema.prototype.finite = function () {
        this.isFinite = true;
        return this;
    };
    // Convenience methods
    NumberSchema.prototype.positive = function () {
        return this.min(0.000001);
    };
    NumberSchema.prototype.nonnegative = function () {
        return this.min(0);
    };
    NumberSchema.prototype.negative = function () {
        return this.max(-0.000001);
    };
    NumberSchema.prototype.nonpositive = function () {
        return this.max(0);
    };
    // Mathematical operations
    NumberSchema.prototype.gte = function (value) {
        return this.min(value);
    };
    NumberSchema.prototype.gt = function (value) {
        return this.min(value + Number.EPSILON);
    };
    NumberSchema.prototype.lte = function (value) {
        return this.max(value);
    };
    NumberSchema.prototype.lt = function (value) {
        return this.max(value - Number.EPSILON);
    };
    // Special number validations
    NumberSchema.prototype.multipleOf = function (value) {
        return this.refine(function (data) { return Math.abs(data % value) < Number.EPSILON; }, "Number must be a multiple of ".concat(value));
    };
    NumberSchema.prototype.step = function (value) {
        return this.multipleOf(value);
    };
    // Parsing utilities
    NumberSchema.coerce = function (data) {
        if (typeof data === 'number')
            return data;
        if (typeof data === 'string') {
            var parsed = Number(data);
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
    };
    return NumberSchema;
}(schema_1.Schema));
exports.NumberSchema = NumberSchema;
