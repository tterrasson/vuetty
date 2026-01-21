/**
 * Tests for TextBox component
 */

import { test, expect, describe, beforeAll } from 'bun:test';
import { renderText } from '../../src/components/TextBox.js';
import chalk from 'chalk';

describe('TextBox component', () => {
  describe('renderText', () => {
    test('renders plain text without ANSI codes', () => {
      const result = renderText('Hello World', {});
      expect(result).toBe('Hello World');
    });

    test('renders empty string', () => {
      const result = renderText('', {});
      expect(result).toBe('');
    });

    test('applies color styling with ANSI codes', () => {
      const result = renderText('Colored text', { color: 'red' });
      const expected = chalk.red('Colored text');

      expect(result).toBe(expected);
      expect(result).toContain('\x1b[31m'); // Red color code
      expect(result).toContain('Colored text');
      expect(result).toContain('\x1b[39m'); // Reset color code
    });

    test('applies background color with ANSI codes', () => {
      const result = renderText('Background', { bg: 'blue' });
      const expected = chalk.bgBlue('Background');

      expect(result).toBe(expected);
      expect(result).toContain('\x1b[44m'); // Blue background code
      expect(result).toContain('Background');
      expect(result).toContain('\x1b[49m'); // Reset background code
    });

    test('applies bold styling with ANSI codes', () => {
      const result = renderText('Bold text', { bold: true });
      const expected = chalk.bold('Bold text');

      expect(result).toBe(expected);
      expect(result).toContain('\x1b[1m'); // Bold code
      expect(result).toContain('Bold text');
      expect(result).toContain('\x1b[22m'); // Reset bold code
    });

    test('applies italic styling with ANSI codes', () => {
      const result = renderText('Italic text', { italic: true });
      const expected = chalk.italic('Italic text');

      expect(result).toBe(expected);
      expect(result).toContain('\x1b[3m'); // Italic code
      expect(result).toContain('Italic text');
      expect(result).toContain('\x1b[23m'); // Reset italic code
    });

    test('applies underline styling with ANSI codes', () => {
      const result = renderText('Underlined', { underline: true });
      const expected = chalk.underline('Underlined');

      expect(result).toBe(expected);
      expect(result).toContain('\x1b[4m'); // Underline code
      expect(result).toContain('Underlined');
      expect(result).toContain('\x1b[24m'); // Reset underline code
    });

    test('applies dim styling with ANSI codes', () => {
      const result = renderText('Dim text', { dim: true });
      const expected = chalk.dim('Dim text');

      expect(result).toBe(expected);
      expect(result).toContain('\x1b[2m'); // Dim code
      expect(result).toContain('Dim text');
      expect(result).toContain('\x1b[22m'); // Reset dim code
    });

    test('applies multiple styles with ANSI codes', () => {
      const result = renderText('Styled', {
        color: 'green',
        bold: true,
        italic: true
      });

      // Verify the result contains all expected ANSI codes
      expect(result).toContain('\x1b[1m'); // Bold
      expect(result).toContain('\x1b[3m'); // Italic
      expect(result).toContain('\x1b[32m'); // Green color
      expect(result).toContain('Styled');

      // Verify it's styled (has ANSI codes)
      expect(result).not.toBe('Styled');
      expect(result.length).toBeGreaterThan('Styled'.length);
    });

    test('wraps text when width is specified', () => {
      const longText = 'This is a very long line that should wrap';
      const result = renderText(longText, { width: 20 });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('This is');
      expect(result).toContain('\n'); // Should contain newline from wrapping

      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Multiple lines
    });

    test('wraps text with injected width', () => {
      const longText = 'This is a very long line that should wrap';
      const result = renderText(longText, { _injectedWidth: 15 });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('This is');

      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Multiple lines
    });

    test('prefers explicit width over injected width', () => {
      const text = 'Some text here';
      const result = renderText(text, {
        width: 10,
        _injectedWidth: 20
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('Some text');

      // With width 10, this should wrap
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    test('handles multiline text without modifications', () => {
      const multiline = 'Line 1\nLine 2\nLine 3';
      const result = renderText(multiline, {});

      expect(result).toBe('Line 1\nLine 2\nLine 3');
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
    });

    test('preserves newlines in styled text', () => {
      const text = 'First\nSecond';
      const result = renderText(text, { color: 'blue' });

      // Verify it contains the blue color code
      expect(result).toContain('\x1b[34m'); // Blue color

      // Verify both lines are present
      expect(result).toContain('First');
      expect(result).toContain('Second');
      expect(result).toContain('\n'); // Newline is preserved

      // Verify it's styled
      expect(result).not.toBe('First\nSecond');
    });
  });

  describe('edge cases', () => {
    test('handles empty content gracefully', () => {
      const result = renderText('', {});
      expect(result).toBe('');
    });

    test('handles text with existing ANSI codes', () => {
      const textWithAnsi = '\x1b[31mRed text\x1b[0m';
      const result = renderText(textWithAnsi, {});

      // Without styling, it should pass through as-is
      expect(result).toBe(textWithAnsi);
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('Red text');
      expect(result).toContain('\x1b[0m');
    });

    test('applies styles to text with existing ANSI codes', () => {
      const textWithAnsi = '\x1b[31mRed text\x1b[0m';
      const result = renderText(textWithAnsi, { bold: true });
      const expected = chalk.bold(textWithAnsi);

      expect(result).toBe(expected);
      expect(result).toContain('\x1b[1m'); // Bold code
    });

    test('handles very long text with wrapping', () => {
      const longText = 'A'.repeat(1000);
      const result = renderText(longText, { width: 50 });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('A');

      // Should be wrapped into multiple lines
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1);

      // Each line should not exceed 50 characters (excluding ANSI codes)
      lines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(50);
      });
    });

    test('handles special characters with styling', () => {
      const special = 'Special → chars ✓ 🚀';
      const result = renderText(special, { color: 'cyan' });
      const expected = chalk.cyan(special);

      expect(result).toBe(expected);
      expect(result).toContain('\x1b[36m'); // Cyan color
      expect(result).toContain('→');
      expect(result).toContain('✓');
      expect(result).toContain('🚀');
    });

    test('handles unicode characters with bold', () => {
      const unicode = 'Hello 世界 مرحبا';
      const result = renderText(unicode, { bold: true });
      const expected = chalk.bold(unicode);

      expect(result).toBe(expected);
      expect(result).toContain('\x1b[1m'); // Bold
      expect(result).toContain('世界');
      expect(result).toContain('مرحبا');
    });

    test('handles zero width (no wrapping)', () => {
      const result = renderText('Text', { width: 0 });

      // Zero width should not cause wrapping
      expect(result).toBe('Text');
      expect(result).not.toContain('\n');
    });

    test('handles negative width (no wrapping)', () => {
      const result = renderText('Text', { width: -10 });

      // Negative width should not cause wrapping
      expect(result).toBe('Text');
      expect(result).not.toContain('\n');
    });

    test('handles no props (plain text)', () => {
      const result = renderText('Text');

      expect(result).toBe('Text');
    });

    test('handles tabs and special whitespace', () => {
      const text = 'Tab\there\nNew\tline';
      const result = renderText(text, {});

      expect(result).toBe(text);
      expect(result).toContain('\t');
      expect(result).toContain('\n');
    });

    test('combines color and background with multiple styles', () => {
      const result = renderText('Full styled', {
        color: 'yellow',
        bg: 'magenta',
        bold: true,
        underline: true
      });

      // Verify all style codes are present
      expect(result).toContain('\x1b[33m'); // Yellow
      expect(result).toContain('\x1b[45m'); // Magenta background
      expect(result).toContain('\x1b[1m'); // Bold
      expect(result).toContain('\x1b[4m'); // Underline
      expect(result).toContain('Full styled');

      // Verify it's styled (not plain text)
      expect(result).not.toBe('Full styled');
      expect(result.length).toBeGreaterThan('Full styled'.length);
    });

    test('handles invalid color names (should not apply styling)', () => {
      const result = renderText('Text', { color: 'invalidColor' });

      // Should not have color codes for invalid colors
      expect(result).toBe('Text');
    });

    test('preserves ANSI codes in wrapped text', () => {
      const styledLongText = 'This is a very long line that should wrap when width is limited';
      const result = renderText(styledLongText, {
        color: 'green',
        bold: true,
        width: 20
      });

      // Should contain style codes
      expect(result).toContain('\x1b[1m'); // Bold
      expect(result).toContain('\x1b[32m'); // Green

      // Should be wrapped
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });
  });
});
