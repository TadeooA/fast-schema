/**
 * API Validation Examples
 * Real-world examples for REST API validation
 */

import { fast } from '../js/src/api';

// E-commerce API Schemas
console.log('=== E-commerce API Validation Examples ===\n');

// 1. User Registration
console.log('👤 User Registration Schema');

const userRegistrationSchema = fast.performance.fast.object({
  email: fast.performance.fast.string().email(),
  password: fast.performance.fast.string().min(8).max(128),
  firstName: fast.performance.fast.string().min(1).max(50),
  lastName: fast.performance.fast.string().min(1).max(50),
  dateOfBirth: fast.performance.fast.string(), // ISO date string
  phone: fast.performance.fast.string().optional(),
  acceptTerms: fast.performance.fast.boolean(),
  marketingOptIn: fast.performance.fast.boolean().optional()
});

type UserRegistration = typeof userRegistrationSchema._output;

const sampleRegistration = {
  email: "john.doe@example.com",
  password: "securePassword123",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1990-05-15",
  phone: "+1-555-0123",
  acceptTerms: true,
  marketingOptIn: false
};

const registrationResult = userRegistrationSchema.safeParse(sampleRegistration);
console.log('Registration validation:', registrationResult.success ? '✅ Valid' : '❌ Invalid');

// 2. Product Creation
console.log('\n📦 Product Creation Schema');

const productSchema = fast.performance.fast.object({
  name: fast.performance.fast.string().min(1).max(200),
  description: fast.performance.fast.string().max(2000),
  price: fast.performance.fast.number().min(0),
  currency: fast.performance.fast.string().length(3), // ISO currency code
  category: fast.performance.fast.string(),
  tags: fast.performance.fast.array(fast.performance.fast.string()).max(10),
  inStock: fast.performance.fast.boolean(),
  stockQuantity: fast.performance.fast.number().int().min(0),
  weight: fast.performance.fast.number().min(0).optional(),
  dimensions: fast.performance.fast.object({
    length: fast.performance.fast.number().min(0),
    width: fast.performance.fast.number().min(0),
    height: fast.performance.fast.number().min(0)
  }).optional(),
  images: fast.performance.fast.array(
    fast.performance.fast.object({
      url: fast.performance.fast.string(),
      alt: fast.performance.fast.string(),
      primary: fast.performance.fast.boolean()
    })
  ).min(1).max(10)
});

type Product = typeof productSchema._output;

const sampleProduct = {
  name: "Premium Wireless Headphones",
  description: "High-quality wireless headphones with noise cancellation",
  price: 299.99,
  currency: "USD",
  category: "Electronics",
  tags: ["audio", "wireless", "premium", "noise-cancelling"],
  inStock: true,
  stockQuantity: 50,
  weight: 0.3,
  dimensions: {
    length: 20,
    width: 15,
    height: 8
  },
  images: [
    {
      url: "https://example.com/headphones-front.jpg",
      alt: "Front view of headphones",
      primary: true
    },
    {
      url: "https://example.com/headphones-side.jpg",
      alt: "Side view of headphones",
      primary: false
    }
  ]
};

const productResult = productSchema.safeParse(sampleProduct);
console.log('Product validation:', productResult.success ? '✅ Valid' : '❌ Invalid');

// 3. Order Processing
console.log('\n🛒 Order Processing Schema');

const orderSchema = fast.performance.ultra.precompile(
  fast.performance.ultra.object({
    userId: fast.performance.ultra.string(),
    items: fast.performance.ultra.array(
      fast.performance.ultra.object({
        productId: fast.performance.ultra.string(),
        quantity: fast.performance.ultra.number().int().min(1),
        price: fast.performance.ultra.number().min(0),
        discountAmount: fast.performance.ultra.number().min(0).optional()
      })
    ).min(1).max(50),
    shippingAddress: fast.performance.ultra.object({
      street: fast.performance.ultra.string().min(5),
      city: fast.performance.ultra.string().min(2),
      state: fast.performance.ultra.string().min(2),
      zipCode: fast.performance.ultra.string(),
      country: fast.performance.ultra.string().length(2) // ISO country code
    }),
    billingAddress: fast.performance.ultra.object({
      street: fast.performance.ultra.string().min(5),
      city: fast.performance.ultra.string().min(2),
      state: fast.performance.ultra.string().min(2),
      zipCode: fast.performance.ultra.string(),
      country: fast.performance.ultra.string().length(2)
    }).optional(),
    paymentMethod: fast.performance.ultra.object({
      type: fast.performance.ultra.string(), // 'card', 'paypal', etc.
      cardToken: fast.performance.ultra.string().optional(),
      last4: fast.performance.ultra.string().optional()
    }),
    couponCode: fast.performance.ultra.string().optional(),
    notes: fast.performance.ultra.string().max(500).optional()
  })
);

type Order = typeof orderSchema._output;

const sampleOrder = {
  userId: "user_123",
  items: [
    {
      productId: "prod_001",
      quantity: 2,
      price: 299.99,
      discountAmount: 50.00
    },
    {
      productId: "prod_002",
      quantity: 1,
      price: 19.99
    }
  ],
  shippingAddress: {
    street: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "US"
  },
  paymentMethod: {
    type: "card",
    cardToken: "tok_1234567890",
    last4: "4242"
  },
  couponCode: "SAVE10",
  notes: "Please leave at the front door"
};

// Performance test for order processing
console.log('\n📊 Order Processing Performance Test');

const orderCount = 1000;
const orders = Array.from({ length: orderCount }, (_, i) => ({
  ...sampleOrder,
  userId: `user_${i}`,
  items: sampleOrder.items.map(item => ({
    ...item,
    productId: `prod_${i % 100}`
  }))
}));

const start = performance.now();
let validOrders = 0;

for (const order of orders) {
  try {
    orderSchema.parse(order);
    validOrders++;
  } catch (error) {
    // Handle validation error
  }
}

const end = performance.now();
const duration = end - start;

console.log(`✅ Processed ${validOrders}/${orderCount} orders in ${duration.toFixed(2)}ms`);
console.log(`📈 Throughput: ${Math.round(validOrders / duration * 1000).toLocaleString()} orders/sec`);

// 4. Search and Filter API
console.log('\n🔍 Search and Filter Schema');

const searchQuerySchema = fast.performance.fast.object({
  query: fast.performance.fast.string().min(1).max(100).optional(),
  category: fast.performance.fast.string().optional(),
  minPrice: fast.performance.fast.number().min(0).optional(),
  maxPrice: fast.performance.fast.number().min(0).optional(),
  inStock: fast.performance.fast.boolean().optional(),
  tags: fast.performance.fast.array(fast.performance.fast.string()).max(10).optional(),
  sortBy: fast.performance.fast.string().optional(), // 'price', 'name', 'rating'
  sortOrder: fast.performance.fast.string().optional(), // 'asc', 'desc'
  page: fast.performance.fast.number().int().min(1).optional(),
  limit: fast.performance.fast.number().int().min(1).max(100).optional()
});

type SearchQuery = typeof searchQuerySchema._output;

// 5. Webhook Validation
console.log('\n🔔 Webhook Event Schema');

const webhookEventSchema = fast.performance.ultra.object({
  id: fast.performance.ultra.string(),
  type: fast.performance.ultra.string(),
  timestamp: fast.performance.ultra.number(),
  data: fast.performance.ultra.object({
    object: fast.performance.ultra.string(),
    id: fast.performance.ultra.string(),
    attributes: fast.performance.ultra.any() // Flexible data
  }),
  metadata: fast.performance.ultra.object({
    source: fast.performance.ultra.string(),
    version: fast.performance.ultra.string(),
    environment: fast.performance.ultra.string()
  }).optional()
});

type WebhookEvent = typeof webhookEventSchema._output;

// Express.js middleware example function
function createValidationMiddleware<T>(schema: any) {
  return (req: any, res: any, next: any) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.issues || error.message
      });
    }
  };
}

// Usage examples
const validateRegistration = createValidationMiddleware(userRegistrationSchema);
const validateProduct = createValidationMiddleware(productSchema);
const validateOrder = createValidationMiddleware(orderSchema);
const validateWebhook = createValidationMiddleware(webhookEventSchema);

console.log('\n✅ API validation schemas created successfully!');
console.log('💡 Use these schemas in your Express.js routes for robust validation');

export {
  userRegistrationSchema,
  productSchema,
  orderSchema,
  searchQuerySchema,
  webhookEventSchema,
  createValidationMiddleware,
  type UserRegistration,
  type Product,
  type Order,
  type SearchQuery,
  type WebhookEvent
};