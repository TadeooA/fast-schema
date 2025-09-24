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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionalSchema = void 0;
exports.conditional = conditional;
// Conditional schema for context-dependent validation
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
var ConditionalSchema = /** @class */ (function (_super) {
    __extends(ConditionalSchema, _super);
    function ConditionalSchema(condition, trueSchema, falseSchema) {
        var _this = _super.call(this, {
            type: 'conditional',
            condition: condition.toString(),
            trueSchema: trueSchema.getSchema(),
            falseSchema: falseSchema.getSchema()
        }) || this;
        _this.condition = condition;
        _this.trueSchema = trueSchema;
        _this.falseSchema = falseSchema;
        return _this;
    }
    ConditionalSchema.prototype._validate = function (data) {
        try {
            if (this.condition(data)) {
                return this.trueSchema._validate(data);
            }
            else {
                return this.falseSchema._validate(data);
            }
        }
        catch (error) {
            if (error instanceof types_1.ValidationError) {
                // Re-throw with conditional context
                var issues = error.issues.map(function (issue) { return (__assign(__assign({}, issue), { message: "Conditional validation failed: ".concat(issue.message) })); });
                throw new types_1.ValidationError(issues);
            }
            throw error;
        }
    };
    // Helper methods
    ConditionalSchema.prototype.getCondition = function () {
        return this.condition;
    };
    ConditionalSchema.prototype.getTrueSchema = function () {
        return this.trueSchema;
    };
    ConditionalSchema.prototype.getFalseSchema = function () {
        return this.falseSchema;
    };
    return ConditionalSchema;
}(schema_1.Schema));
exports.ConditionalSchema = ConditionalSchema;
// Utility function to create conditional schemas
function conditional(condition, trueSchema, falseSchema) {
    return new ConditionalSchema(condition, trueSchema, falseSchema);
}
