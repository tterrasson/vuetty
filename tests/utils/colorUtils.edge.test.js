/**
 * Edge-case regression tests for colorUtils (utils scope)
 */

import { test, expect, describe } from 'bun:test';
import {
  getAnsiFgCode,
  getAnsiBgCode,
  colorToOSC11,
  parseColor,
  interpolateColor,
  rgbToHex,
  hslToRgb,
  getChalkColorChain
} from '../../src/utils/colorUtils.js';

describe('getAnsiFgCode edge cases', () => {
  test('named colors map to standard ANSI codes', () => {
    expect(getAnsiFgCode('red')).toBe('\x1b[31m');
    expect(getAnsiFgCode('gray')).toBe('\x1b[90m');
  });

  test('expands short hex (#RGB)', () => {
    expect(getAnsiFgCode('#F0A')).toBe('\x1b[38;2;255;0;170m');
  });

  test('parses long hex (#RRGGBB)', () => {
    expect(getAnsiFgCode('#1a2b3c')).toBe('\x1b[38;2;26;43;60m');
  });

  test('accepts rgb() within 0-255', () => {
    expect(getAnsiFgCode('rgb(10, 20, 30)')).toBe('\x1b[38;2;10;20;30m');
  });

  test('rejects rgb() components outside 0-255', () => {
    // Pre-fix: produced the invalid sequence \x1b[38;2;300;0;0m
    expect(getAnsiFgCode('rgb(300, 0, 0)')).toBeNull();
    expect(getAnsiFgCode('rgb(0, 999, 0)')).toBeNull();
    expect(getAnsiFgCode('rgb(-1, 0, 0)')).toBeNull();
  });

  test('rejects invalid colors', () => {
    expect(getAnsiFgCode('notacolor')).toBeNull();
    expect(getAnsiFgCode('#12345')).toBeNull();
    expect(getAnsiFgCode('')).toBeNull();
    expect(getAnsiFgCode(null)).toBeNull();
  });
});

describe('getAnsiBgCode edge cases', () => {
  test('named colors map to true-color background codes', () => {
    expect(getAnsiBgCode('red')).toBe('\x1b[48;2;205;49;49m');
  });

  test('accepts rgb() within 0-255', () => {
    expect(getAnsiBgCode('rgb(1, 2, 3)')).toBe('\x1b[48;2;1;2;3m');
  });

  test('rejects rgb() components outside 0-255', () => {
    expect(getAnsiBgCode('rgb(256, 0, 0)')).toBeNull();
    expect(getAnsiBgCode('rgb(0, 0, -1)')).toBeNull();
  });
});

describe('colorToOSC11 edge cases', () => {
  test('converts hex to OSC 11 (16-bit duplicated bytes)', () => {
    expect(colorToOSC11('#1a2b3c')).toBe('rgb:1a1a/2b2b/3c3c');
  });

  test('expands short hex', () => {
    expect(colorToOSC11('#fff')).toBe('rgb:ffff/ffff/ffff');
  });

  test('rejects out-of-range rgb()', () => {
    expect(colorToOSC11('rgb(300, 0, 0)')).toBeNull();
  });

  test('rejects invalid input', () => {
    expect(colorToOSC11('nope')).toBeNull();
    expect(colorToOSC11('')).toBeNull();
  });
});

describe('parseColor edge cases', () => {
  test('parses named, hex and rgb formats', () => {
    expect(parseColor('red')).toEqual({ r: 205, g: 49, b: 49 });
    expect(parseColor('#F0A')).toEqual({ r: 255, g: 0, b: 170 });
    expect(parseColor('rgb(1,2,3)')).toEqual({ r: 1, g: 2, b: 3 });
  });

  test('returns null for invalid colors', () => {
    expect(parseColor('nope')).toBeNull();
    expect(parseColor('')).toBeNull();
    expect(parseColor(null)).toBeNull();
  });
});

describe('interpolateColor edge cases', () => {
  test('returns white for empty color arrays', () => {
    expect(interpolateColor([], 0.5)).toBe('#FFFFFF');
    expect(interpolateColor(null, 0.5)).toBe('#FFFFFF');
  });

  test('clamps out-of-range ratios', () => {
    expect(interpolateColor(['#000000', '#ffffff'], -1)).toBe('#000000');
    expect(interpolateColor(['#000000', '#ffffff'], 2)).toBe('#ffffff');
  });

  test('returns white when a segment color is invalid', () => {
    expect(interpolateColor(['#ff0000', 'notacolor'], 1)).toBe('#FFFFFF');
  });

  test('interpolates within the correct segment', () => {
    // With 3 colors, ratio 0.5 is the middle of segment 1 (index 1 -> 2)
    const mid = interpolateColor(['#000000', '#404040', '#808080'], 0.75);
    expect(mid).toBe('#606060');
  });
});

describe('conversion helpers edge cases', () => {
  test('rgbToHex clamps out-of-range values', () => {
    expect(rgbToHex(300, -5, 12.6)).toBe('#ff000d');
  });

  test('hslToRgb handles achromatic input', () => {
    expect(hslToRgb(0.3, 0, 0.5)).toEqual({ r: 128, g: 128, b: 128 });
  });

  test('getChalkColorChain validates rgb range', () => {
    expect(getChalkColorChain('rgb(300, 0, 0)')).toBeNull();
    expect(getChalkColorChain('rgb(10, 20, 30)')).not.toBeNull();
  });
});
