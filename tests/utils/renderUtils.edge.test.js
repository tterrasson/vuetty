/**
 * Edge-case regression tests for renderUtils (utils scope)
 */

import { test, expect, describe } from 'bun:test';
import {
  wrapText,
  truncateWithAnsi,
  padLineToWidth,
  getSpaces,
  stripAnsi,
  getTerminalWidth,
  applyStyles,
  extractTextContent
} from '../../src/utils/renderUtils.js';

describe('wrapText edge cases', () => {
  test('terminates when a wide char (CJK) exceeds maxWidth=1', () => {
    // Pre-fix this looped forever: char width 2 > maxWidth 1 made no progress
    const result = wrapText('日本語', 1);
    expect(typeof result).toBe('string');
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('日');
    expect(lines[1]).toBe('本');
    expect(lines[2]).toBe('語');
  });

  test('terminates when a wide char follows regular chars with maxWidth=1', () => {
    const result = wrapText('ab日', 1);
    const lines = result.split('\n');
    expect(stripAnsi(result)).toBe('a\nb\n日');
  });

  test('wraps wide chars that exactly fill the line', () => {
    // '日' has width 2: one char fills a maxWidth=2 line completely
    const result = wrapText('日本語', 2);
    expect(result.split('\n')).toEqual(['日', '本', '語']);
  });

  test('handles emoji (width 2) with maxWidth=1', () => {
    const result = wrapText('a🎉b', 1);
    const lines = result.split('\n');
    // The emoji cannot be split, so it is emitted alone on an overwide line
    expect(lines).toEqual(['a', '🎉', 'b']);
    expect(getTerminalWidth(lines[0])).toBeLessThanOrEqual(1);
    expect(getTerminalWidth(lines[2])).toBeLessThanOrEqual(1);
  });

  test('wraps emoji by visual width, not code units', () => {
    // Pre-fix: emoji were measured as 2 zero-width code units and never wrapped
    const result = wrapText('🎉🎉🎉', 2);
    expect(result.split('\n')).toEqual(['🎉', '🎉', '🎉']);
    for (const line of result.split('\n')) {
      expect(getTerminalWidth(line)).toBeLessThanOrEqual(2);
    }
  });
});

describe('truncateWithAnsi edge cases', () => {
  test('returns empty string for zero/negative maxWidth', () => {
    expect(truncateWithAnsi('hello', 0)).toBe('');
    expect(truncateWithAnsi('hello', -3)).toBe('');
  });

  test('handles wide chars wider than maxWidth without hanging', () => {
    const result = truncateWithAnsi('日', 1);
    expect(result).toBe(''); // char does not fit
  });

  test('truncates emoji at width boundary (surrogate pair kept intact)', () => {
    // Pre-fix: emoji were two zero-width code units, so 'c' leaked past the boundary
    const result = truncateWithAnsi('ab🎉cd', 3);
    expect(stripAnsi(result)).toBe('ab');
    expect(getTerminalWidth(result)).toBeLessThanOrEqual(3);

    const exact = truncateWithAnsi('ab🎉cd', 4);
    expect(stripAnsi(exact)).toBe('ab🎉');
    expect(getTerminalWidth(exact)).toBe(4);
  });

  test('emits reset when truncating inside active style', () => {
    const styled = '\x1b[31mred text that is long\x1b[0m';
    const result = truncateWithAnsi(styled, 4);
    expect(stripAnsi(result)).toBe('red ');
    expect(result.endsWith('\x1b[0m')).toBe(true);
  });
});

describe('padLineToWidth edge cases', () => {
  test('returns line unchanged when already at or beyond target width', () => {
    expect(padLineToWidth('abc', 3)).toBe('abc');
    expect(padLineToWidth('abcdef', 3)).toBe('abcdef');
  });

  test('handles non-string-safe empty line', () => {
    expect(padLineToWidth('', 3)).toBe('   ');
  });

  test('wide chars pad by visual width, not code units', () => {
    // '日' has visual width 2, so only 1 space of padding is needed
    expect(padLineToWidth('日', 3)).toBe('日 ');
  });
});

describe('getSpaces edge cases', () => {
  test('returns empty string for zero/negative counts', () => {
    expect(getSpaces(0)).toBe('');
    expect(getSpaces(-5)).toBe('');
  });

  test('falls back to repeat for counts beyond the cache', () => {
    expect(getSpaces(500)).toBe(' '.repeat(500));
  });
});

describe('applyStyles edge cases', () => {
  test('combines multiple styles with hex colors', () => {
    const out = applyStyles('hi', { bold: true, italic: true, color: '#ff0000', bg: '#0000ff' });
    expect(out).not.toBe('hi');
    expect(stripAnsi(out)).toBe('hi');
    expect(out).toContain('\x1b[1m'); // bold opener
  });

  test('ignores invalid colors without breaking other styles', () => {
    const out = applyStyles('hi', { bold: true, color: 'notacolor', bg: 'alsonot' });
    expect(stripAnsi(out)).toBe('hi');
    expect(out).toContain('\x1b[1m');
  });

  test('returns input unchanged with falsy/absent style props', () => {
    expect(applyStyles('hi', {})).toBe('hi');
    expect(applyStyles('hi', { bold: false, color: null, bg: undefined })).toBe('hi');
  });

  test('repeated calls with identical props produce identical output (chain reuse)', () => {
    const props = { bold: true, color: 'rgb(10,20,30)', bg: '#101010' };
    expect(applyStyles('x', props)).toBe(applyStyles('x', props));
    expect(applyStyles('y', props)).toBe(applyStyles('y', props));
  });
});

describe('extractTextContent edge cases', () => {
  test('handles null/empty nodes', () => {
    expect(extractTextContent(null)).toBe('');
    expect(extractTextContent({})).toBe('');
    expect(extractTextContent({ children: [] })).toBe('');
  });

  test('extracts from mixed children types', () => {
    const node = {
      children: [
        'raw ',
        { type: 'text', text: 'text ' },
        { props: { text: 'prop' } },
        { type: 'box', children: [{ type: 'text', text: 'deep' }] }
      ]
    };
    expect(extractTextContent(node)).toBe('raw text propdeep');
  });
});
