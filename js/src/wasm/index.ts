// WASM module exports - Hybrid WASM+TypeScript validation system
export {
  WasmSchemaAdapter,
  WasmBatchProcessor,
  WasmUltraFastValidator,
  createWasmSchema,
  type WasmValidatorInstance,
  type WasmBatchValidatorInstance,
  type WasmUltraFastValidatorInstance,
  type WasmValidatorConstructor,
  type WasmBatchValidatorConstructor,
  type WasmUltraFastValidatorConstructor,
  type WasmModule
} from './adapter';

export {
  HybridValidationEngine,
  HybridSchema,
  HybridPerformanceBenchmark,
  createHybridEngine,
  getGlobalHybridEngine,
  setGlobalHybridEngine,
  hybridize,
  type HybridConfig
} from './hybrid';

export {
  wasmZ,
  zWasm,
  fastZ,
  smartZ,
  optimizedZ,
  createMigrationAdapter,
  withPerformanceMonitoring,
  AutoOptimizer,
  smartSchema,
  testWasmIntegration,
  getWasmBridgeInstance,
  type WasmZ
} from './bridge';

// Main WASM integration API
export class FastSchemaWasm {
  // Quick access to different z variants
  static get z() { return wasmZ; }
  static get fast() { return fastZ; }
  static get smart() { return smartZ; }
  static get optimized() { return optimizedZ; }

  // WASM utilities
  static isAvailable(): boolean {
    return wasmZ.wasm.isAvailable();
  }

  static async test(): Promise<any> {
    return testWasmIntegration();
  }

  static configure(config: any): void {
    return wasmZ.wasm.configure(config);
  }

  static getMetrics(): any {
    return wasmZ.wasm.getPerformanceMetrics();
  }

  static resetCaches(): void {
    return wasmZ.wasm.resetCaches();
  }

  // Performance analysis
  static async benchmark<T>(
    schema: Schema<T>,
    testData: unknown[],
    iterations = 100
  ): Promise<any> {
    return wasmZ.wasm.benchmark(schema, testData, iterations);
  }

  // Auto-optimization
  static optimizeSchema<T>(schema: Schema<T>): HybridSchema<T> {
    return smartSchema(schema);
  }

  static getLearningData(): any {
    return AutoOptimizer.getLearningData();
  }

  static clearLearningData(): void {
    return AutoOptimizer.clearLearningData();
  }
}

// Re-export types and interfaces
export type {
  ValidationMetrics,
  PerformanceThresholds
} from './hybrid';

// Default export for convenience
export default FastSchemaWasm;

// Import statements for easier usage
import { wasmZ, fastZ, smartZ, optimizedZ, smartSchema, testWasmIntegration, AutoOptimizer } from './bridge';
import { HybridSchema } from './hybrid';
import { Schema } from '../base/schema';