// TypeScript-WASM bridge for seamless integration
import { Schema } from '../base/schema';
import { z } from '../api';
import { HybridValidationEngine, HybridSchema, hybridize } from './hybrid';

// Enhanced z object with WASM capabilities
export interface WasmZ {
  // All existing z methods with WASM optimization
  string(): HybridSchema<string>;
  number(): HybridSchema<number>;
  boolean(): HybridSchema<boolean>;
  array<T>(schema: Schema<T>): HybridSchema<T[]>;
  object<T extends Record<string, any>>(shape: { [K in keyof T]: Schema<T[K]> }): HybridSchema<T>;

  // WASM-specific utilities
  wasm: {
    isAvailable(): boolean;
    isInitialized(): boolean;
    getPerformanceMetrics(): any;
    resetCaches(): void;
    benchmark<T>(schema: Schema<T>, testData: unknown[], iterations?: number): Promise<any>;
    configure(config: any): void;
  };

  // Hybrid creation utilities
  hybrid<T>(schema: Schema<T>): HybridSchema<T>;
  autoHybrid<T>(schema: Schema<T>): HybridSchema<T>;
}

// WASM bridge implementation
class WasmBridge {
  private hybridEngine: HybridValidationEngine;
  private initialized = false;

  constructor() {
    this.hybridEngine = new HybridValidationEngine();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Give WASM some time to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      this.initialized = true;
      console.log('WASM bridge initialized');
    } catch (error) {
      console.warn('WASM bridge initialization failed:', error);
    }
  }

  // Wrap schema creation methods with hybrid capabilities
  wrapString(): HybridSchema<string> {
    return this.hybridEngine.createHybridSchema(z.string());
  }

  wrapNumber(): HybridSchema<number> {
    return this.hybridEngine.createHybridSchema(z.number());
  }

  wrapBoolean(): HybridSchema<boolean> {
    return this.hybridEngine.createHybridSchema(z.boolean());
  }

  wrapArray<T>(schema: Schema<T>): HybridSchema<T[]> {
    const arraySchema = z.array(schema);
    return this.hybridEngine.createHybridSchema(arraySchema);
  }

  wrapObject<T extends Record<string, any>>(
    shape: { [K in keyof T]: Schema<T[K]> }
  ): HybridSchema<T> {
    const objectSchema = z.object(shape);
    return this.hybridEngine.createHybridSchema(objectSchema);
  }

  // WASM utilities
  isWasmAvailable(): boolean {
    return this.hybridEngine.isWasmAvailable();
  }

  isWasmInitialized(): boolean {
    return this.hybridEngine.isWasmInitialized();
  }

  getPerformanceMetrics(): any {
    return this.hybridEngine.getMetrics();
  }

  resetCaches(): void {
    // Implementation will vary based on WASM module
    console.log('Resetting WASM caches');
  }

  async benchmark<T>(
    schema: Schema<T>,
    testData: unknown[],
    iterations = 100
  ): Promise<any> {
    const { HybridPerformanceBenchmark } = await import('./hybrid');
    const benchmark = new HybridPerformanceBenchmark(this.hybridEngine);
    return benchmark.benchmark(schema, testData, iterations);
  }

  configure(config: any): void {
    this.hybridEngine.updateConfig(config);
  }

  // Create hybrid schema from existing schema
  hybridize<T>(schema: Schema<T>): HybridSchema<T> {
    return this.hybridEngine.createHybridSchema(schema);
  }

  // Auto-detect best validation method for schema
  autoHybridize<T>(schema: Schema<T>): HybridSchema<T> {
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

  getEngine(): HybridValidationEngine {
    return this.hybridEngine;
  }
}

// Global WASM bridge instance
let globalWasmBridge: WasmBridge | null = null;

function getWasmBridge(): WasmBridge {
  if (!globalWasmBridge) {
    globalWasmBridge = new WasmBridge();
  }
  return globalWasmBridge;
}

// Enhanced z object with WASM capabilities
export const wasmZ: WasmZ = {
  // Enhanced primitive types
  string: () => getWasmBridge().wrapString(),
  number: () => getWasmBridge().wrapNumber(),
  boolean: () => getWasmBridge().wrapBoolean(),

  // Enhanced complex types
  array: <T>(schema: Schema<T>) => getWasmBridge().wrapArray(schema),
  object: <T extends Record<string, any>>(shape: { [K in keyof T]: Schema<T[K]> }) =>
    getWasmBridge().wrapObject(shape),

  // WASM utilities
  wasm: {
    isAvailable: () => getWasmBridge().isWasmAvailable(),
    isInitialized: () => getWasmBridge().isWasmInitialized(),
    getPerformanceMetrics: () => getWasmBridge().getPerformanceMetrics(),
    resetCaches: () => getWasmBridge().resetCaches(),
    benchmark: async <T>(schema: Schema<T>, testData: unknown[], iterations?: number) =>
      getWasmBridge().benchmark(schema, testData, iterations),
    configure: (config: any) => getWasmBridge().configure(config)
  },

  // Hybrid utilities
  hybrid: <T>(schema: Schema<T>) => getWasmBridge().hybridize(schema),
  autoHybrid: <T>(schema: Schema<T>) => getWasmBridge().autoHybridize(schema)
};

// Compatibility layer for existing z usage
export const zWasm = wasmZ;

// Migration helper - gradually replace z with wasmZ
export function createMigrationAdapter() {
  return new Proxy(z, {
    get(target, prop) {
      // If WASM bridge has the property, use it
      if (prop in wasmZ) {
        console.log(`[Migration] Using WASM-optimized ${String(prop)}`);
        return (wasmZ as any)[prop];
      }

      // Fallback to original z
      return (target as any)[prop];
    }
  });
}

// Performance monitoring decorator
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const duration = performance.now() - start;

    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);

    // Log slow operations
    if (duration > 10) {
      console.warn(`[Performance] Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }) as T;
}

// Auto-optimization utility
export class AutoOptimizer {
  private static learningData: Map<string, { wasmTime: number; tsTime: number; count: number }> = new Map();

  static recordPerformance(schemaType: string, wasmTime: number, tsTime: number): void {
    const existing = this.learningData.get(schemaType);
    if (existing) {
      existing.wasmTime = (existing.wasmTime * existing.count + wasmTime) / (existing.count + 1);
      existing.tsTime = (existing.tsTime * existing.count + tsTime) / (existing.count + 1);
      existing.count++;
    } else {
      this.learningData.set(schemaType, { wasmTime, tsTime, count: 1 });
    }
  }

  static getRecommendation(schemaType: string): 'wasm' | 'typescript' | 'unknown' {
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

  static getOptimizedSchema<T>(schema: Schema<T>): HybridSchema<T> {
    const schemaType = schema.getSchema().type;
    const recommendation = this.getRecommendation(schemaType);

    const hybridSchema = wasmZ.hybrid(schema);

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

  static getLearningData(): Map<string, { wasmTime: number; tsTime: number; count: number }> {
    return new Map(this.learningData);
  }

  static clearLearningData(): void {
    this.learningData.clear();
  }
}

// Smart schema factory with automatic optimization
export function smartSchema<T>(schema: Schema<T>): HybridSchema<T> {
  return AutoOptimizer.getOptimizedSchema(schema);
}

// Convenience exports for different use cases
export const fastZ = wasmZ; // For explicit fast validation
export const smartZ = createMigrationAdapter(); // For gradual migration
export const optimizedZ = { // For auto-optimized schemas
  string: () => smartSchema(z.string()),
  number: () => smartSchema(z.number()),
  boolean: () => smartSchema(z.boolean()),
  array: <T>(schema: Schema<T>) => smartSchema(z.array(schema)),
  object: <T extends Record<string, any>>(shape: { [K in keyof T]: Schema<T[K]> }) =>
    smartSchema(z.object(shape))
};

// Utility to check if WASM is working correctly
export async function testWasmIntegration(): Promise<{
  wasmAvailable: boolean;
  wasmWorking: boolean;
  performanceGain?: number;
  error?: string;
}> {
  try {
    if (!wasmZ.wasm.isAvailable()) {
      return {
        wasmAvailable: false,
        wasmWorking: false,
        error: 'WASM module not available'
      };
    }

    // Test basic validation
    const testSchema = wasmZ.object({
      name: wasmZ.string(),
      age: wasmZ.number(),
      active: wasmZ.boolean()
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

  } catch (error) {
    return {
      wasmAvailable: false,
      wasmWorking: false,
      error: error instanceof Error ? error.message : 'Unknown error during WASM test'
    };
  }
}

// Export the bridge instance for advanced usage
export function getWasmBridgeInstance(): WasmBridge {
  return getWasmBridge();
}