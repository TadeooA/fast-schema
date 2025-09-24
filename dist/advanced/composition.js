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
exports.DiscriminatedUnionSchema = exports.SchemaMerger = exports.KeyofSchema = exports.NonNullableSchema = exports.ReadonlySchema = exports.RequiredSchema = exports.DeepPartialSchema = void 0;
exports.makeDeepPartial = makeDeepPartial;
exports.makeRequired = makeRequired;
exports.makeReadonly = makeReadonly;
exports.makeNonNullable = makeNonNullable;
exports.keyof = keyof;
// Schema composition and manipulation utilities
var schema_1 = require("../base/schema");
var types_1 = require("../base/types");
var object_1 = require("../complex/object");
// Deep partial schema - makes nested objects optional too
var DeepPartialSchema = /** @class */ (function (_super) {
    __extends(DeepPartialSchema, _super);
    function DeepPartialSchema(innerSchema) {
        var _this = _super.call(this, {
            type: 'deep_partial',
            innerSchema: innerSchema.getSchema()
        }) || this;
        _this.innerSchema = innerSchema;
        return _this;
    }
    DeepPartialSchema.prototype._validate = function (data) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        // For objects, apply deep partial transformation
        if (this.innerSchema instanceof object_1.ObjectSchema) {
            var shape = this.innerSchema.getShape();
            var result = {};
            for (var _i = 0, _a = Object.entries(shape); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], schema = _b[1];
                if (key in data) {
                    try {
                        result[key] = makeDeepPartial(schema)._validate(data[key]);
                    }
                    catch (error) {
                        // Skip invalid properties in deep partial
                        continue;
                    }
                }
            }
            return result;
        }
        // For non-objects, just validate normally
        return this.innerSchema._validate(data);
    };
    return DeepPartialSchema;
}(schema_1.Schema));
exports.DeepPartialSchema = DeepPartialSchema;
// Required schema - opposite of partial
var RequiredSchema = /** @class */ (function (_super) {
    __extends(RequiredSchema, _super);
    function RequiredSchema(innerSchema) {
        var _this = _super.call(this, {
            type: 'required',
            innerSchema: innerSchema.getSchema()
        }) || this;
        _this.innerSchema = innerSchema;
        return _this;
    }
    RequiredSchema.prototype._validate = function (data) {
        // First validate with inner schema
        var validated = this.innerSchema._validate(data);
        // Check that all properties are present
        var shape = this.innerSchema.getShape();
        var result = validated;
        for (var _i = 0, _a = Object.keys(shape); _i < _a.length; _i++) {
            var key = _a[_i];
            if (result[key] === undefined) {
                throw new types_1.ValidationError([{
                        code: 'invalid_type',
                        path: [key],
                        message: 'Required property cannot be undefined'
                    }]);
            }
        }
        return result;
    };
    return RequiredSchema;
}(schema_1.Schema));
exports.RequiredSchema = RequiredSchema;
// ReadOnly schema
var ReadonlySchema = /** @class */ (function (_super) {
    __extends(ReadonlySchema, _super);
    function ReadonlySchema(innerSchema) {
        var _this = _super.call(this, {
            type: 'readonly',
            innerSchema: innerSchema.getSchema()
        }) || this;
        _this.innerSchema = innerSchema;
        return _this;
    }
    ReadonlySchema.prototype._validate = function (data) {
        var validated = this.innerSchema._validate(data);
        return Object.freeze(validated);
    };
    return ReadonlySchema;
}(schema_1.Schema));
exports.ReadonlySchema = ReadonlySchema;
// NonNullable schema
var NonNullableSchema = /** @class */ (function (_super) {
    __extends(NonNullableSchema, _super);
    function NonNullableSchema(innerSchema) {
        var _this = _super.call(this, {
            type: 'non_nullable',
            innerSchema: innerSchema.getSchema()
        }) || this;
        _this.innerSchema = innerSchema;
        return _this;
    }
    NonNullableSchema.prototype._validate = function (data) {
        if (data === null || data === undefined) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Value cannot be null or undefined',
                    received: String(data),
                    expected: 'non-null value'
                }]);
        }
        return this.innerSchema._validate(data);
    };
    return NonNullableSchema;
}(schema_1.Schema));
exports.NonNullableSchema = NonNullableSchema;
// Keyof schema for object keys
var KeyofSchema = /** @class */ (function (_super) {
    __extends(KeyofSchema, _super);
    function KeyofSchema(objectSchema) {
        var _this = this;
        var keys = Object.keys(objectSchema.getShape());
        _this = _super.call(this, {
            type: 'keyof',
            keys: keys,
            objectSchema: objectSchema.getSchema()
        }) || this;
        _this.objectSchema = objectSchema;
        return _this;
    }
    KeyofSchema.prototype._validate = function (data) {
        if (typeof data !== 'string') {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected string key',
                    received: typeof data,
                    expected: 'string'
                }]);
        }
        var keys = Object.keys(this.objectSchema.getShape());
        if (!keys.includes(data)) {
            throw new types_1.ValidationError([{
                    code: 'invalid_enum_value',
                    path: [],
                    message: "Expected one of: ".concat(keys.join(', ')),
                    received: data,
                    expected: keys.join(' | ')
                }]);
        }
        return data;
    };
    return KeyofSchema;
}(schema_1.Schema));
exports.KeyofSchema = KeyofSchema;
// Utility functions
function makeDeepPartial(schema) {
    return new DeepPartialSchema(schema);
}
function makeRequired(schema) {
    return new RequiredSchema(schema);
}
function makeReadonly(schema) {
    return new ReadonlySchema(schema);
}
function makeNonNullable(schema) {
    return new NonNullableSchema(schema);
}
function keyof(schema) {
    return new KeyofSchema(schema);
}
// Schema merger utility
var SchemaMerger = /** @class */ (function () {
    function SchemaMerger() {
    }
    SchemaMerger.merge = function (schemaA, schemaB) {
        var shapeA = schemaA.getShape();
        var shapeB = schemaB.getShape();
        var mergedShape = __assign(__assign({}, shapeA), shapeB);
        return new object_1.ObjectSchema(mergedShape);
    };
    SchemaMerger.deepMerge = function (schemaA, schemaB) {
        var shapeA = schemaA.getShape();
        var shapeB = schemaB.getShape();
        var mergedShape = __assign({}, shapeA);
        for (var _i = 0, _a = Object.entries(shapeB); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], schema = _b[1];
            if (key in mergedShape) {
                // If both schemas have the same key, try to merge them
                var existingSchema = mergedShape[key];
                if (existingSchema instanceof object_1.ObjectSchema && schema instanceof object_1.ObjectSchema) {
                    mergedShape[key] = this.deepMerge(existingSchema, schema);
                }
                else {
                    // Override with schema B
                    mergedShape[key] = schema;
                }
            }
            else {
                mergedShape[key] = schema;
            }
        }
        return new object_1.ObjectSchema(mergedShape);
    };
    return SchemaMerger;
}());
exports.SchemaMerger = SchemaMerger;
// Discriminated union helper
var DiscriminatedUnionSchema = /** @class */ (function (_super) {
    __extends(DiscriminatedUnionSchema, _super);
    function DiscriminatedUnionSchema(discriminator, schemas) {
        var _this = _super.call(this, {
            type: 'discriminated_union',
            discriminator: String(discriminator),
            schemas: schemas.map(function (s) { return s.getSchema(); })
        }) || this;
        _this.discriminator = discriminator;
        _this.schemas = schemas;
        return _this;
    }
    DiscriminatedUnionSchema.prototype._validate = function (data) {
        if (typeof data !== 'object' || data === null) {
            throw new types_1.ValidationError([{
                    code: 'invalid_type',
                    path: [],
                    message: 'Expected object for discriminated union',
                    received: typeof data,
                    expected: 'object'
                }]);
        }
        var obj = data;
        var discriminatorValue = obj[this.discriminator];
        if (discriminatorValue === undefined) {
            throw new types_1.ValidationError([{
                    code: 'missing_discriminator',
                    path: [this.discriminator],
                    message: "Missing discriminator field: ".concat(String(this.discriminator))
                }]);
        }
        // Try each schema until one matches the discriminator
        var errors = [];
        for (var _i = 0, _a = this.schemas; _i < _a.length; _i++) {
            var schema = _a[_i];
            try {
                var result = schema._validate(data);
                // Check if discriminator matches
                if (result[this.discriminator] === discriminatorValue) {
                    return result;
                }
            }
            catch (error) {
                if (error instanceof types_1.ValidationError) {
                    errors.push(error);
                }
            }
        }
        // If no schema matched, throw combined errors
        var allIssues = errors.flatMap(function (err) { return err.issues; });
        throw new types_1.ValidationError(allIssues.length > 0 ? allIssues : [{
                code: 'invalid_discriminated_union',
                path: [],
                message: "No schema matched discriminator value: ".concat(discriminatorValue)
            }]);
    };
    return DiscriminatedUnionSchema;
}(schema_1.Schema));
exports.DiscriminatedUnionSchema = DiscriminatedUnionSchema;
