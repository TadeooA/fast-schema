// Record schema implementation
import { Schema } from '../base/schema';
import { ValidationError } from '../base/types';

export class RecordSchema<T> extends Schema<Record<string, T>> {
  constructor(private valueSchema: Schema<T>) {
    super({
      type: 'record',
      valueType: valueSchema.getSchema()
    });
  }

  _validate(data: unknown): Record<string, T> {
    if (data === null || data === undefined) {
      throw new ValidationError([{
        code: 'invalid_type',
        expected: 'object',
        received: data === null ? 'null' : 'undefined',
        path: [],
        message: 'Expected object, received ' + (data === null ? 'null' : 'undefined')
      }]);
    }

    if (typeof data !== 'object') {
      throw new ValidationError([{
        code: 'invalid_type',
        expected: 'object',
        received: typeof data,
        path: [],
        message: `Expected object, received ${typeof data}`
      }]);
    }

    const result: Record<string, T> = {};
    const issues: ValidationError['issues'] = [];

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      try {
        result[key] = this.valueSchema._validate(value);
      } catch (error) {
        if (error instanceof ValidationError) {
          error.issues.forEach(issue => {
            issues.push({
              ...issue,
              path: [key, ...issue.path]
            });
          });
        } else {
          issues.push({
            code: 'custom',
            path: [key],
            message: error instanceof Error ? error.message : 'Validation failed'
          });
        }
      }
    }

    if (issues.length > 0) {
      throw new ValidationError(issues);
    }

    return result;
  }

  // Type inference properties (not getters to avoid conflict)
  declare _output: Record<string, T>;
  declare _input: Record<string, T>;
}