/**
 * Tests for Spacer component
 */

import { test, expect, describe } from 'bun:test';
import { renderSpacer } from '../../src/components/Spacer.js';

describe('Spacer component', () => {
  describe('renderSpacer', () => {
    test('renders single space by default', () => {
      const result = renderSpacer({});
      expect(result).toBe(' ');
    });

    test('renders single space when count is 1', () => {
      const result = renderSpacer({ count: 1 });
      expect(result).toBe(' ');
    });

    test('renders multiple spaces', () => {
      const result = renderSpacer({ count: 5 });
      expect(result).toBe('     ');
      expect(result.length).toBe(5);
    });

    test('renders 10 spaces', () => {
      const result = renderSpacer({ count: 10 });
      expect(result).toBe('          ');
      expect(result.length).toBe(10);
    });

    test('handles zero count as single space', () => {
      const result = renderSpacer({ count: 0 });
      expect(result).toBe(' ');
    });

    test('handles no props', () => {
      const result = renderSpacer(null);
      expect(result).toBe(' ');
    });
  });
});
