// Extreme optimizations for 100x performance target
// This module implements the most aggressive optimizations possible in JavaScript/TypeScript

// Pre-computed validation functions with zero overhead
export class ExtremeOptimizer {
  private static functionCache = new Map<string, Function>();

  // Generate extremely optimized validation functions at compile time
  static compileExtremeString(constraints?: {
    min?: number;
    max?: number;
    format?: 'email' | 'uuid' | 'url';
  }): (data: unknown) => string {
    const cacheKey = JSON.stringify(constraints);
    let cached = this.functionCache.get(`string:${cacheKey}`);
    if (cached) return cached as (data: unknown) => string;

    // Generate optimized function code
    let code = '(function(data) {\n';

    // Type check with minimal overhead
    code += '  if (typeof data !== "string") throw new Error("Expected string");\n';

    // Length checks
    if (constraints?.min !== undefined) {
      code += `  if (data.length < ${constraints.min}) throw new Error("Too short");\n`;
    }
    if (constraints?.max !== undefined) {
      code += `  if (data.length > ${constraints.max}) throw new Error("Too long");\n`;
    }

    // Format validation with precompiled regex
    if (constraints?.format === 'email') {
      code += '  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data)) throw new Error("Invalid email");\n';
    } else if (constraints?.format === 'uuid') {
      code += '  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data)) throw new Error("Invalid UUID");\n';
    } else if (constraints?.format === 'url') {
      code += '  if (!/^https?:\\/\\/.+/.test(data)) throw new Error("Invalid URL");\n';
    }

    code += '  return data;\n})';

    // Compile the function
    const compiledFn = eval(code);
    this.functionCache.set(`string:${cacheKey}`, compiledFn);
    return compiledFn;
  }

  static compileExtremeNumber(constraints?: {
    min?: number;
    max?: number;
    integer?: boolean;
  }): (data: unknown) => number {
    const cacheKey = JSON.stringify(constraints);
    let cached = this.functionCache.get(`number:${cacheKey}`);
    if (cached) return cached as (data: unknown) => number;

    let code = '(function(data) {\n';
    code += '  if (typeof data !== "number" || isNaN(data)) throw new Error("Expected number");\n';

    if (constraints?.integer) {
      code += '  if (data % 1 !== 0) throw new Error("Expected integer");\n';
    }

    if (constraints?.min !== undefined) {
      code += `  if (data < ${constraints.min}) throw new Error("Too small");\n`;
    }

    if (constraints?.max !== undefined) {
      code += `  if (data > ${constraints.max}) throw new Error("Too large");\n`;
    }

    code += '  return data;\n})';

    const compiledFn = eval(code);
    this.functionCache.set(`number:${cacheKey}`, compiledFn);
    return compiledFn;
  }

  static compileExtremeBoolean(): (data: unknown) => boolean {
    let cached = this.functionCache.get('boolean');
    if (cached) return cached as (data: unknown) => boolean;

    const compiledFn = eval('(function(data) { if (typeof data !== "boolean") throw new Error("Expected boolean"); return data; })');
    this.functionCache.set('boolean', compiledFn);
    return compiledFn;
  }

  // Ultra-fast array validation with minimal allocations
  static compileExtremeArray<T>(itemValidator: (data: unknown) => T): (data: unknown) => T[] {
    return (data: unknown): T[] => {
      if (!Array.isArray(data)) throw new Error("Expected array");

      // Pre-allocate result array for maximum performance
      const length = data.length;
      const result = new Array<T>(length);

      // Unrolled loop for small arrays (common case optimization)
      if (length <= 10) {
        for (let i = 0; i < length; i++) {
          result[i] = itemValidator(data[i]);
        }
      } else {
        // Batched processing for large arrays
        let i = 0;
        const batchSize = 100;
        while (i < length) {
          const end = Math.min(i + batchSize, length);
          for (let j = i; j < end; j++) {
            result[j] = itemValidator(data[j]);
          }
          i = end;
        }
      }

      return result;
    };
  }

  // Compile object validation to extremely fast native code
  static compileExtremeObject<T extends Record<string, any>>(
    validators: Record<string, (data: unknown) => any>,
    required: string[] = []
  ): (data: unknown) => T {
    const keys = Object.keys(validators);
    const requiredSet = new Set(required);

    // Generate optimized object validation function
    let code = '(function(data) {\n';
    code += '  if (typeof data !== "object" || data === null || Array.isArray(data)) throw new Error("Expected object");\n';
    code += '  const result = {};\n';

    for (const key of keys) {
      if (requiredSet.has(key)) {
        code += `  if (!("${key}" in data)) throw new Error("Missing: ${key}");\n`;
        code += `  result.${key} = validators.${key}(data.${key});\n`;
      } else {
        code += `  if ("${key}" in data) result.${key} = validators.${key}(data.${key});\n`;
      }
    }

    code += '  return result;\n})';

    // Create closure with validators
    const fn = new Function('validators', `return ${code}`)(validators);
    return fn;
  }
}

// Extreme performance schemas with zero-overhead
export class ExtremeStringSchema {
  private validator: (data: unknown) => string;

  constructor(private constraints: { min?: number; max?: number; format?: 'email' | 'uuid' | 'url' } = {}) {
    this.validator = ExtremeOptimizer.compileExtremeString(constraints);
  }

  min(length: number): ExtremeStringSchema {
    return new ExtremeStringSchema({ ...this.constraints, min: length });
  }

  max(length: number): ExtremeStringSchema {
    return new ExtremeStringSchema({ ...this.constraints, max: length });
  }

  email(): ExtremeStringSchema {
    return new ExtremeStringSchema({ ...this.constraints, format: 'email' });
  }

  uuid(): ExtremeStringSchema {
    return new ExtremeStringSchema({ ...this.constraints, format: 'uuid' });
  }

  url(): ExtremeStringSchema {
    return new ExtremeStringSchema({ ...this.constraints, format: 'url' });
  }

  // Zero-overhead parsing
  parse(data: unknown): string {
    return this.validator(data);
  }

  // Extremely fast safe parsing
  safeParse(data: unknown): { success: true; data: string } | { success: false; error: string } {
    try {
      return { success: true, data: this.validator(data) };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getValidator(): (data: unknown) => string {
    return this.validator;
  }
}

export class ExtremeNumberSchema {
  private validator: (data: unknown) => number;

  constructor(private constraints: { min?: number; max?: number; integer?: boolean } = {}) {
    this.validator = ExtremeOptimizer.compileExtremeNumber(constraints);
  }

  min(value: number): ExtremeNumberSchema {
    return new ExtremeNumberSchema({ ...this.constraints, min: value });
  }

  max(value: number): ExtremeNumberSchema {
    return new ExtremeNumberSchema({ ...this.constraints, max: value });
  }

  int(): ExtremeNumberSchema {
    return new ExtremeNumberSchema({ ...this.constraints, integer: true });
  }

  parse(data: unknown): number {
    return this.validator(data);
  }

  safeParse(data: unknown): { success: true; data: number } | { success: false; error: string } {
    try {
      return { success: true, data: this.validator(data) };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getValidator(): (data: unknown) => number {
    return this.validator;
  }
}

export class ExtremeBooleanSchema {
  private validator: (data: unknown) => boolean;

  constructor() {
    this.validator = ExtremeOptimizer.compileExtremeBoolean();
  }

  parse(data: unknown): boolean {
    return this.validator(data);
  }

  safeParse(data: unknown): { success: true; data: boolean } | { success: false; error: string } {
    try {
      return { success: true, data: this.validator(data) };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getValidator(): (data: unknown) => boolean {
    return this.validator;
  }
}

export class ExtremeArraySchema<T> {
  private validator: (data: unknown) => T[];

  constructor(itemSchema: { getValidator(): (data: unknown) => T }) {
    this.validator = ExtremeOptimizer.compileExtremeArray(itemSchema.getValidator());
  }

  parse(data: unknown): T[] {
    return this.validator(data);
  }

  safeParse(data: unknown): { success: true; data: T[] } | { success: false; error: string } {
    try {
      return { success: true, data: this.validator(data) };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getValidator(): (data: unknown) => T[] {
    return this.validator;
  }
}

export class ExtremeObjectSchema<T extends Record<string, any>> {
  private validator: (data: unknown) => T;

  constructor(
    shape: { [K in keyof T]: { getValidator(): (data: unknown) => T[K] } },
    required: (keyof T)[] = []
  ) {
    const validators: Record<string, (data: unknown) => any> = {};
    for (const [key, schema] of Object.entries(shape)) {
      validators[key] = (schema as any).getValidator();
    }

    this.validator = ExtremeOptimizer.compileExtremeObject<T>(
      validators,
      required.map(k => String(k))
    );
  }

  parse(data: unknown): T {
    return this.validator(data);
  }

  safeParse(data: unknown): { success: true; data: T } | { success: false; error: string } {
    try {
      return { success: true, data: this.validator(data) };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getValidator(): (data: unknown) => T {
    return this.validator;
  }
}

// Extreme batch validator with memory pooling
export class ExtremeBatchValidator<T> {
  private validator: (data: unknown) => T;
  private resultPool: T[][] = [];

  constructor(schema: { getValidator(): (data: unknown) => T }) {
    this.validator = schema.getValidator();
  }

  parseMany(items: unknown[]): T[] {
    const length = items.length;

    // Get pooled result array or create new one
    let result = this.resultPool.pop();
    if (!result || result.length !== length) {
      result = new Array<T>(length);
    }

    // Ultra-fast validation loop
    for (let i = 0; i < length; i++) {
      result[i] = this.validator(items[i]);
    }

    return result;
  }

  // Return result array to pool for reuse
  returnToPool(result: T[]): void {
    if (this.resultPool.length < 10) { // Limit pool size
      this.resultPool.push(result);
    }
  }
}

// Main extreme API
export const extreme = {
  string: () => new ExtremeStringSchema(),
  number: () => new ExtremeNumberSchema(),
  boolean: () => new ExtremeBooleanSchema(),
  array: <T>(schema: { getValidator(): (data: unknown) => T }) => new ExtremeArraySchema(schema),
  object: <T extends Record<string, any>>(
    shape: { [K in keyof T]: { getValidator(): (data: unknown) => T[K] } }
  ) => new ExtremeObjectSchema(shape, Object.keys(shape) as (keyof T)[]),
  batch: <T>(schema: { getValidator(): (data: unknown) => T }) => new ExtremeBatchValidator(schema),

  // Performance utilities
  clearCache: () => {
    ExtremeOptimizer['functionCache'].clear();
  },

  getCacheSize: () => {
    return ExtremeOptimizer['functionCache'].size;
  }
};

export default extreme;