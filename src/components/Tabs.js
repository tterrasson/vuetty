// src/components/Tabs.js
import { h, inject, computed, ref, onUnmounted, watch, provide } from 'vue';
import {
  VUETTY_INPUT_MANAGER_KEY,
  VUETTY_INSTANCE_KEY,
  VUETTY_VIEWPORT_STATE_KEY,
  VUETTY_THEME_KEY
} from '@core/vuettyKeys.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import { HEIGHT_CONTEXT_KEY } from '@core/heightContext.js';
import {
  KEY_LEFT,
  KEY_RIGHT,
  KEY_HOME,
  KEY_END,
  KEY_ENTER,
  isPrintable
} from '@utils/keyParser.js';
import chalk from 'chalk';
import { getTerminalWidth } from '@utils/renderUtils.js';
import { boxProps } from '@core/layoutProps.js';
import { renderBox } from './Box.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

let tabsIdCounter = 0;

/**
 * Normalize tab to consistent format
 */
function normalizeTab(tab, index) {
  if (typeof tab === 'object' && tab !== null) {
    return {
      value: tab.value !== undefined ? tab.value : index,
      label: tab.label || String(tab.value || tab),
      disabled: tab.disabled || false
    };
  }
  return {
    value: tab,
    label: String(tab),
    disabled: false
  };
}

/**
 * Tabs component - Tab navigation with panels
 */
export default {
  name: 'Tabs',
  props: {
    // Include common layout props (padding, margin, dimensions)
    ...boxProps,

    // v-model - active tab value
    modelValue: {
      type: [String, Number],
      default: null
    },

    // Tab definitions
    tabs: {
      type: Array,
      required: true,
      default: () => []
    },

    // Display
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
      default: null
    },
    activeColor: {
      type: String,
      default: null
    },
    highlightColor: {
      type: String,
      default: null
    },

    // Panel styling
    panelBorder: {
      type: Boolean,
      default: true
    },
    panelBorderStyle: {
      type: String,
      default: 'rounded'
    },
    panelPadding: {
      type: Number,
      default: 1
    },

    // Hint
    hint: {
      type: [String, Boolean],
      default: 'default'
    }
  },

  emits: ['update:modelValue', 'change', 'focus', 'blur'],

  setup(props, { emit, slots }) {
    // Inject dependencies
    const inputManager = inject(VUETTY_INPUT_MANAGER_KEY);
    const vuettyInstance = inject(VUETTY_INSTANCE_KEY, null);
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);
    const injectedHeightContext = inject(HEIGHT_CONTEXT_KEY, null);
    const theme = inject(VUETTY_THEME_KEY, null);

    // Generate unique component ID
    const componentId = `tabs-${++tabsIdCounter}`;

    // Internal state
    const highlightedIndex = ref(0);

    // Normalize tabs
    const normalizedTabs = computed(() => {
      return props.tabs.map((tab, index) => normalizeTab(tab, index));
    });

    // Find active tab index based on modelValue
    const activeIndex = computed(() => {
      if (props.modelValue === null || props.modelValue === undefined) {
        // Default to first non-disabled tab
        const firstEnabled = normalizedTabs.value.findIndex(tab => !tab.disabled);
        return firstEnabled >= 0 ? firstEnabled : 0;
      }
      const idx = normalizedTabs.value.findIndex(tab => tab.value === props.modelValue);
      return idx >= 0 ? idx : 0;
    });

    // Check if focused
    const isFocused = computed(() => {
      return inputManager && inputManager.isFocused(componentId);
    });

    // Provide width context to children (panel content)
    provide(WIDTH_CONTEXT_KEY, () => {
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      if (props.width !== undefined && props.width !== null) {
        // Account for panel border and padding
        const borderWidth = props.panelBorder ? 2 : 0;
        const paddingWidth = props.panelPadding * 2;
        return Math.max(0, props.width - borderWidth - paddingWidth);
      }

      if (injectedWidth !== undefined && injectedWidth !== null) {
        const borderWidth = props.panelBorder ? 2 : 0;
        const paddingWidth = props.panelPadding * 2;
        return Math.max(0, injectedWidth - borderWidth - paddingWidth);
      }

      return null;
    });

    // Provide height context to children
    provide(HEIGHT_CONTEXT_KEY, () => {
      const injectedHeight = typeof injectedHeightContext === 'function'
        ? injectedHeightContext()
        : injectedHeightContext;

      if (injectedHeight !== undefined && injectedHeight !== null) {
        // Account for tab bar (2 lines) + panel border + padding
        const tabBarHeight = 2;
        const borderHeight = props.panelBorder ? 2 : 0;
        const paddingHeight = props.panelPadding * 2;
        return Math.max(0, injectedHeight - tabBarHeight - borderHeight - paddingHeight);
      }

      return null;
    });

    // Focus/blur events
    watch(isFocused, (newVal, oldVal) => {
      if (newVal && !oldVal) {
        emit('focus');
      } else if (!newVal && oldVal) {
        emit('blur');
      }
    });

    // Watch tabs changes to reset highlight if needed
    watch(normalizedTabs, () => {
      if (highlightedIndex.value >= normalizedTabs.value.length) {
        highlightedIndex.value = Math.max(0, normalizedTabs.value.length - 1);
      }
    }, { deep: true });

    /**
     * Move highlight to previous tab
     */
    function movePrevious() {
      if (highlightedIndex.value > 0) {
        const startIndex = highlightedIndex.value;
        highlightedIndex.value--;

        // Skip disabled tabs
        while (highlightedIndex.value > 0 && normalizedTabs.value[highlightedIndex.value]?.disabled) {
          highlightedIndex.value--;
        }

        // If we landed on a disabled tab, revert
        if (normalizedTabs.value[highlightedIndex.value]?.disabled) {
          highlightedIndex.value = startIndex;
        }
      }
    }

    /**
     * Move highlight to next tab
     */
    function moveNext() {
      if (highlightedIndex.value < normalizedTabs.value.length - 1) {
        const startIndex = highlightedIndex.value;
        highlightedIndex.value++;

        // Skip disabled tabs
        while (
          highlightedIndex.value < normalizedTabs.value.length - 1 &&
          normalizedTabs.value[highlightedIndex.value]?.disabled
        ) {
          highlightedIndex.value++;
        }

        // If we landed on a disabled tab, revert
        if (normalizedTabs.value[highlightedIndex.value]?.disabled) {
          highlightedIndex.value = startIndex;
        }
      }
    }

    /**
     * Jump to first tab
     */
    function jumpToFirst() {
      highlightedIndex.value = 0;

      // Skip disabled tabs at the start
      while (
        highlightedIndex.value < normalizedTabs.value.length - 1 &&
        normalizedTabs.value[highlightedIndex.value]?.disabled
      ) {
        highlightedIndex.value++;
      }
    }

    /**
     * Jump to last tab
     */
    function jumpToLast() {
      highlightedIndex.value = normalizedTabs.value.length - 1;

      // Skip disabled tabs at the end
      while (highlightedIndex.value > 0 && normalizedTabs.value[highlightedIndex.value]?.disabled) {
        highlightedIndex.value--;
      }
    }

    /**
     * Select the highlighted tab
     */
    function selectHighlighted() {
      const tab = normalizedTabs.value[highlightedIndex.value];

      if (!tab || tab.disabled) {
        return;
      }

      emit('update:modelValue', tab.value);
      emit('change', tab.value);
    }

    /**
     * Jump to tab by typing first letter
     */
    function jumpByChar(char) {
      const lowerChar = char.toLowerCase();
      const currentIndex = highlightedIndex.value;

      // Search from next tab forward
      for (let i = currentIndex + 1; i < normalizedTabs.value.length; i++) {
        const tab = normalizedTabs.value[i];
        if (tab.label.toLowerCase().startsWith(lowerChar) && !tab.disabled) {
          highlightedIndex.value = i;
          return;
        }
      }

      // Wrap around: search from start to current
      for (let i = 0; i <= currentIndex; i++) {
        const tab = normalizedTabs.value[i];
        if (tab.label.toLowerCase().startsWith(lowerChar) && !tab.disabled) {
          highlightedIndex.value = i;
          return;
        }
      }
    }

    /**
     * Key handler - LEFT/RIGHT navigation
     */
    function handleKey(parsedKey) {
      if (props.disabled) return false;

      if (parsedKey.key === KEY_LEFT) {
        movePrevious();
        return true;
      }

      if (parsedKey.key === KEY_RIGHT) {
        moveNext();
        return true;
      }

      if (parsedKey.key === KEY_HOME) {
        jumpToFirst();
        return true;
      }

      if (parsedKey.key === KEY_END) {
        jumpToLast();
        return true;
      }

      if (parsedKey.key === KEY_ENTER || parsedKey.char === ' ') {
        selectHighlighted();
        return true;
      }

      if (isPrintable(parsedKey) && parsedKey.char !== ' ') {
        jumpByChar(parsedKey.char);
        return true;
      }

      return false;
    }

    /**
     * Mouse click handler - focus and select tab on click
     */
    function handleClick(mouseEvent) {
      if (props.disabled) return;

      // Focus the component
      inputManager.focus(componentId);

      // Handle release event
      if (mouseEvent.action === 'left_release') {
        return;
      }

      // Only handle left clicks
      if (mouseEvent.action !== 'left_click') {
        return;
      }

      // Get component position from clickMap
      if (!vuettyInstance || !vuettyInstance.clickMap) {
        return;
      }

      const region = vuettyInstance.clickMap.regions.find(r => r.componentId === componentId);
      if (!region) {
        return;
      }

      // Calculate local coordinates
      // mouseEvent.x/y are 1-indexed terminal coords
      // region.x is 0-indexed, region.screenY is 0-indexed viewport-relative
      const localX = (mouseEvent.x - 1) - region.x;
      const localY = (mouseEvent.y - 1) - region.screenY;

      // Check if click is on the tab bar (first line, localY === 0)
      if (localY !== 0) {
        return;
      }

      // Calculate which tab was clicked based on x position
      let currentX = 0;
      const separatorWidth = 3; // ' │ '

      for (let i = 0; i < normalizedTabs.value.length; i++) {
        const tab = normalizedTabs.value[i];
        const tabLabel = ` ${tab.label} `;
        const tabWidth = getTerminalWidth(tabLabel);

        // Check if click is within this tab's bounds
        if (localX >= currentX && localX < currentX + tabWidth) {
          // Found the clicked tab
          if (!tab.disabled) {
            highlightedIndex.value = i;
            emit('update:modelValue', tab.value);
            emit('change', tab.value);
          }
          return;
        }

        currentX += tabWidth + separatorWidth;
      }
    }

    // Register component with input manager
    if (inputManager) {
      inputManager.registerComponent(componentId, handleKey, {
        disabled: props.disabled
      });
    }

    // Register click handler
    if (vuettyInstance) {
      vuettyInstance.registerClickHandler(componentId, handleClick);
    }

    // Initialize highlighted index to active tab
    if (activeIndex.value >= 0) {
      highlightedIndex.value = activeIndex.value;
    } else {
      jumpToFirst();
    }

    // Cleanup on unmount
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
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      // Get slot content with active tab value
      const activeTabValue = normalizedTabs.value[activeIndex.value]?.value;
      const slotContent = slots.default ? slots.default({ activeTab: activeTabValue }) : [];

      // Resolve theme colors
      const effectiveFocusColor = props.focusColor !== undefined
        ? props.focusColor
        : (theme?.components?.tabs?.focusColor || 'cyan');
      const effectiveActiveColor = props.activeColor !== undefined
        ? props.activeColor
        : (theme?.components?.tabs?.activeColor || 'green');
      const effectiveHighlightColor = props.highlightColor !== undefined
        ? props.highlightColor
        : (theme?.components?.tabs?.highlightColor || 'yellow');
      const effectiveColor = props.color !== undefined
        ? props.color
        : (theme?.components?.tabs?.color || theme?.components?.tabs?.focusColor);

      return h('tabs', {
        ...props,
        _componentId: componentId,
        _clickable: true,
        _tabWidths: normalizedTabs.value.map(tab => getTerminalWidth(` ${tab.label} `)),
        tabs: normalizedTabs.value,
        highlightedIndex: highlightedIndex.value,
        activeIndex: activeIndex.value,
        isFocused: isFocused.value,
        focusColor: effectiveFocusColor,
        activeColor: effectiveActiveColor,
        highlightColor: effectiveHighlightColor,
        color: effectiveColor,
        _injectedWidth: injectedWidth,
        _viewportVersion: viewportState ? viewportState.version : 0
      }, slotContent);
    };
  }
};

/**
 * Render function for Tabs component
 */
export function renderTabs(props, panelContent = '') {
  const {
    tabs = [],
    highlightedIndex = 0,
    activeIndex = 0,
    isFocused = false,
    disabled = false,
    focusColor = 'cyan',
    activeColor = 'green',
    highlightColor = 'yellow',
    panelBorder = true,
    panelBorderStyle = 'rounded',
    panelPadding = 1,
    width,
    _injectedWidth,
    hint = 'default',
    color
  } = props;

  let output = '';

  // --- Render Tab Bar ---
  const tabItems = [];
  const tabWidths = [];

  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const isActive = i === activeIndex;
    const isHighlighted = isFocused && i === highlightedIndex;

    let tabLabel = ` ${tab.label} `;
    const labelWidth = getTerminalWidth(tabLabel);
    tabWidths.push(labelWidth);

    // Apply styling
    if (tab.disabled) {
      tabLabel = chalk.dim(tabLabel);
    } else if (isHighlighted && !disabled) {
      tabLabel = chalk[highlightColor].bold.inverse(tabLabel);
    } else if (isActive) {
      tabLabel = chalk[activeColor].bold(tabLabel);
    }

    tabItems.push(tabLabel);
  }

  // Join tabs with separator
  const separator = chalk.dim(' │ ');
  const tabBar = tabItems.join(separator);
  output += tabBar + '\n';

  // Build underline for active tab indication
  const underlineParts = [];
  for (let i = 0; i < tabs.length; i++) {
    const labelWidth = tabWidths[i];
    if (i === activeIndex) {
      underlineParts.push(chalk[activeColor]('─'.repeat(labelWidth)));
    } else {
      underlineParts.push(' '.repeat(labelWidth));
    }
  }
  // Account for separators (3 chars each: space + bar + space)
  const separatorWidth = 3;
  const underline = underlineParts.join(' '.repeat(separatorWidth));
  output += underline + '\n';

  // --- Render Panel ---
  if (panelContent) {
    const effectiveWidth = width || _injectedWidth;
    const borderColor = isFocused && !disabled ? focusColor : (color || undefined);

    if (panelBorder) {
      output += renderBox(panelContent, {
        border: true,
        borderStyle: panelBorderStyle,
        color: borderColor,
        padding: panelPadding,
        width: effectiveWidth,
        bold: isFocused && !disabled
      }, 0);
    } else {
      output += panelContent;
    }
  }

  // --- Hint Text ---
  if (isFocused && !disabled && hint !== false) {
    let hintText = '';

    if (hint === 'default') {
      hintText = '\u2190\u2192 Navigate tabs \u2022 Enter to select \u2022 Tab to next field';
    } else if (hint && hint !== '') {
      hintText = hint;
    }

    if (hintText) {
      output += '\n' + chalk.dim(hintText);
    }
  }

  return output;
}

/**
 * Helper to count lines in a string
 */
function countLines(str) {
  if (!str) return 0;
  let count = 1;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 10) count++;
  }
  return count;
}

/**
 * Render handler for tabs
 */
class TabsRenderHandler extends RenderHandler {
  render(ctx) {
    const { node, depth, absX } = ctx;
    const width = ctx.getEffectiveWidth();

    if (width !== null) {
      node.props.width = width;
    }

    // Render children (panel content)
    let panelContent = '';
    if (ctx.children.length > 0) {
      let yOffset = 2; // Account for tab bar (2 lines)
      const childOutputs = [];

      for (const child of ctx.children) {
        if (child.type === 'comment') continue;

        const childOut = ctx.renderChild(child, {
          parentAbsX: absX,
          yOffset: yOffset,
          inRow: false
        });

        if (childOut) {
          childOutputs.push(childOut);
          yOffset += countLines(childOut);
        }
      }

      panelContent = childOutputs.join('\n');
    } else {
      panelContent = ctx.text;
    }

    const output = renderTabs(ctx.props, panelContent);

    if (width !== null) {
      delete node.props.width;
    }

    return output;
  }
}

renderHandlerRegistry.register('tabs', new TabsRenderHandler());
