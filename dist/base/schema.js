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
exports.TransformSchema = exports.RefinementSchema = exports.DefaultSchema = exports.NullableSchema = exports.OptionalSchema = exports.Schema = exports.ValidationError = void 0;
// Core Schema base class with essential methods
var types_1 = require("./types");
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return types_1.ValidationError; } });
var Schema = /** @class */ (function () {
    function Schema(definition) {
        this.definition = definition;
    }
    Schema.prototype.parse = function (data) {
        return this._validate(data);
    };
    Schema.prototype.safeParse = function (data) {
        try {
            var result = this._validate(data);
            return { success: true, data: result };
        }
        catch (error) {
            if (error instanceof types_1.ValidationError) {
                return { success: false, error: error };
            }
            return {
                success: false,
                error: new types_1.ValidationError([{
                        code: 'unknown_error',
                        path: [],
                        message: error instanceof Error ? error.message : 'Unknown error'
                    }])
            };
        }
    };
    Schema.prototype.getSchema = function () {
        return this.definition;
    };
    // Transformation methods
    Schema.prototype.optional = function () {
        return new OptionalSchema(this);
    };
    Schema.prototype.nullable = function () {
        return new NullableSchema(this);
    };
    Schema.prototype.default = function (value) {
        return new DefaultSchema(this, value);
    };
    // Refinement and transformation
    Schema.prototype.refine = function (predicate, message) {
        return new RefinementSchema(this, predicate, message);
    };
    Schema.prototype.transform = function (transformer) {
        return new TransformSchema(this, transformer);
    };
    // Async methods
    Schema.prototype.parseAsync = function (data) {
        return Promise.resolve(this.parse(data));
    };
    Schema.prototype.safeParseAsync = function (data) {
        return Promise.resolve(this.safeParse(data));
    };
    // Brand (nominal typing)
    Schema.prototype.brand = function () {
        return this;
    };
    // Catch - handle validation errors
    Schema.prototype.catch = function (value) {
        var self = this;
        return new (/** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype._validate = function (data) {
                try {
                    return self._validate(data);
                }
                catch (_a) {
                    return value;
                }
            };
            return class_1;
        }(Schema)))(this.definition);
    };
    // Pipe - compose with another schema
    Schema.prototype.pipe = function (schema) {
        var self = this;
        return new (/** @class */ (function (_super) {
            __extends(class_2, _super);
            function class_2() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_2.prototype._validate = function (data) {
                var intermediate = self._validate(data);
                return schema._validate(intermediate);
            };
            return class_2;
        }(Schema)))({ type: 'pipe', schemas: [this.definition, schema.definition] });
    };
    return Schema;
}());
exports.Schema = Schema;
// Optional schema wrapper
var OptionalSchema = /** @class */ (function (_super) {
    __extends(OptionalSchema, _super);
    function OptionalSchema(innerSchema) {
        var _this = _super.call(this, { type: 'optional', innerSchema: innerSchema.getSchema() }) || this;
        _this.innerSchema = innerSchema;
        return _this;
    }
    OptionalSchema.prototype._validate = function (data) {
        if (data === undefined) {
            return undefined;
        }
        return this.innerSchema._validate(data);
    };
    return OptionalSchema;
}(Schema));
exports.OptionalSchema = OptionalSchema;
// Nullable schema wrapper
var NullableSchema = /** @class */ (function (_super) {
    __extends(NullableSchema, _super);
    function NullableSchema(innerSchema) {
        var _this = _super.call(this, { type: 'nullable', innerSchema: innerSchema.getSchema() }) || this;
        _this.innerSchema = innerSchema;
        return _this;
    }
    NullableSchema.prototype._validate = function (data) {
        if (data === null) {
            return null;
        }
        return this.innerSchema._validate(data);
    };
    return NullableSchema;
}(Schema));
exports.NullableSchema = NullableSchema;
// Default value schema
var DefaultSchema = /** @class */ (function (_super) {
    __extends(DefaultSchema, _super);
    function DefaultSchema(innerSchema, defaultValue) {
        var _this = _super.call(this, { type: 'default', innerSchema: innerSchema.getSchema(), defaultValue: defaultValue }) || this;
        _this.innerSchema = innerSchema;
        _this.defaultValue = defaultValue;
        return _this;
    }
    DefaultSchema.prototype._validate = function (data) {
        if (data === undefined) {
            return this.defaultValue;
        }
        return this.innerSchema._validate(data);
    };
    return DefaultSchema;
}(Schema));
exports.DefaultSchema = DefaultSchema;
// Refinement schema
var RefinementSchema = /** @class */ (function (_super) {
    __extends(RefinementSchema, _super);
    function RefinementSchema(innerSchema, predicate, errorMessage) {
        var _this = _super.call(this, { type: 'refinement', innerSchema: innerSchema.getSchema() }) || this;
        _this.innerSchema = innerSchema;
        _this.predicate = predicate;
        _this.errorMessage = errorMessage;
        return _this;
    }
    RefinementSchema.prototype._validate = function (data) {
        var validated = this.innerSchema._validate(data);
        if (!this.predicate(validated)) {
            var message = typeof this.errorMessage === 'string'
                ? this.errorMessage
                : this.errorMessage.message;
            var path = typeof this.errorMessage === 'object' && this.errorMessage.path
                ? this.errorMessage.path
                : [];
            throw new types_1.ValidationError([{
                    code: 'custom',
                    path: path,
                    message: message
                }]);
        }
        return validated;
    };
    return RefinementSchema;
}(Schema));
exports.RefinementSchema = RefinementSchema;
// Transform schema
var TransformSchema = /** @class */ (function (_super) {
    __extends(TransformSchema, _super);
    function TransformSchema(innerSchema, transformer) {
        var _this = _super.call(this, { type: 'transform', innerSchema: innerSchema.getSchema() }) || this;
        _this.innerSchema = innerSchema;
        _this.transformer = transformer;
        return _this;
    }
    TransformSchema.prototype._validate = function (data) {
        var validated = this.innerSchema._validate(data);
        return this.transformer(validated);
    };
    return TransformSchema;
}(Schema));
exports.TransformSchema = TransformSchema;
