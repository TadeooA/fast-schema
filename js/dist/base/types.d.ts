export interface ValidationIssue {
    code: string;
    path: (string | number)[];
    message: string;
    received?: string;
    expected?: string;
}
export interface SchemaDefinition {
    type: string;
    [key: string]: any;
}
export type SafeParseReturnType<Input, Output> = {
    success: true;
    data: Output;
} | {
    success: false;
    error: ValidationError;
};
export declare class ValidationError extends Error {
    issues: ValidationIssue[];
    constructor(issues: ValidationIssue[]);
    format(): Record<string, any>;
    flatten(): {
        fieldErrors: Record<string, string[]>;
        formErrors: string[];
    };
}
export type TypeOf<T> = T extends {
    _output: infer U;
} ? U : never;
export type InputOf<T> = T extends {
    _input: infer U;
} ? U : never;
export type OutputOf<T> = T extends {
    _output: infer U;
} ? U : never;
//# sourceMappingURL=types.d.ts.map