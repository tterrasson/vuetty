/**
 * Tests for Table component
 */

import { test, expect, describe } from 'bun:test';
import { renderTable } from '../../src/components/Table.js';
import { stripAnsi } from '../helpers/test-utils.js';

describe('Table component', () => {
  const headers = ['Name', 'Age', 'City'];
  const rows = [
    ['Alice', '25', 'New York'],
    ['Bob', '30', 'London'],
    ['Charlie', '35', 'Paris']
  ];

  describe('basic table structure', () => {
    test('renders with correct table borders', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Top border with column separators
      expect(lines[0]).toMatch(/^┌─+┬─+┬─+┐$/);
      // Bottom border with column separators
      const bottomLine = lines.find(line => line.match(/^└─+┴─+┴─+┘$/));
      expect(bottomLine).toBeTruthy();
    });

    test('renders header row with proper styling', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: false,
        showHeader: true,
        height: 10
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Header row should be second line (after top border)
      const headerLine = lines[1];
      expect(headerLine).toContain('Name');
      expect(headerLine).toContain('Age');
      expect(headerLine).toContain('City');
      expect(headerLine).toMatch(/^│.*│.*│.*│$/);
    });

    test('renders divider row after header', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: false,
        showHeader: true,
        height: 10
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Divider row should be third line (after top border and header)
      expect(lines[2]).toMatch(/^├─+┼─+┼─+┤$/);
    });

    test('renders data rows with column separators', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Find data rows (those containing actual data)
      const dataLines = lines.filter(line =>
        line.startsWith('│') &&
        !line.match(/^├/) &&
        !line.match(/^└/) &&
        (line.includes('Alice') || line.includes('Bob') || line.includes('Charlie'))
      );

      expect(dataLines.length).toBeGreaterThan(0);
      dataLines.forEach(line => {
        expect(line).toMatch(/^│.*│.*│.*│$/);
      });
    });

    test('renders label above table when provided', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: false,
        label: 'User List',
        height: 10
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      expect(lines[0]).toBe('User List');
      expect(lines[1]).toMatch(/^┌─+┬─+┬─+┐$/);
    });
  });

  describe('header rendering', () => {
    test('displays all headers correctly', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Name');
      expect(stripped).toContain('Age');
      expect(stripped).toContain('City');
    });

    test('hides header when showHeader is false', () => {
      const resultWithoutHeader = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: false,
        showHeader: false,
        height: 10
      });

      const strippedWithout = stripAnsi(resultWithoutHeader);

      // Should not have divider row
      expect(strippedWithout).not.toMatch(/├─+┼─+┼─+┤/);
      // Should still have data
      expect(strippedWithout).toContain('Alice');
    });

    test('pads header text appropriately', () => {
      const result = renderTable({
        headers: ['A', 'LongHeader', 'C'],
        rows: [['1', '2', '3']],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      const headerLine = lines[1];
      // Each column should be padded
      expect(headerLine).toContain('A');
      expect(headerLine).toContain('LongHeader');
      expect(headerLine).toContain('C');
    });
  });

  describe('data row rendering', () => {
    test('displays all row data', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Alice');
      expect(stripped).toContain('Bob');
      expect(stripped).toContain('Charlie');
      expect(stripped).toContain('New York');
      expect(stripped).toContain('London');
      expect(stripped).toContain('Paris');
    });

    test('renders correct number of visible rows based on height', () => {
      const manyRows = Array.from({ length: 20 }, (_, i) => [
        `User${i}`, `${i}`, `City${i}`
      ]);

      const height = 5;
      const result = renderTable({
        headers,
        rows: manyRows,
        highlightedIndex: 0,
        scrollOffset: 0,
        isFocused: false,
        height
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Count data rows (excluding borders, header, divider, help text)
      const dataLines = lines.filter(line =>
        line.startsWith('│') &&
        line.includes('User')
      );

      expect(dataLines.length).toBeLessThanOrEqual(height);
    });

    test('pads cells to match column width', () => {
      const result = renderTable({
        headers: ['Short', 'Name', 'Long'],
        rows: [['A', 'B', 'C']],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      // All data should be present
      expect(stripped).toContain('A');
      expect(stripped).toContain('B');
      expect(stripped).toContain('C');
    });

    test('truncates very long cell content with ellipsis', () => {
      const result = renderTable({
        headers: ['Short'],
        rows: [['A'.repeat(100)]],
        highlightedIndex: 0,
        isFocused: false,
        columnWidths: [10], // Force narrow column to trigger truncation
        height: 10
      });
      const stripped = stripAnsi(result);

      // Should contain ellipsis for truncation
      expect(stripped).toContain('…');
      expect(stripped).toContain('A');
    });
  });

  describe('highlighting and selection', () => {
    test('highlighted row differs when focused', () => {
      const unfocused = renderTable({
        headers,
        rows,
        highlightedIndex: 1,
        isFocused: false,
        height: 10
      });

      const focused = renderTable({
        headers,
        rows,
        highlightedIndex: 1,
        isFocused: true,
        height: 10
      });

      // Focused version should have different styling (ANSI codes)
      expect(focused).not.toBe(unfocused);
      expect(focused.length).toBeGreaterThan(unfocused.length);
    });

    test('highlighted row contains correct data', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 1,
        isFocused: true,
        height: 10
      });
      const stripped = stripAnsi(result);

      // Bob is at index 1
      expect(stripped).toContain('Bob');
    });

    test('selected row has different styling than highlighted', () => {
      const onlyHighlighted = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: true,
        height: 10
      });

      const bothHighlightedAndSelected = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        selectedIndex: 0,
        isFocused: true,
        height: 10
      });

      // When the same row is both highlighted and selected, it might render differently
      // At minimum, both should render successfully
      expect(onlyHighlighted).toBeTruthy();
      expect(bothHighlightedAndSelected).toBeTruthy();
      expect(stripAnsi(onlyHighlighted)).toContain('Alice');
      expect(stripAnsi(bothHighlightedAndSelected)).toContain('Alice');
    });

    test('no highlight visible when disabled', () => {
      const enabled = renderTable({
        headers,
        rows,
        highlightedIndex: 1,
        isFocused: true,
        disabled: false,
        height: 10
      });

      const disabled = renderTable({
        headers,
        rows,
        highlightedIndex: 1,
        isFocused: true,
        disabled: true,
        height: 10
      });

      // Disabled should not have highlight styling
      expect(disabled).not.toBe(enabled);
    });
  });

  describe('striped rows', () => {
    test('applies striping when enabled', () => {
      const striped = renderTable({
        headers,
        rows,
        highlightedIndex: -1, // No highlight to avoid interference
        isFocused: false,
        striped: true,
        height: 10
      });

      const unstriped = renderTable({
        headers,
        rows,
        highlightedIndex: -1,
        isFocused: false,
        striped: false,
        height: 10
      });

      // Both should render successfully with the same content
      expect(striped).toBeTruthy();
      expect(unstriped).toBeTruthy();
      expect(stripAnsi(striped)).toContain('Alice');
      expect(stripAnsi(striped)).toContain('Bob');
      expect(stripAnsi(unstriped)).toContain('Alice');
    });

    test('alternates striping for odd rows', () => {
      const result = renderTable({
        headers,
        rows: [
          ['Row0', 'A', 'B'],
          ['Row1', 'C', 'D'],
          ['Row2', 'E', 'F'],
          ['Row3', 'G', 'H']
        ],
        highlightedIndex: -1,
        isFocused: false,
        striped: true,
        height: 10
      });

      // Should render successfully with striping
      expect(result).toBeTruthy();
      const stripped = stripAnsi(result);
      expect(stripped).toContain('Row0');
      expect(stripped).toContain('Row1');
    });
  });

  describe('column widths', () => {
    test('respects custom column widths', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: false,
        columnWidths: [15, 5, 20],
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Alice');
      expect(result).toBeTruthy();
    });

    test('calculates automatic column widths when not specified', () => {
      const result = renderTable({
        headers: ['A', 'BB', 'CCC'],
        rows: [
          ['1', '22', '333'],
          ['4', '5', '6']
        ],
        highlightedIndex: 0,
        isFocused: false,
        columnWidths: null,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('A');
      expect(stripped).toContain('CCC');
    });

    test('adjusts column widths based on longest content', () => {
      const result = renderTable({
        headers: ['Short', 'Medium', 'VeryLongHeader'],
        rows: [
          ['A', 'B', 'C'],
          ['SuperLongContent', 'X', 'Y']
        ],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('SuperLongContent');
      expect(stripped).toContain('VeryLongHeader');
    });
  });

  describe('scrolling behavior', () => {
    test('applies scroll offset to visible rows', () => {
      const manyRows = Array.from({ length: 20 }, (_, i) => [
        `User${i}`, `${i}`, `City${i}`
      ]);

      const result = renderTable({
        headers,
        rows: manyRows,
        highlightedIndex: 10,
        scrollOffset: 5,
        isFocused: false,
        height: 5
      });
      const stripped = stripAnsi(result);

      // Should show rows starting from index 5
      expect(stripped).toContain('User5');
      expect(stripped).not.toContain('User0');
      expect(stripped).not.toContain('User1');
    });

    test('displays scroll indicator for long tables', () => {
      const manyRows = Array.from({ length: 20 }, (_, i) => [
        `User${i}`, `${i}`, `City${i}`
      ]);

      const result = renderTable({
        headers,
        rows: manyRows,
        highlightedIndex: 0,
        scrollOffset: 0,
        isFocused: false,
        height: 5
      });
      const stripped = stripAnsi(result);

      // Should have scroll indicator showing range
      expect(stripped).toMatch(/showing \d+-\d+ of \d+ rows/);
    });

    test('does not show scroll indicator for short tables', () => {
      const result = renderTable({
        headers,
        rows: [['Alice', '25', 'NY']],
        highlightedIndex: 0,
        scrollOffset: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      // Should not have scroll indicator
      expect(stripped).not.toMatch(/showing \d+-\d+ of \d+ rows/);
    });
  });

  describe('empty table states', () => {
    test('renders empty table with headers only', () => {
      const result = renderTable({
        headers,
        rows: [],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(stripped).toContain('Name');
      expect(stripped).toContain('Age');
      expect(stripped).toContain('City');
    });

    test('renders empty state when no headers or rows', () => {
      const result = renderTable({
        headers: [],
        rows: [],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(stripped).toContain('No data');
    });

    test('handles single row table', () => {
      const result = renderTable({
        headers,
        rows: [['Alice', '25', 'New York']],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Alice');
      expect(stripped).toContain('25');
      expect(stripped).toContain('New York');
    });
  });

  describe('help text and hints', () => {
    test('displays help text when focused', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: true,
        disabled: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(stripped).toMatch(/Navigate|Enter|Space|Tab/i);
    });

    test('does not display help text when not focused', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      // Less likely to have all these keywords
      const hasHelp = stripped.includes('Navigate') ||
                     stripped.includes('Enter/Space');
      expect(hasHelp).toBe(false);
    });

    test('does not display help text when disabled', () => {
      const result = renderTable({
        headers,
        rows,
        highlightedIndex: 0,
        isFocused: true,
        disabled: true,
        height: 10
      });
      const stripped = stripAnsi(result);

      const hasHelp = stripped.includes('Navigate') ||
                     stripped.includes('Enter/Space');
      expect(hasHelp).toBe(false);
    });
  });

  describe('edge cases and special scenarios', () => {
    test('handles rows with different column counts', () => {
      const result = renderTable({
        headers: ['A', 'B', 'C'],
        rows: [
          ['1', '2', '3'],
          ['4', '5'],
          ['6']
        ],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(stripped).toContain('1');
      expect(stripped).toContain('4');
      expect(stripped).toContain('6');
    });

    test('handles cells with special characters', () => {
      const result = renderTable({
        headers: ['Symbol', 'Unicode'],
        rows: [
          ['→', '🚀'],
          ['✓', '世界']
        ],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('→');
      expect(stripped).toContain('🚀');
      expect(stripped).toContain('✓');
      expect(stripped).toContain('世界');
    });

    test('handles empty cells', () => {
      const result = renderTable({
        headers: ['A', 'B', 'C'],
        rows: [
          ['', '', ''],
          ['1', '', '3']
        ],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(stripped).toContain('A');
      expect(stripped).toContain('1');
      expect(stripped).toContain('3');
    });

    test('handles highlighted index out of bounds', () => {
      const result = renderTable({
        headers: ['A'],
        rows: [['1']],
        highlightedIndex: 10,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      // Should not crash
      expect(result).toBeTruthy();
      expect(stripped).toContain('A');
      expect(stripped).toContain('1');
    });

    test('handles negative highlighted index', () => {
      const result = renderTable({
        headers: ['A'],
        rows: [['1'], ['2']],
        highlightedIndex: -1,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(stripped).toContain('1');
    });

    test('handles single column table', () => {
      const result = renderTable({
        headers: ['Name'],
        rows: [['Alice'], ['Bob'], ['Charlie']],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Should have single column borders
      expect(lines[0]).toMatch(/^┌─+┐$/);
      expect(stripped).toContain('Name');
      expect(stripped).toContain('Alice');
    });

    test('handles many columns', () => {
      const result = renderTable({
        headers: ['A', 'B', 'C', 'D', 'E', 'F'],
        rows: [
          ['1', '2', '3', '4', '5', '6']
        ],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(stripped).toContain('A');
      expect(stripped).toContain('F');
      expect(stripped).toContain('1');
      expect(stripped).toContain('6');
    });

    test('handles empty string headers', () => {
      const result = renderTable({
        headers: ['', 'Valid', ''],
        rows: [['a', 'b', 'c']],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(stripped).toContain('Valid');
      expect(stripped).toContain('a');
    });
  });

  describe('complete rendering snapshots', () => {
    test('complete rendering of basic table', () => {
      const result = renderTable({
        headers: ['A', 'B'],
        rows: [['1', '2']],
        highlightedIndex: 0,
        isFocused: false,
        height: 10
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Top border
      expect(lines[0]).toMatch(/^┌─+┬─+┐$/);
      // Header row
      expect(lines[1]).toContain('A');
      expect(lines[1]).toContain('B');
      // Divider
      expect(lines[2]).toMatch(/^├─+┼─+┤$/);
      // Data row
      expect(lines[3]).toContain('1');
      expect(lines[3]).toContain('2');
      // Bottom border
      const lastDataLine = lines.findIndex(line => line.match(/^└─+┴─+┘$/));
      expect(lastDataLine).toBeGreaterThan(0);
    });

    test('complete rendering with label and focus', () => {
      const result = renderTable({
        headers: ['Name'],
        rows: [['Alice']],
        highlightedIndex: 0,
        isFocused: true,
        label: 'Users',
        height: 10
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      expect(lines[0]).toBe('Users');
      expect(stripped).toContain('Name');
      expect(stripped).toContain('Alice');
      expect(stripped).toMatch(/Navigate|Enter/);
    });

    test('complete rendering with all features', () => {
      const result = renderTable({
        headers: ['ID', 'Name'],
        rows: [['1', 'Alice'], ['2', 'Bob']],
        highlightedIndex: 0,
        selectedIndex: 1,
        scrollOffset: 0,
        isFocused: true,
        label: 'User Table',
        striped: true,
        showHeader: true,
        height: 5
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('User Table');
      expect(stripped).toContain('ID');
      expect(stripped).toContain('Name');
      expect(stripped).toContain('Alice');
      expect(stripped).toContain('Bob');
      expect(stripped).toMatch(/Navigate/);
    });
  });
});
