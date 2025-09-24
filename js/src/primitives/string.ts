// String schema implementation
import { Schema } from '../base/schema';
import { ValidationError } from '../base/types';

export class StringSchema extends Schema<string> {
  private minLength?: number;
  private maxLength?: number;
  private pattern?: RegExp;
  private formats: Set<string> = new Set();

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

    // Apply string transformations (trim, toLowerCase, etc.)
    let result = data;
    for (const transform of this.transforms) {
      result = transform(result);
    }

    return result;
  }

  // Length constraints
  min(length: number): this {
    this.minLength = length;
    return this;
  }

  max(length: number): this {
    this.maxLength = length;
    return this;
  }

  length(length: number): this {
    return this.min(length).max(length);
  }

  // Format validations
  email(): this {
    this.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.formats.add('email');
    return this;
  }

  url(): this {
    this.pattern = /^https?:\/\/.+/;
    this.formats.add('url');
    return this;
  }

  uuid(): this {
    this.pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    this.formats.add('uuid');
    return this;
  }

  regex(pattern: RegExp): this {
    this.pattern = pattern;
    return this;
  }

  // Extended formats
  datetime(): this {
    this.pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    this.formats.add('datetime');
    return this;
  }

  date(): this {
    this.pattern = /^\d{4}-\d{2}-\d{2}$/;
    this.formats.add('date');
    return this;
  }

  time(): this {
    this.pattern = /^\d{2}:\d{2}:\d{2}$/;
    this.formats.add('time');
    return this;
  }

  ip(): this {
    this.pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    this.formats.add('ip');
    return this;
  }

  // Common string operations - Fixed to maintain method chaining
  private transforms: Array<(s: string) => string> = [];

  trim(): this {
    this.transforms.push((s: string) => s.trim());
    return this;
  }

  toLowerCase(): this {
    this.transforms.push((s: string) => s.toLowerCase());
    return this;
  }

  toUpperCase(): this {
    this.transforms.push((s: string) => s.toUpperCase());
    return this;
  }

  // Additional validations
  nonempty(): this {
    return this.min(1);
  }

  startsWith(prefix: string) {
    return this.refine(
      (data) => data.startsWith(prefix),
      `String must start with "${prefix}"`
    );
  }

  endsWith(suffix: string) {
    return this.refine(
      (data) => data.endsWith(suffix),
      `String must end with "${suffix}"`
    );
  }

  includes(substring: string) {
    return this.refine(
      (data) => data.includes(substring),
      `String must include "${substring}"`
    );
  }
}