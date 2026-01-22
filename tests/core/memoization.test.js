/**
 * Tests for memoization utilities
 */

import { test, expect, describe } from 'bun:test';
import {
  canSkipRender,
  renderChildrenCached,
  cacheOutput,
  markSelfDirty,
  invalidateCache
} from '../../src/core/memoization.js';
import { isLayoutAffectingProp } from '../../src/core/layoutPropRegistry.js';
import { TUINode } from '../../src/core/node.js';

describe('memoization', () => {
  describe('canSkipRender', () => {
    test('returns false for null node', () => {
      expect(canSkipRender(null)).toBe(false);
    });

    test('returns false when node is dirty', () => {
      const node = new TUINode('text');
      node.isDirty = true;
      node.childrenDirty = false;
      node.cachedOutput = 'output';

      expect(canSkipRender(node)).toBe(false);
    });

    test('returns false when children are dirty', () => {
      const node = new TUINode('col');
      node.isDirty = false;
      node.childrenDirty = true;
      node.cachedOutput = 'output';

      expect(canSkipRender(node)).toBe(false);
    });

    test('returns false when no cached output', () => {
      const node = new TUINode('text');
      node.isDirty = false;
      node.childrenDirty = false;
      node.cachedOutput = null;

      expect(canSkipRender(node)).toBe(false);
    });

    test('returns true when clean and cached', () => {
      const node = new TUINode('text');
      node.isDirty = false;
      node.childrenDirty = false;
      node.cachedOutput = 'output';

      expect(canSkipRender(node)).toBe(true);
    });
  });

  describe('renderChildrenCached', () => {
    test('returns empty string for no children', () => {
      const node = new TUINode('col');
      const result = renderChildrenCached(node, () => {});

      expect(result).toBe('');
    });

    test('returns empty string for empty children array', () => {
      const node = new TUINode('col');
      node.children = [];
      const result = renderChildrenCached(node, () => {});

      expect(result).toBe('');
    });

    test('returns cached output when children not dirty', () => {
      const node = new TUINode('col');
      const child = new TUINode('text');
      node.children = [child];
      node.childrenDirty = false;
      node.cachedChildrenOutput = 'cached';

      const result = renderChildrenCached(node, () => 'new');

      expect(result).toBe('cached');
    });

    test('renders children when dirty', () => {
      const node = new TUINode('col');
      const child1 = new TUINode('text');
      const child2 = new TUINode('text');
      node.children = [child1, child2];
      node.childrenDirty = true;

      const result = renderChildrenCached(node, (child) => {
        return child === child1 ? 'A' : 'B';
      });

      expect(result).toBe('AB');
    });

    test('caches rendered output', () => {
      const node = new TUINode('col');
      const child = new TUINode('text');
      node.children = [child];
      node.childrenDirty = true;

      renderChildrenCached(node, () => 'output');

      expect(node.cachedChildrenOutput).toBe('output');
    });

    test('clears childrenDirty flag', () => {
      const node = new TUINode('col');
      const child = new TUINode('text');
      node.children = [child];
      node.childrenDirty = true;

      renderChildrenCached(node, () => 'output');

      expect(node.childrenDirty).toBe(false);
    });

    test('detects when child output changed', () => {
      const node = new TUINode('col');
      const child = new TUINode('text');
      child.cachedOutput = 'old';
      node.children = [child];
      node.childrenDirty = true;

      renderChildrenCached(node, () => 'new');

      expect(node.cachedChildrenOutput).toBe('new');
    });

    test('uses cached output when no changes', () => {
      const node = new TUINode('col');
      const child = new TUINode('text');
      child.cachedOutput = 'same';
      node.children = [child];
      node.childrenDirty = false;
      node.cachedChildrenOutput = 'same';

      const result = renderChildrenCached(node, () => 'same');

      expect(result).toBe('same');
    });
  });

  describe('cacheOutput', () => {
    test('handles null node', () => {
      expect(() => {
        cacheOutput(null, 'output');
      }).not.toThrow();
    });

    test('caches output on node', () => {
      const node = new TUINode('text');
      cacheOutput(node, 'output');

      expect(node.cachedOutput).toBe('output');
    });

    test('clears isDirty flag', () => {
      const node = new TUINode('text');
      node.isDirty = true;
      cacheOutput(node, 'output');

      expect(node.isDirty).toBe(false);
    });

    test('caches empty string', () => {
      const node = new TUINode('text');
      cacheOutput(node, '');

      expect(node.cachedOutput).toBe('');
      expect(node.isDirty).toBe(false);
    });
  });

  describe('markSelfDirty', () => {
    test('handles null node', () => {
      expect(() => {
        markSelfDirty(null);
      }).not.toThrow();
    });

    test('marks node as dirty', () => {
      const node = new TUINode('text');
      node.isDirty = false;
      markSelfDirty(node);

      expect(node.isDirty).toBe(true);
    });

    test('clears cached output', () => {
      const node = new TUINode('text');
      node.cachedOutput = 'cached';
      markSelfDirty(node);

      expect(node.cachedOutput).toBe(null);
    });

    test('propagates childrenDirty to parent', () => {
      const parent = new TUINode('col');
      const child = new TUINode('text');
      parent.appendChild(child);

      markSelfDirty(child);

      expect(parent.childrenDirty).toBe(true);
    });

    test('propagates up to ancestors', () => {
      const grandparent = new TUINode('col');
      const parent = new TUINode('col');
      const child = new TUINode('text');

      grandparent.appendChild(parent);
      parent.appendChild(child);

      markSelfDirty(child);

      expect(parent.childrenDirty).toBe(true);
      expect(grandparent.childrenDirty).toBe(true);
    });

    test('stops propagation if already dirty', () => {
      const grandparent = new TUINode('col');
      const parent = new TUINode('col');
      const child = new TUINode('text');

      grandparent.appendChild(parent);
      parent.appendChild(child);

      parent.childrenDirty = true;

      markSelfDirty(child);

      // Should stop at parent
      expect(parent.childrenDirty).toBe(true);
    });

    test('clears parent cached output', () => {
      const parent = new TUINode('col');
      const child = new TUINode('text');
      parent.appendChild(child);
      parent.cachedOutput = 'cached';
      parent.childrenDirty = false; // Ensure not already dirty

      markSelfDirty(child);

      expect(parent.cachedOutput).toBe(null);
    });
  });

  describe('invalidateCache', () => {
    test('handles null node', () => {
      expect(() => {
        invalidateCache(null);
      }).not.toThrow();
    });

    test('marks node as dirty', () => {
      const node = new TUINode('text');
      node.isDirty = false;
      invalidateCache(node);

      expect(node.isDirty).toBe(true);
    });

    test('marks children as dirty', () => {
      const node = new TUINode('col');
      node.childrenDirty = false;
      invalidateCache(node);

      expect(node.childrenDirty).toBe(true);
    });

    test('increments render version', () => {
      const node = new TUINode('text');
      const oldVersion = node.renderVersion;
      invalidateCache(node);

      expect(node.renderVersion).toBe(oldVersion + 1);
    });

    test('clears cached output', () => {
      const node = new TUINode('text');
      node.cachedOutput = 'cached';
      invalidateCache(node);

      expect(node.cachedOutput).toBe(null);
    });

    test('clears cached children output', () => {
      const node = new TUINode('col');
      node.cachedChildrenOutput = 'cached';
      invalidateCache(node);

      expect(node.cachedChildrenOutput).toBe(null);
    });

    test('does not recurse by default', () => {
      const parent = new TUINode('col');
      const child = new TUINode('text');
      parent.appendChild(child);

      child.isDirty = false;
      invalidateCache(parent, false);

      expect(parent.isDirty).toBe(true);
      expect(child.isDirty).toBe(false);
    });

    test('recursively invalidates children when requested', () => {
      const parent = new TUINode('col');
      const child1 = new TUINode('text');
      const child2 = new TUINode('text');
      parent.appendChild(child1);
      parent.appendChild(child2);

      child1.isDirty = false;
      child2.isDirty = false;

      invalidateCache(parent, true);

      expect(parent.isDirty).toBe(true);
      expect(child1.isDirty).toBe(true);
      expect(child2.isDirty).toBe(true);
    });

    test('recursively invalidates nested children', () => {
      const root = new TUINode('col');
      const parent = new TUINode('col');
      const child = new TUINode('text');

      root.appendChild(parent);
      parent.appendChild(child);

      child.isDirty = false;
      parent.isDirty = false;

      invalidateCache(root, true);

      expect(root.isDirty).toBe(true);
      expect(parent.isDirty).toBe(true);
      expect(child.isDirty).toBe(true);
    });
  });

  describe('isLayoutAffectingProp', () => {
    test('returns true for width', () => {
      expect(isLayoutAffectingProp('width')).toBe(true);
    });

    test('returns true for height', () => {
      expect(isLayoutAffectingProp('height')).toBe(true);
    });

    test('returns true for flex', () => {
      expect(isLayoutAffectingProp('flex')).toBe(true);
    });

    test('returns true for flexGrow', () => {
      expect(isLayoutAffectingProp('flexGrow')).toBe(true);
    });

    test('returns true for flexShrink', () => {
      expect(isLayoutAffectingProp('flexShrink')).toBe(true);
    });

    test('returns true for flexBasis', () => {
      expect(isLayoutAffectingProp('flexBasis')).toBe(true);
    });

    test('returns true for gap', () => {
      expect(isLayoutAffectingProp('gap')).toBe(true);
    });

    test('returns true for padding props', () => {
      expect(isLayoutAffectingProp('padding')).toBe(true);
      expect(isLayoutAffectingProp('paddingLeft')).toBe(true);
      expect(isLayoutAffectingProp('paddingRight')).toBe(true);
      expect(isLayoutAffectingProp('paddingTop')).toBe(true);
      expect(isLayoutAffectingProp('paddingBottom')).toBe(true);
    });

    test('returns true for margin props', () => {
      expect(isLayoutAffectingProp('margin')).toBe(true);
      expect(isLayoutAffectingProp('marginLeft')).toBe(true);
      expect(isLayoutAffectingProp('marginRight')).toBe(true);
      expect(isLayoutAffectingProp('marginTop')).toBe(true);
      expect(isLayoutAffectingProp('marginBottom')).toBe(true);
    });

    test('returns true for border', () => {
      expect(isLayoutAffectingProp('border')).toBe(true);
    });

    test('returns true for borderStyle', () => {
      expect(isLayoutAffectingProp('borderStyle')).toBe(true);
    });

    test('returns true for internal props', () => {
      expect(isLayoutAffectingProp('_viewportVersion')).toBe(true);
      expect(isLayoutAffectingProp('_injectedWidth')).toBe(true);
    });

    test('returns false for color', () => {
      expect(isLayoutAffectingProp('color')).toBe(false);
    });

    test('returns false for bg', () => {
      expect(isLayoutAffectingProp('bg')).toBe(false);
    });

    test('returns false for bold', () => {
      expect(isLayoutAffectingProp('bold')).toBe(false);
    });

    test('returns false for italic', () => {
      expect(isLayoutAffectingProp('italic')).toBe(false);
    });

    test('returns false for unknown props', () => {
      expect(isLayoutAffectingProp('unknown')).toBe(false);
      expect(isLayoutAffectingProp('customProp')).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('handles multiple dirty marks', () => {
      const node = new TUINode('text');
      markSelfDirty(node);
      markSelfDirty(node);
      markSelfDirty(node);

      expect(node.isDirty).toBe(true);
    });

    test('handles cache after invalidate', () => {
      const node = new TUINode('text');
      cacheOutput(node, 'first');
      invalidateCache(node);
      cacheOutput(node, 'second');

      expect(node.cachedOutput).toBe('second');
      expect(node.isDirty).toBe(false);
    });

    test('handles invalidate on node without children', () => {
      const node = new TUINode('text');
      expect(() => {
        invalidateCache(node, true);
      }).not.toThrow();
    });

    test('handles deep propagation chain', () => {
      const root = new TUINode('col');
      let current = root;

      for (let i = 0; i < 10; i++) {
        const child = new TUINode('col');
        current.appendChild(child);
        current = child;
      }

      markSelfDirty(current);

      let parent = current.parent;
      while (parent) {
        expect(parent.childrenDirty).toBe(true);
        parent = parent.parent;
      }
    });
  });
});
