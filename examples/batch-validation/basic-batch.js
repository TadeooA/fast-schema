// Basic Batch Validation Example
// Demonstrates concurrent validation of multiple items

const { z } = require('../../js/pkg/fast_schema');

async function basicBatchExample() {
  console.log('🚀 Basic Batch Validation Example\n');

  // Define schemas
  const userSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(100),
    email: z.string().email(),
    age: z.number().min(0).max(120).optional()
  });

  const productSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    price: z.number().positive(),
    category: z.string()
  });

  // Sample data
  const users = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28 },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34 },
    { id: 3, name: 'Charlie Brown', email: 'invalid-email', age: 22 }, // Invalid email
    { id: 4, name: '', email: 'david@example.com', age: 29 } // Invalid name
  ];

  const products = [
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
    { id: 2, name: 'Book', price: 19.99, category: 'Education' },
    { id: 3, name: 'Headphones', price: -50, category: 'Electronics' } // Invalid price
  ];

  console.log('📊 Validating users and products in batch...\n');

  // Create batch validation items
  const batchItems = [
    ...z.createBatch(userSchema, users, (index, data) => `user-${data.id}`),
    ...z.createBatch(productSchema, products, (index, data) => `product-${data.id}`)
  ];

  try {
    const startTime = Date.now();

    // Perform batch validation
    const results = await z.batchValidateAsync(batchItems, {
      maxConcurrency: 3,
      stopOnFirstError: false,
      timeout: 5000
    });

    const endTime = Date.now();

    console.log(`✅ Batch validation completed in ${endTime - startTime}ms\n`);

    // Group results
    const grouped = z.createBatchValidator().constructor.groupResults(results);

    console.log('📈 Validation Results:');
    console.log(`  ✅ Successful: ${grouped.successful.length}`);
    console.log(`  ❌ Failed: ${grouped.failed.length}\n`);

    // Show successful validations
    console.log('✅ Successful Validations:');
    grouped.successful.forEach(result => {
      console.log(`  ${result.id}: ${JSON.stringify(result.data).substring(0, 50)}...`);
    });

    // Show failed validations
    console.log('\n❌ Failed Validations:');
    grouped.failed.forEach(result => {
      console.log(`  ${result.id}: ${result.error.issues[0].message}`);
    });

    // Get detailed stats
    const validator = z.createBatchValidator();
    const stats = validator.getStats(results);

    console.log('\n📊 Performance Stats:');
    console.log(`  Total items: ${stats.total}`);
    console.log(`  Success rate: ${(stats.successful / stats.total * 100).toFixed(1)}%`);
    console.log(`  Average item duration: ${stats.avgItemDuration.toFixed(2)}ms`);
    console.log(`  Max concurrency: ${stats.maxConcurrency}`);

  } catch (error) {
    console.error('❌ Batch validation failed:', error.message);
  }
}

// Performance comparison example
async function performanceComparison() {
  console.log('\n\n🏁 Performance Comparison: Batch vs Sequential\n');

  const schema = z.object({
    id: z.number(),
    value: z.string().min(5).max(50)
  });

  // Generate test data
  const testData = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    value: `test-value-${i.toString().padStart(3, '0')}-with-some-length`
  }));

  // Sequential validation
  console.log('⏱️  Sequential validation...');
  const sequentialStart = Date.now();
  let sequentialSuccessful = 0;

  for (const item of testData) {
    try {
      schema.parse(item);
      sequentialSuccessful++;
    } catch (error) {
      // Handle error
    }
  }

  const sequentialEnd = Date.now();
  const sequentialTime = sequentialEnd - sequentialStart;

  // Batch validation
  console.log('⚡ Batch validation...');
  const batchStart = Date.now();

  const batchItems = z.createBatch(schema, testData);
  const batchResults = await z.batchValidateAsync(batchItems, {
    maxConcurrency: 5,
    stopOnFirstError: false
  });

  const batchEnd = Date.now();
  const batchTime = batchEnd - batchStart;
  const batchSuccessful = batchResults.filter(r => r.success).length;

  // Results
  console.log('\n📊 Performance Results:');
  console.log(`Sequential: ${sequentialTime}ms (${sequentialSuccessful} successful)`);
  console.log(`Batch:      ${batchTime}ms (${batchSuccessful} successful)`);
  console.log(`Speedup:    ${(sequentialTime / batchTime).toFixed(2)}x faster`);
  console.log(`Time saved: ${sequentialTime - batchTime}ms (${((sequentialTime - batchTime) / sequentialTime * 100).toFixed(1)}%)`);
}

// Run examples
async function main() {
  try {
    await basicBatchExample();
    await performanceComparison();
  } catch (error) {
    console.error('Example failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { basicBatchExample, performanceComparison };