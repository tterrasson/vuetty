/**
 * Tests for Button component
 */

import { test, expect, describe } from 'bun:test';
import { renderButton } from '../../src/components/Button.js';

describe('Button component', () => {
  describe('renderButton', () => {
    test('renders button with label and ANSI codes', () => {
      const result = renderButton({ label: 'Click me' });

      expect(result).toContain('Click me');

      // Should have box borders
      expect(result).toContain('│');
      expect(result).toMatch(/╭|╰/);

      // Should have blue color for text and border (default primary)
      expect(result).toMatch(/\x1b\[94m/); // brightBlue
    });

    test('renders unfocused button with normal border', () => {
      const result = renderButton({ label: 'Click me', isFocused: false });

      // Should have box borders
      expect(result).toContain('│');
      expect(result).toMatch(/╭|╰/);
    });

    test('renders focused button with background fill', () => {
      const result = renderButton({ label: 'Click me', isFocused: true });

      expect(result).toContain('Click me');

      // Focused button has background fill and white text
      expect(result).toMatch(/\x1b\[37m/); // white text
      expect(result).toMatch(/\x1b\[1m/); // bold
    });

    test('adds padding around label', () => {
      const result = renderButton({ label: 'X' });

      // Should have spaces before and after X
      // Note: ANSI codes may be present between spaces and label
      expect(result).toMatch(/ .*X.* /);
    });

    test('disabled button has dim styling', () => {
      const result = renderButton({ label: 'Click me', disabled: true, isFocused: true });

      // Should have dim styling
      expect(result).toMatch(/\x1b\[2m/); // Dim
    });
  });

  describe('variants', () => {
    test('renders primary variant with blue text and border', () => {
      const result = renderButton({ label: 'Primary', variant: 'primary' });

      expect(result).toContain('Primary');

      // Primary: text and border use brightBlue
      expect(result).toMatch(/\x1b\[94m/); // brightBlue
      expect(result).toMatch(/\x1b\[1m/); // bold (variant default)
    });

    test('renders secondary variant with gray text and border', () => {
      const result = renderButton({ label: 'Secondary', variant: 'secondary' });

      expect(result).toContain('Secondary');

      // Secondary: text and border use bright white
      expect(result).toMatch(/\x1b\[97m/); // brightWhite
    });

    test('renders danger variant with red text and border', () => {
      const result = renderButton({ label: 'Danger', variant: 'danger' });

      expect(result).toContain('Danger');

      // Danger: text and border use brightRed
      expect(result).toMatch(/\x1b\[91m/); // brightRed
      expect(result).toMatch(/\x1b\[1m/); // bold
    });

    test('renders warning variant with yellow text and border', () => {
      const result = renderButton({ label: 'Warning', variant: 'warning' });

      expect(result).toContain('Warning');

      // Warning: text and border use brightYellow
      expect(result).toMatch(/\x1b\[93m/); // brightYellow
      expect(result).toMatch(/\x1b\[1m/); // bold
    });

    test('renders info variant with cyan text and border', () => {
      const result = renderButton({ label: 'Info', variant: 'info' });

      expect(result).toContain('Info');

      // Info: text and border use brightCyan
      expect(result).toMatch(/\x1b\[96m/); // brightCyan
    });

    test('renders success variant with green text and border', () => {
      const result = renderButton({ label: 'Success', variant: 'success' });

      expect(result).toContain('Success');

      // Success: text and border use brightGreen
      expect(result).toMatch(/\x1b\[92m/); // brightGreen
      expect(result).toMatch(/\x1b\[1m/); // bold
    });
  });

  describe('custom styling', () => {
    test('accepts custom bg and uses it for text and border', () => {
      const result = renderButton({ label: 'Custom', bg: 'red' });

      expect(result).toContain('Custom');

      // Should have red color for text and border
      expect(result).toMatch(/\x1b\[31m/); // red
    });

    test('accepts bold prop and applies it', () => {
      const result = renderButton({ label: 'Bold', bold: true, variant: 'secondary' });

      expect(result).toContain('Bold');

      // Should have bold
      expect(result).toMatch(/\x1b\[1m/); // bold
    });

    test('accepts italic prop and applies it', () => {
      const result = renderButton({ label: 'Italic', italic: true });

      expect(result).toContain('Italic');

      // Should have italic
      expect(result).toMatch(/\x1b\[3m/); // italic
    });

    test('accepts dim prop and applies it', () => {
      const result = renderButton({ label: 'Dim', dim: true });

      expect(result).toContain('Dim');

      // Should have dim
      expect(result).toMatch(/\x1b\[2m/); // dim
    });

    test('custom bg overrides variant color', () => {
      const result = renderButton({
        label: 'Override',
        variant: 'primary', // Would normally be blue
        bg: 'magenta' // Override to magenta
      });

      expect(result).toContain('Override');

      // Should use magenta for text and border
      expect(result).toMatch(/\x1b\[35m/); // magenta
    });
  });

  describe('focus styling', () => {
    test('focused button has background fill with white text', () => {
      const result = renderButton({ label: 'Focused', isFocused: true });

      expect(result).toContain('Focused');

      // Focused: white text, bold, background fill
      expect(result).toMatch(/\x1b\[37m/); // white
      expect(result).toMatch(/\x1b\[1m/); // bold
    });

    test('unfocused button has colored text matching border', () => {
      const result = renderButton({ label: 'Unfocused', isFocused: false });

      expect(result).toContain('Unfocused');

      // Should have colored text (blue for primary variant)
      expect(result).toMatch(/\x1b\[94m/); // brightBlue
    });
  });

  describe('pressed state', () => {
    test('pressed button uses inverse effect', () => {
      const result = renderButton({ label: 'Pressed', isPressed: true });

      expect(result).toContain('Pressed');

      // Should have inverse effect
      expect(result).toMatch(/\x1b\[7m/); // inverse
    });

    test('pressed and focused button applies inverse on top of focus', () => {
      const result = renderButton({ label: 'Both', isFocused: true, isPressed: true });

      expect(result).toContain('Both');

      // Should have both white text (from focus) and inverse
      expect(result).toMatch(/\x1b\[37m/); // white
      expect(result).toMatch(/\x1b\[7m/); // inverse
    });
  });

  describe('disabled state', () => {
    test('disabled button has dim styling', () => {
      const result = renderButton({ label: 'Disabled', disabled: true });

      expect(result).toContain('Disabled');

      // Should have dim styling
      expect(result).toMatch(/\x1b\[2m/); // dim
    });

    test('disabled and focused button does not have background fill', () => {
      const result = renderButton({ label: 'Disabled', disabled: true, isFocused: true });

      expect(result).toContain('Disabled');

      // Should still have dim styling
      expect(result).toMatch(/\x1b\[2m/); // dim
    });

    test('disabled button applies dim to label', () => {
      const result = renderButton({ label: 'Test', disabled: true });

      // Should have dim codes
      expect(result).toMatch(/\x1b\[2m/); // dim
      expect(result).toContain('│');
    });
  });

  describe('edge cases', () => {
    test('handles empty label', () => {
      const result = renderButton({ label: '' });

      // Should still have borders and padding
      expect(result).toContain('│');
      expect(result).toContain('  '); // padding spaces
    });

    test('handles long label', () => {
      const longLabel = 'This is a very long button label that might wrap';
      const result = renderButton({ label: longLabel });

      expect(result).toContain(longLabel);
      expect(result).toContain('│');
    });

    test('handles special characters in label', () => {
      const result = renderButton({ label: 'Click → me! 🚀' });

      expect(result).toContain('Click → me! 🚀');
      expect(result).toContain('│');
    });

    test('handles unicode characters in label', () => {
      const result = renderButton({ label: '世界 مرحبا' });

      expect(result).toContain('世界');
      expect(result).toContain('مرحبا');
      expect(result).toMatch(/\x1b\[/); // Has ANSI codes
    });

    test('combines multiple styles correctly', () => {
      const result = renderButton({
        label: 'Styled',
        bg: 'magenta',
        bold: true,
        italic: true,
        dim: false
      });

      expect(result).toContain('Styled');
      expect(result).toMatch(/\x1b\[35m/); // magenta
      expect(result).toMatch(/\x1b\[1m/); // bold
      expect(result).toMatch(/\x1b\[3m/); // italic
    });

    test('invalid variant falls back to primary', () => {
      const result = renderButton({ label: 'Test', variant: 'invalid' });

      expect(result).toContain('Test');

      // Should fall back to primary (blue)
      expect(result).toMatch(/\x1b\[94m/); // brightBlue
      expect(result).toMatch(/\x1b\[1m/); // bold
    });

    test('button structure is consistent', () => {
      const result = renderButton({ label: 'Test' });

      // Structure should have box characters
      expect(result).toMatch(/│.*Test.*│/);
    });
  });
});
