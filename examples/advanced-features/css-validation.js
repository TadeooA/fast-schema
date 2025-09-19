// CSS-in-JS Validation Examples
import { string, object, cssValue, cssSelector, cssColor, cssLength } from 'fast-schema';

console.log('=== CSS-in-JS Validation Examples ===\n');

// 1. CSS Color validation
const colorSchema = cssColor();

console.log('1. CSS Color validation:');
try {
  console.log('✅ Hex color:', colorSchema.parse('#FF5733'));
  console.log('✅ RGB color:', colorSchema.parse('rgb(255, 87, 51)'));
  console.log('✅ Named color:', colorSchema.parse('red'));
  console.log('✅ HSL color:', colorSchema.parse('hsl(14, 100%, 60%)'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  colorSchema.parse('invalid-color');
} catch (error) {
  console.log('❌ Invalid color rejected:', error.message);
}

// 2. CSS Length validation
const lengthSchema = cssLength();

console.log('\n2. CSS Length validation:');
try {
  console.log('✅ Pixel value:', lengthSchema.parse('16px'));
  console.log('✅ Em value:', lengthSchema.parse('1.5em'));
  console.log('✅ Percentage:', lengthSchema.parse('100%'));
  console.log('✅ Viewport width:', lengthSchema.parse('50vw'));
  console.log('✅ Rem value:', lengthSchema.parse('2rem'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  lengthSchema.parse('invalid-length');
} catch (error) {
  console.log('❌ Invalid length rejected:', error.message);
}

// 3. CSS Selector validation
const selectorSchema = cssSelector('complex');

console.log('\n3. CSS Selector validation:');
try {
  console.log('✅ Class selector:', selectorSchema.parse('.btn-primary'));
  console.log('✅ ID selector:', selectorSchema.parse('#main-content'));
  console.log('✅ Element selector:', selectorSchema.parse('div'));
  console.log('✅ Complex selector:', selectorSchema.parse('.container > .row .col-md-6:hover'));
  console.log('✅ Pseudo-class:', selectorSchema.parse('a:hover'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 4. CSS-in-JS Style Object validation
const styleObjectSchema = object({
  backgroundColor: cssColor(),
  color: cssColor(),
  fontSize: cssLength(),
  margin: cssLength(),
  padding: cssLength(),
  borderRadius: cssLength().optional(),
  boxShadow: string().optional(),
  display: string().refine(
    val => ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'].includes(val),
    'Invalid display value'
  ).optional(),
  position: string().refine(
    val => ['static', 'relative', 'absolute', 'fixed', 'sticky'].includes(val),
    'Invalid position value'
  ).optional()
});

console.log('\n4. CSS-in-JS Style Object validation:');
const validStyles = {
  backgroundColor: '#f8f9fa',
  color: '#333',
  fontSize: '16px',
  margin: '0',
  padding: '1rem',
  borderRadius: '4px',
  display: 'flex',
  position: 'relative'
};

try {
  console.log('✅ Valid style object:', styleObjectSchema.parse(validStyles));
} catch (error) {
  console.log('❌ Error:', error.message);
}

const invalidStyles = {
  backgroundColor: 'invalid-color',
  fontSize: 'invalid-size',
  display: 'invalid-display'
};

try {
  styleObjectSchema.parse(invalidStyles);
} catch (error) {
  console.log('❌ Invalid styles rejected:', error.message);
}

// 5. Theme validation for design systems
const themeSchema = object({
  colors: object({
    primary: cssColor(),
    secondary: cssColor(),
    success: cssColor(),
    warning: cssColor(),
    error: cssColor(),
    background: cssColor(),
    surface: cssColor(),
    text: object({
      primary: cssColor(),
      secondary: cssColor(),
      disabled: cssColor()
    })
  }),
  typography: object({
    fontFamily: string(),
    fontSize: object({
      small: cssLength(),
      medium: cssLength(),
      large: cssLength(),
      xlarge: cssLength()
    }),
    fontWeight: object({
      normal: string().refine(val => /^[1-9]00$/.test(val), 'Must be valid font weight'),
      bold: string().refine(val => /^[1-9]00$/.test(val), 'Must be valid font weight')
    }),
    lineHeight: object({
      tight: string(),
      normal: string(),
      relaxed: string()
    })
  }),
  spacing: object({
    xs: cssLength(),
    sm: cssLength(),
    md: cssLength(),
    lg: cssLength(),
    xl: cssLength()
  }),
  breakpoints: object({
    sm: cssLength(),
    md: cssLength(),
    lg: cssLength(),
    xl: cssLength()
  })
});

console.log('\n5. Design system theme validation:');
const validTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      disabled: '#adb5bd'
    }
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      small: '14px',
      medium: '16px',
      large: '20px',
      xlarge: '24px'
    },
    fontWeight: {
      normal: '400',
      bold: '600'
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.8'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px'
  }
};

try {
  console.log('✅ Valid theme:', themeSchema.parse(validTheme));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 6. CSS Animation validation
const animationSchema = object({
  name: string().regex(/^[a-zA-Z][a-zA-Z0-9-]*$/, 'Invalid animation name'),
  duration: string().regex(/^\d+(\.\d+)?(ms|s)$/, 'Invalid duration format'),
  timingFunction: string().refine(
    val => ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'].includes(val) ||
           val.startsWith('cubic-bezier(') || val.startsWith('steps('),
    'Invalid timing function'
  ),
  delay: string().regex(/^\d+(\.\d+)?(ms|s)$/, 'Invalid delay format').optional(),
  iterationCount: string().refine(
    val => val === 'infinite' || /^\d+$/.test(val),
    'Invalid iteration count'
  ).optional(),
  direction: string().refine(
    val => ['normal', 'reverse', 'alternate', 'alternate-reverse'].includes(val),
    'Invalid direction'
  ).optional(),
  fillMode: string().refine(
    val => ['none', 'forwards', 'backwards', 'both'].includes(val),
    'Invalid fill mode'
  ).optional()
});

console.log('\n6. CSS Animation validation:');
const validAnimation = {
  name: 'fadeIn',
  duration: '0.3s',
  timingFunction: 'ease-in-out',
  delay: '0s',
  iterationCount: '1',
  direction: 'normal',
  fillMode: 'forwards'
};

try {
  console.log('✅ Valid animation:', animationSchema.parse(validAnimation));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 7. CSS Grid layout validation
const gridLayoutSchema = object({
  display: string().refine(val => val === 'grid', 'Must be grid display'),
  gridTemplateColumns: string().refine(
    val => /^(auto|min-content|max-content|minmax\(.+\)|fit-content\(.+\)|\d+(\.\d+)?(fr|px|em|rem|%)|repeat\(.+\))(\s+(auto|min-content|max-content|minmax\(.+\)|fit-content\(.+\)|\d+(\.\d+)?(fr|px|em|rem|%)|repeat\(.+\)))*$/.test(val),
    'Invalid grid template columns'
  ),
  gridTemplateRows: string().refine(
    val => /^(auto|min-content|max-content|minmax\(.+\)|fit-content\(.+\)|\d+(\.\d+)?(fr|px|em|rem|%)|repeat\(.+\))(\s+(auto|min-content|max-content|minmax\(.+\)|fit-content\(.+\)|\d+(\.\d+)?(fr|px|em|rem|%)|repeat\(.+\)))*$/.test(val),
    'Invalid grid template rows'
  ).optional(),
  gap: cssLength().optional(),
  gridGap: cssLength().optional(),
  justifyContent: string().refine(
    val => ['start', 'end', 'center', 'stretch', 'space-around', 'space-between', 'space-evenly'].includes(val),
    'Invalid justify content'
  ).optional(),
  alignContent: string().refine(
    val => ['start', 'end', 'center', 'stretch', 'space-around', 'space-between', 'space-evenly'].includes(val),
    'Invalid align content'
  ).optional()
});

console.log('\n7. CSS Grid layout validation:');
const validGridLayout = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'auto 1fr auto',
  gap: '16px',
  justifyContent: 'center',
  alignContent: 'start'
};

try {
  console.log('✅ Valid grid layout:', gridLayoutSchema.parse(validGridLayout));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 8. CSS Media Query validation
const mediaQuerySchema = string().refine(
  val => /^@media\s+/.test(val) && val.includes('(') && val.includes(')'),
  'Invalid media query format'
);

console.log('\n8. CSS Media Query validation:');
try {
  console.log('✅ Valid media query:', mediaQuerySchema.parse('@media (max-width: 768px)'));
  console.log('✅ Complex media query:', mediaQuerySchema.parse('@media screen and (min-width: 768px) and (max-width: 1024px)'));
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  mediaQuerySchema.parse('invalid media query');
} catch (error) {
  console.log('❌ Invalid media query rejected:', error.message);
}

console.log('\n=== CSS-in-JS Validation Examples Complete ===');