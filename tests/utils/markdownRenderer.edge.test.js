/**
 * Edge-case regression tests for markdownRenderer (utils scope)
 */

import { test, expect, describe } from 'bun:test';
import {
  renderParagraphWithStyles,
  renderList,
  flattenInlineTokensToString
} from '../../src/utils/markdownRenderer.js';

const components = {
  TextBox: { name: 'TextBox', render: () => null },
  Newline: { name: 'Newline', render: () => null }
};

function collectText(vnodes) {
  const parts = [];
  for (const vnode of vnodes) {
    if (vnode?.children?.default) {
      const child = vnode.children.default();
      if (typeof child === 'string') parts.push(child);
      else if (Array.isArray(child)) parts.push(collectText(child));
      else if (Array.isArray(child?.[0])) parts.push(collectText(child.flat()));
    }
  }
  return parts.join('');
}

describe('renderParagraphWithStyles edge cases', () => {
  test('terminates when a wide char (CJK) exceeds availableWidth=1', () => {
    // Pre-fix this looped forever in wrapStyledSegments
    const token = { type: 'paragraph', tokens: [{ type: 'text', text: '日本語' }] };
    const elements = renderParagraphWithStyles(token, components, {}, 1);
    expect(Array.isArray(elements)).toBe(true);
    expect(elements.length).toBeGreaterThan(0);
  });

  test('terminates when an emoji exceeds availableWidth=1', () => {
    const token = { type: 'paragraph', tokens: [{ type: 'text', text: 'a🎉b' }] };
    const elements = renderParagraphWithStyles(token, components, {}, 1);
    expect(Array.isArray(elements)).toBe(true);
    expect(elements.length).toBeGreaterThan(0);
  });

  test('handles empty token array', () => {
    const elements = renderParagraphWithStyles(
      { type: 'paragraph', tokens: [] }, components, {}, 20
    );
    expect(Array.isArray(elements)).toBe(true);
  });

  test('handles missing tokens', () => {
    const elements = renderParagraphWithStyles(
      { type: 'paragraph' }, components, {}, 20
    );
    expect(Array.isArray(elements)).toBe(true);
  });
});

describe('renderList edge cases', () => {
  test('ordered list defaults start to 1 when token.start is missing', () => {
    // Pre-fix this produced "NaN. " prefixes
    const token = {
      type: 'list',
      ordered: true,
      items: [{ tokens: [{ type: 'text', text: 'first' }] }]
    };
    const elements = renderList(token, components, {});
    const text = collectText(elements);
    expect(text).toContain('1. ');
    expect(text).not.toContain('NaN');
  });

  test('respects explicit start on ordered lists', () => {
    const token = {
      type: 'list',
      ordered: true,
      start: 3,
      items: [{ tokens: [{ type: 'text', text: 'third' }] }]
    };
    const elements = renderList(token, components, {});
    expect(collectText(elements)).toContain('3. ');
  });
});

describe('flattenInlineTokensToString edge cases', () => {
  test('returns empty string for null/undefined/non-array tokens', () => {
    expect(flattenInlineTokensToString(null)).toBe('');
    expect(flattenInlineTokensToString(undefined)).toBe('');
    expect(flattenInlineTokensToString('not an array')).toBe('');
  });

  test('flattens nested strong/em tokens with text fallback', () => {
    const tokens = [
      { type: 'strong', tokens: [{ type: 'em', text: 'deep' }] },
      { type: 'text', text: ' ok' }
    ];
    expect(flattenInlineTokensToString(tokens)).toBe('deep ok');
  });
});
