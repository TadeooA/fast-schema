import { Schema } from '../base/schema';
export declare class StringSchema extends Schema<string> {
    private minLength?;
    private maxLength?;
    private pattern?;
    private formats;
    constructor();
    _validate(data: unknown): string;
    min(length: number): this;
    max(length: number): this;
    length(length: number): this;
    email(): this;
    url(): this;
    uuid(): this;
    regex(pattern: RegExp): this;
    datetime(): this;
    date(): this;
    time(): this;
    ip(): this;
    private transforms;
    trim(): this;
    toLowerCase(): this;
    toUpperCase(): this;
    nonempty(): this;
    startsWith(prefix: string): import("../base/schema").RefinementSchema<string>;
    endsWith(suffix: string): import("../base/schema").RefinementSchema<string>;
    includes(substring: string): import("../base/schema").RefinementSchema<string>;
}
//# sourceMappingURL=string.d.ts.map