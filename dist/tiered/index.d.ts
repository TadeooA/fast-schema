/**
 * Performance Tiers:
 *
 * 🐌 NORMAL (1x) - Zod-compatible, easy to use, good for prototyping
 * ⚡ FAST (10x) - Optimized but still familiar API, good for production
 * 🚀 ULTRA (100x) - Maximum performance, minimal overhead, good for high-throughput
 */
declare const normal: {
    string: () => import("..").StringSchema;
    number: () => import("..").NumberSchema;
    boolean: () => import("..").BooleanSchema;
    array: <T>(schema: any) => import("..").ArraySchema<unknown>;
    object: <T extends Record<string, any>>(shape: any) => import("..").ObjectSchema<Record<string, any>>;
    literal: <T extends string | number | boolean>(value: T) => import("../api").LiteralSchema<T>;
    any: () => import("..").AnySchema;
    union: (schemas: any[]) => any;
    async: <T>(validator: (data: unknown) => Promise<T>) => import("..").AsyncSchema<T>;
    tier: "normal";
    description: string;
    expectedSpeedup: string;
    useCases: string[];
    overhead: string;
};
declare const fast_tier: {
    string: () => any;
    number: () => any;
    boolean: () => any;
    array: <T>(schema: any) => any;
    object: <T extends Record<string, any>>(shape: any) => any;
    batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
    jit: <T>(schema: any) => import("..").JITSchema<unknown>;
    smart: <T>(schema: any) => any;
    literal: <T extends string | number | boolean>(value: T) => any;
    any: () => any;
    tier: "fast";
    description: string;
    expectedSpeedup: string;
    useCases: string[];
    overhead: string;
};
declare const ultra_tier: {
    string: () => import("../ultra/extreme").ExtremeStringSchema;
    number: () => import("../ultra/extreme").ExtremeNumberSchema;
    boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
    array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
    object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
    batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
    precompile: <T>(schema: any) => {
        parse: (data: unknown) => unknown;
        getValidator: () => (data: unknown) => any;
    };
    bulk: <T>(schema: any, data: unknown[]) => Promise<{
        results: unknown[];
        errors: Array<{
            index: number;
            error: string;
        }>;
        stats: {
            totalTime: number;
            throughput: number;
        };
    }>;
    stream: <T>(schema: any, options?: {
        chunkSize?: number;
    }) => {
        validate: (items: unknown[]) => Promise<{
            results: unknown[];
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
    tier: "ultra";
    description: string;
    expectedSpeedup: string;
    useCases: string[];
    overhead: string;
};
export declare const recommendations: {
    development: {
        string: () => import("..").StringSchema;
        number: () => import("..").NumberSchema;
        boolean: () => import("..").BooleanSchema;
        array: <T>(schema: any) => import("..").ArraySchema<unknown>;
        object: <T extends Record<string, any>>(shape: any) => import("..").ObjectSchema<Record<string, any>>;
        literal: <T extends string | number | boolean>(value: T) => import("../api").LiteralSchema<T>;
        any: () => import("..").AnySchema;
        union: (schemas: any[]) => any;
        async: <T>(validator: (data: unknown) => Promise<T>) => import("..").AsyncSchema<T>;
        tier: "normal";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    production: {
        string: () => any;
        number: () => any;
        boolean: () => any;
        array: <T>(schema: any) => any;
        object: <T extends Record<string, any>>(shape: any) => any;
        batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
        jit: <T>(schema: any) => import("..").JITSchema<unknown>;
        smart: <T>(schema: any) => any;
        literal: <T extends string | number | boolean>(value: T) => any;
        any: () => any;
        tier: "fast";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    highPerformance: {
        string: () => import("../ultra/extreme").ExtremeStringSchema;
        number: () => import("../ultra/extreme").ExtremeNumberSchema;
        boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
        array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
        object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
        batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
        precompile: <T>(schema: any) => {
            parse: (data: unknown) => unknown;
            getValidator: () => (data: unknown) => any;
        };
        bulk: <T>(schema: any, data: unknown[]) => Promise<{
            results: unknown[];
            errors: Array<{
                index: number;
                error: string;
            }>;
            stats: {
                totalTime: number;
                throughput: number;
            };
        }>;
        stream: <T>(schema: any, options?: {
            chunkSize?: number;
        }) => {
            validate: (items: unknown[]) => Promise<{
                results: unknown[];
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
        tier: "ultra";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    api: {
        string: () => any;
        number: () => any;
        boolean: () => any;
        array: <T>(schema: any) => any;
        object: <T extends Record<string, any>>(shape: any) => any;
        batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
        jit: <T>(schema: any) => import("..").JITSchema<unknown>;
        smart: <T>(schema: any) => any;
        literal: <T extends string | number | boolean>(value: T) => any;
        any: () => any;
        tier: "fast";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    realTime: {
        string: () => import("../ultra/extreme").ExtremeStringSchema;
        number: () => import("../ultra/extreme").ExtremeNumberSchema;
        boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
        array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
        object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
        batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
        precompile: <T>(schema: any) => {
            parse: (data: unknown) => unknown;
            getValidator: () => (data: unknown) => any;
        };
        bulk: <T>(schema: any, data: unknown[]) => Promise<{
            results: unknown[];
            errors: Array<{
                index: number;
                error: string;
            }>;
            stats: {
                totalTime: number;
                throughput: number;
            };
        }>;
        stream: <T>(schema: any, options?: {
            chunkSize?: number;
        }) => {
            validate: (items: unknown[]) => Promise<{
                results: unknown[];
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
        tier: "ultra";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    batchProcessing: {
        string: () => import("../ultra/extreme").ExtremeStringSchema;
        number: () => import("../ultra/extreme").ExtremeNumberSchema;
        boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
        array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
        object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
        batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
        precompile: <T>(schema: any) => {
            parse: (data: unknown) => unknown;
            getValidator: () => (data: unknown) => any;
        };
        bulk: <T>(schema: any, data: unknown[]) => Promise<{
            results: unknown[];
            errors: Array<{
                index: number;
                error: string;
            }>;
            stats: {
                totalTime: number;
                throughput: number;
            };
        }>;
        stream: <T>(schema: any, options?: {
            chunkSize?: number;
        }) => {
            validate: (items: unknown[]) => Promise<{
                results: unknown[];
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
        tier: "ultra";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    microservices: {
        string: () => any;
        number: () => any;
        boolean: () => any;
        array: <T>(schema: any) => any;
        object: <T extends Record<string, any>>(shape: any) => any;
        batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
        jit: <T>(schema: any) => import("..").JITSchema<unknown>;
        smart: <T>(schema: any) => any;
        literal: <T extends string | number | boolean>(value: T) => any;
        any: () => any;
        tier: "fast";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    serverless: {
        string: () => any;
        number: () => any;
        boolean: () => any;
        array: <T>(schema: any) => any;
        object: <T extends Record<string, any>>(shape: any) => any;
        batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
        jit: <T>(schema: any) => import("..").JITSchema<unknown>;
        smart: <T>(schema: any) => any;
        literal: <T extends string | number | boolean>(value: T) => any;
        any: () => any;
        tier: "fast";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    mobile: {
        string: () => any;
        number: () => any;
        boolean: () => any;
        array: <T>(schema: any) => any;
        object: <T extends Record<string, any>>(shape: any) => any;
        batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
        jit: <T>(schema: any) => import("..").JITSchema<unknown>;
        smart: <T>(schema: any) => any;
        literal: <T extends string | number | boolean>(value: T) => any;
        any: () => any;
        tier: "fast";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    smallData: {
        string: () => import("..").StringSchema;
        number: () => import("..").NumberSchema;
        boolean: () => import("..").BooleanSchema;
        array: <T>(schema: any) => import("..").ArraySchema<unknown>;
        object: <T extends Record<string, any>>(shape: any) => import("..").ObjectSchema<Record<string, any>>;
        literal: <T extends string | number | boolean>(value: T) => import("../api").LiteralSchema<T>;
        any: () => import("..").AnySchema;
        union: (schemas: any[]) => any;
        async: <T>(validator: (data: unknown) => Promise<T>) => import("..").AsyncSchema<T>;
        tier: "normal";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    mediumData: {
        string: () => any;
        number: () => any;
        boolean: () => any;
        array: <T>(schema: any) => any;
        object: <T extends Record<string, any>>(shape: any) => any;
        batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
        jit: <T>(schema: any) => import("..").JITSchema<unknown>;
        smart: <T>(schema: any) => any;
        literal: <T extends string | number | boolean>(value: T) => any;
        any: () => any;
        tier: "fast";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    bigData: {
        string: () => import("../ultra/extreme").ExtremeStringSchema;
        number: () => import("../ultra/extreme").ExtremeNumberSchema;
        boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
        array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
        object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
        batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
        precompile: <T>(schema: any) => {
            parse: (data: unknown) => unknown;
            getValidator: () => (data: unknown) => any;
        };
        bulk: <T>(schema: any, data: unknown[]) => Promise<{
            results: unknown[];
            errors: Array<{
                index: number;
                error: string;
            }>;
            stats: {
                totalTime: number;
                throughput: number;
            };
        }>;
        stream: <T>(schema: any, options?: {
            chunkSize?: number;
        }) => {
            validate: (items: unknown[]) => Promise<{
                results: unknown[];
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
        tier: "ultra";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
};
export declare class PerformanceTierSelector {
    static selectTier(requirements: {
        validationsPerSecond?: number;
        dataSize?: 'small' | 'medium' | 'large';
        environment?: 'development' | 'production' | 'high-performance';
        priority?: 'ease-of-use' | 'balanced' | 'maximum-performance';
    }): {
        string: () => import("..").StringSchema;
        number: () => import("..").NumberSchema;
        boolean: () => import("..").BooleanSchema;
        array: <T>(schema: any) => import("..").ArraySchema<unknown>;
        object: <T extends Record<string, any>>(shape: any) => import("..").ObjectSchema<Record<string, any>>;
        literal: <T extends string | number | boolean>(value: T) => import("../api").LiteralSchema<T>;
        any: () => import("..").AnySchema;
        union: (schemas: any[]) => any;
        async: <T>(validator: (data: unknown) => Promise<T>) => import("..").AsyncSchema<T>;
        tier: "normal";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    } | {
        string: () => any;
        number: () => any;
        boolean: () => any;
        array: <T>(schema: any) => any;
        object: <T extends Record<string, any>>(shape: any) => any;
        batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
        jit: <T>(schema: any) => import("..").JITSchema<unknown>;
        smart: <T>(schema: any) => any;
        literal: <T extends string | number | boolean>(value: T) => any;
        any: () => any;
        tier: "fast";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    } | {
        string: () => import("../ultra/extreme").ExtremeStringSchema;
        number: () => import("../ultra/extreme").ExtremeNumberSchema;
        boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
        array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
        object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
        batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
        precompile: <T>(schema: any) => {
            parse: (data: unknown) => unknown;
            getValidator: () => (data: unknown) => any;
        };
        bulk: <T>(schema: any, data: unknown[]) => Promise<{
            results: unknown[];
            errors: Array<{
                index: number;
                error: string;
            }>;
            stats: {
                totalTime: number;
                throughput: number;
            };
        }>;
        stream: <T>(schema: any, options?: {
            chunkSize?: number;
        }) => {
            validate: (items: unknown[]) => Promise<{
                results: unknown[];
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
        tier: "ultra";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    static getRecommendation(requirements: Parameters<typeof PerformanceTierSelector.selectTier>[0]): {
        tier: {
            string: () => import("..").StringSchema;
            number: () => import("..").NumberSchema;
            boolean: () => import("..").BooleanSchema;
            array: <T>(schema: any) => import("..").ArraySchema<unknown>;
            object: <T extends Record<string, any>>(shape: any) => import("..").ObjectSchema<Record<string, any>>;
            literal: <T extends string | number | boolean>(value: T) => import("../api").LiteralSchema<T>;
            any: () => import("..").AnySchema;
            union: (schemas: any[]) => any;
            async: <T>(validator: (data: unknown) => Promise<T>) => import("..").AsyncSchema<T>;
            tier: "normal";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        } | {
            string: () => any;
            number: () => any;
            boolean: () => any;
            array: <T>(schema: any) => any;
            object: <T extends Record<string, any>>(shape: any) => any;
            batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
            jit: <T>(schema: any) => import("..").JITSchema<unknown>;
            smart: <T>(schema: any) => any;
            literal: <T extends string | number | boolean>(value: T) => any;
            any: () => any;
            tier: "fast";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        } | {
            string: () => import("../ultra/extreme").ExtremeStringSchema;
            number: () => import("../ultra/extreme").ExtremeNumberSchema;
            boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
            array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
            object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
            batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
            precompile: <T>(schema: any) => {
                parse: (data: unknown) => unknown;
                getValidator: () => (data: unknown) => any;
            };
            bulk: <T>(schema: any, data: unknown[]) => Promise<{
                results: unknown[];
                errors: Array<{
                    index: number;
                    error: string;
                }>;
                stats: {
                    totalTime: number;
                    throughput: number;
                };
            }>;
            stream: <T>(schema: any, options?: {
                chunkSize?: number;
            }) => {
                validate: (items: unknown[]) => Promise<{
                    results: unknown[];
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
            tier: "ultra";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        reasoning: string;
        alternatives: any[];
        migration: string[];
    };
    private static explainSelection;
    private static getAlternatives;
    private static getMigrationTips;
}
export declare const selectTier: typeof PerformanceTierSelector.selectTier;
export declare const getRecommendation: typeof PerformanceTierSelector.getRecommendation;
export { normal, fast_tier, ultra_tier as ultra };
declare const _default: {
    normal: {
        string: () => import("..").StringSchema;
        number: () => import("..").NumberSchema;
        boolean: () => import("..").BooleanSchema;
        array: <T>(schema: any) => import("..").ArraySchema<unknown>;
        object: <T extends Record<string, any>>(shape: any) => import("..").ObjectSchema<Record<string, any>>;
        literal: <T extends string | number | boolean>(value: T) => import("../api").LiteralSchema<T>;
        any: () => import("..").AnySchema;
        union: (schemas: any[]) => any;
        async: <T>(validator: (data: unknown) => Promise<T>) => import("..").AsyncSchema<T>;
        tier: "normal";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    fast: {
        string: () => any;
        number: () => any;
        boolean: () => any;
        array: <T>(schema: any) => any;
        object: <T extends Record<string, any>>(shape: any) => any;
        batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
        jit: <T>(schema: any) => import("..").JITSchema<unknown>;
        smart: <T>(schema: any) => any;
        literal: <T extends string | number | boolean>(value: T) => any;
        any: () => any;
        tier: "fast";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    ultra: {
        string: () => import("../ultra/extreme").ExtremeStringSchema;
        number: () => import("../ultra/extreme").ExtremeNumberSchema;
        boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
        array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
        object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
        batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
        precompile: <T>(schema: any) => {
            parse: (data: unknown) => unknown;
            getValidator: () => (data: unknown) => any;
        };
        bulk: <T>(schema: any, data: unknown[]) => Promise<{
            results: unknown[];
            errors: Array<{
                index: number;
                error: string;
            }>;
            stats: {
                totalTime: number;
                throughput: number;
            };
        }>;
        stream: <T>(schema: any, options?: {
            chunkSize?: number;
        }) => {
            validate: (items: unknown[]) => Promise<{
                results: unknown[];
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
        tier: "ultra";
        description: string;
        expectedSpeedup: string;
        useCases: string[];
        overhead: string;
    };
    select: typeof PerformanceTierSelector.selectTier;
    recommend: typeof PerformanceTierSelector.getRecommendation;
    for: {
        development: {
            string: () => import("..").StringSchema;
            number: () => import("..").NumberSchema;
            boolean: () => import("..").BooleanSchema;
            array: <T>(schema: any) => import("..").ArraySchema<unknown>;
            object: <T extends Record<string, any>>(shape: any) => import("..").ObjectSchema<Record<string, any>>;
            literal: <T extends string | number | boolean>(value: T) => import("../api").LiteralSchema<T>;
            any: () => import("..").AnySchema;
            union: (schemas: any[]) => any;
            async: <T>(validator: (data: unknown) => Promise<T>) => import("..").AsyncSchema<T>;
            tier: "normal";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        production: {
            string: () => any;
            number: () => any;
            boolean: () => any;
            array: <T>(schema: any) => any;
            object: <T extends Record<string, any>>(shape: any) => any;
            batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
            jit: <T>(schema: any) => import("..").JITSchema<unknown>;
            smart: <T>(schema: any) => any;
            literal: <T extends string | number | boolean>(value: T) => any;
            any: () => any;
            tier: "fast";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        highPerformance: {
            string: () => import("../ultra/extreme").ExtremeStringSchema;
            number: () => import("../ultra/extreme").ExtremeNumberSchema;
            boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
            array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
            object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
            batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
            precompile: <T>(schema: any) => {
                parse: (data: unknown) => unknown;
                getValidator: () => (data: unknown) => any;
            };
            bulk: <T>(schema: any, data: unknown[]) => Promise<{
                results: unknown[];
                errors: Array<{
                    index: number;
                    error: string;
                }>;
                stats: {
                    totalTime: number;
                    throughput: number;
                };
            }>;
            stream: <T>(schema: any, options?: {
                chunkSize?: number;
            }) => {
                validate: (items: unknown[]) => Promise<{
                    results: unknown[];
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
            tier: "ultra";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        api: {
            string: () => any;
            number: () => any;
            boolean: () => any;
            array: <T>(schema: any) => any;
            object: <T extends Record<string, any>>(shape: any) => any;
            batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
            jit: <T>(schema: any) => import("..").JITSchema<unknown>;
            smart: <T>(schema: any) => any;
            literal: <T extends string | number | boolean>(value: T) => any;
            any: () => any;
            tier: "fast";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        realTime: {
            string: () => import("../ultra/extreme").ExtremeStringSchema;
            number: () => import("../ultra/extreme").ExtremeNumberSchema;
            boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
            array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
            object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
            batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
            precompile: <T>(schema: any) => {
                parse: (data: unknown) => unknown;
                getValidator: () => (data: unknown) => any;
            };
            bulk: <T>(schema: any, data: unknown[]) => Promise<{
                results: unknown[];
                errors: Array<{
                    index: number;
                    error: string;
                }>;
                stats: {
                    totalTime: number;
                    throughput: number;
                };
            }>;
            stream: <T>(schema: any, options?: {
                chunkSize?: number;
            }) => {
                validate: (items: unknown[]) => Promise<{
                    results: unknown[];
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
            tier: "ultra";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        batchProcessing: {
            string: () => import("../ultra/extreme").ExtremeStringSchema;
            number: () => import("../ultra/extreme").ExtremeNumberSchema;
            boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
            array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
            object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
            batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
            precompile: <T>(schema: any) => {
                parse: (data: unknown) => unknown;
                getValidator: () => (data: unknown) => any;
            };
            bulk: <T>(schema: any, data: unknown[]) => Promise<{
                results: unknown[];
                errors: Array<{
                    index: number;
                    error: string;
                }>;
                stats: {
                    totalTime: number;
                    throughput: number;
                };
            }>;
            stream: <T>(schema: any, options?: {
                chunkSize?: number;
            }) => {
                validate: (items: unknown[]) => Promise<{
                    results: unknown[];
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
            tier: "ultra";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        microservices: {
            string: () => any;
            number: () => any;
            boolean: () => any;
            array: <T>(schema: any) => any;
            object: <T extends Record<string, any>>(shape: any) => any;
            batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
            jit: <T>(schema: any) => import("..").JITSchema<unknown>;
            smart: <T>(schema: any) => any;
            literal: <T extends string | number | boolean>(value: T) => any;
            any: () => any;
            tier: "fast";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        serverless: {
            string: () => any;
            number: () => any;
            boolean: () => any;
            array: <T>(schema: any) => any;
            object: <T extends Record<string, any>>(shape: any) => any;
            batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
            jit: <T>(schema: any) => import("..").JITSchema<unknown>;
            smart: <T>(schema: any) => any;
            literal: <T extends string | number | boolean>(value: T) => any;
            any: () => any;
            tier: "fast";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        mobile: {
            string: () => any;
            number: () => any;
            boolean: () => any;
            array: <T>(schema: any) => any;
            object: <T extends Record<string, any>>(shape: any) => any;
            batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
            jit: <T>(schema: any) => import("..").JITSchema<unknown>;
            smart: <T>(schema: any) => any;
            literal: <T extends string | number | boolean>(value: T) => any;
            any: () => any;
            tier: "fast";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        smallData: {
            string: () => import("..").StringSchema;
            number: () => import("..").NumberSchema;
            boolean: () => import("..").BooleanSchema;
            array: <T>(schema: any) => import("..").ArraySchema<unknown>;
            object: <T extends Record<string, any>>(shape: any) => import("..").ObjectSchema<Record<string, any>>;
            literal: <T extends string | number | boolean>(value: T) => import("../api").LiteralSchema<T>;
            any: () => import("..").AnySchema;
            union: (schemas: any[]) => any;
            async: <T>(validator: (data: unknown) => Promise<T>) => import("..").AsyncSchema<T>;
            tier: "normal";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        mediumData: {
            string: () => any;
            number: () => any;
            boolean: () => any;
            array: <T>(schema: any) => any;
            object: <T extends Record<string, any>>(shape: any) => any;
            batch: <T>(schema: any) => import("..").BatchValidator<unknown>;
            jit: <T>(schema: any) => import("..").JITSchema<unknown>;
            smart: <T>(schema: any) => any;
            literal: <T extends string | number | boolean>(value: T) => any;
            any: () => any;
            tier: "fast";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
        bigData: {
            string: () => import("../ultra/extreme").ExtremeStringSchema;
            number: () => import("../ultra/extreme").ExtremeNumberSchema;
            boolean: () => import("../ultra/extreme").ExtremeBooleanSchema;
            array: <T>(schema: any) => import("../ultra/extreme").ExtremeArraySchema<unknown>;
            object: <T extends Record<string, any>>(shape: any) => import("../ultra/extreme").ExtremeObjectSchema<Record<string, any>>;
            batch: <T>(schema: any) => import("../ultra/extreme").ExtremeBatchValidator<unknown>;
            precompile: <T>(schema: any) => {
                parse: (data: unknown) => unknown;
                getValidator: () => (data: unknown) => any;
            };
            bulk: <T>(schema: any, data: unknown[]) => Promise<{
                results: unknown[];
                errors: Array<{
                    index: number;
                    error: string;
                }>;
                stats: {
                    totalTime: number;
                    throughput: number;
                };
            }>;
            stream: <T>(schema: any, options?: {
                chunkSize?: number;
            }) => {
                validate: (items: unknown[]) => Promise<{
                    results: unknown[];
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
            tier: "ultra";
            description: string;
            expectedSpeedup: string;
            useCases: string[];
            overhead: string;
        };
    };
};
export default _default;
