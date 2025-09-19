// Core validation engine - Clean API without external references
// Fast-Schema's own validation system with modern TypeScript design

import init, {
  FastValidator as WasmValidator,
  FastBatchValidator as WasmBatchValidator,
  FastSchemaUtils as WasmUtils
} from '../pkg/fast_schema';

// Type inference utility
export type infer<T extends Schema<any>> = T['_output'];

// HTML/React validation types
export type HtmlElementType =
  | 'input' | 'textarea' | 'select' | 'option'
  | 'button' | 'checkbox' | 'radio' | 'range'
  | 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'ul' | 'ol' | 'li'
  | 'table' | 'thead' | 'tbody' | 'tr' | 'td' | 'th'
  | 'form' | 'label' | 'fieldset' | 'legend'
  | 'img' | 'video' | 'audio' | 'canvas' | 'svg'
  | 'header' | 'footer' | 'nav' | 'main' | 'article' | 'section' | 'aside'
  | 'strong' | 'em' | 'mark' | 'small' | 'del' | 'ins' | 'sub' | 'sup'
  | 'a' | 'link'
  | string; // For custom components

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

// React element type for validation
export interface ReactElement {
  type: string;
  props?: Record<string, any>;
  children?: ReactElement | ReactElement[] | string | null;
}

// Event system interfaces and types
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

export type ValidationEvent =
  | ValidationStartEvent
  | ValidationSuccessEvent
  | ValidationErrorEvent
  | ValidationCacheEvent
  | AsyncValidationStartEvent
  | AsyncValidationCompleteEvent
  | BatchValidationStartEvent
  | BatchValidationCompleteEvent
  | BatchItemValidationEvent
  | PerformanceEvent
  | DebugEvent;

export type ValidationEventType = ValidationEvent['type'];

export type ValidationEventListener<T extends ValidationEvent = ValidationEvent> = (event: T) => void;

// Schema composition utility types
export type DeepPartialSchema<T extends Schema<any>> = T extends ObjectSchema<infer U>
  ? ObjectSchema<{ [K in keyof U]: OptionalSchema<DeepPartialSchema<U[K]>> }>
  : T extends ArraySchema<infer U>
  ? ArraySchema<DeepPartialSchema<U>>
  : OptionalSchema<T>;

// Event emitter for validation events
export class ValidationEventEmitter {
  private listeners: Map<ValidationEventType | '*', ValidationEventListener[]> = new Map();
  private enabled: boolean = true;

  // Subscribe to specific event type
  on<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, { type: T }>>): this;
  on(eventType: '*', listener: ValidationEventListener): this;
  on(eventType: ValidationEventType | '*', listener: ValidationEventListener): this {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
    return this;
  }

  // Unsubscribe from event type
  off<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, { type: T }>>): this;
  off(eventType: '*', listener: ValidationEventListener): this;
  off(eventType: ValidationEventType | '*', listener: ValidationEventListener): this {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  // Subscribe once
  once<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, { type: T }>>): this;
  once(eventType: '*', listener: ValidationEventListener): this;
  once(eventType: ValidationEventType | '*', listener: ValidationEventListener): this {
    const onceListener = (event: ValidationEvent) => {
      this.off(eventType, onceListener as any);
      listener(event);
    };
    return this.on(eventType, onceListener as any);
  }

  // Emit event
  emit(event: ValidationEvent): void {
    if (!this.enabled) return;

    // Emit to specific listeners
    const specificListeners = this.listeners.get(event.type);
    if (specificListeners) {
      for (const listener of specificListeners) {
        try {
          listener(event);
        } catch (error) {
          console.warn('Error in validation event listener:', error);
        }
      }
    }

    // Emit to wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      for (const listener of wildcardListeners) {
        try {
          listener(event);
        } catch (error) {
          console.warn('Error in validation event listener:', error);
        }
      }
    }
  }

  // Remove all listeners
  removeAllListeners(eventType?: ValidationEventType | '*'): this {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
    return this;
  }

  // Get listener count
  listenerCount(eventType: ValidationEventType | '*'): number {
    return this.listeners.get(eventType)?.length || 0;
  }

  // Enable/disable event emission
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Get all event types with listeners
  getEventTypes(): Array<ValidationEventType | '*'> {
    return Array.from(this.listeners.keys());
  }
}

// Validation error class - Fast-Schema's clean error handling
export class ValidationError extends Error {
  public issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    const message = issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    super(`Validation failed: ${message}`);
    this.name = 'ValidationError';
    this.issues = issues;
  }

  format() {
    const formatted: any = { _errors: [] };
    for (const issue of this.issues) {
      let current = formatted;
      for (let i = 0; i < issue.path.length; i++) {
        const key = issue.path[i];
        if (i === issue.path.length - 1) {
          if (!current[key]) current[key] = { _errors: [] };
          current[key]._errors.push(issue.message);
        } else {
          if (!current[key]) current[key] = { _errors: [] };
          current = current[key];
        }
      }
      if (issue.path.length === 0) {
        formatted._errors.push(issue.message);
      }
    }
    return formatted;
  }

  flatten() {
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];

    for (const issue of this.issues) {
      if (issue.path.length === 0) {
        formErrors.push(issue.message);
      } else {
        const key = issue.path.join('.');
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
    }

    return { fieldErrors, formErrors };
  }
}

export interface ValidationIssue {
  code: string;
  path: (string | number)[];
  message: string;
  received?: string;
  expected?: string;
}

// Async validation types
export interface AsyncValidationOptions {
  signal?: AbortSignal;
  timeout?: number;
  debounce?: number;
  cache?: boolean;
  retries?: number;
}

export type AsyncRefinementFunction<T> = (
  value: T,
  ctx?: { signal?: AbortSignal }
) => Promise<boolean>;

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

// Base schema class
export abstract class Schema<Output = any, Input = Output> {
  readonly _type!: Output;
  readonly _output!: Output;
  readonly _input!: Input;

  protected schemaType: any;
  protected eventEmitter: ValidationEventEmitter;
  protected instanceId: string;
  protected compiledValidator?: (data: unknown) => Output;
  protected validationCount: number = 0;
  protected performanceStats: {
    totalTime: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
    cacheHits: number;
  } = {
    totalTime: 0,
    avgTime: 0,
    minTime: Infinity,
    maxTime: 0,
    cacheHits: 0
  };

  constructor(schemaType: any) {
    this.schemaType = schemaType;
    this.eventEmitter = new ValidationEventEmitter();
    this.instanceId = `schema_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Core validation methods - Fast-Schema API
  parse(data: unknown): Output {
    const result = this.safeParse(data);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  safeParse(data: unknown):
    | { success: true; data: Output }
    | { success: false; error: ValidationError } {
    const startTime = performance.now();
    this.validationCount++;

    // JIT optimization: compile validator after 10 uses
    if (this.validationCount === 10 && !this.compiledValidator) {
      this.compileValidator();
    }

    // Emit validation start event
    this.emitEvent({
      type: 'validation:start',
      schemaType: this.schemaType.type || 'unknown',
      data,
      timestamp: startTime,
      id: this.instanceId,
      async: false
    });

    globalValidationMonitor.emit({
      type: 'validation:start',
      schemaType: this.schemaType.type || 'unknown',
      data,
      timestamp: startTime,
      id: this.instanceId,
      async: false
    });

    try {
      // Use compiled validator if available
      const validated = this.compiledValidator ? this.compiledValidator(data) : this._validate(data);
      const duration = performance.now() - startTime;

      // Update performance stats
      this.updatePerformanceStats(duration);

      // Emit performance metric
      this.emitPerformance('validation_duration', duration, 'ms');

      // Emit success event
      const successEvent: ValidationSuccessEvent = {
        type: 'validation:success',
        schemaType: this.schemaType.type || 'unknown',
        data,
        timestamp: startTime,
        id: this.instanceId,
        async: false,
        result: validated,
        duration
      };

      this.emitEvent(successEvent);
      globalValidationMonitor.emit(successEvent);

      return { success: true, data: validated };
    } catch (error) {
      const duration = performance.now() - startTime;
      this.updatePerformanceStats(duration);

      const validationError = error instanceof ValidationError
        ? error
        : new ValidationError([{
            code: 'custom',
            path: [],
            message: error instanceof Error ? error.message : 'Validation failed'
          }]);

      // Emit error event
      const errorEvent: ValidationErrorEvent = {
        type: 'validation:error',
        schemaType: this.schemaType.type || 'unknown',
        data,
        timestamp: startTime,
        id: this.instanceId,
        async: false,
        error: validationError,
        duration
      };

      this.emitEvent(errorEvent);
      globalValidationMonitor.emit(errorEvent);

      return { success: false, error: validationError };
    }
  }

  // Async parsing methods with real async support
  async parseAsync(data: unknown, options?: AsyncValidationOptions): Promise<Output> {
    const result = await this.safeParseAsync(data, options);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  async safeParseAsync(data: unknown, options?: AsyncValidationOptions): Promise<
    | { success: true; data: Output }
    | { success: false; error: ValidationError }
  > {
    const startTime = Date.now();

    // Emit async validation start event
    this.emitEvent({
      type: 'validation:start',
      schemaType: this.schemaType.type || 'unknown',
      data,
      timestamp: startTime,
      id: this.instanceId,
      async: true
    });

    globalValidationMonitor.emit({
      type: 'validation:start',
      schemaType: this.schemaType.type || 'unknown',
      data,
      timestamp: startTime,
      id: this.instanceId,
      async: true
    });

    try {
      const validated = await this._validateAsync(data, options);
      const duration = Date.now() - startTime;

      // Emit success event
      const successEvent: ValidationSuccessEvent = {
        type: 'validation:success',
        schemaType: this.schemaType.type || 'unknown',
        data,
        timestamp: startTime,
        id: this.instanceId,
        async: true,
        result: validated,
        duration
      };

      this.emitEvent(successEvent);
      globalValidationMonitor.emit(successEvent);

      return { success: true, data: validated };
    } catch (error) {
      const duration = Date.now() - startTime;
      const validationError = error instanceof ValidationError
        ? error
        : new ValidationError([{
            code: 'custom',
            path: [],
            message: error instanceof Error ? error.message : 'Async validation failed'
          }]);

      // Emit error event
      const errorEvent: ValidationErrorEvent = {
        type: 'validation:error',
        schemaType: this.schemaType.type || 'unknown',
        data,
        timestamp: startTime,
        id: this.instanceId,
        async: true,
        error: validationError,
        duration
      };

      this.emitEvent(errorEvent);
      globalValidationMonitor.emit(errorEvent);

      return { success: false, error: validationError };
    }
  }

  // Schema modification methods
  optional(): OptionalSchema<this> {
    return new OptionalSchema(this);
  }

  nullable(): NullableSchema<this> {
    return new NullableSchema(this);
  }

  nullish(): NullishSchema<this> {
    return new NullishSchema(this);
  }

  array(): ArraySchema<this> {
    return new ArraySchema(this);
  }

  // Union and intersection methods
  or<U extends Schema<any>>(schema: U): UnionSchema<[this, U]> {
    return new UnionSchema([this, schema]);
  }

  and<U extends Schema<any>>(schema: U): IntersectionSchema<this, U> {
    return new IntersectionSchema(this, schema);
  }

  // Refinement methods
  refine(predicate: (data: any) => boolean, message?: string): RefinementSchema<this> {
    return new RefinementSchema(this, predicate, message);
  }

  superRefine(predicate: (data: any) => boolean, message?: string): RefinementSchema<this> {
    return new RefinementSchema(this, predicate, message);
  }

  // Async refinement methods
  refineAsync(
    predicate: AsyncRefinementFunction<Output>,
    config?: string | AsyncRefinementConfig
  ): AsyncRefinementSchema<this> {
    const finalConfig = typeof config === 'string'
      ? { message: config }
      : (config || {});

    return new AsyncRefinementSchema(this, predicate, finalConfig);
  }

  superRefineAsync(
    predicate: AsyncRefinementFunction<Output>,
    config?: string | AsyncRefinementConfig
  ): AsyncRefinementSchema<this> {
    const finalConfig = typeof config === 'string'
      ? { message: config }
      : (config || {});

    return new AsyncRefinementSchema(this, predicate, finalConfig);
  }

  // Transform method
  transform<U>(transformer: (data: any) => U): TransformSchema<this, U> {
    return new TransformSchema(this, transformer);
  }

  // Custom validation function
  custom(validator: (data: any) => boolean | string, message?: string): RefinementSchema<this> {
    return new RefinementSchema(this, (data) => {
      const result = validator(data);
      return typeof result === 'boolean' ? result : false;
    }, message);
  }

  // Internal validation method to be implemented by subclasses
  protected abstract _validate(data: unknown): Output;

  // Internal async validation method - default implementation calls sync version
  protected async _validateAsync(data: unknown, options?: AsyncValidationOptions): Promise<Output> {
    return this._validate(data);
  }

  // Event system methods
  on<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, { type: T }>>): this;
  on(eventType: '*', listener: ValidationEventListener): this;
  on(eventType: ValidationEventType | '*', listener: ValidationEventListener): this {
    this.eventEmitter.on(eventType, listener);
    return this;
  }

  off<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, { type: T }>>): this;
  off(eventType: '*', listener: ValidationEventListener): this;
  off(eventType: ValidationEventType | '*', listener: ValidationEventListener): this {
    this.eventEmitter.off(eventType, listener);
    return this;
  }

  once<T extends ValidationEventType>(eventType: T, listener: ValidationEventListener<Extract<ValidationEvent, { type: T }>>): this;
  once(eventType: '*', listener: ValidationEventListener): this;
  once(eventType: ValidationEventType | '*', listener: ValidationEventListener): this {
    this.eventEmitter.once(eventType, listener);
    return this;
  }

  removeAllListeners(eventType?: ValidationEventType | '*'): this {
    this.eventEmitter.removeAllListeners(eventType);
    return this;
  }

  protected emitEvent(event: ValidationEvent): void {
    this.eventEmitter.emit(event);
  }

  // Performance and debugging helpers
  protected emitPerformance(metric: string, value: number, unit: string, context?: Record<string, any>): void {
    this.emitEvent({
      type: 'performance',
      schemaType: this.schemaType.type || 'unknown',
      data: null,
      timestamp: Date.now(),
      id: this.instanceId,
      context,
      metric,
      value,
      unit
    });
  }

  protected emitDebug(level: 'info' | 'warn' | 'error', message: string, details?: any, context?: Record<string, any>): void {
    this.emitEvent({
      type: 'debug',
      schemaType: this.schemaType.type || 'unknown',
      data: null,
      timestamp: Date.now(),
      id: this.instanceId,
      context,
      level,
      message,
      details
    });
  }

  // Get instance information
  getInstanceId(): string {
    return this.instanceId;
  }

  getEventEmitter(): ValidationEventEmitter {
    return this.eventEmitter;
  }

  // Performance and optimization methods
  private updatePerformanceStats(duration: number): void {
    this.performanceStats.totalTime += duration;
    this.performanceStats.avgTime = this.performanceStats.totalTime / this.validationCount;
    this.performanceStats.minTime = Math.min(this.performanceStats.minTime, duration);
    this.performanceStats.maxTime = Math.max(this.performanceStats.maxTime, duration);
  }

  private compileValidator(): void {
    try {
      // Generate optimized validation function for this schema
      const validationCode = this.generateValidationCode();
      this.compiledValidator = new Function('data', 'ValidationError', validationCode);

      this.emitDebug('info', 'JIT compilation completed', {
        schemaType: this.schemaType.type,
        validationCount: this.validationCount
      });
    } catch (error) {
      this.emitDebug('warn', 'JIT compilation failed, falling back to standard validation', { error });
    }
  }

  private generateValidationCode(): string {
    // This is a simplified example - real implementation would be much more sophisticated
    const schemaType = this.schemaType.type;

    switch (schemaType) {
      case 'string':
        return this.generateStringValidationCode();
      case 'number':
        return this.generateNumberValidationCode();
      case 'boolean':
        return `
          if (typeof data !== 'boolean') {
            throw new ValidationError([{
              code: 'invalid_type',
              path: [],
              message: 'Expected boolean, received ' + typeof data,
              received: typeof data,
              expected: 'boolean'
            }]);
          }
          return data;
        `;
      default:
        // Fallback to standard validation
        throw new Error('Cannot compile this schema type');
    }
  }

  private generateStringValidationCode(): string {
    const schema = this.schemaType;
    let code = `
      if (typeof data !== 'string') {
        throw new ValidationError([{
          code: 'invalid_type',
          path: [],
          message: 'Expected string, received ' + typeof data,
          received: typeof data,
          expected: 'string'
        }]);
      }
    `;

    if (schema.minLength !== undefined) {
      code += `
        if (data.length < ${schema.minLength}) {
          throw new ValidationError([{
            code: 'too_small',
            path: [],
            message: 'String must be at least ${schema.minLength} characters',
            minimum: ${schema.minLength}
          }]);
        }
      `;
    }

    if (schema.maxLength !== undefined) {
      code += `
        if (data.length > ${schema.maxLength}) {
          throw new ValidationError([{
            code: 'too_big',
            path: [],
            message: 'String must be at most ${schema.maxLength} characters',
            maximum: ${schema.maxLength}
          }]);
        }
      `;
    }

    code += 'return data;';
    return code;
  }

  private generateNumberValidationCode(): string {
    const schema = this.schemaType;
    let code = `
      if (typeof data !== 'number' || isNaN(data)) {
        throw new ValidationError([{
          code: 'invalid_type',
          path: [],
          message: 'Expected number, received ' + typeof data,
          received: typeof data,
          expected: 'number'
        }]);
      }
    `;

    if (schema.min !== undefined) {
      code += `
        if (data < ${schema.min}) {
          throw new ValidationError([{
            code: 'too_small',
            path: [],
            message: 'Number must be greater than or equal to ${schema.min}',
            minimum: ${schema.min}
          }]);
        }
      `;
    }

    if (schema.max !== undefined) {
      code += `
        if (data > ${schema.max}) {
          throw new ValidationError([{
            code: 'too_big',
            path: [],
            message: 'Number must be less than or equal to ${schema.max}',
            maximum: ${schema.max}
          }]);
        }
      `;
    }

    code += 'return data;';
    return code;
  }

  // Performance monitoring methods
  getPerformanceStats(): {
    validationCount: number;
    totalTime: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
    cacheHits: number;
    isCompiled: boolean;
  } {
    return {
      ...this.performanceStats,
      validationCount: this.validationCount,
      isCompiled: !!this.compiledValidator
    };
  }

  resetPerformanceStats(): void {
    this.validationCount = 0;
    this.performanceStats = {
      totalTime: 0,
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0,
      cacheHits: 0
    };
  }

  // Force JIT compilation
  compile(): this {
    this.compileValidator();
    return this;
  }

  // Get the internal schema representation
  getSchema(): any {
    return this.schemaType;
  }
}

// String schema implementation
export class StringSchema extends Schema<string> {
  constructor() {
    super({ type: 'string' });
  }

  protected _validate(data: unknown): string {
    if (typeof data !== 'string') {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected string, received ' + typeof data,
        received: typeof data,
        expected: 'string'
      }]);
    }

    // Apply all validations from schema
    const issues: ValidationIssue[] = [];

    if (this.schemaType.minLength !== undefined && data.length < this.schemaType.minLength) {
      issues.push({
        code: 'too_small',
        path: [],
        message: `String must contain at least ${this.schemaType.minLength} character(s)`
      });
    }

    if (this.schemaType.maxLength !== undefined && data.length > this.schemaType.maxLength) {
      issues.push({
        code: 'too_big',
        path: [],
        message: `String must contain at most ${this.schemaType.maxLength} character(s)`
      });
    }

    if (this.schemaType.pattern && !new RegExp(this.schemaType.pattern).test(data)) {
      issues.push({
        code: 'invalid_string',
        path: [],
        message: this.schemaType.customMessage || 'Invalid'
      });
    }

    if (this.schemaType.format) {
      switch (this.schemaType.format) {
        case 'email':
          if (!isValidEmail(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid email'
            });
          }
          break;
        case 'url':
          if (!isValidUrl(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid url'
            });
          }
          break;
        case 'uuid':
          if (!isValidUuid(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid uuid'
            });
          }
          break;
        case 'ipv4':
          if (!isValidIPv4(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid IPv4 address'
            });
          }
          break;
        case 'ipv6':
          if (!isValidIPv6(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid IPv6 address'
            });
          }
          break;
        case 'phone':
          if (!isValidPhone(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid phone number'
            });
          }
          break;
        case 'jwt':
          if (!isValidJWT(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid JWT token'
            });
          }
          break;
        case 'base64':
          if (!isValidBase64(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid base64 string'
            });
          }
          break;
        case 'hex':
          if (!isValidHex(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid hexadecimal string'
            });
          }
          break;
        case 'creditCard':
          if (!isValidCreditCard(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid credit card number'
            });
          }
          break;
        case 'macAddress':
          if (!isValidMacAddress(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid MAC address'
            });
          }
          break;
        case 'color':
          if (!isValidColor(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid color format'
            });
          }
          break;
        case 'slug':
          if (!isValidSlug(data)) {
            issues.push({
              code: 'invalid_string',
              path: [],
              message: 'Invalid URL slug'
            });
          }
          break;
      }
    }

    if (issues.length > 0) {
      throw new ValidationError(issues);
    }

    return data;
  }

  min(length: number): StringSchema {
    this.schemaType.minLength = length;
    return this;
  }

  max(length: number): StringSchema {
    this.schemaType.maxLength = length;
    return this;
  }

  length(exactLength: number): StringSchema {
    this.schemaType.minLength = exactLength;
    this.schemaType.maxLength = exactLength;
    return this;
  }

  email(): StringSchema {
    this.schemaType.format = 'email';
    return this;
  }

  url(): StringSchema {
    this.schemaType.format = 'url';
    return this;
  }

  uuid(): StringSchema {
    this.schemaType.format = 'uuid';
    return this;
  }

  datetime(): StringSchema {
    this.schemaType.format = 'date-time';
    return this;
  }

  // Additional string formats
  ip(): StringSchema {
    this.schemaType.format = 'ipv4';
    return this;
  }

  ipv4(): StringSchema {
    this.schemaType.format = 'ipv4';
    return this;
  }

  ipv6(): StringSchema {
    this.schemaType.format = 'ipv6';
    return this;
  }

  phone(): StringSchema {
    this.schemaType.format = 'phone';
    return this;
  }

  jwt(): StringSchema {
    this.schemaType.format = 'jwt';
    return this;
  }

  base64(): StringSchema {
    this.schemaType.format = 'base64';
    return this;
  }

  hex(): StringSchema {
    this.schemaType.format = 'hex';
    return this;
  }

  creditCard(): StringSchema {
    this.schemaType.format = 'creditCard';
    return this;
  }

  macAddress(): StringSchema {
    this.schemaType.format = 'macAddress';
    return this;
  }

  color(): StringSchema {
    this.schemaType.format = 'color';
    return this;
  }

  slug(): StringSchema {
    this.schemaType.format = 'slug';
    return this;
  }

  date(): StringSchema {
    this.schemaType.format = 'date';
    return this;
  }

  time(): StringSchema {
    this.schemaType.format = 'time';
    return this;
  }

  duration(): StringSchema {
    this.schemaType.format = 'duration';
    return this;
  }

  base64(): StringSchema {
    this.schemaType.format = 'base64';
    return this;
  }

  jwt(): StringSchema {
    this.schemaType.format = 'jwt';
    return this;
  }

  nanoid(): StringSchema {
    this.schemaType.format = 'nanoid';
    return this;
  }

  cuid(): StringSchema {
    this.schemaType.format = 'cuid';
    return this;
  }

  cssColor(): StringSchema {
    this.schemaType.format = 'css-color';
    return this;
  }

  cssSelector(): StringSchema {
    this.schemaType.format = 'css-selector';
    return this;
  }

  htmlId(): StringSchema {
    this.schemaType.format = 'html-id';
    return this;
  }

  className(): StringSchema {
    this.schemaType.format = 'className';
    return this;
  }

  phoneNumber(): StringSchema {
    this.schemaType.format = 'phone-number';
    return this;
  }

  postalCode(): StringSchema {
    this.schemaType.format = 'postal-code';
    return this;
  }

  latitude(): StringSchema {
    this.schemaType.format = 'latitude';
    return this;
  }

  longitude(): StringSchema {
    this.schemaType.format = 'longitude';
    return this;
  }

  country(): StringSchema {
    this.schemaType.format = 'country';
    return this;
  }

  language(): StringSchema {
    this.schemaType.format = 'language';
    return this;
  }

  timezone(): StringSchema {
    this.schemaType.format = 'timezone';
    return this;
  }

  mimeType(): StringSchema {
    this.schemaType.format = 'mime-type';
    return this;
  }

  regex(pattern: RegExp, message?: string): StringSchema {
    this.schemaType.pattern = pattern.source;
    if (message) this.schemaType.customMessage = message;
    return this;
  }

  startsWith(prefix: string): StringSchema {
    this.schemaType.pattern = `^${escapeRegex(prefix)}`;
    this.schemaType.customMessage = `String must start with "${prefix}"`;
    return this;
  }

  endsWith(suffix: string): StringSchema {
    this.schemaType.pattern = `${escapeRegex(suffix)}$`;
    this.schemaType.customMessage = `String must end with "${suffix}"`;
    return this;
  }

  includes(substring: string): StringSchema {
    this.schemaType.pattern = escapeRegex(substring);
    this.schemaType.customMessage = `String must include "${substring}"`;
    return this;
  }
}

// Number schema implementation
export class NumberSchema extends Schema<number> {
  constructor() {
    super({ type: 'number' });
  }

  protected _validate(data: unknown): number {
    if (typeof data !== 'number' || isNaN(data)) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected number, received ' + typeof data,
        received: typeof data,
        expected: 'number'
      }]);
    }

    const issues: ValidationIssue[] = [];

    if (this.schemaType.min !== undefined && data < this.schemaType.min) {
      issues.push({
        code: 'too_small',
        path: [],
        message: `Number must be greater than or equal to ${this.schemaType.min}`
      });
    }

    if (this.schemaType.max !== undefined && data > this.schemaType.max) {
      issues.push({
        code: 'too_big',
        path: [],
        message: `Number must be less than or equal to ${this.schemaType.max}`
      });
    }

    if (this.schemaType.integer && !Number.isInteger(data)) {
      issues.push({
        code: 'invalid_type',
        path: [],
        message: 'Expected integer, received float'
      });
    }

    if (issues.length > 0) {
      throw new ValidationError(issues);
    }

    return data;
  }

  min(value: number): NumberSchema {
    this.schemaType.min = value;
    return this;
  }

  max(value: number): NumberSchema {
    this.schemaType.max = value;
    return this;
  }

  int(): NumberSchema {
    this.schemaType.integer = true;
    return this;
  }

  positive(): NumberSchema {
    this.schemaType.min = 0.0000001;
    return this;
  }

  negative(): NumberSchema {
    this.schemaType.max = -0.0000001;
    return this;
  }

  nonnegative(): NumberSchema {
    this.schemaType.min = 0;
    return this;
  }

  nonpositive(): NumberSchema {
    this.schemaType.max = 0;
    return this;
  }
}

// Boolean schema implementation
export class BooleanSchema extends Schema<boolean> {
  constructor() {
    super({ type: 'boolean' });
  }

  protected _validate(data: unknown): boolean {
    if (typeof data !== 'boolean') {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected boolean, received ' + typeof data,
        received: typeof data,
        expected: 'boolean'
      }]);
    }
    return data;
  }
}

// Array schema implementation
export class ArraySchema<T extends Schema<any>> extends Schema<T['_output'][]> {
  constructor(private itemSchema: T) {
    super({ type: 'array', items: itemSchema.getSchema() });
  }

  protected _validate(data: unknown): T['_output'][] {
    if (!Array.isArray(data)) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected array, received ' + typeof data,
        received: typeof data,
        expected: 'array'
      }]);
    }

    const issues: ValidationIssue[] = [];

    if (this.schemaType.minItems !== undefined && data.length < this.schemaType.minItems) {
      issues.push({
        code: 'too_small',
        path: [],
        message: `Array must contain at least ${this.schemaType.minItems} element(s)`
      });
    }

    if (this.schemaType.maxItems !== undefined && data.length > this.schemaType.maxItems) {
      issues.push({
        code: 'too_big',
        path: [],
        message: `Array must contain at most ${this.schemaType.maxItems} element(s)`
      });
    }

    const result: T['_output'][] = [];
    for (let i = 0; i < data.length; i++) {
      try {
        result.push(this.itemSchema._validate(data[i]));
      } catch (error) {
        if (error instanceof ValidationError) {
          for (const issue of error.issues) {
            issues.push({
              ...issue,
              path: [i, ...issue.path]
            });
          }
        }
      }
    }

    if (issues.length > 0) {
      throw new ValidationError(issues);
    }

    return result;
  }

  min(items: number): ArraySchema<T> {
    this.schemaType.minItems = items;
    return this;
  }

  max(items: number): ArraySchema<T> {
    this.schemaType.maxItems = items;
    return this;
  }

  length(exactLength: number): ArraySchema<T> {
    this.schemaType.minItems = exactLength;
    this.schemaType.maxItems = exactLength;
    return this;
  }

  nonempty(): ArraySchema<T> {
    this.schemaType.minItems = 1;
    return this;
  }
}

// Object schema implementation
export class ObjectSchema<T extends Record<string, Schema<any>>> extends Schema<{
  [K in keyof T]: T[K]['_output'];
}> {
  constructor(private shape: T) {
    const properties: any = {};
    const required: string[] = [];

    for (const [key, schema] of Object.entries(shape)) {
      properties[key] = schema.getSchema();
      required.push(key);
    }

    super({
      type: 'object',
      properties,
      required,
      additionalProperties: false
    });
  }

  protected _validate(data: unknown): { [K in keyof T]: T[K]['_output'] } {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new ValidationError([{
        code: 'invalid_type',
        path: [],
        message: 'Expected object, received ' + typeof data,
        received: typeof data,
        expected: 'object'
      }]);
    }

    const issues: ValidationIssue[] = [];
    const result: any = {};
    const inputData = data as Record<string, unknown>;

    // Check for unrecognized keys if strict mode
    if (!this.schemaType.additionalProperties) {
      const allowedKeys = new Set(Object.keys(this.shape));
      for (const key of Object.keys(inputData)) {
        if (!allowedKeys.has(key)) {
          issues.push({
            code: 'unrecognized_keys',
            path: [key],
            message: `Unrecognized key(s) in object: '${key}'`
          });
        }
      }
    }

    // Validate each property
    for (const [key, schema] of Object.entries(this.shape)) {
      if (!(key in inputData)) {
        if (this.schemaType.required.includes(key)) {
          issues.push({
            code: 'invalid_type',
            path: [key],
            message: 'Required'
          });
        }
        continue;
      }

      try {
        result[key] = schema._validate(inputData[key]);
      } catch (error) {
        if (error instanceof ValidationError) {
          for (const issue of error.issues) {
            issues.push({
              ...issue,
              path: [key, ...issue.path]
            });
          }
        }
      }
    }

    if (issues.length > 0) {
      throw new ValidationError(issues);
    }

    return result;
  }

  strict(): ObjectSchema<T> {
    this.schemaType.additionalProperties = false;
    return this;
  }

  passthrough(): ObjectSchema<T> {
    this.schemaType.additionalProperties = true;
    return this;
  }

  partial(): ObjectSchema<{ [K in keyof T]: OptionalSchema<T[K]> }> {
    const partialShape: any = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      partialShape[key] = (schema as Schema<any>).optional();
    }
    return new ObjectSchema(partialShape);
  }

  // Extend schema with additional properties
  extend<U extends Record<string, Schema<any>>>(extension: U): ObjectSchema<T & U> {
    const extendedShape = { ...this.shape, ...extension };
    return new ObjectSchema(extendedShape);
  }

  // Pick specific properties from schema
  pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>> {
    const pickedShape: any = {};
    for (const key of keys) {
      if (key in this.shape) {
        pickedShape[key] = this.shape[key];
      }
    }
    return new ObjectSchema(pickedShape);
  }

  // Omit specific properties from schema
  omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>> {
    const omittedShape: any = {};
    const keysSet = new Set(keys);
    for (const [key, schema] of Object.entries(this.shape)) {
      if (!keysSet.has(key as K)) {
        omittedShape[key] = schema;
      }
    }
    return new ObjectSchema(omittedShape);
  }

  // Merge with another object schema
  merge<U extends Record<string, Schema<any>>>(other: ObjectSchema<U>): ObjectSchema<T & U> {
    const mergedShape = { ...this.shape, ...other.shape };
    return new ObjectSchema(mergedShape);
  }

  // Deep partial - makes nested objects optional too
  deepPartial(): ObjectSchema<{ [K in keyof T]: DeepPartialSchema<T[K]> }> {
    const deepPartialShape: any = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      deepPartialShape[key] = makeDeepPartial(schema as Schema<any>);
    }
    return new ObjectSchema(deepPartialShape);
  }

  // Get keys as a literal union schema
  keyof(): Schema<keyof T> {
    const keys = Object.keys(this.shape) as (keyof T)[];

    class KeyofSchema extends Schema<keyof T> {
      protected _validate(data: unknown): keyof T {
        if (typeof data !== 'string' || !keys.includes(data as keyof T)) {
          throw new ValidationError([{
            code: 'invalid_enum_value',
            path: [],
            message: `Expected one of: ${keys.join(', ')}`,
            received: typeof data,
            expected: keys.join(' | ')
          }]);
        }
        return data as keyof T;
      }
    }

    return new KeyofSchema({ type: 'keyof', keys });
  }

  // Required - opposite of partial
  required(): ObjectSchema<{ [K in keyof T]: T[K] extends OptionalSchema<infer U> ? U : T[K] }> {
    const requiredShape: any = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      // If schema is OptionalSchema, extract the inner schema
      if (schema instanceof OptionalSchema) {
        requiredShape[key] = (schema as any).innerSchema;
      } else {
        requiredShape[key] = schema;
      }
    }
    return new ObjectSchema(requiredShape);
  }

  // Set specific fields as optional
  setOptional<K extends keyof T>(keys: K[]): ObjectSchema<{ [P in keyof T]: P extends K ? OptionalSchema<T[P]> : T[P] }> {
    const newShape: any = {};
    const keysSet = new Set(keys);
    for (const [key, schema] of Object.entries(this.shape)) {
      if (keysSet.has(key as K)) {
        newShape[key] = (schema as Schema<any>).optional();
      } else {
        newShape[key] = schema;
      }
    }
    return new ObjectSchema(newShape);
  }

  // Set specific fields as required
  setRequired<K extends keyof T>(keys: K[]): ObjectSchema<{ [P in keyof T]: P extends K ? (T[P] extends OptionalSchema<infer U> ? U : T[P]) : T[P] }> {
    const newShape: any = {};
    const keysSet = new Set(keys);
    for (const [key, schema] of Object.entries(this.shape)) {
      if (keysSet.has(key as K) && schema instanceof OptionalSchema) {
        newShape[key] = (schema as any).innerSchema;
      } else {
        newShape[key] = schema;
      }
    }
    return new ObjectSchema(newShape);
  }

  // Get the shape for inspection
  getShape(): T {
    return this.shape;
  }
}

// Union type implementation
export class UnionSchema<T extends [Schema<any>, Schema<any>, ...Schema<any>[]]> extends Schema<T[number]['_output']> {
  constructor(private options: T) {
    super({
      type: 'union',
      options: options.map(schema => schema.getSchema())
    });
  }

  protected _validate(data: unknown): T[number]['_output'] {
    const issues: ValidationIssue[] = [];

    // Try each option until one succeeds
    for (let i = 0; i < this.options.length; i++) {
      try {
        return this.options[i]._validate(data);
      } catch (error) {
        if (error instanceof ValidationError) {
          // Collect errors from all failed attempts
          const unionIssues = error.issues.map(issue => ({
            ...issue,
            path: [`option_${i}`, ...issue.path]
          }));
          issues.push(...unionIssues);
        }
      }
    }

    // If no option succeeded, throw with all accumulated errors
    throw new ValidationError([{
      code: 'invalid_union',
      path: [],
      message: `Invalid input: must match one of the union types`
    }]);
  }
}

// Intersection type implementation
export class IntersectionSchema<A extends Schema<any>, B extends Schema<any>> extends Schema<A['_output'] & B['_output']> {
  constructor(private left: A, private right: B) {
    super({
      type: 'intersection',
      schemas: [left.getSchema(), right.getSchema()]
    });
  }

  protected _validate(data: unknown): A['_output'] & B['_output'] {
    // Both schemas must validate successfully
    const leftResult = this.left._validate(data);
    const rightResult = this.right._validate(data);

    // For object intersection, merge properties
    if (typeof leftResult === 'object' && typeof rightResult === 'object' &&
        leftResult !== null && rightResult !== null &&
        !Array.isArray(leftResult) && !Array.isArray(rightResult)) {
      return { ...leftResult, ...rightResult } as A['_output'] & B['_output'];
    }

    // For non-objects, the right schema takes precedence
    return rightResult as A['_output'] & B['_output'];
  }
}

// Optional wrapper
export class OptionalSchema<T extends Schema<any>> extends Schema<T['_output'] | undefined> {
  constructor(private innerSchema: T) {
    super({ ...innerSchema.getSchema(), optional: true });
  }

  protected _validate(data: unknown): T['_output'] | undefined {
    if (data === undefined) {
      return undefined;
    }
    return this.innerSchema._validate(data);
  }
}

// Nullable wrapper
export class NullableSchema<T extends Schema<any>> extends Schema<T['_output'] | null> {
  constructor(private innerSchema: T) {
    super({ ...innerSchema.getSchema(), nullable: true });
  }

  protected _validate(data: unknown): T['_output'] | null {
    if (data === null) {
      return null;
    }
    return this.innerSchema._validate(data);
  }
}

// Nullish wrapper (null | undefined)
export class NullishSchema<T extends Schema<any>> extends Schema<T['_output'] | null | undefined> {
  constructor(private innerSchema: T) {
    super({ ...innerSchema.getSchema(), nullish: true });
  }

  protected _validate(data: unknown): T['_output'] | null | undefined {
    if (data === null || data === undefined) {
      return data as null | undefined;
    }
    return this.innerSchema._validate(data);
  }
}

// Refinement type for custom validation
export class RefinementSchema<T extends Schema<any>> extends Schema<T['_output']> {
  constructor(
    private baseSchema: T,
    private predicate: (data: T['_output']) => boolean,
    private message: string = 'Refinement failed'
  ) {
    super({
      type: 'refinement',
      base: baseSchema.getSchema(),
      predicate: predicate.toString(),
      message
    });
  }

  protected _validate(data: unknown): T['_output'] {
    const baseResult = this.baseSchema._validate(data);

    if (!this.predicate(baseResult)) {
      throw new ValidationError([{
        code: 'custom',
        path: [],
        message: this.message
      }]);
    }

    return baseResult;
  }
}

// Transform type for data transformation
export class TransformSchema<Input extends Schema<any>, Output> extends Schema<Output> {
  constructor(
    private inputSchema: Input,
    private transformer: (data: Input['_output']) => Output
  ) {
    super({
      type: 'transform',
      input: inputSchema.getSchema(),
      transformer: transformer.toString()
    });
  }

  protected _validate(data: unknown): Output {
    const inputResult = this.inputSchema._validate(data);
    return this.transformer(inputResult);
  }
}

// Async refinement type for async validation
export class AsyncRefinementSchema<T extends Schema<any>> extends Schema<T['_output']> {
  private cache = new Map<string, { result: boolean; timestamp: number }>();
  private activeRequests = new Map<string, Promise<boolean>>();
  private debouncedFunction: DebouncedAsyncFunction<[T['_output'], AsyncValidationOptions?], boolean> | null = null;
  private schemaId: string;

  constructor(
    private baseSchema: T,
    private predicate: AsyncRefinementFunction<T['_output']>,
    private config: AsyncRefinementConfig = {}
  ) {
    super({
      type: 'async_refinement',
      base: baseSchema.getSchema(),
      config
    });

    // Generate unique ID for this schema instance
    this.schemaId = `async_refinement_${Date.now()}_${Math.random()}`;

    // Set up debounced function if debouncing is enabled
    if (this.config.debounce && this.config.debounce > 0) {
      this.debouncedFunction = new DebouncedAsyncFunction(
        this.executeAsyncValidation.bind(this),
        this.config.debounce
      );
    }
  }

  private emitAsyncCompleteEvent(startTime: number, success: boolean, cancelled: boolean): void {
    const asyncCompleteEvent: AsyncValidationCompleteEvent = {
      type: 'async:complete',
      schemaType: this.schemaType.type || 'async_refinement',
      data: null,
      timestamp: startTime,
      id: this.instanceId,
      refinementId: this.schemaId,
      success,
      duration: Date.now() - startTime,
      cancelled
    };

    this.emitEvent(asyncCompleteEvent);
    globalValidationMonitor.emit(asyncCompleteEvent);
  }

  protected _validate(data: unknown): T['_output'] {
    throw new ValidationError([{
      code: 'async_required',
      path: [],
      message: 'This schema requires async validation. Use parseAsync() or safeParseAsync()'
    }]);
  }

  protected async _validateAsync(data: unknown, options?: AsyncValidationOptions): Promise<T['_output']> {
    const startTime = Date.now();

    // Emit async validation start event
    const asyncStartEvent: AsyncValidationStartEvent = {
      type: 'async:start',
      schemaType: this.schemaType.type || 'async_refinement',
      data,
      timestamp: startTime,
      id: this.instanceId,
      refinementId: this.schemaId,
      debounced: (options?.debounce ?? this.config.debounce ?? 0) > 0
    };

    this.emitEvent(asyncStartEvent);
    globalValidationMonitor.emit(asyncStartEvent);

    // First validate with base schema
    const baseResult = await this.baseSchema._validateAsync(data, options);

    // Create cache key
    const cacheKey = JSON.stringify(baseResult);

    // Check cache if enabled
    if (this.config.cache && this.isValidCacheEntry(cacheKey)) {
      const cached = this.cache.get(cacheKey);

      // Emit cache event
      this.emitEvent({
        type: 'validation:cache',
        schemaType: this.schemaType.type || 'async_refinement',
        data,
        timestamp: Date.now(),
        id: this.instanceId,
        cacheHit: true,
        cacheKey
      });

      if (cached && cached.result) {
        // Emit async complete event for cache hit
        this.emitAsyncCompleteEvent(startTime, true, false);
        return baseResult;
      } else if (cached && !cached.result) {
        // Emit async complete event for cache hit (failed)
        this.emitAsyncCompleteEvent(startTime, false, false);
        throw new ValidationError([{
          code: 'custom',
          path: [],
          message: this.config.message || 'Async refinement failed'
        }]);
      }
    }

    // Determine effective debounce delay
    const debounceDelay = options?.debounce ?? this.config.debounce ?? 0;

    let validationPromise: Promise<boolean>;

    // Use debouncing if configured
    if (debounceDelay > 0) {
      // Get or create debounced function for this delay
      const debouncedFn = globalDebounceManager.getDebouncedFunction(
        `${this.schemaId}_${debounceDelay}`,
        this.executeAsyncValidation.bind(this),
        debounceDelay
      );

      validationPromise = debouncedFn.execute(baseResult, options);
    } else {
      // Check for existing request to prevent duplicate calls
      if (this.config.cancelPrevious && this.activeRequests.has(cacheKey)) {
        const existingRequest = this.activeRequests.get(cacheKey)!;
        try {
          const result = await existingRequest;
          return this.processAsyncResult(result, baseResult, cacheKey);
        } catch (error) {
          this.activeRequests.delete(cacheKey);
          throw error;
        }
      }

      validationPromise = this.executeAsyncValidation(baseResult, options);

      if (this.config.cancelPrevious) {
        this.activeRequests.set(cacheKey, validationPromise);
      }
    }

    try {
      const result = await validationPromise;
      const processedResult = this.processAsyncResult(result, baseResult, cacheKey);

      // Emit async complete event for success
      this.emitAsyncCompleteEvent(startTime, true, false);

      return processedResult;
    } catch (error) {
      // Handle debounce cancellation gracefully
      if (error instanceof Error && error.message.includes('Debounced')) {
        // Emit async complete event for cancellation
        this.emitAsyncCompleteEvent(startTime, false, true);
        throw new ValidationError([{
          code: 'debounce_cancelled',
          path: [],
          message: 'Validation was cancelled due to newer input'
        }]);
      }

      // Emit async complete event for failure
      this.emitAsyncCompleteEvent(startTime, false, false);
      throw error;
    } finally {
      if (this.config.cancelPrevious && !debounceDelay) {
        this.activeRequests.delete(cacheKey);
      }
    }
  }

  private async executeAsyncValidation(
    value: T['_output'],
    options?: AsyncValidationOptions
  ): Promise<boolean> {
    const controller = new AbortController();
    const timeoutMs = options?.timeout || this.config.timeout || 5000;

    // Set up timeout
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Add signal to context
      const ctx = { signal: controller.signal };

      // Execute with retries if configured
      const maxRetries = this.config.retries || 0;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (controller.signal.aborted) {
            throw new Error('Validation aborted');
          }

          const result = await this.predicate(value, ctx);
          clearTimeout(timeoutId);
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          if (attempt < maxRetries && !controller.signal.aborted) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
            continue;
          }

          throw lastError;
        }
      }

      throw lastError || new Error('Async validation failed');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private processAsyncResult(
    result: boolean,
    baseResult: T['_output'],
    cacheKey: string
  ): T['_output'] {
    // Cache result if enabled
    if (this.config.cache) {
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
      this.cleanupCache();
    }

    if (!result) {
      throw new ValidationError([{
        code: 'custom',
        path: [],
        message: this.config.message || 'Async refinement failed'
      }]);
    }

    return baseResult;
  }

  private isValidCacheEntry(key: string): boolean {
    if (!this.config.cache) return false;

    const entry = this.cache.get(key);
    if (!entry) return false;

    const cacheConfig = typeof this.config.cache === 'object' ? this.config.cache : {};
    const ttl = cacheConfig.ttl || 300000; // 5 minutes default

    return Date.now() - entry.timestamp < ttl;
  }

  private cleanupCache(): void {
    if (!this.config.cache || typeof this.config.cache !== 'object') return;

    const cacheConfig = this.config.cache;
    const maxSize = cacheConfig.maxSize || 1000;
    const ttl = cacheConfig.ttl || 300000;
    const now = Date.now();

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > ttl) {
        this.cache.delete(key);
      }
    }

    // Enforce max size
    if (this.cache.size > maxSize) {
      const entries = Array.from(this.cache.entries());
      const strategy = cacheConfig.strategy || 'lru';

      if (strategy === 'lru') {
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      }

      const toRemove = this.cache.size - maxSize;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  // Clear cache manually
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats for monitoring
  getCacheStats(): { hits: number; misses: number; size: number } {
    // This is a simplified version - in production you'd track hits/misses
    return {
      hits: 0, // Would need to track this
      misses: 0, // Would need to track this
      size: this.cache.size
    };
  }

  // Debounce management methods
  cancelPendingValidations(): void {
    // Cancel debounced functions
    if (this.debouncedFunction) {
      this.debouncedFunction.cancel();
    }

    // Cancel any specific debounced functions in global manager
    globalDebounceManager.cleanup(`${this.schemaId}_${this.config.debounce}`);

    // Cancel active requests
    for (const [key, promise] of this.activeRequests.entries()) {
      // We can't actually cancel the promise, but we can remove it from tracking
      this.activeRequests.delete(key);
    }
  }

  // Check if there are pending validations
  hasPendingValidations(): boolean {
    if (this.debouncedFunction && this.debouncedFunction.isRunning()) {
      return true;
    }
    return this.activeRequests.size > 0;
  }

  // Get debounce stats
  getDebounceStats(): { isDebouncing: boolean; activeRequests: number; cacheSize: number } {
    return {
      isDebouncing: this.debouncedFunction ? this.debouncedFunction.isRunning() : false,
      activeRequests: this.activeRequests.size,
      cacheSize: this.cache.size
    };
  }

  // Cleanup method for proper disposal
  dispose(): void {
    this.cancelPendingValidations();
    this.clearCache();
  }
}

// Batch validation interfaces and types
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

// Batch validator class for efficient concurrent validation
export class BatchValidator {
  private defaultOptions: BatchValidationOptions = {
    maxConcurrency: 5,
    stopOnFirstError: false,
    timeout: 10000
  };

  constructor(options?: Partial<BatchValidationOptions>) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async validateAsync<T extends any[]>(
    items: { [K in keyof T]: BatchValidationItem<T[K]> },
    options?: BatchValidationOptions
  ): Promise<{ [K in keyof T]: BatchValidationResult<T[K]> }>;
  async validateAsync(
    items: BatchValidationItem[],
    options?: BatchValidationOptions
  ): Promise<BatchValidationResult[]>;
  async validateAsync(
    items: BatchValidationItem[] | any,
    options?: BatchValidationOptions
  ): Promise<BatchValidationResult[] | any> {
    const finalOptions = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    const batchId = this.generateBatchId();

    // Emit batch start event
    const batchStartEvent: BatchValidationStartEvent = {
      type: 'batch:start',
      schemaType: 'batch',
      data: null,
      timestamp: startTime,
      id: batchId,
      itemCount: items.length,
      maxConcurrency: finalOptions.maxConcurrency || 5,
      batchId
    };

    globalValidationMonitor.emit(batchStartEvent);

    // Handle AbortController timeout
    const controller = new AbortController();
    const timeoutId = finalOptions.timeout ? setTimeout(() => {
      controller.abort();
    }, finalOptions.timeout) : null;

    // Combine external abort signal with timeout signal
    if (finalOptions.abortSignal) {
      finalOptions.abortSignal.addEventListener('abort', () => {
        controller.abort();
      });
    }

    try {
      const results = await this.processBatch(items, finalOptions, controller.signal, batchId);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Emit batch complete event
      const duration = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;
      const avgItemDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;

      const batchCompleteEvent: BatchValidationCompleteEvent = {
        type: 'batch:complete',
        schemaType: 'batch',
        data: null,
        timestamp: startTime,
        id: batchId,
        batchId,
        successful,
        failed,
        duration,
        avgItemDuration
      };

      globalValidationMonitor.emit(batchCompleteEvent);

      return results;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Emit batch complete event for error case
      const duration = Date.now() - startTime;
      const batchCompleteEvent: BatchValidationCompleteEvent = {
        type: 'batch:complete',
        schemaType: 'batch',
        data: null,
        timestamp: startTime,
        id: batchId,
        batchId,
        successful: 0,
        failed: items.length,
        duration,
        avgItemDuration: 0
      };

      globalValidationMonitor.emit(batchCompleteEvent);
      throw error;
    }
  }

  private async processBatch(
    items: BatchValidationItem[],
    options: BatchValidationOptions,
    abortSignal: AbortSignal,
    batchId: string
  ): Promise<BatchValidationResult[]> {
    const results: BatchValidationResult[] = new Array(items.length);
    const maxConcurrency = options.maxConcurrency || 5;

    // Create a semaphore for concurrency control
    const semaphore = new Array(maxConcurrency).fill(null);
    let index = 0;

    // Process items with controlled concurrency
    const processItem = async (itemIndex: number): Promise<void> => {
      if (abortSignal.aborted) {
        throw new Error('Batch validation aborted');
      }

      const item = items[itemIndex];
      const itemStartTime = Date.now();

      try {
        // Validate the item with the provided schema
        let result: any;
        if (item.schema._validateAsync) {
          result = await item.schema._validateAsync(item.data);
        } else {
          result = item.schema._validate(item.data);
        }

        const duration = Date.now() - itemStartTime;
        results[itemIndex] = {
          success: true,
          data: result,
          id: item.id,
          duration
        };

        // Emit batch item event for success
        globalValidationMonitor.emit({
          type: 'batch:item',
          schemaType: 'batch',
          data: item.data,
          timestamp: itemStartTime,
          id: `${batchId}_item_${itemIndex}`,
          batchId,
          itemIndex,
          itemId: item.id,
          success: true,
          duration
        });

      } catch (error) {
        const duration = Date.now() - itemStartTime;
        const validationError = error instanceof ValidationError
          ? error
          : new ValidationError([{
              code: 'unknown',
              path: [],
              message: error instanceof Error ? error.message : 'Unknown validation error'
            }]);

        results[itemIndex] = {
          success: false,
          error: validationError,
          id: item.id,
          duration
        };

        // Emit batch item event for failure
        globalValidationMonitor.emit({
          type: 'batch:item',
          schemaType: 'batch',
          data: item.data,
          timestamp: itemStartTime,
          id: `${batchId}_item_${itemIndex}`,
          batchId,
          itemIndex,
          itemId: item.id,
          success: false,
          duration
        });

        // Stop on first error if configured
        if (options.stopOnFirstError) {
          throw validationError;
        }
      }
    };

    // Create worker promises that process items from the queue
    const workers = semaphore.map(async () => {
      while (index < items.length && !abortSignal.aborted) {
        const currentIndex = index++;
        if (currentIndex < items.length) {
          await processItem(currentIndex);
        }
      }
    });

    // Wait for all workers to complete
    await Promise.all(workers);

    if (abortSignal.aborted) {
      throw new Error('Batch validation aborted');
    }

    return results;
  }

  async validateMixed(
    items: Array<{ schema: Schema<any>; data: unknown; id?: string | number }>
  ): Promise<BatchValidationResult[]> {
    return this.validateAsync(items);
  }

  getStats(results: BatchValidationResult[]): BatchValidationStats {
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

    return {
      total: results.length,
      successful,
      failed,
      duration: totalDuration,
      avgItemDuration: totalDuration / results.length,
      maxConcurrency: this.defaultOptions.maxConcurrency || 5
    };
  }

  // Utility method to create batches from arrays of data
  static createBatch<T>(
    schema: Schema<T>,
    dataArray: unknown[],
    idGenerator?: (index: number, data: unknown) => string | number
  ): BatchValidationItem<T>[] {
    return dataArray.map((data, index) => ({
      schema,
      data,
      id: idGenerator ? idGenerator(index, data) : index
    }));
  }

  // Utility method to group results by success/failure
  static groupResults(results: BatchValidationResult[]): {
    successful: Array<{ data: any; id?: string | number; duration?: number }>;
    failed: Array<{ error: ValidationError; id?: string | number; duration?: number }>;
  } {
    const successful: Array<{ data: any; id?: string | number; duration?: number }> = [];
    const failed: Array<{ error: ValidationError; id?: string | number; duration?: number }> = [];

    for (const result of results) {
      if (result.success) {
        successful.push({
          data: result.data,
          id: result.id,
          duration: result.duration
        });
      } else {
        failed.push({
          error: result.error!,
          id: result.id,
          duration: result.duration
        });
      }
    }

    return { successful, failed };
  }
}

// Global validation monitoring system
export class ValidationMonitor extends ValidationEventEmitter {
  private validationCount: number = 0;
  private asyncValidationCount: number = 0;
  private batchValidationCount: number = 0;
  private errorCount: number = 0;
  private totalDuration: number = 0;
  private performanceMetrics: Map<string, { values: number[]; timestamps: number[] }> = new Map();

  constructor() {
    super();

    // Auto-collect basic statistics
    this.on('*', (event) => {
      this.collectStatistics(event);
    });
  }

  private collectStatistics(event: ValidationEvent): void {
    switch (event.type) {
      case 'validation:start':
        if (event.async) {
          this.asyncValidationCount++;
        } else {
          this.validationCount++;
        }
        break;

      case 'validation:error':
        this.errorCount++;
        this.totalDuration += event.duration;
        break;

      case 'validation:success':
        this.totalDuration += event.duration;
        break;

      case 'batch:start':
        this.batchValidationCount++;
        break;

      case 'performance':
        this.recordPerformanceMetric(event.metric, event.value, event.timestamp);
        break;
    }
  }

  private recordPerformanceMetric(metric: string, value: number, timestamp: number): void {
    if (!this.performanceMetrics.has(metric)) {
      this.performanceMetrics.set(metric, { values: [], timestamps: [] });
    }

    const data = this.performanceMetrics.get(metric)!;
    data.values.push(value);
    data.timestamps.push(timestamp);

    // Keep only last 1000 measurements to prevent memory leaks
    if (data.values.length > 1000) {
      data.values.shift();
      data.timestamps.shift();
    }
  }

  // Statistics getters
  getStatistics(): {
    validationCount: number;
    asyncValidationCount: number;
    batchValidationCount: number;
    errorCount: number;
    totalDuration: number;
    averageDuration: number;
    errorRate: number;
  } {
    const totalValidations = this.validationCount + this.asyncValidationCount;
    return {
      validationCount: this.validationCount,
      asyncValidationCount: this.asyncValidationCount,
      batchValidationCount: this.batchValidationCount,
      errorCount: this.errorCount,
      totalDuration: this.totalDuration,
      averageDuration: totalValidations > 0 ? this.totalDuration / totalValidations : 0,
      errorRate: totalValidations > 0 ? this.errorCount / totalValidations : 0
    };
  }

  getPerformanceMetrics(): Record<string, {
    current: number;
    average: number;
    min: number;
    max: number;
    count: number
  }> {
    const metrics: Record<string, any> = {};

    for (const [metricName, data] of this.performanceMetrics.entries()) {
      if (data.values.length > 0) {
        const values = data.values;
        metrics[metricName] = {
          current: values[values.length - 1],
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    }

    return metrics;
  }

  // Real-time monitoring methods
  startPerformanceMonitoring(intervalMs: number = 5000): () => void {
    const interval = setInterval(() => {
      const stats = this.getStatistics();
      this.emit({
        type: 'performance',
        schemaType: 'monitor',
        data: null,
        timestamp: Date.now(),
        id: 'global-monitor',
        metric: 'monitoring.interval',
        value: intervalMs,
        unit: 'ms',
        context: { stats }
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }

  // Reset statistics
  resetStatistics(): void {
    this.validationCount = 0;
    this.asyncValidationCount = 0;
    this.batchValidationCount = 0;
    this.errorCount = 0;
    this.totalDuration = 0;
    this.performanceMetrics.clear();
  }

  // Event filtering helpers
  onValidationSuccess(listener: (event: ValidationSuccessEvent) => void): this {
    return this.on('validation:success', listener);
  }

  onValidationError(listener: (event: ValidationErrorEvent) => void): this {
    return this.on('validation:error', listener);
  }

  onAsyncStart(listener: (event: AsyncValidationStartEvent) => void): this {
    return this.on('async:start', listener);
  }

  onAsyncComplete(listener: (event: AsyncValidationCompleteEvent) => void): this {
    return this.on('async:complete', listener);
  }

  onBatchStart(listener: (event: BatchValidationStartEvent) => void): this {
    return this.on('batch:start', listener);
  }

  onBatchComplete(listener: (event: BatchValidationCompleteEvent) => void): this {
    return this.on('batch:complete', listener);
  }

  onPerformance(listener: (event: PerformanceEvent) => void): this {
    return this.on('performance', listener);
  }

  onDebug(listener: (event: DebugEvent) => void): this {
    return this.on('debug', listener);
  }

  // Advanced filtering
  onSchemaType(schemaType: string, listener: ValidationEventListener): this {
    return this.on('*', (event) => {
      if (event.schemaType === schemaType) {
        listener(event);
      }
    });
  }

  onErrorsOnly(listener: ValidationEventListener): this {
    return this.on('*', (event) => {
      if (event.type === 'validation:error' || event.type === 'debug' && (event as DebugEvent).level === 'error') {
        listener(event);
      }
    });
  }

  // Debug helpers
  enableDebugMode(): void {
    this.on('*', (event) => {
      console.log(`[FastSchema Debug] ${event.type}:`, event);
    });
  }

  createEventLogger(prefix: string = '[FastSchema]'): ValidationEventListener {
    return (event: ValidationEvent) => {
      const timestamp = new Date(event.timestamp).toISOString();
      console.log(`${prefix} [${timestamp}] ${event.type}:`, event);
    };
  }
}

// Global instance
export const globalValidationMonitor = new ValidationMonitor();

// Debouncing utility for async validation
class DebouncedAsyncFunction<T extends any[], R> {
  private timeoutId: NodeJS.Timeout | null = null;
  private lastPromise: Promise<R> | null = null;
  private lastResolve: ((value: R) => void) | null = null;
  private lastReject: ((reason: any) => void) | null = null;

  constructor(
    private fn: (...args: T) => Promise<R>,
    private delay: number
  ) {}

  async execute(...args: T): Promise<R> {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // If there's a pending promise, we'll reuse its structure
    if (this.lastPromise && this.lastResolve && this.lastReject) {
      // Cancel the previous execution by rejecting it
      this.lastReject(new Error('Debounced: newer call received'));
    }

    // Create new promise
    return new Promise<R>((resolve, reject) => {
      this.lastResolve = resolve;
      this.lastReject = reject;

      this.timeoutId = setTimeout(async () => {
        try {
          const result = await this.fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.lastPromise = null;
          this.lastResolve = null;
          this.lastReject = null;
          this.timeoutId = null;
        }
      }, this.delay);
    });
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.lastReject) {
      this.lastReject(new Error('Debounced function cancelled'));
      this.lastPromise = null;
      this.lastResolve = null;
      this.lastReject = null;
    }
  }

  isRunning(): boolean {
    return this.timeoutId !== null;
  }
}

// Global debounce manager for validation functions
class ValidationDebounceManager {
  private debouncedFunctions = new Map<string, DebouncedAsyncFunction<any, any>>();

  getDebouncedFunction<T extends any[], R>(
    key: string,
    fn: (...args: T) => Promise<R>,
    delay: number
  ): DebouncedAsyncFunction<T, R> {
    if (!this.debouncedFunctions.has(key)) {
      this.debouncedFunctions.set(key, new DebouncedAsyncFunction(fn, delay));
    }
    return this.debouncedFunctions.get(key)!;
  }

  cancelAll(): void {
    for (const debouncedFn of this.debouncedFunctions.values()) {
      debouncedFn.cancel();
    }
  }

  cleanup(key: string): void {
    const debouncedFn = this.debouncedFunctions.get(key);
    if (debouncedFn) {
      debouncedFn.cancel();
      this.debouncedFunctions.delete(key);
    }
  }

  getStats(): { active: number; total: number } {
    let active = 0;
    for (const debouncedFn of this.debouncedFunctions.values()) {
      if (debouncedFn.isRunning()) {
        active++;
      }
    }
    return {
      active,
      total: this.debouncedFunctions.size
    };
  }
}

// Global instance
const globalDebounceManager = new ValidationDebounceManager();

// Export debounce utilities for external use
export {
  DebouncedAsyncFunction,
  ValidationDebounceManager,
  globalDebounceManager
};

// Utility functions for debouncing
export function createDebouncedValidator<T>(
  validator: (value: T) => Promise<boolean>,
  delay: number
): (value: T) => Promise<boolean> {
  const debouncedFn = new DebouncedAsyncFunction(validator, delay);
  return (value: T) => debouncedFn.execute(value);
}

export function debounceAsyncFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  delay: number
): (...args: T) => Promise<R> {
  const debouncedFn = new DebouncedAsyncFunction(fn, delay);
  return (...args: T) => debouncedFn.execute(...args);
}

// Performance optimization utilities
class RegexCache {
  private static cache = new Map<string, RegExp>();
  private static maxSize = 100; // Prevent memory leaks

  static get(pattern: string, flags?: string): RegExp {
    const key = flags ? `${pattern}:${flags}` : pattern;

    if (!this.cache.has(key)) {
      if (this.cache.size >= this.maxSize) {
        // Remove oldest entry (simple LRU)
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(key, new RegExp(pattern, flags));
    }

    return this.cache.get(key)!;
  }

  static clear(): void {
    this.cache.clear();
  }

  static getStats(): { size: number; maxSize: number } {
    return { size: this.cache.size, maxSize: this.maxSize };
  }
}

class SchemaCache {
  private static compiledSchemas = new Map<string, any>();
  private static maxSize = 500;

  static get(schemaHash: string): any {
    return this.compiledSchemas.get(schemaHash);
  }

  static set(schemaHash: string, compiledSchema: any): void {
    if (this.compiledSchemas.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.compiledSchemas.keys().next().value;
      this.compiledSchemas.delete(firstKey);
    }
    this.compiledSchemas.set(schemaHash, compiledSchema);
  }

  static has(schemaHash: string): boolean {
    return this.compiledSchemas.has(schemaHash);
  }

  static clear(): void {
    this.compiledSchemas.clear();
  }

  static getStats(): { size: number; maxSize: number } {
    return { size: this.compiledSchemas.size, maxSize: this.maxSize };
  }
}

class ValidationPool {
  private static resultPool: any[] = [];
  private static errorPool: ValidationError[] = [];
  private static maxPoolSize = 50;

  static getResult(): { success: boolean; data?: any; error?: ValidationError } {
    return this.resultPool.pop() || { success: false };
  }

  static returnResult(result: any): void {
    if (this.resultPool.length < this.maxPoolSize) {
      // Reset result for reuse
      result.success = false;
      result.data = undefined;
      result.error = undefined;
      this.resultPool.push(result);
    }
  }

  static getError(): ValidationError {
    return this.errorPool.pop() || new ValidationError([]);
  }

  static returnError(error: ValidationError): void {
    if (this.errorPool.length < this.maxPoolSize) {
      // Reset error for reuse
      error.issues = [];
      this.errorPool.push(error);
    }
  }

  static clear(): void {
    this.resultPool = [];
    this.errorPool = [];
  }

  static getStats(): { resultPool: number; errorPool: number; maxSize: number } {
    return {
      resultPool: this.resultPool.length,
      errorPool: this.errorPool.length,
      maxSize: this.maxPoolSize
    };
  }
}

// Validation helper functions with optimized regex
function isValidEmail(email: string): boolean {
  const regex = RegexCache.get('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
  return regex.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidUuid(uuid: string): boolean {
  const regex = RegexCache.get('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');
  return regex.test(uuid);
}

// Extended string format validation functions with optimized regex
function isValidIPv4(ip: string): boolean {
  const regex = RegexCache.get('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
  return regex.test(ip);
}

function isValidIPv6(ip: string): boolean {
  const regex = RegexCache.get('^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$');
  return regex.test(ip);
}

function isValidPhone(phone: string): boolean {
  // International phone number format (E.164) - supports various formats
  const regex = RegexCache.get('^\\+?[1-9]\\d{1,14}$|^(\\+?\\d{1,3}[-\\.\\s]?)?\\(?\\d{1,4}\\)?[-\\.\\s]?\\d{1,4}[-\\.\\s]?\\d{1,9}$');
  const cleanPhone = phone.replace(/[-.\s()]/g, '');
  return regex.test(cleanPhone) && cleanPhone.length >= 7 && cleanPhone.length <= 15;
}

function isValidJWT(token: string): boolean {
  // JWT format: header.payload.signature (base64url encoded)
  const jwtRegex = RegexCache.get('^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$');
  if (!jwtRegex.test(token)) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // Validate each part is valid base64url
  const base64urlRegex = RegexCache.get('^[A-Za-z0-9_-]+$');
  for (const part of parts) {
    if (part.length === 0) return false;
    if (!base64urlRegex.test(part)) return false;
  }

  return true;
}

function isValidBase64(str: string): boolean {
  // Base64 regex with optional padding
  const regex = RegexCache.get('^[A-Za-z0-9+/]*={0,2}$');
  if (!regex.test(str)) return false;

  // Check length is multiple of 4 when padded
  const paddedLength = str.length + (str.match(/=/g) || []).length;
  return paddedLength % 4 === 0;
}

function isValidHex(str: string): boolean {
  // Hexadecimal string (with or without 0x prefix)
  const regex = RegexCache.get('^(0x)?[0-9a-fA-F]+$');
  return regex.test(str);
}

function isValidCreditCard(number: string): boolean {
  // Remove spaces and dashes
  const cleanNumber = number.replace(/[-\s]/g, '');

  // Check if it's all digits and appropriate length
  const digitRegex = RegexCache.get('^\\d{13,19}$');
  if (!digitRegex.test(cleanNumber)) return false;

  // Luhn algorithm validation
  let sum = 0;
  let shouldDouble = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function isValidMacAddress(mac: string): boolean {
  // MAC address formats: xx:xx:xx:xx:xx:xx or xx-xx-xx-xx-xx-xx
  const regex = RegexCache.get('^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$');
  return regex.test(mac);
}

function isValidColor(color: string): boolean {
  // Hex color: #RGB, #RRGGBB, #RRGGBBAA
  const hexColorRegex = RegexCache.get('^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$');
  if (hexColorRegex.test(color)) return true;

  // CSS named colors (basic set) - cached as static for performance
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
    'silver', 'gray', 'maroon', 'olive', 'lime', 'aqua', 'teal', 'navy',
    'fuchsia', 'purple', 'orange', 'transparent'
  ];

  if (namedColors.includes(color.toLowerCase())) return true;

  // RGB/RGBA format
  const rgbRegex = RegexCache.get('^rgba?\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*(,\\s*[0-1]?\\.?\\d+)?\\s*\\)$');
  return rgbRegex.test(color);
}

function isValidSlug(slug: string): boolean {
  // URL-friendly slug: lowercase letters, numbers, hyphens
  const regex = RegexCache.get('^[a-z0-9]+(?:-[a-z0-9]+)*$');
  return regex.test(slug);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Schema composition utility functions
function makeDeepPartial<T extends Schema<any>>(schema: T): DeepPartialSchema<T> {
  if (schema instanceof ObjectSchema) {
    const shape = schema.getShape();
    const deepPartialShape: any = {};
    for (const [key, subSchema] of Object.entries(shape)) {
      deepPartialShape[key] = makeDeepPartial(subSchema as Schema<any>).optional();
    }
    return new ObjectSchema(deepPartialShape) as DeepPartialSchema<T>;
  } else if (schema instanceof ArraySchema) {
    const itemSchema = (schema as any).itemSchema;
    return new ArraySchema(makeDeepPartial(itemSchema)) as DeepPartialSchema<T>;
  } else {
    return schema.optional() as DeepPartialSchema<T>;
  }
}

// WASM initialization
let wasmInitialized = false;

async function ensureWasmLoaded(): Promise<void> {
  if (!wasmInitialized) {
    try {
      await init();
      wasmInitialized = true;
    } catch (error) {
      console.warn('WASM module failed to load, falling back to pure JavaScript');
    }
  }
}

// Initialize WASM on module load
ensureWasmLoaded().catch(() => {
  // Silently fail - we'll use pure JavaScript fallback
});

// =============================================================================
// ADVANCED VALIDATION FEATURES
// =============================================================================

// Conditional validation types and interfaces
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

// Conditional validation schema
export class ConditionalSchema<T> extends Schema<T> {
  private rules: ConditionalValidationRule<T>[] = [];
  private defaultSchema?: Schema<T>;

  constructor(defaultSchema?: Schema<T>) {
    super({ type: 'conditional' });
    this.defaultSchema = defaultSchema;
  }

  when<U>(
    condition: (data: T) => boolean,
    schema: Schema<U>,
    message?: string
  ): ConditionalSchema<T | U> {
    this.rules.push({ condition, schema, message });
    return this as any;
  }

  otherwise<U>(schema: Schema<U>): ConditionalSchema<T | U> {
    this.defaultSchema = schema as any;
    return this as any;
  }

  protected _validate(data: unknown, context?: ValidationContext): T {
    // Try each conditional rule
    for (const rule of this.rules) {
      try {
        if (rule.condition(data as T)) {
          return rule.schema._validate(data, context);
        }
      } catch (error) {
        if (rule.message) {
          throw new ValidationError([{
            code: 'conditional_validation_failed',
            path: context?.path || [],
            message: rule.message
          }]);
        }
        throw error;
      }
    }

    // Fall back to default schema
    if (this.defaultSchema) {
      return this.defaultSchema._validate(data, context);
    }

    // No matching condition and no default
    throw new ValidationError([{
      code: 'no_matching_condition',
      path: context?.path || [],
      message: 'No conditional validation rule matched'
    }]);
  }
}

// Custom validation schema
export class CustomValidationSchema<T> extends Schema<T> {
  private customValidators: CustomValidatorConfig<T>[] = [];

  constructor(baseSchema?: Schema<T>) {
    super({ type: 'custom_validation' });
    if (baseSchema) {
      this.baseSchema = baseSchema;
    }
  }

  private baseSchema?: Schema<T>;

  addValidator(config: CustomValidatorConfig<T>): this {
    this.customValidators.push(config);
    return this;
  }

  validator(
    fn: CustomValidatorFunction<T>,
    message?: string,
    code?: string
  ): this {
    return this.addValidator({
      validator: fn,
      message,
      code
    });
  }

  protected _validate(data: unknown, context?: ValidationContext): T {
    // First validate with base schema if present
    let validatedData: T;
    if (this.baseSchema) {
      validatedData = this.baseSchema._validate(data, context);
    } else {
      validatedData = data as T;
    }

    // Apply custom validators
    for (const config of this.customValidators) {
      const result = config.validator(validatedData, context || {
        path: [],
        data: validatedData,
        root: validatedData
      });

      if (result === false) {
        throw new ValidationError([{
          code: config.code || 'custom_validation_failed',
          path: context?.path || [],
          message: config.message || 'Custom validation failed'
        }]);
      }

      if (typeof result === 'string') {
        throw new ValidationError([{
          code: config.code || 'custom_validation_failed',
          path: context?.path || [],
          message: result
        }]);
      }

      if (Array.isArray(result)) {
        throw new ValidationError(result);
      }
    }

    return validatedData;
  }
}

// Dynamic schema generation
export interface SchemaGenerator<T> {
  (context: ValidationContext): Schema<T>;
}

export class DynamicSchema<T> extends Schema<T> {
  private generator: SchemaGenerator<T>;
  private schemaCache = new Map<string, Schema<T>>();

  constructor(generator: SchemaGenerator<T>) {
    super({ type: 'dynamic' });
    this.generator = generator;
  }

  protected _validate(data: unknown, context?: ValidationContext): T {
    const ctx = context || {
      path: [],
      data,
      root: data
    };

    // Generate cache key based on context
    const cacheKey = this.generateCacheKey(ctx);

    let schema = this.schemaCache.get(cacheKey);
    if (!schema) {
      schema = this.generator(ctx);
      this.schemaCache.set(cacheKey, schema);
    }

    return schema._validate(data, ctx);
  }

  private generateCacheKey(context: ValidationContext): string {
    return JSON.stringify({
      path: context.path,
      hasParent: !!context.parent,
      metadata: context.metadata
    });
  }

  clearCache(): void {
    this.schemaCache.clear();
  }
}

// Schema introspection and metadata
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

export class IntrospectableSchema<T> extends Schema<T> {
  private metadata: SchemaMetadata;
  private baseSchema: Schema<T>;

  constructor(baseSchema: Schema<T>, metadata: Partial<SchemaMetadata> = {}) {
    super({ type: 'introspectable' });
    this.baseSchema = baseSchema;
    this.metadata = {
      type: baseSchema.getSchema().type,
      ...metadata
    };
  }

  getMetadata(): SchemaMetadata {
    return { ...this.metadata };
  }

  setMetadata(metadata: Partial<SchemaMetadata>): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  describe(description: string): this {
    this.metadata.description = description;
    return this;
  }

  example(example: any): this {
    if (!this.metadata.examples) {
      this.metadata.examples = [];
    }
    this.metadata.examples.push(example);
    return this;
  }

  tag(...tags: string[]): this {
    if (!this.metadata.tags) {
      this.metadata.tags = [];
    }
    this.metadata.tags.push(...tags);
    return this;
  }

  deprecate(reason?: string): this {
    this.metadata.deprecated = true;
    if (reason) {
      this.metadata.custom = { ...this.metadata.custom, deprecationReason: reason };
    }
    return this;
  }

  version(version: string): this {
    this.metadata.version = version;
    return this;
  }

  // Introspection methods
  getType(): string {
    return this.metadata.type;
  }

  getShape(): any {
    if (this.baseSchema instanceof ObjectSchema) {
      return this.baseSchema.getShape();
    }
    return null;
  }

  getProperties(): string[] {
    const shape = this.getShape();
    return shape ? Object.keys(shape) : [];
  }

  isOptional(): boolean {
    return this.baseSchema.isOptional();
  }

  isNullable(): boolean {
    return this.baseSchema.isNullable();
  }

  getConstraints(): any {
    return this.baseSchema.getSchema();
  }

  protected _validate(data: unknown, context?: ValidationContext): T {
    return this.baseSchema._validate(data, context);
  }
}

// Schema serialization and deserialization
export interface SerializedSchema {
  type: string;
  constraints?: any;
  metadata?: SchemaMetadata;
  shape?: Record<string, SerializedSchema>;
  itemSchema?: SerializedSchema;
  schemas?: SerializedSchema[];
  version: string;
}

export class SchemaSerializer {
  private static readonly VERSION = '1.0.0';

  static serialize(schema: Schema<any>): SerializedSchema {
    const schemaObj = schema.getSchema();
    const result: SerializedSchema = {
      type: schemaObj.type,
      version: this.VERSION
    };

    // Add constraints
    if (Object.keys(schemaObj).length > 1) {
      result.constraints = { ...schemaObj };
      delete result.constraints.type;
    }

    // Add metadata if introspectable
    if (schema instanceof IntrospectableSchema) {
      result.metadata = schema.getMetadata();
    }

    // Handle complex schemas
    if (schema instanceof ObjectSchema) {
      const shape = schema.getShape();
      result.shape = {};
      for (const [key, subSchema] of Object.entries(shape)) {
        result.shape[key] = this.serialize(subSchema);
      }
    } else if (schema instanceof ArraySchema) {
      result.itemSchema = this.serialize((schema as any).itemSchema);
    } else if (schema instanceof UnionSchema) {
      result.schemas = (schema as any).schemas.map((s: Schema<any>) => this.serialize(s));
    }

    return result;
  }

  static deserialize(serialized: SerializedSchema): Schema<any> {
    switch (serialized.type) {
      case 'string':
        return this.deserializeStringSchema(serialized);
      case 'number':
        return this.deserializeNumberSchema(serialized);
      case 'boolean':
        return new BooleanSchema();
      case 'object':
        return this.deserializeObjectSchema(serialized);
      case 'array':
        return this.deserializeArraySchema(serialized);
      case 'union':
        return this.deserializeUnionSchema(serialized);
      default:
        throw new Error(`Unknown schema type: ${serialized.type}`);
    }
  }

  private static deserializeStringSchema(serialized: SerializedSchema): StringSchema {
    const schema = new StringSchema();
    const constraints = serialized.constraints || {};

    if (constraints.minLength !== undefined) {
      schema.min(constraints.minLength);
    }
    if (constraints.maxLength !== undefined) {
      schema.max(constraints.maxLength);
    }
    if (constraints.format) {
      // Apply format validation based on format type
      switch (constraints.format) {
        case 'email':
          schema.email();
          break;
        case 'url':
          schema.url();
          break;
        case 'uuid':
          schema.uuid();
          break;
        // Add more formats as needed
      }
    }

    return schema;
  }

  private static deserializeNumberSchema(serialized: SerializedSchema): NumberSchema {
    const schema = new NumberSchema();
    const constraints = serialized.constraints || {};

    if (constraints.min !== undefined) {
      schema.min(constraints.min);
    }
    if (constraints.max !== undefined) {
      schema.max(constraints.max);
    }
    if (constraints.isInteger) {
      schema.int();
    }

    return schema;
  }

  private static deserializeObjectSchema(serialized: SerializedSchema): ObjectSchema<any> {
    if (!serialized.shape) {
      throw new Error('Object schema missing shape');
    }

    const shape: Record<string, Schema<any>> = {};
    for (const [key, subSerialized] of Object.entries(serialized.shape)) {
      shape[key] = this.deserialize(subSerialized);
    }

    return new ObjectSchema(shape);
  }

  private static deserializeArraySchema(serialized: SerializedSchema): ArraySchema<any> {
    if (!serialized.itemSchema) {
      throw new Error('Array schema missing item schema');
    }

    const itemSchema = this.deserialize(serialized.itemSchema);
    return new ArraySchema(itemSchema);
  }

  private static deserializeUnionSchema(serialized: SerializedSchema): UnionSchema<any> {
    if (!serialized.schemas) {
      throw new Error('Union schema missing schemas');
    }

    const schemas = serialized.schemas.map(s => this.deserialize(s));
    return new UnionSchema(schemas as any);
  }
}

// Schema versioning and migration
export interface SchemaMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (data: any) => any;
  description?: string;
}

export class VersionedSchema<T> extends Schema<T> {
  private currentVersion: string;
  private schemas: Map<string, Schema<T>> = new Map();
  private migrations: SchemaMigration[] = [];

  constructor(version: string, schema: Schema<T>) {
    super({ type: 'versioned' });
    this.currentVersion = version;
    this.schemas.set(version, schema);
  }

  addVersion(version: string, schema: Schema<T>): this {
    this.schemas.set(version, schema);
    return this;
  }

  addMigration(migration: SchemaMigration): this {
    this.migrations.push(migration);
    return this;
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }

  getAvailableVersions(): string[] {
    return Array.from(this.schemas.keys());
  }

  migrate(data: any, fromVersion: string, toVersion?: string): any {
    const targetVersion = toVersion || this.currentVersion;
    if (fromVersion === targetVersion) {
      return data;
    }

    // Find migration path
    const migrationPath = this.findMigrationPath(fromVersion, targetVersion);
    if (!migrationPath) {
      throw new Error(`No migration path from ${fromVersion} to ${targetVersion}`);
    }

    // Apply migrations in sequence
    let migratedData = data;
    for (const migration of migrationPath) {
      migratedData = migration.migrate(migratedData);
    }

    return migratedData;
  }

  private findMigrationPath(from: string, to: string): SchemaMigration[] | null {
    // Simple linear migration path finding
    const path: SchemaMigration[] = [];
    let currentVersion = from;

    while (currentVersion !== to) {
      const migration = this.migrations.find(m => m.fromVersion === currentVersion);
      if (!migration) {
        return null; // No migration path found
      }
      path.push(migration);
      currentVersion = migration.toVersion;
    }

    return path;
  }

  protected _validate(data: unknown, context?: ValidationContext): T {
    const schema = this.schemas.get(this.currentVersion);
    if (!schema) {
      throw new Error(`Schema for version ${this.currentVersion} not found`);
    }
    return schema._validate(data, context);
  }
}

// Advanced error handling and context
export class ValidationErrorWithContext extends ValidationError {
  public context: ValidationContext;

  constructor(issues: ValidationIssue[], context: ValidationContext) {
    super(issues);
    this.context = context;
  }

  getContext(): ValidationContext {
    return this.context;
  }

  getFullPath(): string {
    return this.context.path.join('.');
  }

  getRootData(): any {
    return this.context.root;
  }

  getParentData(): any {
    return this.context.parent;
  }
}

export class ContextualValidator {
  static validateWithContext<T>(
    schema: Schema<T>,
    data: unknown,
    context: Partial<ValidationContext> = {}
  ): T {
    const fullContext: ValidationContext = {
      path: [],
      data,
      root: data,
      ...context
    };

    try {
      return schema._validate(data, fullContext);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationErrorWithContext(error.issues, fullContext);
      }
      throw error;
    }
  }
}

// Utility functions for advanced validation features
export function createConditionalSchema<T>(defaultSchema?: Schema<T>): ConditionalSchema<T> {
  return new ConditionalSchema(defaultSchema);
}

export function createCustomValidator<T>(baseSchema?: Schema<T>): CustomValidationSchema<T> {
  return new CustomValidationSchema(baseSchema);
}

export function createDynamicSchema<T>(generator: SchemaGenerator<T>): DynamicSchema<T> {
  return new DynamicSchema(generator);
}

export function introspect<T>(schema: Schema<T>, metadata?: Partial<SchemaMetadata>): IntrospectableSchema<T> {
  return new IntrospectableSchema(schema, metadata);
}

export function createVersionedSchema<T>(version: string, schema: Schema<T>): VersionedSchema<T> {
  return new VersionedSchema(version, schema);
}