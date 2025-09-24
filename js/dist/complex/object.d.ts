import { Schema, OptionalSchema } from '../base/schema';
export declare class ObjectSchema<T extends Record<string, any>> extends Schema<T> {
    private shape;
    constructor(shape: {
        [K in keyof T]: Schema<T[K]>;
    });
    _validate(data: unknown): T;
    partial(): ObjectSchema<{
        [K in keyof T]?: T[K];
    }>;
    required(): ObjectSchema<{
        [K in keyof T]: T[K] extends OptionalSchema<infer U> ? U : T[K];
    }>;
    pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>>;
    omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>>;
    extend<U extends Record<string, any>>(extension: {
        [K in keyof U]: Schema<U[K]>;
    }): ObjectSchema<Record<string, any>>;
    merge<U>(other: ObjectSchema<U>): ObjectSchema<Record<string, any>>;
    getShape(): {
        [K in keyof T]: Schema<T[K]>;
    };
    passthrough(): ObjectSchema<T & Record<string, unknown>>;
    strict(): this;
    strip(): this;
}
//# sourceMappingURL=object.d.ts.map