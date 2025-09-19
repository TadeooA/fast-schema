// Fast-Schema - Ultra-fast TypeScript-first schema validation
// Clean, modern API with superior performance

import {
  Schema,
  StringSchema,
  NumberSchema,
  BooleanSchema,
  ArraySchema,
  ObjectSchema,
  UnionSchema,
  IntersectionSchema,
  RefinementSchema,
  TransformSchema,
  AsyncRefinementSchema,
  ValidationError,
  ValidationIssue,
  AsyncValidationOptions,
  AsyncRefinementFunction,
  AsyncRefinementConfig,
  AsyncCacheConfig,
  DebouncedAsyncFunction,
  ValidationDebounceManager,
  globalDebounceManager,
  createDebouncedValidator,
  debounceAsyncFunction,
  HtmlElementType,
  AccessibilityLevel,
  HtmlProps,
  ReactComponentSchema,
  ReactElement,
  BatchValidator,
  BatchValidationItem,
  BatchValidationOptions,
  BatchValidationResult,
  BatchValidationStats
} from './core';

// Core exports - Fast-Schema's clean API
export {
  ValidationError,
  ValidationIssue,
  AsyncValidationOptions,
  AsyncRefinementFunction,
  AsyncRefinementConfig,
  AsyncCacheConfig,
  DebouncedAsyncFunction,
  ValidationDebounceManager,
  globalDebounceManager,
  createDebouncedValidator,
  debounceAsyncFunction,
  BatchValidator,
  BatchValidationItem,
  BatchValidationOptions,
  BatchValidationResult,
  BatchValidationStats
};

// Type inference helpers - Fast-Schema's TypeScript magic
export type infer<T extends Schema<any>> = T['_output'];
export type input<T extends Schema<any>> = T['_input'];
export type output<T extends Schema<any>> = T['_output'];

// Main Fast-Schema namespace - powerful and intuitive validation API
export const z = {
  // Core types
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  array: <T extends Schema<any>>(schema: T) => new ArraySchema(schema),
  object: <T extends Record<string, Schema<any>>>(shape: T) => new ObjectSchema(shape),

  // Union and intersection
  union: <T extends [Schema<any>, Schema<any>, ...Schema<any>[]]>(schemas: T) =>
    new UnionSchema(schemas),
  intersection: <A extends Schema<any>, B extends Schema<any>>(left: A, right: B) =>
    new IntersectionSchema(left, right),

  // Utility types
  literal: <T extends string | number | boolean>(value: T) => {
    return new StringSchema().refine((data) => data === value, `Expected literal value: ${value}`);
  },

  null: () => {
    return new Schema<null>({ type: 'null' }) {
      protected _validate(data: unknown): null {
        if (data !== null) {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: 'Expected null',
            received: typeof data,
            expected: 'null'
          }]);
        }
        return null;
      }
    };
  },

  undefined: () => {
    return new Schema<undefined>({ type: 'undefined' }) {
      protected _validate(data: unknown): undefined {
        if (data !== undefined) {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: 'Expected undefined',
            received: typeof data,
            expected: 'undefined'
          }]);
        }
        return undefined;
      }
    };
  },

  void: () => z.undefined(),

  any: () => {
    return new Schema<any>({ type: 'any' }) {
      protected _validate(data: unknown): any {
        return data;
      }
    };
  },

  unknown: () => {
    return new Schema<unknown>({ type: 'unknown' }) {
      protected _validate(data: unknown): unknown {
        return data;
      }
    };
  },

  never: () => {
    return new Schema<never>({ type: 'never' }) {
      protected _validate(data: unknown): never {
        throw new ValidationError([{
          code: 'invalid_type',
          path: [],
          message: 'Never type - no value is valid'
        }]);
      }
    };
  },

  // Advanced types
  custom: <T>(validator: (data: unknown) => data is T, message?: string) => {
    return new Schema<T>({ type: 'custom' }) {
      protected _validate(data: unknown): T {
        if (!validator(data)) {
          throw new ValidationError([{
            code: 'custom',
            path: [],
            message: message || 'Custom validation failed'
          }]);
        }
        return data as T;
      }
    };
  },

  // Date type
  date: (): Schema<Date> => {
    return new Schema<Date>({ type: 'date' }) {
      protected _validate(data: unknown): Date {
        if (data instanceof Date) {
          if (isNaN(data.getTime())) {
            throw new ValidationError([{
              code: 'invalid_date',
              path: [],
              message: 'Invalid date'
            }]);
          }
          return data;
        }

        if (typeof data === 'string' || typeof data === 'number') {
          const parsed = new Date(data);
          if (isNaN(parsed.getTime())) {
            throw new ValidationError([{
              code: 'invalid_date',
              path: [],
              message: 'Invalid date'
            }]);
          }
          return parsed;
        }

        throw new ValidationError([{
          code: 'invalid_type',
          path: [],
          message: 'Expected date',
          received: typeof data,
          expected: 'date'
        }]);
      }
    };
  },

  // BigInt type
  bigint: (): Schema<bigint> => {
    return new Schema<bigint>({ type: 'bigint' }) {
      protected _validate(data: unknown): bigint {
        if (typeof data === 'bigint') {
          return data;
        }

        if (typeof data === 'string' || typeof data === 'number') {
          try {
            return BigInt(data);
          } catch {
            throw new ValidationError([{
              code: 'invalid_type',
              path: [],
              message: 'Invalid bigint',
              received: typeof data,
              expected: 'bigint'
            }]);
          }
        }

        throw new ValidationError([{
          code: 'invalid_type',
          path: [],
          message: 'Expected bigint',
          received: typeof data,
          expected: 'bigint'
        }]);
      }
    };
  },

  // Symbol type
  symbol: (): Schema<symbol> => {
    return new Schema<symbol>({ type: 'symbol' }) {
      protected _validate(data: unknown): symbol {
        if (typeof data !== 'symbol') {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: 'Expected symbol',
            received: typeof data,
            expected: 'symbol'
          }]);
        }
        return data;
      }
    };
  },

  // Function type
  function: (): Schema<Function> => {
    return new Schema<Function>({ type: 'function' }) {
      protected _validate(data: unknown): Function {
        if (typeof data !== 'function') {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: 'Expected function',
            received: typeof data,
            expected: 'function'
          }]);
        }
        return data;
      }
    };
  },

  // Record type
  record: <T extends Schema<any>>(valueSchema: T): Schema<Record<string, T['_output']>> => {
    return new Schema<Record<string, T['_output']>>({ type: 'record', valueSchema: valueSchema.getSchema() }) {
      protected _validate(data: unknown): Record<string, T['_output']> {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: 'Expected object',
            received: typeof data,
            expected: 'object'
          }]);
        }

        const result: Record<string, T['_output']> = {};
        const obj = data as Record<string, unknown>;

        for (const [key, value] of Object.entries(obj)) {
          try {
            result[key] = valueSchema._validate(value);
          } catch (error) {
            if (error instanceof ValidationError) {
              const issues = error.issues.map(issue => ({
                ...issue,
                path: [key, ...issue.path]
              }));
              throw new ValidationError(issues);
            }
            throw error;
          }
        }

        return result;
      }
    };
  },

  // Tuple type
  tuple: <T extends [Schema<any>, ...Schema<any>[]]>(schemas: T): Schema<{ [K in keyof T]: T[K]['_output'] }> => {
    return new Schema<{ [K in keyof T]: T[K]['_output'] }>({ type: 'tuple', schemas: schemas.map(s => s.getSchema()) }) {
      protected _validate(data: unknown): { [K in keyof T]: T[K]['_output'] } {
        if (!Array.isArray(data)) {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: 'Expected array',
            received: typeof data,
            expected: 'array'
          }]);
        }

        if (data.length !== schemas.length) {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: `Expected tuple of length ${schemas.length}, got ${data.length}`
          }]);
        }

        const result: any = [];
        for (let i = 0; i < schemas.length; i++) {
          try {
            result[i] = schemas[i]._validate(data[i]);
          } catch (error) {
            if (error instanceof ValidationError) {
              const issues = error.issues.map(issue => ({
                ...issue,
                path: [i, ...issue.path]
              }));
              throw new ValidationError(issues);
            }
            throw error;
          }
        }

        return result as { [K in keyof T]: T[K]['_output'] };
      }
    };
  },

  // Enum-like functionality
  enum: <T extends readonly [string, ...string[]]>(values: T): Schema<T[number]> => {
    return z.union(values.map(val => z.literal(val)) as any);
  },

  nativeEnum: <T extends Record<string, string | number>>(enumObject: T): Schema<T[keyof T]> => {
    const values = Object.values(enumObject) as (string | number)[];
    return z.union(values.map(val => z.literal(val)) as any);
  },

  // Discriminated union for advanced type safety
  discriminatedUnion: <T extends string, U extends [Schema<any>, Schema<any>, ...Schema<any>[]]>(
    discriminator: T,
    schemas: U
  ) => {
    return z.union(schemas);
  },

  // Preprocessing
  preprocess: <T extends Schema<any>>(
    preprocess: (input: unknown) => unknown,
    schema: T
  ): Schema<T['_output']> => {
    return new Schema<T['_output']>({ type: 'preprocess' }) {
      protected _validate(data: unknown): T['_output'] {
        const preprocessed = preprocess(data);
        return schema._validate(preprocessed);
      }
    };
  },

  // Lazy evaluation (for recursive schemas)
  lazy: <T extends Schema<any>>(getter: () => T): Schema<T['_output']> => {
    let cachedSchema: T | null = null;

    return new Schema<T['_output']>({ type: 'lazy' }) {
      protected _validate(data: unknown): T['_output'] {
        if (!cachedSchema) {
          cachedSchema = getter();
        }
        return cachedSchema._validate(data);
      }
    };
  },

  // Map type
  map: <K extends Schema<any>, V extends Schema<any>>(
    keySchema: K,
    valueSchema: V
  ): Schema<Map<K['_output'], V['_output']>> => {
    return new Schema<Map<K['_output'], V['_output']>>({ type: 'map' }) {
      protected _validate(data: unknown): Map<K['_output'], V['_output']> {
        if (!(data instanceof Map)) {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: 'Expected Map',
            received: typeof data,
            expected: 'map'
          }]);
        }

        const result = new Map<K['_output'], V['_output']>();
        let index = 0;

        for (const [key, value] of data.entries()) {
          try {
            const validatedKey = keySchema._validate(key);
            const validatedValue = valueSchema._validate(value);
            result.set(validatedKey, validatedValue);
          } catch (error) {
            if (error instanceof ValidationError) {
              const issues = error.issues.map(issue => ({
                ...issue,
                path: [index, ...issue.path]
              }));
              throw new ValidationError(issues);
            }
            throw error;
          }
          index++;
        }

        return result;
      }
    };
  },

  // Set type
  set: <T extends Schema<any>>(schema: T): Schema<Set<T['_output']>> => {
    return new Schema<Set<T['_output']>>({ type: 'set' }) {
      protected _validate(data: unknown): Set<T['_output']> {
        if (!(data instanceof Set)) {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: 'Expected Set',
            received: typeof data,
            expected: 'set'
          }]);
        }

        const result = new Set<T['_output']>();
        let index = 0;

        for (const item of data) {
          try {
            const validated = schema._validate(item);
            result.add(validated);
          } catch (error) {
            if (error instanceof ValidationError) {
              const issues = error.issues.map(issue => ({
                ...issue,
                path: [index, ...issue.path]
              }));
              throw new ValidationError(issues);
            }
            throw error;
          }
          index++;
        }

        return result;
      }
    };
  },

  // Promise type
  promise: <T extends Schema<any>>(schema: T): Schema<Promise<T['_output']>> => {
    return new Schema<Promise<T['_output']>>({ type: 'promise' }) {
      protected _validate(data: unknown): Promise<T['_output']> {
        if (!(data instanceof Promise)) {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: 'Expected Promise',
            received: typeof data,
            expected: 'promise'
          }]);
        }

        return data.then(value => schema._validate(value));
      }
    };
  },

  // instanceof type
  instanceof: <T extends new (...args: any[]) => any>(cls: T): Schema<InstanceType<T>> => {
    return new Schema<InstanceType<T>>({ type: 'instanceof' }) {
      protected _validate(data: unknown): InstanceType<T> {
        if (!(data instanceof cls)) {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: `Expected instance of ${cls.name}`,
            received: typeof data,
            expected: cls.name
          }]);
        }
        return data as InstanceType<T>;
      }
    };
  },

  // Batch validation methods
  batchValidateAsync: async <T extends BatchValidationItem[]>(
    items: T,
    options?: BatchValidationOptions
  ): Promise<{ [K in keyof T]: BatchValidationResult<T[K] extends BatchValidationItem<infer U> ? U : any> }> => {
    const validator = new BatchValidator(options);
    return validator.validateAsync(items, options) as Promise<any>;
  },

  createBatchValidator: (options?: BatchValidationOptions): BatchValidator => {
    return new BatchValidator(options);
  },

  // Utility to create batch items from schema and data array
  createBatch: <T>(
    schema: Schema<T>,
    dataArray: unknown[],
    idGenerator?: (index: number, data: unknown) => string | number
  ): BatchValidationItem<T>[] => {
    return BatchValidator.createBatch(schema, dataArray, idGenerator);
  }
};

// =============================================================================
// COMPATIBILITY LAYER - For easy migration from other libraries
// =============================================================================

// Zod compatibility aliases (optional for migration)
export { ValidationError as ZodError };
export type ZodIssue = ValidationIssue;
export type ZodIssueCode = string;
export type ZodParsedType = string;
export type ZodType<Output = any, Def = any, Input = Output> = Schema<Output, Input>;
export type ZodTypeDef = any;
export type ZodFirstPartyTypeKind = string;

// Fast-Schema native types (recommended for new projects)
export type SchemaType<Output = any, Input = Output> = Schema<Output, Input>;
export type SchemaError = ValidationError;
export type SchemaIssue = ValidationIssue;
export type IssueCode = string;
export type ParsedType = string;