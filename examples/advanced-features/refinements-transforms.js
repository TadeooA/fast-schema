// Refinements and Transformations Examples
import { string, number, object, array, custom } from 'fast-schema';

console.log('=== Refinements and Transformations Examples ===\n');

// 1. Basic refinements with custom validation
const positiveEvenNumber = number()
  .positive()
  .refine(n => n % 2 === 0, 'Number must be even');

console.log('1. Basic refinement validation:');
try {
  console.log('✅ Valid positive even number:', positiveEvenNumber.parse(4));
  console.log('✅ Valid positive even number:', positiveEvenNumber.parse(10));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  positiveEvenNumber.parse(3);
} catch (error) {
  console.log('❌ Odd number rejected:', error.message);
}

try {
  positiveEvenNumber.parse(-4);
} catch (error) {
  console.log('❌ Negative number rejected:', error.message);
}

// 2. String refinements with business logic
const strongPassword = string()
  .min(8)
  .refine(pwd => /[A-Z]/.test(pwd), 'Must contain uppercase letter')
  .refine(pwd => /[a-z]/.test(pwd), 'Must contain lowercase letter')
  .refine(pwd => /\d/.test(pwd), 'Must contain number')
  .refine(pwd => /[!@#$%^&*]/.test(pwd), 'Must contain special character');

console.log('\n2. String refinement with multiple rules:');
try {
  console.log('✅ Strong password:', strongPassword.parse('MyP@ssw0rd123'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  strongPassword.parse('weakpassword');
} catch (error) {
  console.log('❌ Weak password rejected:', error.message);
}

// 3. Object refinements with cross-field validation
const dateRangeSchema = object({
  startDate: string().date(),
  endDate: string().date()
}).refine(
  data => new Date(data.startDate) < new Date(data.endDate),
  'End date must be after start date'
);

console.log('\n3. Object refinement with cross-field validation:');
try {
  console.log('✅ Valid date range:', dateRangeSchema.parse({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  dateRangeSchema.parse({
    startDate: '2024-12-31',
    endDate: '2024-01-01'
  });
} catch (error) {
  console.log('❌ Invalid date range:', error.message);
}

// 4. Transformations - data conversion
const stringToNumber = string()
  .regex(/^\d+$/, 'Must be numeric string')
  .transform(str => parseInt(str, 10));

console.log('\n4. Basic transformation (string to number):');
try {
  const result = stringToNumber.parse('123');
  console.log('✅ Transformed to number:', result, typeof result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 5. Complex transformation with validation
const emailNormalization = string()
  .email()
  .transform(email => email.toLowerCase().trim());

console.log('\n5. Email normalization transformation:');
try {
  const result = emailNormalization.parse('  USER@EXAMPLE.COM  ');
  console.log('✅ Normalized email:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 6. Array transformation
const csvToArray = string()
  .refine(str => str.includes(','), 'Must be comma-separated values')
  .transform(str => str.split(',').map(item => item.trim()));

console.log('\n6. CSV to array transformation:');
try {
  const result = csvToArray.parse('apple, banana, cherry, date');
  console.log('✅ CSV to array:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 7. Complex object transformation
const userInputSchema = object({
  name: string().transform(name => name.trim()),
  age: string().regex(/^\d+$/).transform(age => parseInt(age, 10)),
  tags: string().transform(tags => tags.split(',').map(tag => tag.trim())),
  preferences: object({
    newsletter: string().transform(val => val.toLowerCase() === 'true')
  })
});

console.log('\n7. Complex object transformation:');
const userInput = {
  name: '  John Doe  ',
  age: '25',
  tags: 'developer, javascript, typescript',
  preferences: {
    newsletter: 'TRUE'
  }
};

try {
  const result = userInputSchema.parse(userInput);
  console.log('✅ Transformed user object:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 8. Chained refinements and transformations
const processedData = string()
  .min(1, 'Cannot be empty')
  .transform(str => str.trim())
  .refine(str => str.length > 0, 'Cannot be whitespace only')
  .transform(str => str.toUpperCase())
  .refine(str => /^[A-Z\s]+$/.test(str), 'Must contain only letters and spaces');

console.log('\n8. Chained refinements and transformations:');
try {
  const result = processedData.parse('  hello world  ');
  console.log('✅ Processed data:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  processedData.parse('   ');
} catch (error) {
  console.log('❌ Whitespace-only rejected:', error.message);
}

// 9. Custom validation with type guards
const isPositiveInteger = (value: unknown): value is number => {
  return typeof value === 'number' &&
         Number.isInteger(value) &&
         value > 0;
};

const customPositiveInt = custom(isPositiveInteger, 'Must be a positive integer');

console.log('\n9. Custom validation with type guards:');
try {
  console.log('✅ Valid positive integer:', customPositiveInt.parse(42));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  customPositiveInt.parse(-5);
} catch (error) {
  console.log('❌ Negative number rejected:', error.message);
}

try {
  customPositiveInt.parse(3.14);
} catch (error) {
  console.log('❌ Float rejected:', error.message);
}

// 10. Conditional transformation based on input
const flexibleDateParser = string()
  .refine(str => str.length > 0, 'Date cannot be empty')
  .transform(str => {
    // Handle different date formats
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return new Date(str).toISOString();
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [month, day, year] = str.split('/');
      return new Date(`${year}-${month}-${day}`).toISOString();
    } else if (/^\d{8}$/.test(str)) {
      const year = str.slice(0, 4);
      const month = str.slice(4, 6);
      const day = str.slice(6, 8);
      return new Date(`${year}-${month}-${day}`).toISOString();
    }
    throw new Error('Unsupported date format');
  });

console.log('\n10. Flexible date parser with transformation:');
try {
  console.log('✅ ISO format:', flexibleDateParser.parse('2024-03-15'));
  console.log('✅ US format:', flexibleDateParser.parse('03/15/2024'));
  console.log('✅ Compact format:', flexibleDateParser.parse('20240315'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  flexibleDateParser.parse('invalid-date');
} catch (error) {
  console.log('❌ Invalid format rejected:', error.message);
}

console.log('\n=== Refinements and Transformations Examples Complete ===');