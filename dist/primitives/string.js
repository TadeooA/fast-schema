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
exports.StringSchema = void 0;
// String schema implementation
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
var StringSchema = /** @class */ (function (_super) {
    __extends(StringSchema, _super);
    function StringSchema() {
        var _this = _super.call(this, { type: 'string' }) || this;
        _this.formats = new Set();
        return _this;
    }
    StringSchema.prototype._validate = function (data) {
        if (typeof data !== 'string') {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected string',
                    received: typeof data,
                    expected: 'string'
                }]);
        }
        if (this.minLength !== undefined && data.length < this.minLength) {
            throw new types_1.ValidationError([{
                    code: 'too_small',
                    path: [],
                    message: "String must be at least ".concat(this.minLength, " characters")
                }]);
        }
        if (this.maxLength !== undefined && data.length > this.maxLength) {
            throw new types_1.ValidationError([{
                    code: 'too_big',
                    path: [],
                    message: "String must be at most ".concat(this.maxLength, " characters")
                }]);
        }
        // Apply string transformations (trim, toLowerCase, etc.) FIRST
        var result = data;
        if (this.transforms) {
            for (var i = 0; i < this.transforms.length; i++) {
                result = this.transforms[i](result);
            }
        }

        // Then validate pattern on the transformed result
        if (this.pattern && !this.pattern.test(result)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_string',
                    path: [],
                    message: 'String does not match required pattern'
                }]);
        }

        return result;
    };
    // Length constraints
    StringSchema.prototype.min = function (length) {
        this.minLength = length;
        return this;
    };
    StringSchema.prototype.max = function (length) {
        this.maxLength = length;
        return this;
    };
    StringSchema.prototype.length = function (length) {
        return this.min(length).max(length);
    };
    // Format validations
    StringSchema.prototype.email = function () {
        this.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.formats.add('email');
        return this;
    };
    StringSchema.prototype.url = function () {
        this.pattern = /^https?:\/\/.+/;
        this.formats.add('url');
        return this;
    };
    StringSchema.prototype.uuid = function () {
        this.pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        this.formats.add('uuid');
        return this;
    };
    StringSchema.prototype.regex = function (pattern) {
        this.pattern = pattern;
        return this;
    };
    // Extended formats
    StringSchema.prototype.datetime = function () {
        this.pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
        this.formats.add('datetime');
        return this;
    };
    StringSchema.prototype.date = function () {
        this.pattern = /^\d{4}-\d{2}-\d{2}$/;
        this.formats.add('date');
        return this;
    };
    StringSchema.prototype.time = function () {
        this.pattern = /^\d{2}:\d{2}:\d{2}$/;
        this.formats.add('time');
        return this;
    };
    StringSchema.prototype.ip = function () {
        this.pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        this.formats.add('ip');
        return this;
    };
    // Common string operations - Fixed to maintain method chaining
    StringSchema.prototype.trim = function () {
        if (!this.transforms) this.transforms = [];
        this.transforms.push(function (s) { return s.trim(); });
        return this;
    };
    StringSchema.prototype.toLowerCase = function () {
        if (!this.transforms) this.transforms = [];
        this.transforms.push(function (s) { return s.toLowerCase(); });
        return this;
    };
    StringSchema.prototype.toUpperCase = function () {
        if (!this.transforms) this.transforms = [];
        this.transforms.push(function (s) { return s.toUpperCase(); });
        return this;
    };
    // Additional validations
    StringSchema.prototype.nonempty = function () {
        return this.min(1);
    };
    StringSchema.prototype.startsWith = function (prefix) {
        return this.refine(function (data) { return data.startsWith(prefix); }, "String must start with \"".concat(prefix, "\""));
    };
    StringSchema.prototype.endsWith = function (suffix) {
        return this.refine(function (data) { return data.endsWith(suffix); }, "String must end with \"".concat(suffix, "\""));
    };
    StringSchema.prototype.includes = function (substring) {
        return this.refine(function (data) { return data.includes(substring); }, "String must include \"".concat(substring, "\""));
    };
    return StringSchema;
}(schema_1.Schema));
exports.StringSchema = StringSchema;
