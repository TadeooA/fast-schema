// Advanced Batch Validation Example
// Demonstrates sophisticated batch validation scenarios

const { z } = require('../../js/pkg/fast_schema');

// Simulate async validation (e.g., database checks)
async function checkUniqueEmail(email) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Simulate database check
  const existingEmails = ['admin@example.com', 'test@example.com'];
  return !existingEmails.includes(email);
}

async function advancedBatchExample() {
  console.log('🚀 Advanced Batch Validation Example\n');

  // Complex schema with async refinement
  const userSchema = z.object({
    id: z.number().int().positive(),
    username: z.string().min(3).max(20),
    email: z.string().email(),
    profile: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      age: z.number().min(13).max(120),
      preferences: z.object({
        newsletter: z.boolean(),
        notifications: z.boolean()
      })
    }),
    tags: z.array(z.string()).max(5)
  }).refineAsync(async (data) => {
    return await checkUniqueEmail(data.email);
  }, 'Email already exists');

  // Complex test data with nested structures
  const users = [
    {
      id: 1,
      username: 'alice123',
      email: 'alice@example.com',
      profile: {
        firstName: 'Alice',
        lastName: 'Johnson',
        age: 28,
        preferences: {
          newsletter: true,
          notifications: false
        }
      },
      tags: ['developer', 'javascript']
    },
    {
      id: 2,
      username: 'bob',
      email: 'admin@example.com', // This will fail async validation
      profile: {
        firstName: 'Bob',
        lastName: 'Smith',
        age: 34,
        preferences: {
          newsletter: false,
          notifications: true
        }
      },
      tags: ['designer', 'ui', 'ux']
    },
    {
      id: 3,
      username: 'charlie_brown',
      email: 'charlie@example.com',
      profile: {
        firstName: 'Charlie',
        lastName: 'Brown',
        age: 22,
        preferences: {
          newsletter: true,
          notifications: true
        }
      },
      tags: ['manager', 'product', 'strategy', 'planning', 'leadership', 'extra'] // Too many tags
    },
    {
      id: 4,
      username: 'diana',
      email: 'invalid-email-format', // Invalid email format
      profile: {
        firstName: 'Diana',
        lastName: 'Wilson',
        age: 29,
        preferences: {
          newsletter: false,
          notifications: false
        }
      },
      tags: ['analyst']
    }
  ];

  console.log('📊 Processing complex user registrations with async validation...\n');

  // Create batch validator with custom configuration
  const batchValidator = z.createBatchValidator({
    maxConcurrency: 2, // Lower concurrency for async operations
    stopOnFirstError: false,
    timeout: 10000
  });

  try {
    const startTime = Date.now();

    // Create batch items with custom IDs
    const batchItems = users.map(user => ({
      schema: userSchema,
      data: user,
      id: `registration-${user.id}-${user.username}`
    }));

    // Perform batch validation
    const results = await batchValidator.validateAsync(batchItems);

    const endTime = Date.now();

    console.log(`✅ Batch validation completed in ${endTime - startTime}ms\n`);

    // Analyze results in detail
    const stats = batchValidator.getStats(results);
    console.log('📈 Detailed Results:');
    console.log(`  Total registrations: ${stats.total}`);
    console.log(`  Successful: ${stats.successful} (${(stats.successful / stats.total * 100).toFixed(1)}%)`);
    console.log(`  Failed: ${stats.failed} (${(stats.failed / stats.total * 100).toFixed(1)}%)`);
    console.log(`  Average processing time: ${stats.avgItemDuration.toFixed(2)}ms per user`);
    console.log(`  Total processing time: ${stats.duration.toFixed(2)}ms\n`);

    // Group and display results
    const grouped = batchValidator.constructor.groupResults(results);

    console.log('✅ Successful Registrations:');
    grouped.successful.forEach(result => {
      const user = result.data;
      console.log(`  ${result.id}:`);
      console.log(`    Name: ${user.profile.firstName} ${user.profile.lastName}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Processing time: ${result.duration}ms`);
    });

    console.log('\n❌ Failed Registrations:');
    grouped.failed.forEach(result => {
      console.log(`  ${result.id}:`);
      result.error.issues.forEach(issue => {
        const pathStr = issue.path.length > 0 ? ` (${issue.path.join('.')})` : '';
        console.log(`    - ${issue.message}${pathStr}`);
      });
      console.log(`    Processing time: ${result.duration}ms`);
    });

  } catch (error) {
    console.error('❌ Batch validation failed:', error.message);
  }
}

// Error handling and timeout demonstration
async function errorHandlingExample() {
  console.log('\n\n🔥 Error Handling and Timeout Example\n');

  // Schema that sometimes fails
  const unreliableSchema = z.object({
    id: z.number(),
    value: z.string()
  }).refineAsync(async (data) => {
    // Simulate varying processing times and failures
    const delay = Math.random() * 2000; // 0-2 seconds
    await new Promise(resolve => setTimeout(resolve, delay));

    // Randomly fail some validations
    if (Math.random() < 0.3) {
      throw new Error('Simulated async validation failure');
    }

    return true;
  }, 'Async validation failed');

  const testData = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    value: `item-${i + 1}`
  }));

  console.log('⏱️  Testing with 1 second timeout...');

  try {
    const batchValidator = z.createBatchValidator({
      maxConcurrency: 3,
      timeout: 1000, // 1 second timeout
      stopOnFirstError: false
    });

    const batchItems = z.createBatch(unreliableSchema, testData);
    const results = await batchValidator.validateAsync(batchItems);

    const stats = batchValidator.getStats(results);
    console.log(`\n📊 Results with timeout:`);
    console.log(`  Completed: ${stats.successful + stats.failed}/${stats.total}`);
    console.log(`  Success rate: ${(stats.successful / stats.total * 100).toFixed(1)}%`);

  } catch (error) {
    console.log(`❌ Batch validation timed out: ${error.message}`);
  }

  console.log('\n⏱️  Testing without timeout...');

  try {
    const batchValidator = z.createBatchValidator({
      maxConcurrency: 3,
      stopOnFirstError: false
      // No timeout
    });

    const batchItems = z.createBatch(unreliableSchema, testData);
    const startTime = Date.now();
    const results = await batchValidator.validateAsync(batchItems);
    const endTime = Date.now();

    const stats = batchValidator.getStats(results);
    console.log(`\n📊 Results without timeout (took ${endTime - startTime}ms):`);
    console.log(`  Completed: ${stats.successful + stats.failed}/${stats.total}`);
    console.log(`  Success rate: ${(stats.successful / stats.total * 100).toFixed(1)}%`);

  } catch (error) {
    console.log(`❌ Batch validation failed: ${error.message}`);
  }
}

// Memory efficient processing of large datasets
async function largeDatasetExample() {
  console.log('\n\n📦 Large Dataset Processing Example\n');

  const itemSchema = z.object({
    id: z.number(),
    data: z.string().min(10).max(100),
    timestamp: z.number().positive()
  });

  // Generate large dataset
  const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    data: `data-item-${i.toString().padStart(4, '0')}-with-sufficient-length-for-validation`,
    timestamp: Date.now() + i
  }));

  console.log(`🔢 Processing ${largeDataset.length} items...`);

  const batchValidator = z.createBatchValidator({
    maxConcurrency: 10, // Higher concurrency for simple validations
    stopOnFirstError: false
  });

  const startTime = Date.now();

  // Process in chunks to manage memory
  const chunkSize = 250;
  const chunks = [];
  for (let i = 0; i < largeDataset.length; i += chunkSize) {
    chunks.push(largeDataset.slice(i, i + chunkSize));
  }

  let totalSuccessful = 0;
  let totalFailed = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const batchItems = z.createBatch(itemSchema, chunk);
    const results = await batchValidator.validateAsync(batchItems);

    const chunkStats = batchValidator.getStats(results);
    totalSuccessful += chunkStats.successful;
    totalFailed += chunkStats.failed;

    console.log(`  Chunk ${i + 1}/${chunks.length}: ${chunkStats.successful}/${chunkStats.total} successful`);
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  console.log(`\n📊 Large Dataset Results:`);
  console.log(`  Total items: ${largeDataset.length}`);
  console.log(`  Successful: ${totalSuccessful} (${(totalSuccessful / largeDataset.length * 100).toFixed(1)}%)`);
  console.log(`  Failed: ${totalFailed} (${(totalFailed / largeDataset.length * 100).toFixed(1)}%)`);
  console.log(`  Total time: ${totalTime}ms`);
  console.log(`  Throughput: ${(largeDataset.length / totalTime * 1000).toFixed(0)} items/second`);
}

// Run all examples
async function main() {
  try {
    await advancedBatchExample();
    await errorHandlingExample();
    await largeDatasetExample();
  } catch (error) {
    console.error('Example failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { advancedBatchExample, errorHandlingExample, largeDatasetExample };