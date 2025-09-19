// React Component Validation Examples
import { reactComponent, string, number, boolean, object, array } from 'fast-schema';

console.log('=== React Component Validation Examples ===\n');

// 1. Button Component Schema
const ButtonComponent = reactComponent({
  componentName: 'Button',
  propsSchema: {
    variant: string(),
    size: string(),
    disabled: boolean().optional(),
    onClick: object({}).optional(), // Function placeholder
    children: string()
  },
  requiredProps: ['variant', 'children'],
  childrenAllowed: true
});

const validButton = {
  type: 'Button',
  props: {
    variant: 'primary',
    size: 'large',
    disabled: false,
    onClick: () => {},
    children: 'Click me'
  }
};

const invalidButton = {
  type: 'Button',
  props: {
    variant: 'primary'
    // Missing required 'children' prop
  }
};

console.log('1. Button Component validation:');
try {
  const result = ButtonComponent.parse(validButton);
  console.log('✅ Valid Button component:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  ButtonComponent.parse(invalidButton);
} catch (error) {
  console.log('❌ Invalid Button error:', error.message);
}

// 2. Input Component with Complex Props
const InputComponent = reactComponent({
  componentName: 'Input',
  propsSchema: {
    type: string(),
    placeholder: string().optional(),
    value: string(),
    onChange: object({}).optional(), // Function placeholder
    validation: object({
      required: boolean(),
      minLength: number().optional(),
      maxLength: number().optional(),
      pattern: string().optional()
    }).optional(),
    error: string().optional()
  },
  requiredProps: ['type', 'value'],
  childrenAllowed: false
});

const validInput = {
  type: 'Input',
  props: {
    type: 'email',
    placeholder: 'Enter your email',
    value: 'user@example.com',
    onChange: () => {},
    validation: {
      required: true,
      pattern: '^[^@]+@[^@]+\\.[^@]+$'
    }
  }
};

const invalidInput = {
  type: 'Input',
  props: {
    type: 'email',
    value: 'user@example.com',
    validation: {
      required: 'yes' // Should be boolean
    }
  },
  children: 'Invalid children' // Component doesn't allow children
};

console.log('\n2. Input Component validation:');
try {
  const result = InputComponent.parse(validInput);
  console.log('✅ Valid Input component:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  InputComponent.parse(invalidInput);
} catch (error) {
  console.log('❌ Invalid Input error:', error.message);
}

// 3. Card Component with Nested Children Schema
const CardComponent = reactComponent({
  componentName: 'Card',
  propsSchema: {
    title: string(),
    subtitle: string().optional(),
    elevated: boolean().optional(),
    padding: string().optional()
  },
  requiredProps: ['title'],
  childrenAllowed: true,
  childrenSchema: object({
    header: object({}).optional(),
    body: object({}),
    footer: object({}).optional()
  })
});

const validCard = {
  type: 'Card',
  props: {
    title: 'Product Card',
    subtitle: 'Featured item',
    elevated: true,
    padding: 'large'
  },
  children: {
    header: {
      type: 'div',
      props: { className: 'card-header' }
    },
    body: {
      type: 'div',
      props: { className: 'card-body' }
    },
    footer: {
      type: 'div',
      props: { className: 'card-footer' }
    }
  }
};

const invalidCard = {
  type: 'Card',
  props: {
    title: 'Product Card',
    elevated: 'true' // Should be boolean
  },
  children: {
    // Missing required 'body' section
    header: {
      type: 'div',
      props: { className: 'card-header' }
    }
  }
};

console.log('\n3. Card Component with children validation:');
try {
  const result = CardComponent.parse(validCard);
  console.log('✅ Valid Card component:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  CardComponent.parse(invalidCard);
} catch (error) {
  console.log('❌ Invalid Card error:', error.message);
}

// 4. List Component with Array Props
const ListComponent = reactComponent({
  componentName: 'List',
  propsSchema: {
    items: array(object({
      id: string(),
      label: string(),
      value: string()
    })),
    orientation: string().optional(),
    selectable: boolean().optional(),
    onSelect: object({}).optional()
  },
  requiredProps: ['items'],
  childrenAllowed: false
});

const validList = {
  type: 'List',
  props: {
    items: [
      { id: '1', label: 'First Item', value: 'item1' },
      { id: '2', label: 'Second Item', value: 'item2' },
      { id: '3', label: 'Third Item', value: 'item3' }
    ],
    orientation: 'vertical',
    selectable: true,
    onSelect: () => {}
  }
};

const invalidList = {
  type: 'List',
  props: {
    items: [
      { id: '1', label: 'First Item' }, // Missing 'value' property
      { id: '2', label: 'Second Item', value: 'item2' }
    ],
    orientation: 123 // Should be string
  }
};

console.log('\n4. List Component with array props:');
try {
  const result = ListComponent.parse(validList);
  console.log('✅ Valid List component:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

try {
  ListComponent.parse(invalidList);
} catch (error) {
  console.log('❌ Invalid List error:', error.message);
}

// 5. Modal Component with Event Handlers
const ModalComponent = reactComponent({
  componentName: 'Modal',
  propsSchema: {
    isOpen: boolean(),
    title: string(),
    size: string().optional(),
    closable: boolean().optional(),
    onClose: object({}).optional(),
    onConfirm: object({}).optional(),
    onCancel: object({}).optional()
  },
  requiredProps: ['isOpen', 'title'],
  childrenAllowed: true
});

const validModal = {
  type: 'Modal',
  props: {
    isOpen: true,
    title: 'Confirm Action',
    size: 'medium',
    closable: true,
    onClose: () => {},
    onConfirm: () => {},
    onCancel: () => {}
  },
  children: {
    type: 'div',
    props: { className: 'modal-content' }
  }
};

console.log('\n5. Modal Component validation:');
try {
  const result = ModalComponent.parse(validModal);
  console.log('✅ Valid Modal component:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 6. Wrong Component Type
const wrongComponentType = {
  type: 'WrongComponent', // Should be 'Modal'
  props: {
    isOpen: true,
    title: 'Test'
  }
};

try {
  ModalComponent.parse(wrongComponentType);
} catch (error) {
  console.log('❌ Wrong component type error:', error.message);
}

console.log('\n=== React Component Validation Examples Complete ===');