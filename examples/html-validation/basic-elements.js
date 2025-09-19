// Basic HTML Element Validation Examples
import { htmlElement, div, img, button, input, a, form, label, string, object } from 'fast-schema';

console.log('=== Basic HTML Element Validation Examples ===\n');

// 1. Basic div element validation
const divSchema = div();

const validDiv = {
  type: 'div',
  props: {
    className: 'container',
    style: { backgroundColor: 'blue' }
  }
};

const invalidDiv = {
  type: 'span', // Wrong element type
  props: {}
};

console.log('1. Div validation:');
try {
  const result = divSchema.parse(validDiv);
  console.log('✅ Valid div:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  divSchema.parse(invalidDiv);
} catch (error) {
  console.log('❌ Invalid div error:', error.message);
}

// 2. Image element with accessibility validation
const imgSchema = img().validateAccessibility('strict');

const validImage = {
  type: 'img',
  props: {
    src: '/path/to/image.jpg',
    alt: 'A beautiful sunset over the mountains',
    className: 'hero-image'
  }
};

const invalidImage = {
  type: 'img',
  props: {
    src: '/path/to/image.jpg'
    // Missing alt attribute for accessibility
  }
};

console.log('\n2. Image validation with accessibility:');
try {
  const result = imgSchema.parse(validImage);
  console.log('✅ Valid image:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  imgSchema.parse(invalidImage);
} catch (error) {
  console.log('❌ Invalid image error:', error.message);
}

// 3. Button with required props
const buttonSchema = button().requireProps('onClick');

const validButton = {
  type: 'button',
  props: {
    type: 'submit',
    onClick: () => console.log('clicked'),
    className: 'btn btn-primary'
  }
};

const invalidButton = {
  type: 'button',
  props: {
    type: 'submit'
    // Missing required onClick prop
  }
};

console.log('\n3. Button validation with required props:');
try {
  const result = buttonSchema.parse(validButton);
  console.log('✅ Valid button:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  buttonSchema.parse(invalidButton);
} catch (error) {
  console.log('❌ Invalid button error:', error.message);
}

// 4. Input element with type validation
const inputSchema = input();

const validInput = {
  type: 'input',
  props: {
    type: 'email',
    placeholder: 'Enter your email',
    required: true
  }
};

const invalidInput = {
  type: 'input',
  props: {
    // Missing required type attribute
    placeholder: 'Enter something'
  }
};

console.log('\n4. Input validation:');
try {
  const result = inputSchema.parse(validInput);
  console.log('✅ Valid input:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  inputSchema.parse(invalidInput);
} catch (error) {
  console.log('❌ Invalid input error:', error.message);
}

// 5. Link with semantic validation
const linkSchema = a().validateSemantic();

const validLink = {
  type: 'a',
  props: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer'
  }
};

const invalidLink = {
  type: 'a',
  props: {
    href: 123 // href should be a string
  }
};

console.log('\n5. Link validation with semantic checks:');
try {
  const result = linkSchema.parse(validLink);
  console.log('✅ Valid link:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  linkSchema.parse(invalidLink);
} catch (error) {
  console.log('❌ Invalid link error:', error.message);
}

// 6. Form with children validation
const formSchema = form().allowChildren(
  object({
    label: label(),
    input: input()
  })
);

const validForm = {
  type: 'form',
  props: {
    method: 'POST',
    action: '/submit'
  },
  children: {
    label: {
      type: 'label',
      props: { htmlFor: 'email' }
    },
    input: {
      type: 'input',
      props: { type: 'email', id: 'email' }
    }
  }
};

console.log('\n6. Form validation with children:');
try {
  const result = formSchema.parse(validForm);
  console.log('✅ Valid form:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 7. Custom HTML element
const customElementSchema = htmlElement('my-custom-component', {
  requiredProps: ['data-id', 'config'],
  validateAccessibility: true
});

const validCustomElement = {
  type: 'my-custom-component',
  props: {
    'data-id': 'widget-123',
    config: { theme: 'dark' },
    'aria-label': 'Custom widget'
  }
};

console.log('\n7. Custom element validation:');
try {
  const result = customElementSchema.parse(validCustomElement);
  console.log('✅ Valid custom element:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n=== HTML Element Validation Examples Complete ===');