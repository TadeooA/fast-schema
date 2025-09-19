// Export all primitive schemas
export { StringSchema } from './string';
export { NumberSchema } from './number';

// Boolean schema
import { Schema } from '../base/schema';
import { ValidationError } from '../base/types';

export class BooleanSchema extends Schema<boolean> {
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

  // Boolean-specific methods could go here
  isTrue() {
    return this.refine(data => data === true, 'Must be true');
  }

  isFalse() {
    return this.refine(data => data === false, 'Must be false');
  }
}

// Null schema
export class NullSchema extends Schema<null> {
  constructor() {
    super({ type: 'null' });
  }

  _validate(data: unknown): null {
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

// Undefined schema
export class UndefinedSchema extends Schema<undefined> {
  constructor() {
    super({ type: 'undefined' });
  }

  _validate(data: unknown): undefined {
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

// Any schema
export class AnySchema extends Schema<any> {
  constructor() {
    super({ type: 'any' });
  }

  _validate(data: unknown): any {
    return data;
  }
}

// Unknown schema
export class UnknownSchema extends Schema<unknown> {
  constructor() {
    super({ type: 'unknown' });
  }

  _validate(data: unknown): unknown {
    return data;
  }
}

// Never schema
export class NeverSchema extends Schema<never> {
  constructor() {
    super({ type: 'never' });
  }

  _validate(data: unknown): never {
    throw new ValidationError([{
      code: 'invalid_type',
      path: [],
      message: 'Never type - no value is valid'
    }]);
  }
}