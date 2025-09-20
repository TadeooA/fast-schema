/**
 * AJV vs Fast-Schema Performance Benchmark
 * Compares Fast-Schema against AJV, one of the fastest JSON validators
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { fast } from '../api';

interface BenchmarkResult {
  name: string;
  ajv: {
    time: number;
    throughput: number;
    avgTime: number;
  };
  fastSchema: {
    time: number;
    throughput: number;
    avgTime: number;
  };
  improvement: number;
  speedup: string;
}

export class AjvVsFastSchemaBenchmark {
  private iterations = 100000;
  private ajv: Ajv;

  constructor() {
    // Initialize AJV with formats
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
  }

  async benchmarkStringValidation(): Promise<BenchmarkResult> {
    console.log('🔥 STRING VALIDATION: AJV vs Fast-Schema ULTRA');
    console.log('===============================================\n');

    const testEmails = [
      'user@example.com',
      'test@domain.org',
      'admin@company.net',
      'developer@startup.io',
      'contact@business.com',
      'support@service.co.uk',
      'info@website.info',
      'hello@world.net'
    ];

    // AJV schema
    const ajvSchema = this.ajv.compile({
      type: 'string',
      format: 'email',
      minLength: 5,
      maxLength: 100
    });

    // Fast-Schema ULTRA (maximum capacity)
    const fastSchema = fast.performance.ultra.precompile(
      fast.performance.ultra.string().email().min(5).max(100)
    );

    console.log(`Testing ${this.iterations.toLocaleString()} string validations...\n`);

    // Benchmark AJV
    console.log('Testing AJV...');
    const ajvStart = performance.now();
    for (let i = 0; i < this.iterations; i++) {
      const email = testEmails[i % testEmails.length];
      const valid = ajvSchema(email);
      if (!valid) {
        // Handle validation error (for fair comparison)
        ajvSchema.errors;
      }
    }
    const ajvTime = performance.now() - ajvStart;

    // Benchmark Fast-Schema ULTRA
    console.log('Testing Fast-Schema ULTRA...');
    const fastStart = performance.now();
    for (let i = 0; i < this.iterations; i++) {
      const email = testEmails[i % testEmails.length];
      try {
        fastSchema.parse(email);
      } catch (error) {
        // Handle validation error (for fair comparison)
      }
    }
    const fastTime = performance.now() - fastStart;

    const improvement = ajvTime / fastTime;

    return {
      name: 'String Email Validation',
      ajv: {
        time: ajvTime,
        throughput: (this.iterations / ajvTime) * 1000,
        avgTime: ajvTime / this.iterations
      },
      fastSchema: {
        time: fastTime,
        throughput: (this.iterations / fastTime) * 1000,
        avgTime: fastTime / this.iterations
      },
      improvement,
      speedup: `${improvement.toFixed(1)}x faster`
    };
  }

  async benchmarkObjectValidation(): Promise<BenchmarkResult> {
    console.log('\n🔥 OBJECT VALIDATION: AJV vs Fast-Schema ULTRA');
    console.log('==============================================\n');

    const testUsers = Array.from({ length: 50 }, (_, i) => ({
      id: `user_${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + (i % 50),
      isActive: i % 2 === 0,
      preferences: {
        theme: i % 2 === 0 ? 'light' : 'dark',
        notifications: i % 3 === 0,
        language: 'en'
      },
      tags: [`tag${i % 5}`, `category${i % 3}`]
    }));

    // AJV schema
    const ajvUserSchema = this.ajv.compile({
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string', minLength: 2, maxLength: 50 },
        email: { type: 'string', format: 'email' },
        age: { type: 'number', minimum: 0, maximum: 120 },
        isActive: { type: 'boolean' },
        preferences: {
          type: 'object',
          properties: {
            theme: { type: 'string' },
            notifications: { type: 'boolean' },
            language: { type: 'string', minLength: 2, maxLength: 5 }
          },
          required: ['theme', 'notifications', 'language'],
          additionalProperties: false
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          maxItems: 10
        }
      },
      required: ['id', 'name', 'email', 'age', 'isActive', 'preferences', 'tags'],
      additionalProperties: false
    });

    // Fast-Schema ULTRA (pre-compiled for maximum speed)
    const fastUserSchema = fast.performance.ultra.precompile(
      fast.performance.ultra.object({
        id: fast.performance.ultra.string(),
        name: fast.performance.ultra.string().min(2).max(50),
        email: fast.performance.ultra.string().email(),
        age: fast.performance.ultra.number().min(0).max(120),
        isActive: fast.performance.ultra.boolean(),
        preferences: fast.performance.ultra.object({
          theme: fast.performance.ultra.string(),
          notifications: fast.performance.ultra.boolean(),
          language: fast.performance.ultra.string().min(2).max(5)
        }),
        tags: fast.performance.ultra.array(fast.performance.ultra.string()).max(10)
      })
    );

    const objectIterations = 50000;
    console.log(`Testing ${objectIterations.toLocaleString()} object validations...\n`);

    // Benchmark AJV
    console.log('Testing AJV objects...');
    const ajvStart = performance.now();
    for (let i = 0; i < objectIterations; i++) {
      const user = testUsers[i % testUsers.length];
      const valid = ajvUserSchema(user);
      if (!valid) {
        ajvUserSchema.errors;
      }
    }
    const ajvTime = performance.now() - ajvStart;

    // Benchmark Fast-Schema ULTRA
    console.log('Testing Fast-Schema ULTRA objects...');
    const fastStart = performance.now();
    for (let i = 0; i < objectIterations; i++) {
      const user = testUsers[i % testUsers.length];
      try {
        fastUserSchema.parse(user);
      } catch (error) {
        // Handle validation error
      }
    }
    const fastTime = performance.now() - fastStart;

    const improvement = ajvTime / fastTime;

    return {
      name: 'Complex Object Validation',
      ajv: {
        time: ajvTime,
        throughput: (objectIterations / ajvTime) * 1000,
        avgTime: ajvTime / objectIterations
      },
      fastSchema: {
        time: fastTime,
        throughput: (objectIterations / fastTime) * 1000,
        avgTime: fastTime / objectIterations
      },
      improvement,
      speedup: `${improvement.toFixed(1)}x faster`
    };
  }

  async benchmarkArrayValidation(): Promise<BenchmarkResult> {
    console.log('\n🔥 ARRAY VALIDATION: AJV vs Fast-Schema ULTRA');
    console.log('===========================================\n');

    // Large dataset for array processing
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      price: Math.round((Math.random() * 1000) * 100) / 100,
      category: `category_${i % 10}`,
      inStock: i % 3 === 0,
      tags: [`tag_${i % 5}`, `type_${i % 3}`]
    }));

    // AJV schema for individual items
    const ajvItemSchema = this.ajv.compile({
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string', minLength: 1 },
        price: { type: 'number', minimum: 0 },
        category: { type: 'string' },
        inStock: { type: 'boolean' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          maxItems: 5
        }
      },
      required: ['id', 'name', 'price', 'category', 'inStock', 'tags'],
      additionalProperties: false
    });

    // Fast-Schema ULTRA with batch processing
    const fastItemSchema = fast.performance.ultra.object({
      id: fast.performance.ultra.number(),
      name: fast.performance.ultra.string().min(1),
      price: fast.performance.ultra.number().min(0),
      category: fast.performance.ultra.string(),
      inStock: fast.performance.ultra.boolean(),
      tags: fast.performance.ultra.array(fast.performance.ultra.string()).max(5)
    });

    const fastBatchValidator = fast.performance.ultra.batch(fastItemSchema);

    const batchIterations = 100;
    console.log(`Testing ${batchIterations} iterations of ${largeDataset.length.toLocaleString()} items each...\n`);

    // Benchmark AJV (individual validation)
    console.log('Testing AJV array processing...');
    const ajvStart = performance.now();
    for (let iter = 0; iter < batchIterations; iter++) {
      for (const item of largeDataset) {
        const valid = ajvItemSchema(item);
        if (!valid) {
          ajvItemSchema.errors;
        }
      }
    }
    const ajvTime = performance.now() - ajvStart;

    // Benchmark Fast-Schema ULTRA (batch processing)
    console.log('Testing Fast-Schema ULTRA batch processing...');
    const fastStart = performance.now();
    for (let iter = 0; iter < batchIterations; iter++) {
      try {
        fastBatchValidator.parseMany(largeDataset);
      } catch (error) {
        // Handle batch errors
      }
    }
    const fastTime = performance.now() - fastStart;

    const totalItems = batchIterations * largeDataset.length;
    const improvement = ajvTime / fastTime;

    return {
      name: 'Large Array Processing',
      ajv: {
        time: ajvTime,
        throughput: (totalItems / ajvTime) * 1000,
        avgTime: ajvTime / totalItems
      },
      fastSchema: {
        time: fastTime,
        throughput: (totalItems / fastTime) * 1000,
        avgTime: fastTime / totalItems
      },
      improvement,
      speedup: `${improvement.toFixed(1)}x faster`
    };
  }

  async benchmarkComplexNestedValidation(): Promise<BenchmarkResult> {
    console.log('\n🔥 COMPLEX NESTED VALIDATION: AJV vs Fast-Schema ULTRA');
    console.log('====================================================\n');

    // Ultra-complex nested structure
    const complexData = Array.from({ length: 20 }, (_, i) => ({
      user: {
        id: `user_${i}`,
        profile: {
          personal: {
            name: `User ${i}`,
            email: `user${i}@example.com`,
            age: 20 + (i % 50)
          },
          settings: {
            preferences: {
              theme: i % 2 === 0 ? 'light' : 'dark',
              language: 'en',
              notifications: {
                email: i % 2 === 0,
                push: i % 3 === 0,
                sms: false
              }
            },
            privacy: {
              public: i % 4 === 0,
              analytics: true
            }
          }
        }
      },
      orders: Array.from({ length: i % 5 + 1 }, (_, j) => ({
        id: `order_${i}_${j}`,
        items: Array.from({ length: j % 3 + 1 }, (_, k) => ({
          productId: `prod_${k}`,
          quantity: k + 1,
          price: Math.round(Math.random() * 100 * 100) / 100
        })),
        total: Math.round(Math.random() * 500 * 100) / 100,
        status: ['pending', 'processing', 'shipped', 'delivered'][j % 4]
      })),
      metadata: {
        createdAt: Date.now(),
        source: 'api',
        version: '1.0'
      }
    }));

    // AJV ultra-complex schema
    const ajvComplexSchema = this.ajv.compile({
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            profile: {
              type: 'object',
              properties: {
                personal: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', minLength: 2 },
                    email: { type: 'string', format: 'email' },
                    age: { type: 'number', minimum: 0, maximum: 120 }
                  },
                  required: ['name', 'email', 'age'],
                  additionalProperties: false
                },
                settings: {
                  type: 'object',
                  properties: {
                    preferences: {
                      type: 'object',
                      properties: {
                        theme: { type: 'string' },
                        language: { type: 'string', minLength: 2, maxLength: 5 },
                        notifications: {
                          type: 'object',
                          properties: {
                            email: { type: 'boolean' },
                            push: { type: 'boolean' },
                            sms: { type: 'boolean' }
                          },
                          required: ['email', 'push', 'sms'],
                          additionalProperties: false
                        }
                      },
                      required: ['theme', 'language', 'notifications'],
                      additionalProperties: false
                    },
                    privacy: {
                      type: 'object',
                      properties: {
                        public: { type: 'boolean' },
                        analytics: { type: 'boolean' }
                      },
                      required: ['public', 'analytics'],
                      additionalProperties: false
                    }
                  },
                  required: ['preferences', 'privacy'],
                  additionalProperties: false
                }
              },
              required: ['personal', 'settings'],
              additionalProperties: false
            }
          },
          required: ['id', 'profile'],
          additionalProperties: false
        },
        orders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    productId: { type: 'string' },
                    quantity: { type: 'number', minimum: 1 },
                    price: { type: 'number', minimum: 0 }
                  },
                  required: ['productId', 'quantity', 'price'],
                  additionalProperties: false
                }
              },
              total: { type: 'number', minimum: 0 },
              status: { type: 'string' }
            },
            required: ['id', 'items', 'total', 'status'],
            additionalProperties: false
          }
        },
        metadata: {
          type: 'object',
          properties: {
            createdAt: { type: 'number' },
            source: { type: 'string' },
            version: { type: 'string' }
          },
          required: ['createdAt', 'source', 'version'],
          additionalProperties: false
        }
      },
      required: ['user', 'orders', 'metadata'],
      additionalProperties: false
    });

    // Fast-Schema ULTRA (pre-compiled ultra-complex)
    const fastComplexSchema = fast.performance.ultra.precompile(
      fast.performance.ultra.object({
        user: fast.performance.ultra.object({
          id: fast.performance.ultra.string(),
          profile: fast.performance.ultra.object({
            personal: fast.performance.ultra.object({
              name: fast.performance.ultra.string().min(2),
              email: fast.performance.ultra.string().email(),
              age: fast.performance.ultra.number().min(0).max(120)
            }),
            settings: fast.performance.ultra.object({
              preferences: fast.performance.ultra.object({
                theme: fast.performance.ultra.string(),
                language: fast.performance.ultra.string().min(2).max(5),
                notifications: fast.performance.ultra.object({
                  email: fast.performance.ultra.boolean(),
                  push: fast.performance.ultra.boolean(),
                  sms: fast.performance.ultra.boolean()
                })
              }),
              privacy: fast.performance.ultra.object({
                public: fast.performance.ultra.boolean(),
                analytics: fast.performance.ultra.boolean()
              })
            })
          })
        }),
        orders: fast.performance.ultra.array(fast.performance.ultra.object({
          id: fast.performance.ultra.string(),
          items: fast.performance.ultra.array(fast.performance.ultra.object({
            productId: fast.performance.ultra.string(),
            quantity: fast.performance.ultra.number().min(1),
            price: fast.performance.ultra.number().min(0)
          })),
          total: fast.performance.ultra.number().min(0),
          status: fast.performance.ultra.string()
        })),
        metadata: fast.performance.ultra.object({
          createdAt: fast.performance.ultra.number(),
          source: fast.performance.ultra.string(),
          version: fast.performance.ultra.string()
        })
      })
    );

    const complexIterations = 10000;
    console.log(`Testing ${complexIterations.toLocaleString()} ultra-complex validations...\n`);

    // Benchmark AJV
    console.log('Testing AJV ultra-complex validation...');
    const ajvStart = performance.now();
    for (let i = 0; i < complexIterations; i++) {
      const data = complexData[i % complexData.length];
      const valid = ajvComplexSchema(data);
      if (!valid) {
        ajvComplexSchema.errors;
      }
    }
    const ajvTime = performance.now() - ajvStart;

    // Benchmark Fast-Schema ULTRA
    console.log('Testing Fast-Schema ULTRA complex validation...');
    const fastStart = performance.now();
    for (let i = 0; i < complexIterations; i++) {
      const data = complexData[i % complexData.length];
      try {
        fastComplexSchema.parse(data);
      } catch (error) {
        // Handle validation error
      }
    }
    const fastTime = performance.now() - fastStart;

    const improvement = ajvTime / fastTime;

    return {
      name: 'Ultra-Complex Nested Validation',
      ajv: {
        time: ajvTime,
        throughput: (complexIterations / ajvTime) * 1000,
        avgTime: ajvTime / complexIterations
      },
      fastSchema: {
        time: fastTime,
        throughput: (complexIterations / fastTime) * 1000,
        avgTime: fastTime / complexIterations
      },
      improvement,
      speedup: `${improvement.toFixed(1)}x faster`
    };
  }

  async runFullBenchmarkSuite(): Promise<BenchmarkResult[]> {
    console.log('🚀 AJV vs FAST-SCHEMA: PERFORMANCE SHOWDOWN');
    console.log('============================================');
    console.log('Testing Fast-Schema ULTRA tier against AJV (fastest JSON validator)\n');

    const results = await Promise.all([
      this.benchmarkStringValidation(),
      this.benchmarkObjectValidation(),
      this.benchmarkArrayValidation(),
      this.benchmarkComplexNestedValidation()
    ]);

    console.log('\n🏆 FINAL RESULTS SUMMARY');
    console.log('========================\n');

    let totalImprovement = 0;
    let maxImprovement = 0;
    let minImprovement = Infinity;

    for (const result of results) {
      console.log(`📊 ${result.name}:`);
      console.log(`   AJV:         ${result.ajv.time.toFixed(2)}ms (${Math.round(result.ajv.throughput).toLocaleString()} ops/sec)`);
      console.log(`   Fast-Schema: ${result.fastSchema.time.toFixed(2)}ms (${Math.round(result.fastSchema.throughput).toLocaleString()} ops/sec)`);

      if (result.improvement >= 1) {
        console.log(`   🚀 Result:   ${result.speedup} | ${((result.improvement - 1) * 100).toFixed(1)}% improvement\n`);
      } else {
        console.log(`   📊 Result:   ${(1 / result.improvement).toFixed(1)}x slower | ${((1 - result.improvement) * 100).toFixed(1)}% slower\n`);
      }

      totalImprovement += result.improvement;
      maxImprovement = Math.max(maxImprovement, result.improvement);
      minImprovement = Math.min(minImprovement, result.improvement);
    }

    const averageImprovement = totalImprovement / results.length;

    console.log('🎯 OVERALL PERFORMANCE ANALYSIS:');
    console.log(`   Average performance: ${averageImprovement >= 1 ? averageImprovement.toFixed(1) + 'x faster' : (1/averageImprovement).toFixed(1) + 'x slower'} than AJV`);
    console.log(`   Best case: ${maxImprovement.toFixed(1)}x ${maxImprovement >= 1 ? 'faster' : 'slower'} than AJV`);
    console.log(`   Worst case: ${minImprovement.toFixed(1)}x ${minImprovement >= 1 ? 'faster' : 'slower'} than AJV`);

    if (averageImprovement >= 2) {
      console.log('\n🎉 INCREDIBLE! Fast-Schema ULTRA delivers 2x+ average improvement over AJV!');
    } else if (averageImprovement >= 1.5) {
      console.log('\n🔥 AMAZING! Fast-Schema ULTRA delivers 1.5x+ average improvement over AJV!');
    } else if (averageImprovement >= 1) {
      console.log('\n⚡ EXCELLENT! Fast-Schema ULTRA is faster than AJV!');
    } else if (averageImprovement >= 0.8) {
      console.log('\n💪 COMPETITIVE! Fast-Schema ULTRA performs very close to AJV!');
    } else {
      console.log('\n📊 Fast-Schema ULTRA shows room for optimization against AJV');
    }

    console.log('\n💡 CONTEXT:');
    console.log('- AJV is widely considered the fastest JSON Schema validator');
    console.log('- AJV uses highly optimized compiled validators');
    console.log('- Fast-Schema combines Rust/WASM with TypeScript for unique advantages');
    console.log('- Both libraries excel in different scenarios and use cases');

    return results;
  }
}

// Export runner
export const runAjvVsFastSchemaBenchmark = async (): Promise<BenchmarkResult[]> => {
  const benchmark = new AjvVsFastSchemaBenchmark();
  return benchmark.runFullBenchmarkSuite();
};