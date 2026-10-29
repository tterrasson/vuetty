/**
 * Tests for item/option normalization across components
 * (falsy values like 0/false must not degrade to '[object Object]')
 */

import { describe, expect, mock, test } from 'bun:test';
import { VUETTY_INPUT_MANAGER_KEY } from '../../src/core/vuettyKeys.js';

const realVue = await import('vue');

const mockInputManager = {
  registerComponent: mock(() => {}),
  unregisterComponent: mock(() => {}),
  setComponentDisabled: mock(() => {}),
  isFocused: mock(() => false),
  focus: mock(() => {})
};

const mockInject = mock((key, defaultValue) => {
  if (key === VUETTY_INPUT_MANAGER_KEY) return mockInputManager;
  return defaultValue ?? null;
});

mock.module('vue', () => ({
  ...realVue,
  inject: mockInject,
  onUnmounted: mock(() => {})
}));

const List = (await import('../../src/components/List.js')).default;
const Tabs = (await import('../../src/components/Tabs.js')).default;
const { renderSelectInput } = await import('../../src/components/SelectInput.js');

describe('Item normalization edge cases', () => {
  test('List normalizes item with value 0 to label "0"', () => {
    const render = List.setup({ items: [{ value: 0 }, { value: false }] });
    const vnode = render();

    expect(vnode.props.items.map(i => i.label)).toEqual(['0', 'false']);
    expect(vnode.props.items.map(i => i.value)).toEqual([0, false]);
  });

  test('List keeps index fallback for items without value', () => {
    const render = List.setup({ items: [{ label: 'First' }, 'plain'] });
    const vnode = render();

    expect(vnode.props.items[0].value).toBe(0);
    expect(vnode.props.items[1].label).toBe('plain');
    expect(vnode.props.items[1].value).toBe('plain');
  });

  test('Tabs normalizes tab with value 0 to label "0"', () => {
    const render = Tabs.setup({ tabs: [{ value: 0 }, { value: false }] }, { slots: {} });
    const vnode = render();

    expect(vnode.props.tabs.map(t => t.label)).toEqual(['0', 'false']);
    expect(vnode.props.tabs.map(t => t.value)).toEqual([0, false]);
  });

  test('SelectInput renders option with falsy value correctly', () => {
    const result = renderSelectInput({
      options: [{ value: 0 }, { value: false }],
      modelValue: null,
      highlightedIndex: 0,
      height: 5
    });

    expect(result).toContain('0');
    expect(result).toContain('false');
    expect(result).not.toContain('[object Object]');
  });
});
