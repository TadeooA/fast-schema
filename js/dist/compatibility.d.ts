import { ValidationError, ValidationIssue, Schema } from './core';
/**
 * @deprecated Use ValidationError instead
 * Legacy alias for ValidationError - maintained for Zod compatibility
 */
export declare const ZodError: typeof ValidationError;
/**
 * @deprecated Use ValidationIssue instead
 * Legacy alias for ValidationIssue - maintained for Zod compatibility
 */
export type ZodIssue = ValidationIssue;
/**
 * @deprecated Use Schema<T> instead
 * Legacy alias for Schema - maintained for Zod compatibility
 */
export type ZodType<Output = any, Def = any, Input = Output> = Schema<Output, Input>;
/**
 * @deprecated Use Schema metadata instead
 * Legacy type for Zod compatibility
 */
export type ZodTypeDef = any;
/**
 * @deprecated Use string literal types instead
 * Legacy type for Zod compatibility
 */
export type ZodFirstPartyTypeKind = string;
/**
 * @deprecated Use string instead
 * Legacy type for Zod compatibility
 */
export type ZodIssueCode = string;
/**
 * @deprecated Use string instead
 * Legacy type for Zod compatibility
 */
export type ZodParsedType = string;
/**
 * MIGRATION FROM ZOD:
 *
 * OLD (Zod):
 * ```typescript
 * import { z, ZodError } from 'zod';
 *
 * try {
 *   const result = schema.parse(data);
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     console.log(error.issues);
 *   }
 * }
 * ```
 *
 * NEW (Fast-Schema - Recommended):
 * ```typescript
 * import { z, ValidationError } from 'fast-schema';
 *
 * try {
 *   const result = schema.parse(data);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.log(error.issues);
 *   }
 * }
 * ```
 *
 * TRANSITIONAL (Fast-Schema with compatibility):
 * ```typescript
 * import { z, ZodError } from 'fast-schema'; // Still works!
 *
 * try {
 *   const result = schema.parse(data);
 * } catch (error) {
 *   if (error instanceof ZodError) { // Alias for ValidationError
 *     console.log(error.issues);
 *   }
 * }
 * ```
 */ 
//# sourceMappingURL=compatibility.d.ts.map