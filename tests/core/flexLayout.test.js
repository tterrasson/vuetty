/**
 * Tests for flex layout utilities
 */

import { test, expect, describe } from 'bun:test';
import { parseFlexShorthand } from '../../src/core/flexLayout.js';

describe('parseFlexShorthand', () => {
  test('returns default when null', () => {
    const result = parseFlexShorthand(null);
    expect(result).toEqual({ grow: 0, shrink: 1, basis: 'auto' });
  });

  test('returns default when undefined', () => {
    const result = parseFlexShorthand(undefined);
    expect(result).toEqual({ grow: 0, shrink: 1, basis: 'auto' });
  });

  describe('number input', () => {
    test('parses 0 as no grow with auto basis', () => {
      const result = parseFlexShorthand(0);
      expect(result).toEqual({ grow: 0, shrink: 1, basis: 'auto' });
    });

    test('parses 1 as grow with 0 basis', () => {
      const result = parseFlexShorthand(1);
      expect(result).toEqual({ grow: 1, shrink: 1, basis: 0 });
    });

    test('parses 2 as grow with 0 basis', () => {
      const result = parseFlexShorthand(2);
      expect(result).toEqual({ grow: 2, shrink: 1, basis: 0 });
    });

    test('parses decimal numbers', () => {
      const result = parseFlexShorthand(1.5);
      expect(result).toEqual({ grow: 1.5, shrink: 1, basis: 0 });
    });
  });

  describe('string input - single value', () => {
    test('parses "0" as no grow with auto basis', () => {
      const result = parseFlexShorthand('0');
      expect(result).toEqual({ grow: 0, shrink: 1, basis: 'auto' });
    });

    test('parses "1" as grow with 0 basis', () => {
      const result = parseFlexShorthand('1');
      expect(result).toEqual({ grow: 1, shrink: 1, basis: 0 });
    });

    test('parses "auto" as basis', () => {
      const result = parseFlexShorthand('auto');
      expect(result).toEqual({ grow: 0, shrink: 1, basis: 'auto' });
    });

    test('parses numeric string as grow', () => {
      const result = parseFlexShorthand('100');
      expect(result).toEqual({ grow: 100, shrink: 1, basis: 0 });
    });
  });

  describe('string input - two values', () => {
    test('parses "1 0" as grow and shrink', () => {
      const result = parseFlexShorthand('1 0');
      expect(result).toEqual({ grow: 1, shrink: 0, basis: 0 });
    });

    test('parses "2 1" as grow and shrink', () => {
      const result = parseFlexShorthand('2 1');
      expect(result).toEqual({ grow: 2, shrink: 1, basis: 0 });
    });

    test('parses decimal values', () => {
      const result = parseFlexShorthand('1.5 0.5');
      expect(result).toEqual({ grow: 1.5, shrink: 0.5, basis: 0 });
    });
  });

  describe('string input - three values', () => {
    test('parses "1 0 auto"', () => {
      const result = parseFlexShorthand('1 0 auto');
      expect(result).toEqual({ grow: 1, shrink: 0, basis: 'auto' });
    });

    test('parses "2 1 50"', () => {
      const result = parseFlexShorthand('2 1 50');
      expect(result).toEqual({ grow: 2, shrink: 1, basis: 50 });
    });

    test('parses "0 1 100"', () => {
      const result = parseFlexShorthand('0 1 100');
      expect(result).toEqual({ grow: 0, shrink: 1, basis: 100 });
    });

    test('parses decimal values', () => {
      const result = parseFlexShorthand('1.5 0.5 75');
      expect(result).toEqual({ grow: 1.5, shrink: 0.5, basis: 75 });
    });
  });

  describe('edge cases', () => {
    test('handles extra whitespace', () => {
      const result = parseFlexShorthand('  1   0   auto  ');
      expect(result).toEqual({ grow: 1, shrink: 0, basis: 'auto' });
    });

    test('handles tabs and mixed whitespace', () => {
      const result = parseFlexShorthand('1\t\t0\nauto');
      expect(result).toEqual({ grow: 1, shrink: 0, basis: 'auto' });
    });

    test('handles invalid numbers as 0', () => {
      const result = parseFlexShorthand('abc def 50');
      expect(result).toEqual({ grow: 0, shrink: 1, basis: 50 });
    });
  });
});
