// Accessibility Validation Examples
import { htmlElement, img, button, input, a, form, label, object, string } from 'fast-schema';

console.log('=== Accessibility Validation Examples ===\n');

// 1. Image Accessibility - Basic Level
const basicImageSchema = img().validateAccessibility('basic');

const imageWithAlt = {
  type: 'img',
  props: {
    src: '/hero-image.jpg',
    alt: 'Team members collaborating in a modern office space'
  }
};

const imageWithoutAlt = {
  type: 'img',
  props: {
    src: '/hero-image.jpg'
    // Missing alt attribute
  }
};

console.log('1. Image accessibility validation (basic level):');
try {
  const result = basicImageSchema.parse(imageWithAlt);
  console.log('✅ Image with alt text:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  basicImageSchema.parse(imageWithoutAlt);
} catch (error) {
  console.log('❌ Image without alt text error:', error.message);
}

// 2. Image Accessibility - Strict Level
const strictImageSchema = img().validateAccessibility('strict');

const decorativeImage = {
  type: 'img',
  props: {
    src: '/decoration.svg',
    alt: '', // Empty alt for decorative images is acceptable
    role: 'presentation'
  }
};

const informativeImage = {
  type: 'img',
  props: {
    src: '/chart.png',
    alt: 'Sales increased by 25% from Q1 to Q2 2024',
    'aria-describedby': 'chart-description'
  }
};

console.log('\n2. Image accessibility validation (strict level):');
try {
  const result1 = strictImageSchema.parse(decorativeImage);
  console.log('✅ Decorative image:', result1);

  const result2 = strictImageSchema.parse(informativeImage);
  console.log('✅ Informative image:', result2);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 3. Button Accessibility
const accessibleButtonSchema = button()
  .validateAccessibility('enhanced')
  .requireProps('aria-label');

const accessibleButton = {
  type: 'button',
  props: {
    type: 'button',
    'aria-label': 'Close dialog',
    className: 'close-btn'
  }
};

const inaccessibleButton = {
  type: 'button',
  props: {
    type: 'button'
    // Missing aria-label for button without text content
  }
};

console.log('\n3. Button accessibility validation:');
try {
  const result = accessibleButtonSchema.parse(accessibleButton);
  console.log('✅ Accessible button:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  accessibleButtonSchema.parse(inaccessibleButton);
} catch (error) {
  console.log('❌ Inaccessible button error:', error.message);
}

// 4. Form Accessibility with Labels
const accessibleFormSchema = form().allowChildren(
  object({
    emailGroup: object({
      label: label().requireProps('htmlFor'),
      input: input()
    }),
    submitButton: button()
  })
);

const accessibleForm = {
  type: 'form',
  props: {
    method: 'POST',
    action: '/register',
    'aria-labelledby': 'form-title'
  },
  children: {
    emailGroup: {
      label: {
        type: 'label',
        props: {
          htmlFor: 'email-input'
        }
      },
      input: {
        type: 'input',
        props: {
          type: 'email',
          id: 'email-input',
          'aria-required': 'true',
          'aria-describedby': 'email-help'
        }
      }
    },
    submitButton: {
      type: 'button',
      props: {
        type: 'submit'
      }
    }
  }
};

console.log('\n4. Form accessibility with proper labeling:');
try {
  const result = accessibleFormSchema.parse(accessibleForm);
  console.log('✅ Accessible form:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 5. Link Accessibility
const accessibleLinkSchema = a().validateSemantic().validateAccessibility('enhanced');

const accessibleExternalLink = {
  type: 'a',
  props: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    'aria-label': 'Visit Example.com (opens in new tab)'
  }
};

const accessibleSkipLink = {
  type: 'a',
  props: {
    href: '#main-content',
    className: 'skip-link',
    'aria-label': 'Skip to main content'
  }
};

console.log('\n5. Link accessibility validation:');
try {
  const result1 = accessibleLinkSchema.parse(accessibleExternalLink);
  console.log('✅ Accessible external link:', result1);

  const result2 = accessibleLinkSchema.parse(accessibleSkipLink);
  console.log('✅ Accessible skip link:', result2);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 6. Custom Component with ARIA Support
const accessibleCustomComponent = htmlElement('data-table', {
  requiredProps: ['role', 'aria-label'],
  validateAccessibility: true,
  accessibilityLevel: 'strict'
});

const accessibleTable = {
  type: 'data-table',
  props: {
    role: 'grid',
    'aria-label': 'User data table',
    'aria-rowcount': '100',
    'aria-colcount': '5',
    tabIndex: '0'
  }
};

const inaccessibleTable = {
  type: 'data-table',
  props: {
    // Missing required ARIA attributes
    className: 'data-table'
  }
};

console.log('\n6. Custom component accessibility validation:');
try {
  const result = accessibleCustomComponent.parse(accessibleTable);
  console.log('✅ Accessible custom table:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  accessibleCustomComponent.parse(inaccessibleTable);
} catch (error) {
  console.log('❌ Inaccessible custom table error:', error.message);
}

// 7. Complex Interactive Component
const interactiveWidget = htmlElement('carousel', {
  requiredProps: ['role', 'aria-label', 'aria-live'],
  validateAccessibility: true,
  accessibilityLevel: 'strict'
});

const accessibleCarousel = {
  type: 'carousel',
  props: {
    role: 'region',
    'aria-label': 'Product showcase carousel',
    'aria-live': 'polite',
    'aria-atomic': 'false',
    'aria-controls': 'carousel-items',
    tabIndex: '0'
  }
};

console.log('\n7. Interactive widget accessibility:');
try {
  const result = interactiveWidget.parse(accessibleCarousel);
  console.log('✅ Accessible carousel widget:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n=== Accessibility Validation Examples Complete ===');