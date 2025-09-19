// Basic Validation Monitoring Example
// Demonstrates validation lifecycle tracking and events

const { z, globalValidationMonitor } = require('../../js/pkg/fast_schema');

async function basicMonitoringExample() {
  console.log('Validation Monitoring & Events Example\n');

  // Set up global monitoring
  console.log('Setting up global validation monitoring...\n');

  // Track validation success/failure counts
  let validationAttempts = 0;
  let validationSuccesses = 0;
  let validationErrors = 0;

  globalValidationMonitor.onValidationSuccess((event) => {
    validationSuccesses++;
    console.log(`SUCCESS: ${event.schemaType} validation completed in ${event.duration}ms`);
  });

  globalValidationMonitor.onValidationError((event) => {
    validationErrors++;
    console.log(`ERROR: ${event.schemaType} validation failed in ${event.duration}ms - ${event.error.message}`);
  });

  globalValidationMonitor.on('validation:start', (event) => {
    validationAttempts++;
    console.log(`START: ${event.schemaType} validation ${event.async ? 'async' : 'sync'} started`);
  });

  // Create test schemas
  const userSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(50),
    email: z.string().email(),
    age: z.number().min(0).max(120).optional()
  });

  const asyncUserSchema = userSchema.refineAsync(async (data) => {
    // Simulate API call to check if email is unique
    await new Promise(resolve => setTimeout(resolve, 100));
    return !data.email.includes('taken');
  }, 'Email is already taken');

  // Test data
  const validUsers = [
    { id: 1, name: 'Alice', email: 'alice@example.com', age: 28 },
    { id: 2, name: 'Bob', email: 'bob@example.com', age: 34 }
  ];

  const invalidUsers = [
    { id: 0, name: '', email: 'invalid-email', age: -5 }, // Multiple validation errors
    { id: 3, name: 'Charlie', email: 'charlie-taken@example.com', age: 25 } // Will fail async validation
  ];

  console.log('Running sync validation tests...\n');

  // Test sync validations
  for (const [index, user] of validUsers.entries()) {
    try {
      const result = userSchema.parse(user);
      console.log(`Valid user ${index + 1}: ${result.name}`);
    } catch (error) {
      console.log(`Invalid user ${index + 1}: ${error.message}`);
    }
  }

  // Test sync validation errors
  for (const [index, user] of invalidUsers.entries()) {
    try {
      const result = userSchema.parse(user);
      console.log(`Valid user ${index + 1}: ${result.name}`);
    } catch (error) {
      console.log(`Invalid user ${index + 1}: First error - ${error.issues[0].message}`);
    }
  }

  console.log('\nRunning async validation tests...\n');

  // Test async validations
  for (const [index, user] of validUsers.entries()) {
    try {
      const result = await asyncUserSchema.parseAsync(user);
      console.log(`Valid async user ${index + 1}: ${result.name}`);
    } catch (error) {
      console.log(`Invalid async user ${index + 1}: ${error.message}`);
    }
  }

  // Test async validation with failure
  try {
    const result = await asyncUserSchema.parseAsync(invalidUsers[1]);
    console.log(`Valid async user: ${result.name}`);
  } catch (error) {
    console.log(`Invalid async user: ${error.message}`);
  }

  // Display final statistics
  console.log('\nValidation Statistics:');
  console.log(`Total attempts: ${validationAttempts}`);
  console.log(`Successful: ${validationSuccesses}`);
  console.log(`Failed: ${validationErrors}`);
  console.log(`Success rate: ${(validationSuccesses / validationAttempts * 100).toFixed(1)}%`);

  // Get detailed statistics from global monitor
  const globalStats = globalValidationMonitor.getStatistics();
  console.log('\nGlobal Monitor Statistics:');
  console.log(`Sync validations: ${globalStats.validationCount}`);
  console.log(`Async validations: ${globalStats.asyncValidationCount}`);
  console.log(`Error count: ${globalStats.errorCount}`);
  console.log(`Average duration: ${globalStats.averageDuration.toFixed(2)}ms`);
  console.log(`Error rate: ${(globalStats.errorRate * 100).toFixed(1)}%`);
}

// Individual schema monitoring example
async function schemaInstanceMonitoring() {
  console.log('\n\nIndividual Schema Monitoring Example\n');

  // Create a schema with its own event listeners
  const productSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    price: z.number().positive(),
    category: z.string()
  });

  // Add event listeners to this specific schema instance
  productSchema.on('validation:start', (event) => {
    console.log(`Product validation started for: ${JSON.stringify(event.data).substring(0, 50)}...`);
  });

  productSchema.on('validation:success', (event) => {
    console.log(`Product validation succeeded in ${event.duration}ms`);
  });

  productSchema.on('validation:error', (event) => {
    console.log(`Product validation failed: ${event.error.issues[0].message}`);
  });

  // Test products
  const products = [
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
    { id: 2, name: 'Book', price: 19.99, category: 'Education' },
    { id: 0, name: '', price: -50, category: 'Invalid' } // Will fail validation
  ];

  console.log('Validating products with individual schema monitoring...\n');

  for (const [index, product] of products.entries()) {
    try {
      const result = productSchema.parse(product);
      console.log(`Valid product ${index + 1}: ${result.name}\n`);
    } catch (error) {
      console.log(`Invalid product ${index + 1}: Validation failed\n`);
    }
  }
}

// Batch validation monitoring example
async function batchValidationMonitoring() {
  console.log('\nBatch Validation Monitoring Example\n');

  // Set up batch-specific monitoring
  globalValidationMonitor.onBatchStart((event) => {
    console.log(`BATCH START: Processing ${event.itemCount} items with concurrency ${event.maxConcurrency}`);
  });

  globalValidationMonitor.onBatchComplete((event) => {
    console.log(`BATCH COMPLETE: ${event.successful}/${event.successful + event.failed} successful in ${event.duration}ms`);
    console.log(`  Average item duration: ${event.avgItemDuration.toFixed(2)}ms`);
  });

  // Track individual batch items
  let itemCount = 0;
  globalValidationMonitor.on('batch:item', (event) => {
    itemCount++;
    const status = event.success ? 'SUCCESS' : 'FAILED';
    console.log(`  Item ${itemCount} [${event.itemId || event.itemIndex}]: ${status} (${event.duration}ms)`);
  });

  // Create test data
  const orderSchema = z.object({
    orderId: z.number().int().positive(),
    customerId: z.number().int().positive(),
    amount: z.number().positive(),
    status: z.string()
  });

  const orders = [
    { orderId: 1, customerId: 101, amount: 99.99, status: 'pending' },
    { orderId: 2, customerId: 102, amount: 149.50, status: 'shipped' },
    { orderId: 3, customerId: 103, amount: 0, status: 'invalid' }, // Invalid amount
    { orderId: 4, customerId: 104, amount: 75.25, status: 'delivered' },
    { orderId: 0, customerId: 105, amount: 200.00, status: 'pending' } // Invalid orderId
  ];

  console.log('Running batch validation with monitoring...\n');

  try {
    const batchItems = z.createBatch(orderSchema, orders, (index, data) => `order-${data.orderId}`);
    const results = await z.batchValidateAsync(batchItems, {
      maxConcurrency: 3,
      stopOnFirstError: false
    });

    console.log(`\nBatch validation completed. Results: ${results.filter(r => r.success).length}/${results.length} successful`);

  } catch (error) {
    console.log(`Batch validation failed: ${error.message}`);
  }
}

// Performance monitoring example
async function performanceMonitoring() {
  console.log('\n\nPerformance Monitoring Example\n');

  // Set up performance monitoring
  globalValidationMonitor.onPerformance((event) => {
    console.log(`PERFORMANCE: ${event.metric} = ${event.value} ${event.unit}`);
  });

  // Enable debug mode for detailed logging
  console.log('Enabling debug mode for detailed event logging...');
  const stopDebugLogging = globalValidationMonitor.createEventLogger('[DEBUG]');
  globalValidationMonitor.on('*', stopDebugLogging);

  // Start real-time performance monitoring
  console.log('Starting real-time performance monitoring (5 second intervals)...');
  const stopMonitoring = globalValidationMonitor.startPerformanceMonitoring(5000);

  // Create a schema that emits custom performance metrics
  const heavySchema = z.object({
    data: z.string().min(10).max(1000)
  }).refine((data) => {
    // Simulate some heavy computation
    const start = Date.now();
    for (let i = 0; i < 100000; i++) {
      Math.sqrt(i);
    }
    const duration = Date.now() - start;

    // Emit custom performance metric
    // Note: This would need to be done differently in actual implementation
    // as schemas don't have direct access to emitPerformance in this context
    console.log(`Heavy computation took ${duration}ms`);

    return data.data.length > 10;
  }, 'Data must be meaningful');

  // Test the heavy schema
  console.log('\nTesting schema with performance monitoring...');

  try {
    const result = heavySchema.parse({ data: 'This is a test string with sufficient length for validation' });
    console.log('Heavy validation completed successfully');
  } catch (error) {
    console.log('Heavy validation failed');
  }

  // Stop monitoring after a short delay
  setTimeout(() => {
    console.log('\nStopping performance monitoring...');
    stopMonitoring();
    globalValidationMonitor.removeAllListeners();
  }, 6000);
}

// Run all examples
async function main() {
  try {
    await basicMonitoringExample();
    await schemaInstanceMonitoring();
    await batchValidationMonitoring();
    await performanceMonitoring();

    // Wait a bit for performance monitoring to show results
    await new Promise(resolve => setTimeout(resolve, 7000));

    console.log('\nAll monitoring examples completed!');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  basicMonitoringExample,
  schemaInstanceMonitoring,
  batchValidationMonitoring,
  performanceMonitoring
};