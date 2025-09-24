type ValidationFn<T> = (data: unknown) => T;
export type UltraValidationResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
};
export declare class UltraSchemaCompiler {
    private static compiledSchemas;
    private static stringValidators;
    static compileString(constraints?: {
        min?: number;
        max?: number;
        format?: string;
    }): ValidationFn<string>;
    static compileNumber(constraints?: {
        min?: number;
        max?: number;
        integer?: boolean;
    }): ValidationFn<number>;
    static compileBoolean(): ValidationFn<boolean>;
    static compileArray<T>(itemValidator: ValidationFn<T>): ValidationFn<T[]>;
    static compileObject<T extends Record<string, any>>(shape: Record<string, ValidationFn<any>>, required?: string[]): ValidationFn<T>;
}
export declare class UltraStringSchema {
    private constraints;
    private validator;
    constructor(constraints?: {
        min?: number;
        max?: number;
        format?: string;
    });
    min(length: number): UltraStringSchema;
    max(length: number): UltraStringSchema;
    email(): UltraStringSchema;
    uuid(): UltraStringSchema;
    url(): UltraStringSchema;
    datetime(): UltraStringSchema;
    parse(data: unknown): string;
    safeParse(data: unknown): UltraValidationResult<string>;
    getValidator(): ValidationFn<string>;
}
export declare class UltraNumberSchema {
    private constraints;
    private validator;
    constructor(constraints?: {
        min?: number;
        max?: number;
        integer?: boolean;
    });
    min(value: number): UltraNumberSchema;
    max(value: number): UltraNumberSchema;
    int(): UltraNumberSchema;
    positive(): UltraNumberSchema;
    parse(data: unknown): number;
    safeParse(data: unknown): UltraValidationResult<number>;
    getValidator(): ValidationFn<number>;
}
export declare class UltraBooleanSchema {
    private validator;
    constructor();
    parse(data: unknown): boolean;
    safeParse(data: unknown): UltraValidationResult<boolean>;
    getValidator(): ValidationFn<boolean>;
}
export declare class UltraArraySchema<T> {
    private itemSchema;
    private validator;
    constructor(itemSchema: {
        getValidator(): ValidationFn<T>;
    });
    parse(data: unknown): T[];
    safeParse(data: unknown): UltraValidationResult<T[]>;
    getValidator(): ValidationFn<T[]>;
}
export declare class UltraObjectSchema<T extends Record<string, any>> {
    private shape;
    private required;
    private validator;
    constructor(shape: {
        [K in keyof T]: {
            getValidator(): ValidationFn<T[K]>;
        };
    }, required?: (keyof T)[]);
    parse(data: unknown): T;
    safeParse(data: unknown): UltraValidationResult<T>;
    getValidator(): ValidationFn<T>;
}
export declare class UltraBatchValidator<T> {
    private validator;
    constructor(validator: ValidationFn<T>);
    parseMany(items: unknown[]): T[];
    safeParseManyFast(items: unknown[]): UltraValidationResult<T[]>;
    parseManyParallel(items: unknown[], chunkSize?: number): Promise<T[]>;
}
export declare function createSuccessResult<T>(data: T): UltraValidationResult<T>;
export declare function createErrorResult(error: string): UltraValidationResult<any>;
export declare class JITOptimizer {
    private static hotSchemas;
    private static threshold;
    static recordUsage(schemaId: string, validator: ValidationFn<any>): ValidationFn<any>;
    private static optimizeValidator;
}
export {};
//# sourceMappingURL=core.d.ts.map