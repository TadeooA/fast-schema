"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.skipIfNoWasm = exports.waitForWasm = exports.generateTestData = exports.measureAsyncPerformance = exports.measurePerformance = void 0;
// Jest test setup for fast-schema
const globals_1 = require("@jest/globals");
// Global test configuration
(0, globals_1.beforeAll)(async () => {
    console.log('🚀 Starting fast-schema test suite...');
    // Set up performance monitoring
    if (typeof performance === 'undefined') {
        global.performance = {
            now: () => Date.now()
        };
    }
    // Mock WASM module for tests that don't require it
    const mockWasmModule = {
        FastValidator: class MockFastValidator {
            constructor(_schema) { }
            validate(_data) { return '{"success":true,"data":null}'; }
            validate_many(_data) { return '[{"success":true,"data":null}]'; }
            get_stats() { return '{"complexity":1}'; }
            reset_caches() { }
            get_memory_info() { return '{"usage":0}'; }
        },
        FastBatchValidator: class MockFastBatchValidator {
            constructor(_schema, _batchSize) { }
            validate_dataset(_data) { return '[{"success":true,"data":null}]'; }
            get_batch_stats() { return '{"processed":0}'; }
        },
        UltraFastValidator: class MockUltraFastValidator {
            constructor(_type, _config) { }
            validate_batch(_data) { return '{"results":[],"stats":{}}'; }
        },
        FastSchemaUtils: {
            validate_schema: (_schema) => '{"valid":true}',
            get_version: () => '{"version":"0.1.0"}',
            analyze_schema_performance: (_schema) => '{"complexity":1}'
        }
    };
    // Make mock available globally for tests that need it
    global.mockWasmModule = mockWasmModule;
});
(0, globals_1.afterAll)(() => {
    console.log('✅ fast-schema test suite completed');
});
(0, globals_1.beforeEach)(() => {
    // Reset any global state before each test
    if (typeof global.gc === 'function') {
        global.gc();
    }
});
(0, globals_1.afterEach)(() => {
    // Clean up after each test
    // Reset any caches or global state
});
// Custom matchers for validation testing
expect.extend({
    toBeValidationError(received) {
        const pass = received instanceof Error &&
            received.name === 'ValidationError' &&
            Array.isArray(received.issues);
        if (pass) {
            return {
                message: () => `Expected ${received} not to be a ValidationError`,
                pass: true,
            };
        }
        else {
            return {
                message: () => `Expected ${received} to be a ValidationError with issues array`,
                pass: false,
            };
        }
    },
    toHaveValidationIssue(received, expectedCode) {
        if (!(received instanceof Error) || !received.issues) {
            return {
                message: () => `Expected ${received} to be a ValidationError`,
                pass: false,
            };
        }
        const issues = received.issues;
        const hasIssue = issues.some((issue) => issue.code === expectedCode);
        if (hasIssue) {
            return {
                message: () => `Expected ValidationError not to have issue with code "${expectedCode}"`,
                pass: true,
            };
        }
        else {
            const issueCodes = issues.map((issue) => issue.code);
            return {
                message: () => `Expected ValidationError to have issue with code "${expectedCode}". Found codes: ${issueCodes.join(', ')}`,
                pass: false,
            };
        }
    },
    toValidateSuccessfully(received, schema) {
        try {
            schema.parse(received);
            return {
                message: () => `Expected data not to validate successfully`,
                pass: true,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                message: () => `Expected data to validate successfully, but got error: ${errorMessage}`,
                pass: false,
            };
        }
    },
    toValidateWithError(received, schema, expectedCode) {
        try {
            schema.parse(received);
            return {
                message: () => `Expected data to fail validation`,
                pass: false,
            };
        }
        catch (error) {
            if (expectedCode) {
                const hasExpectedCode = error.issues?.some((issue) => issue.code === expectedCode);
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
// Performance monitoring helpers
const measurePerformance = (fn, name) => {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    if (duration > 100) {
        console.warn(`⚠️ Slow test operation: ${name} took ${duration.toFixed(2)}ms`);
    }
    return result;
};
exports.measurePerformance = measurePerformance;
const measureAsyncPerformance = async (fn, name) => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    if (duration > 100) {
        console.warn(`⚠️ Slow async test operation: ${name} took ${duration.toFixed(2)}ms`);
    }
    return result;
};
exports.measureAsyncPerformance = measureAsyncPerformance;
// Test data generators
exports.generateTestData = {
    string: (length = 10) => 'a'.repeat(length),
    number: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
    boolean: () => Math.random() > 0.5,
    array: (generator, length = 5) => Array.from({ length }, generator),
    object: (properties) => {
        const result = {};
        for (const [key, generator] of Object.entries(properties)) {
            result[key] = generator();
        }
        return result;
    }
};
// Async test helpers
const waitForWasm = async (timeout = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        // Check if WASM is available
        try {
            const { z } = await Promise.resolve().then(() => __importStar(require('../index')));
            if (z.wasm.isAvailable()) {
                return true;
            }
        }
        catch {
            // Continue waiting
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
};
exports.waitForWasm = waitForWasm;
const skipIfNoWasm = () => {
    const { z } = require('../index');
    if (!z.wasm.isAvailable()) {
        console.log('⏭️ Skipping WASM test - WASM module not available');
        return true;
    }
    return false;
};
exports.skipIfNoWasm = skipIfNoWasm;
//# sourceMappingURL=test-setup.js.map