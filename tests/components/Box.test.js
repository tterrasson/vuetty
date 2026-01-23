/**
 * Tests for Box component
 */

import { test, expect, describe } from 'bun:test';
import { renderBox, BOX_THEMES } from '../../src/components/Box.js';
import { stripAnsi } from '../helpers/test-utils.js';

describe('Box component', () => {
  describe('renderBox', () => {
    test('renders content without border when border is false', () => {
      const result = renderBox('Hello', { border: false, padding: 0 });
      expect(stripAnsi(result)).toBe('Hello');
    });

    test('renders box with border', () => {
      const result = renderBox('Hello', { border: true, borderStyle: 'square' });
      const lines = stripAnsi(result).split('\n');

      expect(lines[0]).toContain('┌');
      expect(lines[0]).toContain('┐');
      expect(lines[1]).toContain('│');
      expect(lines[1]).toContain('Hello');
      expect(lines[2]).toContain('└');
      expect(lines[2]).toContain('┘');
    });

    test('renders box with padding', () => {
      const result = renderBox('X', { border: true, borderStyle: 'square', padding: 1 });
      const lines = stripAnsi(result).split('\n');

      // Should have 5 lines: top border, top padding, content, bottom padding, bottom border
      expect(lines.length).toBe(5);
      // Top border
      expect(lines[0]).toContain('┌');
      // Top padding line (empty with borders)
      expect(lines[1]).toMatch(/│\s+│/);
      // Content line should have padding on both sides
      expect(lines[2]).toMatch(/│\s+X\s+│/);
      // Bottom padding line (empty with borders)
      expect(lines[3]).toMatch(/│\s+│/);
      // Bottom border
      expect(lines[4]).toContain('└');
    });

    test('renders box with title', () => {
      const result = renderBox('Content', {
        border: true,
        borderStyle: 'square',
        title: 'Test Title',
        titleAlign: 'left',
      });
      const lines = stripAnsi(result).split('\n');

      expect(lines[0]).toContain('Test Title');
    });

    test('renders box with centered title', () => {
      const result = renderBox('Content', {
        border: true,
        borderStyle: 'square',
        title: 'Title',
        titleAlign: 'center',
        width: 40,
      });
      const lines = stripAnsi(result).split('\n');

      expect(lines[0]).toContain('Title');
    });

    test('renders box with right-aligned title', () => {
      const result = renderBox('Content', {
        border: true,
        borderStyle: 'square',
        title: 'Title',
        titleAlign: 'right',
        width: 40,
      });
      const lines = stripAnsi(result).split('\n');

      expect(lines[0]).toContain('Title');
    });

    test('applies width constraint', () => {
      const result = renderBox('Hello', { border: true, borderStyle: 'square', width: 20 });
      const lines = stripAnsi(result).split('\n');

      // Width includes border (2 chars)
      expect(lines[0].length).toBeLessThanOrEqual(20);
    });

    test('wraps content to fit width', () => {
      const longText = 'This is a very long line that should wrap';
      const result = renderBox(longText, { border: true, borderStyle: 'square', width: 20 });
      const lines = stripAnsi(result).split('\n');

      // Should have multiple content lines due to wrapping
      expect(lines.length).toBeGreaterThan(3); // top border + content + bottom border
    });

    test('handles multiline content', () => {
      const multiline = 'Line 1\nLine 2\nLine 3';
      const result = renderBox(multiline, { border: true, borderStyle: 'square' });
      const lines = stripAnsi(result).split('\n');

      expect(lines.length).toBe(5); // top + 3 content + bottom
      expect(lines[1]).toContain('Line 1');
      expect(lines[2]).toContain('Line 2');
      expect(lines[3]).toContain('Line 3');
    });

    test('handles empty content', () => {
      const result = renderBox('', { border: true, borderStyle: 'square' });
      const lines = stripAnsi(result).split('\n');

      expect(lines.length).toBe(3); // top + empty + bottom
    });

    test('trims trailing newlines', () => {
      const result = renderBox('Hello\n\n\n', { border: false, padding: 0 });
      expect(stripAnsi(result)).toBe('Hello');
    });
  });

  describe('border styles', () => {
    test('renders with rounded border', () => {
      const result = renderBox('X', { border: true, borderStyle: 'rounded' });
      const lines = stripAnsi(result).split('\n');

      expect(lines[0]).toContain('╭');
      expect(lines[0]).toContain('╮');
      expect(lines[2]).toContain('╰');
      expect(lines[2]).toContain('╯');
    });

    test('renders with square border', () => {
      const result = renderBox('X', { border: true, borderStyle: 'square' });
      const lines = stripAnsi(result).split('\n');

      expect(lines[0]).toContain('┌');
      expect(lines[0]).toContain('┐');
      expect(lines[2]).toContain('└');
      expect(lines[2]).toContain('┘');
    });

    test('renders with double border', () => {
      const result = renderBox('X', { border: true, borderStyle: 'double' });
      const lines = stripAnsi(result).split('\n');

      expect(lines[0]).toContain('╔');
      expect(lines[0]).toContain('╗');
      expect(lines[2]).toContain('╚');
      expect(lines[2]).toContain('╝');
    });

    test('renders with bold border', () => {
      const result = renderBox('X', { border: true, borderStyle: 'bold' });
      const lines = stripAnsi(result).split('\n');

      expect(lines[0]).toContain('┏');
      expect(lines[0]).toContain('┓');
      expect(lines[2]).toContain('┗');
      expect(lines[2]).toContain('┛');
    });

    test('renders with classic border', () => {
      const result = renderBox('X', { border: true, borderStyle: 'classic' });
      const lines = stripAnsi(result).split('\n');

      expect(lines[0]).toContain('+');
      expect(lines[0]).toContain('-');
      expect(lines[1]).toContain('|');
    });
  });

  describe('theme object', () => {
    test('BOX_THEMES contains all expected themes', () => {
      expect(BOX_THEMES).toHaveProperty('rounded');
      expect(BOX_THEMES).toHaveProperty('square');
      expect(BOX_THEMES).toHaveProperty('double');
      expect(BOX_THEMES).toHaveProperty('bold');
      expect(BOX_THEMES).toHaveProperty('classic');
      expect(BOX_THEMES).toHaveProperty('dashed');
      expect(BOX_THEMES).toHaveProperty('sparse');
      expect(BOX_THEMES).toHaveProperty('light');
    });

    test('each theme has all required properties', () => {
      Object.values(BOX_THEMES).forEach(theme => {
        expect(theme).toHaveProperty('topLeft');
        expect(theme).toHaveProperty('topRight');
        expect(theme).toHaveProperty('bottomLeft');
        expect(theme).toHaveProperty('bottomRight');
        expect(theme).toHaveProperty('horizontal');
        expect(theme).toHaveProperty('vertical');
      });
    });
  });

  describe('custom border style object', () => {
    test('accepts custom border characters', () => {
      const customBorder = {
        topLeft: 'A',
        topRight: 'B',
        bottomLeft: 'C',
        bottomRight: 'D',
        horizontal: '-',
        vertical: '|',
      };

      const result = renderBox('X', { border: true, borderStyle: customBorder });
      const lines = stripAnsi(result).split('\n');

      expect(lines[0]).toContain('A');
      expect(lines[0]).toContain('B');
      expect(lines[2]).toContain('C');
      expect(lines[2]).toContain('D');
    });
  });

  describe('text alignment', () => {
    test('aligns text to the left by default', () => {
      const result = renderBox('Hi', { border: true, borderStyle: 'square', width: 20 });
      const lines = stripAnsi(result).split('\n');
      const contentLine = lines[1];

      // Content should be left-aligned (closer to left border)
      expect(contentLine).toMatch(/│\s*Hi\s+│/);
    });

    test('centers text when align is center', () => {
      const result = renderBox('Hi', { border: true, borderStyle: 'square', width: 20, align: 'center' });
      const lines = stripAnsi(result).split('\n');
      const contentLine = lines[1];

      // Content should be centered with roughly equal padding on both sides
      // Width is 20, border takes 2, so interior is 18
      // "Hi" is 2 chars, so padding should be split: 8 left, 8 right
      expect(contentLine).toMatch(/│\s{7,9}Hi\s{7,9}│/);
    });

    test('aligns text to the right when align is right', () => {
      const result = renderBox('Hi', { border: true, borderStyle: 'square', width: 20, align: 'right' });
      const lines = stripAnsi(result).split('\n');
      const contentLine = lines[1];

      // Content should be right-aligned (closer to right border)
      expect(contentLine).toMatch(/│\s+Hi\s*│/);
    });
  });
});
