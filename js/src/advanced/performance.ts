// Performance optimization utilities
import { Schema } from '../base/schema';
import { ValidationError } from '../base/types';

// Cached regex patterns for better performance
export class RegexCache {
  private static cache = new Map<string, RegExp>();

  static get(pattern: string, flags?: string): RegExp {
    const key = `${pattern}:${flags || ''}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new RegExp(pattern, flags));
    }
    return this.cache.get(key)!;
  }

  static clear(): void {
    this.cache.clear();
  }

  static size(): number {
    return this.cache.size;
  }
}

// Schema compilation cache
export class SchemaCache {
  private static cache = new Map<string, any>();

  static get(key: string): any {
    return this.cache.get(key);
  }

  static set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  static has(key: string): boolean {
    return this.cache.has(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static size(): number {
    return this.cache.size;
  }
}

// Validation pool for object reuse
export class ValidationPool {
  private static errorPool: ValidationError[] = [];
  private static issuePool: Array<{
    code: string;
    path: (string | number)[];
    message: string;
    received?: string;
    expected?: string;
  }> = [];

  static getError(): ValidationError {
    return this.errorPool.pop() || new ValidationError([]);
  }

  static releaseError(error: ValidationError): void {
    error.issues.length = 0;
    error.message = '';
    if (this.errorPool.length < 100) {
      this.errorPool.push(error);
    }
  }

  static getIssue(): any {
    return this.issuePool.pop() || {
      code: '',
      path: [],
      message: '',
      received: undefined,
      expected: undefined
    };
  }

  static releaseIssue(issue: any): void {
    issue.code = '';
    issue.path.length = 0;
    issue.message = '';
    issue.received = undefined;
    issue.expected = undefined;
    if (this.issuePool.length < 500) {
      this.issuePool.push(issue);
    }
  }

  static clear(): void {
    this.errorPool.length = 0;
    this.issuePool.length = 0;
  }
}

// JIT compiled schema for maximum performance
export class JITSchema<T> extends Schema<T> {
  private compiledValidator?: (data: unknown) => T;
  private compilationKey: string;

  constructor(private baseSchema: Schema<T>) {
    super({ type: 'jit', baseSchema: baseSchema.getSchema() });
    this.compilationKey = this.generateCompilationKey();
  }

  private generateCompilationKey(): string {
    return JSON.stringify(this.baseSchema.getSchema());
  }

  private compileValidator(): (data: unknown) => T {
    // Check if already compiled
    if (SchemaCache.has(this.compilationKey)) {
      return SchemaCache.get(this.compilationKey);
    }

    // Create optimized validator function
    const validator = (data: unknown): T => {
      return this.baseSchema._validate(data);
    };

    // Cache the compiled validator
    SchemaCache.set(this.compilationKey, validator);
    return validator;
  }

  _validate(data: unknown): T {
    if (!this.compiledValidator) {
      this.compiledValidator = this.compileValidator();
    }
    return this.compiledValidator(data);
  }

  // Performance statistics
  getStats() {
    return {
      cached: !!this.compiledValidator,
      compilationKey: this.compilationKey,
      cacheSize: SchemaCache.size()
    };
  }
}

// Batch validator for processing multiple items efficiently
export class BatchValidator<T> {
  private schema: Schema<T>;
  private pooledErrors: ValidationError[] = [];

  constructor(schema: Schema<T>) {
    this.schema = schema;
  }

  validate(items: unknown[]): Array<{ success: true; data: T } | { success: false; error: ValidationError }> {
    const results: Array<{ success: true; data: T } | { success: false; error: ValidationError }> = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const data = this.schema._validate(items[i]);
        results.push({ success: true, data });
      } catch (error) {
        if (error instanceof ValidationError) {
          // Add index to error paths
          const adjustedIssues = error.issues.map(issue => ({
            ...issue,
            path: [i, ...issue.path]
          }));
          results.push({
            success: false,
            error: new ValidationError(adjustedIssues)
          });
        } else {
          results.push({
            success: false,
            error: new ValidationError([{
              code: 'unknown_error',
              path: [i],
              message: error instanceof Error ? error.message : 'Unknown error'
            }])
          });
        }
      }
    }

    return results;
  }

  validateParallel(items: unknown[], chunkSize = 100): Promise<Array<{ success: true; data: T } | { success: false; error: ValidationError }>> {
    return new Promise((resolve) => {
      const results: Array<{ success: true; data: T } | { success: false; error: ValidationError }> =
        new Array(items.length);
      let completed = 0;

      // Process in chunks to avoid blocking
      const processChunk = (startIndex: number) => {
        const endIndex = Math.min(startIndex + chunkSize, items.length);

        for (let i = startIndex; i < endIndex; i++) {
          try {
            const data = this.schema._validate(items[i]);
            results[i] = { success: true, data };
          } catch (error) {
            if (error instanceof ValidationError) {
              const adjustedIssues = error.issues.map(issue => ({
                ...issue,
                path: [i, ...issue.path]
              }));
              results[i] = {
                success: false,
                error: new ValidationError(adjustedIssues)
              };
            } else {
              results[i] = {
                success: false,
                error: new ValidationError([{
                  code: 'unknown_error',
                  path: [i],
                  message: error instanceof Error ? error.message : 'Unknown error'
                }])
              };
            }
          }
        }

        completed += (endIndex - startIndex);

        if (completed >= items.length) {
          resolve(results);
        } else {
          // Use setTimeout to yield control
          setTimeout(() => processChunk(endIndex), 0);
        }
      };

      processChunk(0);
    });
  }

  getStats() {
    return {
      schemaType: this.schema.getSchema().type,
      pooledErrors: this.pooledErrors.length,
      regexCacheSize: RegexCache.size(),
      schemaCacheSize: SchemaCache.size()
    };
  }
}

// Streaming validator for large datasets
export class StreamingValidator<T> {
  private schema: Schema<T>;
  private buffer: unknown[] = [];
  private onResult?: (result: { success: true; data: T } | { success: false; error: ValidationError }, index: number) => void;

  constructor(schema: Schema<T>, onResult?: (result: any, index: number) => void) {
    this.schema = schema;
    this.onResult = onResult;
  }

  push(item: unknown): void {
    const index = this.buffer.length;
    this.buffer.push(item);

    if (this.onResult) {
      try {
        const data = this.schema._validate(item);
        this.onResult({ success: true, data }, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          this.onResult({ success: false, error }, index);
        } else {
          this.onResult({
            success: false,
            error: new ValidationError([{
              code: 'unknown_error',
              path: [],
              message: error instanceof Error ? error.message : 'Unknown error'
            }])
          }, index);
        }
      }
    }
  }

  flush(): Array<{ success: true; data: T } | { success: false; error: ValidationError }> {
    const batchValidator = new BatchValidator(this.schema);
    const results = batchValidator.validate(this.buffer);
    this.buffer.length = 0;
    return results;
  }
}