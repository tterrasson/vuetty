// src/components/VirtualList.js
import {
  h,
  ref,
  computed,
  inject,
  watch,
  onUnmounted
} from 'vue';
import {
  VUETTY_INPUT_MANAGER_KEY,
  VUETTY_INSTANCE_KEY,
  VUETTY_VIEWPORT_STATE_KEY,
  VUETTY_THEME_KEY
} from '@core/vuettyKeys.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';
import { adjustToHeight } from '@utils/heightUtils.js';
import { applyStyles } from '@utils/renderUtils.js';
import {
  KEY_UP,
  KEY_DOWN,
  KEY_HOME,
  KEY_END,
  KEY_PAGEUP,
  KEY_PAGEDOWN
} from '@utils/keyParser.js';

let virtualListIdCounter = 0;

function toPositiveInteger(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(1, Math.floor(number));
}

function toNonNegativeInteger(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.floor(number));
}

function isPromiseLike(value) {
  return value && typeof value.then === 'function';
}

function defaultKeyExtractor(item, index) {
  if (item && typeof item === 'object') {
    if (item.id !== undefined) return item.id;
    if (item.key !== undefined) return item.key;
    if (item.value !== undefined) return item.value;
  }
  return index;
}

export function getVirtualListWindow({
  count = 0,
  height = 1,
  itemHeight = 1,
  scrollOffset = 0,
  overscan = 3
}) {
  const safeCount = toNonNegativeInteger(count);
  const safeHeight = toPositiveInteger(height, 1);
  const safeItemHeight = toPositiveInteger(itemHeight, 1);
  const safeOverscan = toNonNegativeInteger(overscan, 3);
  const visibleItems = Math.max(1, Math.ceil(safeHeight / safeItemHeight));
  const maxScrollOffset = Math.max(0, safeCount - visibleItems);
  const clampedOffset = Math.max(0, Math.min(toNonNegativeInteger(scrollOffset), maxScrollOffset));
  const visibleStart = clampedOffset;
  const visibleEnd = Math.min(safeCount, visibleStart + visibleItems);
  const renderStart = Math.max(0, visibleStart - safeOverscan);
  const renderEnd = Math.min(safeCount, visibleEnd + safeOverscan);

  return {
    count: safeCount,
    height: safeHeight,
    itemHeight: safeItemHeight,
    overscan: safeOverscan,
    visibleItems,
    maxScrollOffset,
    scrollOffset: clampedOffset,
    visibleStart,
    visibleEnd,
    renderStart,
    renderEnd
  };
}

export function getVirtualListPruneEvent(count, maxItems) {
  if (maxItems === null || maxItems === undefined) return null;

  const safeCount = toNonNegativeInteger(count);
  const safeMaxItems = toPositiveInteger(maxItems, 1);
  if (safeCount <= safeMaxItems) return null;

  const dropCount = safeCount - safeMaxItems;
  return {
    dropCount,
    keepStart: dropCount,
    count: safeCount,
    maxItems: safeMaxItems
  };
}

export function getVirtualListCompactedScrollOffset(previousWindow, nextCount) {
  const previous = getVirtualListWindow(previousWindow);
  const safeNextCount = toNonNegativeInteger(nextCount);

  if (safeNextCount >= previous.count) {
    return getVirtualListWindow({
      ...previous,
      count: safeNextCount
    }).scrollOffset;
  }

  const droppedCount = previous.count - safeNextCount;
  return getVirtualListWindow({
    ...previous,
    count: safeNextCount,
    scrollOffset: previous.scrollOffset - droppedCount
  }).scrollOffset;
}

export function getVirtualListCountChangeScrollOffset(
  previousWindow,
  nextCount,
  {
    autoScrollToBottom = true,
    pinnedToBottom = false
  } = {}
) {
  const previous = getVirtualListWindow(previousWindow);
  const safeNextCount = toNonNegativeInteger(nextCount);

  if (autoScrollToBottom && pinnedToBottom) {
    return getVirtualListWindow({
      ...previous,
      count: safeNextCount,
      scrollOffset: Number.MAX_SAFE_INTEGER
    }).maxScrollOffset;
  }

  if (safeNextCount < previous.count) {
    return getVirtualListCompactedScrollOffset(previous, safeNextCount);
  }

  return getVirtualListWindow({
    ...previous,
    count: safeNextCount
  }).scrollOffset;
}

export function getVirtualListScrollOffset(windowState, action) {
  const state = getVirtualListWindow(windowState);
  let nextOffset = state.scrollOffset;

  if (action === KEY_UP || action === 'wheel_up') {
    nextOffset -= 1;
  } else if (action === KEY_DOWN || action === 'wheel_down') {
    nextOffset += 1;
  } else if (action === KEY_PAGEUP) {
    nextOffset -= state.visibleItems;
  } else if (action === KEY_PAGEDOWN) {
    nextOffset += state.visibleItems;
  } else if (action === KEY_HOME) {
    nextOffset = 0;
  } else if (action === KEY_END) {
    nextOffset = state.maxScrollOffset;
  }

  return getVirtualListWindow({
    ...state,
    scrollOffset: nextOffset
  }).scrollOffset;
}

export function pruneVirtualListCache(itemCache, windowState, maxSize) {
  if (!itemCache || itemCache.size <= maxSize) return;

  const state = getVirtualListWindow(windowState);
  const center = (state.visibleStart + state.visibleEnd) / 2;
  const keys = Array.from(itemCache.keys())
    .map(index => ({ index, distance: Math.abs(index - center) }))
    .sort((a, b) => b.distance - a.distance);

  while (itemCache.size > maxSize && keys.length > 0) {
    itemCache.delete(keys.shift().index);
  }
}

export default {
  name: 'VirtualList',
  props: {
    ...boxProps,
    count: {
      type: Number,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 1
    },
    height: {
      type: Number,
      required: true
    },
    getItem: {
      type: Function,
      required: true
    },
    keyExtractor: {
      type: Function,
      default: null
    },
    overscan: {
      type: Number,
      default: 3
    },
    cacheBuffer: {
      type: Number,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    color: String,
    bg: String,
    focusColor: {
      type: String,
      default: null
    },
    emptyText: {
      type: String,
      default: '(empty list)'
    },
    loadingText: {
      type: String,
      default: 'Loading...'
    },
    autoScrollToBottom: {
      type: Boolean,
      default: true
    },
    maxItems: {
      type: Number,
      default: null
    }
  },
  emits: ['scroll', 'focus', 'blur', 'prune'],
  setup(props, { slots, emit }) {
    const inputManager = inject(VUETTY_INPUT_MANAGER_KEY, null);
    const vuettyInstance = inject(VUETTY_INSTANCE_KEY, null);
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);
    const theme = inject(VUETTY_THEME_KEY, null);
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);
    const componentId = `virtuallist-${++virtualListIdCounter}`;

    const scrollOffset = ref(0);
    const cacheVersion = ref(0);
    const lastPruneCount = ref(0);
    const pinnedToBottom = ref(true);
    const itemCache = new Map();
    const pendingItems = new Map();

    const windowState = computed(() => getVirtualListWindow({
      count: props.count,
      height: props.height,
      itemHeight: props.itemHeight,
      scrollOffset: scrollOffset.value,
      overscan: props.overscan
    }));

    const isFocused = computed(() => {
      return inputManager && inputManager.isFocused(componentId);
    });

    function getCacheLimit() {
      const state = windowState.value;
      const buffer = props.cacheBuffer === null || props.cacheBuffer === undefined
        ? state.overscan * 2
        : toNonNegativeInteger(props.cacheBuffer);

      return Math.max(1, state.visibleItems + (state.overscan * 2) + buffer);
    }

    function pruneCache() {
      pruneVirtualListCache(itemCache, windowState.value, getCacheLimit());
      pruneVirtualListCache(pendingItems, windowState.value, getCacheLimit());
    }

    function clearLoadedItems() {
      itemCache.clear();
      pendingItems.clear();
      cacheVersion.value++;
    }

    function maybeEmitPrune(count) {
      const event = getVirtualListPruneEvent(count, props.maxItems);
      if (!event) {
        lastPruneCount.value = 0;
        return;
      }

      if (lastPruneCount.value === event.count) return;
      lastPruneCount.value = event.count;
      emit('prune', event);
    }

    function storeItem(index, item) {
      itemCache.set(index, item);
      pruneCache();
      cacheVersion.value++;
    }

    function ensureItem(index) {
      if (itemCache.has(index) || pendingItems.has(index)) return;

      let value;
      try {
        value = props.getItem(index);
      } catch (error) {
        storeItem(index, {
          error,
          label: error?.message || String(error)
        });
        return;
      }

      if (isPromiseLike(value)) {
        pendingItems.set(index, value);
        value
          .then(item => {
            if (pendingItems.get(index) !== value) return;
            pendingItems.delete(index);
            storeItem(index, item);
          })
          .catch(error => {
            if (pendingItems.get(index) !== value) return;
            pendingItems.delete(index);
            storeItem(index, {
              error,
              label: error?.message || String(error)
            });
          });
        return;
      }

      storeItem(index, value);
    }

    function ensureWindowItems() {
      const state = windowState.value;
      for (let index = state.renderStart; index < state.renderEnd; index++) {
        ensureItem(index);
      }
      pruneCache();
    }

    function setScrollOffset(nextOffset) {
      const state = getVirtualListWindow({
        count: props.count,
        height: props.height,
        itemHeight: props.itemHeight,
        scrollOffset: nextOffset,
        overscan: props.overscan
      });

      pinnedToBottom.value = state.scrollOffset >= state.maxScrollOffset;

      if (scrollOffset.value === state.scrollOffset) return false;
      scrollOffset.value = state.scrollOffset;
      emit('scroll', {
        scrollOffset: state.scrollOffset,
        visibleStart: state.visibleStart,
        visibleEnd: state.visibleEnd,
        renderStart: state.renderStart,
        renderEnd: state.renderEnd
      });
      return true;
    }

    function handleKey(parsedKey) {
      if (props.disabled) return false;

      const nextOffset = getVirtualListScrollOffset(windowState.value, parsedKey.key);
      if (nextOffset !== windowState.value.scrollOffset) {
        return setScrollOffset(nextOffset);
      }

      return false;
    }

    function handleMouse(mouseEvent) {
      if (props.disabled) return false;
      if (inputManager) inputManager.focus(componentId);

      if (mouseEvent.action === 'wheel_up') {
        setScrollOffset(getVirtualListScrollOffset(windowState.value, 'wheel_up'));
        return true;
      }
      if (mouseEvent.action === 'wheel_down') {
        setScrollOffset(getVirtualListScrollOffset(windowState.value, 'wheel_down'));
        return true;
      }

      return mouseEvent.action === 'left_click';
    }

    function registerComponent() {
      if (inputManager) {
        inputManager.registerComponent(componentId, handleKey, {
          disabled: props.disabled
        });
      }
      if (vuettyInstance) {
        vuettyInstance.registerClickHandler(componentId, handleMouse);
      }
    }

    function unregisterComponent() {
      if (inputManager) {
        inputManager.unregisterComponent(componentId);
      }
      if (vuettyInstance) {
        vuettyInstance.unregisterClickHandler(componentId);
      }
    }

    watch(windowState, () => {
      if (scrollOffset.value !== windowState.value.scrollOffset) {
        scrollOffset.value = windowState.value.scrollOffset;
        pinnedToBottom.value = windowState.value.scrollOffset >= windowState.value.maxScrollOffset;
      }
      ensureWindowItems();
    }, { immediate: true });

    watch(() => props.count, (newCount, oldCount) => {
      if (oldCount !== undefined) {
        const previous = getVirtualListWindow({
          count: oldCount,
          height: props.height,
          itemHeight: props.itemHeight,
          scrollOffset: scrollOffset.value,
          overscan: props.overscan
        });
        const nextOffset = getVirtualListCountChangeScrollOffset(previous, newCount, {
          autoScrollToBottom: props.autoScrollToBottom,
          pinnedToBottom: pinnedToBottom.value
        });

        if (newCount < oldCount) {
          clearLoadedItems();
        }

        if (nextOffset !== windowState.value.scrollOffset) {
          setScrollOffset(nextOffset);
        }

        if (newCount < oldCount) {
          ensureWindowItems();
        }
      }

      maybeEmitPrune(newCount);
    }, { immediate: true });

    watch(() => props.maxItems, () => {
      maybeEmitPrune(props.count);
    });

    watch([() => props.height, () => props.itemHeight], () => {
      if (props.autoScrollToBottom && pinnedToBottom.value) {
        setScrollOffset(getVirtualListWindow({
          count: props.count,
          height: props.height,
          itemHeight: props.itemHeight,
          scrollOffset: Number.MAX_SAFE_INTEGER,
          overscan: props.overscan
        }).maxScrollOffset);
      }
    });

    watch(() => props.getItem, () => {
      clearLoadedItems();
      ensureWindowItems();
    });

    watch(() => props.disabled, (disabled) => {
      if (inputManager) inputManager.setComponentDisabled(componentId, disabled);
    });

    watch(isFocused, (newVal, oldVal) => {
      if (newVal && !oldVal) emit('focus');
      if (!newVal && oldVal) emit('blur');
    });

    registerComponent();

    onUnmounted(() => {
      unregisterComponent();
      itemCache.clear();
      pendingItems.clear();
    });

    return () => {
      const state = windowState.value;
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;
      const effectiveFocusColor = props.focusColor || theme?.components?.virtualList?.focusColor || 'cyan';
      const effectiveColor = props.color || theme?.components?.virtualList?.color;
      const effectiveBg = props.bg !== undefined ? props.bg : theme?.components?.virtualList?.bg;
      const currentCacheVersion = cacheVersion.value;
      const viewportVersion = viewportState ? viewportState.version : 0;
      const keyExtractor = props.keyExtractor || defaultKeyExtractor;

      const children = [];
      for (let index = state.renderStart; index < state.renderEnd; index++) {
        const hasItem = itemCache.has(index);
        const item = hasItem ? itemCache.get(index) : null;
        const loading = !hasItem;
        const slotProps = {
          item,
          index,
          loading,
          error: item?.error || null
        };
        const childContent = slots.default
          ? slots.default(slotProps)
          : [h('textbox', {
              color: loading ? 'gray' : effectiveColor,
              dim: loading
            }, loading ? props.loadingText : String(item?.label ?? item ?? ''))];
        const itemKey = loading ? index : keyExtractor(item, index);

        children.push(h('col', {
          key: itemKey,
          height: state.itemHeight,
          _virtualIndex: index
        }, childContent));
      }

      return h('virtuallist', {
        ...props,
        _componentId: componentId,
        _clickable: true,
        _injectedWidth: injectedWidth,
        _viewportVersion: viewportVersion,
        _cacheVersion: currentCacheVersion,
        scrollOffset: state.scrollOffset,
        visibleStart: state.visibleStart,
        visibleEnd: state.visibleEnd,
        renderStart: state.renderStart,
        renderEnd: state.renderEnd,
        visibleItems: state.visibleItems,
        maxScrollOffset: state.maxScrollOffset,
        isFocused: isFocused.value,
        focusColor: effectiveFocusColor,
        color: effectiveColor,
        bg: effectiveBg
      }, children);
    };
  }
};

export function renderVirtualList(props, children = [], renderChild = null) {
  const {
    count = 0,
    height = 1,
    itemHeight = 1,
    scrollOffset = 0,
    overscan = 3,
    emptyText = '(empty list)',
    isFocused = false,
    disabled = false,
    focusColor = 'cyan'
  } = props;

  const state = getVirtualListWindow({ count, height, itemHeight, scrollOffset, overscan });
  const lines = [];

  if (state.count === 0) {
    return adjustToHeight(applyStyles(emptyText, props), state.height);
  }

  let yOffset = 0;
  for (const child of children) {
    const childIndex = child.props?._virtualIndex;
    if (childIndex < state.visibleStart || childIndex >= state.visibleEnd) {
      continue;
    }

    const rendered = renderChild ? renderChild(child, yOffset) : String(child);
    const adjusted = adjustToHeight(rendered, state.itemHeight);
    lines.push(adjusted);
    yOffset += state.itemHeight;
  }

  let output = lines.join('\n');
  output = adjustToHeight(output, state.height);

  if (isFocused && !disabled && focusColor) {
    output = applyStyles(output, { color: focusColor });
  } else {
    output = applyStyles(output, props);
  }

  return output;
}

class VirtualListRenderHandler extends RenderHandler {
  render(ctx) {
    return renderVirtualList(ctx.props, ctx.children, (child, yOffset) => {
      return ctx.renderChild(child, { yOffset });
    });
  }
}

renderHandlerRegistry.register('virtuallist', new VirtualListRenderHandler());
