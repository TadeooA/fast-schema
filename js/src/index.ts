// Fast-Schema - Main entry point for the modular version
import { z, ValidationError, Schema } from './api';

export { z, ValidationError, Schema };
export type { infer, TypeOf } from './api';
export type { SafeParseReturnType } from './base/types';

// Export individual schema classes for advanced usage
export { StringSchema } from './primitives/string';
export { NumberSchema } from './primitives/number';
export { BooleanSchema, NullSchema, UndefinedSchema, AnySchema, UnknownSchema, NeverSchema } from './primitives/index';
export { ArraySchema } from './complex/array';
export { ObjectSchema } from './complex/object';
export { UnionSchema, LiteralSchema, EnumSchema } from './api';

// Export utility classes
export { OptionalSchema, NullableSchema, DefaultSchema, RefinementSchema, TransformSchema } from './base/schema';

// Export advanced features
export {
  IntersectionSchema,
  ConditionalSchema,
  AsyncSchema,
  AsyncRefinementSchema,
  PromiseSchema,
  AdvancedStringSchema,
  StringFormats,
  RegexCache,
  SchemaCache,
  ValidationPool,
  JITSchema,
  BatchValidator,
  StreamingValidator,
  DeepPartialSchema,
  RequiredSchema,
  ReadonlySchema,
  NonNullableSchema,
  KeyofSchema,
  SchemaMerger,
  DiscriminatedUnionSchema
} from './advanced/index';

// Export WASM features (optional - will gracefully degrade if not available)
export type { HybridConfig, WasmZ } from './wasm/index';
export { FastSchemaWasm } from './wasm/index';

// Compatibility exports for easy migration
export const ZodError = ValidationError;
export type ZodType<T = any> = Schema<T>;
export type ZodSchema<T = any> = Schema<T>;

// Export benchmarking utilities
export * from './benchmarks';

// Re-export z as default for convenience
export default { z, ValidationError, Schema };