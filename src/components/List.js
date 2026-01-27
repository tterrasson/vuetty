// src/components/List.js
import { h, inject, computed } from 'vue';
import { VUETTY_VIEWPORT_STATE_KEY, VUETTY_THEME_KEY } from '@core/vuettyKeys.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import chalk from 'chalk';
import { getTerminalWidth, applyStyles } from '@utils/renderUtils.js';
import { getChalkColor } from '@utils/colorUtils.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

let listIdCounter = 0;

/**
 * Normalize item to consistent format
 */
function normalizeItem(item, index) {
  if (typeof item === 'object' && item !== null) {
    return {
      value: item.value !== undefined ? item.value : index,
      label: item.label || String(item.value || item)
    };
  }
  return {
    value: item,
    label: String(item)
  };
}

/**
 * List component - Static display list (non-interactive)
 */
export default {
  name: 'List',
  props: {
    // Include common layout props first (padding, margin, dimensions)
    // so that List-specific props can override them
    ...boxProps,

    // Items
    items: {
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
      default: undefined
    },
    width: {
      type: Number,
      default: undefined
    },

    // Visual markers
    marker: {
      type: String,
      default: '•'
    },

    // Highlighted item (visual only, not interactive)
    highlightedValue: {
      type: [String, Number, Object],
      default: null
    },

    // Styling
    color: String,
    bg: String,
    highlightColor: {
      type: String,
      default: null
    },
    bold: Boolean,
    dim: Boolean
  },

  setup(props) {
    // Inject viewport state to trigger re-renders on resize
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);
    const theme = inject(VUETTY_THEME_KEY, null);

    // Inject width context from parent (Box, etc.)
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);

    // Generate unique component ID
    const componentId = `list-${++listIdCounter}`;

    // Computed: Normalize items to consistent format
    const normalizedItems = computed(() => {
      return props.items.map((item, index) => normalizeItem(item, index));
    });

    // Render
    return () => {
      // Resolve width context (call function if it's a function for reactive width)
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      // Resolve colors from theme
      const effectiveHighlightColor = props.highlightColor || theme?.components?.list?.highlightColor || 'cyan';
      const effectiveColor = props.color || theme?.components?.list?.color;
      const effectiveBg = props.bg !== undefined ? props.bg : theme?.components?.list?.bg;

      // Pass injected width and viewport version through props
      // The viewport version creates a reactive dependency - when it changes, Vue re-renders
      return h('list', {
        ...props,
        _componentId: componentId,
        items: normalizedItems.value,
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
export function renderList(props) {
  const {
    items = [],
    label = '',
    height,
    highlightedValue = null,
    highlightColor = 'cyan',
    marker = '•'
  } = props;

  let output = '';

  // Render label
  if (label) {
    output += applyStyles(label, props) + '\n';
  }

  // If no items
  if (items.length === 0) {
    const emptyText = chalk.dim('(empty list)');
    output += applyStyles(emptyText, props);
    return output;
  }

  // Calculate max width for items
  const maxWidth = Math.max(
    20,
    ...items.map(item => getTerminalWidth(item.label))
  );

  // Determine content width
  // If props.width is provided, use it; otherwise calculate from content
  const contentWidth = props.width ? props.width : (maxWidth + 4);

  // Marker width (2 characters for marker + space)
  const markerWidth = 2;
  const textWidth = contentWidth - markerWidth;

  // Determine how many items to render
  const itemsToRender = height !== undefined ? Math.min(height, items.length) : items.length;

  // Render items
  for (let i = 0; i < itemsToRender; i++) {
    const item = items[i];

    if (item) {
      const isHighlighted = item.value === highlightedValue;
      const itemLabel = item.label;

      // Build indicator
      let indicator = '  ';
      if (isHighlighted) {
        indicator = getChalkColor(highlightColor).bold(`${marker} `);
      }

      // Build item text - pad to width
      let itemText = itemLabel.padEnd(textWidth, ' ');

      // Truncate if too long
      if (getTerminalWidth(itemLabel) > textWidth) {
        itemText = itemLabel.substring(0, textWidth);
      }

      // Apply styling
      if (isHighlighted) {
        itemText = getChalkColor(highlightColor)(itemText);
      } else {
        itemText = applyStyles(itemText, props);
      }

      output += indicator + itemText + '\n';
    }
  }

  // Remove trailing newline
  output = output.slice(0, -1);

  // Show count indicator if there are more items than displayed
  if (height !== undefined && items.length > height) {
    const total = items.length;
    output += '\n' + chalk.dim(`[showing ${height} of ${total} items]`);
  }

  return output;
}

/**
 * Render handler for list
 */
class ListRenderHandler extends RenderHandler {
  render(ctx) {
    const { node } = ctx;
    const width = ctx.getEffectiveWidth();

    if (width !== null) {
      node.props.width = width;
    }

    const output = renderList(ctx.props);

    if (width !== null) {
      delete node.props.width;
    }

    return output;
  }
}

renderHandlerRegistry.register('list', new ListRenderHandler());
