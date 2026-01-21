/**
 * Tests for Render Cache Integration
 */

import { test, expect, describe, beforeEach } from 'bun:test';
import { TUINode } from '../../src/core/node.js';
import { invalidateCache, cacheOutput } from '../../src/core/memoization.js';

describe('Render Cache Integration', () => {
  let root;
  let child;

  beforeEach(() => {
    root = new TUINode('root');
    child = new TUINode('child');
    root.appendChild(child);
  });

  test('invalidateCache(true) clears entire tree cache', () => {
    // Simulate cached state
    cacheOutput(root, 'root output');
    cacheOutput(child, 'child output');

    expect(root.cachedOutput).toBe('root output');
    expect(child.cachedOutput).toBe('child output');

    // Invalidate recursively
    invalidateCache(root, true);

    expect(root.cachedOutput).toBe(null);
    expect(child.cachedOutput).toBe(null);
    expect(root.isDirty).toBe(true);
    expect(child.isDirty).toBe(true);
  });

  test('invalidateCache(false) only clears node cache', () => {
    cacheOutput(root, 'root output');
    cacheOutput(child, 'child output');

    // Invalidate root only
    invalidateCache(root, false);

    expect(root.cachedOutput).toBe(null);
    expect(child.cachedOutput).toBe('child output'); // Should remain
    expect(root.isDirty).toBe(true);
    expect(child.isDirty).toBe(false);
  });
});
