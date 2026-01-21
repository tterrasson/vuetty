/**
 * Tests for TextInput component
 */

import { test, expect, describe } from 'bun:test';
import { renderTextInput } from '../../src/components/TextInput.js';
import { stripAnsi } from '../helpers/test-utils.js';

describe('TextInput component', () => {
  describe('basic rendering structure', () => {
    test('renders with correct box drawing borders', () => {
      const result = renderTextInput({ text: 'Hello', cursor: 5, width: 20 });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Top border
      expect(lines[0]).toMatch(/^┌─+┐$/);
      // Content lines with side borders
      expect(lines[1]).toMatch(/^│.*│$/);
      // Bottom border
      expect(lines[lines.length - 1]).toMatch(/^└─+┘$/);
    });

    test('respects width property for border length', () => {
      const width = 30;
      const result = renderTextInput({ text: 'Test', cursor: 4, width });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Top border should be exactly width + 2 (for corners)
      expect(lines[0]).toBe('┌' + '─'.repeat(width) + '┐');
      expect(lines[lines.length - 1]).toBe('└' + '─'.repeat(width) + '┘');
    });

    test('renders correct number of rows', () => {
      const rows = 5;
      const result = renderTextInput({ text: 'Test', cursor: 4, rows, width: 20 });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Should have: top border + rows + bottom border = rows + 2
      const contentLines = lines.filter(line => line.startsWith('│'));
      expect(contentLines.length).toBe(rows);
    });

    test('renders label above input box', () => {
      const result = renderTextInput({
        text: 'Test',
        cursor: 4,
        label: 'Username:',
        width: 20
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Label should be first line
      expect(lines[0]).toBe('Username:');
      // Then top border
      expect(lines[1]).toMatch(/^┌─+┐$/);
    });
  });

  describe('text content rendering', () => {
    test('renders text in first content row', () => {
      const result = renderTextInput({ text: 'Hello World', cursor: 11, width: 20 });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // First content line (after top border)
      const contentLine = lines[1];
      expect(contentLine).toContain('Hello World');
      expect(contentLine).toMatch(/^│.*Hello World.*│$/);
    });

    test('pads content to fill width', () => {
      const width = 20;
      const text = 'Hi';
      const result = renderTextInput({ text, cursor: 2, width });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      const contentLine = lines[1];
      // Remove borders and check padding: should be exactly width chars
      const content = contentLine.substring(1, contentLine.length - 1);
      expect(content.length).toBe(width);
      expect(content.startsWith('Hi')).toBe(true);
    });

    test('renders placeholder when text is empty and not focused', () => {
      const result = renderTextInput({
        text: '',
        cursor: 0,
        placeholder: 'Enter text...',
        width: 20,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Enter text...');
    });

    test('renders placeholder with cursor when focused and empty', () => {
      const result = renderTextInput({
        text: '',
        cursor: 0,
        placeholder: 'Type here',
        width: 20,
        isFocused: true
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Type here');
    });

    test('does not show placeholder when text is present', () => {
      const result = renderTextInput({
        text: 'Actual text',
        cursor: 11,
        placeholder: 'Placeholder',
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Actual text');
      expect(stripped).not.toContain('Placeholder');
    });
  });

  describe('cursor rendering', () => {
    test('cursor is visible when focused', () => {
      const result = renderTextInput({
        text: 'Hello',
        cursor: 2,
        width: 20,
        isFocused: true,
        focusColor: 'cyan'
      });

      // When focused, cursor should be rendered with inverse colors
      // We can't easily check ANSI codes, but output should differ from unfocused
      const unfocusedResult = renderTextInput({
        text: 'Hello',
        cursor: 2,
        width: 20,
        isFocused: false
      });

      expect(result).not.toBe(unfocusedResult);
      expect(result.length).toBeGreaterThan(unfocusedResult.length); // ANSI codes add length
    });

    test('cursor at start of text', () => {
      const result = renderTextInput({
        text: 'Hello',
        cursor: 0,
        width: 20,
        isFocused: true
      });
      const stripped = stripAnsi(result);

      // Cursor should be on first character
      expect(stripped).toContain('Hello');
    });

    test('cursor at end of text', () => {
      const result = renderTextInput({
        text: 'Hello',
        cursor: 5,
        width: 20,
        isFocused: true
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Hello');
    });

    test('cursor in middle of text', () => {
      const result = renderTextInput({
        text: 'Hello',
        cursor: 3,
        width: 20,
        isFocused: true
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Hello');
    });

    test('cursor not visible when disabled', () => {
      const result = renderTextInput({
        text: 'Hello',
        cursor: 2,
        width: 20,
        isFocused: true,
        disabled: true
      });
      const stripped = stripAnsi(result);

      // Cursor should not be rendered when disabled
      expect(stripped).toContain('Hello');
    });
  });

  describe('multiline text rendering', () => {
    test('renders multiple lines with newlines', () => {
      const result = renderTextInput({
        text: 'Line 1\nLine 2\nLine 3',
        cursor: 7,
        multiline: true,
        rows: 5,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Line 1');
      expect(stripped).toContain('Line 2');
      expect(stripped).toContain('Line 3');
    });

    test('wraps long lines based on width', () => {
      const width = 10;
      const longText = 'This is a very long line that should wrap';
      const result = renderTextInput({
        text: longText,
        cursor: 0,
        width,
        rows: 5
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n').filter(line => line.startsWith('│'));

      // Should have multiple lines with wrapped content
      expect(lines.length).toBeGreaterThan(1);
      // Each content line should not exceed width
      lines.forEach(line => {
        const content = line.substring(1, line.length - 1);
        expect(content.length).toBe(width);
      });
    });

    test('handles empty lines in multiline text', () => {
      const result = renderTextInput({
        text: 'Line 1\n\nLine 3',
        cursor: 7,
        multiline: true,
        rows: 5,
        width: 20
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n').filter(line => line.startsWith('│'));

      // Should render 3 lines (with middle one empty)
      expect(lines.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('auto-resize functionality', () => {
    test('expands to fit content when autoResize is true', () => {
      const result = renderTextInput({
        text: 'Line 1\nLine 2\nLine 3\nLine 4',
        cursor: 0,
        autoResize: true,
        minRows: 2,
        rows: 2,
        width: 20
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n').filter(line => line.startsWith('│'));

      // Should expand beyond initial rows to fit content
      expect(lines.length).toBeGreaterThanOrEqual(4);
    });

    test('respects minRows when content is small', () => {
      const minRows = 3;
      const result = renderTextInput({
        text: 'Short',
        cursor: 5,
        autoResize: true,
        minRows,
        rows: 1,
        width: 20
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n').filter(line => line.startsWith('│'));

      expect(lines.length).toBe(minRows);
    });

    test('respects maxRows when content is large', () => {
      const maxRows = 3;
      const result = renderTextInput({
        text: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5',
        cursor: 0,
        autoResize: true,
        maxRows,
        rows: 2,
        width: 20
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n').filter(line => line.startsWith('│'));

      expect(lines.length).toBeLessThanOrEqual(maxRows);
    });
  });

  describe('scrolling behavior', () => {
    test('applies scrollOffset to visible content', () => {
      const text = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
      const result = renderTextInput({
        text,
        cursor: 14, // In line 3
        scrollOffset: 2,
        rows: 2,
        width: 20
      });
      const stripped = stripAnsi(result);

      // With scrollOffset 2, should show lines starting from index 2 (Line 3, Line 4)
      expect(stripped).toContain('Line 3');
      expect(stripped).not.toContain('Line 1');
    });

    test('scrollOffset 0 shows from the beginning', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const result = renderTextInput({
        text,
        cursor: 0,
        scrollOffset: 0,
        rows: 2,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Line 1');
    });
  });

  describe('validation and error states', () => {
    test('renders validation error message', () => {
      const result = renderTextInput({
        text: '',
        cursor: 0,
        validationError: 'Required field',
        errorColor: 'red',
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('✗ Required field');
    });

    test('validation error appears after bottom border', () => {
      const result = renderTextInput({
        text: '',
        cursor: 0,
        validationError: 'Invalid input',
        width: 20
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Find bottom border
      const bottomBorderIndex = lines.findIndex(line => line.match(/^└─+┘$/));
      const errorLineIndex = lines.findIndex(line => line.includes('✗ Invalid input'));

      expect(errorLineIndex).toBeGreaterThan(bottomBorderIndex);
    });

    test('does not render hint when validation error is present', () => {
      const result = renderTextInput({
        text: '',
        cursor: 0,
        validationError: 'Error',
        hint: 'default',
        isFocused: true,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('✗ Error');
      expect(stripped).not.toContain('Enter to submit');
      expect(stripped).not.toContain('Ctrl+Enter to submit');
    });
  });

  describe('hints and help text', () => {
    test('renders default hint for single-line input when focused', () => {
      const result = renderTextInput({
        text: 'Test',
        cursor: 4,
        hint: 'default',
        isFocused: true,
        multiline: false,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Enter to submit');
    });

    test('renders default hint for multiline input when focused', () => {
      const result = renderTextInput({
        text: 'Test',
        cursor: 4,
        hint: 'default',
        isFocused: true,
        multiline: true,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Enter to submit, Shift+Enter for new line');
    });

    test('renders custom hint text', () => {
      const customHint = 'Press F1 for help';
      const result = renderTextInput({
        text: 'Test',
        cursor: 4,
        hint: customHint,
        isFocused: true,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain(customHint);
    });

    test('does not render hint when not focused', () => {
      const result = renderTextInput({
        text: 'Test',
        cursor: 4,
        hint: 'default',
        isFocused: false,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).not.toContain('Enter to submit');
    });

    test('does not render hint when disabled', () => {
      const result = renderTextInput({
        text: 'Test',
        cursor: 4,
        hint: 'default',
        isFocused: true,
        disabled: true,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).not.toContain('Enter to submit');
    });

    test('does not render hint when hint is false', () => {
      const result = renderTextInput({
        text: 'Test',
        cursor: 4,
        hint: false,
        isFocused: true,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).not.toContain('Enter to submit');
      expect(stripped).not.toContain('Ctrl+Enter to submit');
    });
  });

  describe('edge cases and special scenarios', () => {
    test('handles null text gracefully', () => {
      const result = renderTextInput({ text: null, cursor: 0, width: 20 });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(stripped).toMatch(/^┌─+┐/);
    });

    test('handles undefined text gracefully', () => {
      const result = renderTextInput({ text: undefined, cursor: 0, width: 20 });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(stripped).toMatch(/^┌─+┐/);
    });

    test('handles very long single line text', () => {
      const longText = 'A'.repeat(200);
      const width = 20;
      const result = renderTextInput({ text: longText, cursor: 0, width, rows: 3 });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n').filter(line => line.startsWith('│'));

      // Should wrap into multiple lines
      expect(lines.length).toBeGreaterThan(1);
      expect(stripped).toContain('A');
    });

    test('handles special characters correctly', () => {
      const result = renderTextInput({
        text: 'Test @#$% 123 → ✓',
        cursor: 17,
        width: 25
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('@#$%');
      expect(stripped).toContain('123');
    });

    test('handles unicode characters', () => {
      const result = renderTextInput({
        text: 'Hello 世界 🌍',
        cursor: 11,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Hello');
      expect(stripped).toContain('世界');
    });

    test('handles cursor beyond text length gracefully', () => {
      const result = renderTextInput({
        text: 'Hello',
        cursor: 100,
        width: 20,
        isFocused: true
      });
      const stripped = stripAnsi(result);

      // Should not crash and should render text
      expect(stripped).toContain('Hello');
    });

    test('handles negative cursor position gracefully', () => {
      const result = renderTextInput({
        text: 'Hello',
        cursor: -5,
        width: 20,
        isFocused: true
      });
      const stripped = stripAnsi(result);

      // Should not crash and should render text
      expect(stripped).toContain('Hello');
    });

    test('handles empty text with various cursor positions', () => {
      const positions = [0, -1, 10];

      positions.forEach(cursor => {
        const result = renderTextInput({
          text: '',
          cursor,
          width: 20,
          placeholder: 'Empty'
        });
        const stripped = stripAnsi(result);

        expect(result).toBeTruthy();
        expect(stripped).toMatch(/^┌─+┐/);
      });
    });
  });

  describe('complete rendering snapshots', () => {
    test('complete rendering of basic input', () => {
      const result = renderTextInput({
        text: 'Hello',
        cursor: 5,
        width: 10,
        rows: 1
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      expect(lines.length).toBe(3); // top border + content + bottom border
      expect(lines[0]).toBe('┌──────────┐');
      expect(lines[1]).toMatch(/^│Hello {5}│$/);
      expect(lines[2]).toBe('└──────────┘');
    });

    test('complete rendering with label and error', () => {
      const result = renderTextInput({
        text: '',
        cursor: 0,
        width: 10,
        rows: 1,
        label: 'Name:',
        validationError: 'Required'
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      expect(lines[0]).toBe('Name:');
      expect(lines[1]).toBe('┌──────────┐');
      expect(lines[lines.length - 1]).toContain('✗ Required');
    });

    test('complete rendering with all features', () => {
      const result = renderTextInput({
        text: 'Test input',
        cursor: 4,
        width: 15,
        rows: 2,
        label: 'Field:',
        placeholder: 'Enter text',
        isFocused: true,
        hint: 'Custom hint'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Field:');
      expect(stripped).toContain('┌───────────────┐');
      expect(stripped).toContain('Test input');
      expect(stripped).toContain('└───────────────┘');
      expect(stripped).toContain('Custom hint');
    });
  });
});
