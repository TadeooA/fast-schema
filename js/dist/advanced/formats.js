"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedStringSchema = exports.StringFormats = void 0;
// Advanced string format validators
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
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
class AdvancedStringSchema extends schema_1.Schema {
    constructor() {
        super({ type: 'advanced_string' });
    }
    _validate(data) {
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
                    message: `String must be at least ${this.minLength} characters`
                }]);
        }
        if (this.maxLength !== undefined && data.length > this.maxLength) {
            throw new types_1.ValidationError([{
                    code: 'too_big',
                    path: [],
                    message: `String must be at most ${this.maxLength} characters`
                }]);
        }
        // Format validation
        if (this.format) {
            const pattern = exports.StringFormats[this.format];
            if (!pattern.test(data)) {
                throw new types_1.ValidationError([{
                        code: 'invalid_string',
                        path: [],
                        message: `String does not match ${this.format} format`
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
    }
    // Length methods
    min(length) {
        this.minLength = length;
        return this;
    }
    max(length) {
        this.maxLength = length;
        return this;
    }
    length(length) {
        return this.min(length).max(length);
    }
    // Advanced format methods
    ipv4() {
        this.format = 'ipv4';
        return this;
    }
    ipv6() {
        this.format = 'ipv6';
        return this;
    }
    mac() {
        this.format = 'mac';
        return this;
    }
    jwt() {
        this.format = 'jwt';
        return this;
    }
    base64() {
        this.format = 'base64';
        return this;
    }
    hex() {
        this.format = 'hex';
        return this;
    }
    email() {
        this.format = 'email';
        return this;
    }
    uuid() {
        this.format = 'uuid';
        return this;
    }
    creditCard() {
        this.format = 'creditCard';
        return this;
    }
    phone() {
        this.format = 'phone';
        return this;
    }
    color() {
        this.format = 'color';
        return this;
    }
    slug() {
        this.format = 'slug';
        return this;
    }
    iso8601() {
        this.format = 'iso8601';
        return this;
    }
    // Custom pattern
    regex(pattern) {
        this.customPattern = pattern;
        return this;
    }
    // Utility methods
    nonempty() {
        return this.min(1);
    }
    startsWith(prefix) {
        return this.refine((data) => data.startsWith(prefix), `String must start with "${prefix}"`);
    }
    endsWith(suffix) {
        return this.refine((data) => data.endsWith(suffix), `String must end with "${suffix}"`);
    }
    includes(substring) {
        return this.refine((data) => data.includes(substring), `String must include "${substring}"`);
    }
}
exports.AdvancedStringSchema = AdvancedStringSchema;
//# sourceMappingURL=formats.js.map