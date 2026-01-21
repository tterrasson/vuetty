
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
// Note: We use dynamic import to ensure the mock is applied
const { default: Table } = await import('../../src/components/Table.js');

describe('Table Interaction', () => {
  beforeEach(() => {
    mockInputManager.registerComponent.mockClear();
    mockInputManager.unregisterComponent.mockClear();
    mockInputManager.setComponentDisabled.mockClear();
    mockInputManager.isFocused.mockClear();
    mockInputManager.focus.mockClear();
  });

  test('registers with input manager on setup', () => {
    const props = { headers: [], rows: [] };
    const context = { emit: () => {} };

    Table.setup(props, context);

    expect(mockInputManager.registerComponent).toHaveBeenCalled();
    // Check if ID starts with table-
    const [id, handler] = mockInputManager.registerComponent.mock.calls[0];
    expect(id).toStartWith('table-');
    expect(typeof handler).toBe('function');
  });

  test('handles keyboard navigation (Arrow Down)', () => {
    const props = {
        headers: ['Col'],
        rows: [['A'], ['B']],
        modelValue: 0,
        height: 5
    };

    let emittedValue = null;
    const context = {
        emit: (event, value) => {
            if (event === 'update:modelValue') emittedValue = value;
        }
    };

    Table.setup(props, context);

    const [id, handler] = mockInputManager.registerComponent.mock.calls[0];

    // Simulate Arrow Down
    // Note: handler expects parsed key object from keyParser
    handler({ key: 'down' });

    // We can't easily check internal state (highlightedIndex) because it's in closure scope
    // BUT we can check if selecting emits the NEW index

    handler({ key: 'enter' });

    // Should have moved from 0 to 1, then selected
    expect(emittedValue).toBe(1);
  });

  test('handles keyboard navigation (Arrow Up)', () => {
     // Start at index 1
     const props = {
        headers: ['Col'],
        rows: [['A'], ['B']],
        modelValue: 1,
        height: 5
    };

    let emittedValue = null;
    const context = {
        emit: (event, value) => {
            if (event === 'update:modelValue') emittedValue = value;
        }
    };

    Table.setup(props, context);
    const [id, handler] = mockInputManager.registerComponent.mock.calls[0];

    // Simulate Arrow Up
    handler({ key: 'up' });
    handler({ key: 'enter' });

    expect(emittedValue).toBe(0);
  });

  test('handles page down/up', () => {
      const rows = Array.from({ length: 20 }, (_, i) => [String(i)]);
      const height = 5;

      const props = {
        headers: ['Col'],
        rows,
        modelValue: 0,
        height
    };

    let emittedValue = null;
    const context = {
        emit: (event, value) => {
            if (event === 'update:modelValue') emittedValue = value;
        }
    };

    Table.setup(props, context);
    const [id, handler] = mockInputManager.registerComponent.mock.calls[0];

    // Page Down (moves by height = 5)
    handler({ key: 'pagedown' });
    handler({ key: 'enter' });

    // 0 + 5 = 5
    expect(emittedValue).toBe(5);
  });
});
