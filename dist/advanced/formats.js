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
exports.AdvancedStringSchema = exports.StringFormats = void 0;
// Advanced string format validators
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
// Extended string formats with validation patterns
exports.StringFormats = {
    // Network formats
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/,
    mac: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
    // Identifiers
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
    base64: /^[A-Za-z0-9+/]*={0,2}$/,
    hex: /^[0-9a-fA-F]+$/,
    nanoid: /^[A-Za-z0-9_-]{21}$/,
    cuid: /^c[^\s-]{8,}$/,
    cuid2: /^[a-z][a-z0-9]*$/,
    ulid: /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/,
    // Financial
    creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
    iban: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/,
    // Communication
    phone: /^\+?[1-9]\d{1,14}$/,
    // Visual
    color: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    rgb: /^rgb\(\s*(?:(?:\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*,\s*){2}(?:\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*\)$/,
    rgba: /^rgba\(\s*(?:(?:\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*,\s*){3}(?:0|1|0?\.\d+)\s*\)$/,
    // Web formats
    slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    // Date/Time extended
    iso8601: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/,
    time24: /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
    time12: /^(0?[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9] ?[AaPp][Mm]$/
};
// Custom string schema with advanced format validation
var AdvancedStringSchema = /** @class */ (function (_super) {
    __extends(AdvancedStringSchema, _super);
    function AdvancedStringSchema() {
        return _super.call(this, { type: 'advanced_string' }) || this;
    }
    AdvancedStringSchema.prototype._validate = function (data) {
        if (typeof data !== 'string') {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected string',
                    received: typeof data,
                    expected: 'string'
                }]);
        }
        // Length validation
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
        // Format validation
        if (this.format) {
            var pattern = exports.StringFormats[this.format];
            if (!pattern.test(data)) {
                throw new types_1.ValidationError([{
                        code: 'invalid_string',
                        path: [],
                        message: "String does not match ".concat(this.format, " format")
                    }]);
            }
        }
        if (this.customPattern && !this.customPattern.test(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_string',
                    path: [],
                    message: 'String does not match required pattern'
                }]);
        }
        return data;
    };
    // Length methods
    AdvancedStringSchema.prototype.min = function (length) {
        this.minLength = length;
        return this;
    };
    AdvancedStringSchema.prototype.max = function (length) {
        this.maxLength = length;
        return this;
    };
    AdvancedStringSchema.prototype.length = function (length) {
        return this.min(length).max(length);
    };
    // Advanced format methods
    AdvancedStringSchema.prototype.ipv4 = function () {
        this.format = 'ipv4';
        return this;
    };
    AdvancedStringSchema.prototype.ipv6 = function () {
        this.format = 'ipv6';
        return this;
    };
    AdvancedStringSchema.prototype.mac = function () {
        this.format = 'mac';
        return this;
    };
    AdvancedStringSchema.prototype.jwt = function () {
        this.format = 'jwt';
        return this;
    };
    AdvancedStringSchema.prototype.base64 = function () {
        this.format = 'base64';
        return this;
    };
    AdvancedStringSchema.prototype.hex = function () {
        this.format = 'hex';
        return this;
    };
    AdvancedStringSchema.prototype.email = function () {
        this.format = 'email';
        return this;
    };
    AdvancedStringSchema.prototype.uuid = function () {
        this.format = 'uuid';
        return this;
    };
    AdvancedStringSchema.prototype.creditCard = function () {
        this.format = 'creditCard';
        return this;
    };
    AdvancedStringSchema.prototype.phone = function () {
        this.format = 'phone';
        return this;
    };
    AdvancedStringSchema.prototype.color = function () {
        this.format = 'color';
        return this;
    };
    AdvancedStringSchema.prototype.slug = function () {
        this.format = 'slug';
        return this;
    };
    AdvancedStringSchema.prototype.iso8601 = function () {
        this.format = 'iso8601';
        return this;
    };
    // Custom pattern
    AdvancedStringSchema.prototype.regex = function (pattern) {
        this.customPattern = pattern;
        return this;
    };
    // Utility methods
    AdvancedStringSchema.prototype.nonempty = function () {
        return this.min(1);
    };
    AdvancedStringSchema.prototype.startsWith = function (prefix) {
        return this.refine(function (data) { return data.startsWith(prefix); }, "String must start with \"".concat(prefix, "\""));
    };
    AdvancedStringSchema.prototype.endsWith = function (suffix) {
        return this.refine(function (data) { return data.endsWith(suffix); }, "String must end with \"".concat(suffix, "\""));
    };
    AdvancedStringSchema.prototype.includes = function (substring) {
        return this.refine(function (data) { return data.includes(substring); }, "String must include \"".concat(substring, "\""));
    };
    return AdvancedStringSchema;
}(schema_1.Schema));
exports.AdvancedStringSchema = AdvancedStringSchema;
