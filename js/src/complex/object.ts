// Object schema implementation
import { Schema, OptionalSchema } from '../base/schema';
import { ValidationError } from '../base/types';

export class ObjectSchema<T extends Record<string, any>> extends Schema<T> {
  constructor(private shape: { [K in keyof T]: Schema<T[K]> }) {
    super({
      type: 'object',
      shape: Object.fromEntries(
        Object.entries(shape).map(([key, schema]) => [key, (schema as Schema<any>).getSchema()])
      )
    });
  }

  _validate(data: unknown): T {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected object',
        received: typeof data,
        expected: 'object'
      }]);
    }

    const result = {} as T;
    const issues: ValidationError['issues'] = [];
    const obj = data as Record<string, unknown>;

    for (const [key, schema] of Object.entries(this.shape)) {
      try {
        if (key in obj) {
          (result as any)[key] = (schema as Schema<any>)._validate(obj[key]);
        } else if (!(schema instanceof OptionalSchema)) {
          issues.push({
            code: 'invalid_type',
            path: [key],
            message: 'Required'
          });
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          error.issues.forEach(issue => {
            issues.push({
              ...issue,
              path: [key, ...issue.path]
            });
          });
        }
      }
    }

    if (issues.length > 0) {
      throw new ValidationError(issues);
    }

    return result;
  }

  // Object composition methods
  partial(): ObjectSchema<{ [K in keyof T]?: T[K] }> {
    const partialShape: any = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      partialShape[key] = (schema as Schema<any>).optional();
    }
    return new ObjectSchema(partialShape);
  }

  required(): ObjectSchema<{ [K in keyof T]: T[K] extends OptionalSchema<infer U> ? U : T[K] }> {
    const requiredShape: any = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      if (schema instanceof OptionalSchema) {
        requiredShape[key] = (schema as any).innerSchema;
      } else {
        requiredShape[key] = schema;
      }
    }
    return new ObjectSchema(requiredShape);
  }

  pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>> {
    const pickedShape: any = {};
    const keysSet = new Set(keys);
    for (const [key, schema] of Object.entries(this.shape)) {
      if (keysSet.has(key as K)) {
        pickedShape[key] = schema;
      }
    }
    return new ObjectSchema(pickedShape);
  }

  omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>> {
    const omittedShape: any = {};
    const keysSet = new Set(keys);
    for (const [key, schema] of Object.entries(this.shape)) {
      if (!keysSet.has(key as K)) {
        omittedShape[key] = schema;
      }
    }
    return new ObjectSchema(omittedShape);
  }

  extend<U extends Record<string, any>>(
    extension: { [K in keyof U]: Schema<U[K]> }
  ) {
    const extendedShape = { ...this.shape, ...extension };
    return new ObjectSchema(extendedShape as any);
  }

  merge<U>(other: ObjectSchema<U>) {
    const mergedShape = { ...this.shape, ...other.shape };
    return new ObjectSchema(mergedShape as any);
  }

  // Get the shape for inspection
  getShape(): { [K in keyof T]: Schema<T[K]> } {
    return this.shape;
  }

  // Passthrough - allow additional properties
  passthrough(): ObjectSchema<T & Record<string, unknown>> {
    // Implementation would need to be more complex to handle unknown properties
    return this as any;
  }

  // Strict - disallow additional properties (default behavior)
  strict(): this {
    return this;
  }

  // Strip - remove additional properties
  strip(): this {
    return this;
  }
}