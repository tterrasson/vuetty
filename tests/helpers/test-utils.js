/**
 * Test utilities for Vuetty TUI library
 */

import { TUINode, TextNode } from '../../src/core/node.js';

/**
 * Create a mock TUINode for testing
 */
export function createMockNode(type, props = {}) {
  const node = new TUINode(type);
  node.setProps(props);
  return node;
}

/**
 * Create a mock TextNode for testing
 */
export function createMockTextNode(text) {
  return new TextNode(text);
}

/**
 * Strip ANSI codes from a string for easier testing
 */
export function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Strip all escape sequences (ANSI codes, cursor control, etc.)
 */
export function stripAllEscapeSequences(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[^m]*m|\x1b\[\?[0-9]+[hl]/g, '');
}

/**
 * Create a tree of nodes for testing
 * Example: createNodeTree('root', [createNodeTree('child1'), createNodeTree('child2')])
 */
export function createNodeTree(type, children = [], props = {}) {
  const node = createMockNode(type, props);
  children.forEach(child => node.appendChild(child));
  return node;
}

/**
 * Get the text content of a node tree (depth-first)
 */
export function getNodeTextContent(node) {
  if (node.type === 'text') {
    return node.text;
  }
  return node.children.map(child => getNodeTextContent(child)).join('');
}

/**
 * Count nodes in a tree (including the root)
 */
export function countNodes(node) {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

/**
 * Wait for next tick (useful for testing async operations)
 */
export function nextTick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Mock terminal dimensions
 */
export function setMockTerminalSize(rows, columns) {
  Object.defineProperty(process.stdout, 'rows', {
    value: rows,
    configurable: true,
  });
  Object.defineProperty(process.stdout, 'columns', {
    value: columns,
    configurable: true,
  });
}

/**
 * Get lines from rendered output
 */
export function getLines(output) {
  return output.split('\n');
}

/**
 * Get line count from rendered output
 */
export function getLineCount(output) {
  return output.split('\n').length;
}

/**
 * Extract text content from Vue vnodes recursively
 * Useful for testing components that return vnodes
 */
export function extractVNodeText(vnode) {
  if (!vnode) return '';

  // Handle array of vnodes
  if (Array.isArray(vnode)) {
    return vnode.map(v => extractVNodeText(v)).join('');
  }

  // Handle text nodes
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return String(vnode);
  }

  // Handle vnode with children
  if (vnode.children) {
    // Children can be a string, array, or object with default slot
    if (typeof vnode.children === 'string') {
      return vnode.children;
    }
    if (Array.isArray(vnode.children)) {
      return vnode.children.map(c => extractVNodeText(c)).join('');
    }
    if (typeof vnode.children === 'object' && vnode.children.default) {
      const defaultSlot = vnode.children.default;
      if (typeof defaultSlot === 'function') {
        const slotContent = defaultSlot();
        return extractVNodeText(slotContent);
      }
      return extractVNodeText(defaultSlot);
    }
  }

  return '';
}

/**
 * Count vnodes in a tree (useful for testing component output)
 */
export function countVNodes(vnode) {
  if (!vnode) return 0;

  if (Array.isArray(vnode)) {
    return vnode.reduce((sum, v) => sum + countVNodes(v), 0);
  }

  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return 0;
  }

  let count = 1;

  if (vnode.children) {
    if (Array.isArray(vnode.children)) {
      count += vnode.children.reduce((sum, c) => sum + countVNodes(c), 0);
    } else if (typeof vnode.children === 'object' && vnode.children.default) {
      const defaultSlot = vnode.children.default;
      if (typeof defaultSlot === 'function') {
        count += countVNodes(defaultSlot());
      } else {
        count += countVNodes(defaultSlot);
      }
    }
  }

  return count;
}

/**
 * Get vnode type name (useful for assertions)
 */
export function getVNodeType(vnode) {
  if (!vnode) return null;
  if (typeof vnode === 'string' || typeof vnode === 'number') return 'text';
  if (vnode.type && vnode.type.name) return vnode.type.name;
  if (vnode.type && typeof vnode.type === 'string') return vnode.type;
  return 'unknown';
}

/**
 * Find all vnodes of a specific type in a tree
 */
export function findVNodesByType(vnode, typeName) {
  const results = [];

  function traverse(node) {
    if (!node) return;

    if (Array.isArray(node)) {
      node.forEach(traverse);
      return;
    }

    if (typeof node === 'string' || typeof node === 'number') {
      return;
    }

    if (getVNodeType(node) === typeName) {
      results.push(node);
    }

    if (node.children) {
      if (Array.isArray(node.children)) {
        node.children.forEach(traverse);
      } else if (typeof node.children === 'object' && node.children.default) {
        const defaultSlot = node.children.default;
        if (typeof defaultSlot === 'function') {
          traverse(defaultSlot());
        } else {
          traverse(defaultSlot);
        }
      }
    }
  }

  traverse(vnode);
  return results;
}
