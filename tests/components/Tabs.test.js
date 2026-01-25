/**
 * Tests for Tabs component
 */

import { test, expect, describe } from 'bun:test';
import { renderTabs } from '../../src/components/Tabs.js';
import { stripAnsi } from '../helpers/test-utils.js';

describe('Tabs component', () => {
  const baseTabs = [
    { label: 'One', value: 'one' },
    { label: 'Two', value: 'two' },
    { label: 'Three', value: 'three' }
  ];

  describe('renderTabs', () => {
    test('renders tab labels and underline for active tab', () => {
      const result = renderTabs({
        tabs: baseTabs,
        highlightedIndex: 0,
        activeIndex: 1,
        isFocused: false
      });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      expect(lines[0]).toContain('One');
      expect(lines[0]).toContain('Two');
      expect(lines[0]).toContain('Three');

      const labelWidths = baseTabs.map(tab => ` ${tab.label} `.length);
      const separatorWidth = 3;
      const underlineParts = labelWidths.map((width, idx) => (idx === 1 ? '─'.repeat(width) : ' '.repeat(width)));
      const expectedUnderline = underlineParts.join(' '.repeat(separatorWidth));

      expect(lines[1]).toBe(expectedUnderline);
    });

    test('renders panel content without border when panelBorder is false', () => {
      const result = renderTabs({
        tabs: baseTabs,
        highlightedIndex: 0,
        activeIndex: 0,
        isFocused: false,
        panelBorder: false
      }, 'Panel content');
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      expect(lines[2]).toContain('Panel content');
      expect(stripped).not.toContain('┌');
    });

    test('renders panel content with border when panelBorder is true', () => {
      const result = renderTabs({
        tabs: baseTabs,
        highlightedIndex: 0,
        activeIndex: 0,
        isFocused: false,
        panelBorder: true,
        panelBorderStyle: 'square',
        panelPadding: 0
      }, 'Panel content');
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      expect(lines[2]).toContain('┌');
      expect(stripped).toContain('Panel content');
    });

    test('shows hint text when focused', () => {
      const result = renderTabs({
        tabs: baseTabs,
        highlightedIndex: 0,
        activeIndex: 0,
        isFocused: true,
        disabled: false,
        hint: 'default'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Navigate tabs');
      expect(stripped).toContain('Enter to select');
    });

    test('does not show hint text when disabled', () => {
      const result = renderTabs({
        tabs: baseTabs,
        highlightedIndex: 0,
        activeIndex: 0,
        isFocused: true,
        disabled: true,
        hint: 'default'
      });
      const stripped = stripAnsi(result);

      expect(stripped).not.toContain('Navigate tabs');
    });
  });
});
