/**
 * Tests for Image component
 */

import { test, expect, describe } from 'bun:test';
import { renderImage, clearImageCache } from '../../src/components/Image.js';

describe('Image component', () => {
  describe('renderImage', () => {
    test('renders empty string when no imageData', () => {
      const result = renderImage({});

      expect(result).toBe('');
    });

    test('renders imageData when provided', () => {
      const imageData = 'Image ASCII art here';
      const result = renderImage({ imageData });

      expect(result).toBe(imageData);
    });

    test('handles multi-line imageData', () => {
      const imageData = 'Line 1\nLine 2\nLine 3';
      const result = renderImage({ imageData });

      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
    });

    test('handles empty imageData string', () => {
      const result = renderImage({ imageData: '' });

      expect(result).toBe('');
    });

    test('handles imageData with ANSI codes', () => {
      const imageData = '\x1b[31mRed image\x1b[0m';
      const result = renderImage({ imageData });

      expect(result).toBe(imageData);
    });

    test('handles imageData with special characters', () => {
      const imageData = '▓▒░ ◆◇○●';
      const result = renderImage({ imageData });

      expect(result).toBe(imageData);
    });

    test('handles imageData with unicode characters', () => {
      const imageData = '世界 🌍';
      const result = renderImage({ imageData });

      expect(result).toBe(imageData);
    });

    test('handles props with imageData', () => {
      const imageData = 'Test image';
      const result = renderImage({
        imageData,
        imageLines: 5,
        flex: 1
      });

      expect(result).toBe(imageData);
    });
  });

  describe('clearImageCache', () => {
    test('clearImageCache executes without error', () => {
      expect(() => clearImageCache()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    test('handles null imageData', () => {
      const result = renderImage({ imageData: null });

      expect(result).toBe('');
    });

    test('handles undefined imageData', () => {
      const result = renderImage({ imageData: undefined });

      expect(result).toBe('');
    });

    test('handles very long imageData', () => {
      const imageData = 'A'.repeat(10000);
      const result = renderImage({ imageData });

      expect(result).toBe(imageData);
      expect(result.length).toBe(10000);
    });

    test('handles imageData with only whitespace', () => {
      const imageData = '   \n   \n   ';
      const result = renderImage({ imageData });

      expect(result).toBe(imageData);
    });

    test('handles imageData with tabs', () => {
      const imageData = 'Tab\there\tand\tthere';
      const result = renderImage({ imageData });

      expect(result).toContain('\t');
    });

    test('renders with no props', () => {
      const result = renderImage({});

      expect(result).toBe('');
    });
  });
});
