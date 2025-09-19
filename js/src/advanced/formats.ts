// Advanced string format validators
import { Schema } from '../base/schema';
import { ValidationError } from '../base/types';

// Extended string formats with validation patterns
export const StringFormats = {
  // Network formats
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/,
  mac: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,

  // Identifiers
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
  base64: /^[A-Za-z0-9+/]*={0,2}$/,
  hex: /^[0-9a-fA-F]+$/,
  nanoid: /^[A-Za-z0-9_-]{21}$/,
  cuid: /^c[^\s-]{8,}$/,
  cuid2: /^[a-z][a-z0-9]*$/,
  ulid: /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/,

  // Financial
  creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
  iban: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/,

  // Communication
  phone: /^\+?[1-9]\d{1,14}$/,

  // Visual
  color: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  rgb: /^rgb\(\s*(?:(?:\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*,\s*){2}(?:\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*\)$/,
  rgba: /^rgba\(\s*(?:(?:\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*,\s*){3}(?:0|1|0?\.\d+)\s*\)$/,

  // Web formats
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  // Date/Time extended
  iso8601: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/,
  time24: /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
  time12: /^(0?[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9] ?[AaPp][Mm]$/
};

// Custom string schema with advanced format validation
export class AdvancedStringSchema extends Schema<string> {
  private format?: keyof typeof StringFormats;
  private customPattern?: RegExp;
  private minLength?: number;
  private maxLength?: number;

  constructor() {
    super({ type: 'advanced_string' });
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

    // Length validation
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

    // Format validation
    if (this.format) {
      const pattern = StringFormats[this.format];
      if (!pattern.test(data)) {
        throw new ValidationError([{
          code: 'invalid_string',
          path: [],
          message: `String does not match ${this.format} format`
        }]);
      }
    }

    if (this.customPattern && !this.customPattern.test(data)) {
      throw new ValidationError([{
        code: 'invalid_string',
        path: [],
        message: 'String does not match required pattern'
      }]);
    }

    return data;
  }

  // Length methods
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

  // Advanced format methods
  ipv4(): this {
    this.format = 'ipv4';
    return this;
  }

  ipv6(): this {
    this.format = 'ipv6';
    return this;
  }

  mac(): this {
    this.format = 'mac';
    return this;
  }

  jwt(): this {
    this.format = 'jwt';
    return this;
  }

  base64(): this {
    this.format = 'base64';
    return this;
  }

  hex(): this {
    this.format = 'hex';
    return this;
  }

  creditCard(): this {
    this.format = 'creditCard';
    return this;
  }

  phone(): this {
    this.format = 'phone';
    return this;
  }

  color(): this {
    this.format = 'color';
    return this;
  }

  slug(): this {
    this.format = 'slug';
    return this;
  }

  iso8601(): this {
    this.format = 'iso8601';
    return this;
  }

  // Custom pattern
  regex(pattern: RegExp): this {
    this.customPattern = pattern;
    return this;
  }

  // Utility methods
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