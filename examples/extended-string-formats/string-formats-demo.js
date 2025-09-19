// Extended String Formats Validation Example
// Demonstrates all new string format validations in fast-schema

const { z } = require('../../js/pkg/fast_schema');

function networkValidationExample() {
  console.log('Network & Internet Formats Validation\n');

  // IPv4 addresses
  const ipv4Schema = z.string().ipv4();
  const ipv4Tests = [
    '192.168.1.1',     // Valid private IP
    '8.8.8.8',         // Valid public IP
    '127.0.0.1',       // Valid localhost
    '255.255.255.255', // Valid broadcast
    '256.1.1.1',       // Invalid - octet > 255
    '192.168.1',       // Invalid - incomplete
    'not-an-ip'        // Invalid - not numeric
  ];

  console.log('IPv4 Address Validation:');
  ipv4Tests.forEach(ip => {
    try {
      ipv4Schema.parse(ip);
      console.log(`  ✓ ${ip} - Valid IPv4`);
    } catch (error) {
      console.log(`  ✗ ${ip} - Invalid IPv4`);
    }
  });

  // IPv6 addresses
  const ipv6Schema = z.string().ipv6();
  const ipv6Tests = [
    '2001:0db8:85a3:0000:0000:8a2e:0370:7334', // Full format
    '2001:db8:85a3::8a2e:370:7334',            // Compressed
    '::1',                                      // Localhost
    '::',                                       // All zeros
    'fe80::1%lo0',                             // Invalid - with interface
    'not-ipv6'                                 // Invalid
  ];

  console.log('\nIPv6 Address Validation:');
  ipv6Tests.forEach(ip => {
    try {
      ipv6Schema.parse(ip);
      console.log(`  ✓ ${ip} - Valid IPv6`);
    } catch (error) {
      console.log(`  ✗ ${ip} - Invalid IPv6`);
    }
  });

  // MAC addresses
  const macSchema = z.string().macAddress();
  const macTests = [
    '00:1B:44:11:3A:B7',  // Colon format
    '00-1B-44-11-3A-B7',  // Dash format
    '001B44113AB7',       // Invalid - no separators
    '00:1B:44:11:3A',     // Invalid - incomplete
    'ZZ:1B:44:11:3A:B7'   // Invalid - non-hex
  ];

  console.log('\nMAC Address Validation:');
  macTests.forEach(mac => {
    try {
      macSchema.parse(mac);
      console.log(`  ✓ ${mac} - Valid MAC`);
    } catch (error) {
      console.log(`  ✗ ${mac} - Invalid MAC`);
    }
  });
}

function communicationValidationExample() {
  console.log('\n\nCommunication Formats Validation\n');

  // Phone numbers
  const phoneSchema = z.string().phone();
  const phoneTests = [
    '+1-555-123-4567',     // US format with country code
    '+44 20 7946 0958',    // UK format
    '(555) 123-4567',      // US format with parentheses
    '555.123.4567',        // US format with dots
    '+86 138 0013 8000',   // China format
    '123',                 // Invalid - too short
    '+1234567890123456',   // Invalid - too long
    'not-a-phone'          // Invalid - not numeric
  ];

  console.log('Phone Number Validation:');
  phoneTests.forEach(phone => {
    try {
      phoneSchema.parse(phone);
      console.log(`  ✓ ${phone} - Valid phone`);
    } catch (error) {
      console.log(`  ✗ ${phone} - Invalid phone`);
    }
  });

  // JWT tokens
  const jwtSchema = z.string().jwt();
  const jwtTests = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', // Valid JWT
    'invalid.jwt',                                    // Invalid - only 2 parts
    'not.a.jwt.token',                               // Invalid - 4 parts
    'invalid_base64.invalid_base64.invalid_base64',  // Invalid - bad base64url
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.invalid_signature' // Valid format but potentially invalid signature
  ];

  console.log('\nJWT Token Validation:');
  jwtTests.forEach(jwt => {
    try {
      jwtSchema.parse(jwt);
      console.log(`  ✓ Valid JWT format`);
    } catch (error) {
      console.log(`  ✗ Invalid JWT format`);
    }
  });
}

function dataEncodingValidationExample() {
  console.log('\n\nData Encoding Formats Validation\n');

  // Base64 strings
  const base64Schema = z.string().base64();
  const base64Tests = [
    'SGVsbG8gV29ybGQ=',     // "Hello World" encoded
    'VGVzdCBzdHJpbmc=',     // "Test string" encoded
    'YWJjZGVmZw==',         // "abcdefg" encoded
    'InvalidBase64!',       // Invalid characters
    'SGVsbG8=Invalid',      // Invalid - extra characters
    'SGVsbG8'               // Invalid - missing padding
  ];

  console.log('Base64 String Validation:');
  base64Tests.forEach(str => {
    try {
      base64Schema.parse(str);
      console.log(`  ✓ ${str} - Valid base64`);
    } catch (error) {
      console.log(`  ✗ ${str} - Invalid base64`);
    }
  });

  // Hexadecimal strings
  const hexSchema = z.string().hex();
  const hexTests = [
    '1234567890ABCDEF',     // Valid hex
    '0x1234567890ABCDEF',   // Valid with 0x prefix
    'deadbeef',             // Valid lowercase
    '0xFF00FF',             // Valid mixed case with prefix
    'GHIJK',                // Invalid - contains non-hex chars
    '0x',                   // Invalid - prefix only
    ''                      // Invalid - empty
  ];

  console.log('\nHexadecimal String Validation:');
  hexTests.forEach(str => {
    try {
      hexSchema.parse(str);
      console.log(`  ✓ ${str} - Valid hex`);
    } catch (error) {
      console.log(`  ✗ ${str} - Invalid hex`);
    }
  });
}

function financialValidationExample() {
  console.log('\n\nFinancial Formats Validation\n');

  // Credit card numbers
  const creditCardSchema = z.string().creditCard();
  const creditCardTests = [
    '4532015112830366',     // Valid Visa
    '4532-0151-1283-0366',  // Valid Visa with dashes
    '4532 0151 1283 0366',  // Valid Visa with spaces
    '5555555555554444',     // Valid MasterCard
    '371449635398431',      // Valid American Express
    '6011111111111117',     // Valid Discover
    '1234567890123456',     // Invalid - fails Luhn
    '12345',                // Invalid - too short
    '12345678901234567890', // Invalid - too long
    'not-a-card-number'     // Invalid - not numeric
  ];

  console.log('Credit Card Number Validation:');
  creditCardTests.forEach(card => {
    try {
      creditCardSchema.parse(card);
      console.log(`  ✓ ${card} - Valid credit card`);
    } catch (error) {
      console.log(`  ✗ ${card} - Invalid credit card`);
    }
  });
}

function webValidationExample() {
  console.log('\n\nWeb Formats Validation\n');

  // Color formats
  const colorSchema = z.string().color();
  const colorTests = [
    '#FF0000',              // Valid hex color
    '#F00',                 // Valid short hex
    '#FF0000FF',            // Valid hex with alpha
    'red',                  // Valid named color
    'rgb(255, 0, 0)',       // Valid RGB
    'rgba(255, 0, 0, 0.5)', // Valid RGBA
    'transparent',          // Valid named color
    '#GGGGGG',              // Invalid - bad hex chars
    'rgb(256, 0, 0)',       // Invalid - value out of range
    'notacolor'             // Invalid - unknown name
  ];

  console.log('Color Format Validation:');
  colorTests.forEach(color => {
    try {
      colorSchema.parse(color);
      console.log(`  ✓ ${color} - Valid color`);
    } catch (error) {
      console.log(`  ✗ ${color} - Invalid color`);
    }
  });

  // URL slugs
  const slugSchema = z.string().slug();
  const slugTests = [
    'hello-world',          // Valid slug
    'my-awesome-post',      // Valid slug
    'simple',               // Valid single word
    'test-123',             // Valid with numbers
    'Hello-World',          // Invalid - uppercase
    'hello_world',          // Invalid - underscore
    'hello--world',         // Invalid - double dash
    'hello world',          // Invalid - space
    '-hello',               // Invalid - starts with dash
    'hello-'                // Invalid - ends with dash
  ];

  console.log('\nURL Slug Validation:');
  slugTests.forEach(slug => {
    try {
      slugSchema.parse(slug);
      console.log(`  ✓ ${slug} - Valid slug`);
    } catch (error) {
      console.log(`  ✗ ${slug} - Invalid slug`);
    }
  });
}

function realWorldExample() {
  console.log('\n\nReal-World Usage Example\n');

  // User registration schema with various format validations
  const userRegistrationSchema = z.object({
    email: z.string().email(),
    phone: z.string().phone().optional(),
    website: z.string().url().optional(),
    ipAddress: z.string().ipv4().optional(),
    apiKey: z.string().base64(),
    colorTheme: z.string().color().optional(),
    profileSlug: z.string().slug()
  });

  // Network configuration schema
  const networkConfigSchema = z.object({
    serverIp: z.string().ipv4(),
    serverIpv6: z.string().ipv6().optional(),
    macAddress: z.string().macAddress(),
    authToken: z.string().jwt(),
    configHash: z.string().hex()
  });

  // Payment information schema
  const paymentSchema = z.object({
    cardNumber: z.string().creditCard(),
    userId: z.string().uuid(),
    transactionId: z.string().base64()
  });

  console.log('Testing real-world schemas...\n');

  // Test user registration
  const userData = {
    email: 'user@example.com',
    phone: '+1-555-123-4567',
    website: 'https://example.com',
    ipAddress: '192.168.1.100',
    apiKey: 'YWJjZGVmZw==',
    colorTheme: '#FF6B35',
    profileSlug: 'john-doe-dev'
  };

  try {
    const validUser = userRegistrationSchema.parse(userData);
    console.log('✓ User registration data is valid');
    console.log(`  Profile: ${validUser.profileSlug}`);
    console.log(`  Theme: ${validUser.colorTheme}`);
  } catch (error) {
    console.log('✗ User registration validation failed:', error.message);
  }

  // Test network configuration
  const networkData = {
    serverIp: '10.0.0.1',
    serverIpv6: '2001:db8::1',
    macAddress: '00:1B:44:11:3A:B7',
    authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    configHash: '0xDEADBEEF'
  };

  try {
    const validNetwork = networkConfigSchema.parse(networkData);
    console.log('✓ Network configuration is valid');
    console.log(`  Server: ${validNetwork.serverIp}`);
  } catch (error) {
    console.log('✗ Network configuration validation failed:', error.message);
  }

  // Test payment information
  const paymentData = {
    cardNumber: '4532015112830366',
    userId: '123e4567-e89b-12d3-a456-426614174000',
    transactionId: 'dHJhbnNhY3Rpb24='
  };

  try {
    const validPayment = paymentSchema.parse(paymentData);
    console.log('✓ Payment information is valid');
    console.log(`  Card ending in: ****${validPayment.cardNumber.slice(-4)}`);
  } catch (error) {
    console.log('✗ Payment validation failed:', error.message);
  }
}

function performanceComparison() {
  console.log('\n\nPerformance Comparison\n');

  const formats = [
    { name: 'Email', schema: z.string().email(), data: 'test@example.com' },
    { name: 'IPv4', schema: z.string().ipv4(), data: '192.168.1.1' },
    { name: 'Phone', schema: z.string().phone(), data: '+1-555-123-4567' },
    { name: 'JWT', schema: z.string().jwt(), data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' },
    { name: 'Credit Card', schema: z.string().creditCard(), data: '4532015112830366' },
    { name: 'Base64', schema: z.string().base64(), data: 'SGVsbG8gV29ybGQ=' }
  ];

  const iterations = 10000;

  console.log(`Running ${iterations} validations for each format...\n`);

  formats.forEach(({ name, schema, data }) => {
    const start = Date.now();

    for (let i = 0; i < iterations; i++) {
      try {
        schema.parse(data);
      } catch (error) {
        // Handle validation errors
      }
    }

    const end = Date.now();
    const duration = end - start;
    const perSecond = Math.round(iterations / (duration / 1000));

    console.log(`${name.padEnd(12)}: ${duration}ms total, ~${perSecond.toLocaleString()} validations/sec`);
  });
}

// Run all examples
async function main() {
  try {
    networkValidationExample();
    communicationValidationExample();
    dataEncodingValidationExample();
    financialValidationExample();
    webValidationExample();
    realWorldExample();
    performanceComparison();

    console.log('\nAll extended string format examples completed successfully!');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  networkValidationExample,
  communicationValidationExample,
  dataEncodingValidationExample,
  financialValidationExample,
  webValidationExample,
  realWorldExample,
  performanceComparison
};