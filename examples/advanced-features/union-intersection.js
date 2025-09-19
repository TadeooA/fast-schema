// Union and Intersection Types Examples
import { string, number, object, array, union, intersection, literal } from 'fast-schema';

console.log('=== Union and Intersection Types Examples ===\n');

// 1. Basic union types
const stringOrNumber = union([string(), number()]);

console.log('1. Basic union validation:');
try {
  console.log('✅ Union accepts string:', stringOrNumber.parse('hello'));
  console.log('✅ Union accepts number:', stringOrNumber.parse(42));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  stringOrNumber.parse(true);
} catch (error) {
  console.log('❌ Union rejects boolean:', error.message);
}

// 2. Literal union (enum-like)
const statusSchema = union([
  literal('pending'),
  literal('approved'),
  literal('rejected')
]);

console.log('\n2. Literal union (enum-like):');
try {
  console.log('✅ Valid status:', statusSchema.parse('pending'));
  console.log('✅ Valid status:', statusSchema.parse('approved'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  statusSchema.parse('invalid');
} catch (error) {
  console.log('❌ Invalid status:', error.message);
}

// 3. Complex union with objects
const paymentMethodSchema = union([
  object({
    type: literal('credit_card'),
    cardNumber: string().regex(/^\d{16}$/),
    expiryDate: string().regex(/^\d{2}\/\d{2}$/),
    cvv: string().regex(/^\d{3,4}$/)
  }),
  object({
    type: literal('paypal'),
    email: string().email()
  }),
  object({
    type: literal('bank_transfer'),
    accountNumber: string(),
    routingNumber: string()
  })
]);

console.log('\n3. Complex union with objects:');
const creditCard = {
  type: 'credit_card',
  cardNumber: '1234567890123456',
  expiryDate: '12/25',
  cvv: '123'
};

const paypal = {
  type: 'paypal',
  email: 'user@example.com'
};

try {
  console.log('✅ Valid credit card:', paymentMethodSchema.parse(creditCard));
  console.log('✅ Valid PayPal:', paymentMethodSchema.parse(paypal));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 4. Basic intersection types
const nameSchema = object({
  firstName: string(),
  lastName: string()
});

const contactSchema = object({
  email: string().email(),
  phone: string().phoneNumber().optional()
});

const userSchema = intersection(nameSchema, contactSchema);

console.log('\n4. Basic intersection validation:');
const validUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-123-4567'
};

try {
  console.log('✅ Valid user (intersection):', userSchema.parse(validUser));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// Missing required field from one of the intersected schemas
const incompleteUser = {
  firstName: 'John',
  lastName: 'Doe'
  // Missing email from contactSchema
};

try {
  userSchema.parse(incompleteUser);
} catch (error) {
  console.log('❌ Incomplete user error:', error.message);
}

// 5. Chained unions using .or() method
const flexibleId = string().uuid().or(number().int().positive()).or(string().nanoid());

console.log('\n5. Chained unions with .or() method:');
try {
  console.log('✅ UUID ID:', flexibleId.parse('550e8400-e29b-41d4-a716-446655440000'));
  console.log('✅ Numeric ID:', flexibleId.parse(12345));
  console.log('✅ NanoID:', flexibleId.parse('V1StGXR8_Z5jdHi6B-myT'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 6. Intersection with .and() method
const timestampedSchema = object({
  id: string(),
  name: string()
}).and(object({
  createdAt: string().datetime(),
  updatedAt: string().datetime()
}));

console.log('\n6. Intersection with .and() method:');
const timestampedData = {
  id: 'user-123',
  name: 'John Doe',
  createdAt: '2024-03-15T10:00:00Z',
  updatedAt: '2024-03-15T10:30:00Z'
};

try {
  console.log('✅ Timestamped object:', timestampedSchema.parse(timestampedData));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 7. Nested unions and intersections
const complexApiResponse = union([
  object({
    success: literal(true),
    data: intersection(
      object({
        user: object({
          id: string(),
          name: string()
        })
      }),
      object({
        metadata: object({
          version: string(),
          timestamp: string().datetime()
        })
      })
    )
  }),
  object({
    success: literal(false),
    error: object({
      code: string(),
      message: string(),
      details: object({}).optional()
    })
  })
]);

console.log('\n7. Complex nested unions and intersections:');
const successResponse = {
  success: true,
  data: {
    user: {
      id: 'user-123',
      name: 'John Doe'
    },
    metadata: {
      version: '1.0.0',
      timestamp: '2024-03-15T10:00:00Z'
    }
  }
};

const errorResponse = {
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input provided',
    details: { field: 'email' }
  }
};

try {
  console.log('✅ Success response:', complexApiResponse.parse(successResponse));
  console.log('✅ Error response:', complexApiResponse.parse(errorResponse));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 8. Union with array types
const mixedArraySchema = array(union([string(), number(), object({ type: string() })]));

console.log('\n8. Union with array types:');
const mixedArray = [
  'hello',
  42,
  { type: 'object' },
  'world',
  123
];

try {
  console.log('✅ Mixed array:', mixedArraySchema.parse(mixedArray));
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n=== Union and Intersection Examples Complete ===');