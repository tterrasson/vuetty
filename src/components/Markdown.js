// src/components/Markdown.js
import { h, inject } from 'vue';
import { marked } from 'marked';
import TextBox from './TextBox.js';
import Box from './Box.js';
import Divider from './Divider.js';
import Newline from './Newline.js';
import Table from './Table.js';
import Row from './Row.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import { boxProps } from '@core/layoutProps.js';
import {
  renderInlineTokens,
  flattenInlineTokensToString,
  renderList,
  renderCodeBlock,
  renderTable,
  renderBlockquote,
  renderParagraphWithStyles
} from '@utils/markdownRenderer.js';
import { createCacheKey } from '@utils/hashUtils.js';

// Global instance for cleanup access
let globalTokenCache = null;

/**
 * Clear all Markdown caches - call periodically or on unmount
 */
export function clearMarkdownCaches() {
  if (globalTokenCache) {
    globalTokenCache.clear();
  }
}

/**
 * Get cache statistics for Markdown component
 */
export function getMarkdownCacheStats() {
  return {
    tokenCacheSize: globalTokenCache ? globalTokenCache.size : 0,
    tokenCacheTotalTokens: globalTokenCache ? globalTokenCache.totalTokens : 0
  };
}

/**
 * LRU Cache for parsed markdown tokens (not vnodes)
 * Caching tokens instead of vnodes avoids retaining Vue component references
 * Memory-optimized: limits both entry count and total token count
 */
class MarkdownTokenCache {
  constructor(maxSize = 5, maxTotalTokens = 500) {
    this.maxSize = maxSize;
    this.maxTotalTokens = maxTotalTokens;
    this.cache = new Map();
    this.totalTokens = 0;
  }

  _countTokens(tokens) {
    if (!Array.isArray(tokens)) return 0;
    let count = tokens.length;
    for (const token of tokens) {
      if (token.tokens) count += this._countTokens(token.tokens);
      if (token.items) {
        for (const item of token.items) {
          if (item.tokens) count += this._countTokens(item.tokens);
        }
      }
    }
    return count;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.tokens;
  }

  set(key, tokens) {
    // Remove old entry if exists
    const existing = this.cache.get(key);
    if (existing) {
      this.totalTokens -= existing.count;
      this.cache.delete(key);
    }

    const count = this._countTokens(tokens);

    // Evict if over token limit
    while (this.totalTokens + count > this.maxTotalTokens && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value;
      const firstEntry = this.cache.get(firstKey);
      this.totalTokens -= firstEntry.count;
      this.cache.delete(firstKey);
    }

    // Evict if over size limit
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      const firstEntry = this.cache.get(firstKey);
      this.totalTokens -= firstEntry.count;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, { tokens, count });
    this.totalTokens += count;
  }

  clear() {
    this.cache.clear();
    this.totalTokens = 0;
  }

  get size() {
    return this.cache.size;
  }
}


/**
 * Markdown component - Renders markdown content in terminal
 */
export default {
  name: 'Markdown',
  props: {
    content: { type: String, default: '' },

    // Heading colors
    h1Color: { type: String, default: 'cyan' },
    h2Color: { type: String, default: 'cyan' },
    h3Color: { type: String, default: 'blue' },
    h4Color: { type: String, default: 'blue' },
    h5Color: { type: String, default: 'blue' },
    h6Color: { type: String, default: 'blue' },

    // Code styling
    codeColor: { type: String, default: 'yellow' },
    codeBg: { type: String, default: '#1a1a24' },

    // Link styling
    linkColor: { type: String, default: 'blue' },

    // Text emphasis
    emphasisColor: { type: String, default: 'white' },
    strongColor: { type: String, default: 'white' },

    // Blockquote styling
    blockquoteColor: { type: String, default: 'gray' },
    blockquoteBorderColor: { type: String, default: 'gray' },

    // List styling
    listBulletColor: { type: String, default: 'green' },
    listNumberColor: { type: String, default: 'green' },

    // Horizontal rule
    hrColor: { type: String, default: 'gray' },
    hrChar: { type: String, default: '─' },
    hrLength: { type: Number, default: 60 },

    // Table styling
    tableHeaderColor: { type: String, default: 'cyan' },
    tableBorderColor: { type: String, default: 'white' },

    // Base text styling
    color: String,
    bg: String,
    bold: Boolean,
    italic: Boolean,
    dim: Boolean,

    // Include common layout props (padding, margin, dimensions)
    ...boxProps,
    // Override defaults for Markdown
    padding: { type: Number, default: 0 }
  },

  setup(props) {
    const components = { TextBox, Box, Divider, Newline, Table, Row };
    const parentWidthContext = inject(WIDTH_CONTEXT_KEY, null);

    // Shared token cache with conservative limits (5 entries, 500 total tokens max)
    const tokenCache = new MarkdownTokenCache(5, 500);
    globalTokenCache = tokenCache;

    // Track last rendered state to avoid unnecessary re-parsing
    let lastContent = '';
    let cachedTokens = null;

    /**
     * Get effective width for content
     * Priority: explicit prop > parent context > null
     */
    function getEffectiveWidth() {
      if (props.width !== null && props.width !== undefined) {
        return props.width;
      }

      if (parentWidthContext !== null) {
        const contextWidth = typeof parentWidthContext === 'function'
          ? parentWidthContext()
          : parentWidthContext;

        if (contextWidth !== null && contextWidth !== undefined && contextWidth > 0) {
          return contextWidth;
        }
      }

      return null;
    }

    /**
     * Get content width (accounting for Markdown's own padding)
     */
    function getContentWidth() {
      const effectiveWidth = getEffectiveWidth();
      if (effectiveWidth === null) return null;

      const paddingWidth = props.padding * 2;
      return Math.max(0, effectiveWidth - paddingWidth);
    }

    /**
     * Render a single markdown token to vnodes
     * Called fresh each render - vnodes are not cached
     */
    function renderToken(token, components, props, renderTokenFn, contentWidth) {
      const { TextBox, Divider, Newline } = components;
      const elements = [];

      switch (token.type) {
        case 'heading': {
          const prefix = '#'.repeat(token.depth) + ' ';
          const headingColor = props[`h${token.depth}Color`];
          // Inherit background from props (which includes theme.background)
          elements.push(
            h(TextBox, { bold: true, color: headingColor, bg: props.bg }, {
              default: () => [prefix, ...renderInlineTokens(token.tokens, components, props)]
            })
          );
          elements.push(h(Newline));
          break;
        }

        case 'paragraph': {
          const hasComplexStyling = token.tokens && token.tokens.some(t =>
            t.type === 'strong' || t.type === 'em' || t.type === 'codespan'
          );

          if (!hasComplexStyling && token.tokens) {
            const text = flattenInlineTokensToString(token.tokens);
            // Inherit background from props
            elements.push(h(TextBox, { bg: props.bg }, { default: () => text }));
          } else {
            elements.push(...renderParagraphWithStyles(token, components, props, contentWidth));
          }
          break;
        }

        case 'code': {
          elements.push(...renderCodeBlock(token, components, props));
          elements.push(h(Newline));
          break;
        }

        case 'blockquote': {
          elements.push(renderBlockquote(token, components, props, renderTokenFn));
          elements.push(h(Newline));
          break;
        }

        case 'list': {
          elements.push(...renderList(token, components, props, 0, contentWidth));
          break;
        }

        case 'table': {
          elements.push(renderTable(token, components, props));
          elements.push(h(Newline));
          break;
        }

        case 'hr': {
          const hrLength = contentWidth || props.hrLength;
          elements.push(
            h(Divider, { char: props.hrChar, length: hrLength, color: props.hrColor })
          );
          elements.push(h(Newline));
          break;
        }

        case 'html': {
          elements.push(h(TextBox, { dim: true }, { default: () => token.text }));
          elements.push(h(Newline));
          break;
        }

        case 'space': {
          elements.push(h(Newline));
          break;
        }

        default: {
          if (token.raw) {
            elements.push(h(TextBox, {}, { default: () => token.raw }));
            elements.push(h(Newline));
          }
          break;
        }
      }

      return elements;
    }

    /**
     * Parse markdown content to tokens (cacheable)
     */
    function parseToTokens(content) {
      if (!content || content.trim() === '') {
        return [];
      }

      // Use content hash for cache key (width doesn't affect parsing)
      const cacheKey = createCacheKey(content, null, 10000);

      const cached = tokenCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        const tokens = marked.lexer(content);
        tokenCache.set(cacheKey, tokens);
        return tokens;
      } catch (error) {
        console.error('Markdown parse error:', error);
        return [];
      }
    }

    /**
     * Render tokens to vnodes (not cached - created fresh each render)
     */
    function renderTokensToVnodes(tokens, contentWidth, effectiveBg) {
      if (!tokens || tokens.length === 0) {
        return [h(TextBox, { bg: effectiveBg }, { default: () => '' })];
      }

      // Create enriched props with effective background
      const enrichedProps = { ...props, bg: effectiveBg };

      const elements = [];
      for (const token of tokens) {
        elements.push(...renderToken(token, components, enrichedProps, renderToken, contentWidth));
      }

      // Remove trailing newlines
      while (elements.length > 0 && elements[elements.length - 1].type === Newline) {
        elements.pop();
      }

      return elements.length > 0 ? elements : [h(TextBox, { bg: effectiveBg }, { default: () => '' })];
    }

    // Render function
    return () => {
      const contentWidth = getContentWidth();
      const content = props.content || '';

      // Re-parse only if content changed (exact string comparison)
      if (content !== lastContent) {
        lastContent = content;
        cachedTokens = parseToTokens(content);
      }

      // Only use explicit bg prop, don't fallback to theme.background
      // This allows terminal's native background (OSC 11) to show through
      const effectiveBg = props.bg;

      // Always re-render vnodes (they're cheap, caching them causes leaks)
      const elements = renderTokensToVnodes(cachedTokens, contentWidth, effectiveBg);

      const boxProps = {
        padding: props.padding,
        width: getEffectiveWidth(),
        color: props.color,
        bg: effectiveBg,
        bold: props.bold,
        italic: props.italic,
        dim: props.dim,
        border: false
      };

      return h(Box, boxProps, {
        default: () => elements
      });
    };
  }
};