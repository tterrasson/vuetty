// src/utils/lruCache.js

/**
 * Lightweight LRU (Least Recently Used) Cache implementation
 *
 * Automatically evicts least recently used entries when size limit is reached.
 * Uses JavaScript Map which maintains insertion order for efficient LRU tracking.
 *
 * @example
 * const cache = new LRUCache(3);
 * cache.set('a', 1);
 * cache.set('b', 2);
 * cache.set('c', 3);
 * cache.set('d', 4); // 'a' is evicted (least recently used)
 *
 * @example
 * const cache = new LRUCache(2);
 * cache.set('x', 10);
 * cache.set('y', 20);
 * cache.get('x'); // Moves 'x' to most recently used
 * cache.set('z', 30); // 'y' is evicted (not 'x')
 */
export class LRUCache {
  /**
   * Create a new LRU Cache
   * @param {number} maxSize - Maximum number of entries to store
   */
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {*} The cached value, or null if not found
   */
  get(key) {
    if (!this.cache.has(key)) return null;

    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  set(key, value) {
    // Remove if exists (will re-add at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Check size limit and evict oldest if needed
    if (this.cache.size >= this.maxSize) {
      // First entry is least recently used
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  /**
   * Check if a key exists in the cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get the current size of the cache
   * @returns {number} Number of entries in cache
   */
  get size() {
    return this.cache.size;
  }
}
