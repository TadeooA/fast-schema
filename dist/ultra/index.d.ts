import { UltraStringSchema, UltraNumberSchema, UltraBooleanSchema, UltraArraySchema, UltraObjectSchema, UltraBatchValidator, type UltraValidationResult } from './core';
export declare const ultra: {
    string: () => UltraStringSchema;
    number: () => UltraNumberSchema;
    boolean: () => UltraBooleanSchema;
    array: <T>(schema: {
        getValidator(): (data: unknown) => T;
    }) => UltraArraySchema<T>;
    object: <T extends Record<string, any>>(shape: { [K in keyof T]: {
        getValidator(): (data: unknown) => T[K];
    }; }) => UltraObjectSchema<T>;
    batch: <T>(schema: {
        getValidator(): (data: unknown) => T;
    }) => UltraBatchValidator<T>;
    jit: <T>(schema: {
        getValidator(): (data: unknown) => T;
    }) => {
        parse: (data: unknown) => T;
    };
    wasm: <T>(schema: {
        getValidator(): (data: unknown) => T;
    }) => {
        parse: (data: unknown) => T;
        safeParse: (data: unknown) => UltraValidationResult<T>;
    };
    literal: <T extends string | number | boolean>(value: T) => {
        parse: (data: unknown) => T;
        safeParse: (data: unknown) => UltraValidationResult<T>;
        getValidator: () => (data: unknown) => T;
    };
    any: () => {
        parse: (data: unknown) => any;
        safeParse: (data: unknown) => UltraValidationResult<any>;
        getValidator: () => (data: unknown) => any;
    };
    performance: {
        getMetrics: () => Record<string, {
            avgTime: number;
            totalCalls: number;
        }>;
        reset: () => void;
        benchmark: <T>(schema: {
            parse: (data: unknown) => T;
        }, testData: unknown[], iterations?: number) => Promise<{
            averageTime: number;
            throughput: number;
            totalTime: number;
        }>;
    };
    extreme: {
        string: () => import("./extreme").ExtremeStringSchema;
        number: () => import("./extreme").ExtremeNumberSchema;
        boolean: () => import("./extreme").ExtremeBooleanSchema;
        array: <T>(schema: {
            getValidator(): (data: unknown) => T;
        }) => import("./extreme").ExtremeArraySchema<T>;
        object: <T extends Record<string, any>>(shape: { [K in keyof T]: {
            getValidator(): (data: unknown) => T[K];
        }; }) => import("./extreme").ExtremeObjectSchema<T>;
        batch: <T>(schema: {
            getValidator(): (data: unknown) => T;
        }) => import("./extreme").ExtremeBatchValidator<T>;
        clearCache: () => void;
        getCacheSize: () => number;
    };
    optimize: {
        precompile: <T>(schema: {
            getValidator(): (data: unknown) => T;
        }) => {
            parse: (data: unknown) => T;
            getValidator: () => (data: unknown) => any;
        };
        bulkValidate: <T>(schema: {
            getValidator(): (data: unknown) => T;
        }, items: unknown[], options?: {
            chunkSize?: number;
            parallel?: boolean;
            errorStrategy?: "fail-fast" | "collect-all";
        }) => Promise<{
            results: T[];
            errors: Array<{
                index: number;
                error: string;
            }>;
            stats: {
                totalTime: number;
                throughput: number;
            };
        }>;
    };
};
export type UltraInfer<T extends {
    getValidator(): (data: unknown) => any;
}> = T extends {
    getValidator(): (data: unknown) => infer U;
} ? U : never;
export { UltraStringSchema, UltraNumberSchema, UltraBooleanSchema, UltraArraySchema, UltraObjectSchema, UltraBatchValidator, type UltraValidationResult };
export default ultra;
