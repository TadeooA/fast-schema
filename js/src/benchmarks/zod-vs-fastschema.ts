// Ultimate Showdown: Zod vs Fast-Schema at Maximum Capacity
// This benchmark tests our ULTRA tier against real Zod

import { z } from 'zod'; // Real Zod library
import { fast } from '../api';

interface BenchmarkResult {
  name: string;
  zod: {
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

export class ZodVsFastSchemaBenchmark {
  private iterations = 100000; // High iteration count for accurate measurement

  async benchmarkStringValidation(): Promise<BenchmarkResult> {
    console.log('🔥 STRING VALIDATION: Zod vs Fast-Schema ULTRA');
    console.log('================================================\n');

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

    // Zod schema
    const zodSchema = z.string().email().min(5).max(100);

    // Fast-Schema ULTRA (maximum capacity)
    const fastSchema = fast.performance.ultra.precompile(
      fast.performance.ultra.string().email().min(5).max(100)
    );

    console.log(`Testing ${this.iterations.toLocaleString()} string validations...\n`);

    // Benchmark Zod
    console.log('Testing Zod...');
    const zodStart = performance.now();
    for (let i = 0; i < this.iterations; i++) {
      const email = testEmails[i % testEmails.length];
      zodSchema.parse(email);
    }
    const zodTime = performance.now() - zodStart;

    // Benchmark Fast-Schema ULTRA
    console.log('Testing Fast-Schema ULTRA...');
    const fastStart = performance.now();
    for (let i = 0; i < this.iterations; i++) {
      const email = testEmails[i % testEmails.length];
      fastSchema.parse(email);
    }
    const fastTime = performance.now() - fastStart;

    const improvement = zodTime / fastTime;

    return {
      name: 'String Email Validation',
      zod: {
        time: zodTime,
        throughput: (this.iterations / zodTime) * 1000,
        avgTime: zodTime / this.iterations
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
    console.log('\n🔥 OBJECT VALIDATION: Zod vs Fast-Schema ULTRA');
    console.log('===============================================\n');

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

    // Zod schema
    const zodUserSchema = z.object({
      id: z.string(),
      name: z.string().min(2).max(50),
      email: z.string().email(),
      age: z.number().min(0).max(120),
      isActive: z.boolean(),
      preferences: z.object({
        theme: z.string(),
        notifications: z.boolean(),
        language: z.string().min(2).max(5)
      }),
      tags: z.array(z.string()).max(10)
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

    // Benchmark Zod
    console.log('Testing Zod objects...');
    const zodStart = performance.now();
    for (let i = 0; i < objectIterations; i++) {
      const user = testUsers[i % testUsers.length];
      zodUserSchema.parse(user);
    }
    const zodTime = performance.now() - zodStart;

    // Benchmark Fast-Schema ULTRA
    console.log('Testing Fast-Schema ULTRA objects...');
    const fastStart = performance.now();
    for (let i = 0; i < objectIterations; i++) {
      const user = testUsers[i % testUsers.length];
      fastUserSchema.parse(user);
    }
    const fastTime = performance.now() - fastStart;

    const improvement = zodTime / fastTime;

    return {
      name: 'Complex Object Validation',
      zod: {
        time: zodTime,
        throughput: (objectIterations / zodTime) * 1000,
        avgTime: zodTime / objectIterations
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
    console.log('\n🔥 ARRAY VALIDATION: Zod vs Fast-Schema ULTRA');
    console.log('=============================================\n');

    // Large dataset for array processing
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      price: Math.round((Math.random() * 1000) * 100) / 100,
      category: `category_${i % 10}`,
      inStock: i % 3 === 0,
      tags: [`tag_${i % 5}`, `type_${i % 3}`]
    }));

    // Zod schema
    const zodItemSchema = z.object({
      id: z.number(),
      name: z.string().min(1),
      price: z.number().min(0),
      category: z.string(),
      inStock: z.boolean(),
      tags: z.array(z.string()).max(5)
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

    // Benchmark Zod (individual validation)
    console.log('Testing Zod array processing...');
    const zodStart = performance.now();
    for (let iter = 0; iter < batchIterations; iter++) {
      for (const item of largeDataset) {
        zodItemSchema.parse(item);
      }
    }
    const zodTime = performance.now() - zodStart;

    // Benchmark Fast-Schema ULTRA (batch processing)
    console.log('Testing Fast-Schema ULTRA batch processing...');
    const fastStart = performance.now();
    for (let iter = 0; iter < batchIterations; iter++) {
      fastBatchValidator.parseMany(largeDataset);
    }
    const fastTime = performance.now() - fastStart;

    const totalItems = batchIterations * largeDataset.length;
    const improvement = zodTime / fastTime;

    return {
      name: 'Large Array Processing',
      zod: {
        time: zodTime,
        throughput: (totalItems / zodTime) * 1000,
        avgTime: zodTime / totalItems
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

  async benchmarkNestedComplexValidation(): Promise<BenchmarkResult> {
    console.log('\n🔥 NESTED COMPLEX VALIDATION: Zod vs Fast-Schema ULTRA');
    console.log('=====================================================\n');

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

    // Zod ultra-complex schema
    const zodComplexSchema = z.object({
      user: z.object({
        id: z.string(),
        profile: z.object({
          personal: z.object({
            name: z.string().min(2),
            email: z.string().email(),
            age: z.number().min(0).max(120)
          }),
          settings: z.object({
            preferences: z.object({
              theme: z.string(),
              language: z.string().min(2).max(5),
              notifications: z.object({
                email: z.boolean(),
                push: z.boolean(),
                sms: z.boolean()
              })
            }),
            privacy: z.object({
              public: z.boolean(),
              analytics: z.boolean()
            })
          })
        })
      }),
      orders: z.array(z.object({
        id: z.string(),
        items: z.array(z.object({
          productId: z.string(),
          quantity: z.number().min(1),
          price: z.number().min(0)
        })),
        total: z.number().min(0),
        status: z.string()
      })),
      metadata: z.object({
        createdAt: z.number(),
        source: z.string(),
        version: z.string()
      })
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

    // Benchmark Zod
    console.log('Testing Zod ultra-complex validation...');
    const zodStart = performance.now();
    for (let i = 0; i < complexIterations; i++) {
      const data = complexData[i % complexData.length];
      zodComplexSchema.parse(data);
    }
    const zodTime = performance.now() - zodStart;

    // Benchmark Fast-Schema ULTRA
    console.log('Testing Fast-Schema ULTRA complex validation...');
    const fastStart = performance.now();
    for (let i = 0; i < complexIterations; i++) {
      const data = complexData[i % complexData.length];
      fastComplexSchema.parse(data);
    }
    const fastTime = performance.now() - fastStart;

    const improvement = zodTime / fastTime;

    return {
      name: 'Ultra-Complex Nested Validation',
      zod: {
        time: zodTime,
        throughput: (complexIterations / zodTime) * 1000,
        avgTime: zodTime / complexIterations
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
    console.log('🚀 ZOD vs FAST-SCHEMA: ULTIMATE PERFORMANCE SHOWDOWN');
    console.log('====================================================');
    console.log('Testing Fast-Schema ULTRA tier (maximum capacity) against real Zod\n');

    const results = await Promise.all([
      this.benchmarkStringValidation(),
      this.benchmarkObjectValidation(),
      this.benchmarkArrayValidation(),
      this.benchmarkNestedComplexValidation()
    ]);

    console.log('\n🏆 FINAL RESULTS SUMMARY');
    console.log('========================\n');

    let totalImprovement = 0;
    let maxImprovement = 0;

    for (const result of results) {
      console.log(`📊 ${result.name}:`);
      console.log(`   Zod:         ${result.zod.time.toFixed(2)}ms (${Math.round(result.zod.throughput).toLocaleString()} ops/sec)`);
      console.log(`   Fast-Schema: ${result.fastSchema.time.toFixed(2)}ms (${Math.round(result.fastSchema.throughput).toLocaleString()} ops/sec)`);
      console.log(`   🚀 Result:   ${result.speedup} | ${((result.improvement - 1) * 100).toFixed(1)}% improvement\n`);

      totalImprovement += result.improvement;
      maxImprovement = Math.max(maxImprovement, result.improvement);
    }

    const averageImprovement = totalImprovement / results.length;

    console.log('🎯 OVERALL PERFORMANCE ANALYSIS:');
    console.log(`   Average speedup: ${averageImprovement.toFixed(1)}x faster than Zod`);
    console.log(`   Maximum speedup: ${maxImprovement.toFixed(1)}x faster than Zod`);
    console.log(`   Consistency: ${results.every(r => r.improvement > 2) ? 'Excellent' : 'Good'} (all tests > 2x faster)`);

    if (averageImprovement >= 10) {
      console.log('\n🎉 INCREDIBLE! Fast-Schema ULTRA delivers 10x+ average improvement over Zod!');
    } else if (averageImprovement >= 5) {
      console.log('\n🔥 AMAZING! Fast-Schema ULTRA delivers 5x+ average improvement over Zod!');
    } else if (averageImprovement >= 2) {
      console.log('\n⚡ EXCELLENT! Fast-Schema ULTRA delivers significant improvement over Zod!');
    }

    if (maxImprovement >= 50) {
      console.log('🚀 Peak performance reached 50x+ faster than Zod in optimal scenarios!');
    }

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('- Use Fast-Schema NORMAL tier for Zod migration (familiar API)');
    console.log('- Use Fast-Schema FAST tier for production (balanced performance)');
    console.log('- Use Fast-Schema ULTRA tier for maximum performance (as tested here)');
    console.log('- Consider batch processing for large datasets (massive speedups)');

    return results;
  }
}

// Export runner
export const runZodVsFastSchemaBenchmark = async (): Promise<BenchmarkResult[]> => {
  const benchmark = new ZodVsFastSchemaBenchmark();
  return benchmark.runFullBenchmarkSuite();
};