// src/components/BigText.js
import { h } from 'vue';
import figlet from 'figlet';
import { applyStyles, padLineToWidth, getTerminalWidth } from '@utils/renderUtils.js';
import { LRUCache } from '@utils/lruCache.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';
import { renderChildrenCached } from '@core/memoization.js';

// Preload fonts at module initialization to avoid runtime file access
function preloadFont(fontName) {
  // Skip if already loaded
  if (figlet.figFonts && figlet.figFonts[fontName]) {
    return;
  }

  try {
    // Try to find and load the font file
    let fontData;

    // Method 1: Try to load from figlet's fonts directory
    try {
      const figletPath = import.meta.resolve?.('figlet') || '';
      if (figletPath) {
        const figletDir = dirname(figletPath.replace('file://', ''));
        const fontPath = join(figletDir, 'fonts', `${fontName}.flf`);
        fontData = readFileSync(fontPath, 'utf-8');
      }
    } catch {}

    // Method 2: Try relative to node_modules
    if (!fontData) {
      try {
        const fontPath = join(process.cwd(), 'node_modules', 'figlet', 'fonts', `${fontName}.flf`);
        fontData = readFileSync(fontPath, 'utf-8');
      } catch {}
    }

    // If we got the font data, parse and cache it
    if (fontData) {
      figlet.parseFont(fontName, fontData);
    }
  } catch (error) {
    // Silently fail - figlet will try to load it on demand
    console.warn(`Could not preload font "${fontName}":`, error.message);
  }
}

// Preload commonly used fonts at startup
const PRELOAD_FONTS = ['Terrace', 'Standard', 'Big', 'Slant'];
for (const font of PRELOAD_FONTS) {
  preloadFont(font);
}

// Two-tier cache system for BigText rendering
// Tier 1: Cache figlet ASCII art output (before alignment/styling)
const figletCache = new LRUCache(50);

// Tier 2: Cache final rendered output (after alignment and styling)
const finalOutputCache = new LRUCache(100);

/**
 * Generate cache key for figlet output
 */
function getFigletCacheKey(content, font, horizontalLayout) {
  return `${content}|${font}|${horizontalLayout}`;
}

/**
 * Generate cache key for final rendered output
 */
function getFinalCacheKey(content, props) {
  const { font = 'Standard', horizontalLayout = 'default', align = 'left' } = props || {};

  const styleFlags = [
    props?.color || '',
    props?.bg || '',
    props?.bold ? 'B' : '',
    props?.italic ? 'I' : '',
    props?.underline ? 'U' : '',
    props?.dim ? 'D' : ''
  ].join('');

  return `${content}|${font}|${horizontalLayout}|${align}|${styleFlags}`;
}

/**
 * BigText Component
 *
 * Renders text as large ASCII art using figlet fonts.
 *
 * @example
 * <BigText font="Slant">Hello</BigText>
 *
 * @example
 * <Gradient name="rainbow">
 *   <BigText font="Big">Vuetty</BigText>
 * </Gradient>
 *
 * @prop {string} font - Font name (default: 'Standard')
 * @prop {string} horizontalLayout - Layout mode: 'default' | 'full' | 'fitted' (default: 'default')
 * @prop {string} align - Text alignment: 'left' | 'center' | 'right' (default: 'left')
 * @prop {string} color - Text color (inherited from Text component)
 * @prop {string} bg - Background color (inherited from Text component)
 * @prop {boolean} bold - Bold text (inherited from Text component)
 * @prop {boolean} italic - Italic text (inherited from Text component)
 * @prop {boolean} underline - Underline text (inherited from Text component)
 * @prop {boolean} dim - Dim text (inherited from Text component)
 */
export default {
  name: 'BigText',
  props: {
    font: {
      type: String,
      default: 'Standard'
    },
    horizontalLayout: {
      type: String,
      default: 'default'
    },
    align: {
      type: String,
      default: 'left',
      validator: val => ['left', 'center', 'right'].includes(val)
    },
    color: String,
    bg: String,
    bold: Boolean,
    italic: Boolean,
    underline: Boolean,
    dim: Boolean,
    // Include common layout props (padding, margin, dimensions)
    ...boxProps
  },
  setup(props, { slots }) {
    return () => {
      const children = slots.default ? slots.default() : [];
      return h('bigtext', props, children);
    };
  }
};

/**
 * Render text as ASCII art with intelligent caching
 */
export function renderBigText(content, props) {
  if (!content) return '';

  const {
    font = 'Standard',
    horizontalLayout = 'default',
    align = 'left'
  } = props || {};

  // Check final output cache first (instant return)
  const finalCacheKey = getFinalCacheKey(content, props);
  const cachedFinal = finalOutputCache.get(finalCacheKey);
  if (cachedFinal !== null) {
    return cachedFinal;
  }

  // Check figlet cache (skip expensive conversion)
  const figletCacheKey = getFigletCacheKey(content, font, horizontalLayout);
  let asciiArt = figletCache.get(figletCacheKey);

  if (asciiArt === null) {
    // Cache miss - perform figlet conversion
    asciiArt = figlet.textSync(content, {
      font,
      horizontalLayout
    });

    // Remove trailing empty lines to avoid excessive padding
    const lines = asciiArt.split('\n');
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
    asciiArt = lines.join('\n');

    // Store in figlet cache
    figletCache.set(figletCacheKey, asciiArt);
  }

  // Handle alignment (may use cached figlet output)
  if (align !== 'left') {
    const lines = asciiArt.split('\n');
    const maxWidth = Math.max(...lines.map(line => getTerminalWidth(line)));
    const alignedLines = lines.map(line =>
      padLineToWidth(line, maxWidth, align)
    );
    asciiArt = alignedLines.join('\n');
  }

  // Apply styles if present
  let finalOutput = asciiArt;
  if (props && (props.color || props.bg || props.bold || props.italic || props.underline || props.dim)) {
    finalOutput = applyStyles(asciiArt, props);
  }

  // Store in final output cache
  finalOutputCache.set(finalCacheKey, finalOutput);

  return finalOutput;
}

/**
 * Clear all BigText caches (useful for testing or memory management)
 */
export function clearBigTextCache() {
  figletCache.clear();
  finalOutputCache.clear();
}

/**
 * Get cache statistics (for debugging/monitoring)
 */
export function getBigTextCacheStats() {
  return {
    figlet: {
      size: figletCache.size,
      maxSize: 50
    },
    final: {
      size: finalOutputCache.size,
      maxSize: 100
    }
  };
}

/**
 * Render handler for bigtext
 */
class BigTextRenderHandler extends RenderHandler {
  render(ctx) {
    const { node } = ctx;
    const childrenOutput = ctx.text || renderChildrenCached(node, (child) =>
      ctx.renderChild(child)
    );
    return renderBigText(childrenOutput, ctx.props);
  }
}

renderHandlerRegistry.register('bigtext', new BigTextRenderHandler());
