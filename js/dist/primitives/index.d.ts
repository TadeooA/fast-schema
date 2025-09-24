export { StringSchema } from './string';
export { NumberSchema } from './number';
import { Schema } from '../base/schema';
export declare class BooleanSchema extends Schema<boolean> {
    constructor();
    _validate(data: unknown): boolean;
    isTrue(): import("../base/schema").RefinementSchema<boolean>;
    isFalse(): import("../base/schema").RefinementSchema<boolean>;
}
export declare class NullSchema extends Schema<null> {
    constructor();
    _validate(data: unknown): null;
}
export declare class UndefinedSchema extends Schema<undefined> {
    constructor();
    _validate(data: unknown): undefined;
}
export declare class AnySchema extends Schema<any> {
    constructor();
    _validate(data: unknown): any;
}
export declare class UnknownSchema extends Schema<unknown> {
    constructor();
    _validate(data: unknown): unknown;
}
export declare class NeverSchema extends Schema<never> {
    constructor();
    _validate(data: unknown): never;
}
//# sourceMappingURL=index.d.ts.map