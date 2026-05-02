import { describe, expect, mock, test } from 'bun:test';
import { h } from 'vue';
import { TUINode } from '../../src/core/node.js';
import { createTUIRenderer } from '../../src/core/renderer.js';
import VirtualList, {
  getVirtualListCountChangeScrollOffset,
  getVirtualListCompactedScrollOffset,
  getVirtualListWindow,
  getVirtualListScrollOffset,
  getVirtualListPruneEvent,
  pruneVirtualListCache,
  renderVirtualList
} from '../../src/components/VirtualList.js';
import {
  KEY_DOWN,
  KEY_END,
  KEY_HOME,
  KEY_PAGEDOWN,
  KEY_PAGEUP
} from '../../src/utils/keyParser.js';
import { stripAnsi } from '../helpers/test-utils.js';

async function flushRender() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function createRenderer() {
  const root = new TUINode('root');
  const onUpdate = mock(() => {});
  const renderer = createTUIRenderer({
    rootContainer: root,
    onUpdate
  });

  return { root, onUpdate, renderer };
}

function latestOutput(onUpdate) {
  return stripAnsi(onUpdate.mock.calls.at(-1)?.[0] || '');
}

describe('VirtualList component', () => {
  test('getVirtualListWindow computes visible and overscan ranges', () => {
    expect(getVirtualListWindow({
      count: 100,
      height: 5,
      itemHeight: 1,
      scrollOffset: 10,
      overscan: 2
    })).toMatchObject({
      visibleItems: 5,
      maxScrollOffset: 95,
      scrollOffset: 10,
      visibleStart: 10,
      visibleEnd: 15,
      renderStart: 8,
      renderEnd: 17
    });
  });

  test('renderVirtualList renders only visible children, not overscan children', () => {
    const children = Array.from({ length: 5 }, (_, index) => ({
      props: { _virtualIndex: index }
    }));

    const result = renderVirtualList(
      { count: 10, height: 3, itemHeight: 1, scrollOffset: 1, overscan: 2 },
      children,
      child => `Item ${child.props._virtualIndex}`
    );

    expect(stripAnsi(result)).toBe('Item 1\nItem 2\nItem 3');
  });

  test('renders only the lazy window and does not refetch cached items', async () => {
    const { renderer, root, onUpdate } = createRenderer();
    const getItem = mock(index => ({ id: index, label: `Item ${index}` }));

    renderer.render(h(VirtualList, {
      count: 100,
      height: 3,
      getItem,
      overscan: 2
    }, {
      default: ({ item, index, loading }) => h('textbox', null, loading ? 'Loading' : `${index}:${item.label}`)
    }), root);
    await flushRender();

    expect(getItem).toHaveBeenCalledTimes(5);
    expect(getItem.mock.calls.map(call => call[0])).toEqual([0, 1, 2, 3, 4]);
    expect(latestOutput(onUpdate)).toContain('0:Item 0');
    expect(latestOutput(onUpdate)).toContain('2:Item 2');
    expect(latestOutput(onUpdate)).not.toContain('3:Item 3');

    renderer.render(h(VirtualList, {
      count: 100,
      height: 3,
      getItem,
      overscan: 2
    }, {
      default: ({ item, index, loading }) => h('textbox', null, loading ? 'Loading' : `${index}:${item.label}`)
    }), root);
    await flushRender();

    expect(getItem).toHaveBeenCalledTimes(5);
  });

  test('keyboard navigation offsets clamp to the virtual bounds', () => {
    const state = {
      count: 10,
      height: 3,
      itemHeight: 1,
      overscan: 1
    };

    expect(getVirtualListScrollOffset({ ...state, scrollOffset: 0 }, KEY_PAGEDOWN)).toBe(3);
    expect(getVirtualListScrollOffset({ ...state, scrollOffset: 3 }, KEY_PAGEUP)).toBe(0);
    expect(getVirtualListScrollOffset({ ...state, scrollOffset: 0 }, KEY_END)).toBe(7);
    expect(getVirtualListScrollOffset({ ...state, scrollOffset: 7 }, KEY_DOWN)).toBe(7);
    expect(getVirtualListScrollOffset({ ...state, scrollOffset: 7 }, KEY_HOME)).toBe(0);
    expect(getVirtualListScrollOffset({ ...state, scrollOffset: 0 }, KEY_PAGEUP)).toBe(0);
  });

  test('async getItem renders loading state and then resolved item', async () => {
    const { renderer, root, onUpdate } = createRenderer();
    let resolveFirst;
    const getItem = mock(index => {
      if (index === 0) {
        return new Promise(resolve => {
          resolveFirst = resolve;
        });
      }
      return { id: index, label: `Item ${index}` };
    });

    renderer.render(h(VirtualList, {
      count: 2,
      height: 1,
      getItem,
      overscan: 0
    }, {
      default: ({ item, loading }) => h('textbox', null, loading ? 'Loading...' : item.label)
    }), root);
    await flushRender();

    expect(latestOutput(onUpdate)).toContain('Loading...');

    resolveFirst({ id: 0, label: 'Resolved' });
    await flushRender();

    expect(latestOutput(onUpdate)).toContain('Resolved');
  });

  test('cache eviction keeps entries closest to the current window', () => {
    const cache = new Map(Array.from({ length: 10 }, (_, index) => [index, `Item ${index}`]));

    pruneVirtualListCache(cache, {
      count: 10,
      height: 2,
      itemHeight: 1,
      scrollOffset: 4,
      overscan: 1
    }, 4);

    expect(cache.size).toBe(4);
    expect(Array.from(cache.keys()).sort((a, b) => a - b)).toEqual([4, 5, 6, 7]);
  });

  test('cache eviction also bounds pending async requests', () => {
    const pending = new Map(Array.from({ length: 10 }, (_, index) => [index, Promise.resolve(index)]));

    pruneVirtualListCache(pending, {
      count: 10,
      height: 2,
      itemHeight: 1,
      scrollOffset: 7,
      overscan: 1
    }, 3);

    expect(pending.size).toBe(3);
    expect(Array.from(pending.keys()).sort((a, b) => a - b)).toEqual([7, 8, 9]);
  });

  test('mouse wheel actions use local virtual offsets', () => {
    const state = {
      count: 5,
      height: 2,
      itemHeight: 1,
      overscan: 0
    };

    expect(getVirtualListScrollOffset({ ...state, scrollOffset: 0 }, 'wheel_down')).toBe(1);
    expect(getVirtualListScrollOffset({ ...state, scrollOffset: 1 }, 'wheel_up')).toBe(0);
    expect(getVirtualListScrollOffset({ ...state, scrollOffset: 3 }, 'wheel_down')).toBe(3);
  });

  test('auto-scrolls when count grows while the list is already at bottom', async () => {
    const { renderer, root, onUpdate } = createRenderer();
    const getItem = index => ({ id: index, label: `Item ${index}` });
    const slot = {
      default: ({ item, index, loading }) => h('textbox', null, loading ? 'Loading' : `${index}:${item.label}`)
    };

    renderer.render(h(VirtualList, {
      count: 2,
      height: 2,
      getItem,
      overscan: 0
    }, slot), root);
    await flushRender();

    expect(latestOutput(onUpdate)).toContain('0:Item 0');
    expect(latestOutput(onUpdate)).toContain('1:Item 1');

    renderer.render(h(VirtualList, {
      count: 3,
      height: 2,
      getItem,
      overscan: 0
    }, slot), root);
    await flushRender();

    expect(latestOutput(onUpdate)).not.toContain('0:Item 0');
    expect(latestOutput(onUpdate)).toContain('1:Item 1');
    expect(latestOutput(onUpdate)).toContain('2:Item 2');
  });

  test('count change helper only follows new items while pinned to bottom', () => {
    expect(getVirtualListCountChangeScrollOffset({
      count: 10,
      height: 3,
      itemHeight: 1,
      scrollOffset: 7,
      overscan: 0
    }, 11, {
      autoScrollToBottom: true,
      pinnedToBottom: true
    })).toBe(8);

    expect(getVirtualListCountChangeScrollOffset({
      count: 10,
      height: 3,
      itemHeight: 1,
      scrollOffset: 2,
      overscan: 0
    }, 11, {
      autoScrollToBottom: true,
      pinnedToBottom: false
    })).toBe(2);

    expect(getVirtualListCountChangeScrollOffset({
      count: 10,
      height: 3,
      itemHeight: 1,
      scrollOffset: 7,
      overscan: 0
    }, 11, {
      autoScrollToBottom: false,
      pinnedToBottom: true
    })).toBe(7);
  });

  test('prune event helper asks callers to drop source items over maxItems', () => {
    expect(getVirtualListPruneEvent(80, 80)).toBe(null);
    expect(getVirtualListPruneEvent(83, 80)).toEqual({
      dropCount: 3,
      keepStart: 3,
      count: 83,
      maxItems: 80
    });
  });

  test('compacted scroll offset preserves the viewed anchor until it reaches the top', () => {
    const state = {
      count: 80,
      height: 12,
      itemHeight: 1,
      overscan: 4
    };

    expect(getVirtualListCompactedScrollOffset({ ...state, scrollOffset: 30 }, 70)).toBe(20);
    expect(getVirtualListCompactedScrollOffset({ ...state, scrollOffset: 5 }, 70)).toBe(0);
    expect(getVirtualListCompactedScrollOffset({ ...state, scrollOffset: 68 }, 79)).toBe(67);
  });

  test('count change helper resumes bottom follow when explicitly pinned again', () => {
    const state = {
      count: 40,
      height: 12,
      itemHeight: 1,
      overscan: 4,
      scrollOffset: 27
    };

    expect(getVirtualListCountChangeScrollOffset(state, 41, {
      autoScrollToBottom: true,
      pinnedToBottom: false
    })).toBe(27);

    expect(getVirtualListCountChangeScrollOffset(state, 41, {
      autoScrollToBottom: true,
      pinnedToBottom: true
    })).toBe(29);
  });

  test('clears cached index mappings when count shrinks after source pruning', async () => {
    const { renderer, root, onUpdate } = createRenderer();
    let source = [
      { id: 0, label: 'Item 0' },
      { id: 1, label: 'Item 1' },
      { id: 2, label: 'Item 2' }
    ];
    const getItem = index => source[index];
    const slot = {
      default: ({ item, loading }) => h('textbox', null, loading ? 'Loading' : item.label)
    };

    renderer.render(h(VirtualList, {
      count: source.length,
      height: 2,
      getItem,
      overscan: 0
    }, slot), root);
    await flushRender();

    expect(latestOutput(onUpdate)).toContain('Item 0');
    expect(latestOutput(onUpdate)).toContain('Item 1');

    source = source.slice(1);
    renderer.render(h(VirtualList, {
      count: source.length,
      height: 2,
      getItem,
      overscan: 0
    }, slot), root);
    await flushRender();

    expect(latestOutput(onUpdate)).not.toContain('Item 0');
    expect(latestOutput(onUpdate)).toContain('Item 1');
    expect(latestOutput(onUpdate)).toContain('Item 2');
  });
});
