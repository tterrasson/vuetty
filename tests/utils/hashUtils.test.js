/**
 * Edge-case regression tests for hashUtils (utils scope)
 */

import { test, expect, describe } from 'bun:test';
import { generateContentHash, hashString, createCacheKey } from '../../src/utils/hashUtils.js';

describe('hashString edge cases', () => {
  test('returns 0 for empty/null/undefined input', () => {
    expect(hashString('')).toBe(0);
    expect(hashString(null)).toBe(0);
    expect(hashString(undefined)).toBe(0);
  });

  test('produces stable unsigned 32-bit hashes', () => {
    const h = hashString('hello world');
    expect(h).toBe(hashString('hello world'));
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xFFFFFFFF);
  });

  test('different strings usually produce different hashes', () => {
    const hashes = new Set(
      ['a', 'b', 'ab', 'ba', 'hello', 'world', 'x'.repeat(100)].map(s => hashString(s))
    );
    expect(hashes.size).toBe(7);
  });

  test('respects maxLen truncation', () => {
    const long = 'abcdefghijklmnopqrstuvwxyz';
    expect(hashString(long, 3)).toBe(hashString('abc'));
  });
});

describe('createCacheKey edge cases', () => {
  test('handles null/undefined width as "auto"', () => {
    expect(createCacheKey('text', null)).toBe(createCacheKey('text', undefined));
    expect(createCacheKey('text', null)).toMatch(/^\d+:auto$/);
  });

  test('different widths produce different keys', () => {
    expect(createCacheKey('text', 10)).not.toBe(createCacheKey('text', 20));
  });

  test('empty content still produces a valid key', () => {
    expect(createCacheKey('', 5)).toBe('0:5');
  });
});

describe('generateContentHash edge cases', () => {
  test('returns 0 for null/undefined node', () => {
    expect(generateContentHash(null)).toBe(0);
    expect(generateContentHash(undefined)).toBe(0);
  });

  test('is deterministic for identical trees', () => {
    const mkNode = () => ({
      type: 'text',
      text: 'hello',
      props: { width: 10, bold: true },
      children: [{ type: 'text', text: 'child' }]
    });
    expect(generateContentHash(mkNode())).toBe(generateContentHash(mkNode()));
  });

  test('changes when layout-affecting props change', () => {
    const base = { type: 'text', props: { width: 10 } };
    const wider = { type: 'text', props: { width: 20 } };
    expect(generateContentHash(base)).not.toBe(generateContentHash(wider));
  });

  test('changes when text content changes', () => {
    const a = { type: 'text', text: 'aaa' };
    const b = { type: 'text', text: 'bbb' };
    expect(generateContentHash(a)).not.toBe(generateContentHash(b));
  });

  test('terminates on deep trees (depth limit)', () => {
    // Build a 100-deep chain: pre-fix this would recurse unbounded
    let node = { type: 'text', text: 'leaf' };
    for (let i = 0; i < 100; i++) {
      node = { type: 'box', children: [node] };
    }
    expect(typeof generateContentHash(node)).toBe('number');
  });

  test('terminates on very wide trees (children sampling)', () => {
    const node = {
      type: 'box',
      children: Array.from({ length: 5000 }, (_, i) => ({ type: 'text', text: `c${i}` }))
    };
    expect(typeof generateContentHash(node)).toBe('number');
  });

  test('cyclic tree does not hang (depth limit guards recursion)', () => {
    const node = { type: 'box', children: [] };
    node.children.push(node);
    expect(typeof generateContentHash(node)).toBe('number');
  });
});
