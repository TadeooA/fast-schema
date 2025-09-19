// Schema composition and manipulation utilities
import { Schema } from '../base/schema';
import { ValidationError } from '../base/types';
import { ObjectSchema } from '../complex/object';

// Deep partial schema - makes nested objects optional too
export class DeepPartialSchema<T> extends Schema<DeepPartial<T>> {
  constructor(private innerSchema: Schema<T>) {
    super({
      type: 'deep_partial',
      innerSchema: innerSchema.getSchema()
    });
  }

  _validate(data: unknown): DeepPartial<T> {
    if (typeof data !== 'object' || data === null) {
      return data as DeepPartial<T>;
    }

    // For objects, apply deep partial transformation
    if (this.innerSchema instanceof ObjectSchema) {
      const shape = (this.innerSchema as any).getShape();
      const result: any = {};

      for (const [key, schema] of Object.entries(shape)) {
        if (key in (data as any)) {
          try {
            result[key] = makeDeepPartial(schema as Schema<any>)._validate((data as any)[key]);
          } catch (error) {
            // Skip invalid properties in deep partial
            continue;
          }
        }
      }

      return result as DeepPartial<T>;
    }

    // For non-objects, just validate normally
    return this.innerSchema._validate(data) as DeepPartial<T>;
  }
}

// Required schema - opposite of partial
export class RequiredSchema<T> extends Schema<Required<T>> {
  constructor(private innerSchema: ObjectSchema<T>) {
    super({
      type: 'required',
      innerSchema: innerSchema.getSchema()
    });
  }

  _validate(data: unknown): Required<T> {
    // First validate with inner schema
    const validated = this.innerSchema._validate(data);

    // Check that all properties are present
    const shape = (this.innerSchema as any).getShape();
    const result = validated as any;

    for (const key of Object.keys(shape)) {
      if (result[key] === undefined) {
        throw new ValidationError([{
          code: 'invalid_type',
          path: [key],
          message: 'Required property cannot be undefined'
        }]);
      }
    }

    return result as Required<T>;
  }
}

// ReadOnly schema
export class ReadonlySchema<T> extends Schema<Readonly<T>> {
  constructor(private innerSchema: Schema<T>) {
    super({
      type: 'readonly',
      innerSchema: innerSchema.getSchema()
    });
  }

  _validate(data: unknown): Readonly<T> {
    const validated = this.innerSchema._validate(data);
    return Object.freeze(validated) as Readonly<T>;
  }
}

// NonNullable schema
export class NonNullableSchema<T> extends Schema<NonNullable<T>> {
  constructor(private innerSchema: Schema<T>) {
    super({
      type: 'non_nullable',
      innerSchema: innerSchema.getSchema()
    });
  }

  _validate(data: unknown): NonNullable<T> {
    if (data === null || data === undefined) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Value cannot be null or undefined',
        received: String(data),
        expected: 'non-null value'
      }]);
    }

    return this.innerSchema._validate(data) as NonNullable<T>;
  }
}

// Keyof schema for object keys
export class KeyofSchema<T extends Record<string, any>> extends Schema<keyof T> {
  constructor(private objectSchema: ObjectSchema<T>) {
    const keys = Object.keys((objectSchema as any).getShape()) as (keyof T)[];
    super({
      type: 'keyof',
      keys: keys,
      objectSchema: objectSchema.getSchema()
    });
  }

  _validate(data: unknown): keyof T {
    if (typeof data !== 'string') {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected string key',
        received: typeof data,
        expected: 'string'
      }]);
    }

    const keys = Object.keys((this.objectSchema as any).getShape());
    if (!keys.includes(data)) {
      throw new ValidationError([{
        code: 'invalid_enum_value',
        path: [],
        message: `Expected one of: ${keys.join(', ')}`,
        received: data,
        expected: keys.join(' | ')
      }]);
    }

    return data as keyof T;
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Utility functions
export function makeDeepPartial<T>(schema: Schema<T>): DeepPartialSchema<T> {
  return new DeepPartialSchema(schema);
}

export function makeRequired<T extends Record<string, any>>(schema: ObjectSchema<T>): RequiredSchema<T> {
  return new RequiredSchema(schema);
}

export function makeReadonly<T>(schema: Schema<T>): ReadonlySchema<T> {
  return new ReadonlySchema(schema);
}

export function makeNonNullable<T>(schema: Schema<T>): NonNullableSchema<T> {
  return new NonNullableSchema(schema);
}

export function keyof<T extends Record<string, any>>(schema: ObjectSchema<T>): KeyofSchema<T> {
  return new KeyofSchema(schema);
}

// Schema merger utility
export class SchemaMerger {
  static merge<A, B>(schemaA: ObjectSchema<A>, schemaB: ObjectSchema<B>): ObjectSchema<A & B> {
    const shapeA = (schemaA as any).getShape();
    const shapeB = (schemaB as any).getShape();
    const mergedShape = { ...shapeA, ...shapeB };
    return new ObjectSchema(mergedShape);
  }

  static deepMerge<A, B>(schemaA: ObjectSchema<A>, schemaB: ObjectSchema<B>): ObjectSchema<A & B> {
    const shapeA = (schemaA as any).getShape();
    const shapeB = (schemaB as any).getShape();

    const mergedShape: any = { ...shapeA };

    for (const [key, schema] of Object.entries(shapeB)) {
      if (key in mergedShape) {
        // If both schemas have the same key, try to merge them
        const existingSchema = mergedShape[key];
        if (existingSchema instanceof ObjectSchema && schema instanceof ObjectSchema) {
          mergedShape[key] = this.deepMerge(existingSchema, schema);
        } else {
          // Override with schema B
          mergedShape[key] = schema;
        }
      } else {
        mergedShape[key] = schema;
      }
    }

    return new ObjectSchema(mergedShape);
  }
}

// Discriminated union helper
export class DiscriminatedUnionSchema<T extends Record<string, any>> extends Schema<T> {
  constructor(
    private discriminator: keyof T,
    private schemas: Array<ObjectSchema<T>>
  ) {
    super({
      type: 'discriminated_union',
      discriminator: String(discriminator),
      schemas: schemas.map(s => s.getSchema())
    });
  }

  _validate(data: unknown): T {
    if (typeof data !== 'object' || data === null) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected object for discriminated union',
        received: typeof data,
        expected: 'object'
      }]);
    }

    const obj = data as Record<string, unknown>;
    const discriminatorValue = obj[this.discriminator as string];

    if (discriminatorValue === undefined) {
      throw new ValidationError([{
        code: 'missing_discriminator',
        path: [this.discriminator as string],
        message: `Missing discriminator field: ${String(this.discriminator)}`
      }]);
    }

    // Try each schema until one matches the discriminator
    const errors: ValidationError[] = [];

    for (const schema of this.schemas) {
      try {
        const result = schema._validate(data);
        // Check if discriminator matches
        if ((result as any)[this.discriminator] === discriminatorValue) {
          return result as T;
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(error);
        }
      }
    }

    // If no schema matched, throw combined errors
    const allIssues = errors.flatMap(err => err.issues);
    throw new ValidationError(allIssues.length > 0 ? allIssues : [{
      code: 'invalid_discriminated_union',
      path: [],
      message: `No schema matched discriminator value: ${discriminatorValue}`
    }]);
  }
}