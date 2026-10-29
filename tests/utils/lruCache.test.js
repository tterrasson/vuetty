/**
 * Unit tests for LRUCache (utils scope)
 */

import { test, expect, describe } from 'bun:test';
import { LRUCache } from '../../src/utils/lruCache.js';

describe('LRUCache', () => {
  test('evicts least recently used entry at capacity', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a'); // 'a' becomes most recently used
    cache.set('c', 3); // should evict 'b'

    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeNull();
    expect(cache.get('c')).toBe(3);
  });

  test('re-setting an existing key refreshes recency without eviction', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('a', 10); // refresh 'a'
    cache.set('c', 3);  // evicts 'b'

    expect(cache.get('a')).toBe(10);
    expect(cache.get('b')).toBeNull();
  });

  test('capacity 1 stores exactly one entry', () => {
    const cache = new LRUCache(1);
    cache.set('a', 1);
    expect(cache.size).toBe(1);
    cache.set('b', 2);
    expect(cache.size).toBe(1);
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBe(2);
  });

  test('capacity 0 stores nothing', () => {
    const cache = new LRUCache(0);
    cache.set('a', 1);
    expect(cache.size).toBe(0); // pre-fix: size was 1
    expect(cache.get('a')).toBeNull();
  });

  test('negative capacity stores nothing', () => {
    const cache = new LRUCache(-5);
    cache.set('a', 1);
    expect(cache.size).toBe(0);
    expect(cache.get('a')).toBeNull();
  });

  test('get returns null for missing keys', () => {
    const cache = new LRUCache(3);
    expect(cache.get('nope')).toBeNull();
  });

  test('clear resets the cache', () => {
    const cache = new LRUCache(3);
    cache.set('a', 1);
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.has('a')).toBe(false);
  });
});
