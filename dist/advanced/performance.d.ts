import { Schema } from '../base/schema';
import { ValidationError } from '../base/types';
export declare class RegexCache {
    private static cache;
    static get(pattern: string, flags?: string): RegExp;
    static clear(): void;
    static size(): number;
}
export declare class SchemaCache {
    private static cache;
    static get(key: string): any;
    static set(key: string, value: any): void;
    static has(key: string): boolean;
    static clear(): void;
    static size(): number;
}
export declare class ValidationPool {
    private static errorPool;
    private static issuePool;
    static getError(): ValidationError;
    static releaseError(error: ValidationError): void;
    static getIssue(): any;
    static releaseIssue(issue: any): void;
    static clear(): void;
}
export declare class JITSchema<T> extends Schema<T> {
    private baseSchema;
    private compiledValidator?;
    private compilationKey;
    constructor(baseSchema: Schema<T>);
    private generateCompilationKey;
    private compileValidator;
    _validate(data: unknown): T;
    getStats(): {
        cached: boolean;
        compilationKey: string;
        cacheSize: number;
    };
}
export declare class BatchValidator<T> {
    private schema;
    private pooledErrors;
    constructor(schema: Schema<T>);
    validate(items: unknown[]): Array<{
        success: true;
        data: T;
    } | {
        success: false;
        error: ValidationError;
    }>;
    validateParallel(items: unknown[], chunkSize?: number): Promise<Array<{
        success: true;
        data: T;
    } | {
        success: false;
        error: ValidationError;
    }>>;
    getStats(): {
        schemaType: string;
        pooledErrors: number;
        regexCacheSize: number;
        schemaCacheSize: number;
    };
}
export declare class StreamingValidator<T> {
    private schema;
    private buffer;
    private onResult?;
    constructor(schema: Schema<T>, onResult?: (result: any, index: number) => void);
    push(item: unknown): void;
    flush(): Array<{
        success: true;
        data: T;
    } | {
        success: false;
        error: ValidationError;
    }>;
}
