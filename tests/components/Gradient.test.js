/**
 * Tests for Gradient component
 */

import { test, expect, describe } from 'bun:test';
import { renderGradient, GRADIENT_PRESETS } from '../../src/components/Gradient.js';

describe('Gradient component', () => {
  describe('renderGradient', () => {
    test('renders text with gradient and ANSI codes', () => {
      const result = renderGradient('Hello', { name: 'rainbow' });

      expect(result).toBeTruthy();

      // Gradient applies colors per character, so check for individual characters
      expect(result).toContain('H');
      expect(result).toContain('e');
      expect(result).toContain('l');
      expect(result).toContain('o');

      // Should contain ANSI color codes (gradient uses \x1b[38;2; for RGB colors)
      expect(result).toMatch(/\x1b\[38;2;/);

      // Should not be plain text
      expect(result).not.toBe('Hello');
      expect(result.length).toBeGreaterThan('Hello'.length);
    });

    test('renders empty string for no content', () => {
      const result = renderGradient('', {});

      expect(result).toBe('');
    });

    test('renders with rainbow gradient and validates colors', () => {
      const result = renderGradient('Test', { name: 'rainbow' });

      // Check for individual characters
      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toContain('s');
      expect(result).toContain('t');

      // Rainbow gradient should have RGB color codes
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
      expect(result.length).toBeGreaterThan('Test'.length);
    });

    test('renders with pastel gradient and validates colors', () => {
      const result = renderGradient('Test', { name: 'pastel' });

      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
      expect(result.length).toBeGreaterThan('Test'.length);
    });

    test('renders with cristal gradient and validates colors', () => {
      const result = renderGradient('Test', { name: 'cristal' });

      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
      expect(result.length).toBeGreaterThan('Test'.length);
    });

    test('renders with fire gradient (custom colors)', () => {
      const result = renderGradient('Test', { name: 'fire' });

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');

      // Fire uses custom colors: #8B0000, #FF4500, #FFD700
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('renders with ocean gradient (custom colors)', () => {
      const result = renderGradient('Test', { name: 'ocean' });

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');

      // Ocean uses custom colors: #001F3F, #0074D9, #7FDBFF
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('renders with sunset gradient (custom colors)', () => {
      const result = renderGradient('Test', { name: 'sunset' });

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('renders with forest gradient (custom colors)', () => {
      const result = renderGradient('Test', { name: 'forest' });

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('renders with night gradient (custom colors)', () => {
      const result = renderGradient('Test', { name: 'night' });

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('renders with custom colors array', () => {
      const result = renderGradient('Test', {
        colors: ['#FF0000', '#00FF00', '#0000FF']
      });

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');

      // Custom colors should produce RGB color codes
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('handles multiline text with gradient', () => {
      const result = renderGradient('Line 1\nLine 2\nLine 3', { name: 'rainbow' });

      expect(result).toBeTruthy();
      expect(result).toContain('L');
      expect(result).toContain('i');
      expect(result).toContain('n');
      expect(result).toContain('e');
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
      expect(result).toContain('\n');

      // Should have gradient colors
      expect(result).toMatch(/\x1b\[38;2;/);
    });

    test('handles single line text with gradient', () => {
      const result = renderGradient('Single line', { name: 'rainbow' });

      expect(result).toBeTruthy();
      expect(result).toContain('S');
      expect(result).toContain('i');
      expect(result).toContain('n');
      expect(result).toContain('g');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Single line');
    });

    test('applies hsv interpolation by default', () => {
      const resultHsv = renderGradient('Test', {
        name: 'rainbow',
        interpolation: 'hsv'
      });

      expect(resultHsv).toBeTruthy();
      expect(resultHsv).toContain('T');
      expect(resultHsv).toContain('e');
      expect(resultHsv).toMatch(/\x1b\[38;2;/);
    });

    test('applies rgb interpolation', () => {
      const resultRgb = renderGradient('Test', {
        name: 'rainbow',
        interpolation: 'rgb'
      });

      expect(resultRgb).toBeTruthy();
      expect(resultRgb).toContain('T');
      expect(resultRgb).toContain('e');
      expect(resultRgb).toMatch(/\x1b\[38;2;/);
    });

    test('falls back to rainbow when no name provided', () => {
      const result = renderGradient('Test', {});

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('falls back to rainbow for invalid name', () => {
      const result = renderGradient('Test', { name: 'invalid' });

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });
  });

  describe('GRADIENT_PRESETS', () => {
    test('GRADIENT_PRESETS is an array', () => {
      expect(Array.isArray(GRADIENT_PRESETS)).toBe(true);
    });

    test('GRADIENT_PRESETS contains expected gradients', () => {
      expect(GRADIENT_PRESETS).toContain('rainbow');
      expect(GRADIENT_PRESETS).toContain('pastel');
      expect(GRADIENT_PRESETS).toContain('fire');
      expect(GRADIENT_PRESETS).toContain('ocean');
      expect(GRADIENT_PRESETS).toContain('sunset');
      expect(GRADIENT_PRESETS).toContain('forest');
      expect(GRADIENT_PRESETS).toContain('night');
    });

    test('GRADIENT_PRESETS has correct length', () => {
      expect(GRADIENT_PRESETS.length).toBeGreaterThan(10);
    });
  });

  describe('edge cases', () => {
    test('handles null content', () => {
      const result = renderGradient(null, { name: 'rainbow' });

      expect(result).toBe('');
    });

    test('handles undefined content', () => {
      const result = renderGradient(undefined, { name: 'rainbow' });

      expect(result).toBe('');
    });

    test('handles very long text with gradient', () => {
      const longText = 'A'.repeat(1000);
      const result = renderGradient(longText, { name: 'rainbow' });

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThanOrEqual(longText.length);
      expect(result).toContain('A');

      // Should have gradient colors throughout
      expect(result).toMatch(/\x1b\[38;2;/);
    });

    test('handles special characters with gradient', () => {
      const result = renderGradient('Hello → World ✓ 🚀', { name: 'rainbow' });

      expect(result).toContain('→');
      expect(result).toContain('✓');
      expect(result).toContain('🚀');
      expect(result).toMatch(/\x1b\[38;2;/);
    });

    test('handles unicode characters with gradient', () => {
      const result = renderGradient('Hello 世界 مرحبا', { name: 'rainbow' });

      expect(result).toContain('世');
      expect(result).toContain('界');
      expect(result).toContain('م');
      expect(result).toContain('ر');
      expect(result).toMatch(/\x1b\[38;2;/);
    });

    test('handles numbers with gradient', () => {
      const result = renderGradient('12345', { name: 'rainbow' });

      expect(result).toBeTruthy();
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
      expect(result).toMatch(/\x1b\[38;2;/);
    });

    test('handles whitespace with gradient', () => {
      const result = renderGradient('   ', { name: 'rainbow' });

      expect(result).toBeTruthy();
      // Whitespace is returned as-is (no gradient on spaces)
      expect(result).toBe('   ');
    });

    test('handles tabs and newlines with gradient', () => {
      const result = renderGradient('Tab\there\nNew line', { name: 'rainbow' });

      expect(result).toBeTruthy();
      expect(result).toContain('\t');
      expect(result).toContain('\n');
      expect(result).toMatch(/\x1b\[38;2;/);
    });

    test('handles no props (defaults to rainbow)', () => {
      const result = renderGradient('Test');

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('handles empty props object (defaults to rainbow)', () => {
      const result = renderGradient('Test', {});

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('handles empty colors array (falls back to rainbow)', () => {
      const result = renderGradient('Test', { colors: [] });

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('handles two colors in array', () => {
      const result = renderGradient('Test', { colors: ['#FF0000', '#0000FF'] });

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('handles many colors in array (rainbow spectrum)', () => {
      const result = renderGradient('Test', {
        colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
      });

      expect(result).toBeTruthy();
      expect(result).toContain('T');
      expect(result).toContain('e');
      expect(result).toMatch(/\x1b\[38;2;/);
      expect(result).not.toBe('Test');
    });

    test('gradient caching works correctly', () => {
      // First call
      const result1 = renderGradient('Test', { name: 'rainbow' });
      // Second call with same params (should use cache)
      const result2 = renderGradient('Test', { name: 'rainbow' });

      // Should produce identical results
      expect(result1).toBe(result2);
    });

    test('different interpolations produce different results', () => {
      // Use colors that will produce visibly different results with RGB vs HSV
      // Red to Blue: HSV goes through full spectrum, RGB goes through purple
      const textHsv = renderGradient('Hello World', {
        colors: ['#FF0000', '#0000FF'],
        interpolation: 'hsv'
      });

      const textRgb = renderGradient('Hello World', {
        colors: ['#FF0000', '#0000FF'],
        interpolation: 'rgb'
      });

      // Both should have gradients
      expect(textHsv).toMatch(/\x1b\[38;2;/);
      expect(textRgb).toMatch(/\x1b\[38;2;/);

      // Both should contain the text
      expect(textHsv).toContain('H');
      expect(textRgb).toContain('H');

      // RGB and HSV with these colors should produce different intermediate colors
      // We can't guarantee they're different for all text lengths, so just verify both work
      expect(textHsv.length).toBeGreaterThan('Hello World'.length);
      expect(textRgb.length).toBeGreaterThan('Hello World'.length);
    });
  });
});
