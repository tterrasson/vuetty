/**
 * Tests for BigText cache statistics (must reflect actual cache config)
 */

import { describe, expect, test } from 'bun:test';
import { initializeCacheConfig } from '../../src/core/cacheConfig.js';

// Configure custom cache sizes BEFORE importing BigText
// so the caches are created with these limits
initializeCacheConfig({
  components: {
    bigText: { figlet: 7, final: 9 }
  }
});

const { getBigTextCacheStats, clearBigTextCache } = await import('../../src/components/BigText.js');

describe('BigText cache stats', () => {
  test('reports maxSize matching the configured cache sizes', () => {
    const stats = getBigTextCacheStats();

    expect(stats.figlet.maxSize).toBe(7);
    expect(stats.final.maxSize).toBe(9);
  });

  test('clearBigTextCache empties both caches', () => {
    clearBigTextCache();
    const stats = getBigTextCacheStats();

    expect(stats.figlet.size).toBe(0);
    expect(stats.final.size).toBe(0);
  });
});
