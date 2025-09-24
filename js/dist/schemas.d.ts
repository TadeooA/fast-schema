export { Schema, BaseSchema } from './core';
export { StringSchema } from './core';
export { NumberSchema } from './core';
export { BooleanSchema } from './core';
export { ArraySchema } from './core';
export { ObjectSchema } from './core';
export { UnionSchema } from './core';
export { OptionalSchema } from './core';
export { NullableSchema } from './core';
export declare class NullSchema extends Schema<null> {
    constructor();
    protected _validate(data: unknown): null;
}
export declare class UndefinedSchema extends Schema<undefined> {
    constructor();
    protected _validate(data: unknown): undefined;
}
export declare class AnySchema extends Schema<any> {
    constructor();
    protected _validate(data: unknown): any;
}
export declare class UnknownSchema extends Schema<unknown> {
    constructor();
    protected _validate(data: unknown): unknown;
}
export declare class NeverSchema extends Schema<never> {
    constructor();
    protected _validate(data: unknown): never;
}
//# sourceMappingURL=schemas.d.ts.map