// Advanced String Format Validation Examples
import { string } from 'fast-schema';

console.log('=== Advanced String Format Validation Examples ===\n');

// 1. Network and IP validation
const ipv4Schema = string().ipv4();
const ipv6Schema = string().ipv6();

console.log('1. Network formats:');
try {
  console.log('✅ Valid IPv4:', ipv4Schema.parse('192.168.1.1'));
  console.log('✅ Valid IPv6:', ipv6Schema.parse('2001:0db8:85a3:0000:0000:8a2e:0370:7334'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  ipv4Schema.parse('999.999.999.999');
} catch (error) {
  console.log('❌ Invalid IPv4:', error.message);
}

// 2. Date and time formats
const dateSchema = string().date();
const timeSchema = string().time();
const datetimeSchema = string().datetime();

console.log('\n2. Date/Time formats:');
try {
  console.log('✅ Valid date:', dateSchema.parse('2024-03-15'));
  console.log('✅ Valid time:', timeSchema.parse('14:30:00'));
  console.log('✅ Valid datetime:', datetimeSchema.parse('2024-03-15T14:30:00Z'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 3. Web and CSS formats
const cssColorSchema = string().cssColor();
const cssSelectorSchema = string().cssSelector();
const htmlIdSchema = string().htmlId();

console.log('\n3. Web formats:');
try {
  console.log('✅ Valid CSS color:', cssColorSchema.parse('#FF5733'));
  console.log('✅ Valid CSS selector:', cssSelectorSchema.parse('.btn-primary'));
  console.log('✅ Valid HTML ID:', htmlIdSchema.parse('main-content'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 4. Identifier formats
const jwtSchema = string().jwt();
const nanoidSchema = string().nanoid();
const cuidSchema = string().cuid();
const base64Schema = string().base64();

console.log('\n4. Identifier formats:');
try {
  console.log('✅ Valid JWT:', jwtSchema.parse('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'));
  console.log('✅ Valid NanoID:', nanoidSchema.parse('V1StGXR8_Z5jdHi6B-myT'));
  console.log('✅ Valid CUID:', cuidSchema.parse('cjld2cjxh0000qzrmn831i7rn'));
  console.log('✅ Valid Base64:', base64Schema.parse('SGVsbG8gV29ybGQ='));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 5. Geographic formats
const latitudeSchema = string().latitude();
const longitudeSchema = string().longitude();
const countrySchema = string().country();
const timezoneSchema = string().timezone();

console.log('\n5. Geographic formats:');
try {
  console.log('✅ Valid latitude:', latitudeSchema.parse('40.7128'));
  console.log('✅ Valid longitude:', longitudeSchema.parse('-74.0060'));
  console.log('✅ Valid country:', countrySchema.parse('US'));
  console.log('✅ Valid timezone:', timezoneSchema.parse('America/New_York'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 6. Communication formats
const phoneSchema = string().phoneNumber();
const postalCodeSchema = string().postalCode();

console.log('\n6. Communication formats:');
try {
  console.log('✅ Valid phone:', phoneSchema.parse('+1-555-123-4567'));
  console.log('✅ Valid postal code:', postalCodeSchema.parse('10001'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 7. File and media formats
const mimeTypeSchema = string().mimeType();

console.log('\n7. File formats:');
try {
  console.log('✅ Valid MIME type:', mimeTypeSchema.parse('application/json'));
  console.log('✅ Valid MIME type:', mimeTypeSchema.parse('image/png'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 8. Combined validation with refinements
const strongPasswordSchema = string()
  .min(8)
  .max(100)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character');

console.log('\n8. Complex string validation:');
try {
  console.log('✅ Strong password:', strongPasswordSchema.parse('MyP@ssw0rd123'));
} catch (error) {
  console.log('❌ Weak password error:', error.message);
}

try {
  strongPasswordSchema.parse('weak');
} catch (error) {
  console.log('❌ Password validation failed:', error.message);
}

// 9. Duration format
const durationSchema = string().duration();

console.log('\n9. Duration format:');
try {
  console.log('✅ Valid duration:', durationSchema.parse('PT30M'));
  console.log('✅ Valid duration:', durationSchema.parse('P1DT2H3M4S'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n=== Advanced String Format Examples Complete ===');