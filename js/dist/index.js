"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.z = exports.ZodError = exports.FastSchemaWasm = exports.DiscriminatedUnionSchema = exports.SchemaMerger = exports.KeyofSchema = exports.NonNullableSchema = exports.ReadonlySchema = exports.RequiredSchema = exports.DeepPartialSchema = exports.StreamingValidator = exports.BatchValidator = exports.JITSchema = exports.ValidationPool = exports.SchemaCache = exports.RegexCache = exports.StringFormats = exports.AdvancedStringSchema = exports.PromiseSchema = exports.AsyncRefinementSchema = exports.AsyncSchema = exports.ConditionalSchema = exports.IntersectionSchema = exports.TransformSchema = exports.RefinementSchema = exports.DefaultSchema = exports.NullableSchema = exports.OptionalSchema = exports.EnumSchema = exports.LiteralSchema = exports.UnionSchema = exports.ObjectSchema = exports.ArraySchema = exports.NeverSchema = exports.UnknownSchema = exports.AnySchema = exports.UndefinedSchema = exports.NullSchema = exports.BooleanSchema = exports.NumberSchema = exports.StringSchema = exports.recommendations = exports.recommend = exports.select = exports.ultra = exports.fastTier = exports.normal = exports.Schema = exports.ValidationError = exports.fast = void 0;
// Fast-Schema - Ultra-performance validation entry point
const api_1 = require("./api");
Object.defineProperty(exports, "fast", { enumerable: true, get: function () { return api_1.fast; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return api_1.ValidationError; } });
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return api_1.Schema; } });
// Export tiered performance system for easy access
_a = api_1.fast.performance, exports.normal = _a.normal, exports.fastTier = _a.fast, exports.ultra = _a.ultra, exports.select = _a.select, exports.recommend = _a.recommend, exports.recommendations = _a.for;
// Export individual schema classes for advanced usage
var string_1 = require("./primitives/string");
Object.defineProperty(exports, "StringSchema", { enumerable: true, get: function () { return string_1.StringSchema; } });
var number_1 = require("./primitives/number");
Object.defineProperty(exports, "NumberSchema", { enumerable: true, get: function () { return number_1.NumberSchema; } });
var index_1 = require("./primitives/index");
Object.defineProperty(exports, "BooleanSchema", { enumerable: true, get: function () { return index_1.BooleanSchema; } });
Object.defineProperty(exports, "NullSchema", { enumerable: true, get: function () { return index_1.NullSchema; } });
Object.defineProperty(exports, "UndefinedSchema", { enumerable: true, get: function () { return index_1.UndefinedSchema; } });
Object.defineProperty(exports, "AnySchema", { enumerable: true, get: function () { return index_1.AnySchema; } });
Object.defineProperty(exports, "UnknownSchema", { enumerable: true, get: function () { return index_1.UnknownSchema; } });
Object.defineProperty(exports, "NeverSchema", { enumerable: true, get: function () { return index_1.NeverSchema; } });
var array_1 = require("./complex/array");
Object.defineProperty(exports, "ArraySchema", { enumerable: true, get: function () { return array_1.ArraySchema; } });
var object_1 = require("./complex/object");
Object.defineProperty(exports, "ObjectSchema", { enumerable: true, get: function () { return object_1.ObjectSchema; } });
var api_2 = require("./api");
Object.defineProperty(exports, "UnionSchema", { enumerable: true, get: function () { return api_2.UnionSchema; } });
Object.defineProperty(exports, "LiteralSchema", { enumerable: true, get: function () { return api_2.LiteralSchema; } });
Object.defineProperty(exports, "EnumSchema", { enumerable: true, get: function () { return api_2.EnumSchema; } });
// Export utility classes
var schema_1 = require("./base/schema");
Object.defineProperty(exports, "OptionalSchema", { enumerable: true, get: function () { return schema_1.OptionalSchema; } });
Object.defineProperty(exports, "NullableSchema", { enumerable: true, get: function () { return schema_1.NullableSchema; } });
Object.defineProperty(exports, "DefaultSchema", { enumerable: true, get: function () { return schema_1.DefaultSchema; } });
Object.defineProperty(exports, "RefinementSchema", { enumerable: true, get: function () { return schema_1.RefinementSchema; } });
Object.defineProperty(exports, "TransformSchema", { enumerable: true, get: function () { return schema_1.TransformSchema; } });
// Export advanced features
var index_2 = require("./advanced/index");
Object.defineProperty(exports, "IntersectionSchema", { enumerable: true, get: function () { return index_2.IntersectionSchema; } });
Object.defineProperty(exports, "ConditionalSchema", { enumerable: true, get: function () { return index_2.ConditionalSchema; } });
Object.defineProperty(exports, "AsyncSchema", { enumerable: true, get: function () { return index_2.AsyncSchema; } });
Object.defineProperty(exports, "AsyncRefinementSchema", { enumerable: true, get: function () { return index_2.AsyncRefinementSchema; } });
Object.defineProperty(exports, "PromiseSchema", { enumerable: true, get: function () { return index_2.PromiseSchema; } });
Object.defineProperty(exports, "AdvancedStringSchema", { enumerable: true, get: function () { return index_2.AdvancedStringSchema; } });
Object.defineProperty(exports, "StringFormats", { enumerable: true, get: function () { return index_2.StringFormats; } });
Object.defineProperty(exports, "RegexCache", { enumerable: true, get: function () { return index_2.RegexCache; } });
Object.defineProperty(exports, "SchemaCache", { enumerable: true, get: function () { return index_2.SchemaCache; } });
Object.defineProperty(exports, "ValidationPool", { enumerable: true, get: function () { return index_2.ValidationPool; } });
Object.defineProperty(exports, "JITSchema", { enumerable: true, get: function () { return index_2.JITSchema; } });
Object.defineProperty(exports, "BatchValidator", { enumerable: true, get: function () { return index_2.BatchValidator; } });
Object.defineProperty(exports, "StreamingValidator", { enumerable: true, get: function () { return index_2.StreamingValidator; } });
Object.defineProperty(exports, "DeepPartialSchema", { enumerable: true, get: function () { return index_2.DeepPartialSchema; } });
Object.defineProperty(exports, "RequiredSchema", { enumerable: true, get: function () { return index_2.RequiredSchema; } });
Object.defineProperty(exports, "ReadonlySchema", { enumerable: true, get: function () { return index_2.ReadonlySchema; } });
Object.defineProperty(exports, "NonNullableSchema", { enumerable: true, get: function () { return index_2.NonNullableSchema; } });
Object.defineProperty(exports, "KeyofSchema", { enumerable: true, get: function () { return index_2.KeyofSchema; } });
Object.defineProperty(exports, "SchemaMerger", { enumerable: true, get: function () { return index_2.SchemaMerger; } });
Object.defineProperty(exports, "DiscriminatedUnionSchema", { enumerable: true, get: function () { return index_2.DiscriminatedUnionSchema; } });
var index_3 = require("./wasm/index");
Object.defineProperty(exports, "FastSchemaWasm", { enumerable: true, get: function () { return index_3.FastSchemaWasm; } });
// Legacy compatibility (deprecated - use fast for ultra-performance)
exports.ZodError = api_1.ValidationError;
// Alias for the ultra-performance API
exports.z = api_1.fast;
// Export benchmarking utilities
__exportStar(require("./benchmarks"), exports);
// Re-export fast as default for ultra-performance
exports.default = { fast: api_1.fast, ValidationError: api_1.ValidationError, Schema: api_1.Schema };
//# sourceMappingURL=index.js.map