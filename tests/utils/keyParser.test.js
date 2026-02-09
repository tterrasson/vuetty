import { describe, expect, test } from 'bun:test';
import {
  KEY_ENTER,
  KEY_LEFT,
  KEY_TAB,
  KEY_UP,
  isControl,
  isNavigation,
  isPrintable,
  parseKey,
  parseMouseEvent
} from '../../src/utils/keyParser.js';

describe('keyParser', () => {
  describe('parseKey', () => {
    test('parses ANSI modifiers for ctrl+shift navigation keys', () => {
      const parsed = parseKey('\x1b[1;6D');

      expect(parsed).toEqual({
        key: KEY_LEFT,
        char: null,
        shift: true,
        ctrl: true,
        alt: false
      });
    });

    test('parses enter variants and keeps shift+enter distinction', () => {
      const enter = parseKey('\r');
      const shiftEnter = parseKey('\n');

      expect(enter.key).toBe(KEY_ENTER);
      expect(enter.shift).toBe(false);
      expect(shiftEnter.key).toBe(KEY_ENTER);
      expect(shiftEnter.shift).toBe(true);
    });

    test('parses alt+printable keys and normalizes key to lowercase', () => {
      const parsed = parseKey('\x1bA');

      expect(parsed).toEqual({
        key: 'a',
        char: 'A',
        ctrl: false,
        alt: true,
        shift: true
      });
    });

    test('parses generic control characters', () => {
      const parsed = parseKey('\x1f');

      expect(parsed).toEqual({
        key: 'char',
        char: '\x1f',
        ctrl: true,
        shift: false,
        alt: false
      });
    });

    test('parses printable ASCII and unicode characters', () => {
      const ascii = parseKey('Z');
      const unicode = parseKey('é');

      expect(ascii).toEqual({
        key: 'char',
        char: 'Z',
        ctrl: false,
        shift: true,
        alt: false
      });

      expect(unicode).toEqual({
        key: 'char',
        char: 'é',
        ctrl: false,
        shift: false,
        alt: false
      });
    });

    test('returns unknown for unsupported escape sequences', () => {
      const parsed = parseKey('\x1b[999~');

      expect(parsed).toEqual({
        key: 'unknown',
        char: '\x1b[999~',
        ctrl: false,
        shift: false,
        alt: false
      });
    });
  });

  describe('helpers', () => {
    test('identifies printable keys', () => {
      expect(isPrintable(parseKey('x'))).toBe(true);
      expect(isPrintable(parseKey('\x1b[A'))).toBe(false);
    });

    test('identifies navigation keys', () => {
      expect(isNavigation(parseKey('\x1b[A'))).toBe(true);
      expect(isNavigation(parseKey(KEY_TAB))).toBe(false);
    });

    test('identifies control keys from both flags and ctrl_* names', () => {
      expect(isControl(parseKey('\x03'))).toBe(true);
      expect(isControl(parseKey('\x1b\r'))).toBe(true);
      expect(isControl(parseKey('a'))).toBe(false);
    });
  });

  describe('parseMouseEvent', () => {
    test('parses SGR left click with modifiers', () => {
      const parsed = parseMouseEvent('\x1b[<20;12;8M');

      expect(parsed).toEqual({
        type: 'mouse',
        action: 'left_click',
        button: 0,
        x: 12,
        y: 8,
        shift: true,
        ctrl: true,
        alt: false
      });
    });

    test('parses SGR release actions', () => {
      const parsed = parseMouseEvent('\x1b[<0;7;3m');

      expect(parsed?.action).toBe('left_release');
      expect(parsed?.x).toBe(7);
      expect(parsed?.y).toBe(3);
    });

    test('prioritizes wheel actions over motion bit', () => {
      const parsed = parseMouseEvent('\x1b[<96;5;4M');

      expect(parsed?.action).toBe('wheel_up');
      expect(parsed?.button).toBe(64);
    });

    test('parses drag actions for motion on regular buttons', () => {
      const parsed = parseMouseEvent('\x1b[<34;9;2M');

      expect(parsed?.action).toBe('drag');
      expect(parsed?.button).toBe(2);
    });

    test('parses normal/X10 format', () => {
      const parsed = parseMouseEvent('\x1b[65;10;11M');

      expect(parsed).toEqual({
        type: 'mouse',
        action: 'wheel_down',
        button: 65,
        x: 10,
        y: 11,
        shift: false,
        ctrl: false,
        alt: false
      });
    });

    test('returns unknown action for unsupported button codes', () => {
      const parsed = parseMouseEvent('\x1b[<99;1;1M');
      expect(parsed?.action).toBe('unknown');
    });

    test('returns null for non-mouse sequences', () => {
      expect(parseMouseEvent('abc')).toBeNull();
      expect(parseMouseEvent('\x1b[<12;2')).toBeNull();
    });
  });
});
