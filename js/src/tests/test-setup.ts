// Jest test setup for fast-schema
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Global test configuration
beforeAll(async () => {
  console.log('🚀 Starting fast-schema test suite...');

  // Set up performance monitoring
  if (typeof performance === 'undefined') {
    global.performance = {
      now: () => Date.now()
    } as any;
  }

  // Mock WASM module for tests that don't require it
  const mockWasmModule = {
    FastValidator: class MockFastValidator {
      constructor(schema: string) {}
      validate(data: string) { return '{"success":true,"data":null}'; }
      validate_many(data: string) { return '[{"success":true,"data":null}]'; }
      get_stats() { return '{"complexity":1}'; }
      reset_caches() {}
      get_memory_info() { return '{"usage":0}'; }
    },
    FastBatchValidator: class MockFastBatchValidator {
      constructor(schema: string, batchSize: number) {}
      validate_dataset(data: string) { return '[{"success":true,"data":null}]'; }
      get_batch_stats() { return '{"processed":0}'; }
    },
    UltraFastValidator: class MockUltraFastValidator {
      constructor(type: string, config: string) {}
      validate_batch(data: string) { return '{"results":[],"stats":{}}'; }
    },
    FastSchemaUtils: {
      validate_schema: (schema: string) => '{"valid":true}',
      get_version: () => '{"version":"0.1.0"}',
      analyze_schema_performance: (schema: string) => '{"complexity":1}'
    }
  };

  // Make mock available globally for tests that need it
  (global as any).mockWasmModule = mockWasmModule;
});

afterAll(() => {
  console.log('✅ fast-schema test suite completed');
});

beforeEach(() => {
  // Reset any global state before each test
  if (typeof global.gc === 'function') {
    global.gc();
  }
});

afterEach(() => {
  // Clean up after each test
  // Reset any caches or global state
});

// Custom matchers for validation testing
expect.extend({
  toBeValidationError(received) {
    const pass = received instanceof Error &&
                 received.name === 'ValidationError' &&
                 Array.isArray((received as any).issues);

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a ValidationError`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a ValidationError with issues array`,
        pass: false,
      };
    }
  },

  toHaveValidationIssue(received, expectedCode) {
    if (!(received instanceof Error) || !(received as any).issues) {
      return {
        message: () => `Expected ${received} to be a ValidationError`,
        pass: false,
      };
    }

    const issues = (received as any).issues;
    const hasIssue = issues.some((issue: any) => issue.code === expectedCode);

    if (hasIssue) {
      return {
        message: () => `Expected ValidationError not to have issue with code "${expectedCode}"`,
        pass: true,
      };
    } else {
      const issueCodes = issues.map((issue: any) => issue.code);
      return {
        message: () => `Expected ValidationError to have issue with code "${expectedCode}". Found codes: ${issueCodes.join(', ')}`,
        pass: false,
      };
    }
  },

  toValidateSuccessfully(received, schema) {
    try {
      const result = schema.parse(received);
      return {
        message: () => `Expected data not to validate successfully`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Expected data to validate successfully, but got error: ${error.message}`,
        pass: false,
      };
    }
  },

  toValidateWithError(received, schema, expectedCode?) {
    try {
      schema.parse(received);
      return {
        message: () => `Expected data to fail validation`,
        pass: false,
      };
    } catch (error) {
      if (expectedCode) {
        const hasExpectedCode = (error as any).issues?.some((issue: any) => issue.code === expectedCode);
        if (!hasExpectedCode) {
          return {
            message: () => `Expected validation to fail with code "${expectedCode}"`,
            pass: false,
          };
        }
      }
      return {
        message: () => `Expected data not to fail validation`,
        pass: true,
      };
    }
  }
});

// Declare custom matchers for TypeScript
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

// Performance monitoring helpers
export const measurePerformance = <T>(fn: () => T, name: string): T => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (duration > 100) {
    console.warn(`⚠️ Slow test operation: ${name} took ${duration.toFixed(2)}ms`);
  }

  return result;
};

export const measureAsyncPerformance = async <T>(fn: () => Promise<T>, name: string): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (duration > 100) {
    console.warn(`⚠️ Slow async test operation: ${name} took ${duration.toFixed(2)}ms`);
  }

  return result;
};

// Test data generators
export const generateTestData = {
  string: (length: number = 10) => 'a'.repeat(length),
  number: (min: number = 0, max: number = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
  boolean: () => Math.random() > 0.5,
  array: <T>(generator: () => T, length: number = 5) => Array.from({ length }, generator),
  object: (properties: Record<string, () => any>) => {
    const result: any = {};
    for (const [key, generator] of Object.entries(properties)) {
      result[key] = generator();
    }
    return result;
  }
};

// Async test helpers
export const waitForWasm = async (timeout: number = 5000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    // Check if WASM is available
    try {
      const { z } = await import('../index');
      if (z.wasm.isAvailable()) {
        return true;
      }
    } catch {
      // Continue waiting
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return false;
};

export const skipIfNoWasm = () => {
  const { z } = require('../index');
  if (!z.wasm.isAvailable()) {
    console.log('⏭️ Skipping WASM test - WASM module not available');
    return true;
  }
  return false;
};