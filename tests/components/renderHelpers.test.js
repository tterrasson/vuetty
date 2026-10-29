/**
 * Tests for shared render helpers
 */

import { test, expect, describe } from 'bun:test';
import {
  padLabelToWidth,
  maxDisplayWidthOf,
  countLines,
  resolveHintText,
  renderNoDataBox,
  formatScrollIndicator
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

describe('countLines', () => {
  test('counts lines in rendered output', () => {
    expect(countLines('')).toBe(0);
    expect(countLines(null)).toBe(0);
    expect(countLines('single')).toBe(1);
    expect(countLines('a\nb')).toBe(2);
    expect(countLines('a\nb\nc\n')).toBe(4);
  });
});

describe('resolveHintText', () => {
  test('returns default text for "default"', () => {
    expect(resolveHintText('default', 'My hint')).toBe('My hint');
  });

  test('returns empty string for false/null/undefined/empty', () => {
    expect(resolveHintText(false, 'd')).toBe('');
    expect(resolveHintText(null, 'd')).toBe('');
    expect(resolveHintText(undefined, 'd')).toBe('');
    expect(resolveHintText('', 'd')).toBe('');
  });

  test('returns custom hint string as-is', () => {
    expect(resolveHintText('Press Enter', 'd')).toBe('Press Enter');
  });
});

describe('renderNoDataBox', () => {
  test('renders a bordered placeholder box', () => {
    const style = s => `<${s}>`;
    const result = renderNoDataBox(style, 'No data', 5);
    const lines = result.split('\n');

    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe('<┌───────┐>');
    expect(lines[1]).toContain('No data');
    expect(lines[2]).toBe('<└───────┘>');
  });

  test('defaults to "No options" with width 20', () => {
    const result = renderNoDataBox(s => s);
    expect(result).toContain('No options');
    expect(result.split('\n')[0]).toBe('┌' + '─'.repeat(22) + '┐');
  });
});

describe('formatScrollIndicator', () => {
  test('formats percentage and visible range', () => {
    expect(formatScrollIndicator(0, 10, 100)).toBe('[0% - showing 1-10 of 100]');
    expect(formatScrollIndicator(90, 10, 100)).toBe('[100% - showing 91-100 of 100]');
  });

  test('appends unit label when provided', () => {
    expect(formatScrollIndicator(5, 10, 50, 'rows')).toBe('[13% - showing 6-15 of 50 rows]');
  });

  test('handles total smaller than visible count without division issues', () => {
    expect(formatScrollIndicator(0, 10, 5)).toBe('[0% - showing 1-5 of 5]');
  });
});
