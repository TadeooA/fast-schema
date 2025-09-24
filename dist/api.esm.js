
// ESM compatibility wrapper
import createRequire from 'module';
const require = createRequire(import.meta.url);

// Import the CommonJS version
const cjsModule = require('./api.js');

// Re-export everything
export const {
  fast, ValidationError, Schema, normal, fastTier, ultra, select, recommend, recommendations,
  StringSchema, NumberSchema, BooleanSchema, NullSchema, UndefinedSchema, AnySchema,
  UnknownSchema, NeverSchema, ArraySchema, ObjectSchema, UnionSchema, LiteralSchema,
  EnumSchema, OptionalSchema, NullableSchema, DefaultSchema, RefinementSchema,
  TransformSchema, IntersectionSchema, ConditionalSchema, AsyncSchema, AsyncRefinementSchema,
  PromiseSchema, AdvancedStringSchema, StringFormats, RegexCache, SchemaCache, ValidationPool,
  JITSchema, BatchValidator, StreamingValidator, DeepPartialSchema, RequiredSchema,
  ReadonlySchema, NonNullableSchema, KeyofSchema, SchemaMerger, DiscriminatedUnionSchema,
  FastSchemaWasm, ZodError, z
} = cjsModule;

export default cjsModule;
