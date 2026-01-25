/**
 * Tests for SelectInput component
 */

import { test, expect, describe } from 'bun:test';
import { renderSelectInput } from '../../src/components/SelectInput.js';
import { stripAnsi } from '../helpers/test-utils.js';

describe('SelectInput component', () => {
  describe('renderSelectInput', () => {
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' }
    ];

    test('renders select input with options', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped).toContain('Option 1');
    });

    test('renders with label', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        label: 'Choose an option:',
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Choose an option:');
    });

    test('renders without label', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        label: '',
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped).toContain('Option 1');
    });

    test('shows selected option with indicator', () => {
      const result = renderSelectInput({
        options,
        modelValue: 'opt2',
        highlightedIndex: 0,
        selectedIndex: 1,
        isFocused: false,
        marker: '●'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('●');
    });

    test('shows highlighted option with indicator when focused', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 1,
        selectedIndex: -1,
        isFocused: true,
        highlightMarker: '▸'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('▸');
    });

    test('uses custom markers', () => {
      const result = renderSelectInput({
        options,
        modelValue: 'opt2',
        highlightedIndex: 0,
        selectedIndex: 1,
        isFocused: false,
        marker: '✓',
        highlightMarker: '→'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('✓');
    });

    test('supports primitive options (strings)', () => {
      const primitiveOptions = [
        { label: 'Apple', value: 'Apple' },
        { label: 'Banana', value: 'Banana' },
        { label: 'Cherry', value: 'Cherry' }
      ];

      const result = renderSelectInput({
        options: primitiveOptions,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Apple');
      expect(stripped).toContain('Banana');
      expect(stripped).toContain('Cherry');
    });

    test('supports primitive options (numbers)', () => {
      const primitiveOptions = [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 }
      ];

      const result = renderSelectInput({
        options: primitiveOptions,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('1');
      expect(stripped).toContain('2');
      expect(stripped).toContain('3');
    });

    test('displays all option labels', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Option 1');
      expect(stripped).toContain('Option 2');
      expect(stripped).toContain('Option 3');
    });

    test('applies custom colors', () => {
      const result = renderSelectInput({
        options,
        modelValue: 'opt1',
        highlightedIndex: 0,
        selectedIndex: 0,
        isFocused: true,
        focusColor: 'cyan',
        selectedColor: 'green',
        highlightColor: 'yellow'
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped).toContain('Option 1');
    });

    test('handles disabled state', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false,
        disabled: true
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped).toContain('Option 1');
    });

    test('shows help text when focused', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: true
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Navigate');
    });

    test('does not show help text when not focused', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).not.toContain('Navigate');
    });

    test('handles scroll offset for many options', () => {
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `opt${i + 1}`
      }));

      const result = renderSelectInput({
        options: manyOptions,
        modelValue: null,
        height: 10,
        highlightedIndex: 10,
        scrollOffset: 5,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped.length).toBeGreaterThan(0);
    });

    test('shows scroll indicator for many options', () => {
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `opt${i + 1}`
      }));

      const result = renderSelectInput({
        options: manyOptions,
        modelValue: null,
        height: 10,
        highlightedIndex: 0,
        scrollOffset: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('showing');
    });

    test('respects custom height', () => {
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `opt${i + 1}`
      }));

      const result = renderSelectInput({
        options: manyOptions,
        modelValue: null,
        height: 5,
        highlightedIndex: 0,
        scrollOffset: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped).toContain('Option 1');
    });

    test('renders border when focused', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: true
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('┌');
      expect(stripped).toContain('└');
    });

    test('renders border when not focused', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('┌');
      expect(stripped).toContain('└');
    });
  });

  describe('edge cases', () => {
    test('handles empty options array', () => {
      const result = renderSelectInput({
        options: [],
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('No options');
    });

    test('handles single option', () => {
      const result = renderSelectInput({
        options: [{ label: 'Only option', value: 'only' }],
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Only option');
    });

    test('handles options with special characters', () => {
      const options = [
        { label: 'Option with → arrow', value: 'opt1' },
        { label: 'Option with 🚀 emoji', value: 'opt2' }
      ];

      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('→');
      expect(stripped).toContain('🚀');
    });

    test('handles very long option labels', () => {
      const options = [
        { label: 'A'.repeat(100), value: 'opt1' }
      ];

      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false,
        width: 50
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped).toContain('A');
    });

    test('handles highlighted index out of bounds', () => {
      const options = [
        { label: 'Option 1', value: 'opt1' }
      ];

      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 10,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped).toContain('Option 1');
    });

    test('handles numeric values', () => {
      const options = [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 }
      ];

      const result = renderSelectInput({
        options,
        modelValue: 1,
        highlightedIndex: 0,
        selectedIndex: 0,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('●');
    });

    test('handles disabled options rendering', () => {
      const options = [
        { label: 'Enabled', value: 'opt1', disabled: false },
        { label: 'Disabled', value: 'opt2', disabled: true }
      ];

      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped).toContain('Enabled');
      expect(stripped).toContain('Disabled');
    });

    test('only one option can be selected', () => {
      const result = renderSelectInput({
        options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' },
          { label: 'Option 3', value: 'opt3' }
        ],
        modelValue: 'opt2',
        highlightedIndex: 0,
        selectedIndex: 1,
        isFocused: false
      });
      const stripped = stripAnsi(result);

      // Only one should have the selected indicator
      const selectedCount = (stripped.match(/●/g) || []).length;
      expect(selectedCount).toBe(1);
    });
  });

  describe('multi-selection', () => {
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' }
    ];

    test('renders with multiple prop enabled', () => {
      const result = renderSelectInput({
        options,
        modelValue: [],
        highlightedIndex: 0,
        selectedIndex: -1,
        selectedIndices: [],
        isFocused: false,
        multiple: true
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped).toContain('Option 1');
    });

    test('shows multiple selected options', () => {
      const result = renderSelectInput({
        options,
        modelValue: ['opt1', 'opt3'],
        highlightedIndex: 0,
        selectedIndex: 0,
        selectedIndices: [0, 2],
        isFocused: false,
        multiple: true,
        marker: '●'
      });
      const stripped = stripAnsi(result);

      // Should have two selected markers
      const selectedCount = (stripped.match(/●/g) || []).length;
      expect(selectedCount).toBe(2);
    });

    test('displays custom hint text for multi-select when focused', () => {
      const result = renderSelectInput({
        options,
        modelValue: [],
        highlightedIndex: 0,
        selectedIndex: -1,
        selectedIndices: [],
        isFocused: true,
        disabled: false,
        multiple: true,
        hint: 'default'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('toggle');
      expect(stripped).toContain('confirm');
    });

    test('handles empty selection in multi-select mode', () => {
      const result = renderSelectInput({
        options,
        modelValue: [],
        highlightedIndex: 0,
        selectedIndex: -1,
        selectedIndices: [],
        isFocused: false,
        multiple: true
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // No selected markers should be present
      const selectedCount = (stripped.match(/●/g) || []).length;
      expect(selectedCount).toBe(0);
    });

    test('handles all options selected in multi-select mode', () => {
      const result = renderSelectInput({
        options,
        modelValue: ['opt1', 'opt2', 'opt3'],
        highlightedIndex: 0,
        selectedIndex: 0,
        selectedIndices: [0, 1, 2],
        isFocused: false,
        multiple: true,
        marker: '●'
      });
      const stripped = stripAnsi(result);

      // All three options should be selected
      const selectedCount = (stripped.match(/●/g) || []).length;
      expect(selectedCount).toBe(3);
    });

    test('multi-select mode with highlighted and selected options', () => {
      const result = renderSelectInput({
        options,
        modelValue: ['opt1'],
        highlightedIndex: 1,
        selectedIndex: 0,
        selectedIndices: [0],
        isFocused: true,
        multiple: true,
        marker: '●',
        highlightMarker: '▸'
      });
      const stripped = stripAnsi(result);

      // Should have selected marker and highlight marker
      expect(stripped).toContain('●');
      expect(stripped).toContain('▸');
    });

    test('respects disabled options in multi-select mode', () => {
      const disabledOptions = [
        { label: 'Option 1', value: 'opt1', disabled: false },
        { label: 'Option 2', value: 'opt2', disabled: true },
        { label: 'Option 3', value: 'opt3', disabled: false }
      ];

      const result = renderSelectInput({
        options: disabledOptions,
        modelValue: ['opt1', 'opt3'],
        highlightedIndex: 0,
        selectedIndex: 0,
        selectedIndices: [0, 2],
        isFocused: false,
        multiple: true
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped).toContain('Option 2');
    });
  });

  describe('hint text', () => {
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' }
    ];

    test('displays default hint text when focused', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: true,
        disabled: false,
        hint: 'default'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toMatch(/Navigate|Enter|select|Tab/i);
    });

    test('does not display hint text when not focused', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: false,
        hint: 'default'
      });
      const stripped = stripAnsi(result);

      const hasHelp = stripped.includes('Navigate') ||
                     stripped.includes('select');
      expect(hasHelp).toBe(false);
    });

    test('does not display hint text when disabled', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: true,
        disabled: true,
        hint: 'default'
      });
      const stripped = stripAnsi(result);

      const hasHelp = stripped.includes('Tab to next field');
      expect(hasHelp).toBe(false);
    });

    test('displays custom hint text when provided', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: true,
        disabled: false,
        hint: 'Custom hint message'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Custom hint message');
      // Should not show default hint
      expect(stripped).not.toContain('Navigate');
    });

    test('hides hint when hint prop is false', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: true,
        disabled: false,
        hint: false
      });
      const stripped = stripAnsi(result);

      // Should not show any hint
      expect(stripped).not.toContain('Navigate');
      expect(stripped).not.toContain('select');
      expect(stripped).not.toContain('Tab');
    });

    test('shows default hint when hint prop is "default"', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: true,
        disabled: false,
        hint: 'default'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toMatch(/Navigate|select|Tab/i);
    });

    test('handles empty string hint', () => {
      const result = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: true,
        disabled: false,
        hint: ''
      });
      const stripped = stripAnsi(result);

      // Empty hint should not display anything
      expect(stripped).not.toContain('Navigate');
    });

    test('hint=false does not add extra lines', () => {
      const withoutHint = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: true,
        disabled: false,
        hint: false
      });

      const withHint = renderSelectInput({
        options,
        modelValue: null,
        highlightedIndex: 0,
        selectedIndex: -1,
        isFocused: true,
        disabled: false,
        hint: 'default'
      });

      const strippedWithout = stripAnsi(withoutHint);
      const strippedWith = stripAnsi(withHint);

      // Without hint should have fewer lines than with hint
      const linesWithout = strippedWithout.split('\n').length;
      const linesWith = strippedWith.split('\n').length;
      expect(linesWithout).toBeLessThan(linesWith);

      // Without hint should not contain hint text
      expect(strippedWithout).not.toContain('Navigate');
      expect(strippedWithout).not.toContain('select');
      expect(strippedWithout).not.toContain('Tab');

      // With hint should contain hint text
      expect(strippedWith).toContain('Navigate');
    });
  });
});
