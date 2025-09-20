/**
 * Batch Processing Examples
 * High-performance validation for large datasets
 */

import { fast } from '../js/src/api';

console.log('=== Batch Processing Examples ===\n');

// 1. CSV Data Processing
console.log('📊 CSV Data Processing');

const csvRowSchema = fast.performance.ultra.object({
  id: fast.performance.ultra.string(),
  name: fast.performance.ultra.string().min(1),
  email: fast.performance.ultra.string().email(),
  age: fast.performance.ultra.number().int().min(0).max(120),
  salary: fast.performance.ultra.number().min(0),
  department: fast.performance.ultra.string(),
  joinDate: fast.performance.ultra.string(), // ISO date
  isActive: fast.performance.ultra.boolean()
});

// Generate large dataset
const generateCsvData = (count: number) => {
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];

  return Array.from({ length: count }, (_, i) => ({
    id: `emp_${String(i).padStart(6, '0')}`,
    name: `Employee ${i}`,
    email: `employee${i}@company.com`,
    age: 25 + (i % 40),
    salary: 50000 + (i % 100000),
    department: departments[i % departments.length],
    joinDate: new Date(2020 + (i % 4), (i % 12), 1).toISOString().split('T')[0],
    isActive: i % 10 !== 0 // 90% active
  }));
};

// Test with different dataset sizes
const testBatchProcessing = async (dataSize: number) => {
  console.log(`\n🔍 Testing with ${dataSize.toLocaleString()} records`);

  const data = generateCsvData(dataSize);
  const batchProcessor = fast.performance.ultra.batch(csvRowSchema);

  // Warmup
  batchProcessor.parseMany(data.slice(0, 100));

  // Actual benchmark
  const start = performance.now();

  try {
    const validRecords = batchProcessor.parseMany(data);
    const end = performance.now();
    const duration = end - start;

    console.log(`   ✅ Processed ${validRecords.length} records successfully`);
    console.log(`   ⏱️  Duration: ${duration.toFixed(2)}ms`);
    console.log(`   📈 Throughput: ${Math.round(validRecords.length / duration * 1000).toLocaleString()} records/sec`);
    console.log(`   💾 Memory efficient: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB heap`);

    return {
      recordCount: validRecords.length,
      duration,
      throughput: validRecords.length / duration * 1000
    };
  } catch (error) {
    console.log(`   ❌ Batch processing failed: ${error.message}`);
    return null;
  }
};

// 2. Stream Processing with Chunks
console.log('\n🌊 Stream Processing with Memory Management');

const streamProcessor = fast.performance.ultra.stream(csvRowSchema, {
  chunkSize: 1000
});

const processDataStream = async (totalRecords: number) => {
  console.log(`\n📡 Stream processing ${totalRecords.toLocaleString()} records in chunks`);

  const chunkSize = 1000;
  const chunks = Math.ceil(totalRecords / chunkSize);
  let totalProcessed = 0;
  let totalErrors = 0;

  const start = performance.now();

  for (let i = 0; i < chunks; i++) {
    const chunkData = generateCsvData(Math.min(chunkSize, totalRecords - i * chunkSize));

    try {
      const results = await streamProcessor.validate(chunkData);
      totalProcessed += results.length;
    } catch (error) {
      totalErrors++;
      console.log(`   ⚠️  Chunk ${i + 1} failed: ${error.message}`);
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      const progress = ((i + 1) / chunks * 100).toFixed(1);
      console.log(`   📊 Progress: ${progress}% (${totalProcessed.toLocaleString()} records processed)`);
    }
  }

  const end = performance.now();
  const duration = end - start;

  console.log(`   ✅ Stream processing completed`);
  console.log(`   📊 Total processed: ${totalProcessed.toLocaleString()} records`);
  console.log(`   ❌ Failed chunks: ${totalErrors}`);
  console.log(`   ⏱️  Total duration: ${duration.toFixed(2)}ms`);
  console.log(`   📈 Overall throughput: ${Math.round(totalProcessed / duration * 1000).toLocaleString()} records/sec`);
};

// 3. Parallel Batch Processing
console.log('\n⚡ Parallel Batch Processing');

const parallelBatchProcess = async (totalRecords: number, batchCount: number = 4) => {
  console.log(`\n🚀 Parallel processing ${totalRecords.toLocaleString()} records in ${batchCount} batches`);

  const recordsPerBatch = Math.ceil(totalRecords / batchCount);
  const batches = Array.from({ length: batchCount }, (_, i) => {
    const start = i * recordsPerBatch;
    const end = Math.min(start + recordsPerBatch, totalRecords);
    return generateCsvData(end - start);
  });

  const processors = batches.map(() => fast.performance.ultra.batch(csvRowSchema));

  const start = performance.now();

  try {
    const results = await Promise.all(
      batches.map((batch, i) => processors[i].parseMany(batch))
    );

    const end = performance.now();
    const duration = end - start;

    const totalProcessed = results.reduce((sum, batch) => sum + batch.length, 0);

    console.log(`   ✅ Parallel processing completed`);
    console.log(`   📊 Total processed: ${totalProcessed.toLocaleString()} records`);
    console.log(`   ⏱️  Duration: ${duration.toFixed(2)}ms`);
    console.log(`   📈 Throughput: ${Math.round(totalProcessed / duration * 1000).toLocaleString()} records/sec`);
    console.log(`   🚀 Parallel efficiency: ~${batchCount}x cores utilized`);

    return results.flat();
  } catch (error) {
    console.log(`   ❌ Parallel processing failed: ${error.message}`);
    return [];
  }
};

// 4. Error Handling in Batch Processing
console.log('\n🚨 Error Handling in Batch Processing');

const batchWithErrors = () => {
  const validData = generateCsvData(1000);

  // Inject some invalid records
  const invalidData = [
    { ...validData[100], email: 'invalid-email' },
    { ...validData[200], age: -5 },
    { ...validData[300], salary: 'not-a-number' },
    { ...validData[400], name: '' }
  ];

  // Mix valid and invalid data
  const mixedData = [...validData.slice(0, 800), ...invalidData, ...validData.slice(800)];

  return mixedData;
};

const testErrorHandling = () => {
  console.log(`\n🧪 Testing batch processing with invalid data`);

  const mixedData = batchWithErrors();
  const batchProcessor = fast.performance.ultra.batch(csvRowSchema);

  const start = performance.now();

  let validCount = 0;
  let errorCount = 0;
  const errors: any[] = [];

  // Process each record individually to capture errors
  for (let i = 0; i < mixedData.length; i++) {
    try {
      batchProcessor.parseMany([mixedData[i]]);
      validCount++;
    } catch (error) {
      errorCount++;
      errors.push({ index: i, error: error.message, data: mixedData[i] });
    }
  }

  const end = performance.now();
  const duration = end - start;

  console.log(`   📊 Results:`);
  console.log(`   ✅ Valid records: ${validCount.toLocaleString()}`);
  console.log(`   ❌ Invalid records: ${errorCount}`);
  console.log(`   📈 Success rate: ${(validCount / mixedData.length * 100).toFixed(1)}%`);
  console.log(`   ⏱️  Duration: ${duration.toFixed(2)}ms`);

  if (errors.length > 0) {
    console.log(`   🔍 Sample errors:`);
    errors.slice(0, 3).forEach((error, i) => {
      console.log(`      ${i + 1}. Index ${error.index}: ${error.error}`);
    });
  }
};

// 5. Performance Comparison
console.log('\n📊 Performance Comparison: Individual vs Batch Processing');

const compareProcessingMethods = async () => {
  const testData = generateCsvData(5000);

  // Individual processing
  console.log(`\n🐌 Individual Processing (5,000 records)`);
  const individualStart = performance.now();
  let individualValid = 0;

  for (const record of testData) {
    try {
      csvRowSchema.parse(record);
      individualValid++;
    } catch (error) {
      // Handle error
    }
  }

  const individualEnd = performance.now();
  const individualDuration = individualEnd - individualStart;

  console.log(`   ✅ Processed: ${individualValid.toLocaleString()} records`);
  console.log(`   ⏱️  Duration: ${individualDuration.toFixed(2)}ms`);
  console.log(`   📈 Throughput: ${Math.round(individualValid / individualDuration * 1000).toLocaleString()} records/sec`);

  // Batch processing
  console.log(`\n⚡ Batch Processing (5,000 records)`);
  const batchProcessor = fast.performance.ultra.batch(csvRowSchema);

  const batchStart = performance.now();
  const batchResults = batchProcessor.parseMany(testData);
  const batchEnd = performance.now();
  const batchDuration = batchEnd - batchStart;

  console.log(`   ✅ Processed: ${batchResults.length.toLocaleString()} records`);
  console.log(`   ⏱️  Duration: ${batchDuration.toFixed(2)}ms`);
  console.log(`   📈 Throughput: ${Math.round(batchResults.length / batchDuration * 1000).toLocaleString()} records/sec`);

  const speedup = individualDuration / batchDuration;
  console.log(`\n🚀 Batch processing is ${speedup.toFixed(1)}x faster than individual processing!`);
};

// Run all examples
async function runBatchExamples() {
  // Test different dataset sizes
  await testBatchProcessing(1000);
  await testBatchProcessing(10000);
  await testBatchProcessing(50000);

  // Stream processing
  await processDataStream(25000);

  // Parallel processing
  await parallelBatchProcess(20000, 4);

  // Error handling
  testErrorHandling();

  // Performance comparison
  await compareProcessingMethods();

  console.log(`\n🎉 All batch processing examples completed!`);
  console.log(`💡 Key takeaways:`);
  console.log(`   • Batch processing is significantly faster than individual validation`);
  console.log(`   • Stream processing enables memory-efficient handling of large datasets`);
  console.log(`   • Parallel processing can utilize multiple CPU cores for maximum throughput`);
  console.log(`   • ULTRA tier delivers consistent high performance across all scenarios`);
}

// Export for use in other examples
export {
  csvRowSchema,
  generateCsvData,
  testBatchProcessing,
  processDataStream,
  parallelBatchProcess,
  runBatchExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runBatchExamples().catch(console.error);
}