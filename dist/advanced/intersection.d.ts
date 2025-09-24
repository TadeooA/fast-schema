import { Schema } from '../base/schema';
export declare class IntersectionSchema<A, B> extends Schema<A & B> {
    private schemaA;
    private schemaB;
    constructor(schemaA: Schema<A>, schemaB: Schema<B>);
    _validate(data: unknown): A & B;
    left(): Schema<A>;
    right(): Schema<B>;
}
