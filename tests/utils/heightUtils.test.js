/**
 * Edge-case regression tests for heightUtils (utils scope)
 */

import { test, expect, describe } from 'bun:test';
import { adjustToHeight, calculateTextHeight, calculateBigTextHeight } from '../../src/utils/heightUtils.js';

describe('adjustToHeight edge cases', () => {
  test('returns empty string for empty output or non-positive target', () => {
    expect(adjustToHeight('', 5)).toBe('');
    expect(adjustToHeight('a\nb', 0)).toBe('');
    expect(adjustToHeight('a\nb', -1)).toBe('');
  });

  test('returns output unchanged when height already matches', () => {
    expect(adjustToHeight('a\nb', 2)).toBe('a\nb');
  });

  test('pads short output with empty lines at the bottom', () => {
    expect(adjustToHeight('a', 3)).toBe('a\n\n');
  });

  test('truncates long output keeping the top lines', () => {
    expect(adjustToHeight('a\nb\nc', 2)).toBe('a\nb');
  });
});

describe('calculateTextHeight edge cases', () => {
  test('returns 0 for empty text', () => {
    expect(calculateTextHeight('', 10)).toBe(0);
    expect(calculateTextHeight(null, 10)).toBe(0);
  });

  test('returns at least 1 line for non-positive maxWidth', () => {
    expect(calculateTextHeight('hello', 0)).toBe(1);
    expect(calculateTextHeight('hello', -5)).toBe(1);
  });

  test('counts explicit newlines', () => {
    expect(calculateTextHeight('a\nb\nc', 100)).toBe(3);
  });

  test('counts empty lines between newlines', () => {
    expect(calculateTextHeight('a\n\nb', 100)).toBe(3);
  });

  test('wraps long single-line text by visual width', () => {
    expect(calculateTextHeight('abcdefghij', 4)).toBe(3); // ceil(10/4)
  });

  test('accounts for wide chars by visual width', () => {
    // '日本語' has visual width 6; wrapping at width 2 needs 3 lines
    expect(calculateTextHeight('日本語', 2)).toBe(3);
  });
});

describe('calculateBigTextHeight edge cases', () => {
  test('returns 0 for empty text', () => {
    expect(calculateBigTextHeight('')).toBe(0);
  });

  test('returns at least 1 for non-empty text', () => {
    expect(calculateBigTextHeight('Hi')).toBeGreaterThanOrEqual(1);
  });

  test('falls back gracefully for unknown fonts', () => {
    const height = calculateBigTextHeight('Hi', 'This-Font-Does-NotExist');
    expect(height).toBeGreaterThanOrEqual(1);
  });

  test('caches results (same text+font returns same value)', () => {
    const a = calculateBigTextHeight('CacheMe');
    const b = calculateBigTextHeight('CacheMe');
    expect(a).toBe(b);
  });
});
