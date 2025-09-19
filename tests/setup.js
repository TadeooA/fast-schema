// Jest setup file for fast-schema tests

// Mock WASM module since it won't be built during testing
jest.mock('../pkg/fast_schema', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
  FastValidator: jest.fn().mockImplementation(() => ({
    validate: jest.fn().mockReturnValue('{"success": true, "data": null, "errors": []}'),
    validate_many: jest.fn().mockReturnValue('[{"success": true, "data": null, "errors": []}]'),
    get_stats: jest.fn().mockReturnValue('{"validations": 0}'),
    reset_caches: jest.fn(),
  })),
  FastBatchValidator: jest.fn().mockImplementation(() => ({
    validate_dataset: jest.fn().mockReturnValue('[{"success": true, "data": null, "errors": []}]'),
    get_batch_stats: jest.fn().mockReturnValue('{"batches": 0}'),
  })),
  FastSchemaUtils: {
    validate_schema: jest.fn().mockReturnValue('{"valid": true, "message": "Valid schema"}'),
    get_version: jest.fn().mockReturnValue('{"version": "0.1.0", "name": "fast-schema", "description": "Test"}'),
    analyze_schema_performance: jest.fn().mockReturnValue('{"complexity": 1, "max_depth": 1, "has_patterns": false, "estimated_validation_time_us": 10, "recommendations": []}'),
  },
}));

// Set up performance.now() for Node.js environments that might not have it
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
  };
}

// Global test timeout
jest.setTimeout(10000);

// Console settings for cleaner test output
if (process.env.NODE_ENV === 'test') {
  // Suppress console.warn about WASM module loading in tests
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && args[0].includes('WASM module failed to load')) {
      return; // Suppress WASM warnings in tests
    }
    originalWarn.apply(console, args);
  };
}

// Add custom matchers if needed
expect.extend({
  toBeValidSchema(received) {
    const pass = received &&
                 typeof received.parse === 'function' &&
                 typeof received.safeParse === 'function' &&
                 typeof received.parseAsync === 'function' &&
                 typeof received.safeParseAsync === 'function';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid schema`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid schema with parse methods`,
        pass: false,
      };
    }
  },

  toHaveValidationError(received, expectedMessage) {
    if (!received || received.success !== false) {
      return {
        message: () => `expected ${received} to be a failed validation result`,
        pass: false,
      };
    }

    const hasError = received.error &&
                     received.error.issues &&
                     received.error.issues.some(issue =>
                       issue.message.includes(expectedMessage)
                     );

    if (hasError) {
      return {
        message: () => `expected validation not to contain error "${expectedMessage}"`,
        pass: true,
      };
    } else {
      const actualMessages = received.error.issues.map(issue => issue.message);
      return {
        message: () => `expected validation to contain error "${expectedMessage}", but got: ${actualMessages.join(', ')}`,
        pass: false,
      };
    }
  },
});

// Type definitions for custom matchers (for TypeScript projects)
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidSchema(): R;
      toHaveValidationError(expectedMessage: string): R;
    }
  }
}