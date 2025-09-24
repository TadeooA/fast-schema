import { Schema } from '../base/schema';
export declare class ArraySchema<T> extends Schema<T[]> {
    private itemSchema;
    private minItems?;
    private maxItems?;
    constructor(itemSchema: Schema<T>);
    _validate(data: unknown): T[];
    min(count: number): this;
    max(count: number): this;
    length(count: number): this;
    nonempty(): this;
    element(): Schema<T>;
}
