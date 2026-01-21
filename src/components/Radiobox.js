// src/components/Radiobox.js
import { h, ref, inject, onUnmounted, watch, computed } from 'vue';
import { VUETTY_INPUT_MANAGER_KEY, VUETTY_INSTANCE_KEY } from '@core/vuettyKeys.js';
import {
  KEY_UP,
  KEY_DOWN,
  KEY_LEFT,
  KEY_RIGHT,
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

let radioboxIdCounter = 0;

/**
 * Radiobox component - Interactive single-select radio list
 */
export default {
  name: 'Radiobox',
  props: {
    // v-model - single selected value
    modelValue: {
      type: [String, Number, Object],
      default: null
    },

    // Options
    options: {
      type: Array,
      required: true,
      default: () => []
    },

    // Display
    label: {
      type: String,
      default: ''
    },
    direction: {
      type: String,
      default: 'vertical',
      validator: (val) => ['vertical', 'horizontal'].includes(val)
    },
    height: {
      type: Number,
      default: 10
    },
    width: {
      type: Number,
      default: null
    },
    itemSpacing: {
      type: Number,
      default: 2
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
    // Include common layout props (padding, margin, dimensions)
    ...boxProps
  },

  emits: ['update:modelValue', 'change', 'focus', 'blur'],

  setup(props, { emit }) {
    const inputManager = inject(VUETTY_INPUT_MANAGER_KEY);
    const vuettyInstance = inject(VUETTY_INSTANCE_KEY, null);

    // Generate unique component ID
    const componentId = `radiobox-${++radioboxIdCounter}`;

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

    // Computed: Check if this component is focused
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
    }, { deep: true });

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
     * Move highlight up (vertical) or left (horizontal)
     */
    function movePrevious() {
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
     * Move highlight down (vertical) or right (horizontal)
     */
    function moveNext() {
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

      const isVertical = props.direction === 'vertical';

      // Navigation
      if ((isVertical && parsedKey.key === KEY_UP) || (!isVertical && parsedKey.key === KEY_LEFT)) {
        movePrevious();
        return;
      }

      if ((isVertical && parsedKey.key === KEY_DOWN) || (!isVertical && parsedKey.key === KEY_RIGHT)) {
        moveNext();
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

      if (parsedKey.key === KEY_PAGEUP && isVertical) {
        // Move up by height
        for (let i = 0; i < props.height; i++) {
          movePrevious();
        }
        return;
      }

      if (parsedKey.key === KEY_PAGEDOWN && isVertical) {
        // Move down by height
        for (let i = 0; i < props.height; i++) {
          moveNext();
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
    return () => h('radiobox', {
      ...props,
      _componentId: componentId,
      _clickable: true,
      highlightedIndex: highlightedIndex.value,
      selectedIndex: selectedIndex.value,
      scrollOffset: scrollOffset.value,
      isFocused: isFocused.value
    });
  }
};

/**
 * Helper function
 */
function renderRadioboxVertical(props) {
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
    disabled = false
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
  // Default: maxWidth + 6 (same as Checkbox)
  const innerWidth = props.width ? props.width : (maxWidth + 6);

  // Width available for text content
  // Overhead: 1(space) + 3(indicator) + 1(space) + 1(space) = 6
  const contentWidth = Math.max(1, innerWidth - 6);

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

      // Build radio indicator
      let indicator = '   ';
      if (isSelected) {
        indicator = chalk[selectedColor].bold('(●)');
      } else {
        indicator = '( )';
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

      output += borderStyle('│') + ' ' + indicator + ' ' + optionText + borderStyle(' │') + '\n';
    } else {
      // Empty row
      output += borderStyle('│') + ' '.repeat(innerWidth) + borderStyle('│') + '\n';
    }
  }

  // Bottom border
  output += borderStyle('└' + '─'.repeat(innerWidth) + '┘');

  // Helper text
  if (isFocused && !disabled) {
    const hint = props.direction === 'vertical'
      ? '↑↓ Navigate • Space/Enter to select • Tab to next field'
      : '←→ Navigate • Space/Enter to select • Tab to next field';
    output += '\n' + chalk.dim(hint);
  }

  // Scroll indicator
  if (options.length > height) {
    const scrollPercent = Math.round((scrollOffset / Math.max(1, options.length - height)) * 100);
    output += '\n' + chalk.dim(`[${scrollPercent}% - showing ${scrollOffset + 1}-${Math.min(scrollOffset + height, options.length)} of ${options.length}]`);
  }

  return output;
}

/**
 * Helper function
 */
function renderRadioboxHorizontal(props) {
  const {
    options = [],
    modelValue = null,
    label = '',
    highlightedIndex = 0,
    selectedIndex = -1,
    isFocused = false,
    selectedColor = 'green',
    highlightColor = 'yellow',
    disabled = false,
    width = null,
    itemSpacing = 2
  } = props;

  let output = '';

  // Render label on separate line
  if (label) {
    const labelText = isFocused && !disabled ? `${chalk.bold(label)}` : label;
    output += applyStyles(labelText, props) + '\n';
  }

  // If no options
  if (options.length === 0) {
    output += chalk.dim('No options') + '\n';
    return output;
  }

  // Calculate layout
  const containerWidth = width || (process.stdout.columns || 80);
  const lines = [];
  let currentLine = [];
  let currentLineWidth = 0;

  // Build each option
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const isHighlighted = isFocused && i === highlightedIndex;
    const isSelected = i === selectedIndex || option.value === modelValue;
    const optionLabel = option.label || String(option.value);

    // Build item string
    let indicator;
    if (isSelected) {
      indicator = chalk[selectedColor].bold('(●)');
    } else {
      indicator = '( )';
    }

    let itemText = `${indicator} ${optionLabel}`;

    // Apply styling
    if (isHighlighted && isFocused && !disabled) {
      itemText = chalk[highlightColor].bold.inverse(itemText);
    } else if (isSelected) {
      itemText = chalk[selectedColor].bold(itemText);
    } else if (option.disabled) {
      itemText = chalk.dim(itemText);
    }

    const itemWidth = getTerminalWidth(itemText);

    // Check if item fits on current line
    if (currentLine.length === 0 || currentLineWidth + itemWidth + itemSpacing <= containerWidth) {
      currentLine.push(itemText);
      currentLineWidth += itemWidth + (currentLine.length > 1 ? itemSpacing : 0);
    } else {
      // Start new line
      lines.push(currentLine);
      currentLine = [itemText];
      currentLineWidth = itemWidth;
    }
  }

  // Add last line
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Render lines
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) output += '\n';
    output += lines[i].join(' '.repeat(itemSpacing));
  }

  // Helper text
  if (isFocused && !disabled) {
    output += '\n' + chalk.dim('←→ Navigate • Space/Enter to select • Tab to next field');
  }

  return output;
}

/**
 * Render function
 */
export function renderRadiobox(props) {
  const { direction = 'vertical' } = props;

  if (direction === 'horizontal') {
    return renderRadioboxHorizontal(props);
  } else {
    return renderRadioboxVertical(props);
  }
}

/**
 * Render handler for radiobox
 */
class RadioboxRenderHandler extends RenderHandler {
  render(ctx) {
    const { node } = ctx;
    const width = ctx.getEffectiveWidth();

    if (width !== null) {
      node.props.width = Math.max(1, width - 2);
    }

    const output = renderRadiobox(ctx.props);

    if (width !== null) {
      delete node.props.width;
    }

    return output;
  }
}

renderHandlerRegistry.register('radiobox', new RadioboxRenderHandler());
