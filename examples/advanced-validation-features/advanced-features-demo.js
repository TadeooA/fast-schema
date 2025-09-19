// Advanced Validation Features Demo
// Demonstrates conditional validation, dynamic schemas, custom validators, introspection, and more

const { z, createConditionalSchema, createCustomValidator, createDynamicSchema, introspect, createVersionedSchema, SchemaSerializer, ContextualValidator } = require('../../js/pkg/fast_schema');

function conditionalValidationExample() {
  console.log('Conditional Validation Example\n');

  // Example 1: User registration with conditional requirements
  const userRegistrationSchema = createConditionalSchema()
    .when(
      (data) => data.accountType === 'premium',
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        accountType: z.string(),
        premiumFeatures: z.object({
          maxProjects: z.number().min(10),
          priority: z.string(),
          supportLevel: z.string()
        })
      }),
      'Premium account requires premium features'
    )
    .when(
      (data) => data.accountType === 'basic',
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        accountType: z.string(),
        maxProjects: z.number().max(3).default(3)
      }),
      'Basic account has project limitations'
    )
    .otherwise(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        accountType: z.string()
      })
    );

  // Test conditional validation
  const users = [
    {
      name: 'Alice Premium',
      email: 'alice@example.com',
      accountType: 'premium',
      premiumFeatures: {
        maxProjects: 50,
        priority: 'high',
        supportLevel: '24/7'
      }
    },
    {
      name: 'Bob Basic',
      email: 'bob@example.com',
      accountType: 'basic',
      maxProjects: 2
    },
    {
      name: 'Charlie Free',
      email: 'charlie@example.com',
      accountType: 'free'
    }
  ];

  console.log('Testing conditional user registration validation:\n');

  users.forEach((user, index) => {
    try {
      const validUser = userRegistrationSchema.parse(user);
      console.log(`✓ User ${index + 1} (${user.accountType}): Valid`);
      console.log(`  Name: ${validUser.name}`);
      if (validUser.premiumFeatures) {
        console.log(`  Premium features: ${validUser.premiumFeatures.maxProjects} projects`);
      }
      console.log('');
    } catch (error) {
      console.log(`✗ User ${index + 1} (${user.accountType}): ${error.message}\n`);
    }
  });

  // Example 2: Payment processing with conditional validation
  const paymentSchema = createConditionalSchema()
    .when(
      (data) => data.method === 'credit_card',
      z.object({
        method: z.string(),
        cardNumber: z.string().creditCard(),
        expiryDate: z.string(),
        cvv: z.string().length(3),
        amount: z.number().positive()
      })
    )
    .when(
      (data) => data.method === 'paypal',
      z.object({
        method: z.string(),
        paypalEmail: z.string().email(),
        amount: z.number().positive()
      })
    )
    .when(
      (data) => data.method === 'bank_transfer',
      z.object({
        method: z.string(),
        bankAccount: z.string().min(10),
        routingNumber: z.string().length(9),
        amount: z.number().positive()
      })
    );

  const payments = [
    {
      method: 'credit_card',
      cardNumber: '4532015112830366',
      expiryDate: '12/25',
      cvv: '123',
      amount: 99.99
    },
    {
      method: 'paypal',
      paypalEmail: 'user@example.com',
      amount: 49.99
    },
    {
      method: 'bank_transfer',
      bankAccount: '1234567890',
      routingNumber: '123456789',
      amount: 199.99
    }
  ];

  console.log('Testing conditional payment validation:\n');

  payments.forEach((payment, index) => {
    try {
      const validPayment = paymentSchema.parse(payment);
      console.log(`✓ Payment ${index + 1} (${payment.method}): Valid - $${validPayment.amount}`);
    } catch (error) {
      console.log(`✗ Payment ${index + 1} (${payment.method}): ${error.message}`);
    }
  });
}

function customValidationExample() {
  console.log('\n\nCustom Validation Example\n');

  // Example 1: Password strength validator
  const passwordSchema = createCustomValidator(z.string().min(8))
    .validator((password, context) => {
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      const strength = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChar].filter(Boolean).length;

      if (strength < 3) {
        return 'Password must contain at least 3 of: uppercase, lowercase, numbers, special characters';
      }

      return true;
    }, 'Weak password', 'weak_password')
    .validator((password) => {
      // Check against common passwords
      const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
      if (commonPasswords.includes(password.toLowerCase())) {
        return 'Password is too common';
      }
      return true;
    }, 'Common password not allowed', 'common_password');

  // Example 2: Custom business rule validator
  const businessHoursSchema = createCustomValidator(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    timezone: z.string()
  }))
    .validator((schedule, context) => {
      const start = new Date(`2023-01-01 ${schedule.startTime}`);
      const end = new Date(`2023-01-01 ${schedule.endTime}`);

      if (start >= end) {
        return [{
          code: 'invalid_time_range',
          path: [...context.path, 'endTime'],
          message: 'End time must be after start time'
        }];
      }

      // Business rule: No scheduling on Sundays
      if (schedule.day.toLowerCase() === 'sunday') {
        return 'Business is closed on Sundays';
      }

      return true;
    });

  // Test custom validators
  const testPasswords = [
    'weakpass',           // Too weak
    'StrongPass123!',     // Valid
    'password123',        // Common password
    'MySecureP@ss1'       // Valid
  ];

  console.log('Testing custom password validation:\n');

  testPasswords.forEach((password, index) => {
    try {
      passwordSchema.parse(password);
      console.log(`✓ Password ${index + 1}: Valid`);
    } catch (error) {
      console.log(`✗ Password ${index + 1}: ${error.issues[0].message}`);
    }
  });

  const testSchedules = [
    {
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'UTC'
    },
    {
      day: 'Sunday',
      startTime: '10:00',
      endTime: '16:00',
      timezone: 'UTC'
    },
    {
      day: 'Tuesday',
      startTime: '14:00',
      endTime: '12:00', // Invalid: end before start
      timezone: 'UTC'
    }
  ];

  console.log('\nTesting custom business hours validation:\n');

  testSchedules.forEach((schedule, index) => {
    try {
      businessHoursSchema.parse(schedule);
      console.log(`✓ Schedule ${index + 1}: Valid`);
    } catch (error) {
      console.log(`✗ Schedule ${index + 1}: ${error.issues[0].message}`);
    }
  });
}

function dynamicSchemaExample() {
  console.log('\n\nDynamic Schema Generation Example\n');

  // Example 1: User permission schema based on role
  const userPermissionSchema = createDynamicSchema((context) => {
    const userData = context.data;

    switch (userData.role) {
      case 'admin':
        return z.object({
          role: z.string(),
          permissions: z.object({
            canRead: z.boolean(),
            canWrite: z.boolean(),
            canDelete: z.boolean(),
            canManageUsers: z.boolean(),
            canViewReports: z.boolean(),
            canModifySettings: z.boolean()
          })
        });

      case 'moderator':
        return z.object({
          role: z.string(),
          permissions: z.object({
            canRead: z.boolean(),
            canWrite: z.boolean(),
            canDelete: z.boolean(),
            canModerateContent: z.boolean()
          })
        });

      case 'user':
        return z.object({
          role: z.string(),
          permissions: z.object({
            canRead: z.boolean(),
            canWrite: z.boolean()
          })
        });

      default:
        return z.object({
          role: z.string(),
          permissions: z.object({
            canRead: z.boolean()
          })
        });
    }
  });

  // Example 2: API response schema based on version
  const apiResponseSchema = createDynamicSchema((context) => {
    const version = context.metadata?.apiVersion || '1.0';

    if (version === '2.0') {
      return z.object({
        data: z.any(),
        meta: z.object({
          version: z.string(),
          timestamp: z.string(),
          requestId: z.string(),
          pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number()
          }).optional()
        }),
        links: z.object({
          self: z.string().url(),
          next: z.string().url().optional(),
          prev: z.string().url().optional()
        }).optional()
      });
    } else {
      return z.object({
        data: z.any(),
        meta: z.object({
          version: z.string(),
          timestamp: z.string()
        })
      });
    }
  });

  // Test dynamic schemas
  const users = [
    {
      role: 'admin',
      permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canManageUsers: true,
        canViewReports: true,
        canModifySettings: true
      }
    },
    {
      role: 'user',
      permissions: {
        canRead: true,
        canWrite: true
      }
    },
    {
      role: 'guest',
      permissions: {
        canRead: true
      }
    }
  ];

  console.log('Testing dynamic user permission schemas:\n');

  users.forEach((user, index) => {
    try {
      const validUser = userPermissionSchema.parse(user);
      console.log(`✓ User ${index + 1} (${user.role}): Valid`);
      console.log(`  Permissions: ${Object.keys(validUser.permissions).length} defined`);
    } catch (error) {
      console.log(`✗ User ${index + 1} (${user.role}): ${error.message}`);
    }
  });

  // Test API response with different versions
  const apiResponse = {
    data: { message: 'Hello World' },
    meta: {
      version: '2.0',
      timestamp: '2023-06-15T10:30:00Z',
      requestId: 'req-123'
    }
  };

  console.log('\nTesting dynamic API response schemas:\n');

  try {
    const validResponse = ContextualValidator.validateWithContext(
      apiResponseSchema,
      apiResponse,
      { metadata: { apiVersion: '2.0' } }
    );
    console.log('✓ API Response v2.0: Valid');
  } catch (error) {
    console.log('✗ API Response v2.0: Invalid');
  }

  try {
    const validResponse = ContextualValidator.validateWithContext(
      apiResponseSchema,
      apiResponse,
      { metadata: { apiVersion: '1.0' } }
    );
    console.log('✓ API Response v1.0: Valid');
  } catch (error) {
    console.log('✗ API Response v1.0: Invalid');
  }
}

function schemaIntrospectionExample() {
  console.log('\n\nSchema Introspection and Metadata Example\n');

  // Create an introspectable user schema with rich metadata
  const userSchema = introspect(
    z.object({
      id: z.number().int().positive(),
      name: z.string().min(1).max(100),
      email: z.string().email(),
      age: z.number().min(0).max(120).optional(),
      tags: z.array(z.string()).max(10).optional()
    }),
    {
      author: 'Development Team',
      created: new Date('2023-01-01'),
      version: '1.2.0'
    }
  )
    .describe('User profile schema for the application')
    .example({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      tags: ['developer', 'javascript']
    })
    .example({
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com'
    })
    .tag('user-management', 'core-schema', 'v1.2')
    .version('1.2.0');

  // Create deprecated schema example
  const legacyUserSchema = introspect(
    z.object({
      userId: z.number(),
      fullName: z.string(),
      emailAddress: z.string().email()
    })
  )
    .describe('Legacy user schema - use userSchema instead')
    .deprecate('Replaced by new user schema with better field names')
    .version('1.0.0')
    .tag('legacy', 'deprecated');

  console.log('Schema Introspection Information:\n');

  // Display schema metadata
  const metadata = userSchema.getMetadata();
  console.log('User Schema Metadata:');
  console.log(`  Type: ${metadata.type}`);
  console.log(`  Description: ${metadata.description}`);
  console.log(`  Version: ${metadata.version}`);
  console.log(`  Author: ${metadata.author}`);
  console.log(`  Created: ${metadata.created?.toDateString()}`);
  console.log(`  Tags: ${metadata.tags?.join(', ')}`);
  console.log(`  Examples: ${metadata.examples?.length} provided`);
  console.log(`  Deprecated: ${metadata.deprecated || false}`);

  // Display schema structure
  console.log('\nSchema Structure:');
  console.log(`  Properties: ${userSchema.getProperties().join(', ')}`);
  console.log(`  Optional: ${userSchema.isOptional()}`);
  console.log(`  Nullable: ${userSchema.isNullable()}`);

  const shape = userSchema.getShape();
  if (shape) {
    console.log('\nProperty Details:');
    for (const [key, schema] of Object.entries(shape)) {
      const constraints = schema.getSchema();
      console.log(`  ${key}:`);
      console.log(`    Type: ${constraints.type}`);
      console.log(`    Optional: ${schema.isOptional()}`);
      if (constraints.minLength) console.log(`    Min length: ${constraints.minLength}`);
      if (constraints.maxLength) console.log(`    Max length: ${constraints.maxLength}`);
      if (constraints.min) console.log(`    Min value: ${constraints.min}`);
      if (constraints.max) console.log(`    Max value: ${constraints.max}`);
    }
  }

  // Check legacy schema
  console.log('\nLegacy Schema Status:');
  const legacyMetadata = legacyUserSchema.getMetadata();
  console.log(`  Deprecated: ${legacyMetadata.deprecated}`);
  if (legacyMetadata.custom?.deprecationReason) {
    console.log(`  Reason: ${legacyMetadata.custom.deprecationReason}`);
  }
}

function schemaSerializationExample() {
  console.log('\n\nSchema Serialization and Deserialization Example\n');

  // Create a complex schema to serialize
  const productSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(200),
    price: z.number().positive(),
    category: z.object({
      id: z.number().int(),
      name: z.string(),
      slug: z.string().slug()
    }),
    tags: z.array(z.string()).max(20),
    specifications: z.record(z.union([z.string(), z.number(), z.boolean()])),
    availability: z.object({
      inStock: z.boolean(),
      quantity: z.number().min(0),
      restockDate: z.string().optional()
    })
  });

  console.log('Serializing product schema...\n');

  // Serialize the schema
  const serialized = SchemaSerializer.serialize(productSchema);
  console.log('Serialized Schema Structure:');
  console.log(`  Type: ${serialized.type}`);
  console.log(`  Version: ${serialized.version}`);
  console.log(`  Properties: ${Object.keys(serialized.shape || {}).length}`);

  // Display some serialized properties
  if (serialized.shape) {
    console.log('\nSerialized Properties:');
    for (const [key, propSchema] of Object.entries(serialized.shape)) {
      console.log(`  ${key}: ${propSchema.type}`);
      if (propSchema.shape) {
        console.log(`    Nested properties: ${Object.keys(propSchema.shape).length}`);
      }
      if (propSchema.itemSchema) {
        console.log(`    Array item type: ${propSchema.itemSchema.type}`);
      }
    }
  }

  console.log('\nDeserializing schema...\n');

  // Deserialize back to schema
  try {
    const deserializedSchema = SchemaSerializer.deserialize(serialized);
    console.log('✓ Schema deserialized successfully');

    // Test that deserialized schema works
    const testProduct = {
      id: 1,
      name: 'Gaming Laptop',
      price: 1299.99,
      category: {
        id: 5,
        name: 'Electronics',
        slug: 'electronics'
      },
      tags: ['gaming', 'laptop', 'high-performance'],
      specifications: {
        cpu: 'Intel i7',
        ram: '16GB',
        storage: '1TB SSD',
        gpu: 'RTX 3070',
        weight: 2.3,
        hasWebcam: true
      },
      availability: {
        inStock: true,
        quantity: 15
      }
    };

    const validProduct = deserializedSchema.parse(testProduct);
    console.log('✓ Deserialized schema validation successful');
    console.log(`  Product: ${validProduct.name} - $${validProduct.price}`);

  } catch (error) {
    console.log('✗ Schema deserialization failed:', error.message);
  }
}

function schemaVersioningExample() {
  console.log('\n\nSchema Versioning and Migration Example\n');

  // Create versioned user schema
  const userSchemaV1 = z.object({
    userId: z.number(),
    fullName: z.string(),
    emailAddress: z.string().email()
  });

  const userSchemaV2 = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    profile: z.object({
      bio: z.string().optional(),
      avatar: z.string().url().optional()
    }).optional()
  });

  const userSchemaV3 = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    profile: z.object({
      bio: z.string().optional(),
      avatar: z.string().url().optional(),
      preferences: z.object({
        theme: z.string().default('light'),
        notifications: z.boolean().default(true)
      }).optional()
    }).optional(),
    metadata: z.object({
      createdAt: z.string(),
      updatedAt: z.string()
    })
  });

  // Create versioned schema with migrations
  const versionedUserSchema = createVersionedSchema('1.0', userSchemaV1)
    .addVersion('2.0', userSchemaV2)
    .addVersion('3.0', userSchemaV3)
    .addMigration({
      fromVersion: '1.0',
      toVersion: '2.0',
      description: 'Migrate from v1 to v2: rename fields and add profile',
      migrate: (data) => ({
        id: data.userId,
        name: data.fullName,
        email: data.emailAddress,
        profile: {}
      })
    })
    .addMigration({
      fromVersion: '2.0',
      toVersion: '3.0',
      description: 'Migrate from v2 to v3: add preferences and metadata',
      migrate: (data) => ({
        ...data,
        profile: {
          ...data.profile,
          preferences: {
            theme: 'light',
            notifications: true
          }
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    });

  console.log('Schema Versioning Information:');
  console.log(`  Current version: ${versionedUserSchema.getCurrentVersion()}`);
  console.log(`  Available versions: ${versionedUserSchema.getAvailableVersions().join(', ')}`);

  // Test migration from v1 to current
  const v1UserData = {
    userId: 123,
    fullName: 'Alice Johnson',
    emailAddress: 'alice@example.com'
  };

  console.log('\nTesting data migration:\n');
  console.log('Original v1.0 data:', JSON.stringify(v1UserData, null, 2));

  try {
    const migratedData = versionedUserSchema.migrate(v1UserData, '1.0', '3.0');
    console.log('\nMigrated to v3.0 data:', JSON.stringify(migratedData, null, 2));

    // Validate migrated data with current schema
    const validatedUser = versionedUserSchema.parse(migratedData);
    console.log('\n✓ Migrated data is valid with current schema');
  } catch (error) {
    console.log('\n✗ Migration failed:', error.message);
  }
}

function contextualValidationExample() {
  console.log('\n\nContextual Validation and Advanced Error Handling Example\n');

  // Create a schema that uses validation context
  const nestedDataSchema = z.object({
    user: z.object({
      id: z.number(),
      profile: z.object({
        settings: z.object({
          theme: z.string(),
          language: z.string()
        })
      })
    }),
    preferences: z.array(z.string())
  });

  // Test data with validation errors
  const testData = {
    user: {
      id: 'invalid-id', // Error: should be number
      profile: {
        settings: {
          theme: 'dark',
          language: 123 // Error: should be string
        }
      }
    },
    preferences: ['english', 'dark-mode', null] // Error: null in array
  };

  console.log('Testing contextual validation with detailed error information:\n');

  try {
    const result = ContextualValidator.validateWithContext(
      nestedDataSchema,
      testData,
      {
        metadata: { source: 'api-request', timestamp: Date.now() }
      }
    );
    console.log('✓ Validation successful');
  } catch (error) {
    if (error.constructor.name === 'ValidationErrorWithContext') {
      console.log('✗ Validation failed with contextual information:');
      console.log(`  Full path: ${error.getFullPath()}`);
      console.log(`  Context metadata:`, error.getContext().metadata);

      console.log('\nDetailed issues:');
      error.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. Path: ${issue.path.join('.')}`);
        console.log(`     Code: ${issue.code}`);
        console.log(`     Message: ${issue.message}`);
        if (issue.received) console.log(`     Received: ${issue.received}`);
        if (issue.expected) console.log(`     Expected: ${issue.expected}`);
      });
    } else {
      console.log('✗ Validation failed:', error.message);
    }
  }
}

// Run all examples
async function main() {
  try {
    conditionalValidationExample();
    customValidationExample();
    dynamicSchemaExample();
    schemaIntrospectionExample();
    schemaSerializationExample();
    schemaVersioningExample();
    contextualValidationExample();

    console.log('\nAll advanced validation features examples completed successfully!');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  conditionalValidationExample,
  customValidationExample,
  dynamicSchemaExample,
  schemaIntrospectionExample,
  schemaSerializationExample,
  schemaVersioningExample,
  contextualValidationExample
};