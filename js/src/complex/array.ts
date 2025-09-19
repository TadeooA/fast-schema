// Array schema implementation
import { Schema } from '../base/schema';
import { ValidationError } from '../base/types';

export class ArraySchema<T> extends Schema<T[]> {
  private minItems?: number;
  private maxItems?: number;

  constructor(private itemSchema: Schema<T>) {
    super({ type: 'array', element: itemSchema.getSchema() });
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

    if (this.minItems !== undefined && data.length < this.minItems) {
      throw new ValidationError([{
        code: 'too_small',
        path: [],
        message: `Array must have at least ${this.minItems} items`
      }]);
    }

    if (this.maxItems !== undefined && data.length > this.maxItems) {
      throw new ValidationError([{
        code: 'too_big',
        path: [],
        message: `Array must have at most ${this.maxItems} items`
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

  // Array-specific methods
  min(count: number): this {
    this.minItems = count;
    return this;
  }

  max(count: number): this {
    this.maxItems = count;
    return this;
  }

  length(count: number): this {
    return this.min(count).max(count);
  }

  nonempty(): this {
    return this.min(1);
  }

  // Element access
  element(): Schema<T> {
    return this.itemSchema;
  }
}