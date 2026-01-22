// src/components/SelectInput.js
import { h, ref, inject, onUnmounted, watch, computed } from 'vue';
import { VUETTY_INPUT_MANAGER_KEY, VUETTY_VIEWPORT_STATE_KEY, VUETTY_INSTANCE_KEY } from '@core/vuettyKeys.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
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
import chalk from 'chalk';
import { getTerminalWidth, applyStyles } from '@utils/renderUtils.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

let selectInputIdCounter = 0;

/**
 * SelectInput component - Interactive selection list
 */
export default {
  name: 'SelectInput',
  props: {
    // v-model
    modelValue: {
      type: [String, Number, Object],
      default: null
    },

    // Options
    options: {
      type: Array,
      default: () => []
    },

    // Display
    label: {
      type: String,
      default: ''
    },
    height: {
      type: Number,
      default: 10
    },
    width: {
      type: Number,
      default: undefined
    },

    // State
    disabled: {
      type: Boolean,
      default: false
    },

    // Styling
    color: String,
    bg: String,
    focusColor: {
      type: String,
      default: 'cyan'
    },
    selectedColor: {
      type: String,
      default: 'green'
    },
    highlightColor: {
      type: String,
      default: 'yellow'
    },
    bold: Boolean,
    dim: Boolean,
    hint: {
      type: [String, Boolean],
      default: 'default'
    },
    // Include common layout props (padding, margin, dimensions)
    ...boxProps
  },

  emits: ['update:modelValue', 'change', 'focus', 'blur'],

  setup(props, { emit }) {
    const inputManager = inject(VUETTY_INPUT_MANAGER_KEY);
    const vuettyInstance = inject(VUETTY_INSTANCE_KEY, null);

    // Inject viewport state to trigger re-renders on resize
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);

    // Inject width context from parent (Box, etc.)
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);

    // Generate unique component ID
    const componentId = `selectinput-${++selectInputIdCounter}`;

    // Internal state
    const highlightedIndex = ref(0);
    const scrollOffset = ref(0);

    // Computed: Find selected index based on modelValue
    const selectedIndex = computed(() => {
      if (props.modelValue === null || props.modelValue === undefined) {
        return -1;
      }

      return props.options.findIndex(opt => opt.value === props.modelValue);
    });

    // Computed: Check if this component is focused (this updates reactively)
    const isFocused = computed(() => {
      return inputManager && inputManager.isFocused(componentId);
    });

    // Watch focus state for events
    watch(isFocused, (newVal, oldVal) => {
      if (newVal && !oldVal) {
        emit('focus');
      } else if (!newVal && oldVal) {
        emit('blur');
      }
    });

    // Watch options changes to reset highlight if needed
    watch(() => props.options, () => {
      if (highlightedIndex.value >= props.options.length) {
        highlightedIndex.value = Math.max(0, props.options.length - 1);
        updateScrollOffset();
      }
    });

    /**
     * Update scroll offset to keep highlighted option visible
     */
    function updateScrollOffset() {
      if (highlightedIndex.value < scrollOffset.value) {
        scrollOffset.value = highlightedIndex.value;
      } else if (highlightedIndex.value >= scrollOffset.value + props.height) {
        scrollOffset.value = highlightedIndex.value - props.height + 1;
      }
    }

    /**
     * Move highlight up
     */
    function moveUp() {
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--;

        // Skip disabled options
        while (highlightedIndex.value > 0 && props.options[highlightedIndex.value]?.disabled) {
          highlightedIndex.value--;
        }

        updateScrollOffset();
      }
    }

    /**
     * Move highlight down
     */
    function moveDown() {
      if (highlightedIndex.value < props.options.length - 1) {
        highlightedIndex.value++;

        // Skip disabled options
        while (highlightedIndex.value < props.options.length - 1 && props.options[highlightedIndex.value]?.disabled) {
          highlightedIndex.value++;
        }

        updateScrollOffset();
      }
    }

    /**
     * Select the highlighted option
     */
    function selectHighlighted() {
      const option = props.options[highlightedIndex.value];

      if (!option || option.disabled) {
        return;
      }

      emit('update:modelValue', option.value);
      emit('change', option.value);
    }

    /**
     * Jump to first option
     */
    function jumpToFirst() {
      highlightedIndex.value = 0;

      // Skip disabled options at the start
      while (highlightedIndex.value < props.options.length - 1 && props.options[highlightedIndex.value]?.disabled) {
        highlightedIndex.value++;
      }

      updateScrollOffset();
    }

    /**
     * Jump to last option
     */
    function jumpToLast() {
      highlightedIndex.value = props.options.length - 1;

      // Skip disabled options at the end
      while (highlightedIndex.value > 0 && props.options[highlightedIndex.value]?.disabled) {
        highlightedIndex.value--;
      }

      updateScrollOffset();
    }

    /**
     * Jump to option by typing first letter
     */
    function jumpByChar(char) {
      const lowerChar = char.toLowerCase();
      const currentIndex = highlightedIndex.value;

      // Search from next option forward
      for (let i = currentIndex + 1; i < props.options.length; i++) {
        const option = props.options[i];
        const label = (option.label || String(option.value)).toLowerCase();

        if (label.startsWith(lowerChar) && !option.disabled) {
          highlightedIndex.value = i;
          updateScrollOffset();
          return;
        }
      }

      // Wrap around: search from start to current
      for (let i = 0; i <= currentIndex; i++) {
        const option = props.options[i];
        const label = (option.label || String(option.value)).toLowerCase();

        if (label.startsWith(lowerChar) && !option.disabled) {
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
      if (props.disabled) return;

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
        for (let i = 0; i < props.height; i++) {
          moveUp();
        }
        return;
      }

      if (parsedKey.key === KEY_PAGEDOWN) {
        // Move down by height
        for (let i = 0; i < props.height; i++) {
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
      if (props.disabled) return;
      inputManager.focus(componentId);
    }

    // Register component immediately (before first render)
    if (inputManager) {
      inputManager.registerComponent(componentId, handleKey, {
        disabled: props.disabled
      });
    }

    // Register click handler
    if (vuettyInstance) {
      vuettyInstance.registerClickHandler(componentId, handleClick);
    }

    // Initialize: If there's a modelValue, highlight it
    if (selectedIndex.value >= 0) {
      highlightedIndex.value = selectedIndex.value;
      updateScrollOffset();
    } else {
      // Otherwise, highlight first non-disabled option
      jumpToFirst();
    }

    // Lifecycle
    onUnmounted(() => {
      if (inputManager) {
        inputManager.unregisterComponent(componentId);
      }
      if (vuettyInstance) {
        vuettyInstance.unregisterClickHandler(componentId);
      }
    });

    // Watch disabled prop
    watch(() => props.disabled, (newVal) => {
      if (inputManager) {
        inputManager.setComponentDisabled(componentId, newVal);
      }
    });

    // Render
    return () => {
      // Resolve width context (call function if it's a function for reactive width)
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      // Pass injected width and viewport version through props
      // The viewport version creates a reactive dependency - when it changes, Vue re-renders
      return h('selectinput', {
        ...props,
        _componentId: componentId,
        _clickable: true,
        highlightedIndex: highlightedIndex.value,
        selectedIndex: selectedIndex.value,
        scrollOffset: scrollOffset.value,
        isFocused: isFocused.value,
        _injectedWidth: injectedWidth,
        _viewportVersion: viewportState ? viewportState.version : 0
      });
    };
  }
};

/**
 * Render function
 */
export function renderSelectInput(props) {
  const {
    options = [],
    modelValue = null,
    label = '',
    height = 10,
    highlightedIndex = 0,
    selectedIndex = -1,
    scrollOffset = 0,
    isFocused = false,
    focusColor = 'cyan',
    selectedColor = 'green',
    highlightColor = 'yellow',
    disabled = false,
    hint = 'default'
  } = props;

  let output = '';

  // Render label
  if (label) {
    const labelText = isFocused && !disabled ? `${chalk.bold(label)}` : label;
    output += applyStyles(labelText, props) + '\n';
  }

  // If no options
  if (options.length === 0) {
    const width = 20;
    const borderColor = isFocused && !disabled ? focusColor : (props.color || 'white');
    const borderStyle = isFocused && !disabled
      ? (chalk[borderColor] || chalk).bold
      : chalk[borderColor] || chalk;

    output += borderStyle('┌' + '─'.repeat(width + 2) + '┐') + '\n';
    output += borderStyle('│') + ' No options'.padEnd(width + 2, ' ') + borderStyle('│') + '\n';
    output += borderStyle('└' + '─'.repeat(width + 2) + '┘') + '\n';
    return output;
  }

  // Calculate max width for options
  const maxWidth = Math.max(
    20,
    ...options.map(opt => getTerminalWidth(opt.label || String(opt.value)))
  );

  // Determine inner width (inside borders)
  // If props.width is provided, it's the inner width (from render.js logic)
  // Otherwise calculate from content
  const innerWidth = props.width ? props.width : (maxWidth + 4);

  // Variable used for padding text content (subtract 2 for indicator "● " or "▸ ")
  const contentWidth = innerWidth - 2;

  // Border style (bold when focused)
  const borderColor = isFocused && !disabled ? focusColor : (props.color || 'white');
  const borderStyle = isFocused && !disabled
    ? (chalk[borderColor] || chalk).bold
    : chalk[borderColor] || chalk;

  // Top border
  output += borderStyle('┌' + '─'.repeat(innerWidth) + '┐') + '\n';

  // Render visible options
  for (let i = 0; i < Math.min(height, options.length); i++) {
    const globalIndex = scrollOffset + i;
    const option = options[globalIndex];

    if (option) {
      const isHighlighted = isFocused && globalIndex === highlightedIndex;
      const isSelected = globalIndex === selectedIndex || option.value === modelValue;
      const optionLabel = option.label || String(option.value);

      // Build indicator
      let indicator = '  ';
      if (isSelected) {
        indicator = chalk[selectedColor].bold('● ');
      } else if (isHighlighted) {
        indicator = chalk[highlightColor].bold('▸ ');
      }

      // Build option text - pad to width
      let optionText = optionLabel.padEnd(contentWidth, ' ');

      // Truncate if too long
      if (getTerminalWidth(optionLabel) > contentWidth) {
        optionText = optionLabel.substring(0, contentWidth);
      }

      // Apply styling
      if (isHighlighted && isFocused && !disabled) {
        optionText = chalk[highlightColor].bold.inverse(optionText);
      } else if (isSelected) {
        optionText = chalk[selectedColor].bold(optionText);
      } else if (option.disabled) {
        optionText = chalk.dim(optionText);
      }

      output += borderStyle('│') + indicator + optionText + borderStyle('│') + '\n';
    } else {
      // Empty row
      output += borderStyle('│') + ' '.repeat(innerWidth) + borderStyle('│') + '\n';
    }
  }

  // Bottom border
  output += borderStyle('└' + '─'.repeat(innerWidth) + '┘');

  // Helper text
  if (isFocused && !disabled && hint !== false) {
    let hintText = '';

    if (hint === 'default') {
      hintText = '↑↓ Navigate • Enter to select • Tab to next field';
    } else if (hint && hint !== '') {
      hintText = hint;
    }

    if (hintText) {
      output += '\n' + chalk.dim(hintText);
    }
  }

  // Scroll indicator
  if (options.length > height) {
    const scrollPercent = Math.round((scrollOffset / Math.max(1, options.length - height)) * 100);
    const start = scrollOffset + 1;
    const end = Math.min(scrollOffset + height, options.length);
    const total = options.length;
    output += '\n' + chalk.dim(`[${scrollPercent}% - showing ${start}-${end} of ${total}]`);
  }

  return output;
}

/**
 * Render handler for selectinput
 */
class SelectInputRenderHandler extends RenderHandler {
  render(ctx) {
    const { node } = ctx;
    const width = ctx.getEffectiveWidth();

    if (width !== null) {
      node.props.width = width;
    }

    const output = renderSelectInput(ctx.props);

    if (width !== null) {
      delete node.props.width;
    }

    return output;
  }
}

renderHandlerRegistry.register('selectinput', new SelectInputRenderHandler());
