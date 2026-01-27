// src/core/cacheConfig.js
/**
 * Global Cache Configuration Module
 *
 * This module manages cache sizes for all caching systems in vuetty.
 * It must be initialized before any cache-using modules are imported.
 *
 * Configuration is global and shared across all Vuetty instances.
 * The last instance to call initializeCacheConfig() determines the cache sizes.
 */

let cacheConfig = null;

/**
 * Initialize cache configuration with user options
 * @param {Object} options - Cache configuration options
 * @returns {Object} The initialized cache configuration
 */
export function initializeCacheConfig(options = {}) {
  cacheConfig = {
    layout: {
      textMeasurement: 5000,
      metricsPerNode: 3,
      ...options.layout
    },
    line: {
      width: 2000,
      truncateBuckets: 5,
      truncatePerBucket: 500,
      ...options.line
    },
    effects: {
      results: 100,
      parsedColors: 50,
      colorArrays: 20,
      ...options.effects
    },
    components: {
      markdown: {
        tokens: 5,
        maxTokens: 500,
        styles: 30,
        ...options.components?.markdown
      },
      bigText: {
        figlet: 50,
        final: 100,
        ...options.components?.bigText
      },
      image: {
        rendered: 10,
        ...options.components?.image
      },
      box: {
        bufferPool: 20,
        ...options.components?.box
      }
    }
  };

  return cacheConfig;
}

/**
 * Get the current cache configuration
 * If not initialized, returns default configuration
 * @returns {Object} Cache configuration object
 */
export function getCacheConfig() {
  if (!cacheConfig) {
    // Lazy initialization with defaults
    return initializeCacheConfig({});
  }
  return cacheConfig;
}

/**
 * Reset cache configuration to null
 * Useful for testing to ensure clean state
 */
export function resetCacheConfig() {
  cacheConfig = null;
}
