// Simplified working version for immediate compilation
// This will serve as the base while we fix the complex core.ts

export class ValidationError extends Error {
  public issues: Array<{
    code: string;
    path: (string | number)[];
    message: string;
    received?: string;
    expected?: string;
  }>;

  constructor(issues: ValidationError['issues']) {
    const message = issues.map(issue =>
      `${issue.path.length > 0 ? issue.path.join('.') + ': ' : ''}${issue.message}`
    ).join('; ');

    super(message);
    this.name = 'ValidationError';
    this.issues = issues;
  }

  format() {
    const formatted: Record<string, any> = {};
    for (const issue of this.issues) {
      const path = issue.path.join('.');
      if (path) {
        formatted[path] = issue.message;
      } else {
        formatted._errors = formatted._errors || [];
        formatted._errors.push(issue.message);
      }
    }
    return formatted;
  }

  flatten() {
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];

    for (const issue of this.issues) {
      if (issue.path.length > 0) {
        const path = issue.path.join('.');
        fieldErrors[path] = fieldErrors[path] || [];
        fieldErrors[path].push(issue.message);
      } else {
        formErrors.push(issue.message);
      }
    }

    return {
      fieldErrors,
      formErrors
    };
  }
}

export abstract class BaseSchema<T> {
  protected schema: any;

  constructor(schema: any) {
    this.schema = schema;
  }

  abstract _validate(data: unknown): T;

  parse(data: unknown): T {
    return this._validate(data);
  }

  safeParse(data: unknown): { success: true; data: T } | { success: false; error: ValidationError } {
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

  optional() {
    return new OptionalSchema(this);
  }

  nullable() {
    return new NullableSchema(this);
  }

  getSchema() {
    return this.schema;
  }
}

export class StringSchema extends BaseSchema<string> {
  private minLength?: number;
  private maxLength?: number;
  private pattern?: RegExp;

  constructor() {
    super({ type: 'string' });
  }

  _validate(data: unknown): string {
    if (typeof data !== 'string') {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected string',
        received: typeof data,
        expected: 'string'
      }]);
    }

    if (this.minLength !== undefined && data.length < this.minLength) {
      throw new ValidationError([{
        code: 'too_small',
        path: [],
        message: `String must be at least ${this.minLength} characters`
      }]);
    }

    if (this.maxLength !== undefined && data.length > this.maxLength) {
      throw new ValidationError([{
        code: 'too_big',
        path: [],
        message: `String must be at most ${this.maxLength} characters`
      }]);
    }

    if (this.pattern && !this.pattern.test(data)) {
      throw new ValidationError([{
        code: 'invalid_string',
        path: [],
        message: 'String does not match required pattern'
      }]);
    }

    return data;
  }

  min(length: number) {
    this.minLength = length;
    return this;
  }

  max(length: number) {
    this.maxLength = length;
    return this;
  }

  email() {
    this.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this;
  }

  url() {
    this.pattern = /^https?:\/\/.+/;
    return this;
  }
}

export class NumberSchema extends BaseSchema<number> {
  private minValue?: number;
  private maxValue?: number;
  private isInteger = false;

  constructor() {
    super({ type: 'number' });
  }

  _validate(data: unknown): number {
    if (typeof data !== 'number' || isNaN(data)) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected number',
        received: typeof data,
        expected: 'number'
      }]);
    }

    if (this.isInteger && !Number.isInteger(data)) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected integer'
      }]);
    }

    if (this.minValue !== undefined && data < this.minValue) {
      throw new ValidationError([{
        code: 'too_small',
        path: [],
        message: `Number must be at least ${this.minValue}`
      }]);
    }

    if (this.maxValue !== undefined && data > this.maxValue) {
      throw new ValidationError([{
        code: 'too_big',
        path: [],
        message: `Number must be at most ${this.maxValue}`
      }]);
    }

    return data;
  }

  min(value: number) {
    this.minValue = value;
    return this;
  }

  max(value: number) {
    this.maxValue = value;
    return this;
  }

  int() {
    this.isInteger = true;
    return this;
  }

  positive() {
    return this.min(0.01);
  }
}

export class BooleanSchema extends BaseSchema<boolean> {
  constructor() {
    super({ type: 'boolean' });
  }

  _validate(data: unknown): boolean {
    if (typeof data !== 'boolean') {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected boolean',
        received: typeof data,
        expected: 'boolean'
      }]);
    }
    return data;
  }
}

export class ArraySchema<T> extends BaseSchema<T[]> {
  constructor(private itemSchema: BaseSchema<T>) {
    super({ type: 'array' });
  }

  _validate(data: unknown): T[] {
    if (!Array.isArray(data)) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected array',
        received: typeof data,
        expected: 'array'
      }]);
    }

    const result: T[] = [];
    const issues: ValidationError['issues'] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        result.push(this.itemSchema._validate(data[i]));
      } catch (error) {
        if (error instanceof ValidationError) {
          error.issues.forEach(issue => {
            issues.push({
              ...issue,
              path: [i, ...issue.path]
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
}

export class ObjectSchema<T extends Record<string, any>> extends BaseSchema<T> {
  constructor(private shape: { [K in keyof T]: BaseSchema<T[K]> }) {
    super({ type: 'object' });
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
          (result as any)[key] = (schema as BaseSchema<any>)._validate(obj[key]);
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
}

export class OptionalSchema<T> extends BaseSchema<T | undefined> {
  constructor(private innerSchema: BaseSchema<T>) {
    super({ type: 'optional' });
  }

  _validate(data: unknown): T | undefined {
    if (data === undefined) {
      return undefined;
    }
    return this.innerSchema._validate(data);
  }
}

export class NullableSchema<T> extends BaseSchema<T | null> {
  constructor(private innerSchema: BaseSchema<T>) {
    super({ type: 'nullable' });
  }

  _validate(data: unknown): T | null {
    if (data === null) {
      return null;
    }
    return this.innerSchema._validate(data);
  }
}

// Main fast object - ultra-performance validation
export const fast = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  array: <T>(schema: BaseSchema<T>) => new ArraySchema(schema),
  object: <T extends Record<string, any>>(shape: { [K in keyof T]: BaseSchema<T[K]> }) => new ObjectSchema(shape),

  // Simple utilities
  literal: <T extends string | number | boolean>(value: T) => {
    return new StringSchema().min(value.toString().length).max(value.toString().length);
  },

  any: () => new class extends BaseSchema<any> {
    constructor() { super({ type: 'any' }); }
    _validate(data: unknown): any { return data; }
  },

  unknown: () => new class extends BaseSchema<unknown> {
    constructor() { super({ type: 'unknown' }); }
    _validate(data: unknown): unknown { return data; }
  }
};

// Type inference helper
export type infer<T extends BaseSchema<any>> = T extends BaseSchema<infer U> ? U : never;