declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidationError(): R;
            toHaveValidationIssue(expectedCode: string): R;
            toValidateSuccessfully(schema: any): R;
            toValidateWithError(schema: any, expectedCode?: string): R;
        }
    }
}
export declare const measurePerformance: <T>(fn: () => T, name: string) => T;
export declare const measureAsyncPerformance: <T>(fn: () => Promise<T>, name: string) => Promise<T>;
export declare const generateTestData: {
    string: (length?: number) => string;
    number: (min?: number, max?: number) => number;
    boolean: () => boolean;
    array: <T>(generator: () => T, length?: number) => T[];
    object: (properties: Record<string, () => any>) => any;
};
export declare const waitForWasm: (timeout?: number) => Promise<boolean>;
export declare const skipIfNoWasm: () => boolean;
//# sourceMappingURL=test-setup.d.ts.map