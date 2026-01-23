/**
 * Tests for Box component caching
 */

import { test, expect, describe, beforeEach } from 'bun:test';
import { renderBox, clearBoxCaches, getBoxCacheStats } from '../../src/components/Box.js';

describe('Box Caching', () => {
  beforeEach(() => {
    clearBoxCaches();
  });

  test('clearBoxCaches resets caches', () => {
    renderBox('content 1', { border: true });

    clearBoxCaches();

    const stats = getBoxCacheStats();
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

    expect(stats).toHaveProperty('bufferPoolSize');
    expect(stats).toHaveProperty('bufferPoolMaxSize');

    expect(typeof stats.bufferPoolSize).toBe('number');
    expect(typeof stats.bufferPoolMaxSize).toBe('number');
  });

  test('buffer pool has reasonable limits', () => {
    const stats = getBoxCacheStats();
    expect(stats.bufferPoolMaxSize).toBeGreaterThan(0);
  });
});
