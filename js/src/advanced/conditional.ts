// Conditional schema for context-dependent validation
import { Schema } from '../base/schema';
import { ValidationError } from '../base/types';

export class ConditionalSchema<T> extends Schema<T> {
  constructor(
    private condition: (data: unknown) => boolean,
    private trueSchema: Schema<T>,
    private falseSchema: Schema<T>
  ) {
    super({
      type: 'conditional',
      condition: condition.toString(),
      trueSchema: trueSchema.getSchema(),
      falseSchema: falseSchema.getSchema()
    });
  }

  _validate(data: unknown): T {
    try {
      if (this.condition(data)) {
        return this.trueSchema._validate(data);
      } else {
        return this.falseSchema._validate(data);
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        // Re-throw with conditional context
        const issues = error.issues.map(issue => ({
          ...issue,
          message: `Conditional validation failed: ${issue.message}`
        }));
        throw new ValidationError(issues);
      }
      throw error;
    }
  }

  // Helper methods
  getCondition(): (data: unknown) => boolean {
    return this.condition;
  }

  getTrueSchema(): Schema<T> {
    return this.trueSchema;
  }

  getFalseSchema(): Schema<T> {
    return this.falseSchema;
  }
}

// Utility function to create conditional schemas
export function conditional<T>(
  condition: (data: unknown) => boolean,
  trueSchema: Schema<T>,
  falseSchema: Schema<T>
): ConditionalSchema<T> {
  return new ConditionalSchema(condition, trueSchema, falseSchema);
}