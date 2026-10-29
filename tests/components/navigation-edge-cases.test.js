/**
 * Navigation edge-case tests for interactive components:
 * - jumpToLast on empty lists must not set highlightedIndex to -1
 * - scrollOffset must be clamped when rows/options shrink
 * - navigation must not land on disabled items (Checkbox/Radiobox)
 */

import { describe, expect, mock, test } from 'bun:test';
import { VUETTY_INPUT_MANAGER_KEY } from '../../src/core/vuettyKeys.js';

const realVue = await import('vue');
const { reactive, nextTick } = realVue;

const mockInputManager = {
  registerComponent: mock(() => {}),
  unregisterComponent: mock(() => {}),
  setComponentDisabled: mock(() => {}),
  isFocused: mock(() => false),
  focus: mock(() => {})
};

const mockVuettyInstance = {
  registerClickHandler: mock(() => {}),
  unregisterClickHandler: mock(() => {})
};

const mockInject = mock((key, defaultValue) => {
  if (key === VUETTY_INPUT_MANAGER_KEY) return mockInputManager;
  if (key === 'vuetty-instance') return mockVuettyInstance;
  return defaultValue ?? null;
});

mock.module('vue', () => ({
  ...realVue,
  inject: mockInject,
  onUnmounted: mock(() => {})
}));

const Table = (await import('../../src/components/Table.js')).default;
const Checkbox = (await import('../../src/components/Checkbox.js')).default;
const Radiobox = (await import('../../src/components/Radiobox.js')).default;
const Tabs = (await import('../../src/components/Tabs.js')).default;

const END = { key: 'end' };
const UP = { key: 'up' };
const DOWN = { key: 'down' };

function setupComponent(Component, props) {
  let handler = null;
  mockInputManager.registerComponent.mockImplementationOnce((id, fn) => {
    handler = fn;
  });
  const emit = mock(() => {});
  const render = Component.setup(props, { emit, slots: {} });
  return { render, getHandler: () => handler, emit };
}

describe('Empty list navigation (END key)', () => {
  test('Table: END on empty rows keeps highlightedIndex >= 0', () => {
    const { render, getHandler } = setupComponent(Table, {
      headers: [], rows: [], height: 5, modelValue: null
    });
    getHandler()(END);

    expect(render().props.highlightedIndex).toBe(0);
  });

  test('Checkbox: END on empty options keeps highlightedIndex >= 0', () => {
    const { render, getHandler } = setupComponent(Checkbox, {
      options: [], modelValue: [], height: 5
    });
    getHandler()(END);

    expect(render().props.highlightedIndex).toBe(0);
  });

  test('Radiobox: END on empty options keeps highlightedIndex >= 0', () => {
    const { render, getHandler } = setupComponent(Radiobox, {
      options: [], modelValue: null, height: 5
    });
    getHandler()(END);

    expect(render().props.highlightedIndex).toBe(0);
  });

  test('Tabs: END on empty tabs keeps highlightedIndex >= 0', () => {
    const { render, getHandler } = setupComponent(Tabs, {
      tabs: [], modelValue: null
    });
    getHandler()(END);

    expect(render().props.highlightedIndex).toBe(0);
  });
});

describe('Scroll offset clamping when data shrinks', () => {
  test('Table: clamps scrollOffset when rows shrink below viewport', async () => {
    const props = reactive({
      headers: ['C'],
      rows: Array.from({ length: 100 }, (_, i) => [`row${i}`]),
      height: 5,
      modelValue: null
    });
    const { render, getHandler } = setupComponent(Table, props);

    getHandler()(END);
    expect(render().props.scrollOffset).toBe(95);

    props.rows = Array.from({ length: 5 }, (_, i) => [`r${i}`]);
    await nextTick();

    expect(render().props.scrollOffset).toBe(0);
    expect(render().props.highlightedIndex).toBe(4);
  });

  test('Checkbox: clamps scrollOffset when options shrink', async () => {
    const props = reactive({
      options: Array.from({ length: 100 }, (_, i) => ({ label: `o${i}`, value: i })),
      modelValue: [],
      height: 5
    });
    const { render, getHandler } = setupComponent(Checkbox, props);

    getHandler()(END);
    expect(render().props.scrollOffset).toBe(95);

    props.options = [{ label: 'a', value: 'a' }];
    await nextTick();

    expect(render().props.scrollOffset).toBe(0);
  });

  test('Radiobox: clamps scrollOffset when options shrink', async () => {
    const props = reactive({
      options: Array.from({ length: 100 }, (_, i) => ({ label: `o${i}`, value: i })),
      modelValue: null,
      height: 5
    });
    const { render, getHandler } = setupComponent(Radiobox, props);

    getHandler()(END);
    expect(render().props.scrollOffset).toBe(95);

    props.options = [{ label: 'a', value: 'a' }];
    await nextTick();

    expect(render().props.scrollOffset).toBe(0);
  });
});

describe('Disabled item navigation (Checkbox/Radiobox)', () => {
  const disabledFirst = [
    { label: 'A', value: 'a', disabled: true },
    { label: 'B', value: 'b' }
  ];
  const disabledLast = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b', disabled: true }
  ];
  // Plain-object props bypass Vue prop defaults, so direction must be explicit
  const vertical = { direction: 'vertical' };

  test('Checkbox: UP from index 1 with disabled item at 0 reverts highlight', () => {
    const { render, getHandler } = setupComponent(Checkbox, {
      options: disabledFirst, modelValue: [], height: 10, ...vertical
    });
    expect(render().props.highlightedIndex).toBe(1);

    getHandler()(UP);

    expect(render().props.highlightedIndex).toBe(1);
  });

  test('Checkbox: DOWN with disabled last item reverts highlight', () => {
    const { render, getHandler } = setupComponent(Checkbox, {
      options: disabledLast, modelValue: [], height: 10, ...vertical
    });
    getHandler()(DOWN);

    expect(render().props.highlightedIndex).toBe(0);
  });

  test('Radiobox: UP from index 1 with disabled item at 0 reverts highlight', () => {
    const { render, getHandler } = setupComponent(Radiobox, {
      options: disabledFirst, modelValue: null, height: 10, ...vertical
    });
    expect(render().props.highlightedIndex).toBe(1);

    getHandler()(UP);

    expect(render().props.highlightedIndex).toBe(1);
  });

  test('Radiobox: DOWN with disabled last item reverts highlight', () => {
    const { render, getHandler } = setupComponent(Radiobox, {
      options: disabledLast, modelValue: null, height: 10, ...vertical
    });
    getHandler()(DOWN);

    expect(render().props.highlightedIndex).toBe(0);
  });
});
