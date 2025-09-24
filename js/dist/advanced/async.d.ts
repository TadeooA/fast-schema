import { Schema } from '../base/schema';
import { SafeParseReturnType } from '../base/types';
export declare class AsyncSchema<T> extends Schema<T> {
    private asyncValidator;
    private syncFallback?;
    constructor(asyncValidator: (data: unknown) => Promise<T>, syncFallback?: Schema<T> | undefined);
    _validate(data: unknown): T;
    parseAsync(data: unknown): Promise<T>;
    safeParseAsync(data: unknown): Promise<SafeParseReturnType<unknown, T>>;
}
export declare class AsyncRefinementSchema<T> extends Schema<T> {
    private innerSchema;
    private asyncPredicate;
    private message;
    constructor(innerSchema: Schema<T>, asyncPredicate: (data: T) => Promise<boolean>, message: string);
    _validate(data: unknown): T;
    parseAsync(data: unknown): Promise<T>;
    safeParseAsync(data: unknown): Promise<SafeParseReturnType<unknown, T>>;
}
export declare class PromiseSchema<T> extends Schema<Promise<T>> {
    private valueSchema;
    constructor(valueSchema: Schema<T>);
    _validate(data: unknown): Promise<T>;
    parseAsync(data: unknown): Promise<Promise<T>>;
    safeParseAsync(data: unknown): Promise<SafeParseReturnType<Promise<T>, Promise<T>>>;
}
//# sourceMappingURL=async.d.ts.map