// Fast-Schema - Ultra-performance validation entry point
import { fast, ValidationError, Schema } from './api';

export { fast, ValidationError, Schema };

// Export tiered performance system for easy access
export const { normal, fast: fastTier, ultra, select, recommend, for: recommendations } = fast.performance;
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

// Legacy compatibility (deprecated - use fast for ultra-performance)
export const ZodError = ValidationError;
export type ZodType<T = any> = Schema<T>;
export type ZodSchema<T = any> = Schema<T>;

// Alias for the ultra-performance API
export const z = fast;

// Export benchmarking utilities
export * from './benchmarks';

// Re-export fast as default for ultra-performance
export default { fast, ValidationError, Schema };