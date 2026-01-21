/**
 * Tests for Newline component
 */

import { test, expect, describe } from 'bun:test';
import { renderNewline } from '../../src/components/Newline.js';

describe('Newline component', () => {
  describe('renderNewline', () => {
    test('renders single newline by default', () => {
      const result = renderNewline({});
      expect(result).toBe('\n');
    });

    test('renders single newline when count is 1', () => {
      const result = renderNewline({ count: 1 });
      expect(result).toBe('\n');
    });

    test('renders multiple newlines', () => {
      const result = renderNewline({ count: 3 });
      expect(result).toBe('\n\n\n');
    });

    test('renders 5 newlines', () => {
      const result = renderNewline({ count: 5 });
      expect(result).toBe('\n\n\n\n\n');
      expect(result.split('\n').length).toBe(6); // 5 newlines create 6 lines
    });

    test('handles zero count as single newline', () => {
      const result = renderNewline({ count: 0 });
      expect(result).toBe('\n');
    });

    test('handles no props', () => {
      const result = renderNewline();
      expect(result).toBe('\n');
    });
  });
});
