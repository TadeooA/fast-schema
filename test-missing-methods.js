// Test missing methods mentioned by user
const { fast } = require('./dist/index.js');

console.log('🧪 Testing missing methods...\n');

try {
  // Test object schema
  const objSchema = fast.object({
    name: fast.string(),
    age: fast.number(),
    email: fast.string().email()
  });

  console.log('✅ Object schema created');

  // Test 1: pick method
  console.log('\n1. Testing pick() method:');
  try {
    if (typeof objSchema.pick === 'function') {
      const picked = objSchema.pick(['name', 'email']);
      console.log('✅ pick() method exists and callable');
    } else {
      console.log('❌ pick() method does not exist');
      console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(objSchema)).filter(m => typeof objSchema[m] === 'function'));
    }
  } catch (e) {
    console.log('❌ pick() failed:', e.message);
  }

  // Test 2: refine method
  console.log('\n2. Testing refine() method:');
  try {
    if (typeof objSchema.refine === 'function') {
      const refined = objSchema.refine((data) => data.age > 18, 'Must be adult');
      console.log('✅ refine() method exists and callable');
    } else {
      console.log('❌ refine() method does not exist');
    }
  } catch (e) {
    console.log('❌ refine() failed:', e.message);
  }

  // Test 3: String schema method chaining after refine
  console.log('\n3. Testing string schema method chaining with refine:');
  try {
    const stringSchema = fast.string().min(2);
    console.log('✅ Basic string chain works');

    const refined = stringSchema.refine((s) => s.includes('test'), 'Must contain test');
    console.log('✅ refine() after min() works');

    // Try chaining after refine
    if (typeof refined.trim === 'function') {
      const chained = refined.trim();
      console.log('✅ trim() after refine() works');
    } else {
      console.log('❌ trim() not available after refine()');
      console.log('Available methods after refine:', Object.getOwnPropertyNames(Object.getPrototypeOf(refined)).filter(m => typeof refined[m] === 'function'));
    }
  } catch (e) {
    console.log('❌ String chaining with refine failed:', e.message);
  }

} catch (error) {
  console.error('❌ Test failed:', error.message);
}