// Base types and interfaces
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
}

export class ValidationError extends Error {
  public issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    const message = issues.map(issue =>
      `${issue.path.length > 0 ? issue.path.join('.') + ': ' : ''}${issue.message}`
    ).join('; ');

    super(message);
    this.name = 'ValidationError';
    this.issues = issues;
  }

  format() {
    const formatted: Record<string, any> = {};
    for (const issue of this.issues) {
      const path = issue.path.join('.');
      if (path) {
        formatted[path] = issue.message;
      } else {
        formatted._errors = formatted._errors || [];
        formatted._errors.push(issue.message);
      }
    }
    return formatted;
  }

  flatten() {
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];

    for (const issue of this.issues) {
      if (issue.path.length > 0) {
        const path = issue.path.join('.');
        fieldErrors[path] = fieldErrors[path] || [];
        fieldErrors[path].push(issue.message);
      } else {
        formErrors.push(issue.message);
      }
    }

    return { fieldErrors, formErrors };
  }
}

// Base schema type inference (forward declaration)
export type TypeOf<T> = T extends { _output: infer U } ? U : never;
export type InputOf<T> = T extends { _input: infer U } ? U : never;
export type OutputOf<T> = T extends { _output: infer U } ? U : never;