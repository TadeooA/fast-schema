// Intersection schema for combining multiple schemas
import { Schema } from '../base/schema';
import { ValidationError } from '../base/types';

export class IntersectionSchema<A, B> extends Schema<A & B> {
  constructor(private schemaA: Schema<A>, private schemaB: Schema<B>) {
    super({
      type: 'intersection',
      schemas: [schemaA.getSchema(), schemaB.getSchema()]
    });
  }

  _validate(data: unknown): A & B {
    // Validate against both schemas
    const resultA = this.schemaA._validate(data);
    const resultB = this.schemaB._validate(data);

    // For objects, merge the results
    if (typeof resultA === 'object' && typeof resultB === 'object' &&
        resultA !== null && resultB !== null &&
        !Array.isArray(resultA) && !Array.isArray(resultB)) {
      return { ...resultA, ...resultB } as A & B;
    }

    // For primitives, both must be the same value
    if ((resultA as any) === (resultB as any)) {
      return resultA as A & B;
    }

    throw new ValidationError([{
      code: 'invalid_intersection',
      path: [],
      message: 'Values do not match for intersection type'
    }]);
  }

  // Helper method to access schemas
  left(): Schema<A> {
    return this.schemaA;
  }

  right(): Schema<B> {
    return this.schemaB;
  }
}