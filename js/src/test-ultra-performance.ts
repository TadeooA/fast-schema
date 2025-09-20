// Quick test of ultra-performance implementation
import { fast } from './api';

// Simple performance test
async function quickUltraTest() {
  console.log('🚀 Quick Ultra-Performance Test\n');

  // Test 1: String validation speed comparison
  console.log('📊 String Validation Speed Test');

  const standardStringSchema = fast.string().email();
  const ultraStringSchema = fast.ultra.string().email();
  const extremeStringSchema = fast.ultra.extreme.string().email();

  const testEmail = 'test@example.com';
  const iterations = 100000;

  // Standard mode benchmark
  console.log(`Testing standard mode with ${iterations.toLocaleString()} iterations...`);
  const standardStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    standardStringSchema.parse(testEmail);
  }
  const standardTime = performance.now() - standardStart;

  // Ultra mode benchmark
  console.log(`Testing ultra mode with ${iterations.toLocaleString()} iterations...`);
  const ultraStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    ultraStringSchema.parse(testEmail);
  }
  const ultraTime = performance.now() - ultraStart;

  // Extreme mode benchmark
  console.log(`Testing EXTREME mode with ${iterations.toLocaleString()} iterations...`);
  const extremeStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    extremeStringSchema.parse(testEmail);
  }
  const extremeTime = performance.now() - extremeStart;

  // Results
  const ultraImprovement = standardTime / ultraTime;
  const extremeImprovement = standardTime / extremeTime;
  const standardAvg = standardTime / iterations;
  const ultraAvg = ultraTime / iterations;
  const extremeAvg = extremeTime / iterations;
  const standardThroughput = (iterations / standardTime) * 1000;
  const ultraThroughput = (iterations / ultraTime) * 1000;
  const extremeThroughput = (iterations / extremeTime) * 1000;

  console.log('\n📈 Results:');
  console.log(`Standard: ${standardTime.toFixed(2)}ms total, ${standardAvg.toFixed(6)}ms avg, ${Math.round(standardThroughput).toLocaleString()} ops/sec`);
  console.log(`Ultra:    ${ultraTime.toFixed(2)}ms total, ${ultraAvg.toFixed(6)}ms avg, ${Math.round(ultraThroughput).toLocaleString()} ops/sec`);
  console.log(`EXTREME:  ${extremeTime.toFixed(2)}ms total, ${extremeAvg.toFixed(6)}ms avg, ${Math.round(extremeThroughput).toLocaleString()} ops/sec`);
  console.log(`\n🔥 Ultra Improvement: ${ultraImprovement.toFixed(2)}x faster!`);
  console.log(`🚀 EXTREME Improvement: ${extremeImprovement.toFixed(2)}x faster!`);

  const bestImprovement = Math.max(ultraImprovement, extremeImprovement);

  if (bestImprovement >= 100) {
    console.log('🎉 INCREDIBLE! 100x+ improvement achieved!');
  } else if (bestImprovement >= 50) {
    console.log('🔥 AMAZING! 50x+ improvement achieved!');
  } else if (bestImprovement >= 20) {
    console.log('🚀 EXCELLENT! 20x+ improvement achieved!');
  } else if (bestImprovement >= 10) {
    console.log('✅ Great! 10x+ improvement achieved!');
  } else if (bestImprovement >= 5) {
    console.log('⚡ Good! 5x+ improvement achieved!');
  } else {
    console.log('⚠️  Needs more optimization for ultra-performance target.');
  }

  // Test 2: Object validation
  console.log('\n📊 Object Validation Speed Test');

  const standardObjectSchema = fast.object({
    id: fast.string(),
    name: fast.string().min(2),
    email: fast.string().email(),
    age: fast.number().min(0).max(120)
  });

  const ultraObjectSchema = fast.ultra.object({
    id: fast.ultra.string(),
    name: fast.ultra.string().min(2),
    email: fast.ultra.string().email(),
    age: fast.ultra.number().min(0).max(120)
  });

  const extremeObjectSchema = fast.ultra.extreme.object({
    id: fast.ultra.extreme.string(),
    name: fast.ultra.extreme.string().min(2),
    email: fast.ultra.extreme.string().email(),
    age: fast.ultra.extreme.number().min(0).max(120)
  });

  const testObject = {
    id: 'user123',
    name: 'Test User',
    email: 'user@example.com',
    age: 25
  };

  const objectIterations = 50000;

  // Standard object validation
  const standardObjectStart = performance.now();
  for (let i = 0; i < objectIterations; i++) {
    standardObjectSchema.parse(testObject);
  }
  const standardObjectTime = performance.now() - standardObjectStart;

  // Ultra object validation
  const ultraObjectStart = performance.now();
  for (let i = 0; i < objectIterations; i++) {
    ultraObjectSchema.parse(testObject);
  }
  const ultraObjectTime = performance.now() - ultraObjectStart;

  const objectImprovement = standardObjectTime / ultraObjectTime;
  const standardObjectAvg = standardObjectTime / objectIterations;
  const ultraObjectAvg = ultraObjectTime / objectIterations;

  console.log(`\nObject validation with ${objectIterations.toLocaleString()} iterations:`);
  console.log(`Standard: ${standardObjectTime.toFixed(2)}ms total, ${standardObjectAvg.toFixed(6)}ms avg`);
  console.log(`Ultra:    ${ultraObjectTime.toFixed(2)}ms total, ${ultraObjectAvg.toFixed(6)}ms avg`);
  console.log(`🔥 Object Improvement: ${objectImprovement.toFixed(2)}x faster!`);

  // Test 3: Batch validation
  console.log('\n📊 Batch Validation Speed Test');

  const itemSchema = fast.ultra.object({
    id: fast.ultra.number(),
    name: fast.ultra.string(),
    active: fast.ultra.boolean()
  });

  const batchValidator = fast.ultra.batch(itemSchema);
  const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    active: i % 2 === 0
  }));

  console.log(`Batch validating ${largeDataset.length.toLocaleString()} items...`);

  // Individual validation
  const individualStart = performance.now();
  for (const item of largeDataset) {
    itemSchema.parse(item);
  }
  const individualTime = performance.now() - individualStart;

  // Batch validation
  const batchStart = performance.now();
  batchValidator.parseMany(largeDataset);
  const batchTime = performance.now() - batchStart;

  const batchImprovement = individualTime / batchTime;
  const individualThroughput = (largeDataset.length / individualTime) * 1000;
  const batchThroughput = (largeDataset.length / batchTime) * 1000;

  console.log(`Individual: ${individualTime.toFixed(2)}ms (${Math.round(individualThroughput).toLocaleString()} items/sec)`);
  console.log(`Batch:      ${batchTime.toFixed(2)}ms (${Math.round(batchThroughput).toLocaleString()} items/sec)`);
  console.log(`🔥 Batch Improvement: ${batchImprovement.toFixed(2)}x faster!`);

  // Summary
  console.log('\n🎯 SUMMARY');
  console.log('==========');
  console.log(`String validation: ${bestImprovement.toFixed(2)}x improvement`);
  console.log(`Object validation: ${objectImprovement.toFixed(2)}x improvement`);
  console.log(`Batch validation: ${batchImprovement.toFixed(2)}x improvement`);

  const maxImprovement = Math.max(bestImprovement, objectImprovement, batchImprovement);
  console.log(`\n🏆 Maximum improvement: ${maxImprovement.toFixed(2)}x`);

  if (maxImprovement >= 100) {
    console.log('🎉 100x TARGET ACHIEVED! 🎉');
  } else if (maxImprovement >= 50) {
    console.log('🚀 50x+ improvement! Very close to 100x target!');
  } else if (maxImprovement >= 20) {
    console.log('⚡ 20x+ improvement! Good progress toward 100x target!');
  } else {
    console.log('📈 Good improvement! More optimization needed for 100x target.');
  }

  // Test performance monitoring
  console.log('\n📊 Performance Metrics:');
  const metrics = fast.ultra.performance.getMetrics();
  for (const [operation, stats] of Object.entries(metrics)) {
    console.log(`${operation}: ${stats.avgTime.toFixed(6)}ms avg (${stats.totalCalls} calls)`);
  }
}

// Run the test
quickUltraTest().catch(console.error);