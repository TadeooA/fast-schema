import { ValidationError, SchemaDefinition, SafeParseReturnType } from './types';
export { ValidationError };
export declare abstract class Schema<Output = any, Input = Output> {
    protected definition: SchemaDefinition;
    readonly _type: Output;
    readonly _output: Output;
    readonly _input: Input;
    constructor(definition: SchemaDefinition);
    abstract _validate(data: unknown): Output;
    parse(data: unknown): Output;
    safeParse(data: unknown): SafeParseReturnType<Input, Output>;
    getSchema(): SchemaDefinition;
    optional(): OptionalSchema<Output>;
    nullable(): NullableSchema<Output>;
    default(value: Output): DefaultSchema<Output>;
    refine<T extends Output>(predicate: (data: T) => boolean, message: string | {
        message: string;
        path?: (string | number)[];
    }): RefinementSchema<T>;
    transform<T>(transformer: (data: Output) => T): TransformSchema<T>;
    parseAsync(data: unknown): Promise<Output>;
    safeParseAsync(data: unknown): Promise<SafeParseReturnType<Input, Output>>;
    brand<B extends string | number | symbol>(): Schema<Output & {
        __brand: B;
    }>;
    catch(value: Output): Schema<Output>;
    pipe<T>(schema: Schema<T, Output>): Schema<T, Input>;
}
export declare class OptionalSchema<T> extends Schema<T | undefined> {
    private innerSchema;
    constructor(innerSchema: Schema<T>);
    _validate(data: unknown): T | undefined;
}
export declare class NullableSchema<T> extends Schema<T | null> {
    private innerSchema;
    constructor(innerSchema: Schema<T>);
    _validate(data: unknown): T | null;
}
export declare class DefaultSchema<T> extends Schema<T> {
    private innerSchema;
    private defaultValue;
    constructor(innerSchema: Schema<T>, defaultValue: T);
    _validate(data: unknown): T;
}
export declare class RefinementSchema<T> extends Schema<T> {
    private innerSchema;
    private predicate;
    private errorMessage;
    constructor(innerSchema: Schema<T>, predicate: (data: T) => boolean, errorMessage: string | {
        message: string;
        path?: (string | number)[];
    });
    _validate(data: unknown): T;
}
export declare class TransformSchema<T> extends Schema<T> {
    private innerSchema;
    private transformer;
    constructor(innerSchema: Schema<any>, transformer: (data: any) => T);
    _validate(data: unknown): T;
}
