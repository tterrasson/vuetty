/**
 * Tests for shared render helpers
 */

import { test, expect, describe } from 'bun:test';
import {
  padLabelToWidth,
  maxDisplayWidthOf
} from '../../src/components/renderHelpers.js';
import { getTerminalWidth, stripAnsi } from '../../src/utils/renderUtils.js';

describe('padLabelToWidth', () => {
  test('pads ASCII label with spaces', () => {
    const result = padLabelToWidth('abc', 6);
    expect(result).toBe('abc   ');
    expect(getTerminalWidth(result)).toBe(6);
  });

  test('truncates ASCII label that is too long', () => {
    const result = padLabelToWidth('abcdef', 3);
    expect(result).toBe('abc');
    expect(getTerminalWidth(result)).toBe(3);
  });

  test('pads CJK label by display width, not code units', () => {
    const result = padLabelToWidth('日本語', 8);
    expect(getTerminalWidth(result)).toBe(8);
    expect(result.startsWith('日本語')).toBe(true);
  });

  test('truncates CJK label without splitting characters', () => {
    const result = padLabelToWidth('日本語', 4);
    expect(getTerminalWidth(result)).toBe(4);
    expect(result).toBe('日本');
  });

  test('truncates emoji without splitting surrogate pairs', () => {
    const result = padLabelToWidth('😀😀😀', 4);
    expect(getTerminalWidth(result)).toBe(4);
    expect(result).not.toContain('\uFFFD');
    expect(result).toBe('😀😀');
  });

  test('returns empty string for non-positive width', () => {
    expect(padLabelToWidth('abc', 0)).toBe('');
    expect(padLabelToWidth('abc', -2)).toBe('');
  });

  test('handles empty label', () => {
    const result = padLabelToWidth('', 4);
    expect(result).toBe('    ');
  });

  test('preserves ANSI codes when truncating and adds reset', () => {
    const styled = '\x1b[31mabcdef\x1b[0m';
    const result = padLabelToWidth(styled, 3);
    expect(stripAnsi(result)).toBe('abc');
    expect(result).toContain('\x1b[31m');
    expect(result.endsWith('\x1b[0m')).toBe(true);
  });
});

describe('maxDisplayWidthOf', () => {
  test('returns max display width across items', () => {
    const items = ['a', '日本語', 'xyz'];
    expect(maxDisplayWidthOf(items, s => s, 0)).toBe(6);
  });

  test('honors minimum bound for empty list', () => {
    expect(maxDisplayWidthOf([], () => '', 20)).toBe(20);
  });

  test('measures via getter without allocating temp arrays', () => {
    const options = [{ label: 'Option 1' }, { label: 'オプション' }];
    expect(maxDisplayWidthOf(options, o => o.label, 0)).toBe(10);
  });
});
