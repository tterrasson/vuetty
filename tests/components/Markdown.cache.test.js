/**
 * Tests for Markdown component caching
 */

import { test, expect, describe, beforeEach } from 'bun:test';
import Markdown, { clearMarkdownCaches, getMarkdownCacheStats } from '../../src/components/Markdown.js';

describe('Markdown Component Caching', () => {
  beforeEach(() => {
    clearMarkdownCaches();
  });

  test('caches parsed tokens', () => {
    // Setup returns the render function
    const component = Markdown.setup({ content: '# Hello' });

    // First render populates cache
    component();

    const stats = getMarkdownCacheStats();
    expect(stats.tokenCacheSize).toBe(1);

    // Create NEW component with SAME content
    const component2 = Markdown.setup({ content: '# Hello' });
    component2();

    // Cache size should still be 1 (reused entry)
    expect(getMarkdownCacheStats().tokenCacheSize).toBe(1);
  });

  test('clearMarkdownCaches resets cache', () => {
    const component = Markdown.setup({ content: 'Test' });
    component();

    expect(getMarkdownCacheStats().tokenCacheSize).toBeGreaterThan(0);

    clearMarkdownCaches();

    expect(getMarkdownCacheStats().tokenCacheSize).toBe(0);
  });
});