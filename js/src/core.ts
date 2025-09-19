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

// Base schema class
export abstract class Schema<Output = any, Input = Output> {
  readonly _type!: Output;
  readonly _output!: Output;
  readonly _input!: Input;

  protected schemaType: any;

  constructor(schemaType: any) {
    this.schemaType = schemaType;
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
    try {
      const validated = this._validate(data);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error };
      }
      return {
        success: false,
        error: new ValidationError([{
          code: 'custom',
          path: [],
          message: error instanceof Error ? error.message : 'Validation failed'
        }])
      };
    }
  }

  // Async versions for compatibility
  async parseAsync(data: unknown): Promise<Output> {
    return this.parse(data);
  }

  async safeParseAsync(data: unknown): Promise<
    | { success: true; data: Output }
    | { success: false; error: ValidationError }
  > {
    return this.safeParse(data);
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

  partial(): ObjectSchema<T> {
    this.schemaType.required = [];
    return this;
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

// Validation helper functions
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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