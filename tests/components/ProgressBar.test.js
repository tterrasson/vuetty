/**
 * Tests for ProgressBar component
 */

import { test, expect, describe } from 'bun:test';
import { renderProgressBar } from '../../src/components/ProgressBar.js';
import { stripAnsi } from '../helpers/test-utils.js';

describe('ProgressBar component', () => {
  describe('renderProgressBar', () => {
    test('renders progress bar with default props', () => {
      const result = renderProgressBar({ value: 50 });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped.length).toBeGreaterThan(0);
      // Should contain progress bar elements
      expect(stripped).toContain('[');
      expect(stripped).toContain(']');
      expect(stripped).toContain('50%');
    });

    test('renders progress bar at 0%', () => {
      const result = renderProgressBar({ value: 0, max: 100, width: 20 });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('0%');
      expect(stripped).toContain('[');
      expect(stripped).toContain(']');
    });

    test('renders progress bar at 50%', () => {
      const result = renderProgressBar({ value: 50, max: 100, width: 20 });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('50%');
    });

    test('renders progress bar at 100%', () => {
      const result = renderProgressBar({ value: 100, max: 100, width: 20 });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('100%');
    });

    test('calculates percentage correctly with custom max', () => {
      const result = renderProgressBar({ value: 25, max: 50, width: 20 });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('50%');
    });

    test('renders with custom characters', () => {
      const result = renderProgressBar({
        value: 50,
        char: '#',
        emptyChar: '-',
        width: 10
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('#');
      expect(stripped).toContain('-');
    });

    test('hides percentage when showPercentage is false', () => {
      const result = renderProgressBar({
        value: 50,
        showPercentage: false,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).not.toContain('%');
    });

    test('renders with label on left', () => {
      const result = renderProgressBar({
        value: 50,
        label: 'Loading',
        labelPosition: 'left',
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Loading');
    });

    test('renders with label on right', () => {
      const result = renderProgressBar({
        value: 50,
        label: 'Progress',
        labelPosition: 'right',
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Progress');
    });

    test('renders with label above', () => {
      const result = renderProgressBar({
        value: 50,
        label: 'Loading',
        labelPosition: 'above',
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Loading');
    });

    test('renders with label below', () => {
      const result = renderProgressBar({
        value: 50,
        label: 'Complete',
        labelPosition: 'below',
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Complete');
    });

    test('renders without brackets', () => {
      const result = renderProgressBar({
        value: 50,
        brackets: false,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).not.toContain('[');
      expect(stripped).not.toContain(']');
    });

    test('renders with custom colors', () => {
      const result = renderProgressBar({
        value: 50,
        color: 'blue',
        emptyColor: 'gray',
        percentageColor: 'yellow',
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // Should contain percentage and brackets
      expect(stripped).toContain('50%');
      expect(stripped).toContain('[');
      expect(stripped).toContain(']');
    });

    test('handles value exceeding max', () => {
      const result = renderProgressBar({
        value: 150,
        max: 100,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('100%');
    });

    test('handles negative value', () => {
      const result = renderProgressBar({
        value: -10,
        max: 100,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('0%');
    });

    test('renders with custom width', () => {
      const result = renderProgressBar({
        value: 50,
        width: 60
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // Should have content
      expect(stripped).toContain('50%');
      expect(stripped).toContain('[');
    });

    test('renders with small width', () => {
      const result = renderProgressBar({
        value: 50,
        width: 5
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // Should still have content even with small width
      expect(stripped.length).toBeGreaterThan(0);
      expect(stripped).toContain('50%');
    });
  });

  describe('edge cases', () => {
    test('handles zero max value', () => {
      const result = renderProgressBar({
        value: 50,
        max: 0,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // Should handle gracefully (likely shows 100% or 0%)
      expect(stripped.length).toBeGreaterThan(0);
      expect(stripped).toMatch(/%/);
    });

    test('handles very small progress', () => {
      const result = renderProgressBar({
        value: 1,
        max: 1000,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('0%');
    });

    test('handles decimal values', () => {
      const result = renderProgressBar({
        value: 33.33,
        max: 100,
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('33%');
    });

    test('handles empty label', () => {
      const result = renderProgressBar({
        value: 50,
        label: '',
        width: 20
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // Should still render progress bar
      expect(stripped).toContain('50%');
      expect(stripped).toContain('[');
    });
  });
});
