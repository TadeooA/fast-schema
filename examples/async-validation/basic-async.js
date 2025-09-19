// Example: Basic async validation with Fast-Schema
const { z } = require('../../js/src');

// Simulate an async function to check if email is unique
async function checkEmailUnique(email) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Simulate some emails being taken
  const takenEmails = ['admin@example.com', 'test@example.com', 'user@demo.com'];
  return !takenEmails.includes(email);
}

// Simulate checking username availability
async function checkUsernameAvailable(username) {
  await new Promise(resolve => setTimeout(resolve, 150));

  const takenUsernames = ['admin', 'root', 'test', 'user'];
  return !takenUsernames.includes(username.toLowerCase());
}

// Basic async refinement
const emailSchema = z.string()
  .email()
  .refineAsync(async (email) => {
    return await checkEmailUnique(email);
  }, "Email already exists");

// Advanced async refinement with configuration
const usernameSchema = z.string()
  .min(3)
  .refineAsync(
    checkUsernameAvailable,
    {
      message: "Username is taken",
      timeout: 3000,
      cache: true,
      retries: 2
    }
  );

// Complex schema with multiple async validations
const userSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  name: z.string().min(2)
});

async function runExamples() {
  console.log('Fast-Schema Async Validation Examples\n');

  // Example 1: Simple async validation - Success
  console.log('1. Testing valid email (should pass):');
  try {
    const result = await emailSchema.safeParseAsync('newuser@example.com');
    if (result.success) {
      console.log('  ✅ Valid email:', result.data);
    } else {
      console.log('  ❌ Validation failed:', result.error.issues);
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }

  // Example 2: Simple async validation - Failure
  console.log('\n2. Testing taken email (should fail):');
  try {
    const result = await emailSchema.safeParseAsync('admin@example.com');
    if (result.success) {
      console.log('  ✅ Valid email:', result.data);
    } else {
      console.log('  ❌ Validation failed:', result.error.issues[0].message);
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }

  // Example 3: Advanced async validation with config
  console.log('\n3. Testing username availability:');
  try {
    const result = await usernameSchema.safeParseAsync('newuser123');
    if (result.success) {
      console.log('  ✅ Valid username:', result.data);
    } else {
      console.log('  ❌ Validation failed:', result.error.issues[0].message);
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }

  // Example 4: Complex object with multiple async validations
  console.log('\n4. Testing complete user object:');
  const userData = {
    email: 'jane@example.com',
    username: 'jane_doe',
    name: 'Jane Doe'
  };

  try {
    console.log('  Validating user data...');
    const startTime = Date.now();

    const result = await userSchema.safeParseAsync(userData);
    const duration = Date.now() - startTime;

    if (result.success) {
      console.log(`  ✅ Valid user (${duration}ms):`, result.data);
    } else {
      console.log(`  ❌ Validation failed (${duration}ms):`,
        result.error.issues.map(i => i.message));
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }

  // Example 5: Testing cache performance
  console.log('\n5. Testing cache performance (validating same username twice):');

  console.log('  First validation (will hit API):');
  const start1 = Date.now();
  await usernameSchema.safeParseAsync('cached_user');
  const duration1 = Date.now() - start1;
  console.log(`  Duration: ${duration1}ms`);

  console.log('  Second validation (should use cache):');
  const start2 = Date.now();
  await usernameSchema.safeParseAsync('cached_user');
  const duration2 = Date.now() - start2;
  console.log(`  Duration: ${duration2}ms (cache hit!)`);

  // Example 6: Error handling with parseAsync (throws)
  console.log('\n6. Testing parseAsync with error handling:');
  try {
    const result = await emailSchema.parseAsync('admin@example.com');
    console.log('  ✅ Result:', result);
  } catch (error) {
    if (error.constructor.name === 'ValidationError') {
      console.log('  ❌ Caught ValidationError:', error.issues[0].message);
    } else {
      console.log('  ❌ Unexpected error:', error.message);
    }
  }

  console.log('\n✨ Async validation examples completed!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  runExamples,
  emailSchema,
  usernameSchema,
  userSchema
};