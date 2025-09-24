export type infer<T extends Schema<any>> = T['_output'];
export type HtmlElementType = 'input' | 'textarea' | 'select' | 'option' | 'button' | 'checkbox' | 'radio' | 'range' | 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'ul' | 'ol' | 'li' | 'table' | 'thead' | 'tbody' | 'tr' | 'td' | 'th' | 'form' | 'label' | 'fieldset' | 'legend' | 'img' | 'video' | 'audio' | 'canvas' | 'svg' | 'header' | 'footer' | 'nav' | 'main' | 'article' | 'section' | 'aside' | 'strong' | 'em' | 'mark' | 'small' | 'del' | 'ins' | 'sub' | 'sup' | 'a' | 'link' | string;
export type AccessibilityLevel = 'basic' | 'enhanced' | 'strict';
export interface HtmlProps {
    id?: string;
    className?: string;
    style?: Record<string, string>;
    dataAttributes?: Record<string, string>;
    ariaAttributes?: Record<string, string>;
    requiredProps?: string[];
    optionalProps?: string[];
    validateAccessibility?: boolean;
    validateSemantic?: boolean;
    accessibilityLevel?: AccessibilityLevel;
}
export interface ReactComponentSchema {
    componentName: string;
    propsSchema: Record<string, Schema<any>>;
    requiredProps?: string[];
    childrenAllowed?: boolean;
    childrenSchema?: Schema<any>;
    validateLifecycle?: boolean;
    validateHooks?: boolean;
}
export interface ReactElement {
    type: string;
    props?: Record<string, any>;
    children?: ReactElement | ReactElement[] | string | null;
}
export interface ValidationEventData {
    schemaType: string;
    data: unknown;
    timestamp: number;
    id?: string;
    context?: Record<string, any>;
}
export interface ValidationStartEvent extends ValidationEventData {
    type: 'validation:start';
    async: boolean;
}
export interface ValidationSuccessEvent extends ValidationEventData {
    type: 'validation:success';
    result: unknown;
    duration: number;
    async: boolean;
}
export interface ValidationErrorEvent extends ValidationEventData {
    type: 'validation:error';
    error: ValidationError;
    duration: number;
    async: boolean;
}
export interface ValidationCacheEvent extends ValidationEventData {
    type: 'validation:cache';
    cacheHit: boolean;
    cacheKey: string;
}
export interface AsyncValidationStartEvent extends ValidationEventData {
    type: 'async:start';
    refinementId: string;
    debounced: boolean;
}
export interface AsyncValidationCompleteEvent extends ValidationEventData {
    type: 'async:complete';
    refinementId: string;
    success: boolean;
    duration: number;
    cancelled: boolean;
}
export interface BatchValidationStartEvent extends ValidationEventData {
    type: 'batch:start';
    itemCount: number;
    maxConcurrency: number;
    batchId: string;
}
export interface BatchValidationCompleteEvent extends ValidationEventData {
    type: 'batch:complete';
    batchId: string;
    successful: number;
    failed: number;
    duration: number;
    avgItemDuration: number;
}
export interface BatchItemValidationEvent extends ValidationEventData {
    type: 'batch:item';
    batchId: string;
    itemIndex: number;
    itemId?: string | number;
    success: boolean;
    duration: number;
}
export interface PerformanceEvent extends ValidationEventData {
    type: 'performance';
    metric: string;
    value: number;
    unit: string;
}
export interface DebugEvent extends ValidationEventData {
    type: 'debug';
    level: 'info' | 'warn' | 'error';
    message: string;
    details?: any;
}
export type ValidationEvent = ValidationStartEvent | ValidationSuccessEvent | ValidationErrorEvent | ValidationCacheEvent | AsyncValidationStartEvent | AsyncValidationCompleteEvent | BatchValidationStartEvent | BatchValidationCompleteEvent | BatchItemValidationEvent | PerformanceEvent | DebugEvent;
export type ValidationEventType = ValidationEvent['type'];
export type ValidationEventListener<T extends ValidationEvent = ValidationEvent> = (event: T) => void;
export type DeepPartialSchema<T extends Schema<any>> = T extends ObjectSchema<infer U> ? ObjectSchema<{
    [K in keyof U]: OptionalSchema<DeepPartialSchema<U[K]>>;
}> : T extends ArraySchema<infer U> ? ArraySchema<DeepPartialSchema<U>> : OptionalSchema<T>;
export declare class ValidationEventEmitter {
    private listeners;
    private enabled;
    on<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, {
        type: T;
    }>>): this;
    on(eventType: '*', listener: ValidationEventListener): this;
    off<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, {
        type: T;
    }>>): this;
    off(eventType: '*', listener: ValidationEventListener): this;
    once<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, {
        type: T;
    }>>): this;
    once(eventType: '*', listener: ValidationEventListener): this;
    emit(event: ValidationEvent): void;
    removeAllListeners(eventType?: ValidationEventType | '*'): this;
    listenerCount(eventType: ValidationEventType | '*'): number;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    getEventTypes(): Array<ValidationEventType | '*'>;
}
export declare class ValidationError extends Error {
    issues: ValidationIssue[];
    constructor(issues: ValidationIssue[]);
    format(): any;
    flatten(): {
        fieldErrors: Record<string, string[]>;
        formErrors: string[];
    };
}
export interface ValidationIssue {
    code: string;
    path: (string | number)[];
    message: string;
    received?: string;
    expected?: string;
}
export interface AsyncValidationOptions {
    signal?: AbortSignal;
    timeout?: number;
    debounce?: number;
    cache?: boolean;
    retries?: number;
}
export type AsyncRefinementFunction<T> = (value: T, ctx?: {
    signal?: AbortSignal;
}) => Promise<boolean>;
export interface AsyncRefinementConfig {
    message?: string;
    debounce?: number;
    cache?: boolean | AsyncCacheConfig;
    timeout?: number;
    retries?: number;
    cancelPrevious?: boolean;
}
export interface AsyncCacheConfig {
    maxSize?: number;
    ttl?: number;
    strategy?: 'lru' | 'fifo';
}
export declare abstract class Schema<Output = any, Input = Output> {
    readonly _type: Output;
    readonly _output: Output;
    readonly _input: Input;
    protected schemaType: any;
    protected eventEmitter: ValidationEventEmitter;
    protected instanceId: string;
    protected compiledValidator?: (data: unknown) => Output;
    protected validationCount: number;
    protected performanceStats: {
        totalTime: number;
        avgTime: number;
        minTime: number;
        maxTime: number;
        cacheHits: number;
    };
    constructor(schemaType: any);
    parse(data: unknown): Output;
    safeParse(data: unknown): {
        success: true;
        data: Output;
    } | {
        success: false;
        error: ValidationError;
    };
    parseAsync(data: unknown, options?: AsyncValidationOptions): Promise<Output>;
    safeParseAsync(data: unknown, options?: AsyncValidationOptions): Promise<{
        success: true;
        data: Output;
    } | {
        success: false;
        error: ValidationError;
    }>;
    optional(): OptionalSchema<this>;
    nullable(): NullableSchema<this>;
    nullish(): NullishSchema<this>;
    array(): ArraySchema<this>;
    or<U extends Schema<any>>(schema: U): UnionSchema<[this, U]>;
    and<U extends Schema<any>>(schema: U): IntersectionSchema<this, U>;
    refine(predicate: (data: any) => boolean, message?: string): RefinementSchema<this>;
    superRefine(predicate: (data: any) => boolean, message?: string): RefinementSchema<this>;
    refineAsync(predicate: AsyncRefinementFunction<Output>, config?: string | AsyncRefinementConfig): AsyncRefinementSchema<this>;
    superRefineAsync(predicate: AsyncRefinementFunction<Output>, config?: string | AsyncRefinementConfig): AsyncRefinementSchema<this>;
    transform<U>(transformer: (data: any) => U): TransformSchema<this, U>;
    custom(validator: (data: any) => boolean | string, message?: string): RefinementSchema<this>;
    protected abstract _validate(data: unknown): Output;
    protected _validateAsync(data: unknown, options?: AsyncValidationOptions): Promise<Output>;
    on<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, {
        type: T;
    }>>): this;
    on(eventType: '*', listener: ValidationEventListener): this;
    off<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, {
        type: T;
    }>>): this;
    off(eventType: '*', listener: ValidationEventListener): this;
    once<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, {
        type: T;
    }>>): this;
    once(eventType: '*', listener: ValidationEventListener): this;
    removeAllListeners(eventType?: ValidationEventType | '*'): this;
    protected emitEvent(event: ValidationEvent): void;
    protected emitPerformance(metric: string, value: number, unit: string, context?: Record<string, any>): void;
    protected emitDebug(level: 'info' | 'warn' | 'error', message: string, details?: any, context?: Record<string, any>): void;
    getInstanceId(): string;
    getEventEmitter(): ValidationEventEmitter;
    private updatePerformanceStats;
    private compileValidator;
    private generateValidationCode;
    private generateStringValidationCode;
    private generateNumberValidationCode;
    getPerformanceStats(): {
        validationCount: number;
        totalTime: number;
        avgTime: number;
        minTime: number;
        maxTime: number;
        cacheHits: number;
        isCompiled: boolean;
    };
    resetPerformanceStats(): void;
    compile(): this;
    getSchema(): any;
}
export declare class StringSchema extends Schema<string> {
    constructor();
    protected _validate(data: unknown): string;
    min(length: number): StringSchema;
    max(length: number): StringSchema;
    length(exactLength: number): StringSchema;
    email(): StringSchema;
    url(): StringSchema;
    uuid(): StringSchema;
    datetime(): StringSchema;
    ip(): StringSchema;
    ipv4(): StringSchema;
    ipv6(): StringSchema;
    phone(): StringSchema;
    hex(): StringSchema;
    creditCard(): StringSchema;
    macAddress(): StringSchema;
    color(): StringSchema;
    slug(): StringSchema;
    date(): StringSchema;
    time(): StringSchema;
    duration(): StringSchema;
    nanoid(): StringSchema;
    cuid(): StringSchema;
    cssColor(): StringSchema;
    cssSelector(): StringSchema;
    htmlId(): StringSchema;
    className(): StringSchema;
    phoneNumber(): StringSchema;
    postalCode(): StringSchema;
    latitude(): StringSchema;
    longitude(): StringSchema;
    country(): StringSchema;
    language(): StringSchema;
    timezone(): StringSchema;
    mimeType(): StringSchema;
    regex(pattern: RegExp, message?: string): StringSchema;
    startsWith(prefix: string): StringSchema;
    endsWith(suffix: string): StringSchema;
    includes(substring: string): StringSchema;
}
export declare class NumberSchema extends Schema<number> {
    constructor();
    protected _validate(data: unknown): number;
    min(value: number): NumberSchema;
    max(value: number): NumberSchema;
    int(): NumberSchema;
    positive(): NumberSchema;
    negative(): NumberSchema;
    nonnegative(): NumberSchema;
    nonpositive(): NumberSchema;
}
export declare class BooleanSchema extends Schema<boolean> {
    constructor();
    protected _validate(data: unknown): boolean;
}
export declare class ArraySchema<T extends Schema<any>> extends Schema<T['_output'][]> {
    private itemSchema;
    constructor(itemSchema: T);
    protected _validate(data: unknown): T['_output'][];
    min(items: number): ArraySchema<T>;
    max(items: number): ArraySchema<T>;
    length(exactLength: number): ArraySchema<T>;
    nonempty(): ArraySchema<T>;
}
export declare class ObjectSchema<T extends Record<string, Schema<any>>> extends Schema<{
    [K in keyof T]: T[K]['_output'];
}> {
    private shape;
    constructor(shape: T);
    protected _validate(data: unknown): {
        [K in keyof T]: T[K]['_output'];
    };
    strict(): ObjectSchema<T>;
    passthrough(): ObjectSchema<T>;
    partial(): ObjectSchema<{
        [K in keyof T]: OptionalSchema<T[K]>;
    }>;
    extend<U extends Record<string, Schema<any>>>(extension: U): ObjectSchema<T & U>;
    pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>>;
    omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>>;
    merge<U extends Record<string, Schema<any>>>(other: ObjectSchema<U>): ObjectSchema<T & U>;
    deepPartial(): ObjectSchema<{
        [K in keyof T]: DeepPartialSchema<T[K]>;
    }>;
    keyof(): Schema<keyof T>;
    required(): ObjectSchema<{
        [K in keyof T]: T[K] extends OptionalSchema<infer U> ? U : T[K];
    }>;
    setOptional<K extends keyof T>(keys: K[]): ObjectSchema<{
        [P in keyof T]: P extends K ? OptionalSchema<T[P]> : T[P];
    }>;
    setRequired<K extends keyof T>(keys: K[]): ObjectSchema<{
        [P in keyof T]: P extends K ? (T[P] extends OptionalSchema<infer U> ? U : T[P]) : T[P];
    }>;
    getShape(): T;
}
export declare class UnionSchema<T extends [Schema<any>, Schema<any>, ...Schema<any>[]]> extends Schema<T[number]['_output']> {
    private options;
    constructor(options: T);
    protected _validate(data: unknown): T[number]['_output'];
}
export declare class IntersectionSchema<A extends Schema<any>, B extends Schema<any>> extends Schema<A['_output'] & B['_output']> {
    private left;
    private right;
    constructor(left: A, right: B);
    protected _validate(data: unknown): A['_output'] & B['_output'];
}
export declare class OptionalSchema<T extends Schema<any>> extends Schema<T['_output'] | undefined> {
    private innerSchema;
    constructor(innerSchema: T);
    protected _validate(data: unknown): T['_output'] | undefined;
}
export declare class NullableSchema<T extends Schema<any>> extends Schema<T['_output'] | null> {
    private innerSchema;
    constructor(innerSchema: T);
    protected _validate(data: unknown): T['_output'] | null;
}
export declare class NullishSchema<T extends Schema<any>> extends Schema<T['_output'] | null | undefined> {
    private innerSchema;
    constructor(innerSchema: T);
    protected _validate(data: unknown): T['_output'] | null | undefined;
}
export declare class RefinementSchema<T extends Schema<any>> extends Schema<T['_output']> {
    private baseSchema;
    private predicate;
    private message;
    constructor(baseSchema: T, predicate: (data: T['_output']) => boolean, message?: string);
    protected _validate(data: unknown): T['_output'];
}
export declare class TransformSchema<Input extends Schema<any>, Output> extends Schema<Output> {
    private inputSchema;
    private transformer;
    constructor(inputSchema: Input, transformer: (data: Input['_output']) => Output);
    protected _validate(data: unknown): Output;
}
export declare class AsyncRefinementSchema<T extends Schema<any>> extends Schema<T['_output']> {
    private baseSchema;
    private predicate;
    private config;
    private cache;
    private activeRequests;
    private debouncedFunction;
    private schemaId;
    constructor(baseSchema: T, predicate: AsyncRefinementFunction<T['_output']>, config?: AsyncRefinementConfig);
    private emitAsyncCompleteEvent;
    protected _validate(data: unknown): T['_output'];
    protected _validateAsync(data: unknown, options?: AsyncValidationOptions): Promise<T['_output']>;
    private executeAsyncValidation;
    private processAsyncResult;
    private isValidCacheEntry;
    private cleanupCache;
    clearCache(): void;
    getCacheStats(): {
        hits: number;
        misses: number;
        size: number;
    };
    cancelPendingValidations(): void;
    hasPendingValidations(): boolean;
    getDebounceStats(): {
        isDebouncing: boolean;
        activeRequests: number;
        cacheSize: number;
    };
    dispose(): void;
}
export interface BatchValidationItem<T = any> {
    schema: Schema<T>;
    data: unknown;
    id?: string | number;
}
export interface BatchValidationOptions {
    maxConcurrency?: number;
    stopOnFirstError?: boolean;
    timeout?: number;
    abortSignal?: AbortSignal;
}
export interface BatchValidationResult<T = any> {
    success: boolean;
    data?: T;
    error?: ValidationError;
    id?: string | number;
    duration?: number;
}
export interface BatchValidationStats {
    total: number;
    successful: number;
    failed: number;
    duration: number;
    avgItemDuration: number;
    maxConcurrency: number;
}
export declare class BatchValidator {
    private defaultOptions;
    constructor(options?: Partial<BatchValidationOptions>);
    private generateBatchId;
    validateAsync<T extends any[]>(items: {
        [K in keyof T]: BatchValidationItem<T[K]>;
    }, options?: BatchValidationOptions): Promise<{
        [K in keyof T]: BatchValidationResult<T[K]>;
    }>;
    validateAsync(items: BatchValidationItem[], options?: BatchValidationOptions): Promise<BatchValidationResult[]>;
    private processBatch;
    validateMixed(items: Array<{
        schema: Schema<any>;
        data: unknown;
        id?: string | number;
    }>): Promise<BatchValidationResult[]>;
    getStats(results: BatchValidationResult[]): BatchValidationStats;
    static createBatch<T>(schema: Schema<T>, dataArray: unknown[], idGenerator?: (index: number, data: unknown) => string | number): BatchValidationItem<T>[];
    static groupResults(results: BatchValidationResult[]): {
        successful: Array<{
            data: any;
            id?: string | number;
            duration?: number;
        }>;
        failed: Array<{
            error: ValidationError;
            id?: string | number;
            duration?: number;
        }>;
    };
}
export declare class ValidationMonitor extends ValidationEventEmitter {
    private validationCount;
    private asyncValidationCount;
    private batchValidationCount;
    private errorCount;
    private totalDuration;
    private performanceMetrics;
    constructor();
    private collectStatistics;
    private recordPerformanceMetric;
    getStatistics(): {
        validationCount: number;
        asyncValidationCount: number;
        batchValidationCount: number;
        errorCount: number;
        totalDuration: number;
        averageDuration: number;
        errorRate: number;
    };
    getPerformanceMetrics(): Record<string, {
        current: number;
        average: number;
        min: number;
        max: number;
        count: number;
    }>;
    startPerformanceMonitoring(intervalMs?: number): () => void;
    resetStatistics(): void;
    onValidationSuccess(listener: (event: ValidationSuccessEvent) => void): this;
    onValidationError(listener: (event: ValidationErrorEvent) => void): this;
    onAsyncStart(listener: (event: AsyncValidationStartEvent) => void): this;
    onAsyncComplete(listener: (event: AsyncValidationCompleteEvent) => void): this;
    onBatchStart(listener: (event: BatchValidationStartEvent) => void): this;
    onBatchComplete(listener: (event: BatchValidationCompleteEvent) => void): this;
    onPerformance(listener: (event: PerformanceEvent) => void): this;
    onDebug(listener: (event: DebugEvent) => void): this;
    onSchemaType(schemaType: string, listener: ValidationEventListener): this;
    onErrorsOnly(listener: ValidationEventListener): this;
    enableDebugMode(): void;
    createEventLogger(prefix?: string): ValidationEventListener;
}
export declare const globalValidationMonitor: ValidationMonitor;
declare class DebouncedAsyncFunction<T extends any[], R> {
    private fn;
    private delay;
    private timeoutId;
    private lastPromise;
    private lastResolve;
    private lastReject;
    constructor(fn: (...args: T) => Promise<R>, delay: number);
    execute(...args: T): Promise<R>;
    cancel(): void;
    isRunning(): boolean;
}
declare class ValidationDebounceManager {
    private debouncedFunctions;
    getDebouncedFunction<T extends any[], R>(key: string, fn: (...args: T) => Promise<R>, delay: number): DebouncedAsyncFunction<T, R>;
    cancelAll(): void;
    cleanup(key: string): void;
    getStats(): {
        active: number;
        total: number;
    };
}
declare const globalDebounceManager: ValidationDebounceManager;
export { DebouncedAsyncFunction, ValidationDebounceManager, globalDebounceManager };
export declare function createDebouncedValidator<T>(validator: (value: T) => Promise<boolean>, delay: number): (value: T) => Promise<boolean>;
export declare function debounceAsyncFunction<T extends any[], R>(fn: (...args: T) => Promise<R>, delay: number): (...args: T) => Promise<R>;
export interface ConditionalValidationRule<T> {
    condition: (data: T) => boolean;
    schema: Schema<any>;
    message?: string;
}
export interface ValidationContext {
    path: (string | number)[];
    data: any;
    root: any;
    parent?: any;
    parentPath?: (string | number)[];
    metadata?: Record<string, any>;
}
export interface CustomValidatorFunction<T> {
    (value: T, context: ValidationContext): boolean | string | ValidationIssue[];
}
export interface CustomValidatorConfig<T> {
    validator: CustomValidatorFunction<T>;
    message?: string;
    code?: string;
    async?: boolean;
}
export declare class ConditionalSchema<T> extends Schema<T> {
    private rules;
    private defaultSchema?;
    constructor(defaultSchema?: Schema<T>);
    when<U>(condition: (data: T) => boolean, schema: Schema<U>, message?: string): ConditionalSchema<T | U>;
    otherwise<U>(schema: Schema<U>): ConditionalSchema<T | U>;
    protected _validate(data: unknown, context?: ValidationContext): T;
}
export declare class CustomValidationSchema<T> extends Schema<T> {
    private customValidators;
    constructor(baseSchema?: Schema<T>);
    private baseSchema?;
    addValidator(config: CustomValidatorConfig<T>): this;
    validator(fn: CustomValidatorFunction<T>, message?: string, code?: string): this;
    protected _validate(data: unknown, context?: ValidationContext): T;
}
export interface SchemaGenerator<T> {
    (context: ValidationContext): Schema<T>;
}
export declare class DynamicSchema<T> extends Schema<T> {
    private generator;
    private schemaCache;
    constructor(generator: SchemaGenerator<T>);
    protected _validate(data: unknown, context?: ValidationContext): T;
    private generateCacheKey;
    clearCache(): void;
}
export interface SchemaMetadata {
    type: string;
    description?: string;
    examples?: any[];
    tags?: string[];
    deprecated?: boolean;
    version?: string;
    author?: string;
    created?: Date;
    modified?: Date;
    custom?: Record<string, any>;
}
export declare class IntrospectableSchema<T> extends Schema<T> {
    private metadata;
    private baseSchema;
    constructor(baseSchema: Schema<T>, metadata?: Partial<SchemaMetadata>);
    getMetadata(): SchemaMetadata;
    setMetadata(metadata: Partial<SchemaMetadata>): this;
    describe(description: string): this;
    example(example: any): this;
    tag(...tags: string[]): this;
    deprecate(reason?: string): this;
    version(version: string): this;
    getType(): string;
    getShape(): any;
    getProperties(): string[];
    isOptional(): boolean;
    isNullable(): boolean;
    getConstraints(): any;
    protected _validate(data: unknown, context?: ValidationContext): T;
}
export interface SerializedSchema {
    type: string;
    constraints?: any;
    metadata?: SchemaMetadata;
    shape?: Record<string, SerializedSchema>;
    itemSchema?: SerializedSchema;
    schemas?: SerializedSchema[];
    version: string;
}
export declare class SchemaSerializer {
    private static readonly VERSION;
    static serialize(schema: Schema<any>): SerializedSchema;
    static deserialize(serialized: SerializedSchema): Schema<any>;
    private static deserializeStringSchema;
    private static deserializeNumberSchema;
    private static deserializeObjectSchema;
    private static deserializeArraySchema;
    private static deserializeUnionSchema;
}
export interface SchemaMigration {
    fromVersion: string;
    toVersion: string;
    migrate: (data: any) => any;
    description?: string;
}
export declare class VersionedSchema<T> extends Schema<T> {
    private currentVersion;
    private schemas;
    private migrations;
    constructor(version: string, schema: Schema<T>);
    addVersion(version: string, schema: Schema<T>): this;
    addMigration(migration: SchemaMigration): this;
    getCurrentVersion(): string;
    getAvailableVersions(): string[];
    migrate(data: any, fromVersion: string, toVersion?: string): any;
    private findMigrationPath;
    protected _validate(data: unknown, context?: ValidationContext): T;
}
export declare class ValidationErrorWithContext extends ValidationError {
    context: ValidationContext;
    constructor(issues: ValidationIssue[], context: ValidationContext);
    getContext(): ValidationContext;
    getFullPath(): string;
    getRootData(): any;
    getParentData(): any;
}
export declare class ContextualValidator {
    static validateWithContext<T>(schema: Schema<T>, data: unknown, context?: Partial<ValidationContext>): T;
}
export declare function createConditionalSchema<T>(defaultSchema?: Schema<T>): ConditionalSchema<T>;
export declare function createCustomValidator<T>(baseSchema?: Schema<T>): CustomValidationSchema<T>;
export declare function createDynamicSchema<T>(generator: SchemaGenerator<T>): DynamicSchema<T>;
export declare function introspect<T>(schema: Schema<T>, metadata?: Partial<SchemaMetadata>): IntrospectableSchema<T>;
export declare function createVersionedSchema<T>(version: string, schema: Schema<T>): VersionedSchema<T>;
//# sourceMappingURL=core.d.ts.map