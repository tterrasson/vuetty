// src/composables/useNavigableList.js
import { ref, computed, watch, inject, onUnmounted } from 'vue';
import { VUETTY_INPUT_MANAGER_KEY, VUETTY_INSTANCE_KEY } from '@core/vuettyKeys.js';
import {
  KEY_UP,
  KEY_DOWN,
  KEY_ENTER,
  KEY_HOME,
  KEY_END,
  KEY_PAGEUP,
  KEY_PAGEDOWN,
  isPrintable
} from '@utils/keyParser.js';

/**
 * Composable for navigable list behavior
 * Provides keyboard navigation, selection, and focus management for list-based components
 *
 * @param {Object} options - Configuration options
 * @param {import('vue').ComputedRef<Array>} options.items - Computed ref to normalized items array [{value, label, disabled}]
 * @param {import('vue').ComputedRef<number>} options.height - Computed ref to viewport height
 * @param {import('vue').ComputedRef<*>} options.modelValue - Computed ref to selected value(s)
 * @param {Function} options.emit - Emit function for events
 * @param {string} options.componentId - Unique component identifier
 * @param {import('vue').ComputedRef<boolean>} options.disabled - Computed ref to disabled state
 * @param {boolean} [options.multiSelect=false] - Enable multi-select mode (for Checkbox)
 * @returns {Object} Navigation API and state
 */
export function useNavigableList(options) {
  const {
    items,
    height,
    modelValue,
    emit,
    componentId,
    disabled,
    multiple
  } = options;

  // Inject dependencies
  const inputManager = inject(VUETTY_INPUT_MANAGER_KEY);
  const vuettyInstance = inject(VUETTY_INSTANCE_KEY, null);

  // Internal state
  const highlightedIndex = ref(0);
  const scrollOffset = ref(0);

  // Computed: Find selected index based on modelValue
  const selectedIndex = computed(() => {
    const currentItems = items.value;
    const currentValue = modelValue.value;

    if (currentValue === null || currentValue === undefined) {
      return -1;
    }

    // For multi-select with array, return first selected
    if (multiple?.value && Array.isArray(currentValue) && currentValue.length > 0) {
      return currentItems.findIndex(item => currentValue.includes(item.value));
    }

    return currentItems.findIndex(item => item.value === currentValue);
  });

  // Computed: Find all selected indices for multi-select
  const selectedIndices = computed(() => {
    if (!multiple?.value) {
      return [];
    }

    const currentItems = items.value;
    const currentValue = modelValue.value;

    if (!Array.isArray(currentValue)) {
      return [];
    }

    return currentItems
      .map((item, index) => currentValue.includes(item.value) ? index : -1)
      .filter(index => index !== -1);
  });

  // Computed: Check if this component is focused (reactive)
  const isFocused = computed(() => {
    return inputManager && inputManager.isFocused(componentId);
  });

  /**
   * Update scroll offset to keep highlighted item visible
   */
  function updateScrollOffset() {
    const currentHeight = height.value;
    const currentIndex = highlightedIndex.value;
    const itemsCount = items.value.length;

    // Ensure scrollOffset doesn't exceed valid range
    // maxScrollOffset ensures we always show a full viewport of items (no empty rows at the end)
    const maxScrollOffset = Math.max(0, itemsCount - currentHeight);

    if (currentIndex < scrollOffset.value) {
      scrollOffset.value = currentIndex;
    } else if (currentIndex > scrollOffset.value + currentHeight - 1) {
      scrollOffset.value = Math.min(currentIndex - currentHeight + 1, maxScrollOffset);
    }

    // Clamp scrollOffset to valid range
    if (scrollOffset.value > maxScrollOffset) {
      scrollOffset.value = maxScrollOffset;
    }
    if (scrollOffset.value < 0) {
      scrollOffset.value = 0;
    }
  }

  /**
   * Move highlight up
   */
  function moveUp() {
    const currentItems = items.value;

    if (highlightedIndex.value > 0) {
      const startIndex = highlightedIndex.value;
      highlightedIndex.value--;

      // Skip disabled items
      while (highlightedIndex.value > 0 && currentItems[highlightedIndex.value]?.disabled) {
        highlightedIndex.value--;
      }

      // If we landed on a disabled item (first item is disabled), revert
      if (currentItems[highlightedIndex.value]?.disabled) {
        highlightedIndex.value = startIndex;
        return;
      }

      updateScrollOffset();
    }
  }

  /**
   * Move highlight down
   */
  function moveDown() {
    const currentItems = items.value;

    if (highlightedIndex.value < currentItems.length - 1) {
      const startIndex = highlightedIndex.value;
      highlightedIndex.value++;

      // Skip disabled items
      while (
        highlightedIndex.value < currentItems.length - 1 &&
        currentItems[highlightedIndex.value]?.disabled
      ) {
        highlightedIndex.value++;
      }

      // If we landed on a disabled item (last item is disabled), revert
      if (currentItems[highlightedIndex.value]?.disabled) {
        highlightedIndex.value = startIndex;
        return;
      }

      updateScrollOffset();
    }
  }

  /**
   * Select the highlighted item
   */
  function selectHighlighted() {
    const currentItems = items.value;
    const item = currentItems[highlightedIndex.value];

    if (!item || item.disabled) {
      return;
    }

    if (multiple?.value) {
      // Multi-select mode: toggle selection
      const currentValue = Array.isArray(modelValue.value) ? modelValue.value : [];
      const itemValue = item.value;

      let newValue;
      if (currentValue.includes(itemValue)) {
        // Remove from selection
        newValue = currentValue.filter(v => v !== itemValue);
      } else {
        // Add to selection
        newValue = [...currentValue, itemValue];
      }

      emit('update:modelValue', newValue);
      emit('change', newValue);
    } else {
      // Single select mode
      emit('update:modelValue', item.value);
      emit('change', item.value);
    }
  }

  /**
   * Jump to first item
   */
  function jumpToFirst() {
    const currentItems = items.value;
    highlightedIndex.value = 0;

    // Skip disabled items at the start
    while (
      highlightedIndex.value < currentItems.length - 1 &&
      currentItems[highlightedIndex.value]?.disabled
    ) {
      highlightedIndex.value++;
    }

    updateScrollOffset();
  }

  /**
   * Jump to last item
   */
  function jumpToLast() {
    const currentItems = items.value;
    highlightedIndex.value = currentItems.length - 1;

    // Skip disabled items at the end
    while (highlightedIndex.value > 0 && currentItems[highlightedIndex.value]?.disabled) {
      highlightedIndex.value--;
    }

    updateScrollOffset();
  }

  /**
   * Jump to item by typing first letter
   */
  function jumpByChar(char) {
    const currentItems = items.value;
    const lowerChar = char.toLowerCase();
    const currentIndex = highlightedIndex.value;

    // Search from next item forward
    for (let i = currentIndex + 1; i < currentItems.length; i++) {
      const item = currentItems[i];
      const label = item.label.toLowerCase();

      if (label.startsWith(lowerChar) && !item.disabled) {
        highlightedIndex.value = i;
        updateScrollOffset();
        return;
      }
    }

    // Wrap around: search from start to current
    for (let i = 0; i <= currentIndex; i++) {
      const item = currentItems[i];
      const label = item.label.toLowerCase();

      if (label.startsWith(lowerChar) && !item.disabled) {
        highlightedIndex.value = i;
        updateScrollOffset();
        return;
      }
    }
  }

  /**
   * Key handler
   */
  function handleKey(parsedKey) {
    if (disabled.value) return;

    // Navigation
    if (parsedKey.key === KEY_UP) {
      moveUp();
      return;
    }

    if (parsedKey.key === KEY_DOWN) {
      moveDown();
      return;
    }

    if (parsedKey.key === KEY_HOME) {
      jumpToFirst();
      return;
    }

    if (parsedKey.key === KEY_END) {
      jumpToLast();
      return;
    }

    if (parsedKey.key === KEY_PAGEUP) {
      // Move up by height
      for (let i = 0; i < height.value; i++) {
        moveUp();
      }
      return;
    }

    if (parsedKey.key === KEY_PAGEDOWN) {
      // Move down by height
      for (let i = 0; i < height.value; i++) {
        moveDown();
      }
      return;
    }

    // Selection
    if (parsedKey.key === KEY_ENTER || parsedKey.char === ' ') {
      selectHighlighted();
      return;
    }

    // Type to jump
    if (isPrintable(parsedKey) && parsedKey.char !== ' ') {
      jumpByChar(parsedKey.char);
      return;
    }
  }

  /**
   * Mouse click handler - focus on click
   */
  function handleClick(mouseEvent) {
    if (disabled.value) return;
    inputManager.focus(componentId);
  }

  /**
   * Register component with input manager
   */
  function registerComponent() {
    if (inputManager) {
      inputManager.registerComponent(componentId, handleKey, {
        disabled: disabled.value
      });
    }

    if (vuettyInstance) {
      vuettyInstance.registerClickHandler(componentId, handleClick);
    }
  }

  /**
   * Unregister component from input manager
   */
  function unregisterComponent() {
    if (inputManager) {
      inputManager.unregisterComponent(componentId);
    }
    if (vuettyInstance) {
      vuettyInstance.unregisterClickHandler(componentId);
    }
  }

  // Watch focus state for events
  watch(isFocused, (newVal, oldVal) => {
    if (newVal && !oldVal) {
      emit('focus');
    } else if (!newVal && oldVal) {
      emit('blur');
    }
  });

  // Watch items changes to reset highlight if needed
  watch(items, () => {
    const currentItems = items.value;
    if (highlightedIndex.value >= currentItems.length) {
      highlightedIndex.value = Math.max(0, currentItems.length - 1);
    }
    updateScrollOffset();
  });

  // Watch height changes to recalculate scroll offset
  watch(height, () => {
    updateScrollOffset();
  });

  // Watch modelValue changes to sync highlighted index
  watch(modelValue, () => {
    // For multi-select, don't auto-highlight on selection change
    if (multiple?.value) {
      return;
    }

    const newSelectedIndex = selectedIndex.value;
    if (newSelectedIndex >= 0 && newSelectedIndex !== highlightedIndex.value) {
      highlightedIndex.value = newSelectedIndex;
      updateScrollOffset();
    }
  });

  // Watch disabled prop
  watch(disabled, (newVal) => {
    if (inputManager) {
      inputManager.setComponentDisabled(componentId, newVal);
    }
  });

  // Initialize: If there's a modelValue, highlight it
  if (selectedIndex.value >= 0) {
    highlightedIndex.value = selectedIndex.value;
    updateScrollOffset();
  } else {
    // Otherwise, highlight first non-disabled item
    jumpToFirst();
  }

  // Register component immediately
  registerComponent();

  // Cleanup on unmount
  onUnmounted(() => {
    unregisterComponent();
  });

  return {
    // State
    highlightedIndex,
    scrollOffset,
    selectedIndex,
    selectedIndices,
    isFocused,

    // Navigation methods
    moveUp,
    moveDown,
    jumpToFirst,
    jumpToLast,
    jumpByChar,
    selectHighlighted,
    updateScrollOffset,

    // Handlers
    handleKey,
    handleClick,

    // Lifecycle
    registerComponent,
    unregisterComponent
  };
}
