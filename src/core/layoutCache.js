// src/core/layoutCache.js
/**
 * Layout Cache - Caches text measurements and layout metrics
 */

const DEFAULT_TEXT_CACHE_SIZE = 5000;
const MAX_METRICS_PER_NODE = 3;

/**
 * Simple LRU (Least Recently Used) Cache
 */
class LRUCache {
  constructor(maxSize = 5000) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key, value) {
    // Delete if already exists (to reinsert at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, value);

    // Evict oldest entries if size exceeded
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

export class LayoutCache {
  constructor(options = {}) {
    this.textMeasurementCache = new LRUCache(options.textCacheSize || DEFAULT_TEXT_CACHE_SIZE);
    this.layoutMetricsCache = new WeakMap(); // node -> Map<cacheKey, metrics>

    // Track total metrics entries for debugging
    this._metricsEntryCount = 0;
  }

  /**
   * Get cached text width measurement
   */
  measureText(text) {
    return this.textMeasurementCache.get(text);
  }

  /**
   * Set text width measurement in cache
   */
  setMeasurement(text, width) {
    this.textMeasurementCache.set(text, width);
  }

  /**
   * Check if text measurement is cached
   */
  hasMeasurement(text) {
    return this.textMeasurementCache.has(text);
  }

  /**
   * Get cached layout metrics for a node
   * @param {TUINode} node - Node to get metrics for
   * @param {string} cacheKey - Cache key (e.g., "${renderVersion}:${width}:${height}")
   * @returns {object|null} Cached metrics or null
   */
  getLayoutMetrics(node, cacheKey) {
    if (!this.layoutMetricsCache.has(node)) {
      return null;
    }

    const nodeCache = this.layoutMetricsCache.get(node);
    return nodeCache.get(cacheKey) || null;
  }

  /**
   * Set layout metrics for a node
   * @param {TUINode} node - Node to cache metrics for
   * @param {string} cacheKey - Cache key
   * @param {object} metrics - Layout metrics to cache
   */
  setLayoutMetrics(node, cacheKey, metrics) {
    if (!this.layoutMetricsCache.has(node)) {
      this.layoutMetricsCache.set(node, new Map());
    }

    const nodeCache = this.layoutMetricsCache.get(node);

    // Track entry count (only if new entry)
    if (!nodeCache.has(cacheKey)) {
      this._metricsEntryCount++;
    }

    nodeCache.set(cacheKey, metrics);

    // Most nodes only need 1-2 cache entries (current and previous state)
    if (nodeCache.size > MAX_METRICS_PER_NODE) {
      const firstKey = nodeCache.keys().next().value;
      nodeCache.delete(firstKey);
      this._metricsEntryCount--;
    }
  }

  /**
   * Invalidate layout metrics for a node
   */
  invalidateLayoutMetrics(node) {
    if (this.layoutMetricsCache.has(node)) {
      const nodeCache = this.layoutMetricsCache.get(node);
      this._metricsEntryCount -= nodeCache.size;
      this.layoutMetricsCache.delete(node);
    }
  }

  /**
   * Clear all caches
   */
  clearAll() {
    this.textMeasurementCache.clear();
    this._metricsEntryCount = 0;
    // WeakMap entries will be garbage collected when nodes are released
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      textMeasurements: this.textMeasurementCache.size,
      textCacheMaxSize: this.textMeasurementCache.maxSize,
      metricsEntries: this._metricsEntryCount,
      metricsMaxPerNode: MAX_METRICS_PER_NODE
    };
  }
}

// Export singleton instance
export const layoutCache = new LayoutCache();