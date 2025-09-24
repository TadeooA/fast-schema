// Hybrid WASM+TypeScript validation system
import { Schema } from '../base/schema';
import { ValidationError, SafeParseReturnType } from '../base/types';
import { WasmSchemaAdapter, WasmBatchProcessor, WasmUltraFastValidator } from './adapter';

// Performance thresholds for WASM usage
export interface PerformanceThresholds {
  minDataSize: number;        // Minimum data size to justify WASM overhead
  complexityThreshold: number; // Schema complexity threshold
  batchSizeThreshold: number;  // Minimum batch size for WASM batch processing
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minDataSize: 100,           // Use WASM for data > 100 bytes
  complexityThreshold: 5,     // Use WASM for complex schemas
  batchSizeThreshold: 50      // Use WASM for batches > 50 items
};

// Validation mode configuration
export interface HybridConfig {
  preferWasm: boolean;                    // Prefer WASM when available
  autoFallback: boolean;                  // Automatically fallback on errors
  performanceThresholds: PerformanceThresholds;
  enableMetrics: boolean;                 // Collect performance metrics
  wasmInitTimeout: number;                // Timeout for WASM initialization (ms)
}

const DEFAULT_CONFIG: HybridConfig = {
  preferWasm: true,
  autoFallback: true,
  performanceThresholds: DEFAULT_THRESHOLDS,
  enableMetrics: true,
  wasmInitTimeout: 5000
};

// Performance metrics
export interface ValidationMetrics {
  totalValidations: number;
  wasmValidations: number;
  typeScriptValidations: number;
  wasmErrors: number;
  averageWasmTime: number;
  averageTypeScriptTime: number;
  lastUpdated: Date;
}

// Hybrid validation engine
export class HybridValidationEngine {
  private config: HybridConfig;
  private metrics: ValidationMetrics;
  private wasmAvailable = false;
  private wasmInitialized = false;

  constructor(config: Partial<HybridConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = this.createEmptyMetrics();
    this.checkWasmAvailability();
  }

  private createEmptyMetrics(): ValidationMetrics {
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

  private async checkWasmAvailability(): Promise<void> {
    try {
      const timeoutPromise = new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error('WASM init timeout')), this.config.wasmInitTimeout);
      });

      const initPromise = this.initializeWasm();
      await Promise.race([initPromise, timeoutPromise]);

      this.wasmAvailable = true;
      this.wasmInitialized = true;
      console.log('Hybrid validation engine: WASM available');
    } catch (error) {
      console.warn('Hybrid validation engine: WASM not available, using TypeScript only:', error);
      this.wasmAvailable = false;
    }
  }

  private async initializeWasm(): Promise<void> {
    try {
      // Import and use the NodeWasmLoader
      const { NodeWasmLoader } = await import('./node-loader');

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
          await import(path);
          return; // Successfully loaded
        } catch {
          continue;
        }
      }

      throw new Error('WASM module not found');
    } catch (error) {
      throw new Error(`WASM initialization failed: ${error}`);
    }
  }

  // Create a hybrid schema that automatically chooses the best validation method
  createHybridSchema<T>(schema: Schema<T>): HybridSchema<T> {
    return new HybridSchema(schema, this);
  }

  // Determine whether to use WASM for a given validation task
  shouldUseWasm(data: unknown, schema: Schema<any>, isBatch = false, batchSize = 0): boolean {
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

  private estimateDataSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private estimateSchemaComplexity(schema: Schema<any>): number {
    const definition = schema.getSchema();
    let complexity = 1;

    if (definition.type === 'object' && definition.shape) {
      complexity += Object.keys(definition.shape).length;
      // Add complexity for nested objects
      for (const value of Object.values(definition.shape)) {
        complexity += this.estimateSchemaComplexity(value as Schema<any>);
      }
    }

    if (definition.type === 'array' && definition.elementSchema) {
      complexity += this.estimateSchemaComplexity(definition.elementSchema);
    }

    return complexity;
  }

  // Record performance metrics
  recordValidation(useWasm: boolean, duration: number, error?: boolean): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalValidations++;
    this.metrics.lastUpdated = new Date();

    if (useWasm) {
      this.metrics.wasmValidations++;
      if (error) this.metrics.wasmErrors++;
      this.updateAverageTime('wasm', duration);
    } else {
      this.metrics.typeScriptValidations++;
      this.updateAverageTime('typescript', duration);
    }
  }

  private updateAverageTime(type: 'wasm' | 'typescript', duration: number): void {
    if (type === 'wasm') {
      const count = this.metrics.wasmValidations;
      this.metrics.averageWasmTime = ((this.metrics.averageWasmTime * (count - 1)) + duration) / count;
    } else {
      const count = this.metrics.typeScriptValidations;
      this.metrics.averageTypeScriptTime = ((this.metrics.averageTypeScriptTime * (count - 1)) + duration) / count;
    }
  }

  // Get performance metrics
  getMetrics(): ValidationMetrics {
    return { ...this.metrics };
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = this.createEmptyMetrics();
  }

  // Configuration management
  updateConfig(config: Partial<HybridConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): HybridConfig {
    return { ...this.config };
  }

  // WASM availability
  isWasmAvailable(): boolean {
    return this.wasmAvailable;
  }

  isWasmInitialized(): boolean {
    return this.wasmInitialized;
  }
}

// Hybrid schema wrapper
export class HybridSchema<T> extends Schema<T> {
  private typeScriptSchema: Schema<T>;
  private wasmAdapter?: WasmSchemaAdapter<T>;
  private engine: HybridValidationEngine;

  constructor(schema: Schema<T>, engine: HybridValidationEngine) {
    super(schema.getSchema());
    this.typeScriptSchema = schema;
    this.engine = engine;
    this.initializeWasmAdapter();
  }

  private async initializeWasmAdapter(): Promise<void> {
    if (this.engine.isWasmAvailable()) {
      try {
        this.wasmAdapter = new WasmSchemaAdapter(this.typeScriptSchema);
      } catch (error) {
        console.warn('Failed to initialize WASM adapter:', error);
      }
    }
  }

  override _validate(data: unknown): T {
    const start = performance.now();
    const useWasm = this.shouldUseWasm(data);

    try {
      if (useWasm && this.wasmAdapter?.isUsingWasm()) {
        const result = this.wasmAdapter._validate(data);
        this.engine.recordValidation(true, performance.now() - start);
        return result;
      } else {
        const result = this.typeScriptSchema._validate(data);
        this.engine.recordValidation(false, performance.now() - start);
        return result;
      }
    } catch (error) {
      if (useWasm && this.engine.getConfig().autoFallback) {
        console.warn('WASM validation failed, falling back to TypeScript:', error);
        this.engine.recordValidation(true, performance.now() - start, true);

        try {
          const result = this.typeScriptSchema._validate(data);
          this.engine.recordValidation(false, performance.now() - start);
          return result;
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      throw error;
    }
  }

  override safeParse(data: unknown): SafeParseReturnType<unknown, T> {
    const start = performance.now();
    const useWasm = this.shouldUseWasm(data);

    try {
      if (useWasm && this.wasmAdapter?.isUsingWasm()) {
        const result = this.wasmAdapter.safeParse(data);
        this.engine.recordValidation(true, performance.now() - start, !result.success);
        return result;
      } else {
        const result = this.typeScriptSchema.safeParse(data);
        this.engine.recordValidation(false, performance.now() - start, !result.success);
        return result;
      }
    } catch (error) {
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
        error: error instanceof ValidationError ? error : new ValidationError([{
          code: 'hybrid_error',
          path: [],
          message: error instanceof Error ? error.message : 'Unknown validation error'
        }])
      };
    }
  }

  // Batch validation with automatic WASM selection
  validateMany(dataArray: unknown[]): Array<SafeParseReturnType<unknown, T>> {
    const start = performance.now();
    const useWasm = this.shouldUseWasm(dataArray, true, dataArray.length);

    try {
      if (useWasm && this.wasmAdapter?.isUsingWasm()) {
        const results = this.wasmAdapter.validateMany(dataArray);
        this.engine.recordValidation(true, performance.now() - start);
        return results;
      } else {
        const results = dataArray.map(item => this.typeScriptSchema.safeParse(item));
        this.engine.recordValidation(false, performance.now() - start);
        return results;
      }
    } catch (error) {
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

  private shouldUseWasm(data: unknown, isBatch = false, batchSize = 0): boolean {
    return this.engine.shouldUseWasm(data, this.typeScriptSchema, isBatch, batchSize);
  }

  // Performance information
  getPerformanceInfo(): any {
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
  forceWasm(): this {
    if (this.wasmAdapter) {
      this.wasmAdapter.enableWasm();
    }
    return this;
  }

  forceTypeScript(): this {
    if (this.wasmAdapter) {
      this.wasmAdapter.disableWasm();
    }
    return this;
  }

  // Memory management
  resetCaches(): void {
    if (this.wasmAdapter) {
      this.wasmAdapter.resetCaches();
    }
  }
}

// Global hybrid engine instance
let globalHybridEngine: HybridValidationEngine | null = null;

// Factory functions
export function createHybridEngine(config?: Partial<HybridConfig>): HybridValidationEngine {
  return new HybridValidationEngine(config);
}

export function getGlobalHybridEngine(): HybridValidationEngine {
  if (!globalHybridEngine) {
    globalHybridEngine = new HybridValidationEngine();
  }
  return globalHybridEngine;
}

export function setGlobalHybridEngine(engine: HybridValidationEngine): void {
  globalHybridEngine = engine;
}

// Utility function to wrap any schema with hybrid capabilities
export function hybridize<T>(schema: Schema<T>, engine?: HybridValidationEngine): HybridSchema<T> {
  const hybridEngine = engine || getGlobalHybridEngine();
  return hybridEngine.createHybridSchema(schema);
}

// Performance benchmark utility
export class HybridPerformanceBenchmark {
  private engine: HybridValidationEngine;

  constructor(engine?: HybridValidationEngine) {
    this.engine = engine || getGlobalHybridEngine();
  }

  async benchmark<T>(
    schema: Schema<T>,
    testData: unknown[],
    iterations = 100
  ): Promise<{
    wasmResults: { averageTime: number; throughput: number };
    typeScriptResults: { averageTime: number; throughput: number };
    recommendation: 'wasm' | 'typescript' | 'hybrid';
  }> {
    const hybridSchema = this.engine.createHybridSchema(schema);

    // Benchmark WASM
    const wasmTimes: number[] = [];
    if (hybridSchema['wasmAdapter']?.isUsingWasm()) {
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        hybridSchema.forceWasm().validateMany(testData);
        wasmTimes.push(performance.now() - start);
      }
    }

    // Benchmark TypeScript
    const typeScriptTimes: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      hybridSchema.forceTypeScript().validateMany(testData);
      typeScriptTimes.push(performance.now() - start);
    }

    const wasmAvg = wasmTimes.length > 0 ? wasmTimes.reduce((a, b) => a + b, 0) / wasmTimes.length : 0;
    const tsAvg = typeScriptTimes.reduce((a, b) => a + b, 0) / typeScriptTimes.length;

    const wasmThroughput = wasmTimes.length > 0 ? (testData.length * iterations) / (wasmAvg * iterations / 1000) : 0;
    const tsThroughput = (testData.length * iterations) / (tsAvg * iterations / 1000);

    let recommendation: 'wasm' | 'typescript' | 'hybrid';
    if (wasmAvg > 0 && wasmAvg < tsAvg * 0.8) {
      recommendation = 'wasm';
    } else if (wasmAvg > tsAvg * 1.2) {
      recommendation = 'typescript';
    } else {
      recommendation = 'hybrid';
    }

    return {
      wasmResults: { averageTime: wasmAvg, throughput: wasmThroughput },
      typeScriptResults: { averageTime: tsAvg, throughput: tsThroughput },
      recommendation
    };
  }
}