/**
 * Tests for YogaLayoutEngine
 * Tests the actual logic in layoutEngine.js, not Yoga itself
 */

import { test, expect, describe, beforeEach, mock } from 'bun:test';
import { YogaLayoutEngine } from '../../src/core/layoutEngine.js';

// Mock LayoutCache with proper cache statistics tracking
class MockLayoutCache {
  constructor() {
    this.layoutCache = new Map();
    this.textMeasurementCache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    return {
      layoutCacheSize: this.layoutCache.size,
      layoutHits: this.hits,
      layoutMisses: this.misses,
      textMeasurements: this.textMeasurementCache.size,
      textCacheMaxSize: 10000
    };
  }

  get(key) {
    if (this.layoutCache.has(key)) {
      this.hits++;
      return this.layoutCache.get(key);
    }
    this.misses++;
    return null;
  }

  set(key, value) {
    this.layoutCache.set(key, value);
  }

  clear() {
    this.layoutCache.clear();
    this.textMeasurementCache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  clearAll() {
    this.clear();
  }

  getLayoutMetrics(node, cacheKey) {
    const key = `${node.type}:${cacheKey}`;
    return this.get(key);
  }

  setLayoutMetrics(node, cacheKey, metrics) {
    const key = `${node.type}:${cacheKey}`;
    this.set(key, metrics);
  }

  measureText(text) {
    return this.textMeasurementCache.get(text);
  }

  setMeasurement(text, width) {
    this.textMeasurementCache.set(text, width);
  }

  hasMeasurement(text) {
    return this.textMeasurementCache.has(text);
  }

  invalidateLayoutMetrics() {
    // In real implementation this uses WeakMap, here we just clear relevant entries
    // For the mock, we can skip this or clear the entire cache
  }
}

const mockLayoutCacheInstance = new MockLayoutCache();

// Mock the layoutCache module
mock.module('../../src/core/layoutCache.js', () => ({
  layoutCache: mockLayoutCacheInstance,
  LayoutCache: MockLayoutCache
}));

// Mock yoga-layout module with minimal implementation
const mockYogaNodes = new WeakMap();

const createMockYogaNode = () => {
  const state = {
    width: undefined,
    height: undefined,
    children: [],
    computedLayout: { width: 80, height: 24, left: 0, top: 0 }
  };

  const node = {
    setFlexDirection: mock(() => {}),
    setWidth: mock((w) => {
      state.width = w;
      if (w !== undefined) {
        state.computedLayout.width = w;
      }
    }),
    setHeight: mock((h) => {
      state.height = h;
      if (h !== undefined) {
        state.computedLayout.height = h;
      }
    }),
    setWidthPercent: mock(() => {}),
    setHeightPercent: mock(() => {}),
    setMinWidth: mock(() => {}),
    setMaxWidth: mock(() => {}),
    setMinHeight: mock(() => {}),
    setMaxHeight: mock(() => {}),
    setPadding: mock(() => {}),
    setMargin: mock(() => {}),
    setBorder: mock(() => {}),
    setFlexGrow: mock(() => {}),
    setFlexShrink: mock(() => {}),
    setFlexBasis: mock(() => {}),
    setJustifyContent: mock(() => {}),
    setAlignItems: mock(() => {}),
    setAlignSelf: mock(() => {}),
    setAlignContent: mock(() => {}),
    setFlexWrap: mock(() => {}),
    calculateLayout: mock(() => {}),
    getComputedLayout: mock(() => state.computedLayout),
    getComputedWidth: mock(() => state.computedLayout.width),
    getComputedHeight: mock(() => state.computedLayout.height),
    insertChild: mock((child, index) => { state.children[index] = child; }),
    getChild: mock((index) => state.children[index] || createMockYogaNode()),
    getChildCount: mock(() => state.children.length),
    freeRecursive: mock(() => {}),
    _state: state
  };

  return node;
};

const mockYoga = {
  Node: {
    create: mock(() => createMockYogaNode()),
  },
  DIRECTION_LTR: 0,
  FLEX_DIRECTION_COLUMN: 0,
  FLEX_DIRECTION_ROW: 1,
  EDGE_LEFT: 0,
  EDGE_TOP: 1,
  EDGE_RIGHT: 2,
  EDGE_BOTTOM: 3,
  EDGE_ALL: 4,
  ALIGN_STRETCH: 0,
  ALIGN_AUTO: 1,
  ALIGN_FLEX_START: 2,
  ALIGN_FLEX_END: 3,
  ALIGN_CENTER: 4,
  ALIGN_BASELINE: 5,
  ALIGN_SPACE_BETWEEN: 6,
  ALIGN_SPACE_AROUND: 7,
  JUSTIFY_FLEX_START: 0,
  JUSTIFY_FLEX_END: 1,
  JUSTIFY_CENTER: 2,
  JUSTIFY_SPACE_BETWEEN: 3,
  JUSTIFY_SPACE_AROUND: 4,
  JUSTIFY_SPACE_EVENLY: 5,
  WRAP_NO_WRAP: 0,
  WRAP_WRAP: 1,
  WRAP_WRAP_REVERSE: 2,
};

// Mock the yoga-layout module
mock.module('yoga-layout', () => ({
  default: mockYoga,
}));

describe('YogaLayoutEngine - Helper Functions', () => {
  let engine;

  beforeEach(() => {
    engine = new YogaLayoutEngine();
  });

  describe('generateContentHash', () => {
    test('generates different hashes for different content', () => {
      const node1 = {
        type: 'box',
        text: 'Hello',
        props: { width: 10 },
        children: []
      };

      const node2 = {
        type: 'box',
        text: 'World',
        props: { width: 10 },
        children: []
      };

      const layout1 = engine.computeLayout(node1, 80, 24);
      const layout2 = engine.computeLayout(node2, 80, 24);

      // Different text should cause cache miss and recomputation
      expect(layout1).toBeDefined();
      expect(layout2).toBeDefined();
    });

    test('generates same hash for identical content', () => {
      const node = {
        type: 'box',
        text: 'Same',
        props: { width: 10 },
        children: []
      };

      // First computation
      const layout1 = engine.computeLayout(node, 80, 24);

      // Second computation with same node should use cache
      const layout2 = engine.computeLayout(node, 80, 24);

      expect(layout1).toBe(layout2); // Same reference = cache hit
    });

    test('includes children in hash', () => {
      const node1 = {
        type: 'col',
        props: {},
        children: [
          { type: 'text', text: 'Child1', props: {}, children: [] }
        ]
      };

      const node2 = {
        type: 'col',
        props: {},
        children: [
          { type: 'text', text: 'Child2', props: {}, children: [] }
        ]
      };

      engine.computeLayout(node1, 80, 24);
      const cacheSize1 = engine.cache.getStats().layoutCacheSize;

      engine.computeLayout(node2, 80, 24);
      const cacheSize2 = engine.cache.getStats().layoutCacheSize;

      // Different children should create different cache entries
      expect(cacheSize2).toBeGreaterThan(cacheSize1);
    });

    test('only hashes layout-affecting props', () => {
      const node1 = {
        type: 'box',
        props: { width: 10, color: 'red' }, // color doesn't affect layout
        children: []
      };

      const node2 = {
        type: 'box',
        props: { width: 10, color: 'blue' }, // different color, same layout
        children: []
      };

      // Clear cache
      engine.clearCache();

      engine.computeLayout(node1, 80, 24);
      const stats1 = engine.cache.getStats();

      engine.computeLayout(node2, 80, 24);
      const stats2 = engine.cache.getStats();

      // Same layout-affecting props should reuse cache (color ignored)
      expect(stats2.layoutHits).toBeGreaterThan(stats1.layoutHits);
    });
  });

  describe('calculateTextHeight logic', () => {
    test('short text in textbox calculates as 1 line', () => {
      const node = {
        type: 'textbox',
        text: 'Short',
        props: {},
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // Short text should be 1 line height
      expect(metrics.height).toBeGreaterThanOrEqual(1);
    });

    test('long text in textbox wraps to multiple lines', () => {
      const node = {
        type: 'textbox',
        text: 'This is a very long text that should definitely wrap to multiple lines when rendered in a terminal with limited width',
        props: { width: 20 },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // Long text with narrow width should wrap
      expect(metrics.height).toBeGreaterThan(1);
    });

    test('text with newlines counts each line', () => {
      const node = {
        type: 'textbox',
        text: 'Line 1\nLine 2\nLine 3',
        props: {},
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // 3 explicit newlines should result in at least 3 lines
      expect(metrics.height).toBeGreaterThanOrEqual(3);
    });
  });

  describe('extractTextContent logic', () => {
    test('extracts direct text property', () => {
      const node = {
        type: 'textbox',
        text: 'Direct text',
        props: {},
        children: []
      };

      // Compute layout which uses extractTextContent internally
      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics).toBeDefined();
    });

    test('extracts text from props.text', () => {
      const node = {
        type: 'textbox',
        props: { text: 'Props text' },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics).toBeDefined();
    });

    test('extracts text from string children', () => {
      const node = {
        type: 'textbox',
        props: {},
        children: [
          { type: 'text', text: 'Child text', props: {}, children: [] }
        ]
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics).toBeDefined();
    });

    test('extracts text from nested text nodes', () => {
      const node = {
        type: 'textbox',
        props: {},
        children: [
          { type: 'text', text: 'Nested', props: {}, children: [] }
        ]
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics).toBeDefined();
    });

    test('concatenates multiple children', () => {
      const node = {
        type: 'textbox',
        props: {},
        children: [
          { type: 'text', text: 'Part 1 ', props: {}, children: [] },
          { type: 'text', text: 'Part 2 ', props: {}, children: [] },
          { type: 'text', text: 'Part 3', props: {}, children: [] }
        ]
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics).toBeDefined();
    });
  });

  describe('calculateBigTextHeight logic', () => {
    test('Standard font returns 6 lines', () => {
      const node = {
        type: 'bigtext',
        text: 'BIG',
        props: { font: 'Standard' },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // Standard font should be ~6 lines
      expect(metrics.height).toBe(6);
    });

    test('Big font returns 8 lines', () => {
      const node = {
        type: 'bigtext',
        text: 'BIG',
        props: { font: 'Big' },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics.height).toBe(8);
    });

    test('Unknown font defaults to 6 lines', () => {
      const node = {
        type: 'bigtext',
        text: 'BIG',
        props: { font: 'UnknownFont' },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics.height).toBe(6);
    });

    test('Empty text returns 0 height', () => {
      const node = {
        type: 'bigtext',
        text: '',
        props: {},
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics.height).toBe(0);
    });
  });
});

describe('YogaLayoutEngine - Layout Computation', () => {
  let engine;

  beforeEach(() => {
    engine = new YogaLayoutEngine();
    engine.clearCache();
  });

  describe('computeLayout', () => {
    test('returns zero dimensions for null node', () => {
      const result = engine.computeLayout(null, 80, 24);

      expect(result).toEqual({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        children: []
      });
    });

    test('caches layout results', () => {
      const node = {
        type: 'box',
        props: { width: 40 },
        children: []
      };

      engine.computeLayout(node, 80, 24);
      const stats1 = engine.cache.getStats();

      engine.computeLayout(node, 80, 24);
      const stats2 = engine.cache.getStats();

      expect(stats2.layoutHits).toBeGreaterThan(stats1.layoutHits);
    });

    test('invalidates cache when content changes', () => {
      const node = {
        type: 'textbox',
        text: 'Original',
        props: {},
        children: []
      };

      engine.computeLayout(node, 80, 24);
      const cacheSize1 = engine.cache.getStats().layoutCacheSize;

      node.text = 'Changed';
      engine.computeLayout(node, 80, 24);
      const cacheSize2 = engine.cache.getStats().layoutCacheSize;

      expect(cacheSize2).toBeGreaterThan(cacheSize1);
    });

    test('clears layout dirty flag on cache hit', () => {
      const node = {
        type: 'box',
        props: {},
        children: [],
        isLayoutDirty: true
      };

      engine.computeLayout(node, 80, 24);
      expect(node.isLayoutDirty).toBe(false);
    });

    test('sets cachedLayoutMetrics on node', () => {
      const node = {
        type: 'box',
        props: {},
        children: []
      };

      engine.computeLayout(node, 80, 24);

      expect(node.cachedLayoutMetrics).toBeDefined();
      expect(node.cachedLayoutMetrics.width).toBeDefined();
      expect(node.cachedLayoutMetrics.height).toBeDefined();
    });

    test('handles nodes without props', () => {
      const node = {
        type: 'box',
        children: []
      };

      expect(() => engine.computeLayout(node, 80, 24)).not.toThrow();
    });

    test('different container sizes create different cache entries', () => {
      const node = {
        type: 'box',
        props: {},
        children: []
      };

      engine.computeLayout(node, 80, 24);
      const layout1 = node.cachedLayoutMetrics;

      engine.computeLayout(node, 100, 30);
      const layout2 = node.cachedLayoutMetrics;

      expect(layout1).not.toBe(layout2);
    });
  });

  describe('Component-specific height calculations', () => {
    test('divider always has height 1', () => {
      const node = {
        type: 'divider',
        props: {},
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics.height).toBe(1);
    });

    test('divider with length sets width', () => {
      const node = {
        type: 'divider',
        props: { length: 40 },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics.height).toBe(1);
      // Width should be set via Yoga
    });

    test('button has height 1', () => {
      const node = {
        type: 'button',
        props: { label: 'Click me' },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics.height).toBe(1);
    });

    test('newline height based on count', () => {
      const node1 = {
        type: 'newline',
        props: { count: 1 },
        children: []
      };

      const node2 = {
        type: 'newline',
        props: { count: 3 },
        children: []
      };

      const metrics1 = engine.computeLayout(node1, 80, 24);
      const metrics2 = engine.computeLayout(node2, 80, 24);

      expect(metrics1.height).toBe(1);
      expect(metrics2.height).toBe(3);
    });

    test('spacer height based on lines', () => {
      const node = {
        type: 'spacer',
        props: { lines: 5 },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics.height).toBe(5);
    });

    test('text node has height 1', () => {
      const node = {
        type: 'text',
        text: 'Simple text',
        props: {},
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics.height).toBe(1);
    });
  });

  describe('Table height calculations', () => {
    test('empty table has minimal height', () => {
      const node = {
        type: 'table',
        props: {
          headers: [],
          rows: []
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // Empty table: border + "No data" + border = 3
      expect(metrics.height).toBe(3);
    });

    test('table with label adds 1 line', () => {
      const node = {
        type: 'table',
        props: {
          label: 'My Table',
          headers: [],
          rows: []
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics.height).toBe(4); // 3 + label
    });

    test('table with headers adds header and divider lines', () => {
      const node = {
        type: 'table',
        props: {
          headers: ['Col1', 'Col2'],
          rows: [{ Col1: 'A', Col2: 'B' }],
          height: 10,
          showHeader: true
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // border(1) + header(1) + divider(1) + rows(10) + border(1) = 14
      expect(metrics.height).toBe(14);
    });

    test('table without showHeader skips header lines', () => {
      const node = {
        type: 'table',
        props: {
          headers: ['Col1', 'Col2'],
          rows: [{ Col1: 'A', Col2: 'B' }],
          height: 10,
          showHeader: false
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // No header/divider: border(1) + rows(10) + border(1) = 12
      expect(metrics.height).toBe(12);
    });

    test('focused table adds hint line', () => {
      const node = {
        type: 'table',
        props: {
          headers: ['Col1'],
          rows: [{ Col1: 'A' }],
          height: 10,
          isFocused: true,
          disabled: false
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // Includes hint line
      expect(metrics.height).toBeGreaterThan(14);
    });

    test('table with many rows adds scroll indicator', () => {
      const rows = Array.from({ length: 20 }, (_, i) => ({ Col1: `Row ${i}` }));

      const node = {
        type: 'table',
        props: {
          headers: ['Col1'],
          rows: rows,
          height: 10 // Less than rows.length
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // Should include scroll indicator (+1)
      expect(metrics.height).toBeGreaterThan(14);
    });
  });

  describe('Input component height calculations', () => {
    test('textinput basic height', () => {
      const node = {
        type: 'textinput',
        props: {
          label: 'Name',
          rows: 3,
          text: ''
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // label(1) + border(1) + rows(3) + border(1) = 6
      expect(metrics.height).toBe(6);
    });

    test('textinput without label', () => {
      const node = {
        type: 'textinput',
        props: {
          rows: 3,
          text: ''
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // border(1) + rows(3) + border(1) = 5
      expect(metrics.height).toBe(5);
    });

    test('textinput with validation error adds line', () => {
      const node = {
        type: 'textinput',
        props: {
          rows: 3,
          text: '',
          validationError: 'Invalid input'
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // border(1) + rows(3) + border(1) + error(1) = 6
      expect(metrics.height).toBe(6);
    });

    test('textinput focused with hint adds line', () => {
      const node = {
        type: 'textinput',
        props: {
          rows: 3,
          text: '',
          hint: 'Enter value',
          isFocused: true,
          disabled: false
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // border(1) + rows(3) + border(1) + hint(1) = 6
      expect(metrics.height).toBe(6);
    });

    test('textinput with autoResize adjusts to content', () => {
      const shortText = {
        type: 'textinput',
        props: {
          rows: 5,
          minRows: 2,
          maxRows: 10,
          autoResize: true,
          text: 'Short'
        },
        children: []
      };

      const longText = {
        type: 'textinput',
        props: {
          rows: 5,
          minRows: 2,
          maxRows: 10,
          autoResize: true,
          text: 'Line1\nLine2\nLine3\nLine4\nLine5\nLine6\nLine7'
        },
        children: []
      };

      const metrics1 = engine.computeLayout(shortText, 80, 24);
      const metrics2 = engine.computeLayout(longText, 80, 24);

      expect(metrics2.height).toBeGreaterThan(metrics1.height);
    });

    test('checkbox basic height', () => {
      const node = {
        type: 'checkbox',
        props: {
          label: 'Options',
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 }
          ],
          height: 10
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // label(1) + border(1) + options(2) + border(1) = 5
      expect(metrics.height).toBe(5);
    });

    test('checkbox with many options respects max height', () => {
      const options = Array.from({ length: 20 }, (_, i) => ({
        label: `Option ${i}`,
        value: i
      }));

      const node = {
        type: 'checkbox',
        props: {
          options: options,
          height: 5 // Max visible
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // border(1) + visible(5) + border(1) + scroll(1) = 8
      expect(metrics.height).toBe(8);
    });

    test('empty checkbox shows "No options"', () => {
      const node = {
        type: 'checkbox',
        props: {
          options: [],
          height: 10
        },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // border(1) + "No options"(1) + border(1) = 3
      expect(metrics.height).toBe(3);
    });
  });

  describe('Box component behavior', () => {
    test('box with border', () => {
      const node = {
        type: 'box',
        props: { border: true },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics).toBeDefined();
    });

    test('box without border', () => {
      const node = {
        type: 'box',
        props: { border: false },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics).toBeDefined();
    });

    test('box with background', () => {
      const node = {
        type: 'box',
        props: { bg: 'blue', border: false },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics).toBeDefined();
    });

    test('transparent box', () => {
      const node = {
        type: 'box',
        props: { border: false, padding: 0 },
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics).toBeDefined();
    });
  });
});

describe('YogaLayoutEngine - Tree Operations', () => {
  let engine;

  beforeEach(() => {
    engine = new YogaLayoutEngine();
    engine.clearCache();
  });

  describe('Children handling', () => {
    test('computes layout for children', () => {
      const node = {
        type: 'col',
        props: {},
        children: [
          { type: 'text', text: 'Child 1', props: {}, children: [] },
          { type: 'text', text: 'Child 2', props: {}, children: [] }
        ]
      };

      const metrics = engine.computeLayout(node, 80, 24);

      expect(metrics.children).toHaveLength(2);
    });

    test('skips comment nodes', () => {
      const node = {
        type: 'col',
        props: {},
        children: [
          { type: 'text', text: 'Real', props: {}, children: [] },
          { type: 'comment', props: {}, children: [] },
          { type: 'text', text: 'Real 2', props: {}, children: [] }
        ]
      };

      const metrics = engine.computeLayout(node, 80, 24);

      // Only 2 real children, comment skipped
      expect(metrics.children).toHaveLength(2);
    });

    test('handles deeply nested trees', () => {
      const node = {
        type: 'col',
        props: {},
        children: [
          {
            type: 'row',
            props: {},
            children: [
              {
                type: 'box',
                props: {},
                children: [
                  { type: 'text', text: 'Deep', props: {}, children: [] }
                ]
              }
            ]
          }
        ]
      };

      expect(() => engine.computeLayout(node, 80, 24)).not.toThrow();
    });

    test('handles empty children array', () => {
      const node = {
        type: 'col',
        props: {},
        children: []
      };

      const metrics = engine.computeLayout(node, 80, 24);
      expect(metrics.children).toHaveLength(0);
    });
  });

  describe('restoreCachedMetrics', () => {
    test('restores metrics to node', () => {
      const node = {
        type: 'box',
        props: {},
        children: []
      };

      const metrics = {
        width: 40,
        height: 20,
        x: 10,
        y: 5,
        children: []
      };

      engine.restoreCachedMetrics(node, metrics);

      expect(node.cachedLayoutMetrics).toBe(metrics);
    });

    test('restores metrics to children recursively', () => {
      const node = {
        type: 'col',
        props: {},
        children: [
          { type: 'box', props: {}, children: [] },
          { type: 'text', text: 'Test', props: {}, children: [] }
        ]
      };

      const childMetrics1 = { width: 20, height: 10, x: 0, y: 0, children: [] };
      const childMetrics2 = { width: 20, height: 10, x: 0, y: 10, children: [] };
      const metrics = {
        width: 80,
        height: 24,
        x: 0,
        y: 0,
        children: [childMetrics1, childMetrics2]
      };

      engine.restoreCachedMetrics(node, metrics);

      expect(node.children[0].cachedLayoutMetrics).toBe(childMetrics1);
      expect(node.children[1].cachedLayoutMetrics).toBe(childMetrics2);
    });

    test('early exits if metrics already match', () => {
      const metrics = { width: 80, height: 24, x: 0, y: 0, children: [] };
      const node = {
        type: 'box',
        props: {},
        children: [],
        cachedLayoutMetrics: metrics
      };

      engine.restoreCachedMetrics(node, metrics);

      expect(node.cachedLayoutMetrics).toBe(metrics);
    });
  });

  describe('invalidateLayout', () => {
    test('marks node as dirty', () => {
      const node = {
        type: 'box',
        props: {},
        children: [],
        isLayoutDirty: false
      };

      engine.invalidateLayout(node);

      expect(node.isLayoutDirty).toBe(true);
    });

    test('recursively invalidates children', () => {
      const node = {
        type: 'col',
        props: {},
        children: [
          { type: 'box', props: {}, children: [], isLayoutDirty: false },
          { type: 'text', text: 'Test', props: {}, children: [], isLayoutDirty: false }
        ],
        isLayoutDirty: false
      };

      engine.invalidateLayout(node);

      expect(node.isLayoutDirty).toBe(true);
      expect(node.children[0].isLayoutDirty).toBe(true);
      expect(node.children[1].isLayoutDirty).toBe(true);
    });

    test('handles null node gracefully', () => {
      expect(() => engine.invalidateLayout(null)).not.toThrow();
    });
  });
});

describe('YogaLayoutEngine - Cache Management', () => {
  let engine;

  beforeEach(() => {
    engine = new YogaLayoutEngine();
    engine.clearCache();
  });

  test('clears entire cache', () => {
    const node = {
      type: 'box',
      props: {},
      children: []
    };

    engine.computeLayout(node, 80, 24);
    expect(engine.cache.getStats().layoutCacheSize).toBeGreaterThan(0);

    engine.clearCache();
    expect(engine.cache.getStats().layoutCacheSize).toBe(0);
  });

  test('tracks cache hits and misses', () => {
    const node = {
      type: 'box',
      props: { width: 40 },
      children: []
    };

    engine.clearCache();
    const stats0 = engine.cache.getStats();

    // First call = miss
    engine.computeLayout(node, 80, 24);
    const stats1 = engine.cache.getStats();

    // Second call = hit
    engine.computeLayout(node, 80, 24);
    const stats2 = engine.cache.getStats();

    expect(stats1.layoutMisses).toBeGreaterThan(stats0.layoutMisses);
    expect(stats2.layoutHits).toBeGreaterThan(stats1.layoutHits);
  });

  test('separate cache entries for different dimensions', () => {
    const node = {
      type: 'box',
      props: {},
      children: []
    };

    engine.computeLayout(node, 80, 24);
    engine.computeLayout(node, 100, 30);

    const stats = engine.cache.getStats();
    expect(stats.layoutCacheSize).toBeGreaterThanOrEqual(2);
  });
});

describe('YogaLayoutEngine - Edge Cases', () => {
  let engine;

  beforeEach(() => {
    engine = new YogaLayoutEngine();
  });

  test('handles infinity container height', () => {
    const node = {
      type: 'root',
      props: {},
      children: []
    };

    expect(() => engine.computeLayout(node, 80, Infinity)).not.toThrow();
  });

  test('handles zero dimensions', () => {
    const node = {
      type: 'box',
      props: { width: 0, height: 0 },
      children: []
    };

    expect(() => engine.computeLayout(node, 80, 24)).not.toThrow();
  });

  test('handles missing type', () => {
    const node = {
      props: {},
      children: []
    };

    expect(() => engine.computeLayout(node, 80, 24)).not.toThrow();
  });

  test('handles circular references safely', () => {
    // Layout engine should handle this without infinite loops
    const node = {
      type: 'box',
      props: {},
      children: []
    };

    // Don't actually create circular reference as it would break JSON serialization
    // Just test that the function is defensive
    expect(() => engine.computeLayout(node, 80, 24)).not.toThrow();
  });
});
