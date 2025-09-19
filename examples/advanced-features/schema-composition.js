// Schema Composition Utilities Examples
import { string, number, object, array, SchemaUtils } from 'fast-schema';

console.log('=== Schema Composition Utilities Examples ===\n');

// Base schemas for composition
const baseUserSchema = object({
  id: string().uuid(),
  name: string().min(2),
  email: string().email()
});

const timestampSchema = object({
  createdAt: string().datetime(),
  updatedAt: string().datetime()
});

const metadataSchema = object({
  version: string(),
  source: string().optional()
});

// 1. Schema merging
console.log('1. Schema merging:');
const fullUserSchema = SchemaUtils.merge(baseUserSchema, timestampSchema);

const userData = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: '2024-03-15T10:00:00Z',
  updatedAt: '2024-03-15T10:30:00Z'
};

try {
  console.log('✅ Merged schema validation:', fullUserSchema.parse(userData));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 2. Picking specific fields
console.log('\n2. Picking specific fields:');
const publicUserSchema = SchemaUtils.pick(fullUserSchema, ['id', 'name']);

const publicData = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'John Doe'
};

try {
  console.log('✅ Picked fields validation:', publicUserSchema.parse(publicData));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// Extra fields should be rejected
try {
  publicUserSchema.parse({
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John Doe',
    email: 'john@example.com' // This should be rejected
  });
} catch (error) {
  console.log('❌ Extra field rejected:', error.message);
}

// 3. Omitting specific fields
console.log('\n3. Omitting specific fields:');
const userWithoutTimestamps = SchemaUtils.omit(fullUserSchema, ['createdAt', 'updatedAt']);

const userDataWithoutTimestamps = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'John Doe',
  email: 'john@example.com'
};

try {
  console.log('✅ Omitted fields validation:', userWithoutTimestamps.parse(userDataWithoutTimestamps));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 4. Making all fields optional (partial)
console.log('\n4. Making all fields optional (partial):');
const partialUserSchema = SchemaUtils.partial(baseUserSchema);

const partialData = {
  name: 'Jane Doe'
  // id and email are optional
};

try {
  console.log('✅ Partial schema validation:', partialUserSchema.parse(partialData));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 5. Record schemas (dynamic object keys)
console.log('\n5. Record schemas (dynamic object keys):');
const userPreferencesSchema = SchemaUtils.record(string());

const preferences = {
  theme: 'dark',
  language: 'en',
  notifications: 'enabled',
  timezone: 'UTC'
};

try {
  console.log('✅ Record validation:', userPreferencesSchema.parse(preferences));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 6. Tuple schemas (fixed-length arrays)
console.log('\n6. Tuple schemas:');
const coordinateSchema = SchemaUtils.tuple([number(), number()]);
const rgbaColorSchema = SchemaUtils.tuple([
  number().min(0).max(255),
  number().min(0).max(255),
  number().min(0).max(255),
  number().min(0).max(1)
]);

try {
  console.log('✅ Coordinate tuple:', coordinateSchema.parse([40.7128, -74.0060]));
  console.log('✅ RGBA color tuple:', rgbaColorSchema.parse([255, 128, 0, 0.8]));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  coordinateSchema.parse([1, 2, 3]); // Wrong length
} catch (error) {
  console.log('❌ Wrong tuple length:', error.message);
}

// 7. Complex composition - building an API response schema
console.log('\n7. Complex composition - API response schema:');

const errorSchema = object({
  code: string(),
  message: string(),
  details: object({}).optional()
});

const paginationSchema = object({
  page: number().int().min(1),
  limit: number().int().min(1).max(100),
  total: number().int().min(0),
  totalPages: number().int().min(0)
});

// Create a generic response schema
const createApiResponseSchema = (dataSchema) => {
  return object({
    success: string().refine(val => val === 'true' || val === 'false').transform(val => val === 'true'),
    data: dataSchema.optional(),
    error: errorSchema.optional(),
    pagination: paginationSchema.optional()
  }).refine(
    response => response.success ? !!response.data : !!response.error,
    'Response must have data on success or error on failure'
  );
};

// Use the generic response schema
const userListResponseSchema = createApiResponseSchema(array(publicUserSchema));

const successResponse = {
  success: 'true',
  data: [
    { id: '1', name: 'John' },
    { id: '2', name: 'Jane' }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1
  }
};

const errorResponse = {
  success: 'false',
  error: {
    code: 'UNAUTHORIZED',
    message: 'Access denied'
  }
};

try {
  console.log('✅ Success response:', userListResponseSchema.parse(successResponse));
  console.log('✅ Error response:', userListResponseSchema.parse(errorResponse));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 8. Schema inheritance and extension
console.log('\n8. Schema inheritance and extension:');

const baseProductSchema = object({
  id: string(),
  name: string(),
  price: number().positive()
});

const digitalProductSchema = SchemaUtils.merge(
  baseProductSchema,
  object({
    downloadUrl: string().url(),
    fileSize: number().positive(),
    format: string()
  })
);

const physicalProductSchema = SchemaUtils.merge(
  baseProductSchema,
  object({
    weight: number().positive(),
    dimensions: object({
      length: number().positive(),
      width: number().positive(),
      height: number().positive()
    }),
    shippingRequired: string().transform(val => val === 'true')
  })
);

const digitalProduct = {
  id: 'ebook-123',
  name: 'Programming Guide',
  price: 29.99,
  downloadUrl: 'https://example.com/download/ebook-123',
  fileSize: 1024000,
  format: 'PDF'
};

const physicalProduct = {
  id: 'laptop-456',
  name: 'Gaming Laptop',
  price: 1299.99,
  weight: 2.5,
  dimensions: {
    length: 35.6,
    width: 23.4,
    height: 2.3
  },
  shippingRequired: 'true'
};

try {
  console.log('✅ Digital product:', digitalProductSchema.parse(digitalProduct));
  console.log('✅ Physical product:', physicalProductSchema.parse(physicalProduct));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 9. Recursive schema composition
console.log('\n9. Recursive schema composition:');

const createNestedCategorySchema = () => {
  const categorySchema = object({
    id: string(),
    name: string(),
    children: array(object({})).optional() // Will be filled recursively
  });

  // Simulate recursive reference
  return categorySchema;
};

const categorySchema = createNestedCategorySchema();

const categoryData = {
  id: 'electronics',
  name: 'Electronics',
  children: [
    {
      id: 'computers',
      name: 'Computers',
      children: [
        { id: 'laptops', name: 'Laptops' },
        { id: 'desktops', name: 'Desktops' }
      ]
    },
    { id: 'phones', name: 'Phones' }
  ]
};

try {
  console.log('✅ Nested categories:', categorySchema.parse(categoryData));
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n=== Schema Composition Examples Complete ===');