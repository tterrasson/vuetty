import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { VUETTY_INPUT_MANAGER_KEY, VUETTY_INSTANCE_KEY } from '../../src/core/vuettyKeys.js';

const realVue = await import('vue');
const { ref, computed, nextTick } = realVue;

const focusedId = ref(null);
const unmountCallbacks = [];

const mockInputManager = {
  registerComponent: mock(() => {}),
  unregisterComponent: mock(() => {}),
  setComponentDisabled: mock(() => {}),
  isFocused: mock((id) => focusedId.value === id),
  focus: mock(() => {})
};

const mockVuettyInstance = {
  registerClickHandler: mock(() => {}),
  unregisterClickHandler: mock(() => {})
};

const mockInject = mock((key, defaultValue) => {
  if (key === VUETTY_INPUT_MANAGER_KEY) return mockInputManager;
  if (key === VUETTY_INSTANCE_KEY) return mockVuettyInstance;
  return defaultValue ?? null;
});

mock.module('vue', () => ({
  ...realVue,
  inject: mockInject,
  onUnmounted: (cb) => {
    unmountCallbacks.push(cb);
  }
}));

const { useNavigableList } = await import('../../src/composables/useNavigableList.js');

function createHarness(options = {}) {
  const itemsRef = ref(options.items ?? [
    { value: 'a', label: 'Alpha', disabled: false },
    { value: 'b', label: 'Beta', disabled: false },
    { value: 'c', label: 'Gamma', disabled: false }
  ]);
  const heightRef = ref(options.height ?? 2);
  const modelValueRef = ref(options.modelValue ?? null);
  const disabledRef = ref(options.disabled ?? false);
  const multipleRef = ref(options.multiple ?? false);
  const componentId = options.componentId ?? 'navigable-list-1';
  const emitted = [];

  const emit = (event, payload) => {
    emitted.push({ event, payload });
    if (event === 'update:modelValue') {
      modelValueRef.value = payload;
    }
  };

  const api = useNavigableList({
    items: computed(() => itemsRef.value),
    height: computed(() => heightRef.value),
    modelValue: computed(() => modelValueRef.value),
    emit,
    componentId,
    disabled: computed(() => disabledRef.value),
    multiple: computed(() => multipleRef.value)
  });

  return {
    api,
    itemsRef,
    heightRef,
    modelValueRef,
    disabledRef,
    multipleRef,
    emitted,
    componentId
  };
}

describe('useNavigableList', () => {
  beforeEach(() => {
    focusedId.value = null;
    unmountCallbacks.length = 0;
    mockInputManager.registerComponent.mockClear();
    mockInputManager.unregisterComponent.mockClear();
    mockInputManager.setComponentDisabled.mockClear();
    mockInputManager.isFocused.mockClear();
    mockInputManager.focus.mockClear();
    mockVuettyInstance.registerClickHandler.mockClear();
    mockVuettyInstance.unregisterClickHandler.mockClear();
    mockInject.mockClear();
  });

  test('registers with input manager and click manager on init', () => {
    const { componentId } = createHarness();

    expect(mockInputManager.registerComponent).toHaveBeenCalledWith(
      componentId,
      expect.any(Function),
      { disabled: false }
    );
    expect(mockVuettyInstance.registerClickHandler).toHaveBeenCalledWith(
      componentId,
      expect.any(Function)
    );
  });

  test('initializes highlight from modelValue and updates selection in single mode', () => {
    const { api, emitted } = createHarness({
      modelValue: 'b'
    });

    expect(api.highlightedIndex.value).toBe(1);
    api.selectHighlighted();

    expect(emitted.some(e => e.event === 'update:modelValue' && e.payload === 'b')).toBe(true);
    expect(emitted.some(e => e.event === 'change' && e.payload === 'b')).toBe(true);
  });

  test('skips disabled items when moving and keeps scroll offset clamped', () => {
    const { api } = createHarness({
      height: 2,
      items: [
        { value: 'a', label: 'Alpha', disabled: false },
        { value: 'b', label: 'Beta', disabled: true },
        { value: 'c', label: 'Charlie', disabled: false },
        { value: 'd', label: 'Delta', disabled: false },
        { value: 'e', label: 'Echo', disabled: true },
        { value: 'f', label: 'Foxtrot', disabled: false }
      ]
    });

    expect(api.highlightedIndex.value).toBe(0);

    api.moveDown();
    expect(api.highlightedIndex.value).toBe(2);
    expect(api.scrollOffset.value).toBe(1);

    api.moveDown();
    expect(api.highlightedIndex.value).toBe(3);
    expect(api.scrollOffset.value).toBe(2);

    api.moveDown();
    expect(api.highlightedIndex.value).toBe(5);
    expect(api.scrollOffset.value).toBe(4);

    api.moveUp();
    expect(api.highlightedIndex.value).toBe(3);
  });

  test('supports multi-selection toggle and selectedIndices', () => {
    const { api, modelValueRef } = createHarness({
      multiple: true,
      modelValue: ['a']
    });

    expect(api.selectedIndices.value).toEqual([0]);

    api.highlightedIndex.value = 1;
    api.selectHighlighted();
    expect(modelValueRef.value).toEqual(['a', 'b']);
    expect(api.selectedIndices.value).toEqual([0, 1]);

    api.highlightedIndex.value = 0;
    api.selectHighlighted();
    expect(modelValueRef.value).toEqual(['b']);
    expect(api.selectedIndices.value).toEqual([1]);
  });

  test('handles key navigation commands and type-to-jump', () => {
    const { api } = createHarness({
      height: 2,
      items: [
        { value: 'a', label: 'Alpha', disabled: false },
        { value: 'b', label: 'Beta', disabled: false },
        { value: 'c', label: 'Charlie', disabled: false },
        { value: 'd', label: 'Delta', disabled: false }
      ]
    });

    api.handleKey({ key: 'end' });
    expect(api.highlightedIndex.value).toBe(3);

    api.handleKey({ key: 'home' });
    expect(api.highlightedIndex.value).toBe(0);

    api.handleKey({ key: 'pagedown' });
    expect(api.highlightedIndex.value).toBe(2);

    api.handleKey({ key: 'pageup' });
    expect(api.highlightedIndex.value).toBe(0);

    api.handleKey({ key: 'char', char: 'd' });
    expect(api.highlightedIndex.value).toBe(3);
  });

  test('updates highlight when modelValue/items change and updates disabled state in input manager', async () => {
    const { api, itemsRef, modelValueRef, disabledRef, componentId } = createHarness({
      modelValue: 'a',
      items: [
        { value: 'a', label: 'Alpha', disabled: false },
        { value: 'b', label: 'Beta', disabled: false },
        { value: 'c', label: 'Charlie', disabled: false }
      ]
    });

    modelValueRef.value = 'c';
    await nextTick();
    expect(api.highlightedIndex.value).toBe(2);

    itemsRef.value = [{ value: 'only', label: 'Only', disabled: false }];
    await nextTick();
    expect(api.highlightedIndex.value).toBe(0);
    expect(api.scrollOffset.value).toBe(0);

    disabledRef.value = true;
    await nextTick();
    expect(mockInputManager.setComponentDisabled).toHaveBeenCalledWith(componentId, true);
  });

  test('emits focus/blur based on input manager focus state and ignores events when disabled', async () => {
    const { api, emitted, disabledRef, componentId } = createHarness();

    focusedId.value = componentId;
    await nextTick();
    expect(emitted.some(e => e.event === 'focus')).toBe(true);

    focusedId.value = null;
    await nextTick();
    expect(emitted.some(e => e.event === 'blur')).toBe(true);

    disabledRef.value = true;
    await nextTick();

    api.handleClick({ type: 'mouse' });
    expect(mockInputManager.focus).not.toHaveBeenCalled();

    const prevIndex = api.highlightedIndex.value;
    api.handleKey({ key: 'down' });
    expect(api.highlightedIndex.value).toBe(prevIndex);
  });

  test('unregisters handlers on unmount callback', () => {
    const { componentId } = createHarness();
    expect(unmountCallbacks).toHaveLength(1);

    unmountCallbacks[0]();

    expect(mockInputManager.unregisterComponent).toHaveBeenCalledWith(componentId);
    expect(mockVuettyInstance.unregisterClickHandler).toHaveBeenCalledWith(componentId);
  });
});
