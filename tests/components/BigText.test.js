/**
 * Tests for BigText component
 */

import { test, expect, describe } from 'bun:test';
import chalk from 'chalk';
import { renderBigText, clearBigTextCache, getBigTextCacheStats } from '../../src/components/BigText.js';
import { stripAnsi } from '../helpers/test-utils.js';

// Check if terminal supports colors
const supportsColor = chalk.level > 0;

describe('BigText component', () => {
  describe('renderBigText', () => {
    test('renders text as ASCII art', () => {
      const result = renderBigText('Hi', {});
      const stripped = stripAnsi(result);

      expect(stripped).toBeTruthy();
      expect(stripped.length).toBeGreaterThan('Hi'.length);
    });

    test('renders empty string for no content', () => {
      const result = renderBigText('', {});

      expect(result).toBe('');
    });

    test('renders with Standard font by default', () => {
      const result = renderBigText('A', {});
      const stripped = stripAnsi(result);

      // ASCII art should contain '/' or '\\' or '_' characters
      expect(stripped).toMatch(/[\/\\_]/);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('renders with custom font', () => {
      const result = renderBigText('A', { font: 'Slant' });
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan(1);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('renders with Big font', () => {
      const result = renderBigText('A', { font: 'Big' });
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan(1);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('applies left alignment by default', () => {
      const result = renderBigText('ABC', { align: 'left' });
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan(0);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('applies center alignment', () => {
      const result = renderBigText('A', { align: 'center' });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      expect(lines.length).toBeGreaterThan(0);
      // Center aligned should have spaces on both sides
      const firstLine = lines.find(l => l.trim().length > 0);
      expect(firstLine).toMatch(/^\s+/);
    });

    test('applies right alignment', () => {
      const result = renderBigText('A', { align: 'right' });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      expect(lines.length).toBeGreaterThan(0);
      // Right aligned should start with spaces
      const firstLine = lines.find(l => l.trim().length > 0);
      expect(firstLine).toMatch(/^\s+/);
    });

    test('applies color styling', () => {
      clearBigTextCache();
      const resultWithColor = renderBigText('A', { color: 'red' });
      const resultWithoutColor = renderBigText('A', {});

      if (supportsColor) {
        // With color support, styled output should differ
        expect(resultWithColor).not.toBe(resultWithoutColor);
        expect(stripAnsi(resultWithColor)).toBe(stripAnsi(resultWithoutColor));
      } else {
        // Without color support, outputs should be identical
        expect(resultWithColor).toBe(resultWithoutColor);
      }
    });

    test('applies bold styling', () => {
      clearBigTextCache();
      const resultWithBold = renderBigText('A', { bold: true });
      const resultWithout = renderBigText('A', {});

      if (supportsColor) {
        expect(resultWithBold).not.toBe(resultWithout);
        expect(stripAnsi(resultWithBold)).toBe(stripAnsi(resultWithout));
      } else {
        expect(resultWithBold).toBe(resultWithout);
      }
    });

    test('applies multiple styles', () => {
      clearBigTextCache();
      const resultWithStyles = renderBigText('A', {
        color: 'blue',
        bold: true,
        italic: true
      });
      const resultWithout = renderBigText('A', {});

      if (supportsColor) {
        expect(resultWithStyles).not.toBe(resultWithout);
        expect(stripAnsi(resultWithStyles)).toBe(stripAnsi(resultWithout));
      } else {
        expect(resultWithStyles).toBe(resultWithout);
      }
    });

    test('handles horizontalLayout option', () => {
      const result = renderBigText('AB', { horizontalLayout: 'fitted' });
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan(2);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('handles multi-character text', () => {
      const result = renderBigText('Hello', {});
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan('Hello'.length);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('handles single character', () => {
      const result = renderBigText('X', {});
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan(1);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('removes trailing empty lines', () => {
      const result = renderBigText('A', {});
      const stripped = stripAnsi(result);

      // Should not end with multiple empty lines
      expect(stripped).not.toMatch(/\n\n\n$/);
    });
  });

  describe('caching', () => {
    test('clearBigTextCache executes without error', () => {
      expect(() => clearBigTextCache()).not.toThrow();
    });

    test('getBigTextCacheStats returns valid stats', () => {
      clearBigTextCache();
      renderBigText('Test', {});

      const stats = getBigTextCacheStats();

      expect(stats).toHaveProperty('figlet');
      expect(stats).toHaveProperty('final');
      expect(stats.figlet).toHaveProperty('size');
      expect(stats.figlet).toHaveProperty('maxSize');
      expect(stats.final).toHaveProperty('size');
      expect(stats.final).toHaveProperty('maxSize');
    });

    test('caching improves performance for repeated calls', () => {
      clearBigTextCache();

      const text = 'Cache';
      const props = { font: 'Standard' };

      // First call - cache miss
      const result1 = renderBigText(text, props);

      // Second call - cache hit
      const result2 = renderBigText(text, props);

      expect(result1).toBe(result2);
    });

    test('different content produces different cache entries', () => {
      clearBigTextCache();

      const result1 = renderBigText('A', {});
      const result2 = renderBigText('B', {});

      expect(result1).not.toBe(result2);

      const stats = getBigTextCacheStats();
      expect(stats.figlet.size).toBeGreaterThan(1);
    });

    test('different styles produce different final cache entries', () => {
      clearBigTextCache();

      const result1 = renderBigText('A', { color: 'red', bold: true });
      const result2 = renderBigText('A', { color: 'blue' });

      if (supportsColor) {
        // Different styles should produce different results
        expect(result1).not.toBe(result2);
        // But stripped content should be the same
        expect(stripAnsi(result1)).toBe(stripAnsi(result2));
      } else {
        // Without color support, outputs should be identical
        expect(result1).toBe(result2);
      }
    });
  });

  describe('edge cases', () => {
    test('handles null content', () => {
      const result = renderBigText(null, {});

      expect(result).toBe('');
    });

    test('handles undefined content', () => {
      const result = renderBigText(undefined, {});

      expect(result).toBe('');
    });

    test('handles special characters', () => {
      const result = renderBigText('!@#', {});
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan(3);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('handles numbers', () => {
      const result = renderBigText('123', {});
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan(3);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('handles spaces', () => {
      const result = renderBigText('A B', {});
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan(3);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('handles no props', () => {
      const result = renderBigText('A');
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan(1);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('handles empty props object', () => {
      const result = renderBigText('A', {});
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan(1);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('handles very long text', () => {
      const result = renderBigText('LongTextHere', {});
      const stripped = stripAnsi(result);

      expect(stripped.length).toBeGreaterThan('LongTextHere'.length);
      expect(stripped.split('\n').length).toBeGreaterThan(1);
    });

    test('applies dim styling', () => {
      clearBigTextCache();
      const resultWithDim = renderBigText('A', { dim: true });
      const resultWithout = renderBigText('A', {});

      if (supportsColor) {
        expect(resultWithDim).not.toBe(resultWithout);
        expect(stripAnsi(resultWithDim)).toBe(stripAnsi(resultWithout));
      } else {
        expect(resultWithDim).toBe(resultWithout);
      }
    });

    test('applies underline styling', () => {
      clearBigTextCache();
      const resultWithUnderline = renderBigText('A', { underline: true });
      const resultWithout = renderBigText('A', {});

      if (supportsColor) {
        expect(resultWithUnderline).not.toBe(resultWithout);
        expect(stripAnsi(resultWithUnderline)).toBe(stripAnsi(resultWithout));
      } else {
        expect(resultWithUnderline).toBe(resultWithout);
      }
    });

    test('applies bg styling', () => {
      clearBigTextCache();
      const resultWithBg = renderBigText('A', { bg: 'black' });
      const resultWithout = renderBigText('A', {});

      if (supportsColor) {
        expect(resultWithBg).not.toBe(resultWithout);
        expect(stripAnsi(resultWithBg)).toBe(stripAnsi(resultWithout));
      } else {
        expect(resultWithBg).toBe(resultWithout);
      }
    });
  });
});
