// Number schema implementation
import { Schema } from '../base/schema';
import { ValidationError } from '../base/types';

export class NumberSchema extends Schema<number> {
  private minValue?: number;
  private maxValue?: number;
  private isInteger = false;
  private isFinite = false;

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

    if (this.isFinite && !Number.isFinite(data)) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected finite number'
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

  // Range constraints
  min(value: number): this {
    this.minValue = value;
    return this;
  }

  max(value: number): this {
    this.maxValue = value;
    return this;
  }

  // Type constraints
  int(): this {
    this.isInteger = true;
    return this;
  }

  finite(): this {
    this.isFinite = true;
    return this;
  }

  // Convenience methods
  positive(): this {
    return this.min(0.000001);
  }

  nonnegative(): this {
    return this.min(0);
  }

  negative(): this {
    return this.max(-0.000001);
  }

  nonpositive(): this {
    return this.max(0);
  }

  // Mathematical operations
  gte(value: number): this {
    return this.min(value);
  }

  gt(value: number): this {
    return this.min(value + Number.EPSILON);
  }

  lte(value: number): this {
    return this.max(value);
  }

  lt(value: number): this {
    return this.max(value - Number.EPSILON);
  }

  // Special number validations
  multipleOf(value: number) {
    return this.refine(
      (data) => Math.abs(data % value) < Number.EPSILON,
      `Number must be a multiple of ${value}`
    );
  }

  step(value: number) {
    return this.multipleOf(value);
  }

  // Parsing utilities
  static coerce(data: unknown): number {
    if (typeof data === 'number') return data;
    if (typeof data === 'string') {
      const parsed = Number(data);
      if (!isNaN(parsed)) return parsed;
    }
    throw new ValidationError([{
      code: 'invalid_type',
      path: [],
      message: 'Cannot coerce to number',
      received: typeof data,
      expected: 'number'
    }]);
  }
}