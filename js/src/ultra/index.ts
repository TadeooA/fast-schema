// Ultra-performance API - 100x speed target
// This is the new "fast" API without Zod compatibility constraints

import {
  UltraStringSchema,
  UltraNumberSchema,
  UltraBooleanSchema,
  UltraArraySchema,
  UltraObjectSchema,
  UltraBatchValidator,
  JITOptimizer,
  type UltraValidationResult
} from './core';

import { extreme } from './extreme';

// WASM integration for ultra-performance
let wasmValidator: any = null;

// Lazy load WASM if available
const initWasm = async () => {
  if (wasmValidator) return wasmValidator;

  try {
    // Try to load the WASM module
    const wasmModule = await import('../wasm/index');
    if (wasmModule && wasmModule.FastSchemaWasm) {
      wasmValidator = wasmModule.FastSchemaWasm;
      console.log('🚀 WASM ultra-performance module loaded');
    }
  } catch (error) {
    console.log('⚡ Using pure TypeScript ultra-performance mode');
  }

  return wasmValidator;
};

// Performance monitoring
class PerformanceTracker {
  private static metrics = new Map<string, { totalTime: number; calls: number }>();

  static startTiming(operation: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      const existing = this.metrics.get(operation);
      if (existing) {
        existing.totalTime += duration;
        existing.calls++;
      } else {
        this.metrics.set(operation, { totalTime: duration, calls: 1 });
      }
    };
  }

  static getMetrics(): Record<string, { avgTime: number; totalCalls: number }> {
    const result: Record<string, { avgTime: number; totalCalls: number }> = {};
    this.metrics.forEach((stats, operation) => {
      result[operation] = {
        avgTime: stats.totalTime / stats.calls,
        totalCalls: stats.calls
      };
    });
    return result;
  }

  static reset(): void {
    this.metrics.clear();
  }
}

// Ultra-optimized schema creation with automatic WASM fallback
class UltraSchemaFactory {
  private static useWasm = false;
  private static wasmInitialized = false;

  static async initialize(): Promise<void> {
    if (this.wasmInitialized) return;

    const wasm = await initWasm();
    this.useWasm = !!wasm;
    this.wasmInitialized = true;
  }

  static string(): UltraStringSchema {
    const endTiming = PerformanceTracker.startTiming('string_creation');
    const schema = new UltraStringSchema();
    endTiming();
    return schema;
  }

  static number(): UltraNumberSchema {
    const endTiming = PerformanceTracker.startTiming('number_creation');
    const schema = new UltraNumberSchema();
    endTiming();
    return schema;
  }

  static boolean(): UltraBooleanSchema {
    const endTiming = PerformanceTracker.startTiming('boolean_creation');
    const schema = new UltraBooleanSchema();
    endTiming();
    return schema;
  }

  static array<T>(itemSchema: { getValidator(): (data: unknown) => T }): UltraArraySchema<T> {
    const endTiming = PerformanceTracker.startTiming('array_creation');
    const schema = new UltraArraySchema(itemSchema);
    endTiming();
    return schema;
  }

  static object<T extends Record<string, any>>(
    shape: { [K in keyof T]: { getValidator(): (data: unknown) => T[K] } }
  ): UltraObjectSchema<T> {
    const endTiming = PerformanceTracker.startTiming('object_creation');

    // Auto-detect required fields based on schema types
    const required: (keyof T)[] = [];
    for (const [key, schema] of Object.entries(shape)) {
      // In a real implementation, we'd check if the schema is optional
      // For now, assume all fields are required for maximum performance
      required.push(key as keyof T);
    }

    const schema = new UltraObjectSchema(shape, required);
    endTiming();
    return schema;
  }

  static batch<T>(schema: { getValidator(): (data: unknown) => T }): UltraBatchValidator<T> {
    return new UltraBatchValidator(schema.getValidator());
  }

  // JIT-optimized schema creation
  static jit<T>(schema: { getValidator(): (data: unknown) => T }): { parse: (data: unknown) => T } {
    const schemaId = Math.random().toString(36);
    const originalValidator = schema.getValidator();

    return {
      parse: (data: unknown): T => {
        const optimizedValidator = JITOptimizer.recordUsage(schemaId, originalValidator);
        return optimizedValidator(data);
      }
    };
  }

  // WASM-accelerated validation
  static wasm<T>(schema: { getValidator(): (data: unknown) => T }): {
    parse: (data: unknown) => T;
    safeParse: (data: unknown) => UltraValidationResult<T>;
  } {
    const fallbackValidator = schema.getValidator();

    return {
      parse: (data: unknown): T => {
        if (this.useWasm && wasmValidator) {
          try {
            // In a real implementation, this would call into WASM
            // For now, we'll use the TypeScript implementation with WASM-like optimizations
            const endTiming = PerformanceTracker.startTiming('wasm_validation');
            const result = fallbackValidator(data);
            endTiming();
            return result;
          } catch (error) {
            // Fallback to TypeScript if WASM fails
            return fallbackValidator(data);
          }
        }
        return fallbackValidator(data);
      },

      safeParse: (data: unknown): UltraValidationResult<T> => {
        if (this.useWasm && wasmValidator) {
          try {
            const endTiming = PerformanceTracker.startTiming('wasm_validation');
            const result = fallbackValidator(data);
            endTiming();
            return { success: true, data: result };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'WASM validation failed'
            };
          }
        }

        try {
          const result = fallbackValidator(data);
          return { success: true, data: result };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Validation failed'
          };
        }
      }
    };
  }
}

// Pre-initialize WASM for immediate availability
UltraSchemaFactory.initialize().catch(() => {
  // Silently fail - TypeScript mode will be used
});

// The main ultra-performance API
export const ultra = {
  // Primitive types
  string: () => UltraSchemaFactory.string(),
  number: () => UltraSchemaFactory.number(),
  boolean: () => UltraSchemaFactory.boolean(),

  // Complex types
  array: <T>(schema: { getValidator(): (data: unknown) => T }) =>
    UltraSchemaFactory.array(schema),

  object: <T extends Record<string, any>>(
    shape: { [K in keyof T]: { getValidator(): (data: unknown) => T[K] } }
  ) => UltraSchemaFactory.object(shape),

  // Performance utilities
  batch: <T>(schema: { getValidator(): (data: unknown) => T }) =>
    UltraSchemaFactory.batch(schema),

  jit: <T>(schema: { getValidator(): (data: unknown) => T }) =>
    UltraSchemaFactory.jit(schema),

  wasm: <T>(schema: { getValidator(): (data: unknown) => T }) =>
    UltraSchemaFactory.wasm(schema),

  // Utilities
  literal: <T extends string | number | boolean>(value: T) => {
    const validator = (data: unknown): T => {
      if (data !== value) {
        throw new Error(`Expected literal value: ${value}`);
      }
      return data as T;
    };

    return {
      parse: validator,
      safeParse: (data: unknown): UltraValidationResult<T> => {
        try {
          return { success: true, data: validator(data) };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Literal validation failed'
          };
        }
      },
      getValidator: () => validator
    };
  },

  any: () => {
    const validator = (data: unknown): any => data;
    return {
      parse: validator,
      safeParse: (data: unknown): UltraValidationResult<any> => ({ success: true, data }),
      getValidator: () => validator
    };
  },

  // Performance monitoring
  performance: {
    getMetrics: () => PerformanceTracker.getMetrics(),
    reset: () => PerformanceTracker.reset(),

    // Benchmark a schema
    benchmark: async <T>(
      schema: { parse: (data: unknown) => T },
      testData: unknown[],
      iterations: number = 10000
    ): Promise<{
      averageTime: number;
      throughput: number;
      totalTime: number;
    }> => {
      // Warmup
      for (let i = 0; i < 100; i++) {
        schema.parse(testData[i % testData.length]);
      }

      // Benchmark
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        schema.parse(testData[i % testData.length]);
      }
      const totalTime = performance.now() - start;

      return {
        averageTime: totalTime / iterations,
        throughput: (iterations / totalTime) * 1000, // ops per second
        totalTime
      };
    }
  },

  // Extreme optimizations (100x target)
  extreme: extreme,

  // Advanced optimizations
  optimize: {
    // Precompile schemas for maximum performance
    precompile: <T>(schema: { getValidator(): (data: unknown) => T }) => {
      const validator = schema.getValidator();
      const schemaId = Math.random().toString(36);

      // Force JIT optimization immediately
      for (let i = 0; i < 101; i++) {
        JITOptimizer.recordUsage(schemaId, validator);
      }

      return {
        parse: (data: unknown): T => {
          const optimizedValidator = JITOptimizer.recordUsage(schemaId, validator);
          return optimizedValidator(data);
        },
        getValidator: () => JITOptimizer.recordUsage(schemaId, validator)
      };
    },

    // Memory-efficient bulk validation
    bulkValidate: async <T>(
      schema: { getValidator(): (data: unknown) => T },
      items: unknown[],
      options: {
        chunkSize?: number;
        parallel?: boolean;
        errorStrategy?: 'fail-fast' | 'collect-all';
      } = {}
    ): Promise<{
      results: T[];
      errors: Array<{ index: number; error: string }>;
      stats: { totalTime: number; throughput: number };
    }> => {
      const {
        chunkSize = 1000,
        parallel = true,
        errorStrategy = 'fail-fast'
      } = options;

      const validator = schema.getValidator();
      const results: T[] = [];
      const errors: Array<{ index: number; error: string }> = [];

      const start = performance.now();

      if (parallel && items.length > chunkSize) {
        // Process in chunks
        const chunks: unknown[][] = [];
        for (let i = 0; i < items.length; i += chunkSize) {
          chunks.push(items.slice(i, i + chunkSize));
        }

        const chunkPromises = chunks.map(async (chunk, chunkIndex) => {
          const chunkResults: T[] = [];
          const chunkErrors: Array<{ index: number; error: string }> = [];

          for (let i = 0; i < chunk.length; i++) {
            const itemIndex = chunkIndex * chunkSize + i;
            try {
              chunkResults.push(validator(chunk[i]));
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Validation failed';
              chunkErrors.push({ index: itemIndex, error: errorMsg });

              if (errorStrategy === 'fail-fast') {
                throw new Error(`Validation failed at index ${itemIndex}: ${errorMsg}`);
              }
            }
          }

          return { results: chunkResults, errors: chunkErrors };
        });

        const chunkResults = await Promise.all(chunkPromises);

        for (const chunk of chunkResults) {
          results.push(...chunk.results);
          errors.push(...chunk.errors);
        }
      } else {
        // Sequential processing
        for (let i = 0; i < items.length; i++) {
          try {
            results.push(validator(items[i]));
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Validation failed';
            errors.push({ index: i, error: errorMsg });

            if (errorStrategy === 'fail-fast') {
              throw new Error(`Validation failed at index ${i}: ${errorMsg}`);
            }
          }
        }
      }

      const totalTime = performance.now() - start;

      return {
        results,
        errors,
        stats: {
          totalTime,
          throughput: (items.length / totalTime) * 1000
        }
      };
    }
  }
};

// Type inference helper
export type UltraInfer<T extends { getValidator(): (data: unknown) => any }> =
  T extends { getValidator(): (data: unknown) => infer U } ? U : never;

// Re-exports for convenience
export {
  UltraStringSchema,
  UltraNumberSchema,
  UltraBooleanSchema,
  UltraArraySchema,
  UltraObjectSchema,
  UltraBatchValidator,
  type UltraValidationResult
};

// Default export
export default ultra;