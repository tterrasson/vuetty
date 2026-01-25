/**
 * Tests for text effects
 */

import { test, expect, describe, beforeEach } from 'bun:test';
import {
  rainbowEffect,
  pulseEffect,
  waveEffect,
  shimmerEffect,
  effectCache,
  parsedColorCache,
  parsedColorsArrayCache,
  clearEffectCaches
} from '../../src/effects/textEffects.js';
import { stripAnsi } from '../../src/utils/renderUtils.js';

describe('Text Effects', () => {
  beforeEach(() => {
    // Clear caches before each test
    effectCache.clear();
  });

  describe('rainbowEffect', () => {
    test('applies rainbow colors to text', () => {
      const text = 'Rainbow';
      const result = rainbowEffect(text, {}, 0);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe(text); // Should be styled
      expect(result.length).toBeGreaterThan(text.length); // Contains ANSI codes
    });

    test('preserves spaces and tabs', () => {
      const text = 'Hello\tWorld Test';
      const result = rainbowEffect(text, {}, 0);

      // Strip ANSI to check content
      const cleanResult = stripAnsi(result);
      expect(cleanResult).toContain('\t');
      expect(cleanResult).toContain('Hello');
      expect(cleanResult).toContain('World');
    });

    test('handles multiline text', () => {
      const text = 'Line 1\nLine 2';
      const result = rainbowEffect(text, {}, 0);

      const cleanResult = stripAnsi(result);
      expect(cleanResult).toContain('\n');
      expect(cleanResult).toContain('Line 1');
      expect(cleanResult).toContain('Line 2');
    });

    test('animation changes with frame number', () => {
      const text = 'Animate';
      const frame0 = rainbowEffect(text, { speed: 1 }, 0);
      const frame10 = rainbowEffect(text, { speed: 1 }, 10);

      expect(frame0).not.toBe(frame10); // Different frames produce different output
    });

    test('respects speed parameter', () => {
      const text = 'Speed';
      const slow = rainbowEffect(text, { speed: 0.5 }, 10);
      const fast = rainbowEffect(text, { speed: 2 }, 10);

      expect(slow).not.toBe(fast);
    });

    test('handles empty string', () => {
      const result = rainbowEffect('', {}, 0);
      expect(result).toBe('');
    });

    test('uses cache for repeated calls', () => {
      const text = 'Cached';
      const props = { speed: 1 };

      effectCache.clear();
      expect(effectCache.size).toBe(0);

      const result1 = rainbowEffect(text, props, 0);
      expect(effectCache.size).toBe(1);

      const result2 = rainbowEffect(text, props, 0);
      expect(effectCache.size).toBe(1); // Still 1, cache was used

      expect(result1).toBe(result2);
    });
  });

  describe('pulseEffect', () => {
    test('applies pulsing brightness to text', () => {
      const text = 'Pulse';
      const result = pulseEffect(text, { color: 'white' }, 0);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe(text);
      expect(result.length).toBeGreaterThan(text.length);
    });

    test('animation changes with frame number', () => {
      const text = 'Pulse';
      const frame0 = pulseEffect(text, { color: 'white' }, 0);
      const frame10 = pulseEffect(text, { color: 'white' }, 10);

      // Different frames should produce different brightness
      expect(frame0).not.toBe(frame10);
    });

    test('respects color parameter', () => {
      const text = 'Color';
      const white = pulseEffect(text, { color: 'white' }, 0);
      const red = pulseEffect(text, { color: 'red' }, 0);

      expect(white).not.toBe(red);
    });

    test('respects brightness range', () => {
      const text = 'Bright';
      const result = pulseEffect(text, {
        color: 'white',
        minBrightness: 0.2,
        maxBrightness: 0.8
      }, 0);

      expect(result).toBeTruthy();
      expect(result).not.toBe(text);
    });

    test('handles empty string', () => {
      const result = pulseEffect('', { color: 'white' }, 0);
      expect(result).toBe('');
    });

    test('handles multiline text', () => {
      const text = 'Line 1\nLine 2';
      const result = pulseEffect(text, { color: 'blue' }, 0);

      expect(result).toContain('\n');
    });
  });

  describe('waveEffect', () => {
    test('applies wave color pattern to text', () => {
      const text = 'Wave';
      const result = waveEffect(text, {}, 0);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe(text);
      expect(result.length).toBeGreaterThan(text.length);
    });

    test('animation changes with frame number', () => {
      const text = 'Wave';
      const frame0 = waveEffect(text, {}, 0);
      const frame10 = waveEffect(text, {}, 10);

      expect(frame0).not.toBe(frame10);
    });

    test('respects custom colors', () => {
      const text = 'Colors';
      const result = waveEffect(text, {
        colors: ['#FF0000', '#00FF00', '#0000FF']
      }, 0);

      expect(result).toBeTruthy();
      expect(result).not.toBe(text);
    });

    test('respects wavelength parameter', () => {
      const text = 'Wavelength Test';
      const short = waveEffect(text, { wavelength: 5 }, 0);
      const long = waveEffect(text, { wavelength: 20 }, 0);

      expect(short).not.toBe(long);
    });

    test('respects speed parameter', () => {
      const text = 'Speed';
      const slow = waveEffect(text, { speed: 0.5 }, 5);
      const fast = waveEffect(text, { speed: 2 }, 5);

      expect(slow).not.toBe(fast);
    });

    test('preserves spaces and tabs', () => {
      const text = 'Hello\tWorld';
      const result = waveEffect(text, {}, 0);

      expect(result).toContain('\t');
    });

    test('handles empty string', () => {
      const result = waveEffect('', {}, 0);
      expect(result).toBe('');
    });
  });

  describe('shimmerEffect', () => {
    test('applies shimmer highlight to text', () => {
      const text = 'Shimmer';
      const result = shimmerEffect(text, {}, 0);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe(text);
      expect(result.length).toBeGreaterThan(text.length);
    });

    test('animation changes with frame number', () => {
      const text = 'Shimmer';
      const frame0 = shimmerEffect(text, {}, 0);
      const frame10 = shimmerEffect(text, {}, 10);

      expect(frame0).not.toBe(frame10);
    });

    test('respects baseColor parameter', () => {
      const text = 'Color';
      const gray = shimmerEffect(text, { baseColor: '#666666' }, 0);
      const dark = shimmerEffect(text, { baseColor: '#000000' }, 0);

      expect(gray).not.toBe(dark);
    });

    test('respects highlightColor parameter', () => {
      const text = 'Highlight';
      const white = shimmerEffect(text, { highlightColor: '#FFFFFF' }, 0);
      const yellow = shimmerEffect(text, { highlightColor: '#FFFF00' }, 0);

      expect(white).not.toBe(yellow);
    });

    test('respects width parameter', () => {
      const text = 'Width Test';
      const narrow = shimmerEffect(text, { width: 2 }, 0);
      const wide = shimmerEffect(text, { width: 5 }, 0);

      expect(narrow).not.toBe(wide);
    });

    test('respects speed parameter', () => {
      const text = 'Speed';
      const slow = shimmerEffect(text, { speed: 0.5 }, 10);
      const fast = shimmerEffect(text, { speed: 2 }, 10);

      expect(slow).not.toBe(fast);
    });

    test('preserves spaces and tabs', () => {
      const text = 'Hello\tWorld';
      const result = shimmerEffect(text, {}, 0);

      expect(result).toContain('\t');
    });

    test('handles empty string', () => {
      const result = shimmerEffect('', {}, 0);
      expect(result).toBe('');
    });

    test('handles multiline text', () => {
      const text = 'Line 1\nLine 2';
      const result = shimmerEffect(text, {}, 0);

      expect(result).toContain('\n');
    });
  });

  describe('Effect caching', () => {
    test('clearEffectCaches() clears all caches', () => {
      // Populate all caches
      rainbowEffect('test1', { speed: 1 }, 0);
      pulseEffect('test2', { color: 'red' }, 0);
      waveEffect('test3', { colors: ['#FF0000', '#00FF00'] }, 0);

      // Verify caches have data
      expect(effectCache.size).toBeGreaterThan(0);
      expect(parsedColorCache.size).toBeGreaterThan(0);
      expect(parsedColorsArrayCache.size).toBeGreaterThan(0);

      // Clear all caches
      clearEffectCaches();

      // Verify all caches are empty
      expect(effectCache.size).toBe(0);
      expect(parsedColorCache.size).toBe(0);
      expect(parsedColorsArrayCache.size).toBe(0);
    });

    test('cache stores and retrieves results', () => {
      effectCache.clear();
      expect(effectCache.size).toBe(0);

      const text = 'Cache Test';
      const props = { speed: 1 };

      // First call - computes and caches
      const result1 = rainbowEffect(text, props, 0);
      expect(effectCache.size).toBeGreaterThan(0);
      const cacheSize = effectCache.size;

      // Second call - uses cache
      const result2 = rainbowEffect(text, props, 0);
      expect(effectCache.size).toBe(cacheSize); // Cache size unchanged
      expect(result1).toBe(result2); // Same result
    });

    test('different frames create different cache entries', () => {
      effectCache.clear();

      const text = 'Frames';
      const props = { speed: 1 };

      rainbowEffect(text, props, 0);
      const cacheSize1 = effectCache.size;

      rainbowEffect(text, props, 1);
      const cacheSize2 = effectCache.size;

      expect(cacheSize2).toBeGreaterThan(cacheSize1);
    });

    test('different props create different cache entries', () => {
      effectCache.clear();

      const text = 'Props';

      rainbowEffect(text, { speed: 1 }, 0);
      const cacheSize1 = effectCache.size;

      rainbowEffect(text, { speed: 2 }, 0);
      const cacheSize2 = effectCache.size;

      expect(cacheSize2).toBeGreaterThan(cacheSize1);
    });

    test('cache evicts old entries when full', () => {
      effectCache.clear();

      // Fill cache beyond MAX_CACHE (100 entries)
      for (let i = 0; i < 150; i++) {
        rainbowEffect(`text${i}`, {}, 0);
      }

      // Cache should not exceed MAX_CACHE + some buffer
      expect(effectCache.size).toBeLessThanOrEqual(110);
    });
  });

  describe('Performance optimizations', () => {
    test('parsedColorCache caches parsed colors', () => {
      parsedColorCache.clear();

      // First call should cache the parsed color
      pulseEffect('test', { color: 'red' }, 0);

      // Verify cache is being used
      expect(parsedColorCache).toBeDefined();
      expect(parsedColorCache.size).toBeGreaterThan(0);
      expect(typeof parsedColorCache.has).toBe('function');
    });

    test('handles long text efficiently', () => {
      const longText = 'A'.repeat(1000);
      const start = performance.now();

      const result = rainbowEffect(longText, {}, 0);

      const duration = performance.now() - start;

      expect(result).toBeTruthy();
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });

    test('handles many lines efficiently', () => {
      const manyLines = Array(100).fill('Text').join('\n');
      const start = performance.now();

      const result = rainbowEffect(manyLines, {}, 0);

      const duration = performance.now() - start;

      expect(result).toBeTruthy();
      expect(result.split('\n').length).toBe(100);
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });
  });

  describe('Edge cases', () => {
    test('handles text with only spaces', () => {
      const text = '     ';
      const result = rainbowEffect(text, {}, 0);

      expect(result).toBe(text); // Spaces should be preserved
    });

    test('handles text with only tabs', () => {
      const text = '\t\t\t';
      const result = waveEffect(text, {}, 0);

      expect(result).toBe(text); // Tabs should be preserved
    });

    test('handles single character', () => {
      const text = 'A';
      const result = rainbowEffect(text, {}, 0);

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(1); // Contains ANSI codes
    });

    test('handles unicode characters', () => {
      const text = '🌈 Rainbow 世界';
      const result = rainbowEffect(text, {}, 0);

      expect(result).toBeTruthy();
      const cleanResult = stripAnsi(result);
      expect(cleanResult).toContain('🌈');
      expect(cleanResult).toContain('世界');
    });

    test('handles text with existing ANSI codes stripped', () => {
      const text = '\x1b[31mRed text\x1b[0m';
      const result = rainbowEffect(text, {}, 0);

      // stripAnsi should be called internally
      expect(result).toBeTruthy();
    });
  });
});
