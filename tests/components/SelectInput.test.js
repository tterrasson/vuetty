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
        isFocused: false
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
        isFocused: true
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('▸');
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
});
