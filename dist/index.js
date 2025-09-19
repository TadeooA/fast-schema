// Fast-Schema - Initial GitHub Packages Release
// Simplified JavaScript version with core functionality

class ValidationError extends Error {
  constructor(issues) {
    const message = issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    super(message);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

class Schema {
  constructor(definition) {
    this.definition = definition;
  }

  parse(data) {
    return this._validate(data);
  }

  safeParse(data) {
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
          message: error.message || 'Unknown error'
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

  refine(predicate, message) {
    return new RefinementSchema(this, predicate, message);
  }

  transform(transformer) {
    return new TransformSchema(this, transformer);
  }
}

class StringSchema extends Schema {
  constructor() {
    super({ type: 'string' });
    this.minLength = undefined;
    this.maxLength = undefined;
    this.pattern = undefined;
  }

  _validate(data) {
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

  min(length) {
    this.minLength = length;
    return this;
  }

  max(length) {
    this.maxLength = length;
    return this;
  }

  length(length) {
    return this.min(length).max(length);
  }

  email() {
    this.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this;
  }

  url() {
    this.pattern = /^https?:\/\/.+/;
    return this;
  }

  uuid() {
    this.pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return this;
  }
}

class NumberSchema extends Schema {
  constructor() {
    super({ type: 'number' });
    this.minValue = undefined;
    this.maxValue = undefined;
    this.isInteger = false;
  }

  _validate(data) {
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

  min(value) {
    this.minValue = value;
    return this;
  }

  max(value) {
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

  negative() {
    return this.max(-0.01);
  }
}

class BooleanSchema extends Schema {
  constructor() {
    super({ type: 'boolean' });
  }

  _validate(data) {
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

class ArraySchema extends Schema {
  constructor(itemSchema) {
    super({ type: 'array' });
    this.itemSchema = itemSchema;
    this.minItems = undefined;
    this.maxItems = undefined;
  }

  _validate(data) {
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

    const result = [];
    const issues = [];

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

  min(count) {
    this.minItems = count;
    return this;
  }

  max(count) {
    this.maxItems = count;
    return this;
  }

  length(count) {
    return this.min(count).max(count);
  }

  nonempty() {
    return this.min(1);
  }
}

class ObjectSchema extends Schema {
  constructor(shape) {
    super({ type: 'object' });
    this.shape = shape;
  }

  _validate(data) {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected object',
        received: typeof data,
        expected: 'object'
      }]);
    }

    const result = {};
    const issues = [];

    for (const [key, schema] of Object.entries(this.shape)) {
      try {
        if (key in data) {
          result[key] = schema._validate(data[key]);
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

class UnionSchema extends Schema {
  constructor(schemas) {
    super({ type: 'union' });
    this.schemas = schemas;
  }

  _validate(data) {
    for (const schema of this.schemas) {
      try {
        return schema._validate(data);
      } catch (error) {
        // Continue to next schema
      }
    }

    throw new ValidationError([{
      code: 'invalid_union',
      path: [],
      message: 'Input did not match any union member'
    }]);
  }
}

class OptionalSchema extends Schema {
  constructor(innerSchema) {
    super({ type: 'optional' });
    this.innerSchema = innerSchema;
  }

  _validate(data) {
    if (data === undefined) {
      return undefined;
    }
    return this.innerSchema._validate(data);
  }
}

class NullableSchema extends Schema {
  constructor(innerSchema) {
    super({ type: 'nullable' });
    this.innerSchema = innerSchema;
  }

  _validate(data) {
    if (data === null) {
      return null;
    }
    return this.innerSchema._validate(data);
  }
}

class RefinementSchema extends Schema {
  constructor(innerSchema, predicate, message) {
    super({ type: 'refinement' });
    this.innerSchema = innerSchema;
    this.predicate = predicate;
    this.message = message;
  }

  _validate(data) {
    const validated = this.innerSchema._validate(data);

    if (!this.predicate(validated)) {
      throw new ValidationError([{
        code: 'custom',
        path: [],
        message: this.message
      }]);
    }

    return validated;
  }
}

class TransformSchema extends Schema {
  constructor(innerSchema, transformer) {
    super({ type: 'transform' });
    this.innerSchema = innerSchema;
    this.transformer = transformer;
  }

  _validate(data) {
    const validated = this.innerSchema._validate(data);
    return this.transformer(validated);
  }
}

// Main API
const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  array: (schema) => new ArraySchema(schema),
  object: (shape) => new ObjectSchema(shape),
  union: (schemas) => new UnionSchema(schemas),
  literal: (value) => {
    return new StringSchema().refine((data) => data === value, `Expected literal value: ${value}`);
  },
  any: () => {
    class AnySchema extends Schema {
      _validate(data) {
        return data;
      }
    }
    return new AnySchema({ type: 'any' });
  },
  unknown: () => {
    class UnknownSchema extends Schema {
      _validate(data) {
        return data;
      }
    }
    return new UnknownSchema({ type: 'unknown' });
  }
};

// Exports
module.exports = {
  z,
  ValidationError,
  ZodError: ValidationError, // Zod compatibility
  Schema,
  StringSchema,
  NumberSchema,
  BooleanSchema,
  ArraySchema,
  ObjectSchema,
  UnionSchema
};

// Default export for ES modules compatibility
module.exports.default = z;