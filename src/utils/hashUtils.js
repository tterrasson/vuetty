// src/utils/hashUtils.js
/**
 * FNV-1a hash algorithm
 *
 * @see https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
 */

import { LAYOUT_AFFECTING_PROPS_LIST } from '@core/layoutPropRegistry.js';

const FNV_OFFSET_BASIS = 2166136261; // FNV-1a 32-bit offset basis
const FNV_PRIME = 16777619; // FNV-1a 32-bit prime

// Maximum depth for content hash recursion (prevents stack overflow on deep trees)
const MAX_HASH_DEPTH = 10;
// Maximum children to hash per node (prevents O(n) explosion on wide trees)
const MAX_CHILDREN_TO_HASH = 20;

// Memoized FNV-1a hashes for node types: the same handful of short strings
// ('box', 'row', 'col', 'text', ...) are re-hashed for every node on every
// layout pass, so compute each one only once.
const typeHashCache = new Map();

function hashNodeType(type) {
  let hash = typeHashCache.get(type);
  if (hash !== undefined) return hash;

  hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < type.length; i++) {
    hash ^= type.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }

  typeHashCache.set(type, hash);
  return hash;
}

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

  let hash = hashNodeType(node.type || '');

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
    const layoutProps = LAYOUT_AFFECTING_PROPS_LIST;
    const propCount = layoutProps.length;
    for (let p = 0; p < propCount; p++) {
      const key = layoutProps[p];
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
