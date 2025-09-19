# Async Validation Examples

This directory contains examples of Fast-Schema's async validation capabilities.

## Features Demonstrated

- **Async Refinement**: Custom async validation with `refineAsync()`
- **Performance Optimization**: Caching, timeouts, retries
- **Error Handling**: Proper async error handling patterns
- **Multiple Validations**: Complex schemas with multiple async validations

## Files

- `basic-async.js` - Basic async validation examples
- `debounced-validation.js` - Debouncing examples and performance testing
- `advanced-config.js` - Advanced configuration options (coming soon)
- `real-world.js` - Real-world use cases (coming soon)

## Running Examples

```bash
# Run basic async validation examples
node examples/async-validation/basic-async.js

# Run debouncing examples
node examples/async-validation/debounced-validation.js

# Or run from project root
npm run example:async
npm run example:debounce
```

## API Overview

### Basic Async Refinement

```javascript
const schema = z.string()
  .email()
  .refineAsync(async (email) => {
    const response = await fetch(`/api/check-email/${email}`);
    const data = await response.json();
    return !data.exists;
  }, "Email already exists");
```

### Advanced Configuration

```javascript
const schema = z.string()
  .refineAsync(
    checkAvailability,
    {
      message: "Already taken",
      timeout: 5000,        // 5 second timeout
      cache: true,          // Enable caching
      retries: 2,           // Retry failed requests
      debounce: 300         // Debounce rapid calls
    }
  );
```

### Debouncing Configuration

```javascript
const usernameSchema = z.string()
  .min(3)
  .refineAsync(
    checkUsernameAvailability,
    {
      message: "Username is taken",
      debounce: 500,     // Wait 500ms after user stops typing
      cache: {
        ttl: 60000,      // Cache for 1 minute
        maxSize: 100     // Limit cache size
      },
      cancelPrevious: true // Cancel previous validations
    }
  );

// Standalone debounced functions
import { createDebouncedValidator, debounceAsyncFunction } from 'fast-schema';

const debouncedEmailCheck = createDebouncedValidator(checkEmailUnique, 300);
const debouncedValidator = debounceAsyncFunction(asyncValidator, 400);
```

### Usage Patterns

```javascript
// Safe parsing (recommended)
const result = await schema.safeParseAsync(data);
if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.error.issues);
}

// Direct parsing (throws on error)
try {
  const data = await schema.parseAsync(input);
  console.log('Valid:', data);
} catch (error) {
  console.log('Error:', error.message);
}
```

## Performance Features

### Caching
- Automatic caching of async validation results
- TTL (time-to-live) support
- LRU eviction strategy
- Manual cache management

### Request Optimization
- Automatic deduplication of concurrent requests
- Configurable timeouts with AbortController
- Retry logic with exponential backoff
- Race condition prevention

### Monitoring
- Cache hit/miss statistics
- Validation timing metrics
- Error tracking and reporting

## Error Codes

- `async_required` - Schema requires async validation
- `custom` - Async refinement failed
- `timeout` - Validation timed out
- `aborted` - Validation was cancelled

## Best Practices

1. **Always use safeParseAsync()** for production code
2. **Configure appropriate timeouts** for your use case
3. **Enable caching** for expensive validations
4. **Handle network errors gracefully**
5. **Use debouncing** for user input validation
6. **Monitor cache performance** in production

## Common Patterns

### Email Uniqueness Check
```javascript
const emailSchema = z.string()
  .email()
  .refineAsync(async (email) => {
    const response = await fetch(`/api/users/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const { available } = await response.json();
    return available;
  }, "Email is already registered");
```

### Username Availability
```javascript
const usernameSchema = z.string()
  .min(3)
  .max(20)
  .regex(/^[a-zA-Z0-9_]+$/)
  .refineAsync(
    async (username) => {
      const response = await fetch(`/api/users/check-username/${username}`);
      return response.status === 404; // 404 means available
    },
    {
      message: "Username is already taken",
      debounce: 300,
      cache: { ttl: 60000, maxSize: 100 }
    }
  );
```

### API Key Validation
```javascript
const apiKeySchema = z.string()
  .min(32)
  .refineAsync(
    async (key) => {
      const response = await fetch('/api/validate-key', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      return response.ok;
    },
    {
      message: "Invalid API key",
      timeout: 3000,
      retries: 1
    }
  );
```