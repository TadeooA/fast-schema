export declare class ExtremeOptimizer {
    private static functionCache;
    static compileExtremeString(constraints?: {
        min?: number;
        max?: number;
        format?: 'email' | 'uuid' | 'url';
    }): (data: unknown) => string;
    static compileExtremeNumber(constraints?: {
        min?: number;
        max?: number;
        integer?: boolean;
    }): (data: unknown) => number;
    static compileExtremeBoolean(): (data: unknown) => boolean;
    static compileExtremeArray<T>(itemValidator: (data: unknown) => T): (data: unknown) => T[];
    static compileExtremeObject<T extends Record<string, any>>(validators: Record<string, (data: unknown) => any>, required?: string[]): (data: unknown) => T;
}
export declare class ExtremeStringSchema {
    private constraints;
    private validator;
    constructor(constraints?: {
        min?: number;
        max?: number;
        format?: 'email' | 'uuid' | 'url';
    });
    min(length: number): ExtremeStringSchema;
    max(length: number): ExtremeStringSchema;
    email(): ExtremeStringSchema;
    uuid(): ExtremeStringSchema;
    url(): ExtremeStringSchema;
    parse(data: unknown): string;
    safeParse(data: unknown): {
        success: true;
        data: string;
    } | {
        success: false;
        error: string;
    };
    getValidator(): (data: unknown) => string;
}
export declare class ExtremeNumberSchema {
    private constraints;
    private validator;
    constructor(constraints?: {
        min?: number;
        max?: number;
        integer?: boolean;
    });
    min(value: number): ExtremeNumberSchema;
    max(value: number): ExtremeNumberSchema;
    int(): ExtremeNumberSchema;
    parse(data: unknown): number;
    safeParse(data: unknown): {
        success: true;
        data: number;
    } | {
        success: false;
        error: string;
    };
    getValidator(): (data: unknown) => number;
}
export declare class ExtremeBooleanSchema {
    private validator;
    constructor();
    parse(data: unknown): boolean;
    safeParse(data: unknown): {
        success: true;
        data: boolean;
    } | {
        success: false;
        error: string;
    };
    getValidator(): (data: unknown) => boolean;
}
export declare class ExtremeArraySchema<T> {
    private itemSchema;
    private validator;
    private constraints;
    constructor(itemSchema: {
        getValidator(): (data: unknown) => T;
    }, constraints?: {
        min?: number;
        max?: number;
    });
    private compileValidator;
    min(count: number): ExtremeArraySchema<T>;
    max(count: number): ExtremeArraySchema<T>;
    length(count: number): ExtremeArraySchema<T>;
    parse(data: unknown): T[];
    safeParse(data: unknown): {
        success: true;
        data: T[];
    } | {
        success: false;
        error: string;
    };
    getValidator(): (data: unknown) => T[];
}
export declare class ExtremeObjectSchema<T extends Record<string, any>> {
    private validator;
    constructor(shape: {
        [K in keyof T]: {
            getValidator(): (data: unknown) => T[K];
        };
    }, required?: (keyof T)[]);
    parse(data: unknown): T;
    safeParse(data: unknown): {
        success: true;
        data: T;
    } | {
        success: false;
        error: string;
    };
    getValidator(): (data: unknown) => T;
}
export declare class ExtremeBatchValidator<T> {
    private validator;
    private resultPool;
    constructor(schema: {
        getValidator(): (data: unknown) => T;
    });
    parseMany(items: unknown[]): T[];
    returnToPool(result: T[]): void;
}
export declare const extreme: {
    string: () => ExtremeStringSchema;
    number: () => ExtremeNumberSchema;
    boolean: () => ExtremeBooleanSchema;
    array: <T>(schema: {
        getValidator(): (data: unknown) => T;
    }) => ExtremeArraySchema<T>;
    object: <T extends Record<string, any>>(shape: { [K in keyof T]: {
        getValidator(): (data: unknown) => T[K];
    }; }) => ExtremeObjectSchema<T>;
    batch: <T>(schema: {
        getValidator(): (data: unknown) => T;
    }) => ExtremeBatchValidator<T>;
    clearCache: () => void;
    getCacheSize: () => number;
};
export default extreme;
//# sourceMappingURL=extreme.d.ts.map