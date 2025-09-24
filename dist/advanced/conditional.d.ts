import { Schema } from '../base/schema';
export declare class ConditionalSchema<T> extends Schema<T> {
    private condition;
    private trueSchema;
    private falseSchema;
    constructor(condition: (data: unknown) => boolean, trueSchema: Schema<T>, falseSchema: Schema<T>);
    _validate(data: unknown): T;
    getCondition(): (data: unknown) => boolean;
    getTrueSchema(): Schema<T>;
    getFalseSchema(): Schema<T>;
}
export declare function conditional<T>(condition: (data: unknown) => boolean, trueSchema: Schema<T>, falseSchema: Schema<T>): ConditionalSchema<T>;
