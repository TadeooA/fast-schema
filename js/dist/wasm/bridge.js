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
exports.optimizedFast = exports.smartFast = exports.wasmFast = exports.AutoOptimizer = exports.fastWasm = exports.wasmZ = void 0;
exports.createMigrationAdapter = createMigrationAdapter;
exports.withPerformanceMonitoring = withPerformanceMonitoring;
exports.smartSchema = smartSchema;
exports.testWasmIntegration = testWasmIntegration;
exports.getWasmBridgeInstance = getWasmBridgeInstance;
const api_1 = require("../api");
const hybrid_1 = require("./hybrid");
// WASM bridge implementation
class WasmBridge {
    constructor() {
        this.initialized = false;
        this.hybridEngine = new hybrid_1.HybridValidationEngine();
        this.initialize();
    }
    async initialize() {
        try {
            // Give WASM some time to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
            this.initialized = true;
            console.log('WASM bridge initialized');
        }
        catch (error) {
            console.warn('WASM bridge initialization failed:', error);
        }
    }
    // Wrap schema creation methods with hybrid capabilities
    wrapString() {
        return this.hybridEngine.createHybridSchema(api_1.fast.string());
    }
    wrapNumber() {
        return this.hybridEngine.createHybridSchema(api_1.fast.number());
    }
    wrapBoolean() {
        return this.hybridEngine.createHybridSchema(api_1.fast.boolean());
    }
    wrapArray(schema) {
        const arraySchema = api_1.fast.array(schema);
        return this.hybridEngine.createHybridSchema(arraySchema);
    }
    wrapObject(shape) {
        const objectSchema = api_1.fast.object(shape);
        return this.hybridEngine.createHybridSchema(objectSchema);
    }
    // WASM utilities
    isWasmAvailable() {
        return this.hybridEngine.isWasmAvailable();
    }
    isWasmInitialized() {
        return this.hybridEngine.isWasmInitialized();
    }
    getPerformanceMetrics() {
        return this.hybridEngine.getMetrics();
    }
    resetCaches() {
        // Implementation will vary based on WASM module
        console.log('Resetting WASM caches');
    }
    async benchmark(schema, testData, iterations = 100) {
        const { HybridPerformanceBenchmark } = await Promise.resolve().then(() => __importStar(require('./hybrid')));
        const benchmark = new HybridPerformanceBenchmark(this.hybridEngine);
        return benchmark.benchmark(schema, testData, iterations);
    }
    configure(config) {
        this.hybridEngine.updateConfig(config);
    }
    // Create hybrid schema from existing schema
    hybridize(schema) {
        return this.hybridEngine.createHybridSchema(schema);
    }
    // Auto-detect best validation method for schema
    autoHybridize(schema) {
        const hybridSchema = this.hybridEngine.createHybridSchema(schema);
        // Auto-configure based on schema characteristics
        const definition = schema.getSchema();
        let config = this.hybridEngine.getConfig();
        // Adjust thresholds based on schema complexity
        if (definition.type === 'object' && definition.shape) {
            const propertyCount = Object.keys(definition.shape).length;
            if (propertyCount > 10) {
                config.performanceThresholds.complexityThreshold = 3; // Lower threshold for complex objects
            }
        }
        if (definition.type === 'array') {
            config.performanceThresholds.batchSizeThreshold = 25; // Lower threshold for arrays
        }
        this.hybridEngine.updateConfig(config);
        return hybridSchema;
    }
    getEngine() {
        return this.hybridEngine;
    }
}
// Global WASM bridge instance
let globalWasmBridge = null;
function getWasmBridge() {
    if (!globalWasmBridge) {
        globalWasmBridge = new WasmBridge();
    }
    return globalWasmBridge;
}
// Enhanced z object with WASM capabilities
exports.wasmZ = {
    // Enhanced primitive types
    string: () => getWasmBridge().wrapString(),
    number: () => getWasmBridge().wrapNumber(),
    boolean: () => getWasmBridge().wrapBoolean(),
    // Enhanced complex types
    array: (schema) => getWasmBridge().wrapArray(schema),
    object: (shape) => getWasmBridge().wrapObject(shape),
    // WASM utilities
    wasm: {
        isAvailable: () => getWasmBridge().isWasmAvailable(),
        isInitialized: () => getWasmBridge().isWasmInitialized(),
        getPerformanceMetrics: () => getWasmBridge().getPerformanceMetrics(),
        resetCaches: () => getWasmBridge().resetCaches(),
        benchmark: async (schema, testData, iterations) => getWasmBridge().benchmark(schema, testData, iterations),
        configure: (config) => getWasmBridge().configure(config)
    },
    // Hybrid utilities
    hybrid: (schema) => getWasmBridge().hybridize(schema),
    autoHybrid: (schema) => getWasmBridge().autoHybridize(schema)
};
// Compatibility layer for existing usage
exports.fastWasm = exports.wasmZ;
// Migration helper - gradually replace fast with wasmFast
function createMigrationAdapter() {
    return new Proxy(api_1.fast, {
        get(target, prop) {
            // If WASM bridge has the property, use it
            if (prop in exports.wasmZ) {
                console.log(`[Migration] Using WASM-optimized ${String(prop)}`);
                return exports.wasmZ[prop];
            }
            // Fallback to original fast
            return target[prop];
        }
    });
}
// Performance monitoring decorator
function withPerformanceMonitoring(fn, name) {
    return ((...args) => {
        const start = performance.now();
        const result = fn(...args);
        const duration = performance.now() - start;
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        // Log slow operations
        if (duration > 10) {
            console.warn(`[Performance] Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
        }
        return result;
    });
}
// Auto-optimization utility
class AutoOptimizer {
    static recordPerformance(schemaType, wasmTime, tsTime) {
        const existing = this.learningData.get(schemaType);
        if (existing) {
            existing.wasmTime = (existing.wasmTime * existing.count + wasmTime) / (existing.count + 1);
            existing.tsTime = (existing.tsTime * existing.count + tsTime) / (existing.count + 1);
            existing.count++;
        }
        else {
            this.learningData.set(schemaType, { wasmTime, tsTime, count: 1 });
        }
    }
    static getRecommendation(schemaType) {
        const data = this.learningData.get(schemaType);
        if (!data || data.count < 5) { // Need at least 5 samples
            return 'unknown';
        }
        // Prefer WASM if it's significantly faster
        if (data.wasmTime < data.tsTime * 0.8) {
            return 'wasm';
        }
        // Prefer TypeScript if WASM is slower
        if (data.wasmTime > data.tsTime * 1.2) {
            return 'typescript';
        }
        return 'unknown';
    }
    static getOptimizedSchema(schema) {
        const schemaType = schema.getSchema().type;
        const recommendation = this.getRecommendation(schemaType);
        const hybridSchema = exports.wasmZ.hybrid(schema);
        switch (recommendation) {
            case 'wasm':
                hybridSchema.forceWasm();
                console.log(`[AutoOptimizer] Using WASM for ${schemaType} based on learning data`);
                break;
            case 'typescript':
                hybridSchema.forceTypeScript();
                console.log(`[AutoOptimizer] Using TypeScript for ${schemaType} based on learning data`);
                break;
            default:
                console.log(`[AutoOptimizer] Using hybrid mode for ${schemaType} (insufficient data)`);
        }
        return hybridSchema;
    }
    static getLearningData() {
        return new Map(this.learningData);
    }
    static clearLearningData() {
        this.learningData.clear();
    }
}
exports.AutoOptimizer = AutoOptimizer;
AutoOptimizer.learningData = new Map();
// Smart schema factory with automatic optimization
function smartSchema(schema) {
    return AutoOptimizer.getOptimizedSchema(schema);
}
// Convenience exports for different use cases
exports.wasmFast = exports.wasmZ; // For explicit fast validation
exports.smartFast = createMigrationAdapter(); // For gradual migration
exports.optimizedFast = {
    string: () => smartSchema(api_1.fast.string()),
    number: () => smartSchema(api_1.fast.number()),
    boolean: () => smartSchema(api_1.fast.boolean()),
    array: (schema) => smartSchema(api_1.fast.array(schema)),
    object: (shape) => smartSchema(api_1.fast.object(shape))
};
// Utility to check if WASM is working correctly
async function testWasmIntegration() {
    try {
        if (!exports.wasmZ.wasm.isAvailable()) {
            return {
                wasmAvailable: false,
                wasmWorking: false,
                error: 'WASM module not available'
            };
        }
        // Test basic validation
        const testSchema = exports.wasmZ.object({
            name: exports.wasmZ.string(),
            age: exports.wasmZ.number(),
            active: exports.wasmZ.boolean()
        });
        const testData = { name: 'test', age: 25, active: true };
        // Test WASM validation
        const wasmStart = performance.now();
        const wasmResult = testSchema.forceWasm().safeParse(testData);
        const wasmTime = performance.now() - wasmStart;
        // Test TypeScript validation
        const tsStart = performance.now();
        const tsResult = testSchema.forceTypeScript().safeParse(testData);
        const tsTime = performance.now() - tsStart;
        const wasmWorking = wasmResult.success === tsResult.success;
        const performanceGain = tsTime > 0 ? ((tsTime - wasmTime) / tsTime) * 100 : 0;
        return {
            wasmAvailable: true,
            wasmWorking,
            performanceGain,
            error: wasmWorking ? undefined : 'WASM validation results differ from TypeScript'
        };
    }
    catch (error) {
        return {
            wasmAvailable: false,
            wasmWorking: false,
            error: error instanceof Error ? error.message : 'Unknown error during WASM test'
        };
    }
}
// Export the bridge instance for advanced usage
function getWasmBridgeInstance() {
    return getWasmBridge();
}
//# sourceMappingURL=bridge.js.map