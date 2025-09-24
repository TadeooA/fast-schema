import { Schema } from '../base/schema';
import { ObjectSchema } from '../complex/object';
export declare class DeepPartialSchema<T> extends Schema<DeepPartial<T>> {
    private innerSchema;
    constructor(innerSchema: Schema<T>);
    _validate(data: unknown): DeepPartial<T>;
}
export declare class RequiredSchema<T> extends Schema<Required<T>> {
    private innerSchema;
    constructor(innerSchema: ObjectSchema<T>);
    _validate(data: unknown): Required<T>;
}
export declare class ReadonlySchema<T> extends Schema<Readonly<T>> {
    private innerSchema;
    constructor(innerSchema: Schema<T>);
    _validate(data: unknown): Readonly<T>;
}
export declare class NonNullableSchema<T> extends Schema<NonNullable<T>> {
    private innerSchema;
    constructor(innerSchema: Schema<T>);
    _validate(data: unknown): NonNullable<T>;
}
export declare class KeyofSchema<T extends Record<string, any>> extends Schema<keyof T> {
    private objectSchema;
    constructor(objectSchema: ObjectSchema<T>);
    _validate(data: unknown): keyof T;
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export declare function makeDeepPartial<T>(schema: Schema<T>): DeepPartialSchema<T>;
export declare function makeRequired<T extends Record<string, any>>(schema: ObjectSchema<T>): RequiredSchema<T>;
export declare function makeReadonly<T>(schema: Schema<T>): ReadonlySchema<T>;
export declare function makeNonNullable<T>(schema: Schema<T>): NonNullableSchema<T>;
export declare function keyof<T extends Record<string, any>>(schema: ObjectSchema<T>): KeyofSchema<T>;
export declare class SchemaMerger {
    static merge<A, B>(schemaA: ObjectSchema<A>, schemaB: ObjectSchema<B>): ObjectSchema<A & B>;
    static deepMerge<A, B>(schemaA: ObjectSchema<A>, schemaB: ObjectSchema<B>): ObjectSchema<A & B>;
}
export declare class DiscriminatedUnionSchema<T extends Record<string, any>> extends Schema<T> {
    private discriminator;
    private schemas;
    constructor(discriminator: keyof T, schemas: Array<ObjectSchema<T>>);
    _validate(data: unknown): T;
}
