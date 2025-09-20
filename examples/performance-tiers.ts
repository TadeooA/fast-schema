/**
 * Performance Tiers Examples
 * Shows how to use different performance levels
 */

import { fast } from '../js/src/api';

// Test data for benchmarking
const testUser = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  tags: ["developer", "typescript"],
  isActive: true,
  profile: {
    bio: "Software developer",
    website: "https://johndoe.dev",
    social: {
      twitter: "@johndoe",
      github: "johndoe"
    }
  }
};

console.log('=== Performance Tiers Comparison ===\n');

// 1. NORMAL Tier - Familiar API, good for development
console.log('🐌 NORMAL Tier (Development & Prototyping)');

const normalSchema = fast.performance.normal.object({
  id: fast.performance.normal.string(),
  name: fast.performance.normal.string().min(2).max(50),
  email: fast.performance.normal.string().email(),
  age: fast.performance.normal.number().int().min(0).max(120),
  tags: fast.performance.normal.array(fast.performance.normal.string()).max(10),
  isActive: fast.performance.normal.boolean(),
  profile: fast.performance.normal.object({
    bio: fast.performance.normal.string(),
    website: fast.performance.normal.string(),
    social: fast.performance.normal.object({
      twitter: fast.performance.normal.string(),
      github: fast.performance.normal.string()
    })
  })
});

const normalStart = performance.now();
for (let i = 0; i < 1000; i++) {
  normalSchema.parse(testUser);
}
const normalTime = performance.now() - normalStart;

console.log(`   ✅ 1,000 validations in ${normalTime.toFixed(2)}ms`);
console.log(`   📊 Throughput: ${Math.round(1000 / normalTime * 1000).toLocaleString()} ops/sec`);
console.log(`   💡 Best for: Development, prototyping, learning\n`);

// 2. FAST Tier - Production ready with WASM acceleration
console.log('⚡ FAST Tier (Production Applications)');

const fastSchema = fast.performance.fast.object({
  id: fast.performance.fast.string(),
  name: fast.performance.fast.string().min(2).max(50),
  email: fast.performance.fast.string().email(),
  age: fast.performance.fast.number().int().min(0).max(120),
  tags: fast.performance.fast.array(fast.performance.fast.string()).max(10),
  isActive: fast.performance.fast.boolean(),
  profile: fast.performance.fast.object({
    bio: fast.performance.fast.string(),
    website: fast.performance.fast.string(),
    social: fast.performance.fast.object({
      twitter: fast.performance.fast.string(),
      github: fast.performance.fast.string()
    })
  })
});

const fastStart = performance.now();
for (let i = 0; i < 1000; i++) {
  fastSchema.parse(testUser);
}
const fastTime = performance.now() - fastStart;

console.log(`   ✅ 1,000 validations in ${fastTime.toFixed(2)}ms`);
console.log(`   📊 Throughput: ${Math.round(1000 / fastTime * 1000).toLocaleString()} ops/sec`);
console.log(`   🚀 Speedup: ${(normalTime / fastTime).toFixed(1)}x faster than normal`);
console.log(`   💡 Best for: APIs, production apps, real-time validation\n`);

// 3. ULTRA Tier - Maximum performance with pre-compilation
console.log('🚀 ULTRA Tier (High-Throughput Systems)');

const ultraSchema = fast.performance.ultra.precompile(
  fast.performance.ultra.object({
    id: fast.performance.ultra.string(),
    name: fast.performance.ultra.string().min(2).max(50),
    email: fast.performance.ultra.string().email(),
    age: fast.performance.ultra.number().int().min(0).max(120),
    tags: fast.performance.ultra.array(fast.performance.ultra.string()).max(10),
    isActive: fast.performance.ultra.boolean(),
    profile: fast.performance.ultra.object({
      bio: fast.performance.ultra.string(),
      website: fast.performance.ultra.string(),
      social: fast.performance.ultra.object({
        twitter: fast.performance.ultra.string(),
        github: fast.performance.ultra.string()
      })
    })
  })
);

const ultraStart = performance.now();
for (let i = 0; i < 1000; i++) {
  ultraSchema.parse(testUser);
}
const ultraTime = performance.now() - ultraStart;

console.log(`   ✅ 1,000 validations in ${ultraTime.toFixed(2)}ms`);
console.log(`   📊 Throughput: ${Math.round(1000 / ultraTime * 1000).toLocaleString()} ops/sec`);
console.log(`   🚀 Speedup: ${(normalTime / ultraTime).toFixed(1)}x faster than normal`);
console.log(`   💡 Best for: High-traffic APIs, batch processing, real-time systems\n`);

// 4. Batch Processing Example
console.log('📦 ULTRA Batch Processing');

const batchData = Array.from({ length: 1000 }, (_, i) => ({
  ...testUser,
  id: `user_${i}`,
  name: `User ${i}`,
  email: `user${i}@example.com`
}));

const batchValidator = fast.performance.ultra.batch(ultraSchema);

const batchStart = performance.now();
const batchResults = batchValidator.parseMany(batchData);
const batchTime = performance.now() - batchStart;

console.log(`   ✅ 1,000 records processed in ${batchTime.toFixed(2)}ms`);
console.log(`   📊 Batch throughput: ${Math.round(1000 / batchTime * 1000).toLocaleString()} records/sec`);
console.log(`   🚀 Efficiency: ${(ultraTime / batchTime).toFixed(1)}x faster than individual parsing\n`);

// 5. Automatic Tier Selection
console.log('🎯 Automatic Tier Selection');

const autoTier = fast.performance.select({
  validationsPerSecond: 10000,
  dataSize: 'large',
  environment: 'production',
  priority: 'maximum-performance'
});

console.log(`   🎯 Selected tier: ${autoTier.tier}`);
console.log(`   📝 Reason: ${autoTier.description}`);

// 6. Performance Recommendations
console.log('\n💡 Performance Recommendations');

const recommendation = fast.performance.recommend({
  validationsPerSecond: 5000,
  environment: 'production'
});

console.log(`   🏆 Recommended tier: ${recommendation.tier.tier}`);
console.log(`   📋 Reasoning: ${recommendation.reasoning}`);
console.log(`   🔧 Migration tips:`);
recommendation.migration.forEach(tip => {
  console.log(`      • ${tip}`);
});

// 7. Performance Monitoring
console.log('\n📊 Performance Monitoring');

if (fast.wasm.isAvailable()) {
  console.log('   🚀 WASM acceleration: Available');

  const metrics = fast.wasm.getPerformanceMetrics();
  console.log(`   📈 Performance metrics:`, metrics);
} else {
  console.log('   ⚡ Running in pure TypeScript mode');
}

export {
  normalSchema,
  fastSchema,
  ultraSchema,
  batchValidator,
  testUser
};