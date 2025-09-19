// Example: Debounced async validation with Fast-Schema
const { z, createDebouncedValidator, debounceAsyncFunction } = require('../../js/src');

// Simulate API calls that we want to debounce
async function checkEmailAvailability(email) {
  console.log(`🔍 API Call: Checking email availability for "${email}"`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const takenEmails = ['admin@test.com', 'user@test.com', 'taken@test.com'];
  const isAvailable = !takenEmails.includes(email);

  console.log(`📧 Email "${email}" is ${isAvailable ? 'available' : 'taken'}`);
  return isAvailable;
}

async function checkUsernameAvailability(username) {
  console.log(`🔍 API Call: Checking username availability for "${username}"`);

  await new Promise(resolve => setTimeout(resolve, 150));

  const takenUsernames = ['admin', 'user', 'test', 'demo'];
  const isAvailable = !takenUsernames.includes(username.toLowerCase());

  console.log(`👤 Username "${username}" is ${isAvailable ? 'available' : 'taken'}`);
  return isAvailable;
}

// Example 1: Basic debounced validation
const emailSchema = z.string()
  .email()
  .refineAsync(
    checkEmailAvailability,
    {
      message: "Email is already taken",
      debounce: 300,  // Wait 300ms after user stops typing
      cache: true     // Cache results to avoid repeat API calls
    }
  );

// Example 2: Advanced debouncing configuration
const usernameSchema = z.string()
  .min(3)
  .max(20)
  .regex(/^[a-zA-Z0-9_]+$/)
  .refineAsync(
    checkUsernameAvailability,
    {
      message: "Username is already taken",
      debounce: 500,     // Longer debounce for username
      cache: {
        ttl: 60000,      // Cache for 1 minute
        maxSize: 50      // Limit cache size
      },
      timeout: 3000,     // 3 second timeout
      retries: 1         // Retry once on failure
    }
  );

// Example 3: Form schema with multiple debounced fields
const registrationSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  firstName: z.string().min(2),
  lastName: z.string().min(2)
});

// Example 4: Using standalone debounced functions
const debouncedEmailCheck = createDebouncedValidator(checkEmailAvailability, 400);
const debouncedUsernameCheck = debounceAsyncFunction(checkUsernameAvailability, 600);

// Simulate rapid user input
async function simulateUserTyping() {
  console.log('\n🚀 Simulating user typing behavior...\n');

  // Simulate rapid email typing
  console.log('📧 User types email rapidly:');
  const emailInputs = ['u', 'us', 'use', 'user', 'user@', 'user@t', 'user@te', 'user@test.com'];

  for (const input of emailInputs) {
    console.log(`  ⌨️  Typing: "${input}"`);

    // Only validate complete emails
    if (input.includes('@') && input.includes('.')) {
      // Fire async validation - will be debounced
      emailSchema.safeParseAsync(input).catch(() => {
        // Ignore debounce cancellations
      });
    }

    await new Promise(resolve => setTimeout(resolve, 100)); // Fast typing
  }

  // Wait for final validation
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('\n👤 User types username rapidly:');
  const usernameInputs = ['a', 'ad', 'adm', 'admi', 'admin'];

  for (const input of usernameInputs) {
    console.log(`  ⌨️  Typing: "${input}"`);

    if (input.length >= 3) {
      usernameSchema.safeParseAsync(input).catch(() => {
        // Ignore debounce cancellations
      });
    }

    await new Promise(resolve => setTimeout(resolve, 120));
  }

  // Wait for final validation
  await new Promise(resolve => setTimeout(resolve, 800));
}

// Test debouncing performance
async function testDebouncingPerformance() {
  console.log('\n⚡ Testing debouncing performance...\n');

  // Without debouncing - multiple API calls
  console.log('🔥 Without debouncing (multiple API calls):');
  const start1 = Date.now();

  const promises1 = [
    'test1@example.com',
    'test2@example.com',
    'test3@example.com'
  ].map(email => checkEmailAvailability(email));

  await Promise.all(promises1);
  const duration1 = Date.now() - start1;
  console.log(`📊 Time without debouncing: ${duration1}ms (3 API calls)`);

  console.log('\n⏱️ With debouncing (batched calls):');
  const start2 = Date.now();

  // Create debounced validator
  const debouncedCheck = createDebouncedValidator(checkEmailAvailability, 200);

  // Fire multiple validations rapidly - should be debounced
  const promises2 = [
    'test1@example.com',
    'test2@example.com',
    'test3@example.com'
  ].map(email => {
    // These will be debounced, only the last one should execute
    return debouncedCheck(email).catch(() => 'cancelled');
  });

  await Promise.all(promises2);
  const duration2 = Date.now() - start2;
  console.log(`📊 Time with debouncing: ${duration2}ms (1 API call)`);
}

// Test form validation with debouncing
async function testFormValidation() {
  console.log('\n📝 Testing complete form validation with debouncing...\n');

  const formData = {
    email: 'newuser@example.com',
    username: 'newuser123',
    firstName: 'John',
    lastName: 'Doe'
  };

  console.log('🔍 Validating form data:', formData);

  const start = Date.now();
  const result = await registrationSchema.safeParseAsync(formData);
  const duration = Date.now() - start;

  if (result.success) {
    console.log(`✅ Form validation successful (${duration}ms):`, result.data);
  } else {
    console.log(`❌ Form validation failed (${duration}ms):`,
      result.error.issues.map(i => i.message));
  }

  // Test with invalid data
  console.log('\n🔍 Testing with taken email/username:');
  const invalidData = {
    email: 'admin@test.com',  // taken
    username: 'admin',        // taken
    firstName: 'Jane',
    lastName: 'Doe'
  };

  const start2 = Date.now();
  const result2 = await registrationSchema.safeParseAsync(invalidData);
  const duration2 = Date.now() - start2;

  if (result2.success) {
    console.log(`✅ Form validation successful (${duration2}ms):`, result2.data);
  } else {
    console.log(`❌ Form validation failed (${duration2}ms):`);
    result2.error.issues.forEach(issue => {
      console.log(`  • ${issue.path.join('.')}: ${issue.message}`);
    });
  }
}

// Main example runner
async function runDebouncingExamples() {
  console.log('🎯 Fast-Schema Debouncing Examples\n');
  console.log('This demonstrates how debouncing prevents excessive API calls');
  console.log('during rapid user input, improving performance and UX.\n');

  try {
    await simulateUserTyping();
    await testDebouncingPerformance();
    await testFormValidation();

    console.log('\n✨ Debouncing examples completed!');
    console.log('\n📋 Key benefits observed:');
    console.log('  • Reduced API calls during rapid typing');
    console.log('  • Improved performance with caching');
    console.log('  • Automatic cancellation of outdated validations');
    console.log('  • Better user experience with delayed validation');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Export for testing
module.exports = {
  runDebouncingExamples,
  emailSchema,
  usernameSchema,
  registrationSchema,
  debouncedEmailCheck,
  debouncedUsernameCheck
};

// Run examples if this file is executed directly
if (require.main === module) {
  runDebouncingExamples();
}