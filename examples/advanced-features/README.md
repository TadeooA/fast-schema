# Advanced Features Examples

This directory showcases Fast-Schema's advanced validation capabilities that go beyond basic JSON schema validation.

## 🚀 Features Covered

### 1. Extended String Formats (`string-formats.js`)

Fast-Schema supports 30+ built-in string formats for common validation patterns:

```javascript
import { string } from 'fast-schema';

// Network formats
const ipv4 = string().ipv4();
const ipv6 = string().ipv6();

// Date/time formats
const date = string().date();
const datetime = string().datetime();
const duration = string().duration();

// Web formats
const cssColor = string().cssColor();
const cssSelector = string().cssSelector();
const htmlId = string().htmlId();

// Identifiers
const jwt = string().jwt();
const nanoid = string().nanoid();
const base64 = string().base64();

// Geographic
const latitude = string().latitude();
const country = string().country();
const timezone = string().timezone();
```

**Supported Formats:**
- **Network**: IPv4, IPv6, MAC address, hostname, port
- **Date/Time**: Date, time, datetime, duration
- **Web**: CSS colors, selectors, HTML IDs, class names
- **Crypto**: JWT, Base64, SHA256, MD5
- **Geographic**: Latitude, longitude, country codes, timezones
- **Communication**: Phone numbers, postal codes
- **File**: MIME types, file extensions

### 2. Union and Intersection Types (`union-intersection.js`)

Create flexible schemas that accept multiple types or combine type requirements:

```javascript
import { string, number, object, union, intersection, literal } from 'fast-schema';

// Union types (OR logic)
const stringOrNumber = union([string(), number()]);
const status = union([literal('pending'), literal('approved'), literal('rejected')]);

// Using fluent API
const flexibleId = string().uuid().or(number().int()).or(string().nanoid());

// Intersection types (AND logic)
const userWithTimestamps = intersection(
  object({ id: string(), name: string() }),
  object({ createdAt: string().datetime(), updatedAt: string().datetime() })
);

// Using fluent API
const enhancedUser = baseUser.and(timestampFields);
```

**Use Cases:**
- API responses with different payload types
- Discriminated unions for type safety
- Combining multiple schema requirements
- Form validation with conditional fields

### 3. Refinements and Transformations (`refinements-transforms.js`)

Add custom validation logic and data transformation:

```javascript
import { string, number, object } from 'fast-schema';

// Refinements (custom validation)
const evenNumber = number().refine(n => n % 2 === 0, 'Must be even');
const strongPassword = string()
  .min(8)
  .refine(pwd => /[A-Z]/.test(pwd), 'Must contain uppercase')
  .refine(pwd => /[!@#$%^&*]/.test(pwd), 'Must contain special char');

// Cross-field validation
const dateRange = object({
  start: string().date(),
  end: string().date()
}).refine(
  data => new Date(data.start) < new Date(data.end),
  'End date must be after start date'
);

// Transformations (data conversion)
const stringToNumber = string()
  .regex(/^\d+$/)
  .transform(str => parseInt(str, 10));

const normalizedEmail = string()
  .email()
  .transform(email => email.toLowerCase().trim());

// Chained transformations
const processedData = string()
  .transform(str => str.trim())
  .refine(str => str.length > 0)
  .transform(str => str.toUpperCase());
```

**Capabilities:**
- Custom validation predicates
- Cross-field validation
- Data type transformations
- Input normalization
- Complex business logic validation

### 4. Schema Composition Utilities (`schema-composition.js`)

Powerful utilities for building and combining schemas:

```javascript
import { object, string, number, SchemaUtils } from 'fast-schema';

// Merge schemas
const fullUser = SchemaUtils.merge(baseUser, timestamps);

// Pick/omit fields
const publicUser = SchemaUtils.pick(fullUser, ['id', 'name']);
const userWithoutDates = SchemaUtils.omit(fullUser, ['createdAt', 'updatedAt']);

// Make all fields optional
const partialUser = SchemaUtils.partial(baseUser);

// Record schemas (dynamic keys)
const preferences = SchemaUtils.record(string());

// Tuple schemas (fixed arrays)
const coordinates = SchemaUtils.tuple([number(), number()]);
const rgbaColor = SchemaUtils.tuple([
  number().min(0).max(255), // R
  number().min(0).max(255), // G
  number().min(0).max(255), // B
  number().min(0).max(1)    // A
]);
```

**Utilities:**
- `merge`: Combine multiple object schemas
- `pick`: Select specific fields
- `omit`: Exclude specific fields
- `partial`: Make all fields optional
- `record`: Dynamic object keys with typed values
- `tuple`: Fixed-length arrays with typed elements

### 5. CSS-in-JS Validation (`css-validation.js`)

Validate CSS properties, values, and complete style objects:

```javascript
import { string, object, cssColor, cssLength, cssSelector } from 'fast-schema';

// CSS value validation
const color = cssColor(); // #fff, rgb(255,0,0), hsl(180,50%,50%)
const length = cssLength(); // 16px, 1em, 100%, 50vw

// Style object validation
const styleSchema = object({
  backgroundColor: cssColor(),
  fontSize: cssLength(),
  margin: cssLength(),
  display: string().refine(val =>
    ['block', 'inline', 'flex', 'grid'].includes(val)
  )
});

// Design system theme validation
const themeSchema = object({
  colors: object({
    primary: cssColor(),
    secondary: cssColor()
  }),
  spacing: object({
    sm: cssLength(),
    md: cssLength(),
    lg: cssLength()
  }),
  typography: object({
    fontSize: object({
      small: cssLength(),
      large: cssLength()
    })
  })
});
```

**CSS Features:**
- Color validation (hex, rgb, hsl, named colors)
- Length validation (px, em, rem, %, viewport units)
- Selector validation
- Animation properties
- Grid/Flexbox layouts
- Media queries
- Complete theme validation

### 6. GraphQL Schema Validation (`graphql-validation.js`)

Validate GraphQL queries, responses, and schema definitions:

```javascript
import { string, number, object, array, union, literal } from 'fast-schema';

// GraphQL Object Type
const userType = object({
  __typename: literal('User'),
  id: string(),
  name: string(),
  email: string().email(),
  posts: array(object({
    __typename: literal('Post'),
    id: string(),
    title: string(),
    publishedAt: string().datetime().optional()
  })).optional()
});

// GraphQL Union Type
const searchResult = union([
  object({ __typename: literal('User'), ...userFields }),
  object({ __typename: literal('Post'), ...postFields }),
  object({ __typename: literal('Comment'), ...commentFields })
]);

// GraphQL Query Response
const queryResponse = object({
  data: object({
    user: userType.optional()
  }).optional(),
  errors: array(object({
    message: string(),
    locations: array(object({
      line: number().int(),
      column: number().int()
    })).optional(),
    path: array(union([string(), number()])).optional()
  })).optional()
});
```

**GraphQL Support:**
- Scalar type validation
- Object type validation with `__typename`
- Union type validation
- Input type validation
- Query/Mutation response validation
- Error response validation
- Subscription event validation
- Schema definition validation

## 🏃‍♂️ Running the Examples

```bash
# Run individual examples
node examples/advanced-features/string-formats.js
node examples/advanced-features/union-intersection.js
node examples/advanced-features/refinements-transforms.js
node examples/advanced-features/schema-composition.js
node examples/advanced-features/css-validation.js
node examples/advanced-features/graphql-validation.js

# Run all advanced examples
npm run examples:advanced
```

## 🔥 Performance Benefits

All advanced features maintain Fast-Schema's **10-20x performance advantage**:

- **Union types**: Optimized short-circuit evaluation
- **Transformations**: Lazy evaluation and caching
- **CSS validation**: Compiled regex patterns
- **GraphQL**: Efficient type checking
- **Refinements**: Minimal overhead validation

## 🎯 Real-World Use Cases

### API Development
```javascript
// Flexible API response handling
const apiResponse = union([
  object({ success: literal(true), data: userSchema }),
  object({ success: literal(false), error: errorSchema })
]);
```

### Form Validation
```javascript
// Multi-step form with transformations
const registrationForm = object({
  email: string().email().transform(email => email.toLowerCase()),
  password: strongPasswordSchema,
  confirmPassword: string()
}).refine(
  data => data.password === data.confirmPassword,
  'Passwords must match'
);
```

### Design Systems
```javascript
// Component prop validation
const buttonProps = object({
  variant: union([literal('primary'), literal('secondary')]),
  size: union([literal('sm'), literal('md'), literal('lg')]),
  disabled: string().transform(val => val === 'true').optional()
});
```

### Configuration Management
```javascript
// Environment-specific configs
const config = intersection(
  baseConfig,
  union([devConfig, prodConfig, testConfig])
);
```

## 📚 Integration Examples

### React Components
```javascript
const ComponentPropsSchema = intersection(
  htmlProps,
  object({
    variant: union([literal('primary'), literal('secondary')]),
    children: reactNodeSchema
  })
);
```

### API Clients
```javascript
const createUserMutation = object({
  input: userInputSchema.pick(['name', 'email']),
  response: apiResponseSchema
});
```

### State Management
```javascript
const storeState = intersection(
  userState,
  uiState,
  dataState
);
```

These advanced features make Fast-Schema a comprehensive validation solution for modern JavaScript/TypeScript applications, supporting everything from simple forms to complex enterprise APIs while maintaining exceptional performance.