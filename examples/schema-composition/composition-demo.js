// Schema Composition Utilities Example
// Demonstrates advanced schema composition and manipulation

const { z } = require('../../js/pkg/fast_schema');

function basicCompositionExample() {
  console.log('Basic Schema Composition Example\n');

  // Base user schema
  const baseUserSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(100),
    email: z.string().email()
  });

  console.log('Base User Schema:');
  console.log('- id: number (required)');
  console.log('- name: string (required)');
  console.log('- email: string (required)\n');

  // Extend with additional properties
  const extendedUserSchema = baseUserSchema.extend({
    age: z.number().min(0).max(120),
    bio: z.string().max(500).optional(),
    isActive: z.boolean()
  });

  console.log('Extended User Schema (using .extend()):');
  console.log('- All base properties +');
  console.log('- age: number (required)');
  console.log('- bio: string (optional)');
  console.log('- isActive: boolean (required)\n');

  // Test extended schema
  const userData = {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 28,
    bio: 'Software developer passionate about TypeScript',
    isActive: true
  };

  try {
    const validUser = extendedUserSchema.parse(userData);
    console.log('✓ Extended user data is valid');
    console.log(`  User: ${validUser.name}, Age: ${validUser.age}\n`);
  } catch (error) {
    console.log('✗ Validation failed:', error.message);
  }
}

function partialAndRequiredExample() {
  console.log('Partial and Required Schema Transformations\n');

  const productSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    price: z.number().positive(),
    description: z.string(),
    category: z.string(),
    inStock: z.boolean()
  });

  // Make all properties optional
  const partialProductSchema = productSchema.partial();

  console.log('Partial Product Schema (all optional):');
  const partialData = { name: 'Laptop', price: 999.99 };

  try {
    const validPartial = partialProductSchema.parse(partialData);
    console.log('✓ Partial product data is valid');
    console.log(`  Product: ${validPartial.name}, Price: $${validPartial.price}\n`);
  } catch (error) {
    console.log('✗ Partial validation failed:', error.message);
  }

  // Make specific fields optional
  const flexibleProductSchema = productSchema.setOptional(['description', 'category']);

  console.log('Flexible Product Schema (description and category optional):');
  const flexibleData = {
    id: 1,
    name: 'Gaming Mouse',
    price: 59.99,
    inStock: true
    // description and category omitted
  };

  try {
    const validFlexible = flexibleProductSchema.parse(flexibleData);
    console.log('✓ Flexible product data is valid');
    console.log(`  Product: ${validFlexible.name}\n`);
  } catch (error) {
    console.log('✗ Flexible validation failed:', error.message);
  }

  // Convert optional back to required
  const optionalSchema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    published: z.boolean().optional()
  });

  const requiredSchema = optionalSchema.setRequired(['title', 'content']);

  console.log('Required Schema (title and content required):');
  try {
    const validRequired = requiredSchema.parse({
      title: 'Blog Post',
      content: 'This is the content',
      // published remains optional
    });
    console.log('✓ Required schema validation passed\n');
  } catch (error) {
    console.log('✗ Required validation failed:', error.message);
  }
}

function pickAndOmitExample() {
  console.log('Pick and Omit Schema Operations\n');

  const fullUserSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    age: z.number().min(0),
    role: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    lastLogin: z.string().optional()
  });

  // Pick only public fields
  const publicUserSchema = fullUserSchema.pick(['id', 'name', 'email', 'age', 'role']);

  console.log('Public User Schema (picked fields):');
  console.log('- id, name, email, age, role only\n');

  const publicData = {
    id: 1,
    name: 'Bob Smith',
    email: 'bob@example.com',
    age: 32,
    role: 'developer'
  };

  try {
    const validPublic = publicUserSchema.parse(publicData);
    console.log('✓ Public user data is valid');
    console.log(`  Public User: ${validPublic.name} (${validPublic.role})\n`);
  } catch (error) {
    console.log('✗ Public validation failed:', error.message);
  }

  // Omit sensitive fields
  const safeUserSchema = fullUserSchema.omit(['password', 'lastLogin']);

  console.log('Safe User Schema (omitted password and lastLogin):');
  const safeData = {
    id: 2,
    name: 'Carol Wilson',
    email: 'carol@example.com',
    age: 29,
    role: 'designer',
    createdAt: '2023-01-15',
    updatedAt: '2023-06-20'
  };

  try {
    const validSafe = safeUserSchema.parse(safeData);
    console.log('✓ Safe user data is valid');
    console.log(`  Safe User: ${validSafe.name}, Created: ${validSafe.createdAt}\n`);
  } catch (error) {
    console.log('✗ Safe validation failed:', error.message);
  }
}

function mergeAndDeepPartialExample() {
  console.log('Merge and Deep Partial Operations\n');

  // Base schemas to merge
  const personalInfoSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email()
  });

  const professionalInfoSchema = z.object({
    company: z.string(),
    position: z.string(),
    salary: z.number().positive(),
    startDate: z.string()
  });

  // Merge schemas
  const completeProfileSchema = personalInfoSchema.merge(professionalInfoSchema);

  console.log('Merged Profile Schema:');
  const profileData = {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david@example.com',
    company: 'Tech Corp',
    position: 'Senior Developer',
    salary: 95000,
    startDate: '2022-03-01'
  };

  try {
    const validProfile = completeProfileSchema.parse(profileData);
    console.log('✓ Merged profile data is valid');
    console.log(`  ${validProfile.firstName} ${validProfile.lastName} at ${validProfile.company}\n`);
  } catch (error) {
    console.log('✗ Merge validation failed:', error.message);
  }

  // Deep partial for nested objects
  const nestedSchema = z.object({
    user: z.object({
      name: z.string(),
      email: z.string().email(),
      profile: z.object({
        bio: z.string(),
        avatar: z.string().url(),
        preferences: z.object({
          theme: z.string(),
          notifications: z.boolean()
        })
      })
    }),
    metadata: z.object({
      version: z.string(),
      lastModified: z.string()
    })
  });

  const deepPartialSchema = nestedSchema.deepPartial();

  console.log('Deep Partial Schema (all nested properties optional):');
  const partialNestedData = {
    user: {
      name: 'Emma Davis',
      profile: {
        bio: 'Product manager with 5 years experience'
        // avatar and preferences omitted
      }
    }
    // metadata omitted
  };

  try {
    const validDeepPartial = deepPartialSchema.parse(partialNestedData);
    console.log('✓ Deep partial data is valid');
    console.log(`  User: ${validDeepPartial.user?.name}\n`);
  } catch (error) {
    console.log('✗ Deep partial validation failed:', error.message);
  }
}

function keyofAndStrictExample() {
  console.log('Keyof and Strict Validation Example\n');

  const configSchema = z.object({
    theme: z.string(),
    language: z.string(),
    timezone: z.string(),
    notifications: z.boolean()
  });

  // Get schema keys as a type
  const configKeySchema = configSchema.keyof();

  console.log('Config Key Validation:');
  const validKeys = ['theme', 'language', 'timezone', 'notifications'];
  const invalidKeys = ['colors', 'fonts', 'layout'];

  validKeys.forEach(key => {
    try {
      configKeySchema.parse(key);
      console.log(`  ✓ "${key}" - Valid config key`);
    } catch (error) {
      console.log(`  ✗ "${key}" - Invalid config key`);
    }
  });

  invalidKeys.forEach(key => {
    try {
      configKeySchema.parse(key);
      console.log(`  ✓ "${key}" - Valid config key`);
    } catch (error) {
      console.log(`  ✗ "${key}" - Invalid config key`);
    }
  });

  // Strict mode - no additional properties
  const strictUserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email()
  }).strict();

  console.log('\nStrict Schema Validation:');
  const strictData = {
    id: 1,
    name: 'Frank Miller',
    email: 'frank@example.com'
  };

  const strictDataWithExtra = {
    id: 2,
    name: 'Grace Lee',
    email: 'grace@example.com',
    extraField: 'not allowed' // This should cause validation to fail
  };

  try {
    strictUserSchema.parse(strictData);
    console.log('✓ Strict data (exact fields) is valid');
  } catch (error) {
    console.log('✗ Strict validation failed:', error.message);
  }

  try {
    strictUserSchema.parse(strictDataWithExtra);
    console.log('✓ Strict data (with extra fields) is valid');
  } catch (error) {
    console.log('✗ Strict validation failed: Extra fields not allowed\n');
  }
}

function realWorldCompositionExample() {
  console.log('Real-World Schema Composition Example\n');

  // Base entity schema
  const baseEntitySchema = z.object({
    id: z.string().uuid(),
    createdAt: z.string(),
    updatedAt: z.string()
  });

  // User-specific fields
  const userFieldsSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8)
  });

  // Profile fields
  const profileFieldsSchema = z.object({
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
    website: z.string().url().optional(),
    location: z.string().optional()
  });

  // Complete user schema
  const userSchema = baseEntitySchema
    .extend(userFieldsSchema.getShape())
    .extend(profileFieldsSchema.getShape());

  // Create schemas for different use cases
  const createUserSchema = userSchema
    .omit(['id', 'createdAt', 'updatedAt'])
    .omit(['bio', 'avatar', 'website', 'location']); // Only required fields for creation

  const updateUserSchema = userSchema
    .omit(['id', 'createdAt', 'updatedAt'])
    .partial(); // All fields optional for updates

  const publicUserSchema = userSchema
    .omit(['password'])
    .pick(['id', 'name', 'bio', 'avatar', 'website', 'location', 'createdAt']);

  const userListSchema = publicUserSchema
    .pick(['id', 'name', 'avatar']); // Minimal fields for user lists

  console.log('Composed schemas for different use cases:');
  console.log('1. Create User: name, email, password (required)');
  console.log('2. Update User: all fields optional');
  console.log('3. Public User: no password, selected fields');
  console.log('4. User List: minimal fields for lists\n');

  // Test create user
  const createData = {
    name: 'Helen Carter',
    email: 'helen@example.com',
    password: 'securepass123'
  };

  try {
    const validCreate = createUserSchema.parse(createData);
    console.log('✓ Create user data is valid');
    console.log(`  Creating user: ${validCreate.name}\n`);
  } catch (error) {
    console.log('✗ Create validation failed:', error.message);
  }

  // Test update user
  const updateData = {
    bio: 'Updated bio information',
    website: 'https://helencarter.dev'
  };

  try {
    const validUpdate = updateUserSchema.parse(updateData);
    console.log('✓ Update user data is valid');
    console.log(`  Updating: bio and website\n`);
  } catch (error) {
    console.log('✗ Update validation failed:', error.message);
  }

  // Test public user
  const publicData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Helen Carter',
    bio: 'Software architect and tech blogger',
    avatar: 'https://example.com/avatar.jpg',
    website: 'https://helencarter.dev',
    createdAt: '2023-01-15T10:30:00Z'
  };

  try {
    const validPublic = publicUserSchema.parse(publicData);
    console.log('✓ Public user data is valid');
    console.log(`  Public profile: ${validPublic.name}\n`);
  } catch (error) {
    console.log('✗ Public validation failed:', error.message);
  }
}

function performanceExample() {
  console.log('Schema Composition Performance Example\n');

  // Create base schema
  const baseSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email()
  });

  const iterations = 10000;

  console.log(`Testing schema composition performance (${iterations} iterations)...\n`);

  // Test extend performance
  const extendStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    const extended = baseSchema.extend({
      age: z.number(),
      active: z.boolean()
    });
  }
  const extendTime = Date.now() - extendStart;

  // Test pick performance
  const pickStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    const picked = baseSchema.pick(['id', 'name']);
  }
  const pickTime = Date.now() - pickStart;

  // Test partial performance
  const partialStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    const partial = baseSchema.partial();
  }
  const partialTime = Date.now() - partialStart;

  // Test omit performance
  const omitStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    const omitted = baseSchema.omit(['email']);
  }
  const omitTime = Date.now() - omitStart;

  console.log('Performance Results:');
  console.log(`Extend:  ${extendTime}ms (${Math.round(iterations / extendTime * 1000).toLocaleString()} ops/sec)`);
  console.log(`Pick:    ${pickTime}ms (${Math.round(iterations / pickTime * 1000).toLocaleString()} ops/sec)`);
  console.log(`Partial: ${partialTime}ms (${Math.round(iterations / partialTime * 1000).toLocaleString()} ops/sec)`);
  console.log(`Omit:    ${omitTime}ms (${Math.round(iterations / omitTime * 1000).toLocaleString()} ops/sec)`);
}

// Run all examples
async function main() {
  try {
    basicCompositionExample();
    partialAndRequiredExample();
    pickAndOmitExample();
    mergeAndDeepPartialExample();
    keyofAndStrictExample();
    realWorldCompositionExample();
    performanceExample();

    console.log('\nAll schema composition examples completed successfully!');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  basicCompositionExample,
  partialAndRequiredExample,
  pickAndOmitExample,
  mergeAndDeepPartialExample,
  keyofAndStrictExample,
  realWorldCompositionExample,
  performanceExample
};