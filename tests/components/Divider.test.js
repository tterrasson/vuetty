/**
 * Tests for Divider component
 */

import { test, expect, describe } from 'bun:test';
import { renderDivider } from '../../src/components/Divider.js';
import { stripAnsi } from '../helpers/test-utils.js';

describe('Divider component', () => {
  describe('renderDivider', () => {
    test('renders default divider', () => {
      const result = renderDivider({});
      const stripped = stripAnsi(result);

      expect(stripped).toContain('─');
      expect(stripped.length).toBe(41); // 40 chars + newline
    });

    test('renders divider with default character', () => {
      const result = renderDivider({ length: 10 });
      const stripped = stripAnsi(result);

      expect(stripped).toBe('─'.repeat(10) + '\n');
    });

    test('renders divider with custom character', () => {
      const result = renderDivider({ char: '-', length: 20 });
      const stripped = stripAnsi(result);

      expect(stripped).toBe('-'.repeat(20) + '\n');
    });

    test('renders divider with equals sign', () => {
      const result = renderDivider({ char: '=', length: 15 });
      const stripped = stripAnsi(result);

      expect(stripped).toBe('='.repeat(15) + '\n');
    });

    test('renders divider with asterisks', () => {
      const result = renderDivider({ char: '*', length: 8 });
      const stripped = stripAnsi(result);

      expect(stripped).toBe('*'.repeat(8) + '\n');
    });

    test('renders divider with custom unicode character', () => {
      const result = renderDivider({ char: '═', length: 12 });
      const stripped = stripAnsi(result);

      expect(stripped).toBe('═'.repeat(12) + '\n');
    });

    test('renders short divider', () => {
      const result = renderDivider({ length: 5 });
      const stripped = stripAnsi(result);

      expect(stripped).toBe('─'.repeat(5) + '\n');
    });

    test('renders long divider', () => {
      const result = renderDivider({ length: 80 });
      const stripped = stripAnsi(result);

      expect(stripped).toBe('─'.repeat(80) + '\n');
    });

    test('renders divider with color prop', () => {
      const result = renderDivider({ char: '-', length: 10, color: 'red' });
      // Color will be applied via applyStyles, result should include the divider
      expect(result).toBeTruthy();
    });

    test('handles zero length', () => {
      const result = renderDivider({ length: 0 });
      const stripped = stripAnsi(result);

      expect(stripped).toBe('\n');
    });
  });
});
