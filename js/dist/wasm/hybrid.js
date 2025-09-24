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
exports.HybridPerformanceBenchmark = exports.HybridSchema = exports.HybridValidationEngine = void 0;
exports.createHybridEngine = createHybridEngine;
exports.getGlobalHybridEngine = getGlobalHybridEngine;
exports.setGlobalHybridEngine = setGlobalHybridEngine;
exports.hybridize = hybridize;
// Hybrid WASM+TypeScript validation system
const schema_1 = require("../base/schema");
const types_1 = require("../base/types");
const adapter_1 = require("./adapter");
const DEFAULT_THRESHOLDS = {
    minDataSize: 100, // Use WASM for data > 100 bytes
    complexityThreshold: 5, // Use WASM for complex schemas
    batchSizeThreshold: 50 // Use WASM for batches > 50 items
};
const DEFAULT_CONFIG = {
    preferWasm: true,
    autoFallback: true,
    performanceThresholds: DEFAULT_THRESHOLDS,
    enableMetrics: true,
    wasmInitTimeout: 5000
};
// Hybrid validation engine
class HybridValidationEngine {
    constructor(config = {}) {
        this.wasmAvailable = false;
        this.wasmInitialized = false;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.metrics = this.createEmptyMetrics();
        this.checkWasmAvailability();
    }
    createEmptyMetrics() {
        return {
            totalValidations: 0,
            wasmValidations: 0,
            typeScriptValidations: 0,
            wasmErrors: 0,
            averageWasmTime: 0,
            averageTypeScriptTime: 0,
            lastUpdated: new Date()
        };
    }
    async checkWasmAvailability() {
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('WASM init timeout')), this.config.wasmInitTimeout);
            });
            const initPromise = this.initializeWasm();
            await Promise.race([initPromise, timeoutPromise]);
            this.wasmAvailable = true;
            this.wasmInitialized = true;
            console.log('Hybrid validation engine: WASM available');
        }
        catch (error) {
            console.warn('Hybrid validation engine: WASM not available, using TypeScript only:', error);
            this.wasmAvailable = false;
        }
    }
    async initializeWasm() {
        try {
            // Import and use the NodeWasmLoader
            const { NodeWasmLoader } = await Promise.resolve().then(() => __importStar(require('./node-loader')));
            // Check if we're in Node.js environment
            if (NodeWasmLoader.isNodeEnvironment()) {
                // Use native WASM loader for Node.js
                const wasmInstance = await NodeWasmLoader.getInstance();
                if (!wasmInstance) {
                    throw new Error('Failed to load WASM in Node.js');
                }
                return; // Successfully loaded
            }
            // Fallback to dynamic imports for browser environments
            const possiblePaths = [
                '../pkg/fast_schema',
                './pkg/fast_schema',
                '../../pkg/fast_schema',
                'fast_schema',
                'fast-schema'
            ];
            for (const path of possiblePaths) {
                try {
                    await Promise.resolve(`${path}`).then(s => __importStar(require(s)));
                    return; // Successfully loaded
                }
                catch {
                    continue;
                }
            }
            throw new Error('WASM module not found');
        }
        catch (error) {
            throw new Error(`WASM initialization failed: ${error}`);
        }
    }
    // Create a hybrid schema that automatically chooses the best validation method
    createHybridSchema(schema) {
        return new HybridSchema(schema, this);
    }
    // Determine whether to use WASM for a given validation task
    shouldUseWasm(data, schema, isBatch = false, batchSize = 0) {
        if (!this.wasmAvailable || !this.config.preferWasm) {
            return false;
        }
        // Check data size threshold
        const dataSize = this.estimateDataSize(data);
        if (dataSize < this.config.performanceThresholds.minDataSize) {
            return false;
        }
        // Check schema complexity
        const complexity = this.estimateSchemaComplexity(schema);
        if (complexity < this.config.performanceThresholds.complexityThreshold) {
            return false;
        }
        // Check batch size threshold
        if (isBatch && batchSize < this.config.performanceThresholds.batchSizeThreshold) {
            return false;
        }
        return true;
    }
    estimateDataSize(data) {
        try {
            return JSON.stringify(data).length;
        }
        catch {
            return 0;
        }
    }
    estimateSchemaComplexity(schema) {
        const definition = schema.getSchema();
        let complexity = 1;
        if (definition.type === 'object' && definition.shape) {
            complexity += Object.keys(definition.shape).length;
            // Add complexity for nested objects
            for (const value of Object.values(definition.shape)) {
                complexity += this.estimateSchemaComplexity(value);
            }
        }
        if (definition.type === 'array' && definition.elementSchema) {
            complexity += this.estimateSchemaComplexity(definition.elementSchema);
        }
        return complexity;
    }
    // Record performance metrics
    recordValidation(useWasm, duration, error) {
        if (!this.config.enableMetrics)
            return;
        this.metrics.totalValidations++;
        this.metrics.lastUpdated = new Date();
        if (useWasm) {
            this.metrics.wasmValidations++;
            if (error)
                this.metrics.wasmErrors++;
            this.updateAverageTime('wasm', duration);
        }
        else {
            this.metrics.typeScriptValidations++;
            this.updateAverageTime('typescript', duration);
        }
    }
    updateAverageTime(type, duration) {
        if (type === 'wasm') {
            const count = this.metrics.wasmValidations;
            this.metrics.averageWasmTime = ((this.metrics.averageWasmTime * (count - 1)) + duration) / count;
        }
        else {
            const count = this.metrics.typeScriptValidations;
            this.metrics.averageTypeScriptTime = ((this.metrics.averageTypeScriptTime * (count - 1)) + duration) / count;
        }
    }
    // Get performance metrics
    getMetrics() {
        return { ...this.metrics };
    }
    // Reset metrics
    resetMetrics() {
        this.metrics = this.createEmptyMetrics();
    }
    // Configuration management
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
    // WASM availability
    isWasmAvailable() {
        return this.wasmAvailable;
    }
    isWasmInitialized() {
        return this.wasmInitialized;
    }
}
exports.HybridValidationEngine = HybridValidationEngine;
// Hybrid schema wrapper
class HybridSchema extends schema_1.Schema {
    constructor(schema, engine) {
        super(schema.getSchema());
        this.typeScriptSchema = schema;
        this.engine = engine;
        this.initializeWasmAdapter();
    }
    async initializeWasmAdapter() {
        if (this.engine.isWasmAvailable()) {
            try {
                this.wasmAdapter = new adapter_1.WasmSchemaAdapter(this.typeScriptSchema);
            }
            catch (error) {
                console.warn('Failed to initialize WASM adapter:', error);
            }
        }
    }
    _validate(data) {
        const start = performance.now();
        const useWasm = this.shouldUseWasm(data);
        try {
            if (useWasm && this.wasmAdapter?.isUsingWasm()) {
                const result = this.wasmAdapter._validate(data);
                this.engine.recordValidation(true, performance.now() - start);
                return result;
            }
            else {
                const result = this.typeScriptSchema._validate(data);
                this.engine.recordValidation(false, performance.now() - start);
                return result;
            }
        }
        catch (error) {
            if (useWasm && this.engine.getConfig().autoFallback) {
                console.warn('WASM validation failed, falling back to TypeScript:', error);
                this.engine.recordValidation(true, performance.now() - start, true);
                try {
                    const result = this.typeScriptSchema._validate(data);
                    this.engine.recordValidation(false, performance.now() - start);
                    return result;
                }
                catch (fallbackError) {
                    throw fallbackError;
                }
            }
            throw error;
        }
    }
    safeParse(data) {
        const start = performance.now();
        const useWasm = this.shouldUseWasm(data);
        try {
            if (useWasm && this.wasmAdapter?.isUsingWasm()) {
                const result = this.wasmAdapter.safeParse(data);
                this.engine.recordValidation(true, performance.now() - start, !result.success);
                return result;
            }
            else {
                const result = this.typeScriptSchema.safeParse(data);
                this.engine.recordValidation(false, performance.now() - start, !result.success);
                return result;
            }
        }
        catch (error) {
            if (useWasm && this.engine.getConfig().autoFallback) {
                console.warn('WASM safeParse failed, falling back to TypeScript:', error);
                this.engine.recordValidation(true, performance.now() - start, true);
                const result = this.typeScriptSchema.safeParse(data);
                this.engine.recordValidation(false, performance.now() - start, !result.success);
                return result;
            }
            // Return error result for safeParse
            return {
                success: false,
                error: error instanceof types_1.ValidationError ? error : new types_1.ValidationError([{
                        code: 'hybrid_error',
                        path: [],
                        message: error instanceof Error ? error.message : 'Unknown validation error'
                    }])
            };
        }
    }
    // Batch validation with automatic WASM selection
    validateMany(dataArray) {
        const start = performance.now();
        const useWasm = this.shouldUseWasm(dataArray, true, dataArray.length);
        try {
            if (useWasm && this.wasmAdapter?.isUsingWasm()) {
                const results = this.wasmAdapter.validateMany(dataArray);
                this.engine.recordValidation(true, performance.now() - start);
                return results;
            }
            else {
                const results = dataArray.map(item => this.typeScriptSchema.safeParse(item));
                this.engine.recordValidation(false, performance.now() - start);
                return results;
            }
        }
        catch (error) {
            if (useWasm && this.engine.getConfig().autoFallback) {
                console.warn('WASM batch validation failed, falling back to TypeScript:', error);
                this.engine.recordValidation(true, performance.now() - start, true);
                const results = dataArray.map(item => this.typeScriptSchema.safeParse(item));
                this.engine.recordValidation(false, performance.now() - start);
                return results;
            }
            throw error;
        }
    }
    shouldUseWasm(data, isBatch = false, batchSize = 0) {
        return this.engine.shouldUseWasm(data, this.typeScriptSchema, isBatch, batchSize);
    }
    // Performance information
    getPerformanceInfo() {
        if (this.wasmAdapter) {
            return {
                wasmAvailable: this.wasmAdapter.isUsingWasm(),
                wasmStats: this.wasmAdapter.getPerformanceStats(),
                memoryInfo: this.wasmAdapter.getMemoryInfo(),
                hybridMetrics: this.engine.getMetrics()
            };
        }
        return {
            wasmAvailable: false,
            hybridMetrics: this.engine.getMetrics()
        };
    }
    // Force validation method
    forceWasm() {
        if (this.wasmAdapter) {
            this.wasmAdapter.enableWasm();
        }
        return this;
    }
    forceTypeScript() {
        if (this.wasmAdapter) {
            this.wasmAdapter.disableWasm();
        }
        return this;
    }
    // Memory management
    resetCaches() {
        if (this.wasmAdapter) {
            this.wasmAdapter.resetCaches();
        }
    }
}
exports.HybridSchema = HybridSchema;
// Global hybrid engine instance
let globalHybridEngine = null;
// Factory functions
function createHybridEngine(config) {
    return new HybridValidationEngine(config);
}
function getGlobalHybridEngine() {
    if (!globalHybridEngine) {
        globalHybridEngine = new HybridValidationEngine();
    }
    return globalHybridEngine;
}
function setGlobalHybridEngine(engine) {
    globalHybridEngine = engine;
}
// Utility function to wrap any schema with hybrid capabilities
function hybridize(schema, engine) {
    const hybridEngine = engine || getGlobalHybridEngine();
    return hybridEngine.createHybridSchema(schema);
}
// Performance benchmark utility
class HybridPerformanceBenchmark {
    constructor(engine) {
        this.engine = engine || getGlobalHybridEngine();
    }
    async benchmark(schema, testData, iterations = 100) {
        const hybridSchema = this.engine.createHybridSchema(schema);
        // Benchmark WASM
        const wasmTimes = [];
        if (hybridSchema['wasmAdapter']?.isUsingWasm()) {
            for (let i = 0; i < iterations; i++) {
                const start = performance.now();
                hybridSchema.forceWasm().validateMany(testData);
                wasmTimes.push(performance.now() - start);
            }
        }
        // Benchmark TypeScript
        const typeScriptTimes = [];
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            hybridSchema.forceTypeScript().validateMany(testData);
            typeScriptTimes.push(performance.now() - start);
        }
        const wasmAvg = wasmTimes.length > 0 ? wasmTimes.reduce((a, b) => a + b, 0) / wasmTimes.length : 0;
        const tsAvg = typeScriptTimes.reduce((a, b) => a + b, 0) / typeScriptTimes.length;
        const wasmThroughput = wasmTimes.length > 0 ? (testData.length * iterations) / (wasmAvg * iterations / 1000) : 0;
        const tsThroughput = (testData.length * iterations) / (tsAvg * iterations / 1000);
        let recommendation;
        if (wasmAvg > 0 && wasmAvg < tsAvg * 0.8) {
            recommendation = 'wasm';
        }
        else if (wasmAvg > tsAvg * 1.2) {
            recommendation = 'typescript';
        }
        else {
            recommendation = 'hybrid';
        }
        return {
            wasmResults: { averageTime: wasmAvg, throughput: wasmThroughput },
            typeScriptResults: { averageTime: tsAvg, throughput: tsThroughput },
            recommendation
        };
    }
}
exports.HybridPerformanceBenchmark = HybridPerformanceBenchmark;
//# sourceMappingURL=hybrid.js.map