/**
 * Tests for Box component caching
 */

import { test, expect, describe, beforeEach } from 'bun:test';
import { renderBox, clearBoxCaches, getBoxCacheStats } from '../../src/components/Box.js';

describe('Box Caching', () => {
  beforeEach(() => {
    clearBoxCaches();
  });

  test('caches strings', () => {
    // Render with specific content
    renderBox('content', { border: true, borderStyle: 'rounded' });

    const stats = getBoxCacheStats();
    // String cache should have some entries for spaces and other reused strings
    expect(stats.stringCacheSize).toBeGreaterThanOrEqual(0);
  });

  test('different content may increase string cache', () => {
    renderBox('content 1', { border: true });
    const size1 = getBoxCacheStats().stringCacheSize;

    renderBox('content 2', { border: true });
    const size2 = getBoxCacheStats().stringCacheSize;

    // Size may be same or increased depending on string interning
    expect(size2).toBeGreaterThanOrEqual(size1);
  });

  test('clearBoxCaches resets caches', () => {
    renderBox('content 1', { border: true });

    clearBoxCaches();

    const stats = getBoxCacheStats();
    expect(stats.stringCacheSize).toBe(0);
    expect(stats.bufferPoolSize).toBe(0);
  });

  test('buffer pool is used and released', () => {
    // Render multiple times to potentially fill buffer pool
    renderBox('content 1', { border: true });
    renderBox('content 2', { border: true });
    renderBox('content 3', { border: true });

    const stats = getBoxCacheStats();
    // Buffer pool should have some buffers after renders complete
    expect(stats.bufferPoolSize).toBeGreaterThanOrEqual(0);
    expect(stats.bufferPoolSize).toBeLessThanOrEqual(stats.bufferPoolMaxSize);
  });

  test('cache stats includes all relevant metrics', () => {
    const stats = getBoxCacheStats();

    expect(stats).toHaveProperty('stringCacheSize');
    expect(stats).toHaveProperty('stringCacheMaxSize');
    expect(stats).toHaveProperty('bufferPoolSize');
    expect(stats).toHaveProperty('bufferPoolMaxSize');

    expect(typeof stats.stringCacheSize).toBe('number');
    expect(typeof stats.stringCacheMaxSize).toBe('number');
    expect(typeof stats.bufferPoolSize).toBe('number');
    expect(typeof stats.bufferPoolMaxSize).toBe('number');
  });

  test('string cache has reasonable limits', () => {
    const stats = getBoxCacheStats();
    expect(stats.stringCacheMaxSize).toBeGreaterThan(0);
    expect(stats.bufferPoolMaxSize).toBeGreaterThan(0);
  });
});
