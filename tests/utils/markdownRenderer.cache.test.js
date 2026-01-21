/**
 * Tests for Markdown renderer caching (utils)
 */

import { test, expect, describe, beforeEach } from 'bun:test';
import { renderParagraphWithStyles, clearRendererCaches, getRendererCacheStats } from '../../src/utils/markdownRenderer.js';

// Mock components
const components = {
  TextBox: { name: 'TextBox' },
  Newline: { name: 'Newline' }
};

describe('Markdown Renderer Caching', () => {
  beforeEach(() => {
    clearRendererCaches();
  });

  test('caches styles when rendering paragraphs', () => {
    const token = {
      type: 'paragraph',
      tokens: [
        { type: 'text', text: 'Normal ' },
        { type: 'strong', text: 'Bold', tokens: [{ type: 'text', text: 'Bold' }] }
      ]
    };

    const props = { strongColor: 'red' };

    // First render - should populate cache
    renderParagraphWithStyles(token, components, props, 80);

    const stats = getRendererCacheStats();
    expect(stats.styleCacheSize).toBeGreaterThan(0);

    const initialSize = stats.styleCacheSize;

    // Second render with same props - should reuse cache
    renderParagraphWithStyles(token, components, props, 80);

    expect(getRendererCacheStats().styleCacheSize).toBe(initialSize);
  });

  test('different props create different cache entries', () => {
    const token = {
      type: 'paragraph',
      tokens: [
        { type: 'strong', text: 'Bold', tokens: [{ type: 'text', text: 'Bold' }] }
      ]
    };

    // Render with red
    renderParagraphWithStyles(token, components, { strongColor: 'red' }, 80);
    const size1 = getRendererCacheStats().styleCacheSize;

    // Render with blue
    renderParagraphWithStyles(token, components, { strongColor: 'blue' }, 80);
    const size2 = getRendererCacheStats().styleCacheSize;

    expect(size2).toBeGreaterThan(size1);
  });

  test('clearRendererCaches resets cache', () => {
    const token = {
      type: 'paragraph',
      tokens: [
        { type: 'strong', text: 'Bold', tokens: [{ type: 'text', text: 'Bold' }] }
      ]
    };

    renderParagraphWithStyles(token, components, { strongColor: 'green' }, 80);

    expect(getRendererCacheStats().styleCacheSize).toBeGreaterThan(0);

    clearRendererCaches();

    expect(getRendererCacheStats().styleCacheSize).toBe(0);
  });
});