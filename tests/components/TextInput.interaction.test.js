
import { test, expect, describe, mock, beforeEach } from 'bun:test';
import { VUETTY_INPUT_MANAGER_KEY } from '../../src/core/vuettyKeys.js';

// Define mocks
const mockInputManager = {
  registerComponent: mock(),
  unregisterComponent: mock(),
  setComponentDisabled: mock(),
  isFocused: mock(() => false),
  focus: mock(),
};

const mockInject = mock((key) => {
  if (key === VUETTY_INPUT_MANAGER_KEY) return mockInputManager;
  return null;
});

// Mock Vue module
const realVue = await import('vue');

mock.module('vue', () => {
  return {
    ...realVue,
    inject: mockInject
  };
});

// Import component AFTER mocking
const { default: TextInput } = await import('../../src/components/TextInput.js');

describe('TextInput Interaction', () => {
  beforeEach(() => {
    mockInputManager.registerComponent.mockClear();
    mockInputManager.unregisterComponent.mockClear();
    mockInputManager.setComponentDisabled.mockClear();
    mockInputManager.isFocused.mockClear();
    mockInputManager.focus.mockClear();
  });

  test('registers with input manager on setup', () => {
    const props = { modelValue: '' };
    const context = { emit: () => {} };

    TextInput.setup(props, context);

    expect(mockInputManager.registerComponent).toHaveBeenCalled();
    const [id, handler] = mockInputManager.registerComponent.mock.calls[0];
    expect(id).toStartWith('textinput-');
    expect(typeof handler).toBe('function');
  });

  test('handles typing (updates modelValue)', async () => {
    const props = { modelValue: '' };
    let lastUpdate = '';
    const context = {
        emit: (event, val) => {
            if (event === 'update:modelValue') lastUpdate = val;
        }
    };

    TextInput.setup(props, context);
    const [id, handler] = mockInputManager.registerComponent.mock.calls[0];

    // Type 'A'
    handler({ key: 'char', char: 'A' });

    expect(lastUpdate).toBe('A');

    // Type 'B'
    handler({ key: 'char', char: 'B' });
    expect(lastUpdate).toBe('AB');
  });

  test('handles backspace', () => {
    const props = { modelValue: 'Hi' };
    let lastUpdate = 'Hi';
    const context = {
        emit: (event, val) => {
            if (event === 'update:modelValue') lastUpdate = val;
        }
    };

    TextInput.setup(props, context);
    const [id, handler] = mockInputManager.registerComponent.mock.calls[0];

    handler({ key: 'backspace' });
    expect(lastUpdate).toBe('H');
  });

  test('handles cursor navigation (Left/Right)', () => {
    const props = { modelValue: 'ABC' }; // Cursor starts at end (3)
    let lastUpdate = '';
    const context = {
        emit: (e, v) => {
            if(e === 'update:modelValue') lastUpdate = v;
        }
    };

    TextInput.setup(props, context);
    const [id, handler] = mockInputManager.registerComponent.mock.calls[0];

    // Cursor at 3. Left -> 2
    handler({ key: 'left' });

    // Reset lastUpdate to ensure we capture the NEXT update
    lastUpdate = '';

    // Type 'X' at 2 -> 'ABXC'
    handler({ key: 'char', char: 'X' });
    expect(lastUpdate).toBe('ABXC');
  });

  test('handles Enter key (single line)', () => {
    const props = { modelValue: 'Test', multiline: false };
    let changeEvent = null;
    const context = {
        emit: (event, val) => {
            if (event === 'change') changeEvent = val;
        }
    };

    TextInput.setup(props, context);
    const [id, handler] = mockInputManager.registerComponent.mock.calls[0];

    handler({ key: 'enter' });
    expect(changeEvent).toBe('Test');
  });

  test('handles Shift+Enter key (multiline) - adds new line', () => {
    const props = { modelValue: 'Line1', multiline: true };
    let lastUpdate = '';
    const context = {
        emit: (event, val) => {
            if (event === 'update:modelValue') lastUpdate = val;
        }
    };

    TextInput.setup(props, context);
    const [_id, handler] = mockInputManager.registerComponent.mock.calls[0];

    handler({ key: 'enter', shift: true });
    expect(lastUpdate).toBe('Line1\n');
  });

  test('handles Enter key (multiline) - submits', () => {
    const props = { modelValue: 'Line1', multiline: true };
    let lastChange = '';
    const context = {
        emit: (event, val) => {
            if (event === 'change') lastChange = val;
        }
    };

    TextInput.setup(props, context);
    const [_id, handler] = mockInputManager.registerComponent.mock.calls[0];

    handler({ key: 'enter', shift: false });
    expect(lastChange).toBe('Line1');
  });

  test('respects maxLength', () => {
      const props = { modelValue: 'AB', maxLength: 2 };
      let lastUpdate = null;
      const context = {
          emit: (event, val) => {
              if (event === 'update:modelValue') lastUpdate = val;
          }
      };

      TextInput.setup(props, context);
      const [id, handler] = mockInputManager.registerComponent.mock.calls[0];

      handler({ key: 'char', char: 'C' });
      // Should NOT update
      expect(lastUpdate).toBe(null);
  });

  test('long multiline paste → inserts placeholder, emits expanded content', () => {
    const props = { modelValue: '' };
    let lastUpdate = '';
    const context = {
      emit: (event, val) => {
        if (event === 'update:modelValue') lastUpdate = val;
      }
    };

    TextInput.setup(props, context);
    const [_id, _handler, options] = mockInputManager.registerComponent.mock.calls[0];
    const { pasteHandler } = options;

    const lines = Array.from({ length: 10 }, (_, i) => `line ${i + 1}`).join('\n');
    pasteHandler(lines);

    // emitted value should be the full content, not the placeholder
    expect(lastUpdate).toBe(lines);
  });

  test('short paste (below threshold, no newline) → inserted inline', () => {
    const props = { modelValue: 'hello ' };
    let lastUpdate = '';
    const context = {
      emit: (event, val) => {
        if (event === 'update:modelValue') lastUpdate = val;
      }
    };

    TextInput.setup(props, context);
    const [_id, _handler, options] = mockInputManager.registerComponent.mock.calls[0];
    const { pasteHandler } = options;

    pasteHandler('world');
    expect(lastUpdate).toBe('hello world');
  });

  test('multiple pastes get unique IDs and both expand correctly', () => {
    const props = { modelValue: '' };
    const updates = [];
    const context = {
      emit: (event, val) => {
        if (event === 'update:modelValue') updates.push(val);
      }
    };

    TextInput.setup(props, context);
    const [_id, _handler, options] = mockInputManager.registerComponent.mock.calls[0];
    const { pasteHandler } = options;

    const content1 = Array.from({ length: 5 }, (_, i) => `a${i}`).join('\n');
    const content2 = Array.from({ length: 5 }, (_, i) => `b${i}`).join('\n');

    pasteHandler(content1);
    pasteHandler(content2);

    const last = updates[updates.length - 1];
    expect(last).toBe(content1 + content2);
  });

  test('backspace once after paste placeholder → removes entire placeholder', () => {
    const props = { modelValue: '' };
    let lastUpdate = '';
    const context = {
      emit: (event, val) => {
        if (event === 'update:modelValue') lastUpdate = val;
      }
    };

    TextInput.setup(props, context);
    const [_id, handler, options] = mockInputManager.registerComponent.mock.calls[0];
    const { pasteHandler } = options;

    const lines = Array.from({ length: 5 }, (_, i) => `line ${i}`).join('\n');
    pasteHandler(lines);

    // one backspace should remove the whole placeholder
    handler({ key: 'backspace' });
    expect(lastUpdate).toBe('');
  });

  test('enter after paste emits expanded content via change event', () => {
    const props = { modelValue: '', multiline: false };
    let changeValue = null;
    const context = {
      emit: (event, val) => {
        if (event === 'change') changeValue = val;
      }
    };

    TextInput.setup(props, context);
    const [_id, handler, options] = mockInputManager.registerComponent.mock.calls[0];
    const { pasteHandler } = options;

    const lines = Array.from({ length: 5 }, (_, i) => `line ${i}`).join('\n');
    pasteHandler(lines);

    handler({ key: 'enter' });
    expect(changeValue).toBe(lines);
  });
});
