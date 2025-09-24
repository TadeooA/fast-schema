"use strict";
// =============================================================================
// COMPATIBILITY LAYER - Migration helpers
// =============================================================================
//
// This module provides compatibility aliases for migrating from other schema
// validation libraries. These are optional and can be gradually phased out
// as you adopt Fast-Schema's clean, native API.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodError = void 0;
const core_1 = require("./core");
// =============================================================================
// ZOD COMPATIBILITY ALIASES
// =============================================================================
/**
 * @deprecated Use ValidationError instead
 * Legacy alias for ValidationError - maintained for Zod compatibility
 */
exports.ZodError = core_1.ValidationError;
// =============================================================================
// MIGRATION GUIDE
// =============================================================================
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
//# sourceMappingURL=compatibility.js.map