"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringSchema = void 0;
// String schema implementation
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
class StringSchema extends schema_1.Schema {
    constructor() {
        super({ type: 'string' });
        this.formats = new Set();
        // Common string operations - Fixed to maintain method chaining
        this.transforms = [];
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
        if (this.pattern && !this.pattern.test(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_string',
                    path: [],
                    message: 'String does not match required pattern'
                }]);
        }
        // Apply string transformations (trim, toLowerCase, etc.)
        let result = data;
        for (const transform of this.transforms) {
            result = transform(result);
        }
        return result;
    }
    // Length constraints
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
    // Format validations
    email() {
        this.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.formats.add('email');
        return this;
    }
    url() {
        this.pattern = /^https?:\/\/.+/;
        this.formats.add('url');
        return this;
    }
    uuid() {
        this.pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        this.formats.add('uuid');
        return this;
    }
    regex(pattern) {
        this.pattern = pattern;
        return this;
    }
    // Extended formats
    datetime() {
        this.pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
        this.formats.add('datetime');
        return this;
    }
    date() {
        this.pattern = /^\d{4}-\d{2}-\d{2}$/;
        this.formats.add('date');
        return this;
    }
    time() {
        this.pattern = /^\d{2}:\d{2}:\d{2}$/;
        this.formats.add('time');
        return this;
    }
    ip() {
        this.pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        this.formats.add('ip');
        return this;
    }
    trim() {
        this.transforms.push((s) => s.trim());
        return this;
    }
    toLowerCase() {
        this.transforms.push((s) => s.toLowerCase());
        return this;
    }
    toUpperCase() {
        this.transforms.push((s) => s.toUpperCase());
        return this;
    }
    // Additional validations
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
exports.StringSchema = StringSchema;
//# sourceMappingURL=string.js.map