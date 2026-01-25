/**
 * Integration tests for text effects with TextBox component
 */

import { test, expect, describe, beforeEach } from 'bun:test';
import { renderText } from '../../src/components/TextBox.js';
import { effectRegistry } from '../../src/effects/effectRegistry.js';

// Import effects to register them
import '../../src/effects/textEffects.js';

describe('Text Effects Integration with TextBox', () => {
  beforeEach(() => {
    // Ensure effects are registered
    expect(effectRegistry.has('rainbow')).toBe(true);
    expect(effectRegistry.has('pulse')).toBe(true);
    expect(effectRegistry.has('wave')).toBe(true);
    expect(effectRegistry.has('shimmer')).toBe(true);
  });

  describe('renderText with effects', () => {
    test('applies rainbow effect via renderText', () => {
      const text = 'Rainbow Text';
      const result = renderText(text, {
        effect: 'rainbow',
        _effectFrame: 0
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe(text); // Should be styled
      expect(result.length).toBeGreaterThan(text.length); // Contains ANSI codes
    });

    test('applies pulse effect via renderText', () => {
      const text = 'Pulse Text';
      const result = renderText(text, {
        effect: 'pulse',
        effectProps: { color: 'white' },
        _effectFrame: 0
      });

      expect(result).toBeTruthy();
      expect(result).not.toBe(text);
    });

    test('applies wave effect via renderText', () => {
      const text = 'Wave Text';
      const result = renderText(text, {
        effect: 'wave',
        effectProps: {
          colors: ['#FF0000', '#00FF00'],
          wavelength: 10
        },
        _effectFrame: 0
      });

      expect(result).toBeTruthy();
      expect(result).not.toBe(text);
    });

    test('applies shimmer effect via renderText', () => {
      const text = 'Shimmer Text';
      const result = renderText(text, {
        effect: 'shimmer',
        effectProps: {
          baseColor: '#666666',
          highlightColor: '#FFFFFF',
          width: 3
        },
        _effectFrame: 0
      });

      expect(result).toBeTruthy();
      expect(result).not.toBe(text);
    });

    test('effect takes precedence over color/bg props', () => {
      const text = 'Effect Priority';
      const withEffect = renderText(text, {
        effect: 'rainbow',
        color: 'red',
        bg: 'blue',
        _effectFrame: 0
      });

      const withoutEffect = renderText(text, {
        color: 'red',
        bg: 'blue'
      });

      // The results should be different because effect handles its own coloring
      expect(withEffect).not.toBe(withoutEffect);
    });

    test('invalid effect name falls back to normal styling', () => {
      const text = 'Fallback';
      const result = renderText(text, {
        effect: 'nonexistent',
        color: 'green',
        _effectFrame: 0
      });

      // Should still apply the color since effect doesn't exist
      expect(result).toBeTruthy();
      expect(result).toContain('\x1b[32m'); // Green color code
    });

    test('effect with padding applies padding correctly', () => {
      const text = 'Padded';
      const result = renderText(text, {
        effect: 'rainbow',
        padding: 2,
        width: 20,
        _effectFrame: 0
      });

      expect(result).toBeTruthy();
      expect(result).toContain('\n'); // Should have padding lines

      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Has vertical padding
    });

    test('effect with width wraps text correctly', () => {
      const text = 'This is a long text that should wrap';
      const result = renderText(text, {
        effect: 'rainbow',
        width: 15,
        _effectFrame: 0
      });

      expect(result).toBeTruthy();
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Text should wrap
    });

    test('animated effect changes with frame', () => {
      const text = 'Animated';

      const frame0 = renderText(text, {
        effect: 'rainbow',
        _effectFrame: 0
      });

      const frame10 = renderText(text, {
        effect: 'rainbow',
        _effectFrame: 10
      });

      // Different frames should produce different output
      expect(frame0).not.toBe(frame10);
    });

    test('effectProps are passed correctly to effect function', () => {
      const text = 'Custom Props';

      const default_ = renderText(text, {
        effect: 'wave',
        _effectFrame: 0
      });

      const custom = renderText(text, {
        effect: 'wave',
        effectProps: {
          colors: ['#FF0000', '#00FF00', '#0000FF'],
          wavelength: 5
        },
        _effectFrame: 0
      });

      // Different props should produce different output
      expect(default_).not.toBe(custom);
    });
  });

  describe('Effect metadata from registry', () => {
    test('rainbow effect is marked as animated', () => {
      const effectDef = effectRegistry.get('rainbow');
      expect(effectDef).toBeTruthy();
      expect(effectDef.animated).toBe(true);
      expect(effectDef.defaultInterval).toBeDefined();
      expect(typeof effectDef.defaultInterval).toBe('number');
    });

    test('pulse effect is marked as animated', () => {
      const effectDef = effectRegistry.get('pulse');
      expect(effectDef).toBeTruthy();
      expect(effectDef.animated).toBe(true);
      expect(effectDef.defaultInterval).toBeDefined();
    });

    test('wave effect is marked as animated', () => {
      const effectDef = effectRegistry.get('wave');
      expect(effectDef).toBeTruthy();
      expect(effectDef.animated).toBe(true);
      expect(effectDef.defaultInterval).toBeDefined();
    });

    test('shimmer effect is marked as animated', () => {
      const effectDef = effectRegistry.get('shimmer');
      expect(effectDef).toBeTruthy();
      expect(effectDef.animated).toBe(true);
      expect(effectDef.defaultInterval).toBeDefined();
    });

    test('all effects have function implementations', () => {
      const effects = ['rainbow', 'pulse', 'wave', 'shimmer'];

      effects.forEach(effectName => {
        const effectDef = effectRegistry.get(effectName);
        expect(effectDef).toBeTruthy();
        expect(typeof effectDef.fn).toBe('function');
      });
    });
  });

  describe('Complex scenarios', () => {
    test('multiline text with effect and padding', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const result = renderText(text, {
        effect: 'rainbow',
        padding: 1,
        width: 20,
        _effectFrame: 5
      });

      expect(result).toBeTruthy();
      const lines = result.split('\n');

      // Should have original 3 lines + padding
      expect(lines.length).toBeGreaterThan(3);
    });

    test('effect with height constraint', () => {
      const text = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
      const result = renderText(text, {
        effect: 'wave',
        _targetHeight: 3,
        _effectFrame: 0
      });

      expect(result).toBeTruthy();
      const lines = result.split('\n');

      // Height should be constrained to 3 lines
      expect(lines.length).toBeLessThanOrEqual(3);
    });

    test('effect with horizontal padding', () => {
      const text = 'Padded';
      const result = renderText(text, {
        effect: 'shimmer',
        paddingLeft: 2,
        paddingRight: 2,
        width: 15,
        _effectFrame: 0
      });

      expect(result).toBeTruthy();

      // Check that padding spaces are present
      const lines = result.split('\n');
      lines.forEach(line => {
        // Each line should start with spaces (padding)
        // Note: ANSI codes might be present, so we can't do exact match
        expect(line.length).toBeGreaterThan('Padded'.length);
      });
    });

    test('effect with vertical padding', () => {
      const text = 'Text';
      const result = renderText(text, {
        effect: 'pulse',
        effectProps: { color: 'white' },
        paddingTop: 2,
        paddingBottom: 2,
        width: 10,
        _effectFrame: 0
      });

      expect(result).toBeTruthy();
      const lines = result.split('\n');

      // Should have at least 5 lines (2 top + 1 content + 2 bottom)
      expect(lines.length).toBeGreaterThanOrEqual(5);
    });

    test('effect with injected width', () => {
      const text = 'This is a long line';
      const result = renderText(text, {
        effect: 'rainbow',
        _injectedWidth: 10,
        _effectFrame: 0
      });

      expect(result).toBeTruthy();
      const lines = result.split('\n');

      // Should wrap due to injected width
      expect(lines.length).toBeGreaterThan(1);
    });

    test('effect survives empty effectProps', () => {
      const text = 'Empty Props';
      const result = renderText(text, {
        effect: 'wave',
        effectProps: {},
        _effectFrame: 0
      });

      expect(result).toBeTruthy();
      expect(result).not.toBe(text); // Should still apply effect with defaults
    });

    test('effect survives null effectProps', () => {
      const text = 'Null Props';
      const result = renderText(text, {
        effect: 'shimmer',
        effectProps: null,
        _effectFrame: 0
      });

      expect(result).toBeTruthy();
      expect(result).not.toBe(text);
    });
  });

  describe('Performance', () => {
    test('renders large text with effect efficiently', () => {
      const largeText = 'Lorem ipsum '.repeat(100);
      const start = performance.now();

      const result = renderText(largeText, {
        effect: 'rainbow',
        width: 80,
        _effectFrame: 0
      });

      const duration = performance.now() - start;

      expect(result).toBeTruthy();
      expect(duration).toBeLessThan(200); // Should complete in < 200ms
    });

    test('renders multiline text with effect efficiently', () => {
      const multilineText = Array(50).fill('Text line').join('\n');
      const start = performance.now();

      const result = renderText(multilineText, {
        effect: 'wave',
        effectProps: { wavelength: 10 },
        _effectFrame: 5
      });

      const duration = performance.now() - start;

      expect(result).toBeTruthy();
      expect(duration).toBeLessThan(200); // Should complete in < 200ms
    });
  });
});
