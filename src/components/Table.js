// src/components/Table.js
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
  KEY_PAGEDOWN
} from '@utils/keyParser.js';
import chalk from 'chalk';
import { getTerminalWidth, applyStyles } from '@utils/renderUtils.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

let tableIdCounter = 0;

/**
 * Table component - Interactive table with keyboard navigation and row selection
 */
export default {
  name: 'Table',
  props: {
    // v-model - selected row index
    modelValue: {
      type: Number,
      default: null
    },

    // Data
    headers: {
      type: Array,
      required: true,
      default: () => []
    },
    rows: {
      type: Array,
      required: true,
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
    columnWidths: {
      type: Array,
      default: null
    },
    striped: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
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
    headerColor: {
      type: String,
      default: 'white'
    },
    stripedColor: {
      type: String,
      default: 'black'
    },
    bold: Boolean,
    dim: Boolean,
    // Include common layout props (padding, margin, dimensions)
    ...boxProps
  },

  emits: ['update:modelValue', 'change', 'focus', 'blur', 'select'],

  setup(props, { emit }) {
    const inputManager = inject(VUETTY_INPUT_MANAGER_KEY);
    const vuettyInstance = inject(VUETTY_INSTANCE_KEY, null);

    // Inject viewport state to trigger re-renders on resize
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);

    // Inject width context from parent (Box, etc.)
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);

    // Generate unique component ID
    const componentId = `table-${++tableIdCounter}`;

    // Internal state
    const highlightedIndex = ref(0);
    const scrollOffset = ref(0);

    // Computed: Find selected index based on modelValue
    const selectedIndex = computed(() => {
      if (props.modelValue === null || props.modelValue === undefined) {
        return -1;
      }
      return props.modelValue;
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

    // Watch rows changes to reset highlight if needed
    watch(() => props.rows, () => {
      if (highlightedIndex.value >= props.rows.length) {
        highlightedIndex.value = Math.max(0, props.rows.length - 1);
        updateScrollOffset();
      }
    });

    /**
     * Update scroll offset to keep highlighted row visible
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
        updateScrollOffset();
      }
    }

    /**
     * Move highlight down
     */
    function moveDown() {
      if (highlightedIndex.value < props.rows.length - 1) {
        highlightedIndex.value++;
        updateScrollOffset();
      }
    }

    /**
     * Jump to first row
     */
    function jumpToFirst() {
      highlightedIndex.value = 0;
      updateScrollOffset();
    }

    /**
     * Jump to last row
     */
    function jumpToLast() {
      highlightedIndex.value = props.rows.length - 1;
      updateScrollOffset();
    }

    /**
     * Select the highlighted row
     */
    function selectHighlighted() {
      if (props.rows.length === 0) {
        return;
      }

      emit('update:modelValue', highlightedIndex.value);
      emit('change', highlightedIndex.value);
      emit('select', {
        index: highlightedIndex.value,
        row: props.rows[highlightedIndex.value]
      });
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
    }

    /**
     * Mouse click handler
     */
    function handleClick(mouseEvent) {
      if (props.disabled) return;

      // Focus the table when clicked
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
    if (selectedIndex.value >= 0 && selectedIndex.value < props.rows.length) {
      highlightedIndex.value = selectedIndex.value;
      updateScrollOffset();
    } else if (props.rows.length > 0) {
      // Otherwise, highlight first row
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

      // Access props.rows and props.headers to create reactive dependencies
      // This ensures Vue re-renders when these arrays change
      const rows = props.rows;
      const headers = props.headers;

      // Pass injected width and viewport version through props
      // The viewport version creates a reactive dependency - when it changes, Vue re-renders
      return h('table', {
        ...props,
        rows: Array.isArray(rows) ? [...rows] : rows,
        headers: Array.isArray(headers) ? [...headers] : headers,
        highlightedIndex: highlightedIndex.value,
        selectedIndex: selectedIndex.value,
        scrollOffset: scrollOffset.value,
        isFocused: isFocused.value,
        _componentId: componentId,
        _clickable: true,
        _injectedWidth: injectedWidth,
        _viewportVersion: viewportState ? viewportState.version : 0
      });
    };
  }
};

/**
 * Helper function
 */
function calculateColumnWidths(headers, rows, manualWidths) {
  if (manualWidths && manualWidths.length > 0) {
    return manualWidths;
  }

  const numCols = Math.max(headers.length, ...rows.map(r => r.length));
  const widths = Array.from({ length: numCols }, () => 0);

  // Check header widths
  for (let i = 0; i < headers.length; i++) {
    const headerText = String(headers[i] || '');
    widths[i] = Math.max(widths[i], getTerminalWidth(headerText));
  }

  // Check all row widths
  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      const cellText = String(row[i] || '');
      widths[i] = Math.max(widths[i], getTerminalWidth(cellText));
    }
  }

  // Add padding (1 space on each side)
  return widths.map(w => w + 2);
}

/**
 * Helper function
 */
function renderTopBorder(colWidths, borderStyle) {
  let border = '┌';
  for (let i = 0; i < colWidths.length; i++) {
    border += '─'.repeat(colWidths[i]);
    if (i < colWidths.length - 1) {
      border += '┬';
    }
  }
  border += '┐';
  return borderStyle(border) + '\n';
}

/**
 * Helper function
 */
function renderBottomBorder(colWidths, borderStyle) {
  let border = '└';
  for (let i = 0; i < colWidths.length; i++) {
    border += '─'.repeat(colWidths[i]);
    if (i < colWidths.length - 1) {
      border += '┴';
    }
  }
  border += '┘';
  return borderStyle(border) + '\n';
}

/**
 * Helper function
 */
function renderDividerRow(colWidths, borderStyle) {
  let border = '├';
  for (let i = 0; i < colWidths.length; i++) {
    border += '─'.repeat(colWidths[i]);
    if (i < colWidths.length - 1) {
      border += '┼';
    }
  }
  border += '┤';
  return borderStyle(border) + '\n';
}

/**
 * Helper function
 */
function renderHeaderRow(headers, colWidths, borderStyle, headerColor) {
  let line = borderStyle('│');

  for (let i = 0; i < colWidths.length; i++) {
    const header = String(headers[i] || '');
    const width = colWidths[i] - 2; // Subtract padding

    // Truncate if too long
    let cellText = header;
    if (getTerminalWidth(header) > width) {
      cellText = header.substring(0, width - 1) + '…';
    }

    // Pad to width
    const visualWidth = getTerminalWidth(cellText);
    const padding = width - visualWidth;
    cellText = ' ' + cellText + ' '.repeat(padding + 1);

    // Apply header styling
    const headerStyle = chalk[headerColor] ? chalk[headerColor].bold : chalk.bold;
    const styledCell = headerStyle(cellText);
    line += styledCell + borderStyle('│');
  }

  return line + '\n';
}

/**
 * Helper function
 */
function renderDataRow(row, colWidths, borderStyle, isHighlighted, isSelected, isStriped, styleOptions) {
  const { highlightColor, selectedColor, isFocused, disabled } = styleOptions;

  let line = borderStyle('│');

  for (let i = 0; i < colWidths.length; i++) {
    const cellData = String(row[i] || '');
    const width = colWidths[i] - 2; // Subtract padding

    // Truncate if too long
    let cellText = cellData;
    if (getTerminalWidth(cellData) > width) {
      cellText = cellData.substring(0, width - 1) + '…';
    }

    // Pad to width
    const visualWidth = getTerminalWidth(cellText);
    const padding = width - visualWidth;
    cellText = ' ' + cellText + ' '.repeat(padding + 1);

    // Apply row styling
    let styledCell = cellText;

    if (isHighlighted && isFocused && !disabled) {
      // Highlighted row (inverted)
      const highlightStyle = chalk[highlightColor] ? chalk[highlightColor].bold.inverse : chalk.bold.inverse;
      styledCell = highlightStyle(cellText);
    } else if (isSelected) {
      // Selected row (bold green)
      const selectedStyle = chalk[selectedColor] ? chalk[selectedColor].bold : chalk.bold;
      styledCell = selectedStyle(cellText);
    } else if (isStriped) {
      // Striped row (dim background)
      styledCell = chalk.bgBlack(cellText);
    }

    line += styledCell + borderStyle('│');
  }

  return line + '\n';
}

/**
 * Helper function
 */
function renderEmptyRow(colWidths, borderStyle) {
  let line = borderStyle('│');

  for (let i = 0; i < colWidths.length; i++) {
    line += ' '.repeat(colWidths[i]) + borderStyle('│');
  }

  return line + '\n';
}

/**
 * Helper function
 */
function renderEmptyTable(isFocused, focusColor, props) {
  const width = 20;
  const borderColor = isFocused ? focusColor : (props.color || 'white');
  const borderStyle = isFocused
    ? (chalk[borderColor] || chalk).bold
    : chalk[borderColor] || chalk;

  let output = '';
  output += borderStyle('┌' + '─'.repeat(width + 2) + '┐') + '\n';
  output += borderStyle('│') + ' No data'.padEnd(width + 2, ' ') + borderStyle('│') + '\n';
  output += borderStyle('└' + '─'.repeat(width + 2) + '┘') + '\n';

  return output;
}

/**
 * Render function
 */
export function renderTable(props) {
  const {
    headers = [],
    rows = [],
    label = '',
    height = 10,
    highlightedIndex = 0,
    selectedIndex = -1,
    scrollOffset = 0,
    isFocused = false,
    showHeader = true,
    striped = true,
    columnWidths = null,
    focusColor = 'cyan',
    selectedColor = 'green',
    highlightColor = 'yellow',
    headerColor = 'white',
    stripedColor = 'black',
    disabled = false
  } = props;

  let output = '';

  // Render label if provided
  if (label) {
    const labelText = isFocused && !disabled ? chalk.bold(label) : label;
    output += applyStyles(labelText, props) + '\n';
  }

  // Handle empty table
  if (headers.length === 0 && rows.length === 0) {
    return output + renderEmptyTable(isFocused, focusColor, props);
  }

  // Calculate column widths
  const colWidths = calculateColumnWidths(headers, rows, columnWidths);

  // Determine border style (bold when focused)
  const borderColor = isFocused && !disabled ? focusColor : (props.color || 'white');
  const borderStyle = isFocused && !disabled
    ? (chalk[borderColor] || chalk).bold
    : chalk[borderColor] || chalk;

  // Render top border
  output += renderTopBorder(colWidths, borderStyle);

  // Render header row
  if (showHeader && headers.length > 0) {
    output += renderHeaderRow(headers, colWidths, borderStyle, headerColor);
    output += renderDividerRow(colWidths, borderStyle);
  }

  // Render data rows (with scrolling)
  const visibleRows = rows.slice(scrollOffset, scrollOffset + height);

  for (let i = 0; i < height; i++) {
    const globalIndex = scrollOffset + i;
    const row = visibleRows[i];

    if (row) {
      const isHighlighted = isFocused && globalIndex === highlightedIndex;
      const isSelected = globalIndex === selectedIndex;
      const isStriped = striped && globalIndex % 2 === 1;

      output += renderDataRow(
        row,
        colWidths,
        borderStyle,
        isHighlighted,
        isSelected,
        isStriped,
        { highlightColor, selectedColor, stripedColor, isFocused, disabled }
      );
    } else {
      // Empty row placeholder
      output += renderEmptyRow(colWidths, borderStyle);
    }
  }

  // Render bottom border
  output += renderBottomBorder(colWidths, borderStyle);

  // Helper text
  if (isFocused && !disabled) {
    output += chalk.dim('↑↓ Navigate • Enter/Space to select • Tab to next field') + '\n';
  }

  // Scroll indicator
  if (rows.length > height) {
    const scrollPercent = Math.round((scrollOffset / Math.max(1, rows.length - height)) * 100);
    output += chalk.dim(
      `[${scrollPercent}% - showing ${scrollOffset + 1}-${Math.min(scrollOffset + height, rows.length)} of ${rows.length} rows]`
    ) + '\n';
  }

  return output;
}

/**
 * Render handler for table
 */
class TableRenderHandler extends RenderHandler {
  render(ctx) {
    return renderTable(ctx.props);
  }
}

renderHandlerRegistry.register('table', new TableRenderHandler());