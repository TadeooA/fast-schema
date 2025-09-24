import { Schema } from '../base/schema';
export declare class NumberSchema extends Schema<number> {
    private minValue?;
    private maxValue?;
    private isInteger;
    private isFinite;
    constructor();
    _validate(data: unknown): number;
    min(value: number): this;
    max(value: number): this;
    int(): this;
    finite(): this;
    positive(): this;
    nonnegative(): this;
    negative(): this;
    nonpositive(): this;
    gte(value: number): this;
    gt(value: number): this;
    lte(value: number): this;
    lt(value: number): this;
    multipleOf(value: number): import("../base/schema").RefinementSchema<number>;
    step(value: number): import("../base/schema").RefinementSchema<number>;
    static coerce(data: unknown): number;
}
//# sourceMappingURL=number.d.ts.map