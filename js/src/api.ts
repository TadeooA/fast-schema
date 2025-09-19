// Main API - the `z` object that users interact with
import { ValidationError } from './base/types';
import { Schema } from './base/schema';
import { StringSchema } from './primitives/string';
import { NumberSchema } from './primitives/number';
import { BooleanSchema, NullSchema, UndefinedSchema, AnySchema, UnknownSchema, NeverSchema } from './primitives/index';
import { ArraySchema } from './complex/array';
import { ObjectSchema } from './complex/object';
import { IntersectionSchema } from './advanced/intersection';
import { ConditionalSchema, conditional } from './advanced/conditional';
import { AsyncSchema, PromiseSchema } from './advanced/async';
import { AdvancedStringSchema } from './advanced/formats';
import { JITSchema, BatchValidator } from './advanced/performance';
import {
  makeDeepPartial,
  makeRequired,
  makeReadonly,
  makeNonNullable,
  keyof as keyofHelper,
  DiscriminatedUnionSchema
} from './advanced/composition';

// Union schema for multiple type options
export class UnionSchema<T extends [Schema<any>, Schema<any>, ...Schema<any>[]]> extends Schema<T[number]['_output']> {
  constructor(private options: T) {
    super({
      type: 'union',
      options: options.map(schema => schema.getSchema())
    });
  }

  _validate(data: unknown): T[number]['_output'] {
    const issues: ValidationError['issues'] = [];

    // Try each option until one succeeds
    for (let i = 0; i < this.options.length; i++) {
      try {
        return this.options[i]._validate(data);
      } catch (error) {
        if (error instanceof ValidationError) {
          issues.push(...error.issues.map(issue => ({
            ...issue,
            path: [`option_${i}`, ...issue.path]
          })));
        }
      }
    }

    // If no option succeeded, throw with all collected issues
    throw new ValidationError([{
      code: 'invalid_union',
      path: [],
      message: `Input did not match any union option. Tried ${this.options.length} options.`
    }]);
  }
}

// Literal schema for specific values
export class LiteralSchema<T extends string | number | boolean | null> extends Schema<T> {
  constructor(private value: T) {
    super({ type: 'literal', value });
  }

  _validate(data: unknown): T {
    if (data !== this.value) {
      throw new ValidationError([{
        code: 'invalid_literal',
        path: [],
        message: `Expected literal value: ${this.value}`,
        received: typeof data,
        expected: String(this.value)
      }]);
    }
    return data as T;
  }
}

// Enum schema for string enums
export class EnumSchema<T extends [string, ...string[]]> extends Schema<T[number]> {
  constructor(private values: T) {
    super({ type: 'enum', values });
  }

  _validate(data: unknown): T[number] {
    if (typeof data !== 'string' || !this.values.includes(data as T[number])) {
      throw new ValidationError([{
        code: 'invalid_enum_value',
        path: [],
        message: `Expected one of: ${this.values.join(', ')}`,
        received: typeof data,
        expected: this.values.join(' | ')
      }]);
    }
    return data as T[number];
  }
}

// Main z API object
export const z = {
  // Primitive types
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  null: () => new NullSchema(),
  undefined: () => new UndefinedSchema(),
  any: () => new AnySchema(),
  unknown: () => new UnknownSchema(),
  never: () => new NeverSchema(),
  void: () => new UndefinedSchema(),

  // Complex types
  array: <T>(schema: Schema<T>) => new ArraySchema(schema),
  object: <T extends Record<string, any>>(shape: { [K in keyof T]: Schema<T[K]> }) => new ObjectSchema(shape),

  // Union and literal types
  union: <T extends [Schema<any>, Schema<any>, ...Schema<any>[]]>(schemas: T) => new UnionSchema(schemas),
  intersection: <A, B>(schemaA: Schema<A>, schemaB: Schema<B>) => new IntersectionSchema(schemaA, schemaB),
  literal: <T extends string | number | boolean | null>(value: T) => new LiteralSchema(value),
  enum: <T extends [string, ...string[]]>(values: T) => new EnumSchema(values),

  // Advanced types
  discriminatedUnion: <T extends Record<string, any>>(
    discriminator: keyof T,
    schemas: Array<ObjectSchema<T>>
  ) => new DiscriminatedUnionSchema(discriminator, schemas),

  // Utility functions
  coerce: {
    string: () => new StringSchema().transform((data: any) => String(data)),
    number: () => new NumberSchema().transform((data: any) => Number(data)),
    boolean: () => new BooleanSchema().transform((data: any) => Boolean(data)),
    date: () => new StringSchema().transform((data: string) => new Date(data))
  },

  // Schema composition utilities
  deepPartial: <T>(schema: Schema<T>) => makeDeepPartial(schema),
  required: <T extends Record<string, any>>(schema: ObjectSchema<T>) => makeRequired(schema),
  readonly: <T>(schema: Schema<T>) => makeReadonly(schema),
  nonNullable: <T>(schema: Schema<T>) => makeNonNullable(schema),
  keyof: <T extends Record<string, any>>(schema: ObjectSchema<T>) => keyofHelper(schema),

  // Conditional validation
  conditional: conditional,

  // Performance utilities
  jit: <T>(schema: Schema<T>) => new JITSchema(schema),
  batch: <T>(schema: Schema<T>) => new BatchValidator(schema),

  // Advanced string with extended formats
  advancedString: () => new AdvancedStringSchema(),

  // Async validation
  async: <T>(validator: (data: unknown) => Promise<T>) => new AsyncSchema(validator),
  promise: <T>(schema: Schema<T>) => new PromiseSchema(schema),

  // Type utilities
  instanceof: <T extends new (...args: any[]) => any>(ctor: T) => {
    class InstanceofSchema extends Schema<InstanceType<T>> {
      _validate(data: unknown): InstanceType<T> {
        if (!(data instanceof ctor)) {
          throw new ValidationError([{
            code: 'invalid_type',
            path: [],
            message: `Expected instance of ${ctor.name}`,
            received: typeof data,
            expected: ctor.name
          }]);
        }
        return data as InstanceType<T>;
      }
    }
    return new InstanceofSchema({ type: 'instanceof', constructor: ctor.name });
  },

  // Advanced schemas
  lazy: <T>(getter: () => Schema<T>) => {
    class LazySchema extends Schema<T> {
      _validate(data: unknown): T {
        return getter()._validate(data);
      }
    }
    return new LazySchema({ type: 'lazy' });
  },

  custom: <T>(validator: (data: unknown) => data is T, message?: string) => {
    class CustomSchema extends Schema<T> {
      _validate(data: unknown): T {
        if (!validator(data)) {
          throw new ValidationError([{
            code: 'custom',
            path: [],
            message: message || 'Custom validation failed'
          }]);
        }
        return data as T;
      }
    }
    return new CustomSchema({ type: 'custom' });
  }
};

// Type inference helper
export type TypeOf<T extends Schema<any>> = T extends Schema<infer U> ? U : never;

// Alias for compatibility with Zod
export type infer<T extends Schema<any>> = TypeOf<T>;

// Re-export key types
export { ValidationError, Schema };
export type { SafeParseReturnType } from './base/types';