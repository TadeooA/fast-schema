// Ultra-performance core for 100x speed target
// This module implements aggressive optimizations without Zod compatibility constraints

// Pre-compiled validation functions for maximum speed
type ValidationFn<T> = (data: unknown) => T;
export type UltraValidationResult<T> = { success: true; data: T } | { success: false; error: string };

// Ultra-fast schema compiler
export class UltraSchemaCompiler {
  private static compiledSchemas = new Map<string, ValidationFn<any>>();
  private static stringValidators = new Map<string, RegExp>();

  // Pre-compile common regex patterns
  static {
    this.stringValidators.set('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    this.stringValidators.set('uuid', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    this.stringValidators.set('url', /^https?:\/\/.+/);
    this.stringValidators.set('datetime', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/);
  }

  static compileString(constraints?: {
    min?: number;
    max?: number;
    format?: string;
  }): ValidationFn<string> {
    const cacheKey = JSON.stringify(constraints);
    const cached = this.compiledSchemas.get(`string:${cacheKey}`);
    if (cached) return cached;

    const validator: ValidationFn<string> = (data: unknown): string => {
      if (typeof data !== 'string') {
        throw new Error(`Expected string, got ${typeof data}`);
      }

      if (constraints?.min !== undefined && data.length < constraints.min) {
        throw new Error(`String too short: ${data.length} < ${constraints.min}`);
      }

      if (constraints?.max !== undefined && data.length > constraints.max) {
        throw new Error(`String too long: ${data.length} > ${constraints.max}`);
      }

      if (constraints?.format) {
        const regex = this.stringValidators.get(constraints.format);
        if (regex && !regex.test(data)) {
          throw new Error(`Invalid format: ${constraints.format}`);
        }
      }

      return data;
    };

    this.compiledSchemas.set(`string:${cacheKey}`, validator);
    return validator;
  }

  static compileNumber(constraints?: {
    min?: number;
    max?: number;
    integer?: boolean;
  }): ValidationFn<number> {
    const cacheKey = JSON.stringify(constraints);
    const cached = this.compiledSchemas.get(`number:${cacheKey}`);
    if (cached) return cached;

    const validator: ValidationFn<number> = (data: unknown): number => {
      if (typeof data !== 'number' || isNaN(data)) {
        throw new Error(`Expected number, got ${typeof data}`);
      }

      if (constraints?.integer && !Number.isInteger(data)) {
        throw new Error('Expected integer');
      }

      if (constraints?.min !== undefined && data < constraints.min) {
        throw new Error(`Number too small: ${data} < ${constraints.min}`);
      }

      if (constraints?.max !== undefined && data > constraints.max) {
        throw new Error(`Number too large: ${data} > ${constraints.max}`);
      }

      return data;
    };

    this.compiledSchemas.set(`number:${cacheKey}`, validator);
    return validator;
  }

  static compileBoolean(): ValidationFn<boolean> {
    const cached = this.compiledSchemas.get('boolean');
    if (cached) return cached;

    const validator: ValidationFn<boolean> = (data: unknown): boolean => {
      if (typeof data !== 'boolean') {
        throw new Error(`Expected boolean, got ${typeof data}`);
      }
      return data;
    };

    this.compiledSchemas.set('boolean', validator);
    return validator;
  }

  static compileArray<T>(itemValidator: ValidationFn<T>): ValidationFn<T[]> {
    return (data: unknown): T[] => {
      if (!Array.isArray(data)) {
        throw new Error(`Expected array, got ${typeof data}`);
      }

      // Ultra-fast array validation - use for loop for maximum performance
      const result: T[] = new Array(data.length);
      for (let i = 0; i < data.length; i++) {
        result[i] = itemValidator(data[i]);
      }

      return result;
    };
  }

  static compileObject<T extends Record<string, any>>(
    shape: Record<string, ValidationFn<any>>,
    required: string[] = []
  ): ValidationFn<T> {
    const requiredSet = new Set(required);
    const shapeKeys = Object.keys(shape);

    return (data: unknown): T => {
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new Error(`Expected object, got ${typeof data}`);
      }

      const obj = data as Record<string, unknown>;
      const result: any = {};

      // Ultra-fast object validation - minimize property access
      for (let i = 0; i < shapeKeys.length; i++) {
        const key = shapeKeys[i];
        const validator = shape[key];

        if (key in obj) {
          result[key] = validator(obj[key]);
        } else if (requiredSet.has(key)) {
          throw new Error(`Missing required property: ${key}`);
        }
      }

      return result;
    };
  }
}

// Ultra-fast schema classes with minimal overhead
export class UltraStringSchema {
  private validator: ValidationFn<string>;

  constructor(private constraints: { min?: number; max?: number; format?: string } = {}) {
    this.validator = UltraSchemaCompiler.compileString(constraints);
  }

  min(length: number): UltraStringSchema {
    return new UltraStringSchema({ ...this.constraints, min: length });
  }

  max(length: number): UltraStringSchema {
    return new UltraStringSchema({ ...this.constraints, max: length });
  }

  email(): UltraStringSchema {
    return new UltraStringSchema({ ...this.constraints, format: 'email' });
  }

  uuid(): UltraStringSchema {
    return new UltraStringSchema({ ...this.constraints, format: 'uuid' });
  }

  url(): UltraStringSchema {
    return new UltraStringSchema({ ...this.constraints, format: 'url' });
  }

  datetime(): UltraStringSchema {
    return new UltraStringSchema({ ...this.constraints, format: 'datetime' });
  }

  parse(data: unknown): string {
    return this.validator(data);
  }

  safeParse(data: unknown): UltraValidationResult<string> {
    try {
      return { success: true, data: this.validator(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getValidator(): ValidationFn<string> {
    return this.validator;
  }
}

export class UltraNumberSchema {
  private validator: ValidationFn<number>;

  constructor(private constraints: { min?: number; max?: number; integer?: boolean } = {}) {
    this.validator = UltraSchemaCompiler.compileNumber(constraints);
  }

  min(value: number): UltraNumberSchema {
    return new UltraNumberSchema({ ...this.constraints, min: value });
  }

  max(value: number): UltraNumberSchema {
    return new UltraNumberSchema({ ...this.constraints, max: value });
  }

  int(): UltraNumberSchema {
    return new UltraNumberSchema({ ...this.constraints, integer: true });
  }

  positive(): UltraNumberSchema {
    return new UltraNumberSchema({ ...this.constraints, min: 0.01 });
  }

  parse(data: unknown): number {
    return this.validator(data);
  }

  safeParse(data: unknown): UltraValidationResult<number> {
    try {
      return { success: true, data: this.validator(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getValidator(): ValidationFn<number> {
    return this.validator;
  }
}

export class UltraBooleanSchema {
  private validator: ValidationFn<boolean>;

  constructor() {
    this.validator = UltraSchemaCompiler.compileBoolean();
  }

  parse(data: unknown): boolean {
    return this.validator(data);
  }

  safeParse(data: unknown): UltraValidationResult<boolean> {
    try {
      return { success: true, data: this.validator(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getValidator(): ValidationFn<boolean> {
    return this.validator;
  }
}

export class UltraArraySchema<T> {
  private validator: ValidationFn<T[]>;

  constructor(private itemSchema: { getValidator(): ValidationFn<T> }) {
    this.validator = UltraSchemaCompiler.compileArray(itemSchema.getValidator());
  }

  parse(data: unknown): T[] {
    return this.validator(data);
  }

  safeParse(data: unknown): UltraValidationResult<T[]> {
    try {
      return { success: true, data: this.validator(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getValidator(): ValidationFn<T[]> {
    return this.validator;
  }
}

export class UltraObjectSchema<T extends Record<string, any>> {
  private validator: ValidationFn<T>;

  constructor(
    private shape: { [K in keyof T]: { getValidator(): ValidationFn<T[K]> } },
    private required: (keyof T)[] = []
  ) {
    const validators: Record<string, ValidationFn<any>> = {};
    for (const [key, schema] of Object.entries(shape)) {
      validators[key] = (schema as any).getValidator();
    }

    this.validator = UltraSchemaCompiler.compileObject<T>(
      validators,
      required.map(k => String(k))
    );
  }

  parse(data: unknown): T {
    return this.validator(data);
  }

  safeParse(data: unknown): UltraValidationResult<T> {
    try {
      return { success: true, data: this.validator(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getValidator(): ValidationFn<T> {
    return this.validator;
  }
}

// Batch validation for maximum throughput
export class UltraBatchValidator<T> {
  constructor(private validator: ValidationFn<T>) {}

  parseMany(items: unknown[]): T[] {
    const results: T[] = new Array(items.length);
    for (let i = 0; i < items.length; i++) {
      results[i] = this.validator(items[i]);
    }
    return results;
  }

  safeParseManyFast(items: unknown[]): UltraValidationResult<T[]> {
    try {
      return { success: true, data: this.parseMany(items) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Batch validation failed' };
    }
  }

  // Parallel validation using Web Workers (when available)
  async parseManyParallel(
    items: unknown[],
    chunkSize: number = 1000
  ): Promise<T[]> {
    if (items.length <= chunkSize) {
      return this.parseMany(items);
    }

    // Chunk the array for parallel processing
    const chunks: unknown[][] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }

    // Process chunks in parallel (simplified - would use actual workers in production)
    const results = await Promise.all(
      chunks.map(chunk => Promise.resolve(this.parseMany(chunk)))
    );

    return results.flat();
  }
}

// Memory pool for reducing allocations
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  acquire(): T {
    return this.pool.pop() || this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    if (this.pool.length < 50) { // Limit pool size
      this.pool.push(obj);
    }
  }
}

// Global object pools for common types
const stringResultPool = new ObjectPool(
  () => ({ success: true as const, data: '' }),
  (obj) => { obj.data = ''; },
  20
);

const errorResultPool = new ObjectPool(
  () => ({ success: false as const, error: '' }),
  (obj) => { obj.error = ''; },
  10
);

// Ultra-optimized result creation
export function createSuccessResult<T>(data: T): UltraValidationResult<T> {
  return { success: true, data };
}

export function createErrorResult(error: string): UltraValidationResult<any> {
  return { success: false, error };
}

// JIT compilation for frequently used schemas
export class JITOptimizer {
  private static hotSchemas = new Map<string, { count: number; validator: ValidationFn<any> }>();
  private static threshold = 100; // Optimize after 100 uses

  static recordUsage(schemaId: string, validator: ValidationFn<any>): ValidationFn<any> {
    const entry = this.hotSchemas.get(schemaId);
    if (entry) {
      entry.count++;
      if (entry.count === this.threshold) {
        // JIT compile the schema
        return this.optimizeValidator(validator);
      }
      return entry.validator;
    } else {
      this.hotSchemas.set(schemaId, { count: 1, validator });
      return validator;
    }
  }

  private static optimizeValidator<T>(validator: ValidationFn<T>): ValidationFn<T> {
    // In a real implementation, this would generate optimized native code
    // For now, we'll just add memoization
    const cache = new Map<string, T>();

    return (data: unknown): T => {
      const key = JSON.stringify(data);
      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const result = validator(data);
      if (cache.size < 1000) { // Limit cache size
        cache.set(key, result);
      }

      return result;
    };
  }
}