// Async validation schemas
import { Schema } from '../base/schema';
import { ValidationError, SafeParseReturnType } from '../base/types';

export class AsyncSchema<T> extends Schema<T> {
  constructor(
    private asyncValidator: (data: unknown) => Promise<T>,
    private syncFallback?: Schema<T>
  ) {
    super({
      type: 'async',
      hasSyncFallback: !!syncFallback
    });
  }

  _validate(data: unknown): T {
    // For sync validation, use fallback if available
    if (this.syncFallback) {
      return this.syncFallback._validate(data);
    }

    throw new ValidationError([{
      code: 'async_validation_required',
      path: [],
      message: 'This schema requires async validation. Use parseAsync() instead.'
    }]);
  }

  // Async validation methods
  async parseAsync(data: unknown): Promise<T> {
    try {
      return await this.asyncValidator(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError([{
        code: 'async_validation_failed',
        path: [],
        message: error instanceof Error ? error.message : 'Async validation failed'
      }]);
    }
  }

  async safeParseAsync(data: unknown): Promise<SafeParseReturnType<unknown, T>> {
    try {
      const result = await this.parseAsync(data);
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
          message: error instanceof Error ? error.message : 'Unknown async error'
        }])
      };
    }
  }
}

// Async refinement schema
export class AsyncRefinementSchema<T> extends Schema<T> {
  constructor(
    private innerSchema: Schema<T>,
    private asyncPredicate: (data: T) => Promise<boolean>,
    private message: string
  ) {
    super({
      type: 'async_refinement',
      innerSchema: innerSchema.getSchema(),
      message
    });
  }

  _validate(data: unknown): T {
    // Sync validation of inner schema only
    return this.innerSchema._validate(data);
  }

  async parseAsync(data: unknown): Promise<T> {
    // First validate with inner schema
    const validated = this.innerSchema._validate(data);

    // Then apply async refinement
    const isValid = await this.asyncPredicate(validated);
    if (!isValid) {
      throw new ValidationError([{
        code: 'async_refinement_failed',
        path: [],
        message: this.message
      }]);
    }

    return validated;
  }

  async safeParseAsync(data: unknown): Promise<SafeParseReturnType<unknown, T>> {
    try {
      const result = await this.parseAsync(data);
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
          message: error instanceof Error ? error.message : 'Unknown async error'
        }])
      };
    }
  }
}

// Promise schema for validating promises
export class PromiseSchema<T> extends Schema<Promise<T>> {
  constructor(private valueSchema: Schema<T>) {
    super({
      type: 'promise',
      valueSchema: valueSchema.getSchema()
    });
  }

  _validate(data: unknown): Promise<T> {
    if (!(data instanceof Promise)) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected Promise',
        received: typeof data,
        expected: 'Promise'
      }]);
    }

    return data;
  }

  // Override parseAsync to handle Promise validation
  parseAsync(data: unknown): Promise<Promise<T>> {
    // First validate that the data is a Promise
    const promise = this._validate(data);
    // Return the promise that will resolve to the validated value
    return promise.then(resolved => {
      const validated = this.valueSchema._validate(resolved);
      return Promise.resolve(validated);
    }) as Promise<Promise<T>>;
  }

  safeParseAsync(data: unknown): Promise<SafeParseReturnType<Promise<T>, Promise<T>>> {
    try {
      const result = this.parseAsync(data);
      return result.then(data => ({ success: true, data })).catch(error => ({
        success: false,
        error: error instanceof ValidationError ? error : new ValidationError([{
          code: 'unknown_error',
          path: [],
          message: error instanceof Error ? error.message : 'Unknown promise error'
        }])
      })) as Promise<SafeParseReturnType<Promise<T>, Promise<T>>>;
    } catch (error) {
      return Promise.resolve({
        success: false,
        error: error instanceof ValidationError ? error : new ValidationError([{
          code: 'unknown_error',
          path: [],
          message: error instanceof Error ? error.message : 'Unknown promise error'
        }])
      });
    }
  }
}