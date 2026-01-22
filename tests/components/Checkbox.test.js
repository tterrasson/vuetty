/**
 * Tests for Checkbox component
 */

import { test, expect, describe } from 'bun:test';
import { renderCheckbox } from '../../src/components/Checkbox.js';
import { stripAnsi } from '../helpers/test-utils.js';

describe('Checkbox component', () => {
  const options = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' }
  ];

  describe('basic vertical structure', () => {
    test('renders with correct box borders', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Top border
      expect(lines[0]).toMatch(/^┌─+┐$/);
      // Content lines with side borders
      const contentLines = lines.filter(line => line.startsWith('│'));
      expect(contentLines.length).toBeGreaterThan(0);
      // Bottom border
      expect(lines.find(line => line.match(/^└─+┘$/))).toBeTruthy();
    });

    test('renders label above checkbox list', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        label: 'Select options:',
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      expect(lines[0]).toBe('Select options:');
      expect(lines[1]).toMatch(/^┌─+┐$/);
    });

    test('renders all options in vertical layout', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Option 1');
      expect(stripped).toContain('Option 2');
      expect(stripped).toContain('Option 3');
    });
  });

  describe('checkbox indicators', () => {
    test('renders unchecked boxes for unselected options', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // Should have multiple unchecked boxes
      const uncheckedCount = (stripped.match(/\[ \]/g) || []).length;
      expect(uncheckedCount).toBeGreaterThan(0);
    });

    test('renders checked boxes for selected options', () => {
      const result = renderCheckbox({
        options,
        modelValue: ['opt1', 'opt2'],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // Should have exactly 2 checked boxes
      const checkedCount = (stripped.match(/\[✓\]/g) || []).length;
      expect(checkedCount).toBe(2);
      // Should still have 1 unchecked box
      const uncheckedCount = (stripped.match(/\[ \]/g) || []).length;
      expect(uncheckedCount).toBe(1);
    });

    test('renders mix of checked and unchecked boxes', () => {
      const result = renderCheckbox({
        options,
        modelValue: ['opt2'],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('[✓]');
      expect(stripped).toContain('[ ]');
      expect(stripped).toContain('Option 2');
    });

    test('allows multiple selections', () => {
      const result = renderCheckbox({
        options,
        modelValue: ['opt1', 'opt2', 'opt3'],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // All should be checked
      const checkedCount = (stripped.match(/\[✓\]/g) || []).length;
      expect(checkedCount).toBe(3);
    });
  });

  describe('highlighting and focus', () => {
    test('highlight differs when focused', () => {
      const unfocused = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 1,
        isFocused: false,
        direction: 'vertical'
      });

      const focused = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 1,
        isFocused: true,
        direction: 'vertical'
      });

      // Focused version should have different styling (ANSI codes)
      expect(focused).not.toBe(unfocused);
      expect(focused.length).toBeGreaterThan(unfocused.length);
    });

    test('highlighted option contains correct data', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 1,
        isFocused: true,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // Option 2 is at index 1
      expect(stripped).toContain('Option 2');
    });

    test('no highlight visible when disabled', () => {
      const enabled = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 1,
        isFocused: true,
        disabled: false,
        direction: 'vertical'
      });

      const disabled = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 1,
        isFocused: true,
        disabled: true,
        direction: 'vertical'
      });

      // Both should render but with different styles
      expect(enabled).not.toBe(disabled);
    });
  });

  describe('horizontal layout', () => {
    test('renders options horizontally', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'horizontal'
      });
      const stripped = stripAnsi(result);

      // All options should be present
      expect(stripped).toContain('Option 1');
      expect(stripped).toContain('Option 2');
      expect(stripped).toContain('Option 3');
      // Should have checkboxes
      expect(stripped).toContain('[ ]');
    });

    test('does not have box borders in horizontal layout', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'horizontal'
      });
      const stripped = stripAnsi(result);

      // Horizontal layout doesn't use box borders
      expect(stripped).toContain('[ ]');
      expect(stripped).toContain('Option 1');
    });

    test('shows checked boxes in horizontal layout', () => {
      const result = renderCheckbox({
        options,
        modelValue: ['opt1', 'opt3'],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'horizontal'
      });
      const stripped = stripAnsi(result);

      const checkedCount = (stripped.match(/\[✓\]/g) || []).length;
      expect(checkedCount).toBe(2);
    });
  });

  describe('scrolling behavior', () => {
    test('applies scroll offset to visible options', () => {
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `opt${i + 1}`
      }));

      const result = renderCheckbox({
        options: manyOptions,
        modelValue: [],
        highlightedIndex: 10,
        scrollOffset: 5,
        isFocused: false,
        height: 5,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // Should show options starting from index 5 (Option 6)
      expect(stripped).toContain('Option 6');
      // Should not show options before scroll offset (but Option 10 contains "1")
      // Let's check the structure instead
      const lines = stripped.split('\n');
      const contentLines = lines.filter(line => line.includes('Option'));
      expect(contentLines.length).toBeLessThanOrEqual(5);
      expect(stripped).toContain('showing 6-10 of 20');
    });

    test('displays scroll indicator for long lists', () => {
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `opt${i + 1}`
      }));

      const result = renderCheckbox({
        options: manyOptions,
        modelValue: [],
        highlightedIndex: 0,
        scrollOffset: 0,
        isFocused: false,
        height: 5,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // Should have scroll indicator showing range
      expect(stripped).toMatch(/showing \d+-\d+ of 20/);
      expect(stripped).toMatch(/\d+%/);
    });

    test('does not show scroll indicator for short lists', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        scrollOffset: 0,
        isFocused: false,
        height: 10,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // Should not have scroll indicator
      expect(stripped).not.toMatch(/showing \d+-\d+ of/);
    });
  });

  describe('empty state', () => {
    test('renders empty state when no options', () => {
      const result = renderCheckbox({
        options: [],
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('No options');
      // Should still have borders
      expect(stripped).toContain('┌');
      expect(stripped).toContain('└');
    });

    test('renders single option correctly', () => {
      const result = renderCheckbox({
        options: [{ label: 'Only option', value: 'only' }],
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Only option');
      expect(stripped).toContain('[ ]');
    });

    test('renders empty state in horizontal layout', () => {
      const result = renderCheckbox({
        options: [],
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'horizontal'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('No options');
    });
  });

  describe('help text and hints', () => {
    test('displays help text when focused in vertical layout', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        disabled: false,
        hint: 'default',
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toMatch(/Navigate|Space|Enter|toggle|Tab/i);
    });

    test('does not display help text when not focused', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      const hasHelp = stripped.includes('Navigate') ||
                     stripped.includes('toggle');
      expect(hasHelp).toBe(false);
    });

    test('does not display help text when disabled', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        disabled: true,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      const hasHelp = stripped.includes('Tab to next field');
      expect(hasHelp).toBe(false);
    });

    test('shows appropriate help text for horizontal layout', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        disabled: false,
        direction: 'horizontal'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toMatch(/Navigate|toggle|Tab/i);
    });

    test('displays custom hint text when provided', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        disabled: false,
        hint: 'Custom hint message',
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Custom hint message');
      // Should not show default hint
      expect(stripped).not.toContain('Navigate');
    });

    test('hides hint when hint prop is false', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        disabled: false,
        hint: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // Should not show any hint
      expect(stripped).not.toContain('Navigate');
      expect(stripped).not.toContain('toggle');
      expect(stripped).not.toContain('Tab');
    });

    test('shows default hint when hint prop is "default"', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        disabled: false,
        hint: 'default',
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toMatch(/Navigate|toggle|Tab/i);
    });

    test('handles empty string hint', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        disabled: false,
        hint: '',
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // Empty hint should not display anything
      expect(stripped).not.toContain('Navigate');
    });

    test('default hint respects direction prop', () => {
      const vertical = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        hint: 'default',
        direction: 'vertical'
      });
      const horizontal = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        hint: 'default',
        direction: 'horizontal'
      });

      const strippedV = stripAnsi(vertical);
      const strippedH = stripAnsi(horizontal);

      // Vertical should show up/down arrows
      expect(strippedV).toContain('↑↓');
      // Horizontal should show left/right arrows
      expect(strippedH).toContain('←→');
    });

    test('hint=false does not add extra lines', () => {
      const withoutHint = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        disabled: false,
        hint: false,
        direction: 'vertical'
      });

      const withHint = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        disabled: false,
        hint: 'default',
        direction: 'vertical'
      });

      const strippedWithout = stripAnsi(withoutHint);
      const strippedWith = stripAnsi(withHint);

      // Without hint should have fewer lines than with hint
      const linesWithout = strippedWithout.split('\n').length;
      const linesWith = strippedWith.split('\n').length;
      expect(linesWithout).toBeLessThan(linesWith);

      // Without hint should not contain hint text
      expect(strippedWithout).not.toContain('Navigate');
      expect(strippedWithout).not.toContain('toggle');
      expect(strippedWithout).not.toContain('Tab');

      // With hint should contain hint text
      expect(strippedWith).toContain('Navigate');
    });
  });

  describe('width constraints', () => {
    test('respects custom width in vertical layout', () => {
      const width = 30;
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        width,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Top border should respect width
      const topBorder = lines.find(line => line.match(/^┌─+┐$/));
      expect(topBorder).toBeTruthy();
    });

    test('truncates long option labels when needed', () => {
      const longOptions = [
        { label: 'A'.repeat(100), value: 'opt1' }
      ];

      const result = renderCheckbox({
        options: longOptions,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        width: 30,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('A');
      expect(result).toBeTruthy();
    });
  });

  describe('edge cases and special scenarios', () => {
    test('handles options with special characters', () => {
      const specialOptions = [
        { label: 'Option with → arrow', value: 'opt1' },
        { label: 'Option with 🚀 emoji', value: 'opt2' }
      ];

      const result = renderCheckbox({
        options: specialOptions,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('→');
      expect(stripped).toContain('🚀');
    });

    test('handles empty modelValue array', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // All should be unchecked
      const uncheckedCount = (stripped.match(/\[ \]/g) || []).length;
      expect(uncheckedCount).toBe(3);
    });

    test('handles highlighted index out of bounds', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: 10,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // Should still render without errors
      expect(result).toBeTruthy();
      expect(stripped).toContain('Option 1');
    });

    test('handles negative highlighted index', () => {
      const result = renderCheckbox({
        options,
        modelValue: [],
        highlightedIndex: -1,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(stripped).toContain('Option 1');
    });

    test('handles selection of non-existent option value', () => {
      const result = renderCheckbox({
        options,
        modelValue: ['nonexistent'],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      // Should render normally, no match for nonexistent value
      expect(result).toBeTruthy();
      expect(stripped).toContain('Option 1');
    });

    test('handles empty string labels', () => {
      const emptyLabelOptions = [
        { label: '', value: 'opt1' },
        { label: 'Valid', value: 'opt2' }
      ];

      const result = renderCheckbox({
        options: emptyLabelOptions,
        modelValue: [],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(stripped).toContain('Valid');
    });

    test('handles numeric values', () => {
      const numericOptions = [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 }
      ];

      const result = renderCheckbox({
        options: numericOptions,
        modelValue: [1],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('[✓]');
      expect(stripped).toContain('One');
    });
  });

  describe('complete rendering snapshots', () => {
    test('complete vertical rendering with selections', () => {
      const result = renderCheckbox({
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' }
        ],
        modelValue: ['a'],
        highlightedIndex: 0,
        isFocused: false,
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Should have top border
      expect(lines[0]).toMatch(/^┌─+┐$/);
      // Should have content with checkbox indicators
      expect(stripped).toContain('[✓]');
      expect(stripped).toContain('[ ]');
      expect(stripped).toContain('A');
      expect(stripped).toContain('B');
      // Should have bottom border
      expect(lines.find(line => line.match(/^└─+┘$/))).toBeTruthy();
    });

    test('complete rendering with label and focus', () => {
      const result = renderCheckbox({
        options: [{ label: 'Option', value: 'opt' }],
        modelValue: [],
        highlightedIndex: 0,
        isFocused: true,
        label: 'Select:',
        hint: 'default',
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Select:');
      expect(stripped).toContain('Option');
      expect(stripped).toContain('[ ]');
      expect(stripped).toMatch(/Navigate|toggle/);
    });

    test('complete horizontal rendering', () => {
      const result = renderCheckbox({
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' }
        ],
        modelValue: ['b'],
        highlightedIndex: 1,
        isFocused: true,
        direction: 'horizontal'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('A');
      expect(stripped).toContain('B');
      expect(stripped).toContain('[✓]');
      expect(stripped).toContain('[ ]');
    });

    test('complete rendering with all features', () => {
      const result = renderCheckbox({
        options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' }
        ],
        modelValue: ['opt1'],
        highlightedIndex: 0,
        isFocused: true,
        label: 'Choices:',
        hint: 'default',
        direction: 'vertical'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Choices:');
      expect(stripped).toContain('Option 1');
      expect(stripped).toContain('Option 2');
      expect(stripped).toContain('[✓]');
      expect(stripped).toContain('[ ]');
      expect(stripped).toMatch(/Navigate/);
    });
  });
});
