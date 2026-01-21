/**
 * Tests for layoutCache.js
 * Focuses on metrics caching, LRU eviction, and weak map behavior
 */

import { test, expect, describe, beforeEach } from 'bun:test';
import { LayoutCache, layoutCache } from '../../src/core/layoutCache.js';
import { TUINode } from '../../src/core/node.js';

describe('LayoutCache', () => {
  let cache;

  beforeEach(() => {
    // Create fresh instance for each test to avoid singleton state pollution
    cache = new LayoutCache({ textCacheSize: 10 });
  });

  describe('textMeasurementCache', () => {
    test('stores and retrieves measurements', () => {
      cache.setMeasurement('text', 10);
      expect(cache.measureText('text')).toBe(10);
      expect(cache.hasMeasurement('text')).toBe(true);
    });

    test('returns null for missing keys', () => {
      expect(cache.measureText('missing')).toBe(null);
    });

    test('evicts oldest entries when size exceeded', () => {
      // Size limit is 10 (set in beforeEach)
      for (let i = 0; i < 15; i++) {
        cache.setMeasurement(`key${i}`, i);
      }

      // Should have evicted 0-4 (5 items), keeping 5-14 (10 items)
      expect(cache.measureText('key0')).toBe(null);
      expect(cache.measureText('key14')).toBe(14);
      expect(cache.getStats().textMeasurements).toBe(10);
    });

    test('updates existing key moves it to end (LRU)', () => {
      // Fill cache to limit
      for (let i = 0; i < 10; i++) {
        cache.setMeasurement(`key${i}`, i);
      }

      // Access key0 (making it most recently used)
      cache.measureText('key0');

      // Add one more
      cache.setMeasurement('new', 99);

      // key1 should be evicted (oldest), key0 should stay
      expect(cache.measureText('key1')).toBe(null);
      expect(cache.measureText('key0')).toBe(0);
    });
  });

  describe('layoutMetricsCache', () => {
    test('stores metrics for a node', () => {
      const node = new TUINode('test');
      const metrics = { width: 100, height: 50 };

      cache.setLayoutMetrics(node, 'key1', metrics);

      expect(cache.getLayoutMetrics(node, 'key1')).toBe(metrics);
    });

    test('returns null if node not found', () => {
      const node = new TUINode('test');
      expect(cache.getLayoutMetrics(node, 'key1')).toBe(null);
    });

    test('returns null if key not found for node', () => {
      const node = new TUINode('test');
      cache.setLayoutMetrics(node, 'key1', {});
      expect(cache.getLayoutMetrics(node, 'key2')).toBe(null);
    });

    test('limits metrics per node (MAX_METRICS_PER_NODE)', () => {
      // MAX_METRICS_PER_NODE is 3 (defined in source)
      const node = new TUINode('test');

      cache.setLayoutMetrics(node, '1', { v: 1 });
      cache.setLayoutMetrics(node, '2', { v: 2 });
      cache.setLayoutMetrics(node, '3', { v: 3 });

      expect(cache.getLayoutMetrics(node, '1')).not.toBe(null);

      // Add 4th metric, should evict '1'
      cache.setLayoutMetrics(node, '4', { v: 4 });

      expect(cache.getLayoutMetrics(node, '1')).toBe(null);
      expect(cache.getLayoutMetrics(node, '4')).not.toBe(null);
    });

    test('invalidates metrics for a node', () => {
      const node = new TUINode('test');
      cache.setLayoutMetrics(node, 'key1', {});

      expect(cache.getLayoutMetrics(node, 'key1')).not.toBe(null);

      cache.invalidateLayoutMetrics(node);

      expect(cache.getLayoutMetrics(node, 'key1')).toBe(null);
    });

    test('tracks entry count correctly', () => {
      const node1 = new TUINode('1');
      const node2 = new TUINode('2');

      cache.setLayoutMetrics(node1, 'k1', {}); // +1
      cache.setLayoutMetrics(node1, 'k2', {}); // +1
      cache.setLayoutMetrics(node2, 'k1', {}); // +1

      expect(cache.getStats().metricsEntries).toBe(3);

      cache.invalidateLayoutMetrics(node1); // -2

      expect(cache.getStats().metricsEntries).toBe(1);
    });
  });

  describe('clearAll', () => {
    test('clears text cache and resets counters', () => {
      const node = new TUINode('test');
      cache.setMeasurement('text', 10);
      cache.setLayoutMetrics(node, 'key', {});

      cache.clearAll();

      // Text cache should be cleared
      expect(cache.measureText('text')).toBe(null);

      // Metrics count should be reset
      expect(cache.getStats().metricsEntries).toBe(0);
      expect(cache.getStats().textMeasurements).toBe(0);

      // Note: Layout metrics in WeakMap persist if node is still referenced
      // This is expected behavior as per implementation
      expect(cache.getLayoutMetrics(node, 'key')).not.toBe(null);
    });
  });

  describe('singleton export', () => {
    test('exports a singleton instance', () => {
      expect(layoutCache).toBeInstanceOf(LayoutCache);
    });
  });
});
