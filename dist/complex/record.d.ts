import { Schema } from '../base/schema';
export declare class RecordSchema<T> extends Schema<Record<string, T>> {
    private valueSchema;
    constructor(valueSchema: Schema<T>);
    _validate(data: unknown): Record<string, T>;
    _output: Record<string, T>;
    _input: Record<string, T>;
}
