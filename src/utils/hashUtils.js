// src/utils/hashUtils.js
/**
 * FNV-1a hash algorithm
 *
 * @see https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
 */

import { LAYOUT_AFFECTING_PROPS } from '@core/layoutPropRegistry.js';

const FNV_OFFSET_BASIS = 2166136261; // FNV-1a 32-bit offset basis
const FNV_PRIME = 16777619; // FNV-1a 32-bit prime

// Maximum depth for content hash recursion (prevents stack overflow on deep trees)
const MAX_HASH_DEPTH = 10;
// Maximum children to hash per node (prevents O(n) explosion on wide trees)
const MAX_CHILDREN_TO_HASH = 20;

/**
 * Generate a simple hash of the node tree content for cache invalidation
 * This ensures layout is recalculated when text content changes
 *
 * Uses FNV-1a utilities for consistency
 * Only hashes layout-affecting props
 * Limits recursion depth and children count to prevent explosion
 *
 * @param {TUINode} node - Root node to hash
 * @param {number} depth - Current recursion depth
 * @returns {number} Hash number representing the content
 */
export function generateContentHash(node, depth = 0) {
  if (!node) return 0;

  let hash = FNV_OFFSET_BASIS;

  // Hash type (full string for type - they're short)
  const type = node.type || '';
  for (let i = 0; i < type.length; i++) {
    hash ^= type.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }

  // Hash text content (first 50 chars + length for speed)
  const text = node.text;
  if (text) {
    // Include length for uniqueness
    hash ^= text.length;
    hash = Math.imul(hash, FNV_PRIME);

    // Hash first 50 chars
    const textLen = Math.min(text.length, 50);
    for (let i = 0; i < textLen; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, FNV_PRIME);
    }
  }

  // Hash ONLY layout-affecting props
  const props = node.props;
  if (props) {
    for (const key of LAYOUT_AFFECTING_PROPS) {
      const value = props[key];
      if (value !== undefined) {
        if (typeof value === 'number') {
          hash ^= (value | 0);
          hash = Math.imul(hash, FNV_PRIME);
        } else if (typeof value === 'boolean') {
          hash ^= value ? 1 : 0;
          hash = Math.imul(hash, FNV_PRIME);
        } else if (typeof value === 'string') {
          // Hash short strings inline, longer ones sampled
          const strLen = Math.min(value.length, 30);
          for (let i = 0; i < strLen; i++) {
            hash ^= value.charCodeAt(i);
            hash = Math.imul(hash, FNV_PRIME);
          }
        } else if (Array.isArray(value)) {
          hash ^= value.length;
          hash = Math.imul(hash, FNV_PRIME);
        }
      }
    }
  }

  // Recursively hash children (with depth limit)
  const children = node.children;
  if (children && children.length > 0 && depth < MAX_HASH_DEPTH) {
    hash ^= children.length;
    hash = Math.imul(hash, FNV_PRIME);

    // Limit number of children to hash (sample first, middle, last for large lists)
    const childCount = children.length;
    if (childCount <= MAX_CHILDREN_TO_HASH) {
      for (let i = 0; i < childCount; i++) {
        const childHash = generateContentHash(children[i], depth + 1);
        hash ^= childHash;
        hash = Math.imul(hash, FNV_PRIME);
      }
    } else {
      // Sample children: first 5, middle 5, last 5, plus total count
      const sampleIndices = [
        0, 1, 2, 3, 4, // first 5
        Math.floor(childCount / 2) - 2,
        Math.floor(childCount / 2) - 1,
        Math.floor(childCount / 2),
        Math.floor(childCount / 2) + 1,
        Math.floor(childCount / 2) + 2, // middle 5
        childCount - 5, childCount - 4, childCount - 3, childCount - 2, childCount - 1 // last 5
      ];

      for (const idx of sampleIndices) {
        if (idx >= 0 && idx < childCount) {
          const childHash = generateContentHash(children[idx], depth + 1);
          hash ^= childHash;
          hash = Math.imul(hash, FNV_PRIME);
        }
      }
    }
  } else if (children && children.length > 0) {
    // At max depth, just hash child count
    hash ^= children.length;
    hash = Math.imul(hash, FNV_PRIME);
  }

  return hash >>> 0; // Ensure unsigned 32-bit
}

/**
 * Hash a string using FNV-1a algorithm (32-bit)
 *
 * @param {string} str - String to hash
 * @param {number} maxLen - Maximum length to hash (for performance). Default: Infinity for full string.
 * @returns {number} Unsigned 32-bit hash
 */
export function hashString(str, maxLen = Infinity) {
  if (!str) return 0;

  let hash = FNV_OFFSET_BASIS;
  const len = maxLen === Infinity ? str.length : Math.min(str.length, maxLen);

  // Unrolled loop for better performance on short strings
  let i = 0;
  const len4 = len - 3;

  // Process 4 chars at a time
  while (i < len4) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
    hash ^= str.charCodeAt(i + 1);
    hash = Math.imul(hash, FNV_PRIME);
    hash ^= str.charCodeAt(i + 2);
    hash = Math.imul(hash, FNV_PRIME);
    hash ^= str.charCodeAt(i + 3);
    hash = Math.imul(hash, FNV_PRIME);
    i += 4;
  }

  // Handle remaining chars
  while (i < len) {
    hash ^= str.charCodeAt(i++);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return hash >>> 0; // Ensure unsigned 32-bit
}

/**
 * Hash a number into existing hash state
 * Use for combining multiple values into one hash
 *
 * @param {number} num - Number to hash
 * @param {number} currentHash - Current hash state
 * @returns {number} Updated hash (unsigned 32-bit)
 */
export function hashNumber(num, currentHash = FNV_OFFSET_BASIS) {
  let hash = currentHash;
  hash ^= (num | 0);
  hash = Math.imul(hash, FNV_PRIME);
  return hash >>> 0;
}

/**
 * Hash a boolean into existing hash state
 *
 * @param {boolean} bool - Boolean to hash
 * @param {number} currentHash - Current hash state
 * @returns {number} Updated hash
 */
export function hashBoolean(bool, currentHash = FNV_OFFSET_BASIS) {
  let hash = currentHash;
  hash ^= bool ? 1 : 0;
  hash = Math.imul(hash, FNV_PRIME);
  return hash >>> 0;
}

/**
 * Combine two hashes
 *
 * @param {number} hash1 - First hash
 * @param {number} hash2 - Second hash
 * @returns {number} Combined hash
 */
export function combineHashes(hash1, hash2) {
  let hash = hash1;
  hash ^= hash2;
  hash = Math.imul(hash, FNV_PRIME);
  return hash >>> 0;
}

/**
 * Create a cache key from content hash and optional width
 * Common pattern: combine content hash with width for layout caching
 *
 * @param {string} content - Content to hash
 * @param {number|string|null} width - Width value (optional)
 * @param {number} maxLen - Maximum content length to hash
 * @returns {string} Cache key in format "hash:width" or "hash:auto"
 */
export function createCacheKey(content, width = null, maxLen = Infinity) {
  const contentHash = hashString(content, maxLen);
  const widthStr = width !== null && width !== undefined ? String(width) : 'auto';
  return `${contentHash}:${widthStr}`;
}

/**
 * Fast content hash including length for additional uniqueness
 * Uses sampling for very large strings to maintain performance
 *
 * @param {string} str - String to hash
 * @param {number} sampleSize - Number of chars to sample for large strings
 * @returns {string} Hash in format "hash_length"
 */
export function hashWithLength(str, sampleSize = 1000) {
  if (!str) return '0_0';

  const len = str.length;
  let hash = FNV_OFFSET_BASIS;

  if (len <= sampleSize) {
    // Small string - hash everything
    for (let i = 0; i < len; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, FNV_PRIME);
    }
  } else {
    // Large string - sample evenly
    const step = Math.floor(len / sampleSize);
    for (let i = 0; i < len; i += step) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, FNV_PRIME);
    }
    // Always include last char for better uniqueness
    hash ^= str.charCodeAt(len - 1);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return `${hash >>> 0}_${len}`;
}

/**
 * Create a hash state object for incremental hashing
 * Useful when building hash from multiple sources
 *
 * Usage:
 *   const state = createHashState();
 *   state.addString('hello');
 *   state.addNumber(42);
 *   const hash = state.finish();
 */
export function createHashState() {
  let hash = FNV_OFFSET_BASIS;

  return {
    addString(str, maxLen = Infinity) {
      if (!str) return this;
      const len = maxLen === Infinity ? str.length : Math.min(str.length, maxLen);
      for (let i = 0; i < len; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, FNV_PRIME);
      }
      return this;
    },

    addNumber(num) {
      hash ^= (num | 0);
      hash = Math.imul(hash, FNV_PRIME);
      return this;
    },

    addBoolean(bool) {
      hash ^= bool ? 1 : 0;
      hash = Math.imul(hash, FNV_PRIME);
      return this;
    },

    addHash(otherHash) {
      hash ^= otherHash;
      hash = Math.imul(hash, FNV_PRIME);
      return this;
    },

    finish() {
      return hash >>> 0;
    },

    reset() {
      hash = FNV_OFFSET_BASIS;
      return this;
    }
  };
}

export { FNV_OFFSET_BASIS, FNV_PRIME };
