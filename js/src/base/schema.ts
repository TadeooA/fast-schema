// Core Schema base class with essential methods
import { ValidationError, SchemaDefinition, SafeParseReturnType } from './types';

// Re-export ValidationError for convenience
export { ValidationError };

export abstract class Schema<Output = any, Input = Output> {
  readonly _type!: Output;
  readonly _output!: Output;
  readonly _input!: Input;
  constructor(protected definition: SchemaDefinition) {}

  // Abstract method - must be implemented by subclasses
  abstract _validate(data: unknown): Output;

  parse(data: unknown): Output {
    return this._validate(data);
  }

  safeParse(data: unknown): SafeParseReturnType<Input, Output> {
    try {
      const result = this._validate(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error };
      }
      return {
        success: false,
        error: new ValidationError([{
          code: 'unknown_error',
          path: [],
          message: error instanceof Error ? error.message : 'Unknown error'
        }])
      };
    }
  }

  getSchema(): SchemaDefinition {
    return this.definition;
  }

  // Transformation methods
  optional(): OptionalSchema<Output> {
    return new OptionalSchema(this as any);
  }

  nullable(): NullableSchema<Output> {
    return new NullableSchema(this as any);
  }

  default(value: Output): DefaultSchema<Output> {
    return new DefaultSchema(this as any, value);
  }

  // Refinement and transformation
  refine<T extends Output>(
    predicate: (data: T) => boolean,
    message: string | { message: string; path?: (string | number)[] }
  ): RefinementSchema<T> {
    return new RefinementSchema(this as any, predicate, message);
  }

  transform<T>(transformer: (data: Output) => T): TransformSchema<T> {
    return new TransformSchema(this, transformer);
  }

  // Async methods
  parseAsync(data: unknown): Promise<Output> {
    return Promise.resolve(this.parse(data));
  }

  safeParseAsync(data: unknown): Promise<SafeParseReturnType<Input, Output>> {
    return Promise.resolve(this.safeParse(data));
  }

  // Brand (nominal typing)
  brand<B extends string | number | symbol>(): Schema<Output & { __brand: B }> {
    return this as any;
  }

  // Catch - handle validation errors
  catch(value: Output): Schema<Output> {
    const self = this;
    return new (class extends Schema<Output> {
      _validate(data: unknown): Output {
        try {
          return self._validate(data);
        } catch {
          return value;
        }
      }
    })(this.definition);
  }

  // Pipe - compose with another schema
  pipe<T>(schema: Schema<T, Output>): Schema<T, Input> {
    const self = this;
    return new (class extends Schema<T, Input> {
      _validate(data: unknown): T {
        const intermediate = self._validate(data);
        return schema._validate(intermediate);
      }
    })({ type: 'pipe', schemas: [this.definition, schema.definition] });
  }
}

// Helper function to copy methods from inner schema to wrapper
function copyMethodsFromInnerSchema<T>(wrapper: Schema<any>, innerSchema: Schema<T>, wrapperClass: new (...args: any[]) => Schema<any>) {
  const innerProto = Object.getPrototypeOf(innerSchema);
  const ownMethods = Object.getOwnPropertyNames(innerProto);

  for (const methodName of ownMethods) {
    if (methodName !== 'constructor' &&
        methodName !== '_validate' &&
        typeof innerSchema[methodName as keyof Schema<T>] === 'function' &&
        !wrapper.hasOwnProperty(methodName)) {

      (wrapper as any)[methodName] = (...args: any[]) => {
        // Call the method on inner schema
        const result = (innerSchema as any)[methodName](...args);

        // If the result is the inner schema (for chaining), return wrapper instead
        if (result === innerSchema) {
          return wrapper;
        }

        // If the result is a new schema, we need to wrap it with the same wrapper type
        if (result && typeof result._validate === 'function') {
          // This requires the wrapper constructor signature to match
          try {
            return new wrapperClass(result, ...(wrapper as any).__constructorArgs || []);
          } catch (e) {
            // Fallback: return the result as-is if we can't wrap it
            return result;
          }
        }

        // Otherwise return the result as-is
        return result;
      };
    }
  }
}

// Optional schema wrapper with method forwarding
export class OptionalSchema<T> extends Schema<T | undefined> {
  constructor(private innerSchema: Schema<T>) {
    super({ type: 'optional', innerSchema: innerSchema.getSchema() });
    // Store constructor args for method forwarding
    (this as any).__constructorArgs = [];
    copyMethodsFromInnerSchema(this, innerSchema, OptionalSchema);
  }

  _validate(data: unknown): T | undefined {
    if (data === undefined) {
      return undefined;
    }
    return this.innerSchema._validate(data);
  }
}

// Nullable schema wrapper with method forwarding
export class NullableSchema<T> extends Schema<T | null> {
  constructor(private innerSchema: Schema<T>) {
    super({ type: 'nullable', innerSchema: innerSchema.getSchema() });
    // Store constructor args for method forwarding
    (this as any).__constructorArgs = [];
    copyMethodsFromInnerSchema(this, innerSchema, NullableSchema);
  }

  _validate(data: unknown): T | null {
    if (data === null) {
      return null;
    }
    return this.innerSchema._validate(data);
  }
}

// Default value schema with method forwarding
export class DefaultSchema<T> extends Schema<T> {
  constructor(private innerSchema: Schema<T>, private defaultValue: T) {
    super({ type: 'default', innerSchema: innerSchema.getSchema(), defaultValue });
    // Store constructor args for method forwarding
    (this as any).__constructorArgs = [defaultValue];
    copyMethodsFromInnerSchema(this, innerSchema, DefaultSchema);
  }

  _validate(data: unknown): T {
    if (data === undefined) {
      return this.defaultValue;
    }
    return this.innerSchema._validate(data);
  }
}

// Refinement schema with method forwarding
export class RefinementSchema<T> extends Schema<T> {
  constructor(
    private innerSchema: Schema<T>,
    private predicate: (data: T) => boolean,
    private errorMessage: string | { message: string; path?: (string | number)[] }
  ) {
    super({ type: 'refinement', innerSchema: innerSchema.getSchema() });
    // Store constructor args for method forwarding
    (this as any).__constructorArgs = [predicate, errorMessage];
    copyMethodsFromInnerSchema(this, innerSchema, RefinementSchema);
  }

  _validate(data: unknown): T {
    const validated = this.innerSchema._validate(data);

    if (!this.predicate(validated)) {
      const message = typeof this.errorMessage === 'string'
        ? this.errorMessage
        : this.errorMessage.message;
      const path = typeof this.errorMessage === 'object' && this.errorMessage.path
        ? this.errorMessage.path
        : [];

      throw new ValidationError([{
        code: 'custom',
        path,
        message
      }]);
    }

    return validated;
  }
}

// Transform schema
export class TransformSchema<T> extends Schema<T> {
  constructor(
    private innerSchema: Schema<any>,
    private transformer: (data: any) => T
  ) {
    super({ type: 'transform', innerSchema: innerSchema.getSchema() });
  }

  _validate(data: unknown): T {
    const validated = this.innerSchema._validate(data);
    return this.transformer(validated);
  }
}