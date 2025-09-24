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
exports.IntersectionSchema = void 0;
// Intersection schema for combining multiple schemas
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
var IntersectionSchema = /** @class */ (function (_super) {
    __extends(IntersectionSchema, _super);
    function IntersectionSchema(schemaA, schemaB) {
        var _this = _super.call(this, {
            type: 'intersection',
            schemas: [schemaA.getSchema(), schemaB.getSchema()]
        }) || this;
        _this.schemaA = schemaA;
        _this.schemaB = schemaB;
        return _this;
    }
    IntersectionSchema.prototype._validate = function (data) {
        // Validate against both schemas
        var resultA = this.schemaA._validate(data);
        var resultB = this.schemaB._validate(data);
        // For objects, merge the results
        if (typeof resultA === 'object' && typeof resultB === 'object' &&
            resultA !== null && resultB !== null &&
            !Array.isArray(resultA) && !Array.isArray(resultB)) {
            return __assign(__assign({}, resultA), resultB);
        }
        // For primitives, both must be the same value
        if (resultA === resultB) {
            return resultA;
        }
        throw new types_1.ValidationError([{
                code: 'invalid_intersection',
                path: [],
                message: 'Values do not match for intersection type'
            }]);
    };
    // Helper method to access schemas
    IntersectionSchema.prototype.left = function () {
        return this.schemaA;
    };
    IntersectionSchema.prototype.right = function () {
        return this.schemaB;
    };
    return IntersectionSchema;
}(schema_1.Schema));
exports.IntersectionSchema = IntersectionSchema;
