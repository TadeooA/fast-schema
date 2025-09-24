"use strict";
// Core validation engine - Clean API without external references
// Fast-Schema's own validation system with modern TypeScript design
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextualValidator = exports.ValidationErrorWithContext = exports.VersionedSchema = exports.SchemaSerializer = exports.IntrospectableSchema = exports.DynamicSchema = exports.CustomValidationSchema = exports.ConditionalSchema = exports.globalDebounceManager = exports.ValidationDebounceManager = exports.DebouncedAsyncFunction = exports.globalValidationMonitor = exports.ValidationMonitor = exports.BatchValidator = exports.AsyncRefinementSchema = exports.TransformSchema = exports.RefinementSchema = exports.NullishSchema = exports.NullableSchema = exports.OptionalSchema = exports.IntersectionSchema = exports.UnionSchema = exports.ObjectSchema = exports.ArraySchema = exports.BooleanSchema = exports.NumberSchema = exports.StringSchema = exports.Schema = exports.ValidationError = exports.ValidationEventEmitter = void 0;
exports.createDebouncedValidator = createDebouncedValidator;
exports.debounceAsyncFunction = debounceAsyncFunction;
exports.createConditionalSchema = createConditionalSchema;
exports.createCustomValidator = createCustomValidator;
exports.createDynamicSchema = createDynamicSchema;
exports.introspect = introspect;
exports.createVersionedSchema = createVersionedSchema;
const fast_schema_1 = __importDefault(require("../pkg/fast_schema"));
// Event emitter for validation events
class ValidationEventEmitter {
    constructor() {
        this.listeners = new Map();
        this.enabled = true;
    }
    on(eventType, listener) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(listener);
        return this;
    }
    off(eventType, listener) {
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
        return this;
    }
    once(eventType, listener) {
        const onceListener = (event) => {
            this.off(eventType, onceListener);
            listener(event);
        };
        return this.on(eventType, onceListener);
    }
    // Emit event
    emit(event) {
        if (!this.enabled)
            return;
        // Emit to specific listeners
        const specificListeners = this.listeners.get(event.type);
        if (specificListeners) {
            for (const listener of specificListeners) {
                try {
                    listener(event);
                }
                catch (error) {
                    console.warn('Error in validation event listener:', error);
                }
            }
        }
        // Emit to wildcard listeners
        const wildcardListeners = this.listeners.get('*');
        if (wildcardListeners) {
            for (const listener of wildcardListeners) {
                try {
                    listener(event);
                }
                catch (error) {
                    console.warn('Error in validation event listener:', error);
                }
            }
        }
    }
    // Remove all listeners
    removeAllListeners(eventType) {
        if (eventType) {
            this.listeners.delete(eventType);
        }
        else {
            this.listeners.clear();
        }
        return this;
    }
    // Get listener count
    listenerCount(eventType) {
        return this.listeners.get(eventType)?.length || 0;
    }
    // Enable/disable event emission
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    isEnabled() {
        return this.enabled;
    }
    // Get all event types with listeners
    getEventTypes() {
        return Array.from(this.listeners.keys());
    }
}
exports.ValidationEventEmitter = ValidationEventEmitter;
// Validation error class - Fast-Schema's clean error handling
class ValidationError extends Error {
    constructor(issues) {
        const message = issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
        super(`Validation failed: ${message}`);
        this.name = 'ValidationError';
        this.issues = issues;
    }
    format() {
        const formatted = { _errors: [] };
        for (const issue of this.issues) {
            let current = formatted;
            for (let i = 0; i < issue.path.length; i++) {
                const key = issue.path[i];
                if (i === issue.path.length - 1) {
                    if (!current[key])
                        current[key] = { _errors: [] };
                    current[key]._errors.push(issue.message);
                }
                else {
                    if (!current[key])
                        current[key] = { _errors: [] };
                    current = current[key];
                }
            }
            if (issue.path.length === 0) {
                formatted._errors.push(issue.message);
            }
        }
        return formatted;
    }
    flatten() {
        const fieldErrors = {};
        const formErrors = [];
        for (const issue of this.issues) {
            if (issue.path.length === 0) {
                formErrors.push(issue.message);
            }
            else {
                const key = issue.path.join('.');
                if (!fieldErrors[key])
                    fieldErrors[key] = [];
                fieldErrors[key].push(issue.message);
            }
        }
        return { fieldErrors, formErrors };
    }
}
exports.ValidationError = ValidationError;
// Base schema class
class Schema {
    constructor(schemaType) {
        this.validationCount = 0;
        this.performanceStats = {
            totalTime: 0,
            avgTime: 0,
            minTime: Infinity,
            maxTime: 0,
            cacheHits: 0
        };
        this.schemaType = schemaType;
        this.eventEmitter = new ValidationEventEmitter();
        this.instanceId = `schema_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Core validation methods - Fast-Schema API
    parse(data) {
        const result = this.safeParse(data);
        if (!result.success) {
            throw result.error;
        }
        return result.data;
    }
    safeParse(data) {
        const startTime = performance.now();
        this.validationCount++;
        // JIT optimization: compile validator after 10 uses
        if (this.validationCount === 10 && !this.compiledValidator) {
            this.compileValidator();
        }
        // Emit validation start event
        this.emitEvent({
            type: 'validation:start',
            schemaType: this.schemaType.type || 'unknown',
            data,
            timestamp: startTime,
            id: this.instanceId,
            async: false
        });
        exports.globalValidationMonitor.emit({
            type: 'validation:start',
            schemaType: this.schemaType.type || 'unknown',
            data,
            timestamp: startTime,
            id: this.instanceId,
            async: false
        });
        try {
            // Use compiled validator if available
            const validated = this.compiledValidator ? this.compiledValidator(data) : this._validate(data);
            const duration = performance.now() - startTime;
            // Update performance stats
            this.updatePerformanceStats(duration);
            // Emit performance metric
            this.emitPerformance('validation_duration', duration, 'ms');
            // Emit success event
            const successEvent = {
                type: 'validation:success',
                schemaType: this.schemaType.type || 'unknown',
                data,
                timestamp: startTime,
                id: this.instanceId,
                async: false,
                result: validated,
                duration
            };
            this.emitEvent(successEvent);
            exports.globalValidationMonitor.emit(successEvent);
            return { success: true, data: validated };
        }
        catch (error) {
            const duration = performance.now() - startTime;
            this.updatePerformanceStats(duration);
            const validationError = error instanceof ValidationError
                ? error
                : new ValidationError([{
                        code: 'custom',
                        path: [],
                        message: error instanceof Error ? error.message : 'Validation failed'
                    }]);
            // Emit error event
            const errorEvent = {
                type: 'validation:error',
                schemaType: this.schemaType.type || 'unknown',
                data,
                timestamp: startTime,
                id: this.instanceId,
                async: false,
                error: validationError,
                duration
            };
            this.emitEvent(errorEvent);
            exports.globalValidationMonitor.emit(errorEvent);
            return { success: false, error: validationError };
        }
    }
    // Async parsing methods with real async support
    async parseAsync(data, options) {
        const result = await this.safeParseAsync(data, options);
        if (!result.success) {
            throw result.error;
        }
        return result.data;
    }
    async safeParseAsync(data, options) {
        const startTime = Date.now();
        // Emit async validation start event
        this.emitEvent({
            type: 'validation:start',
            schemaType: this.schemaType.type || 'unknown',
            data,
            timestamp: startTime,
            id: this.instanceId,
            async: true
        });
        exports.globalValidationMonitor.emit({
            type: 'validation:start',
            schemaType: this.schemaType.type || 'unknown',
            data,
            timestamp: startTime,
            id: this.instanceId,
            async: true
        });
        try {
            const validated = await this._validateAsync(data, options);
            const duration = Date.now() - startTime;
            // Emit success event
            const successEvent = {
                type: 'validation:success',
                schemaType: this.schemaType.type || 'unknown',
                data,
                timestamp: startTime,
                id: this.instanceId,
                async: true,
                result: validated,
                duration
            };
            this.emitEvent(successEvent);
            exports.globalValidationMonitor.emit(successEvent);
            return { success: true, data: validated };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const validationError = error instanceof ValidationError
                ? error
                : new ValidationError([{
                        code: 'custom',
                        path: [],
                        message: error instanceof Error ? error.message : 'Async validation failed'
                    }]);
            // Emit error event
            const errorEvent = {
                type: 'validation:error',
                schemaType: this.schemaType.type || 'unknown',
                data,
                timestamp: startTime,
                id: this.instanceId,
                async: true,
                error: validationError,
                duration
            };
            this.emitEvent(errorEvent);
            exports.globalValidationMonitor.emit(errorEvent);
            return { success: false, error: validationError };
        }
    }
    // Schema modification methods
    optional() {
        return new OptionalSchema(this);
    }
    nullable() {
        return new NullableSchema(this);
    }
    nullish() {
        return new NullishSchema(this);
    }
    array() {
        return new ArraySchema(this);
    }
    // Union and intersection methods
    or(schema) {
        return new UnionSchema([this, schema]);
    }
    and(schema) {
        return new IntersectionSchema(this, schema);
    }
    // Refinement methods
    refine(predicate, message) {
        return new RefinementSchema(this, predicate, message);
    }
    superRefine(predicate, message) {
        return new RefinementSchema(this, predicate, message);
    }
    // Async refinement methods
    refineAsync(predicate, config) {
        const finalConfig = typeof config === 'string'
            ? { message: config }
            : (config || {});
        return new AsyncRefinementSchema(this, predicate, finalConfig);
    }
    superRefineAsync(predicate, config) {
        const finalConfig = typeof config === 'string'
            ? { message: config }
            : (config || {});
        return new AsyncRefinementSchema(this, predicate, finalConfig);
    }
    // Transform method
    transform(transformer) {
        return new TransformSchema(this, transformer);
    }
    // Custom validation function
    custom(validator, message) {
        return new RefinementSchema(this, (data) => {
            const result = validator(data);
            return typeof result === 'boolean' ? result : false;
        }, message);
    }
    // Internal async validation method - default implementation calls sync version
    async _validateAsync(data, options) {
        return this._validate(data);
    }
    on(eventType, listener) {
        this.eventEmitter.on(eventType, listener);
        return this;
    }
    off(eventType, listener) {
        this.eventEmitter.off(eventType, listener);
        return this;
    }
    once(eventType, listener) {
        this.eventEmitter.once(eventType, listener);
        return this;
    }
    removeAllListeners(eventType) {
        this.eventEmitter.removeAllListeners(eventType);
        return this;
    }
    emitEvent(event) {
        this.eventEmitter.emit(event);
    }
    // Performance and debugging helpers
    emitPerformance(metric, value, unit, context) {
        this.emitEvent({
            type: 'performance',
            schemaType: this.schemaType.type || 'unknown',
            data: null,
            timestamp: Date.now(),
            id: this.instanceId,
            context,
            metric,
            value,
            unit
        });
    }
    emitDebug(level, message, details, context) {
        this.emitEvent({
            type: 'debug',
            schemaType: this.schemaType.type || 'unknown',
            data: null,
            timestamp: Date.now(),
            id: this.instanceId,
            context,
            level,
            message,
            details
        });
    }
    // Get instance information
    getInstanceId() {
        return this.instanceId;
    }
    getEventEmitter() {
        return this.eventEmitter;
    }
    // Performance and optimization methods
    updatePerformanceStats(duration) {
        this.performanceStats.totalTime += duration;
        this.performanceStats.avgTime = this.performanceStats.totalTime / this.validationCount;
        this.performanceStats.minTime = Math.min(this.performanceStats.minTime, duration);
        this.performanceStats.maxTime = Math.max(this.performanceStats.maxTime, duration);
    }
    compileValidator() {
        try {
            // Generate optimized validation function for this schema
            const validationCode = this.generateValidationCode();
            this.compiledValidator = new Function('data', 'ValidationError', validationCode);
            this.emitDebug('info', 'JIT compilation completed', {
                schemaType: this.schemaType.type,
                validationCount: this.validationCount
            });
        }
        catch (error) {
            this.emitDebug('warn', 'JIT compilation failed, falling back to standard validation', { error });
        }
    }
    generateValidationCode() {
        // This is a simplified example - real implementation would be much more sophisticated
        const schemaType = this.schemaType.type;
        switch (schemaType) {
            case 'string':
                return this.generateStringValidationCode();
            case 'number':
                return this.generateNumberValidationCode();
            case 'boolean':
                return `
          if (typeof data !== 'boolean') {
            throw new ValidationError([{
              code: 'invalid_type',
              path: [],
              message: 'Expected boolean, received ' + typeof data,
              received: typeof data,
              expected: 'boolean'
            }]);
          }
          return data;
        `;
            default:
                // Fallback to standard validation
                throw new Error('Cannot compile this schema type');
        }
    }
    generateStringValidationCode() {
        const schema = this.schemaType;
        let code = `
      if (typeof data !== 'string') {
        throw new ValidationError([{
          code: 'invalid_type',
          path: [],
          message: 'Expected string, received ' + typeof data,
          received: typeof data,
          expected: 'string'
        }]);
      }
    `;
        if (schema.minLength !== undefined) {
            code += `
        if (data.length < ${schema.minLength}) {
          throw new ValidationError([{
            code: 'too_small',
            path: [],
            message: 'String must be at least ${schema.minLength} characters',
            minimum: ${schema.minLength}
          }]);
        }
      `;
        }
        if (schema.maxLength !== undefined) {
            code += `
        if (data.length > ${schema.maxLength}) {
          throw new ValidationError([{
            code: 'too_big',
            path: [],
            message: 'String must be at most ${schema.maxLength} characters',
            maximum: ${schema.maxLength}
          }]);
        }
      `;
        }
        code += 'return data;';
        return code;
    }
    generateNumberValidationCode() {
        const schema = this.schemaType;
        let code = `
      if (typeof data !== 'number' || isNaN(data)) {
        throw new ValidationError([{
          code: 'invalid_type',
          path: [],
          message: 'Expected number, received ' + typeof data,
          received: typeof data,
          expected: 'number'
        }]);
      }
    `;
        if (schema.min !== undefined) {
            code += `
        if (data < ${schema.min}) {
          throw new ValidationError([{
            code: 'too_small',
            path: [],
            message: 'Number must be greater than or equal to ${schema.min}',
            minimum: ${schema.min}
          }]);
        }
      `;
        }
        if (schema.max !== undefined) {
            code += `
        if (data > ${schema.max}) {
          throw new ValidationError([{
            code: 'too_big',
            path: [],
            message: 'Number must be less than or equal to ${schema.max}',
            maximum: ${schema.max}
          }]);
        }
      `;
        }
        code += 'return data;';
        return code;
    }
    // Performance monitoring methods
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            validationCount: this.validationCount,
            isCompiled: !!this.compiledValidator
        };
    }
    resetPerformanceStats() {
        this.validationCount = 0;
        this.performanceStats = {
            totalTime: 0,
            avgTime: 0,
            minTime: Infinity,
            maxTime: 0,
            cacheHits: 0
        };
    }
    // Force JIT compilation
    compile() {
        this.compileValidator();
        return this;
    }
    // Get the internal schema representation
    getSchema() {
        return this.schemaType;
    }
}
exports.Schema = Schema;
// String schema implementation
class StringSchema extends Schema {
    constructor() {
        super({ type: 'string' });
    }
    _validate(data) {
        if (typeof data !== 'string') {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected string, received ' + typeof data,
                    received: typeof data,
                    expected: 'string'
                }]);
        }
        // Apply all validations from schema
        const issues = [];
        if (this.schemaType.minLength !== undefined && data.length < this.schemaType.minLength) {
            issues.push({
                code: 'too_small',
                path: [],
                message: `String must contain at least ${this.schemaType.minLength} character(s)`
            });
        }
        if (this.schemaType.maxLength !== undefined && data.length > this.schemaType.maxLength) {
            issues.push({
                code: 'too_big',
                path: [],
                message: `String must contain at most ${this.schemaType.maxLength} character(s)`
            });
        }
        if (this.schemaType.pattern && !new RegExp(this.schemaType.pattern).test(data)) {
            issues.push({
                code: 'invalid_string',
                path: [],
                message: this.schemaType.customMessage || 'Invalid'
            });
        }
        if (this.schemaType.format) {
            switch (this.schemaType.format) {
                case 'email':
                    if (!isValidEmail(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid email'
                        });
                    }
                    break;
                case 'url':
                    if (!isValidUrl(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid url'
                        });
                    }
                    break;
                case 'uuid':
                    if (!isValidUuid(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid uuid'
                        });
                    }
                    break;
                case 'ipv4':
                    if (!isValidIPv4(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid IPv4 address'
                        });
                    }
                    break;
                case 'ipv6':
                    if (!isValidIPv6(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid IPv6 address'
                        });
                    }
                    break;
                case 'phone':
                    if (!isValidPhone(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid phone number'
                        });
                    }
                    break;
                case 'jwt':
                    if (!isValidJWT(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid JWT token'
                        });
                    }
                    break;
                case 'base64':
                    if (!isValidBase64(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid base64 string'
                        });
                    }
                    break;
                case 'hex':
                    if (!isValidHex(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid hexadecimal string'
                        });
                    }
                    break;
                case 'creditCard':
                    if (!isValidCreditCard(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid credit card number'
                        });
                    }
                    break;
                case 'macAddress':
                    if (!isValidMacAddress(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid MAC address'
                        });
                    }
                    break;
                case 'color':
                    if (!isValidColor(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid color format'
                        });
                    }
                    break;
                case 'slug':
                    if (!isValidSlug(data)) {
                        issues.push({
                            code: 'invalid_string',
                            path: [],
                            message: 'Invalid URL slug'
                        });
                    }
                    break;
            }
        }
        if (issues.length > 0) {
            throw new ValidationError(issues);
        }
        return data;
    }
    min(length) {
        this.schemaType.minLength = length;
        return this;
    }
    max(length) {
        this.schemaType.maxLength = length;
        return this;
    }
    length(exactLength) {
        this.schemaType.minLength = exactLength;
        this.schemaType.maxLength = exactLength;
        return this;
    }
    email() {
        this.schemaType.format = 'email';
        return this;
    }
    url() {
        this.schemaType.format = 'url';
        return this;
    }
    uuid() {
        this.schemaType.format = 'uuid';
        return this;
    }
    datetime() {
        this.schemaType.format = 'date-time';
        return this;
    }
    // Additional string formats
    ip() {
        this.schemaType.format = 'ipv4';
        return this;
    }
    ipv4() {
        this.schemaType.format = 'ipv4';
        return this;
    }
    ipv6() {
        this.schemaType.format = 'ipv6';
        return this;
    }
    phone() {
        this.schemaType.format = 'phone';
        return this;
    }
    jwt() {
        this.schemaType.format = 'jwt';
        return this;
    }
    base64() {
        this.schemaType.format = 'base64';
        return this;
    }
    hex() {
        this.schemaType.format = 'hex';
        return this;
    }
    creditCard() {
        this.schemaType.format = 'creditCard';
        return this;
    }
    macAddress() {
        this.schemaType.format = 'macAddress';
        return this;
    }
    color() {
        this.schemaType.format = 'color';
        return this;
    }
    slug() {
        this.schemaType.format = 'slug';
        return this;
    }
    date() {
        this.schemaType.format = 'date';
        return this;
    }
    time() {
        this.schemaType.format = 'time';
        return this;
    }
    duration() {
        this.schemaType.format = 'duration';
        return this;
    }
    base64() {
        this.schemaType.format = 'base64';
        return this;
    }
    jwt() {
        this.schemaType.format = 'jwt';
        return this;
    }
    nanoid() {
        this.schemaType.format = 'nanoid';
        return this;
    }
    cuid() {
        this.schemaType.format = 'cuid';
        return this;
    }
    cssColor() {
        this.schemaType.format = 'css-color';
        return this;
    }
    cssSelector() {
        this.schemaType.format = 'css-selector';
        return this;
    }
    htmlId() {
        this.schemaType.format = 'html-id';
        return this;
    }
    className() {
        this.schemaType.format = 'className';
        return this;
    }
    phoneNumber() {
        this.schemaType.format = 'phone-number';
        return this;
    }
    postalCode() {
        this.schemaType.format = 'postal-code';
        return this;
    }
    latitude() {
        this.schemaType.format = 'latitude';
        return this;
    }
    longitude() {
        this.schemaType.format = 'longitude';
        return this;
    }
    country() {
        this.schemaType.format = 'country';
        return this;
    }
    language() {
        this.schemaType.format = 'language';
        return this;
    }
    timezone() {
        this.schemaType.format = 'timezone';
        return this;
    }
    mimeType() {
        this.schemaType.format = 'mime-type';
        return this;
    }
    regex(pattern, message) {
        this.schemaType.pattern = pattern.source;
        if (message)
            this.schemaType.customMessage = message;
        return this;
    }
    startsWith(prefix) {
        this.schemaType.pattern = `^${escapeRegex(prefix)}`;
        this.schemaType.customMessage = `String must start with "${prefix}"`;
        return this;
    }
    endsWith(suffix) {
        this.schemaType.pattern = `${escapeRegex(suffix)}$`;
        this.schemaType.customMessage = `String must end with "${suffix}"`;
        return this;
    }
    includes(substring) {
        this.schemaType.pattern = escapeRegex(substring);
        this.schemaType.customMessage = `String must include "${substring}"`;
        return this;
    }
}
exports.StringSchema = StringSchema;
// Number schema implementation
class NumberSchema extends Schema {
    constructor() {
        super({ type: 'number' });
    }
    _validate(data) {
        if (typeof data !== 'number' || isNaN(data)) {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected number, received ' + typeof data,
                    received: typeof data,
                    expected: 'number'
                }]);
        }
        const issues = [];
        if (this.schemaType.min !== undefined && data < this.schemaType.min) {
            issues.push({
                code: 'too_small',
                path: [],
                message: `Number must be greater than or equal to ${this.schemaType.min}`
            });
        }
        if (this.schemaType.max !== undefined && data > this.schemaType.max) {
            issues.push({
                code: 'too_big',
                path: [],
                message: `Number must be less than or equal to ${this.schemaType.max}`
            });
        }
        if (this.schemaType.integer && !Number.isInteger(data)) {
            issues.push({
                code: 'invalid_type',
                path: [],
                message: 'Expected integer, received float'
            });
        }
        if (issues.length > 0) {
            throw new ValidationError(issues);
        }
        return data;
    }
    min(value) {
        this.schemaType.min = value;
        return this;
    }
    max(value) {
        this.schemaType.max = value;
        return this;
    }
    int() {
        this.schemaType.integer = true;
        return this;
    }
    positive() {
        this.schemaType.min = 0.0000001;
        return this;
    }
    negative() {
        this.schemaType.max = -0.0000001;
        return this;
    }
    nonnegative() {
        this.schemaType.min = 0;
        return this;
    }
    nonpositive() {
        this.schemaType.max = 0;
        return this;
    }
}
exports.NumberSchema = NumberSchema;
// Boolean schema implementation
class BooleanSchema extends Schema {
    constructor() {
        super({ type: 'boolean' });
    }
    _validate(data) {
        if (typeof data !== 'boolean') {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected boolean, received ' + typeof data,
                    received: typeof data,
                    expected: 'boolean'
                }]);
        }
        return data;
    }
}
exports.BooleanSchema = BooleanSchema;
// Array schema implementation
class ArraySchema extends Schema {
    constructor(itemSchema) {
        super({ type: 'array', items: itemSchema.getSchema() });
        this.itemSchema = itemSchema;
    }
    _validate(data) {
        if (!Array.isArray(data)) {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected array, received ' + typeof data,
                    received: typeof data,
                    expected: 'array'
                }]);
        }
        const issues = [];
        if (this.schemaType.minItems !== undefined && data.length < this.schemaType.minItems) {
            issues.push({
                code: 'too_small',
                path: [],
                message: `Array must contain at least ${this.schemaType.minItems} element(s)`
            });
        }
        if (this.schemaType.maxItems !== undefined && data.length > this.schemaType.maxItems) {
            issues.push({
                code: 'too_big',
                path: [],
                message: `Array must contain at most ${this.schemaType.maxItems} element(s)`
            });
        }
        const result = [];
        for (let i = 0; i < data.length; i++) {
            try {
                result.push(this.itemSchema._validate(data[i]));
            }
            catch (error) {
                if (error instanceof ValidationError) {
                    for (const issue of error.issues) {
                        issues.push({
                            ...issue,
                            path: [i, ...issue.path]
                        });
                    }
                }
            }
        }
        if (issues.length > 0) {
            throw new ValidationError(issues);
        }
        return result;
    }
    min(items) {
        this.schemaType.minItems = items;
        return this;
    }
    max(items) {
        this.schemaType.maxItems = items;
        return this;
    }
    length(exactLength) {
        this.schemaType.minItems = exactLength;
        this.schemaType.maxItems = exactLength;
        return this;
    }
    nonempty() {
        this.schemaType.minItems = 1;
        return this;
    }
}
exports.ArraySchema = ArraySchema;
// Object schema implementation
class ObjectSchema extends Schema {
    constructor(shape) {
        const properties = {};
        const required = [];
        for (const [key, schema] of Object.entries(shape)) {
            properties[key] = schema.getSchema();
            required.push(key);
        }
        super({
            type: 'object',
            properties,
            required,
            additionalProperties: false
        });
        this.shape = shape;
    }
    _validate(data) {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            throw new ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected object, received ' + typeof data,
                    received: typeof data,
                    expected: 'object'
                }]);
        }
        const issues = [];
        const result = {};
        const inputData = data;
        // Check for unrecognized keys if strict mode
        if (!this.schemaType.additionalProperties) {
            const allowedKeys = new Set(Object.keys(this.shape));
            for (const key of Object.keys(inputData)) {
                if (!allowedKeys.has(key)) {
                    issues.push({
                        code: 'unrecognized_keys',
                        path: [key],
                        message: `Unrecognized key(s) in object: '${key}'`
                    });
                }
            }
        }
        // Validate each property
        for (const [key, schema] of Object.entries(this.shape)) {
            if (!(key in inputData)) {
                if (this.schemaType.required.includes(key)) {
                    issues.push({
                        code: 'invalid_type',
                        path: [key],
                        message: 'Required'
                    });
                }
                continue;
            }
            try {
                result[key] = schema._validate(inputData[key]);
            }
            catch (error) {
                if (error instanceof ValidationError) {
                    for (const issue of error.issues) {
                        issues.push({
                            ...issue,
                            path: [key, ...issue.path]
                        });
                    }
                }
            }
        }
        if (issues.length > 0) {
            throw new ValidationError(issues);
        }
        return result;
    }
    strict() {
        this.schemaType.additionalProperties = false;
        return this;
    }
    passthrough() {
        this.schemaType.additionalProperties = true;
        return this;
    }
    partial() {
        const partialShape = {};
        for (const [key, schema] of Object.entries(this.shape)) {
            partialShape[key] = schema.optional();
        }
        return new ObjectSchema(partialShape);
    }
    // Extend schema with additional properties
    extend(extension) {
        const extendedShape = { ...this.shape, ...extension };
        return new ObjectSchema(extendedShape);
    }
    // Pick specific properties from schema
    pick(keys) {
        const pickedShape = {};
        for (const key of keys) {
            if (key in this.shape) {
                pickedShape[key] = this.shape[key];
            }
        }
        return new ObjectSchema(pickedShape);
    }
    // Omit specific properties from schema
    omit(keys) {
        const omittedShape = {};
        const keysSet = new Set(keys);
        for (const [key, schema] of Object.entries(this.shape)) {
            if (!keysSet.has(key)) {
                omittedShape[key] = schema;
            }
        }
        return new ObjectSchema(omittedShape);
    }
    // Merge with another object schema
    merge(other) {
        const mergedShape = { ...this.shape, ...other.shape };
        return new ObjectSchema(mergedShape);
    }
    // Deep partial - makes nested objects optional too
    deepPartial() {
        const deepPartialShape = {};
        for (const [key, schema] of Object.entries(this.shape)) {
            deepPartialShape[key] = makeDeepPartial(schema);
        }
        return new ObjectSchema(deepPartialShape);
    }
    // Get keys as a literal union schema
    keyof() {
        const keys = Object.keys(this.shape);
        class KeyofSchema extends Schema {
            _validate(data) {
                if (typeof data !== 'string' || !keys.includes(data)) {
                    throw new ValidationError([{
                            code: 'invalid_enum_value',
                            path: [],
                            message: `Expected one of: ${keys.join(', ')}`,
                            received: typeof data,
                            expected: keys.join(' | ')
                        }]);
                }
                return data;
            }
        }
        return new KeyofSchema({ type: 'keyof', keys });
    }
    // Required - opposite of partial
    required() {
        const requiredShape = {};
        for (const [key, schema] of Object.entries(this.shape)) {
            // If schema is OptionalSchema, extract the inner schema
            if (schema instanceof OptionalSchema) {
                requiredShape[key] = schema.innerSchema;
            }
            else {
                requiredShape[key] = schema;
            }
        }
        return new ObjectSchema(requiredShape);
    }
    // Set specific fields as optional
    setOptional(keys) {
        const newShape = {};
        const keysSet = new Set(keys);
        for (const [key, schema] of Object.entries(this.shape)) {
            if (keysSet.has(key)) {
                newShape[key] = schema.optional();
            }
            else {
                newShape[key] = schema;
            }
        }
        return new ObjectSchema(newShape);
    }
    // Set specific fields as required
    setRequired(keys) {
        const newShape = {};
        const keysSet = new Set(keys);
        for (const [key, schema] of Object.entries(this.shape)) {
            if (keysSet.has(key) && schema instanceof OptionalSchema) {
                newShape[key] = schema.innerSchema;
            }
            else {
                newShape[key] = schema;
            }
        }
        return new ObjectSchema(newShape);
    }
    // Get the shape for inspection
    getShape() {
        return this.shape;
    }
}
exports.ObjectSchema = ObjectSchema;
// Union type implementation
class UnionSchema extends Schema {
    constructor(options) {
        super({
            type: 'union',
            options: options.map(schema => schema.getSchema())
        });
        this.options = options;
    }
    _validate(data) {
        const issues = [];
        // Try each option until one succeeds
        for (let i = 0; i < this.options.length; i++) {
            try {
                return this.options[i]._validate(data);
            }
            catch (error) {
                if (error instanceof ValidationError) {
                    // Collect errors from all failed attempts
                    const unionIssues = error.issues.map(issue => ({
                        ...issue,
                        path: [`option_${i}`, ...issue.path]
                    }));
                    issues.push(...unionIssues);
                }
            }
        }
        // If no option succeeded, throw with all accumulated errors
        throw new ValidationError([{
                code: 'invalid_union',
                path: [],
                message: `Invalid input: must match one of the union types`
            }]);
    }
}
exports.UnionSchema = UnionSchema;
// Intersection type implementation
class IntersectionSchema extends Schema {
    constructor(left, right) {
        super({
            type: 'intersection',
            schemas: [left.getSchema(), right.getSchema()]
        });
        this.left = left;
        this.right = right;
    }
    _validate(data) {
        // Both schemas must validate successfully
        const leftResult = this.left._validate(data);
        const rightResult = this.right._validate(data);
        // For object intersection, merge properties
        if (typeof leftResult === 'object' && typeof rightResult === 'object' &&
            leftResult !== null && rightResult !== null &&
            !Array.isArray(leftResult) && !Array.isArray(rightResult)) {
            return { ...leftResult, ...rightResult };
        }
        // For non-objects, the right schema takes precedence
        return rightResult;
    }
}
exports.IntersectionSchema = IntersectionSchema;
// Optional wrapper
class OptionalSchema extends Schema {
    constructor(innerSchema) {
        super({ ...innerSchema.getSchema(), optional: true });
        this.innerSchema = innerSchema;
    }
    _validate(data) {
        if (data === undefined) {
            return undefined;
        }
        return this.innerSchema._validate(data);
    }
}
exports.OptionalSchema = OptionalSchema;
// Nullable wrapper
class NullableSchema extends Schema {
    constructor(innerSchema) {
        super({ ...innerSchema.getSchema(), nullable: true });
        this.innerSchema = innerSchema;
    }
    _validate(data) {
        if (data === null) {
            return null;
        }
        return this.innerSchema._validate(data);
    }
}
exports.NullableSchema = NullableSchema;
// Nullish wrapper (null | undefined)
class NullishSchema extends Schema {
    constructor(innerSchema) {
        super({ ...innerSchema.getSchema(), nullish: true });
        this.innerSchema = innerSchema;
    }
    _validate(data) {
        if (data === null || data === undefined) {
            return data;
        }
        return this.innerSchema._validate(data);
    }
}
exports.NullishSchema = NullishSchema;
// Refinement type for custom validation
class RefinementSchema extends Schema {
    constructor(baseSchema, predicate, message = 'Refinement failed') {
        super({
            type: 'refinement',
            base: baseSchema.getSchema(),
            predicate: predicate.toString(),
            message
        });
        this.baseSchema = baseSchema;
        this.predicate = predicate;
        this.message = message;
    }
    _validate(data) {
        const baseResult = this.baseSchema._validate(data);
        if (!this.predicate(baseResult)) {
            throw new ValidationError([{
                    code: 'custom',
                    path: [],
                    message: this.message
                }]);
        }
        return baseResult;
    }
}
exports.RefinementSchema = RefinementSchema;
// Transform type for data transformation
class TransformSchema extends Schema {
    constructor(inputSchema, transformer) {
        super({
            type: 'transform',
            input: inputSchema.getSchema(),
            transformer: transformer.toString()
        });
        this.inputSchema = inputSchema;
        this.transformer = transformer;
    }
    _validate(data) {
        const inputResult = this.inputSchema._validate(data);
        return this.transformer(inputResult);
    }
}
exports.TransformSchema = TransformSchema;
// Async refinement type for async validation
class AsyncRefinementSchema extends Schema {
    constructor(baseSchema, predicate, config = {}) {
        super({
            type: 'async_refinement',
            base: baseSchema.getSchema(),
            config
        });
        this.baseSchema = baseSchema;
        this.predicate = predicate;
        this.config = config;
        this.cache = new Map();
        this.activeRequests = new Map();
        this.debouncedFunction = null;
        // Generate unique ID for this schema instance
        this.schemaId = `async_refinement_${Date.now()}_${Math.random()}`;
        // Set up debounced function if debouncing is enabled
        if (this.config.debounce && this.config.debounce > 0) {
            this.debouncedFunction = new DebouncedAsyncFunction(this.executeAsyncValidation.bind(this), this.config.debounce);
        }
    }
    emitAsyncCompleteEvent(startTime, success, cancelled) {
        const asyncCompleteEvent = {
            type: 'async:complete',
            schemaType: this.schemaType.type || 'async_refinement',
            data: null,
            timestamp: startTime,
            id: this.instanceId,
            refinementId: this.schemaId,
            success,
            duration: Date.now() - startTime,
            cancelled
        };
        this.emitEvent(asyncCompleteEvent);
        exports.globalValidationMonitor.emit(asyncCompleteEvent);
    }
    _validate(data) {
        throw new ValidationError([{
                code: 'async_required',
                path: [],
                message: 'This schema requires async validation. Use parseAsync() or safeParseAsync()'
            }]);
    }
    async _validateAsync(data, options) {
        const startTime = Date.now();
        // Emit async validation start event
        const asyncStartEvent = {
            type: 'async:start',
            schemaType: this.schemaType.type || 'async_refinement',
            data,
            timestamp: startTime,
            id: this.instanceId,
            refinementId: this.schemaId,
            debounced: (options?.debounce ?? this.config.debounce ?? 0) > 0
        };
        this.emitEvent(asyncStartEvent);
        exports.globalValidationMonitor.emit(asyncStartEvent);
        // First validate with base schema
        const baseResult = await this.baseSchema._validateAsync(data, options);
        // Create cache key
        const cacheKey = JSON.stringify(baseResult);
        // Check cache if enabled
        if (this.config.cache && this.isValidCacheEntry(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            // Emit cache event
            this.emitEvent({
                type: 'validation:cache',
                schemaType: this.schemaType.type || 'async_refinement',
                data,
                timestamp: Date.now(),
                id: this.instanceId,
                cacheHit: true,
                cacheKey
            });
            if (cached && cached.result) {
                // Emit async complete event for cache hit
                this.emitAsyncCompleteEvent(startTime, true, false);
                return baseResult;
            }
            else if (cached && !cached.result) {
                // Emit async complete event for cache hit (failed)
                this.emitAsyncCompleteEvent(startTime, false, false);
                throw new ValidationError([{
                        code: 'custom',
                        path: [],
                        message: this.config.message || 'Async refinement failed'
                    }]);
            }
        }
        // Determine effective debounce delay
        const debounceDelay = options?.debounce ?? this.config.debounce ?? 0;
        let validationPromise;
        // Use debouncing if configured
        if (debounceDelay > 0) {
            // Get or create debounced function for this delay
            const debouncedFn = globalDebounceManager.getDebouncedFunction(`${this.schemaId}_${debounceDelay}`, this.executeAsyncValidation.bind(this), debounceDelay);
            validationPromise = debouncedFn.execute(baseResult, options);
        }
        else {
            // Check for existing request to prevent duplicate calls
            if (this.config.cancelPrevious && this.activeRequests.has(cacheKey)) {
                const existingRequest = this.activeRequests.get(cacheKey);
                try {
                    const result = await existingRequest;
                    return this.processAsyncResult(result, baseResult, cacheKey);
                }
                catch (error) {
                    this.activeRequests.delete(cacheKey);
                    throw error;
                }
            }
            validationPromise = this.executeAsyncValidation(baseResult, options);
            if (this.config.cancelPrevious) {
                this.activeRequests.set(cacheKey, validationPromise);
            }
        }
        try {
            const result = await validationPromise;
            const processedResult = this.processAsyncResult(result, baseResult, cacheKey);
            // Emit async complete event for success
            this.emitAsyncCompleteEvent(startTime, true, false);
            return processedResult;
        }
        catch (error) {
            // Handle debounce cancellation gracefully
            if (error instanceof Error && error.message.includes('Debounced')) {
                // Emit async complete event for cancellation
                this.emitAsyncCompleteEvent(startTime, false, true);
                throw new ValidationError([{
                        code: 'debounce_cancelled',
                        path: [],
                        message: 'Validation was cancelled due to newer input'
                    }]);
            }
            // Emit async complete event for failure
            this.emitAsyncCompleteEvent(startTime, false, false);
            throw error;
        }
        finally {
            if (this.config.cancelPrevious && !debounceDelay) {
                this.activeRequests.delete(cacheKey);
            }
        }
    }
    async executeAsyncValidation(value, options) {
        const controller = new AbortController();
        const timeoutMs = options?.timeout || this.config.timeout || 5000;
        // Set up timeout
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            // Add signal to context
            const ctx = { signal: controller.signal };
            // Execute with retries if configured
            const maxRetries = this.config.retries || 0;
            let lastError = null;
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    if (controller.signal.aborted) {
                        throw new Error('Validation aborted');
                    }
                    const result = await this.predicate(value, ctx);
                    clearTimeout(timeoutId);
                    return result;
                }
                catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    if (attempt < maxRetries && !controller.signal.aborted) {
                        // Wait before retry (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
                        continue;
                    }
                    throw lastError;
                }
            }
            throw lastError || new Error('Async validation failed');
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    processAsyncResult(result, baseResult, cacheKey) {
        // Cache result if enabled
        if (this.config.cache) {
            this.cache.set(cacheKey, {
                result,
                timestamp: Date.now()
            });
            this.cleanupCache();
        }
        if (!result) {
            throw new ValidationError([{
                    code: 'custom',
                    path: [],
                    message: this.config.message || 'Async refinement failed'
                }]);
        }
        return baseResult;
    }
    isValidCacheEntry(key) {
        if (!this.config.cache)
            return false;
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        const cacheConfig = typeof this.config.cache === 'object' ? this.config.cache : {};
        const ttl = cacheConfig.ttl || 300000; // 5 minutes default
        return Date.now() - entry.timestamp < ttl;
    }
    cleanupCache() {
        if (!this.config.cache || typeof this.config.cache !== 'object')
            return;
        const cacheConfig = this.config.cache;
        const maxSize = cacheConfig.maxSize || 1000;
        const ttl = cacheConfig.ttl || 300000;
        const now = Date.now();
        // Remove expired entries
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > ttl) {
                this.cache.delete(key);
            }
        }
        // Enforce max size
        if (this.cache.size > maxSize) {
            const entries = Array.from(this.cache.entries());
            const strategy = cacheConfig.strategy || 'lru';
            if (strategy === 'lru') {
                entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            }
            const toRemove = this.cache.size - maxSize;
            for (let i = 0; i < toRemove; i++) {
                this.cache.delete(entries[i][0]);
            }
        }
    }
    // Clear cache manually
    clearCache() {
        this.cache.clear();
    }
    // Get cache stats for monitoring
    getCacheStats() {
        // This is a simplified version - in production you'd track hits/misses
        return {
            hits: 0, // Would need to track this
            misses: 0, // Would need to track this
            size: this.cache.size
        };
    }
    // Debounce management methods
    cancelPendingValidations() {
        // Cancel debounced functions
        if (this.debouncedFunction) {
            this.debouncedFunction.cancel();
        }
        // Cancel any specific debounced functions in global manager
        globalDebounceManager.cleanup(`${this.schemaId}_${this.config.debounce}`);
        // Cancel active requests
        for (const [key, promise] of this.activeRequests.entries()) {
            // We can't actually cancel the promise, but we can remove it from tracking
            this.activeRequests.delete(key);
        }
    }
    // Check if there are pending validations
    hasPendingValidations() {
        if (this.debouncedFunction && this.debouncedFunction.isRunning()) {
            return true;
        }
        return this.activeRequests.size > 0;
    }
    // Get debounce stats
    getDebounceStats() {
        return {
            isDebouncing: this.debouncedFunction ? this.debouncedFunction.isRunning() : false,
            activeRequests: this.activeRequests.size,
            cacheSize: this.cache.size
        };
    }
    // Cleanup method for proper disposal
    dispose() {
        this.cancelPendingValidations();
        this.clearCache();
    }
}
exports.AsyncRefinementSchema = AsyncRefinementSchema;
// Batch validator class for efficient concurrent validation
class BatchValidator {
    constructor(options) {
        this.defaultOptions = {
            maxConcurrency: 5,
            stopOnFirstError: false,
            timeout: 10000
        };
        this.defaultOptions = { ...this.defaultOptions, ...options };
    }
    generateBatchId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async validateAsync(items, options) {
        const finalOptions = { ...this.defaultOptions, ...options };
        const startTime = Date.now();
        const batchId = this.generateBatchId();
        // Emit batch start event
        const batchStartEvent = {
            type: 'batch:start',
            schemaType: 'batch',
            data: null,
            timestamp: startTime,
            id: batchId,
            itemCount: items.length,
            maxConcurrency: finalOptions.maxConcurrency || 5,
            batchId
        };
        exports.globalValidationMonitor.emit(batchStartEvent);
        // Handle AbortController timeout
        const controller = new AbortController();
        const timeoutId = finalOptions.timeout ? setTimeout(() => {
            controller.abort();
        }, finalOptions.timeout) : null;
        // Combine external abort signal with timeout signal
        if (finalOptions.abortSignal) {
            finalOptions.abortSignal.addEventListener('abort', () => {
                controller.abort();
            });
        }
        try {
            const results = await this.processBatch(items, finalOptions, controller.signal, batchId);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            // Emit batch complete event
            const duration = Date.now() - startTime;
            const successful = results.filter(r => r.success).length;
            const failed = results.length - successful;
            const avgItemDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;
            const batchCompleteEvent = {
                type: 'batch:complete',
                schemaType: 'batch',
                data: null,
                timestamp: startTime,
                id: batchId,
                batchId,
                successful,
                failed,
                duration,
                avgItemDuration
            };
            exports.globalValidationMonitor.emit(batchCompleteEvent);
            return results;
        }
        catch (error) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            // Emit batch complete event for error case
            const duration = Date.now() - startTime;
            const batchCompleteEvent = {
                type: 'batch:complete',
                schemaType: 'batch',
                data: null,
                timestamp: startTime,
                id: batchId,
                batchId,
                successful: 0,
                failed: items.length,
                duration,
                avgItemDuration: 0
            };
            exports.globalValidationMonitor.emit(batchCompleteEvent);
            throw error;
        }
    }
    async processBatch(items, options, abortSignal, batchId) {
        const results = new Array(items.length);
        const maxConcurrency = options.maxConcurrency || 5;
        // Create a semaphore for concurrency control
        const semaphore = new Array(maxConcurrency).fill(null);
        let index = 0;
        // Process items with controlled concurrency
        const processItem = async (itemIndex) => {
            if (abortSignal.aborted) {
                throw new Error('Batch validation aborted');
            }
            const item = items[itemIndex];
            const itemStartTime = Date.now();
            try {
                // Validate the item with the provided schema
                let result;
                if (item.schema._validateAsync) {
                    result = await item.schema._validateAsync(item.data);
                }
                else {
                    result = item.schema._validate(item.data);
                }
                const duration = Date.now() - itemStartTime;
                results[itemIndex] = {
                    success: true,
                    data: result,
                    id: item.id,
                    duration
                };
                // Emit batch item event for success
                exports.globalValidationMonitor.emit({
                    type: 'batch:item',
                    schemaType: 'batch',
                    data: item.data,
                    timestamp: itemStartTime,
                    id: `${batchId}_item_${itemIndex}`,
                    batchId,
                    itemIndex,
                    itemId: item.id,
                    success: true,
                    duration
                });
            }
            catch (error) {
                const duration = Date.now() - itemStartTime;
                const validationError = error instanceof ValidationError
                    ? error
                    : new ValidationError([{
                            code: 'unknown',
                            path: [],
                            message: error instanceof Error ? error.message : 'Unknown validation error'
                        }]);
                results[itemIndex] = {
                    success: false,
                    error: validationError,
                    id: item.id,
                    duration
                };
                // Emit batch item event for failure
                exports.globalValidationMonitor.emit({
                    type: 'batch:item',
                    schemaType: 'batch',
                    data: item.data,
                    timestamp: itemStartTime,
                    id: `${batchId}_item_${itemIndex}`,
                    batchId,
                    itemIndex,
                    itemId: item.id,
                    success: false,
                    duration
                });
                // Stop on first error if configured
                if (options.stopOnFirstError) {
                    throw validationError;
                }
            }
        };
        // Create worker promises that process items from the queue
        const workers = semaphore.map(async () => {
            while (index < items.length && !abortSignal.aborted) {
                const currentIndex = index++;
                if (currentIndex < items.length) {
                    await processItem(currentIndex);
                }
            }
        });
        // Wait for all workers to complete
        await Promise.all(workers);
        if (abortSignal.aborted) {
            throw new Error('Batch validation aborted');
        }
        return results;
    }
    async validateMixed(items) {
        return this.validateAsync(items);
    }
    getStats(results) {
        const successful = results.filter(r => r.success).length;
        const failed = results.length - successful;
        const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
        return {
            total: results.length,
            successful,
            failed,
            duration: totalDuration,
            avgItemDuration: totalDuration / results.length,
            maxConcurrency: this.defaultOptions.maxConcurrency || 5
        };
    }
    // Utility method to create batches from arrays of data
    static createBatch(schema, dataArray, idGenerator) {
        return dataArray.map((data, index) => ({
            schema,
            data,
            id: idGenerator ? idGenerator(index, data) : index
        }));
    }
    // Utility method to group results by success/failure
    static groupResults(results) {
        const successful = [];
        const failed = [];
        for (const result of results) {
            if (result.success) {
                successful.push({
                    data: result.data,
                    id: result.id,
                    duration: result.duration
                });
            }
            else {
                failed.push({
                    error: result.error,
                    id: result.id,
                    duration: result.duration
                });
            }
        }
        return { successful, failed };
    }
}
exports.BatchValidator = BatchValidator;
// Global validation monitoring system
class ValidationMonitor extends ValidationEventEmitter {
    constructor() {
        super();
        this.validationCount = 0;
        this.asyncValidationCount = 0;
        this.batchValidationCount = 0;
        this.errorCount = 0;
        this.totalDuration = 0;
        this.performanceMetrics = new Map();
        // Auto-collect basic statistics
        this.on('*', (event) => {
            this.collectStatistics(event);
        });
    }
    collectStatistics(event) {
        switch (event.type) {
            case 'validation:start':
                if (event.async) {
                    this.asyncValidationCount++;
                }
                else {
                    this.validationCount++;
                }
                break;
            case 'validation:error':
                this.errorCount++;
                this.totalDuration += event.duration;
                break;
            case 'validation:success':
                this.totalDuration += event.duration;
                break;
            case 'batch:start':
                this.batchValidationCount++;
                break;
            case 'performance':
                this.recordPerformanceMetric(event.metric, event.value, event.timestamp);
                break;
        }
    }
    recordPerformanceMetric(metric, value, timestamp) {
        if (!this.performanceMetrics.has(metric)) {
            this.performanceMetrics.set(metric, { values: [], timestamps: [] });
        }
        const data = this.performanceMetrics.get(metric);
        data.values.push(value);
        data.timestamps.push(timestamp);
        // Keep only last 1000 measurements to prevent memory leaks
        if (data.values.length > 1000) {
            data.values.shift();
            data.timestamps.shift();
        }
    }
    // Statistics getters
    getStatistics() {
        const totalValidations = this.validationCount + this.asyncValidationCount;
        return {
            validationCount: this.validationCount,
            asyncValidationCount: this.asyncValidationCount,
            batchValidationCount: this.batchValidationCount,
            errorCount: this.errorCount,
            totalDuration: this.totalDuration,
            averageDuration: totalValidations > 0 ? this.totalDuration / totalValidations : 0,
            errorRate: totalValidations > 0 ? this.errorCount / totalValidations : 0
        };
    }
    getPerformanceMetrics() {
        const metrics = {};
        for (const [metricName, data] of this.performanceMetrics.entries()) {
            if (data.values.length > 0) {
                const values = data.values;
                metrics[metricName] = {
                    current: values[values.length - 1],
                    average: values.reduce((sum, val) => sum + val, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    count: values.length
                };
            }
        }
        return metrics;
    }
    // Real-time monitoring methods
    startPerformanceMonitoring(intervalMs = 5000) {
        const interval = setInterval(() => {
            const stats = this.getStatistics();
            this.emit({
                type: 'performance',
                schemaType: 'monitor',
                data: null,
                timestamp: Date.now(),
                id: 'global-monitor',
                metric: 'monitoring.interval',
                value: intervalMs,
                unit: 'ms',
                context: { stats }
            });
        }, intervalMs);
        return () => clearInterval(interval);
    }
    // Reset statistics
    resetStatistics() {
        this.validationCount = 0;
        this.asyncValidationCount = 0;
        this.batchValidationCount = 0;
        this.errorCount = 0;
        this.totalDuration = 0;
        this.performanceMetrics.clear();
    }
    // Event filtering helpers
    onValidationSuccess(listener) {
        return this.on('validation:success', listener);
    }
    onValidationError(listener) {
        return this.on('validation:error', listener);
    }
    onAsyncStart(listener) {
        return this.on('async:start', listener);
    }
    onAsyncComplete(listener) {
        return this.on('async:complete', listener);
    }
    onBatchStart(listener) {
        return this.on('batch:start', listener);
    }
    onBatchComplete(listener) {
        return this.on('batch:complete', listener);
    }
    onPerformance(listener) {
        return this.on('performance', listener);
    }
    onDebug(listener) {
        return this.on('debug', listener);
    }
    // Advanced filtering
    onSchemaType(schemaType, listener) {
        return this.on('*', (event) => {
            if (event.schemaType === schemaType) {
                listener(event);
            }
        });
    }
    onErrorsOnly(listener) {
        return this.on('*', (event) => {
            if (event.type === 'validation:error' || event.type === 'debug' && event.level === 'error') {
                listener(event);
            }
        });
    }
    // Debug helpers
    enableDebugMode() {
        this.on('*', (event) => {
            console.log(`[FastSchema Debug] ${event.type}:`, event);
        });
    }
    createEventLogger(prefix = '[FastSchema]') {
        return (event) => {
            const timestamp = new Date(event.timestamp).toISOString();
            console.log(`${prefix} [${timestamp}] ${event.type}:`, event);
        };
    }
}
exports.ValidationMonitor = ValidationMonitor;
// Global instance
exports.globalValidationMonitor = new ValidationMonitor();
// Debouncing utility for async validation
class DebouncedAsyncFunction {
    constructor(fn, delay) {
        this.fn = fn;
        this.delay = delay;
        this.timeoutId = null;
        this.lastPromise = null;
        this.lastResolve = null;
        this.lastReject = null;
    }
    async execute(...args) {
        // Clear existing timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        // If there's a pending promise, we'll reuse its structure
        if (this.lastPromise && this.lastResolve && this.lastReject) {
            // Cancel the previous execution by rejecting it
            this.lastReject(new Error('Debounced: newer call received'));
        }
        // Create new promise
        return new Promise((resolve, reject) => {
            this.lastResolve = resolve;
            this.lastReject = reject;
            this.timeoutId = setTimeout(async () => {
                try {
                    const result = await this.fn(...args);
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
                finally {
                    this.lastPromise = null;
                    this.lastResolve = null;
                    this.lastReject = null;
                    this.timeoutId = null;
                }
            }, this.delay);
        });
    }
    cancel() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        if (this.lastReject) {
            this.lastReject(new Error('Debounced function cancelled'));
            this.lastPromise = null;
            this.lastResolve = null;
            this.lastReject = null;
        }
    }
    isRunning() {
        return this.timeoutId !== null;
    }
}
exports.DebouncedAsyncFunction = DebouncedAsyncFunction;
// Global debounce manager for validation functions
class ValidationDebounceManager {
    constructor() {
        this.debouncedFunctions = new Map();
    }
    getDebouncedFunction(key, fn, delay) {
        if (!this.debouncedFunctions.has(key)) {
            this.debouncedFunctions.set(key, new DebouncedAsyncFunction(fn, delay));
        }
        return this.debouncedFunctions.get(key);
    }
    cancelAll() {
        for (const debouncedFn of this.debouncedFunctions.values()) {
            debouncedFn.cancel();
        }
    }
    cleanup(key) {
        const debouncedFn = this.debouncedFunctions.get(key);
        if (debouncedFn) {
            debouncedFn.cancel();
            this.debouncedFunctions.delete(key);
        }
    }
    getStats() {
        let active = 0;
        for (const debouncedFn of this.debouncedFunctions.values()) {
            if (debouncedFn.isRunning()) {
                active++;
            }
        }
        return {
            active,
            total: this.debouncedFunctions.size
        };
    }
}
exports.ValidationDebounceManager = ValidationDebounceManager;
// Global instance
const globalDebounceManager = new ValidationDebounceManager();
exports.globalDebounceManager = globalDebounceManager;
// Utility functions for debouncing
function createDebouncedValidator(validator, delay) {
    const debouncedFn = new DebouncedAsyncFunction(validator, delay);
    return (value) => debouncedFn.execute(value);
}
function debounceAsyncFunction(fn, delay) {
    const debouncedFn = new DebouncedAsyncFunction(fn, delay);
    return (...args) => debouncedFn.execute(...args);
}
// Performance optimization utilities
class RegexCache {
    static get(pattern, flags) {
        const key = flags ? `${pattern}:${flags}` : pattern;
        if (!this.cache.has(key)) {
            if (this.cache.size >= this.maxSize) {
                // Remove oldest entry (simple LRU)
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            this.cache.set(key, new RegExp(pattern, flags));
        }
        return this.cache.get(key);
    }
    static clear() {
        this.cache.clear();
    }
    static getStats() {
        return { size: this.cache.size, maxSize: this.maxSize };
    }
}
RegexCache.cache = new Map();
RegexCache.maxSize = 100; // Prevent memory leaks
class SchemaCache {
    static get(schemaHash) {
        return this.compiledSchemas.get(schemaHash);
    }
    static set(schemaHash, compiledSchema) {
        if (this.compiledSchemas.size >= this.maxSize) {
            // Remove oldest entry
            const firstKey = this.compiledSchemas.keys().next().value;
            this.compiledSchemas.delete(firstKey);
        }
        this.compiledSchemas.set(schemaHash, compiledSchema);
    }
    static has(schemaHash) {
        return this.compiledSchemas.has(schemaHash);
    }
    static clear() {
        this.compiledSchemas.clear();
    }
    static getStats() {
        return { size: this.compiledSchemas.size, maxSize: this.maxSize };
    }
}
SchemaCache.compiledSchemas = new Map();
SchemaCache.maxSize = 500;
class ValidationPool {
    static getResult() {
        return this.resultPool.pop() || { success: false };
    }
    static returnResult(result) {
        if (this.resultPool.length < this.maxPoolSize) {
            // Reset result for reuse
            result.success = false;
            result.data = undefined;
            result.error = undefined;
            this.resultPool.push(result);
        }
    }
    static getError() {
        return this.errorPool.pop() || new ValidationError([]);
    }
    static returnError(error) {
        if (this.errorPool.length < this.maxPoolSize) {
            // Reset error for reuse
            error.issues = [];
            this.errorPool.push(error);
        }
    }
    static clear() {
        this.resultPool = [];
        this.errorPool = [];
    }
    static getStats() {
        return {
            resultPool: this.resultPool.length,
            errorPool: this.errorPool.length,
            maxSize: this.maxPoolSize
        };
    }
}
ValidationPool.resultPool = [];
ValidationPool.errorPool = [];
ValidationPool.maxPoolSize = 50;
// Validation helper functions with optimized regex
function isValidEmail(email) {
    const regex = RegexCache.get('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
    return regex.test(email);
}
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function isValidUuid(uuid) {
    const regex = RegexCache.get('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');
    return regex.test(uuid);
}
// Extended string format validation functions with optimized regex
function isValidIPv4(ip) {
    const regex = RegexCache.get('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
    return regex.test(ip);
}
function isValidIPv6(ip) {
    const regex = RegexCache.get('^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$');
    return regex.test(ip);
}
function isValidPhone(phone) {
    // International phone number format (E.164) - supports various formats
    const regex = RegexCache.get('^\\+?[1-9]\\d{1,14}$|^(\\+?\\d{1,3}[-\\.\\s]?)?\\(?\\d{1,4}\\)?[-\\.\\s]?\\d{1,4}[-\\.\\s]?\\d{1,9}$');
    const cleanPhone = phone.replace(/[-.\s()]/g, '');
    return regex.test(cleanPhone) && cleanPhone.length >= 7 && cleanPhone.length <= 15;
}
function isValidJWT(token) {
    // JWT format: header.payload.signature (base64url encoded)
    const jwtRegex = RegexCache.get('^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$');
    if (!jwtRegex.test(token))
        return false;
    const parts = token.split('.');
    if (parts.length !== 3)
        return false;
    // Validate each part is valid base64url
    const base64urlRegex = RegexCache.get('^[A-Za-z0-9_-]+$');
    for (const part of parts) {
        if (part.length === 0)
            return false;
        if (!base64urlRegex.test(part))
            return false;
    }
    return true;
}
function isValidBase64(str) {
    // Base64 regex with optional padding
    const regex = RegexCache.get('^[A-Za-z0-9+/]*={0,2}$');
    if (!regex.test(str))
        return false;
    // Check length is multiple of 4 when padded
    const paddedLength = str.length + (str.match(/=/g) || []).length;
    return paddedLength % 4 === 0;
}
function isValidHex(str) {
    // Hexadecimal string (with or without 0x prefix)
    const regex = RegexCache.get('^(0x)?[0-9a-fA-F]+$');
    return regex.test(str);
}
function isValidCreditCard(number) {
    // Remove spaces and dashes
    const cleanNumber = number.replace(/[-\s]/g, '');
    // Check if it's all digits and appropriate length
    const digitRegex = RegexCache.get('^\\d{13,19}$');
    if (!digitRegex.test(cleanNumber))
        return false;
    // Luhn algorithm validation
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber[i]);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9)
                digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}
function isValidMacAddress(mac) {
    // MAC address formats: xx:xx:xx:xx:xx:xx or xx-xx-xx-xx-xx-xx
    const regex = RegexCache.get('^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$');
    return regex.test(mac);
}
function isValidColor(color) {
    // Hex color: #RGB, #RRGGBB, #RRGGBBAA
    const hexColorRegex = RegexCache.get('^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$');
    if (hexColorRegex.test(color))
        return true;
    // CSS named colors (basic set) - cached as static for performance
    const namedColors = [
        'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
        'silver', 'gray', 'maroon', 'olive', 'lime', 'aqua', 'teal', 'navy',
        'fuchsia', 'purple', 'orange', 'transparent'
    ];
    if (namedColors.includes(color.toLowerCase()))
        return true;
    // RGB/RGBA format
    const rgbRegex = RegexCache.get('^rgba?\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*(,\\s*[0-1]?\\.?\\d+)?\\s*\\)$');
    return rgbRegex.test(color);
}
function isValidSlug(slug) {
    // URL-friendly slug: lowercase letters, numbers, hyphens
    const regex = RegexCache.get('^[a-z0-9]+(?:-[a-z0-9]+)*$');
    return regex.test(slug);
}
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// Schema composition utility functions
function makeDeepPartial(schema) {
    if (schema instanceof ObjectSchema) {
        const shape = schema.getShape();
        const deepPartialShape = {};
        for (const [key, subSchema] of Object.entries(shape)) {
            deepPartialShape[key] = makeDeepPartial(subSchema).optional();
        }
        return new ObjectSchema(deepPartialShape);
    }
    else if (schema instanceof ArraySchema) {
        const itemSchema = schema.itemSchema;
        return new ArraySchema(makeDeepPartial(itemSchema));
    }
    else {
        return schema.optional();
    }
}
// WASM initialization
let wasmInitialized = false;
async function ensureWasmLoaded() {
    if (!wasmInitialized) {
        try {
            await (0, fast_schema_1.default)();
            wasmInitialized = true;
        }
        catch (error) {
            console.warn('WASM module failed to load, falling back to pure JavaScript');
        }
    }
}
// Initialize WASM on module load
ensureWasmLoaded().catch(() => {
    // Silently fail - we'll use pure JavaScript fallback
});
// Conditional validation schema
class ConditionalSchema extends Schema {
    constructor(defaultSchema) {
        super({ type: 'conditional' });
        this.rules = [];
        this.defaultSchema = defaultSchema;
    }
    when(condition, schema, message) {
        this.rules.push({ condition, schema, message });
        return this;
    }
    otherwise(schema) {
        this.defaultSchema = schema;
        return this;
    }
    _validate(data, context) {
        // Try each conditional rule
        for (const rule of this.rules) {
            try {
                if (rule.condition(data)) {
                    return rule.schema._validate(data, context);
                }
            }
            catch (error) {
                if (rule.message) {
                    throw new ValidationError([{
                            code: 'conditional_validation_failed',
                            path: context?.path || [],
                            message: rule.message
                        }]);
                }
                throw error;
            }
        }
        // Fall back to default schema
        if (this.defaultSchema) {
            return this.defaultSchema._validate(data, context);
        }
        // No matching condition and no default
        throw new ValidationError([{
                code: 'no_matching_condition',
                path: context?.path || [],
                message: 'No conditional validation rule matched'
            }]);
    }
}
exports.ConditionalSchema = ConditionalSchema;
// Custom validation schema
class CustomValidationSchema extends Schema {
    constructor(baseSchema) {
        super({ type: 'custom_validation' });
        this.customValidators = [];
        if (baseSchema) {
            this.baseSchema = baseSchema;
        }
    }
    addValidator(config) {
        this.customValidators.push(config);
        return this;
    }
    validator(fn, message, code) {
        return this.addValidator({
            validator: fn,
            message,
            code
        });
    }
    _validate(data, context) {
        // First validate with base schema if present
        let validatedData;
        if (this.baseSchema) {
            validatedData = this.baseSchema._validate(data, context);
        }
        else {
            validatedData = data;
        }
        // Apply custom validators
        for (const config of this.customValidators) {
            const result = config.validator(validatedData, context || {
                path: [],
                data: validatedData,
                root: validatedData
            });
            if (result === false) {
                throw new ValidationError([{
                        code: config.code || 'custom_validation_failed',
                        path: context?.path || [],
                        message: config.message || 'Custom validation failed'
                    }]);
            }
            if (typeof result === 'string') {
                throw new ValidationError([{
                        code: config.code || 'custom_validation_failed',
                        path: context?.path || [],
                        message: result
                    }]);
            }
            if (Array.isArray(result)) {
                throw new ValidationError(result);
            }
        }
        return validatedData;
    }
}
exports.CustomValidationSchema = CustomValidationSchema;
class DynamicSchema extends Schema {
    constructor(generator) {
        super({ type: 'dynamic' });
        this.schemaCache = new Map();
        this.generator = generator;
    }
    _validate(data, context) {
        const ctx = context || {
            path: [],
            data,
            root: data
        };
        // Generate cache key based on context
        const cacheKey = this.generateCacheKey(ctx);
        let schema = this.schemaCache.get(cacheKey);
        if (!schema) {
            schema = this.generator(ctx);
            this.schemaCache.set(cacheKey, schema);
        }
        return schema._validate(data, ctx);
    }
    generateCacheKey(context) {
        return JSON.stringify({
            path: context.path,
            hasParent: !!context.parent,
            metadata: context.metadata
        });
    }
    clearCache() {
        this.schemaCache.clear();
    }
}
exports.DynamicSchema = DynamicSchema;
class IntrospectableSchema extends Schema {
    constructor(baseSchema, metadata = {}) {
        super({ type: 'introspectable' });
        this.baseSchema = baseSchema;
        this.metadata = {
            type: baseSchema.getSchema().type,
            ...metadata
        };
    }
    getMetadata() {
        return { ...this.metadata };
    }
    setMetadata(metadata) {
        this.metadata = { ...this.metadata, ...metadata };
        return this;
    }
    describe(description) {
        this.metadata.description = description;
        return this;
    }
    example(example) {
        if (!this.metadata.examples) {
            this.metadata.examples = [];
        }
        this.metadata.examples.push(example);
        return this;
    }
    tag(...tags) {
        if (!this.metadata.tags) {
            this.metadata.tags = [];
        }
        this.metadata.tags.push(...tags);
        return this;
    }
    deprecate(reason) {
        this.metadata.deprecated = true;
        if (reason) {
            this.metadata.custom = { ...this.metadata.custom, deprecationReason: reason };
        }
        return this;
    }
    version(version) {
        this.metadata.version = version;
        return this;
    }
    // Introspection methods
    getType() {
        return this.metadata.type;
    }
    getShape() {
        if (this.baseSchema instanceof ObjectSchema) {
            return this.baseSchema.getShape();
        }
        return null;
    }
    getProperties() {
        const shape = this.getShape();
        return shape ? Object.keys(shape) : [];
    }
    isOptional() {
        return this.baseSchema.isOptional();
    }
    isNullable() {
        return this.baseSchema.isNullable();
    }
    getConstraints() {
        return this.baseSchema.getSchema();
    }
    _validate(data, context) {
        return this.baseSchema._validate(data, context);
    }
}
exports.IntrospectableSchema = IntrospectableSchema;
class SchemaSerializer {
    static serialize(schema) {
        const schemaObj = schema.getSchema();
        const result = {
            type: schemaObj.type,
            version: this.VERSION
        };
        // Add constraints
        if (Object.keys(schemaObj).length > 1) {
            result.constraints = { ...schemaObj };
            delete result.constraints.type;
        }
        // Add metadata if introspectable
        if (schema instanceof IntrospectableSchema) {
            result.metadata = schema.getMetadata();
        }
        // Handle complex schemas
        if (schema instanceof ObjectSchema) {
            const shape = schema.getShape();
            result.shape = {};
            for (const [key, subSchema] of Object.entries(shape)) {
                result.shape[key] = this.serialize(subSchema);
            }
        }
        else if (schema instanceof ArraySchema) {
            result.itemSchema = this.serialize(schema.itemSchema);
        }
        else if (schema instanceof UnionSchema) {
            result.schemas = schema.schemas.map((s) => this.serialize(s));
        }
        return result;
    }
    static deserialize(serialized) {
        switch (serialized.type) {
            case 'string':
                return this.deserializeStringSchema(serialized);
            case 'number':
                return this.deserializeNumberSchema(serialized);
            case 'boolean':
                return new BooleanSchema();
            case 'object':
                return this.deserializeObjectSchema(serialized);
            case 'array':
                return this.deserializeArraySchema(serialized);
            case 'union':
                return this.deserializeUnionSchema(serialized);
            default:
                throw new Error(`Unknown schema type: ${serialized.type}`);
        }
    }
    static deserializeStringSchema(serialized) {
        const schema = new StringSchema();
        const constraints = serialized.constraints || {};
        if (constraints.minLength !== undefined) {
            schema.min(constraints.minLength);
        }
        if (constraints.maxLength !== undefined) {
            schema.max(constraints.maxLength);
        }
        if (constraints.format) {
            // Apply format validation based on format type
            switch (constraints.format) {
                case 'email':
                    schema.email();
                    break;
                case 'url':
                    schema.url();
                    break;
                case 'uuid':
                    schema.uuid();
                    break;
                // Add more formats as needed
            }
        }
        return schema;
    }
    static deserializeNumberSchema(serialized) {
        const schema = new NumberSchema();
        const constraints = serialized.constraints || {};
        if (constraints.min !== undefined) {
            schema.min(constraints.min);
        }
        if (constraints.max !== undefined) {
            schema.max(constraints.max);
        }
        if (constraints.isInteger) {
            schema.int();
        }
        return schema;
    }
    static deserializeObjectSchema(serialized) {
        if (!serialized.shape) {
            throw new Error('Object schema missing shape');
        }
        const shape = {};
        for (const [key, subSerialized] of Object.entries(serialized.shape)) {
            shape[key] = this.deserialize(subSerialized);
        }
        return new ObjectSchema(shape);
    }
    static deserializeArraySchema(serialized) {
        if (!serialized.itemSchema) {
            throw new Error('Array schema missing item schema');
        }
        const itemSchema = this.deserialize(serialized.itemSchema);
        return new ArraySchema(itemSchema);
    }
    static deserializeUnionSchema(serialized) {
        if (!serialized.schemas) {
            throw new Error('Union schema missing schemas');
        }
        const schemas = serialized.schemas.map(s => this.deserialize(s));
        return new UnionSchema(schemas);
    }
}
exports.SchemaSerializer = SchemaSerializer;
SchemaSerializer.VERSION = '1.0.0';
class VersionedSchema extends Schema {
    constructor(version, schema) {
        super({ type: 'versioned' });
        this.schemas = new Map();
        this.migrations = [];
        this.currentVersion = version;
        this.schemas.set(version, schema);
    }
    addVersion(version, schema) {
        this.schemas.set(version, schema);
        return this;
    }
    addMigration(migration) {
        this.migrations.push(migration);
        return this;
    }
    getCurrentVersion() {
        return this.currentVersion;
    }
    getAvailableVersions() {
        return Array.from(this.schemas.keys());
    }
    migrate(data, fromVersion, toVersion) {
        const targetVersion = toVersion || this.currentVersion;
        if (fromVersion === targetVersion) {
            return data;
        }
        // Find migration path
        const migrationPath = this.findMigrationPath(fromVersion, targetVersion);
        if (!migrationPath) {
            throw new Error(`No migration path from ${fromVersion} to ${targetVersion}`);
        }
        // Apply migrations in sequence
        let migratedData = data;
        for (const migration of migrationPath) {
            migratedData = migration.migrate(migratedData);
        }
        return migratedData;
    }
    findMigrationPath(from, to) {
        // Simple linear migration path finding
        const path = [];
        let currentVersion = from;
        while (currentVersion !== to) {
            const migration = this.migrations.find(m => m.fromVersion === currentVersion);
            if (!migration) {
                return null; // No migration path found
            }
            path.push(migration);
            currentVersion = migration.toVersion;
        }
        return path;
    }
    _validate(data, context) {
        const schema = this.schemas.get(this.currentVersion);
        if (!schema) {
            throw new Error(`Schema for version ${this.currentVersion} not found`);
        }
        return schema._validate(data, context);
    }
}
exports.VersionedSchema = VersionedSchema;
// Advanced error handling and context
class ValidationErrorWithContext extends ValidationError {
    constructor(issues, context) {
        super(issues);
        this.context = context;
    }
    getContext() {
        return this.context;
    }
    getFullPath() {
        return this.context.path.join('.');
    }
    getRootData() {
        return this.context.root;
    }
    getParentData() {
        return this.context.parent;
    }
}
exports.ValidationErrorWithContext = ValidationErrorWithContext;
class ContextualValidator {
    static validateWithContext(schema, data, context = {}) {
        const fullContext = {
            path: [],
            data,
            root: data,
            ...context
        };
        try {
            return schema._validate(data, fullContext);
        }
        catch (error) {
            if (error instanceof ValidationError) {
                throw new ValidationErrorWithContext(error.issues, fullContext);
            }
            throw error;
        }
    }
}
exports.ContextualValidator = ContextualValidator;
// Utility functions for advanced validation features
function createConditionalSchema(defaultSchema) {
    return new ConditionalSchema(defaultSchema);
}
function createCustomValidator(baseSchema) {
    return new CustomValidationSchema(baseSchema);
}
function createDynamicSchema(generator) {
    return new DynamicSchema(generator);
}
function introspect(schema, metadata) {
    return new IntrospectableSchema(schema, metadata);
}
function createVersionedSchema(version, schema) {
    return new VersionedSchema(version, schema);
}
//# sourceMappingURL=core.js.map