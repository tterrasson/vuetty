/**
 * Tests for Spinner component
 */

import { test, expect, describe } from 'bun:test';
import { renderSpinner, SPINNER_FRAMES } from '../../src/components/Spinner.js';
import { stripAnsi } from '../helpers/test-utils.js';

describe('Spinner component', () => {
  describe('SPINNER_FRAMES', () => {
    test('contains all spinner types', () => {
      expect(SPINNER_FRAMES).toHaveProperty('dots');
      expect(SPINNER_FRAMES).toHaveProperty('line');
      expect(SPINNER_FRAMES).toHaveProperty('arc');
      expect(SPINNER_FRAMES).toHaveProperty('arrow');
      expect(SPINNER_FRAMES).toHaveProperty('bounce');
      expect(SPINNER_FRAMES).toHaveProperty('clock');
      expect(SPINNER_FRAMES).toHaveProperty('box');
    });

    test('dots spinner has frames', () => {
      expect(SPINNER_FRAMES.dots.length).toBeGreaterThan(0);
      expect(Array.isArray(SPINNER_FRAMES.dots)).toBe(true);
    });

    test('line spinner has 4 frames', () => {
      expect(SPINNER_FRAMES.line).toEqual(['-', '\\', '|', '/']);
    });

    test('arc spinner has frames', () => {
      expect(SPINNER_FRAMES.arc.length).toBeGreaterThan(0);
    });

    test('all spinner types have at least one frame', () => {
      Object.values(SPINNER_FRAMES).forEach(frames => {
        expect(frames.length).toBeGreaterThan(0);
      });
    });
  });

  describe('renderSpinner', () => {
    test('renders spinner with default type', () => {
      const result = renderSpinner({ currentFrame: 0 });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped.length).toBeGreaterThan(0);
    });

    test('renders dots spinner', () => {
      const result = renderSpinner({ type: 'dots', currentFrame: 0 });
      const stripped = stripAnsi(result);

      expect(SPINNER_FRAMES.dots).toContain(stripped.trim().split(' ')[0]);
    });

    test('renders line spinner', () => {
      const result = renderSpinner({ type: 'line', currentFrame: 0 });
      const stripped = stripAnsi(result);

      expect(SPINNER_FRAMES.line).toContain(stripped.trim().split(' ')[0]);
    });

    test('renders arc spinner', () => {
      const result = renderSpinner({ type: 'arc', currentFrame: 0 });
      const stripped = stripAnsi(result);

      expect(SPINNER_FRAMES.arc).toContain(stripped.trim().split(' ')[0]);
    });

    test('renders arrow spinner', () => {
      const result = renderSpinner({ type: 'arrow', currentFrame: 0 });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(SPINNER_FRAMES.arrow).toContain(stripped.trim().split(' ')[0]);
    });

    test('renders bounce spinner', () => {
      const result = renderSpinner({ type: 'bounce', currentFrame: 0 });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(SPINNER_FRAMES.bounce).toContain(stripped.trim().split(' ')[0]);
    });

    test('renders clock spinner', () => {
      const result = renderSpinner({ type: 'clock', currentFrame: 0 });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(SPINNER_FRAMES.clock).toContain(stripped.trim().split(' ')[0]);
    });

    test('renders box spinner', () => {
      const result = renderSpinner({ type: 'box', currentFrame: 0 });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(SPINNER_FRAMES.box).toContain(stripped.trim().split(' ')[0]);
    });

    test('cycles through frames', () => {
      const results = [];
      for (let i = 0; i < 3; i++) {
        results.push(renderSpinner({ type: 'line', currentFrame: i }));
      }

      // Each frame should render
      expect(results.length).toBe(3);
      results.forEach(result => expect(result).toBeTruthy());
    });

    test('renders with label on right', () => {
      const result = renderSpinner({
        type: 'dots',
        currentFrame: 0,
        label: 'Loading...',
        labelPosition: 'right'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Loading...');
    });

    test('renders with label on left', () => {
      const result = renderSpinner({
        type: 'dots',
        currentFrame: 0,
        label: 'Processing',
        labelPosition: 'left'
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Processing');
    });

    test('renders without label', () => {
      const result = renderSpinner({
        type: 'dots',
        currentFrame: 0,
        label: ''
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(SPINNER_FRAMES.dots).toContain(stripped.trim());
    });

    test('applies color styling', () => {
      const result = renderSpinner({
        type: 'dots',
        currentFrame: 0,
        color: 'blue'
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(SPINNER_FRAMES.dots).toContain(stripped.trim());
    });

    test('applies bold styling', () => {
      const result = renderSpinner({
        type: 'dots',
        currentFrame: 0,
        bold: true
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(SPINNER_FRAMES.dots).toContain(stripped.trim());
    });

    test('applies multiple styles', () => {
      const result = renderSpinner({
        type: 'dots',
        currentFrame: 0,
        color: 'cyan',
        bold: true,
        italic: true
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(SPINNER_FRAMES.dots).toContain(stripped.trim());
    });
  });

  describe('edge cases', () => {
    test('handles invalid spinner type gracefully', () => {
      const result = renderSpinner({
        type: 'invalid',
        currentFrame: 0
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped.length).toBeGreaterThan(0);
    });

    test('handles large frame numbers', () => {
      const result = renderSpinner({
        type: 'dots',
        currentFrame: 100
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(SPINNER_FRAMES.dots).toContain(stripped.trim());
    });

    test('handles negative frame numbers', () => {
      const result = renderSpinner({
        type: 'dots',
        currentFrame: -1
      });
      const stripped = stripAnsi(result);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(stripped.length).toBeGreaterThan(0);
    });

    test('handles very long labels', () => {
      const longLabel = 'A'.repeat(100);
      const result = renderSpinner({
        type: 'dots',
        currentFrame: 0,
        label: longLabel
      });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('A');
    });
  });
});
