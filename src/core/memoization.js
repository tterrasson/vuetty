// src/core/memoization.js
/**
 * Memoization utilities for component rendering
 * Enables skipping render of unchanged subtrees via dirty flags
 */

/**
 * Check if a node can skip rendering
 */
export function canSkipRender(node) {
  if (!node) return false;
  return !node.isDirty && !node.childrenDirty && node.cachedOutput !== null;
}

/**
 * Render children with caching - avoids re-joining if unchanged
 */
export function renderChildrenCached(node, renderChildFn) {
  if (!node.children || node.children.length === 0) {
    return '';
  }

  // Fast path: no children dirty and cache exists
  if (!node.childrenDirty && node.cachedChildrenOutput !== null) {
    return node.cachedChildrenOutput;
  }

  const children = node.children;
  const len = children.length;
  const outputs = new Array(len);
  let anyChanged = false;

  for (let i = 0; i < len; i++) {
    const child = children[i];
    const prevOutput = child.cachedOutput;
    outputs[i] = renderChildFn(child);
    if (outputs[i] !== prevOutput) {
      anyChanged = true;
    }
  }

  // Only join if something changed
  if (anyChanged || node.cachedChildrenOutput === null) {
    node.cachedChildrenOutput = outputs.join('');
  }

  node.childrenDirty = false;
  return node.cachedChildrenOutput;
}

/**
 * Cache rendered output for a node
 */
export function cacheOutput(node, output) {
  if (!node) return;
  node.cachedOutput = output;
  node.isDirty = false;
}

/**
 * Mark node dirty and propagate childrenDirty to ancestors
 */
export function markSelfDirty(node) {
  if (!node) return;

  node.isDirty = true;
  node.cachedOutput = null;

  // Propagate childrenDirty up the tree
  let parent = node.parent;
  while (parent) {
    if (parent.childrenDirty) break; // Already flagged
    parent.childrenDirty = true;
    parent.cachedOutput = null;
    parent = parent.parent;
  }
}

/**
 * Invalidate cache for a node
 * Explicitly null out all cached data to help garbage collection
 * OPTIMIZED: Uses iterative approach for recursive mode to avoid stack overflow
 */
export function invalidateCache(node, recursive = false) {
  if (!node) return;

  if (!recursive) {
    // Non-recursive: just invalidate this node
    node.isDirty = true;
    node.childrenDirty = true;
    node.renderVersion++;
    node.cachedOutput = null;
    node.cachedChildrenOutput = null;
    node.cachedLayoutMetrics = null;
    return;
  }

  // Recursive mode: use iterative BFS to avoid stack overflow
  const queue = [node];
  let processed = 0;
  const MAX_NODES = 10000; // Safety limit

  while (queue.length > 0 && processed < MAX_NODES) {
    const current = queue.shift();
    processed++;

    current.isDirty = true;
    current.childrenDirty = true;
    current.renderVersion++;

    // Explicitly null out cached strings to help GC
    current.cachedOutput = null;
    current.cachedChildrenOutput = null;
    current.cachedLayoutMetrics = null;

    const children = current.children;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        queue.push(children[i]);
      }
    }
  }
}

/**
 * Deep invalidate - clears everything including layout
 * Use sparingly as it forces full re-render
 */
export function deepInvalidate(node) {
  if (!node) return;

  node.isDirty = true;
  node.childrenDirty = true;
  node.isLayoutDirty = true;
  node.renderVersion++;
  node.cachedOutput = null;
  node.cachedChildrenOutput = null;
  node.cachedLayoutMetrics = null;

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      deepInvalidate(node.children[i]);
    }
  }
}

/**
 * Layout-affecting prop names
 */
export const LAYOUT_AFFECTING_PROPS = new Set([
  'width', 'height', 'flex', 'flexGrow', 'flexShrink', 'flexBasis',
  'flexDirection', 'gap', 'padding', 'paddingLeft', 'paddingRight',
  'paddingTop', 'paddingBottom', 'margin', 'marginLeft', 'marginRight',
  'marginTop', 'marginBottom', 'border', 'borderStyle', 'rows', 'headers', 'options',
  'showHeader', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'justifyContent', 'alignItems', 'alignSelf', 'alignContent',
  'flexWrap', 'responsive', '_injectedWidth', '_viewportVersion',
  'label', 'hint', 'validationError', 'isFocused', 'disabled',
  'direction', 'autoResize', 'minRows', 'maxRows', 'font', 'length',
  'imageLines', 'count', 'lines', 'text'
]);

/**
 * Check if a prop change affects layout
 */
export function isLayoutAffectingProp(propName) {
  return LAYOUT_AFFECTING_PROPS.has(propName);
}