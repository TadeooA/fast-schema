// Split core schema types to separate files for better maintainability

export { Schema, BaseSchema } from './core';
export { StringSchema } from './core';
export { NumberSchema } from './core';
export { BooleanSchema } from './core';
export { ArraySchema } from './core';
export { ObjectSchema } from './core';
export { UnionSchema } from './core';
export { OptionalSchema } from './core';
export { NullableSchema } from './core';

// Utility schemas
export class NullSchema extends Schema<null> {
  constructor() {
    super({ type: 'null' });
  }

  protected _validate(data: unknown): null {
    if (data !== null) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected null',
        received: typeof data,
        expected: 'null'
      }]);
    }
    return null;
  }
}

export class UndefinedSchema extends Schema<undefined> {
  constructor() {
    super({ type: 'undefined' });
  }

  protected _validate(data: unknown): undefined {
    if (data !== undefined) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected undefined',
        received: typeof data,
        expected: 'undefined'
      }]);
    }
    return undefined;
  }
}

export class AnySchema extends Schema<any> {
  constructor() {
    super({ type: 'any' });
  }

  protected _validate(data: unknown): any {
    return data;
  }
}

export class UnknownSchema extends Schema<unknown> {
  constructor() {
    super({ type: 'unknown' });
  }

  protected _validate(data: unknown): unknown {
    return data;
  }
}

export class NeverSchema extends Schema<never> {
  constructor() {
    super({ type: 'never' });
  }

  protected _validate(data: unknown): never {
    throw new ValidationError([{
      code: 'invalid_type',
      path: [],
      message: 'Never type - no value is valid'
    }]);
  }
}