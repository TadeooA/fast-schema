
// ESM compatibility wrapper
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import the CommonJS version
const cjsModule = require('./index.js');

// Re-export individual exports
export const fast = cjsModule.fast;
export const ValidationError = cjsModule.ValidationError;
export const Schema = cjsModule.Schema;
export const normal = cjsModule.normal;
export const fastTier = cjsModule.fastTier;
export const ultra = cjsModule.ultra;
export const select = cjsModule.select;
export const recommend = cjsModule.recommend;
export const recommendations = cjsModule.recommendations;

export const StringSchema = cjsModule.StringSchema;
export const NumberSchema = cjsModule.NumberSchema;
export const BooleanSchema = cjsModule.BooleanSchema;
export const NullSchema = cjsModule.NullSchema;
export const UndefinedSchema = cjsModule.UndefinedSchema;
export const AnySchema = cjsModule.AnySchema;
export const UnknownSchema = cjsModule.UnknownSchema;
export const NeverSchema = cjsModule.NeverSchema;
export const ArraySchema = cjsModule.ArraySchema;
export const ObjectSchema = cjsModule.ObjectSchema;
export const UnionSchema = cjsModule.UnionSchema;
export const LiteralSchema = cjsModule.LiteralSchema;
export const EnumSchema = cjsModule.EnumSchema;
export const OptionalSchema = cjsModule.OptionalSchema;
export const NullableSchema = cjsModule.NullableSchema;
export const DefaultSchema = cjsModule.DefaultSchema;
export const RefinementSchema = cjsModule.RefinementSchema;
export const TransformSchema = cjsModule.TransformSchema;
export const IntersectionSchema = cjsModule.IntersectionSchema;
export const ConditionalSchema = cjsModule.ConditionalSchema;
export const AsyncSchema = cjsModule.AsyncSchema;
export const AsyncRefinementSchema = cjsModule.AsyncRefinementSchema;
export const PromiseSchema = cjsModule.PromiseSchema;
export const AdvancedStringSchema = cjsModule.AdvancedStringSchema;
export const StringFormats = cjsModule.StringFormats;
export const RegexCache = cjsModule.RegexCache;
export const SchemaCache = cjsModule.SchemaCache;
export const ValidationPool = cjsModule.ValidationPool;
export const JITSchema = cjsModule.JITSchema;
export const BatchValidator = cjsModule.BatchValidator;
export const StreamingValidator = cjsModule.StreamingValidator;
export const DeepPartialSchema = cjsModule.DeepPartialSchema;
export const RequiredSchema = cjsModule.RequiredSchema;
export const ReadonlySchema = cjsModule.ReadonlySchema;
export const NonNullableSchema = cjsModule.NonNullableSchema;
export const KeyofSchema = cjsModule.KeyofSchema;
export const SchemaMerger = cjsModule.SchemaMerger;
export const DiscriminatedUnionSchema = cjsModule.DiscriminatedUnionSchema;
export const FastSchemaWasm = cjsModule.FastSchemaWasm;
export const ZodError = cjsModule.ZodError;
export const z = cjsModule.z;

export default cjsModule;
