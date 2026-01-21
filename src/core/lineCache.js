// src/core/lineCache.js

/**
 * Line Cache - Caches terminal width calculations and truncated lines
 * Avoids expensive ANSI parsing on repeated lines
 */

class LineLRUCache {
  constructor(maxSize = 2000) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    const value = this.cache.get(key);
    if (value === undefined) return undefined;

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    this.cache.delete(key);
    this.cache.set(key, value);

    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

// Width cache: line -> width
const widthCache = new LineLRUCache(2000);

// Truncate cache: organized by width buckets
const truncateCacheByWidth = new Map();
const MAX_WIDTH_BUCKETS = 5;
const MAX_ENTRIES_PER_WIDTH = 500;

/**
 * Get cached terminal width for a line
 * @param {string} line - The line to measure
 * @param {Function} getTerminalWidthFn - Function to calculate terminal width
 * @returns {number} Terminal display width
 */
export function getCachedWidth(line, getTerminalWidthFn) {
  let width = widthCache.get(line);
  if (width === undefined) {
    width = getTerminalWidthFn(line);
    widthCache.set(line, width);
  }
  return width;
}

/**
 * Get cached truncated line
 * @param {string} line - The line to truncate
 * @param {number} maxWidth - Maximum width
 * @param {Function} truncateFn - Function to truncate with ANSI support
 * @returns {string} Truncated line
 */
export function getCachedTruncate(line, maxWidth, truncateFn) {
  let cache = truncateCacheByWidth.get(maxWidth);
  if (!cache) {
    // Limit number of width buckets to prevent memory leak
    if (truncateCacheByWidth.size >= MAX_WIDTH_BUCKETS) {
      const firstKey = truncateCacheByWidth.keys().next().value;
      truncateCacheByWidth.delete(firstKey);
    }
    cache = new LineLRUCache(MAX_ENTRIES_PER_WIDTH);
    truncateCacheByWidth.set(maxWidth, cache);
  }

  let result = cache.get(line);
  if (result === undefined) {
    result = truncateFn(line, maxWidth);
    cache.set(line, result);
  }
  return result;
}

/**
 * Process visible lines with caching
 * Truncates lines that exceed maxWidth and pads to full width with background
 *
 * @param {string[]} visibleLines - Lines to process
 * @param {number} maxWidth - Maximum terminal width
 * @param {Function} getTerminalWidthFn - Function to calculate terminal width
 * @param {Function} truncateWithAnsiFn - Function to truncate preserving ANSI codes
 * @param {string|null} bgAnsiCode - Optional ANSI background code to fill line
 * @returns {string[]} Processed lines
 */
export function processVisibleLines(
  visibleLines,
  maxWidth,
  getTerminalWidthFn,
  truncateWithAnsiFn,
  bgAnsiCode = null
) {
  const len = visibleLines.length;
  const result = new Array(len);

  for (let i = 0; i < len; i++) {
    const line = visibleLines[i];
    const width = getCachedWidth(line, getTerminalWidthFn);

    let processedLine;
    if (width > maxWidth) {
      processedLine = getCachedTruncate(line, maxWidth, truncateWithAnsiFn);
    } else {
      processedLine = line;
    }

    // Pad line to full width with background color
    if (bgAnsiCode) {
      const processedWidth = width > maxWidth ? maxWidth : width;
      const padding = Math.max(0, maxWidth - processedWidth);
      // Apply bg, then content, then re-apply bg for padding (handles resets in content)
      result[i] = bgAnsiCode + processedLine + bgAnsiCode + ' '.repeat(padding) + '\x1b[0m';
    } else {
      result[i] = processedLine;
    }
  }

  return result;
}

/**
 * Clear all caches (call on resize)
 */
export function clearLineCaches() {
  widthCache.clear();
  truncateCacheByWidth.clear();
}

/**
 * Get cache stats for debugging
 * @returns {object} Cache statistics
 */
export function getLineCacheStats() {
  let truncateTotal = 0;
  for (const cache of truncateCacheByWidth.values()) {
    truncateTotal += cache.size;
  }
  return {
    widthCacheSize: widthCache.size,
    widthCacheMaxSize: 2000,
    truncateBuckets: truncateCacheByWidth.size,
    truncateBucketsMaxSize: MAX_WIDTH_BUCKETS,
    truncateCacheSize: truncateTotal,
    truncateMaxPerBucket: MAX_ENTRIES_PER_WIDTH,
    maxPossibleMemory: MAX_WIDTH_BUCKETS * MAX_ENTRIES_PER_WIDTH + 2000
  };
}
