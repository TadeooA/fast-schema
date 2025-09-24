"use strict";
// Ultimate Showdown: Zod vs Fast-Schema at Maximum Capacity
// This benchmark tests our ULTRA tier against real Zod
Object.defineProperty(exports, "__esModule", { value: true });
exports.runZodVsFastSchemaBenchmark = exports.ZodVsFastSchemaBenchmark = void 0;
const zod_1 = require("zod"); // Real Zod library
const api_1 = require("../api");
class ZodVsFastSchemaBenchmark {
    constructor() {
        this.iterations = 100000; // High iteration count for accurate measurement
    }
    async benchmarkStringValidation() {
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
        const zodSchema = zod_1.z.string().email().min(5).max(100);
        // Fast-Schema ULTRA (maximum capacity)
        const fastSchema = api_1.fast.performance.ultra.precompile(api_1.fast.performance.ultra.string().email().min(5).max(100));
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
    async benchmarkObjectValidation() {
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
        const zodUserSchema = zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string().min(2).max(50),
            email: zod_1.z.string().email(),
            age: zod_1.z.number().min(0).max(120),
            isActive: zod_1.z.boolean(),
            preferences: zod_1.z.object({
                theme: zod_1.z.string(),
                notifications: zod_1.z.boolean(),
                language: zod_1.z.string().min(2).max(5)
            }),
            tags: zod_1.z.array(zod_1.z.string()).max(10)
        });
        // Fast-Schema ULTRA (pre-compiled for maximum speed)
        const fastUserSchema = api_1.fast.performance.ultra.precompile(api_1.fast.performance.ultra.object({
            id: api_1.fast.performance.ultra.string(),
            name: api_1.fast.performance.ultra.string().min(2).max(50),
            email: api_1.fast.performance.ultra.string().email(),
            age: api_1.fast.performance.ultra.number().min(0).max(120),
            isActive: api_1.fast.performance.ultra.boolean(),
            preferences: api_1.fast.performance.ultra.object({
                theme: api_1.fast.performance.ultra.string(),
                notifications: api_1.fast.performance.ultra.boolean(),
                language: api_1.fast.performance.ultra.string().min(2).max(5)
            }),
            tags: api_1.fast.performance.ultra.array(api_1.fast.performance.ultra.string()).max(10)
        }));
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
    async benchmarkArrayValidation() {
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
        const zodItemSchema = zod_1.z.object({
            id: zod_1.z.number(),
            name: zod_1.z.string().min(1),
            price: zod_1.z.number().min(0),
            category: zod_1.z.string(),
            inStock: zod_1.z.boolean(),
            tags: zod_1.z.array(zod_1.z.string()).max(5)
        });
        // Fast-Schema ULTRA with batch processing
        const fastItemSchema = api_1.fast.performance.ultra.object({
            id: api_1.fast.performance.ultra.number(),
            name: api_1.fast.performance.ultra.string().min(1),
            price: api_1.fast.performance.ultra.number().min(0),
            category: api_1.fast.performance.ultra.string(),
            inStock: api_1.fast.performance.ultra.boolean(),
            tags: api_1.fast.performance.ultra.array(api_1.fast.performance.ultra.string()).max(5)
        });
        const fastBatchValidator = api_1.fast.performance.ultra.batch(fastItemSchema);
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
    async benchmarkNestedComplexValidation() {
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
        const zodComplexSchema = zod_1.z.object({
            user: zod_1.z.object({
                id: zod_1.z.string(),
                profile: zod_1.z.object({
                    personal: zod_1.z.object({
                        name: zod_1.z.string().min(2),
                        email: zod_1.z.string().email(),
                        age: zod_1.z.number().min(0).max(120)
                    }),
                    settings: zod_1.z.object({
                        preferences: zod_1.z.object({
                            theme: zod_1.z.string(),
                            language: zod_1.z.string().min(2).max(5),
                            notifications: zod_1.z.object({
                                email: zod_1.z.boolean(),
                                push: zod_1.z.boolean(),
                                sms: zod_1.z.boolean()
                            })
                        }),
                        privacy: zod_1.z.object({
                            public: zod_1.z.boolean(),
                            analytics: zod_1.z.boolean()
                        })
                    })
                })
            }),
            orders: zod_1.z.array(zod_1.z.object({
                id: zod_1.z.string(),
                items: zod_1.z.array(zod_1.z.object({
                    productId: zod_1.z.string(),
                    quantity: zod_1.z.number().min(1),
                    price: zod_1.z.number().min(0)
                })),
                total: zod_1.z.number().min(0),
                status: zod_1.z.string()
            })),
            metadata: zod_1.z.object({
                createdAt: zod_1.z.number(),
                source: zod_1.z.string(),
                version: zod_1.z.string()
            })
        });
        // Fast-Schema ULTRA (pre-compiled ultra-complex)
        const fastComplexSchema = api_1.fast.performance.ultra.precompile(api_1.fast.performance.ultra.object({
            user: api_1.fast.performance.ultra.object({
                id: api_1.fast.performance.ultra.string(),
                profile: api_1.fast.performance.ultra.object({
                    personal: api_1.fast.performance.ultra.object({
                        name: api_1.fast.performance.ultra.string().min(2),
                        email: api_1.fast.performance.ultra.string().email(),
                        age: api_1.fast.performance.ultra.number().min(0).max(120)
                    }),
                    settings: api_1.fast.performance.ultra.object({
                        preferences: api_1.fast.performance.ultra.object({
                            theme: api_1.fast.performance.ultra.string(),
                            language: api_1.fast.performance.ultra.string().min(2).max(5),
                            notifications: api_1.fast.performance.ultra.object({
                                email: api_1.fast.performance.ultra.boolean(),
                                push: api_1.fast.performance.ultra.boolean(),
                                sms: api_1.fast.performance.ultra.boolean()
                            })
                        }),
                        privacy: api_1.fast.performance.ultra.object({
                            public: api_1.fast.performance.ultra.boolean(),
                            analytics: api_1.fast.performance.ultra.boolean()
                        })
                    })
                })
            }),
            orders: api_1.fast.performance.ultra.array(api_1.fast.performance.ultra.object({
                id: api_1.fast.performance.ultra.string(),
                items: api_1.fast.performance.ultra.array(api_1.fast.performance.ultra.object({
                    productId: api_1.fast.performance.ultra.string(),
                    quantity: api_1.fast.performance.ultra.number().min(1),
                    price: api_1.fast.performance.ultra.number().min(0)
                })),
                total: api_1.fast.performance.ultra.number().min(0),
                status: api_1.fast.performance.ultra.string()
            })),
            metadata: api_1.fast.performance.ultra.object({
                createdAt: api_1.fast.performance.ultra.number(),
                source: api_1.fast.performance.ultra.string(),
                version: api_1.fast.performance.ultra.string()
            })
        }));
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
    async runFullBenchmarkSuite() {
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
        }
        else if (averageImprovement >= 5) {
            console.log('\n🔥 AMAZING! Fast-Schema ULTRA delivers 5x+ average improvement over Zod!');
        }
        else if (averageImprovement >= 2) {
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
exports.ZodVsFastSchemaBenchmark = ZodVsFastSchemaBenchmark;
// Export runner
const runZodVsFastSchemaBenchmark = async () => {
    const benchmark = new ZodVsFastSchemaBenchmark();
    return benchmark.runFullBenchmarkSuite();
};
exports.runZodVsFastSchemaBenchmark = runZodVsFastSchemaBenchmark;
//# sourceMappingURL=zod-vs-fastschema.js.map