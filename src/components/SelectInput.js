// src/components/SelectInput.js
import { h, inject, computed } from 'vue';
import { VUETTY_VIEWPORT_STATE_KEY, VUETTY_THEME_KEY } from '@core/vuettyKeys.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import { useNavigableList } from '@composables/useNavigableList.js';
import chalk from 'chalk';
import { getTerminalWidth, applyStyles } from '@utils/renderUtils.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

let selectInputIdCounter = 0;

/**
 * Normalize option to consistent format
 */
function normalizeOption(opt, index) {
  if (typeof opt === 'object' && opt !== null) {
    return {
      value: opt.value !== undefined ? opt.value : index,
      label: opt.label || String(opt.value || opt),
      disabled: opt.disabled || false
    };
  }
  return {
    value: opt,
    label: String(opt),
    disabled: false
  };
}

/**
 * SelectInput component - Interactive selection list
 */
export default {
  name: 'SelectInput',
  props: {
    // Include common layout props first (padding, margin, dimensions)
    // so that SelectInput-specific props can override them
    ...boxProps,

    // v-model
    modelValue: {
      type: [String, Number, Object, Array],
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

    // Visual markers
    marker: {
      type: String,
      default: '●'
    },
    highlightMarker: {
      type: String,
      default: '▸'
    },

    // State
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
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
    }
  },

  emits: ['update:modelValue', 'change', 'focus', 'blur'],

  setup(props, { emit }) {
    // Inject viewport state to trigger re-renders on resize
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);
    const theme = inject(VUETTY_THEME_KEY, null);

    // Inject width context from parent (Box, etc.)
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);

    // Generate unique component ID
    const componentId = `selectinput-${++selectInputIdCounter}`;

    // Normalize options to consistent format
    const normalizedItems = computed(() => {
      return props.options.map((opt, index) => normalizeOption(opt, index));
    });

    // Use navigable list composable
    const navigation = useNavigableList({
      items: normalizedItems,
      height: computed(() => props.height),
      modelValue: computed(() => props.modelValue),
      emit,
      componentId,
      disabled: computed(() => props.disabled),
      multiple: computed(() => props.multiple)
    });

    // Render
    return () => {
      // Resolve width context (call function if it's a function for reactive width)
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      // Resolve colors from theme
      const effectiveFocusColor = props.focusColor || theme?.components?.selectInput?.focusColor || 'cyan';
      const effectiveSelectedColor = props.selectedColor || theme?.components?.selectInput?.selectedColor || 'green';
      const effectiveHighlightColor = props.highlightColor || theme?.components?.selectInput?.highlightColor || 'yellow';
      const effectiveColor = props.color || theme?.components?.selectInput?.color;
      const effectiveBg = props.bg !== undefined ? props.bg : theme?.components?.selectInput?.bg;

      // Pass injected width and viewport version through props
      // The viewport version creates a reactive dependency - when it changes, Vue re-renders
      return h('selectinput', {
        ...props,
        _componentId: componentId,
        _clickable: true,
        highlightedIndex: navigation.highlightedIndex.value,
        selectedIndex: navigation.selectedIndex.value,
        selectedIndices: navigation.selectedIndices.value,
        scrollOffset: navigation.scrollOffset.value,
        isFocused: navigation.isFocused.value,
        focusColor: effectiveFocusColor,
        selectedColor: effectiveSelectedColor,
        highlightColor: effectiveHighlightColor,
        color: effectiveColor,
        bg: effectiveBg,
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
    selectedIndices = [],
    scrollOffset = 0,
    isFocused = false,
    focusColor = 'cyan',
    selectedColor = 'green',
    highlightColor = 'yellow',
    disabled = false,
    hint = 'default',
    marker = '●',
    highlightMarker = '▸',
    multiple = false
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

  // Always show exactly 'height' rows (or total options if less)
  const visibleCount = Math.min(height, options.length);

  // Render visible options
  for (let i = 0; i < visibleCount; i++) {
    const globalIndex = scrollOffset + i;
    const option = options[globalIndex];

    if (option) {
      const isHighlighted = isFocused && globalIndex === highlightedIndex;

      // Check if option is selected (handle both single and multi-select)
      let isSelected = false;
      if (multiple) {
        // Multi-select: check if value is in modelValue array or selectedIndices
        if (Array.isArray(modelValue)) {
          isSelected = modelValue.includes(option.value);
        } else if (selectedIndices && selectedIndices.length > 0) {
          isSelected = selectedIndices.includes(globalIndex);
        }
      } else {
        // Single select: check selectedIndex or modelValue match
        isSelected = globalIndex === selectedIndex || option.value === modelValue;
      }

      const optionLabel = option.label || String(option.value);

      // Build indicator
      let indicator = '  ';
      if (isSelected) {
        indicator = chalk[selectedColor].bold(`${marker} `);
      } else if (isHighlighted) {
        indicator = chalk[highlightColor].bold(`${highlightMarker} `);
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
      // Empty row to maintain consistent height
      const emptyRow = '  ' + ''.padEnd(contentWidth, ' ');
      output += borderStyle('│') + emptyRow + borderStyle('│') + '\n';
    }
  }

  // Bottom border
  output += borderStyle('└' + '─'.repeat(innerWidth) + '┘');

  // Helper text
  if (isFocused && !disabled && hint !== false) {
    let hintText = '';

    if (hint === 'default') {
      if (multiple) {
        hintText = '↑↓ Navigate • Space to toggle • Enter to confirm • Tab to next field';
      } else {
        hintText = '↑↓ Navigate • Enter to select • Tab to next field';
      }
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
