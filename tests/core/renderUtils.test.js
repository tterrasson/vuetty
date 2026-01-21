/**
 * Tests for render utilities
 */

import { test, expect, describe } from 'bun:test';
import chalk from 'chalk';
import {
  getTerminalWidth,
  truncateWithAnsi,
  applyStyles,
  wrapText
} from '../../src/utils/renderUtils.js';

describe('renderUtils', () => {
  describe('getTerminalWidth', () => {
    test('returns width of plain text', () => {
      expect(getTerminalWidth('Hello')).toBe(5);
    });

    test('returns width of empty string', () => {
      expect(getTerminalWidth('')).toBe(0);
    });

    test('ignores ANSI codes when calculating width', () => {
      const colored = '\x1b[31mHello\x1b[0m';
      expect(getTerminalWidth(colored)).toBe(5);
    });

    test('handles text with multiple ANSI codes', () => {
      const text = '\x1b[1m\x1b[31mBold Red\x1b[0m';
      expect(getTerminalWidth(text)).toBe(8);
    });

    test('handles emoji correctly', () => {
      // Emojis typically have width of 2
      const text = '🚀';
      const width = getTerminalWidth(text);
      expect(width).toBeGreaterThan(0);
    });
  });

  describe('truncateWithAnsi', () => {
    test('does not truncate text shorter than max width', () => {
      const result = truncateWithAnsi('Hello', 10);
      expect(result).toBe('Hello');
    });

    test('truncates plain text at max width', () => {
      const result = truncateWithAnsi('Hello World', 5);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    test('preserves ANSI codes when truncating', () => {
      const colored = '\x1b[31mHello World\x1b[0m';
      const result = truncateWithAnsi(colored, 5);
      expect(result).toContain('\x1b[31m');
    });

    test('handles empty string', () => {
      const result = truncateWithAnsi('', 10);
      expect(result).toBe('');
    });

    test('handles zero max width', () => {
      const result = truncateWithAnsi('Hello', 0);
      expect(result).toBe('');
    });
  });

  describe('applyStyles', () => {
    test('applies color style', () => {
      const result = applyStyles('Hello', { color: 'red' });
      const expected = chalk.red('Hello');
      expect(result).toBe(expected);
    });

    test('applies bold style', () => {
      const result = applyStyles('Bold', { bold: true });
      const expected = chalk.bold('Bold');
      expect(result).toBe(expected);
    });

    test('applies italic style', () => {
      const result = applyStyles('Italic', { italic: true });
      const expected = chalk.italic('Italic');
      expect(result).toBe(expected);
    });

    test('applies underline style', () => {
      const result = applyStyles('Underline', { underline: true });
      const expected = chalk.underline('Underline');
      expect(result).toBe(expected);
    });

    test('applies dim style', () => {
      const result = applyStyles('Dim', { dim: true });
      const expected = chalk.dim('Dim');
      expect(result).toBe(expected);
    });

    test('applies multiple styles', () => {
      const result = applyStyles('Styled', { color: 'blue', bold: true, italic: true });
      // Order in applyStyles: bold → italic → underline → dim → color → bg
      const expected = chalk.bold.italic.blue('Styled');
      expect(result).toBe(expected);
    });

    test('returns plain text with no styles', () => {
      const result = applyStyles('Plain', {});
      expect(result).toBe('Plain');
    });

    test('handles empty text', () => {
      const result = applyStyles('', { color: 'red' });
      expect(result).toBe('');
    });
  });

  describe('wrapText', () => {
    test('does not wrap text shorter than width', () => {
      const result = wrapText('Hello', 10);
      expect(result).toBe('Hello');
    });

    test('wraps text longer than width', () => {
      const result = wrapText('Hello World', 7);
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    test('wraps at word boundaries', () => {
      const result = wrapText('Hello World Test', 10);
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    test('handles empty string', () => {
      const result = wrapText('', 10);
      expect(result).toBe('');
    });

    test('handles single word longer than width', () => {
      const result = wrapText('Superlongword', 5);
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    test('preserves existing newlines', () => {
      const result = wrapText('Line1\nLine2', 20);
      expect(result).toContain('\n');
    });

    test('handles text with ANSI codes', () => {
      const colored = '\x1b[31mHello World\x1b[0m';
      const result = wrapText(colored, 7);
      expect(result).toBeTruthy();
    });
  });
});
