// src/components/Box.js
import { h, provide, inject } from 'vue';
import {
  getTerminalWidth,
  truncateWithAnsi,
  applyStyles,
  wrapText,
  getSpaces
} from '@utils/renderUtils.js';
import { adjustToHeight } from '@utils/heightUtils.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import { HEIGHT_CONTEXT_KEY } from '@core/heightContext.js';
import { getViewportWidth } from '@core/renderContext.js';
import { VUETTY_VIEWPORT_STATE_KEY, VUETTY_THEME_KEY } from '@core/vuettyKeys.js';
import { getAnsiFgCode, getAnsiBgCode } from '@utils/colorUtils.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';
import { renderChildrenCached } from '@core/memoization.js';

// Pre-compiled regex
const TRAILING_NEWLINES_REGEX = /\n+$/;

/**
 * StringBuffer - Reusable buffer for building strings efficiently
 */
class StringBuffer {
  constructor(estimatedLines = 30) {
    this.lines = new Array(estimatedLines);
    this.index = 0;
  }

  append(line) {
    if (this.index >= this.lines.length) {
      const newLines = new Array(this.lines.length * 2);
      for (let i = 0; i < this.lines.length; i++) {
        newLines[i] = this.lines[i];
      }
      this.lines = newLines;
    }
    this.lines[this.index++] = line;
  }

  toString() {
    if (this.index === 0) return '';
    if (this.index === 1) return this.lines[0];

    let result = this.lines[0];
    for (let i = 1; i < this.index; i++) {
      result += '\n' + this.lines[i];
    }
    return result;
  }

  clear() {
    for (let i = 0; i < this.index; i++) {
      this.lines[i] = null;
    }
    this.index = 0;
  }
}

// Pool de buffers réutilisables
const bufferPool = [];
const MAX_POOL_SIZE = 5;

function getBuffer() {
  return bufferPool.pop() || new StringBuffer(30);
}

function releaseBuffer(buffer) {
  buffer.clear();
  if (bufferPool.length < MAX_POOL_SIZE) {
    bufferPool.push(buffer);
  }
}

/**
 * String interning cache - LRU with size limit
 */
const STRING_CACHE = new Map();
const MAX_STRING_CACHE_SIZE = 50;

function intern(str) {
  if (str.length === 0) return '';
  if (str.length > 30) return str;

  const cached = STRING_CACHE.get(str);
  if (cached !== undefined) {
    STRING_CACHE.delete(str);
    STRING_CACHE.set(str, cached);
    return cached;
  }

  if (STRING_CACHE.size >= MAX_STRING_CACHE_SIZE) {
    const firstKey = STRING_CACHE.keys().next().value;
    STRING_CACHE.delete(firstKey);
  }
  STRING_CACHE.set(str, str);
  return str;
}

/**
 * Clear all Box caches
 */
export function clearBoxCaches() {
  STRING_CACHE.clear();
  bufferPool.length = 0;
}

/**
 * Get cache statistics for Box component
 */
export function getBoxCacheStats() {
  return {
    stringCacheSize: STRING_CACHE.size,
    stringCacheMaxSize: MAX_STRING_CACHE_SIZE,
    bufferPoolSize: bufferPool.length,
    bufferPoolMaxSize: MAX_POOL_SIZE
  };
}

/**
 * Border theme definitions for Box component
 */
export const BOX_THEMES = {
  rounded: {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│'
  },
  square: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│'
  },
  double: {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    horizontal: '═',
    vertical: '║'
  },
  classic: {
    topLeft: '+',
    topRight: '+',
    bottomLeft: '+',
    bottomRight: '+',
    horizontal: '-',
    vertical: '|'
  },
  bold: {
    topLeft: '┏',
    topRight: '┓',
    bottomLeft: '┗',
    bottomRight: '┛',
    horizontal: '━',
    vertical: '┃'
  },
  dashed: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '╌',
    vertical: '╎'
  },
  sparse: {
    topLeft: '·',
    topRight: '·',
    bottomLeft: '·',
    bottomRight: '·',
    horizontal: '·',
    vertical: '·'
  },
  light: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: ' ',
    vertical: ' '
  },
  button: {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│'
  }
};

/**
 * Box component - Visual container only (no flex properties)
 */
export default {
  name: 'Box',
  props: {
    border: {
      type: Boolean,
      default: true
    },
    borderStyle: {
      type: [String, Object],
      default: 'rounded'
    },
    color: String,
    bg: String,
    bold: Boolean,
    italic: Boolean,
    underline: Boolean,
    dim: Boolean,
    title: {
      type: String,
      default: null
    },
    titleAlign: {
      type: String,
      default: 'left',
      validator: val => ['left', 'center', 'right'].includes(val)
    },
    titlePadding: {
      type: Number,
      default: 1
    },
    // Include box props (padding, margin, dimensions, flex item props)
    ...boxProps,
    // Override padding default for Box (needs 0 instead of null)
    padding: {
      type: Number,
      default: 0
    }
  },
  setup(props, { slots }) {
    const parentWidthContext = inject(WIDTH_CONTEXT_KEY, null);
    const parentHeightContext = inject(HEIGHT_CONTEXT_KEY, null);
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);
    const theme = inject(VUETTY_THEME_KEY, null);

    const getAvailableWidth = () => {
      const boxWidth = props.width !== null && props.width !== undefined
        ? props.width
        : (typeof parentWidthContext === 'function' ? parentWidthContext() : parentWidthContext || getViewportWidth());

      const borderWidth = props.border ? 2 : 0;
      const paddingWidth = props.padding * 2;
      const availableWidth = boxWidth - borderWidth - paddingWidth;

      return availableWidth > 0 ? availableWidth : null;
    };

    const getAvailableHeight = () => {
      const boxHeight = props.height !== null && props.height !== undefined
        ? props.height
        : (typeof parentHeightContext === 'function' ? parentHeightContext() : parentHeightContext);

      if (boxHeight === null || boxHeight === undefined) return null;

      const borderHeight = props.border ? 2 : 0;
      const paddingHeight = props.padding * 2;
      const availableHeight = boxHeight - borderHeight - paddingHeight;

      return availableHeight > 0 ? availableHeight : null;
    };

    provide(WIDTH_CONTEXT_KEY, getAvailableWidth);
    provide(HEIGHT_CONTEXT_KEY, getAvailableHeight);

    let lastInjectedWidth = undefined;
    let lastInjectedHeight = undefined;
    let lastViewportVersion = -1;
    let cachedEnhancedProps = null;

    return () => {
      const children = slots.default ? slots.default() : [];

      const injectedWidth = typeof parentWidthContext === 'function'
        ? parentWidthContext()
        : parentWidthContext;

      const injectedHeight = typeof parentHeightContext === 'function'
        ? parentHeightContext()
        : parentHeightContext;

      const viewportVersion = viewportState ? viewportState.version : 0;

      if (injectedWidth !== lastInjectedWidth || injectedHeight !== lastInjectedHeight || viewportVersion !== lastViewportVersion || !cachedEnhancedProps) {
        lastInjectedWidth = injectedWidth;
        lastInjectedHeight = injectedHeight;
        lastViewportVersion = viewportVersion;

        const effectiveColor = props.color !== undefined ? props.color : theme?.components?.box?.color;
        const effectiveBg = props.bg !== undefined ? props.bg : theme?.components?.box?.bg;

        cachedEnhancedProps = {
          ...props,
          _injectedWidth: injectedWidth,
          _injectedHeight: injectedHeight,
          _viewportVersion: viewportVersion
        };

        if (effectiveColor !== undefined && effectiveColor !== null) {
          cachedEnhancedProps.color = effectiveColor;
        }
        if (effectiveBg !== undefined && effectiveBg !== null) {
          cachedEnhancedProps.bg = effectiveBg;
        }
      }

      return h('box', cachedEnhancedProps, children);
    };
  }
};

/**
 * Preserve background color across ANSI resets in content
 * Replaces \x1b[0m with \x1b[0m + bgCode to maintain background
 */
function preserveBackground(content, bgCode) {
  if (!bgCode || !content) return content;
  // After every full reset, re-apply the background
  return content.replace(/\x1b\[0m/g, '\x1b[0m' + bgCode);
}

/**
 * Render a box with optional border
 */
export function renderBox(content, props, _depth) {
  const {
    border = false,
    borderStyle = 'rounded',
    padding = 0,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    width,
    _injectedWidth,
    _targetHeight,
    title = null,
    titleAlign = 'left',
    titlePadding = 1,
    bg,
    color: borderColor,
    align = 'left'
  } = props;

  // Calculate effective padding for each side
  const effectivePaddingLeft = paddingLeft !== undefined && paddingLeft !== null ? paddingLeft : padding;
  const effectivePaddingRight = paddingRight !== undefined && paddingRight !== null ? paddingRight : padding;
  const effectivePaddingTop = paddingTop !== undefined && paddingTop !== null ? paddingTop : padding;
  const effectivePaddingBottom = paddingBottom !== undefined && paddingBottom !== null ? paddingBottom : padding;

  // Calculate content height constraint if _targetHeight is provided
  let contentHeightConstraint = null;
  if (_targetHeight !== undefined && _targetHeight > 0) {
    const borderHeight = border ? 2 : 0;
    const paddingHeight = effectivePaddingTop + effectivePaddingBottom;
    contentHeightConstraint = Math.max(0, _targetHeight - borderHeight - paddingHeight);
  }

  // Only use explicit bg prop, don't fallback to theme background
  // This allows terminal's native background (OSC 11) to show through
  const effectiveBg = bg;

  // Fast path: no visual changes needed
  if (!border && effectivePaddingLeft === 0 && effectivePaddingRight === 0 &&
      effectivePaddingTop === 0 && effectivePaddingBottom === 0 && !effectiveBg) {
    if (width != null) {
      return wrapText(content, width);
    }
    if (_injectedWidth != null) {
      return wrapText(content, _injectedWidth);
    }
    return content.replace(TRAILING_NEWLINES_REGEX, '');
  }

  // Get border characters from theme
  const borderChars = border
    ? (typeof borderStyle === 'string'
        ? (BOX_THEMES[borderStyle] || BOX_THEMES.rounded)
        : borderStyle)
    : {
        topLeft: ' ',
        topRight: ' ',
        bottomLeft: ' ',
        bottomRight: ' ',
        horizontal: ' ',
        vertical: ' '
      };

  const borderWidth = border ? 2 : 0;
  const paddingWidth = effectivePaddingLeft + effectivePaddingRight;

  // Calculate minimum width for title
  let minInteriorWidthForTitle = 0;
  if (title && title.trim()) {
    const titleWidth = getTerminalWidth(title) + titlePadding * 2;
    minInteriorWidthForTitle = titleWidth + 4;
  }

  // Calculate dimensions
  let interiorWidth;
  let contentWidth;

  if (width != null) {
    interiorWidth = Math.max(0, width - borderWidth);
    if (minInteriorWidthForTitle > 0) {
      interiorWidth = Math.max(interiorWidth, minInteriorWidthForTitle);
    }
    contentWidth = Math.max(0, interiorWidth - paddingWidth);
  } else if (_injectedWidth != null) {
    contentWidth = Math.max(0, _injectedWidth);
    interiorWidth = contentWidth + paddingWidth;
    if (minInteriorWidthForTitle > 0) {
      interiorWidth = Math.max(interiorWidth, minInteriorWidthForTitle);
      contentWidth = Math.max(0, interiorWidth - paddingWidth);
    }
  } else {
    const allLines = content.split('\n');
    let maxWidth = 0;
    for (let i = 0; i < allLines.length; i++) {
      const line = allLines[i];
      if (line.trim() !== '') {
        const w = getTerminalWidth(line);
        if (w > maxWidth) maxWidth = w;
      }
    }
    interiorWidth = Math.max(maxWidth + paddingWidth, minInteriorWidthForTitle);
    contentWidth = Math.max(0, interiorWidth - paddingWidth);
  }

  // Wrap content if width constrained
  let wrappedContent = content;
  if (contentWidth > 0 && (width != null || _injectedWidth != null)) {
    wrappedContent = wrapText(content, contentWidth);
  }

  // Apply height constraint if specified (before trimming empty lines)
  if (contentHeightConstraint !== null && contentHeightConstraint > 0) {
    wrappedContent = adjustToHeight(wrappedContent, contentHeightConstraint);
  }

  // Split and trim trailing empty lines
  // BUT: don't trim if we have a height constraint (we need to fill the space)
  let lines = wrappedContent.split('\n');
  if (contentHeightConstraint === null || contentHeightConstraint === 0) {
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
  }

  // Pre-compute padding strings for horizontal padding
  const leftPadStr = getSpaces(effectivePaddingLeft);
  const rightPadStr = getSpaces(effectivePaddingRight);

  // Use string buffer pool
  const buffer = getBuffer();

  // Get background ANSI code for raw application (avoids chalk reset conflicts)
  const bgAnsiCode = effectiveBg ? getAnsiBgCode(effectiveBg) : null;
  const bgStr = bgAnsiCode || '';

  // Get border foreground code
  const borderFgCode = borderColor ? getAnsiFgCode(borderColor) : '';

  try {
    // Top border
    if (border) {
      let topBorderContent;
      if (title && title.trim()) {
        const paddedTitle = getSpaces(titlePadding) + title + getSpaces(titlePadding);
        const titleWidth = getTerminalWidth(paddedTitle);

        if (titleWidth > interiorWidth - 4) {
          const maxTitleWidth = interiorWidth - 4 - titlePadding * 2;
          const truncatedTitle = truncateWithAnsi(title, Math.max(1, maxTitleWidth - 1)) + '…';
          const newPaddedTitle = getSpaces(titlePadding) + truncatedTitle + getSpaces(titlePadding);
          const newTitleWidth = getTerminalWidth(newPaddedTitle);
          const remainingWidth = interiorWidth - newTitleWidth;

          // Style the title, then preserve background across any resets
          let styledTitle = applyStyles(newPaddedTitle, props);
          if (bgAnsiCode) {
            styledTitle = preserveBackground(styledTitle, bgAnsiCode);
          }

          // Apply border color and background to border sections
          const leftBorderSection = borderChars.topLeft + borderChars.horizontal.repeat(2);
          const rightBorderSection = borderChars.horizontal.repeat(Math.max(0, remainingWidth - 2)) + borderChars.topRight;

          topBorderContent = bgStr + borderFgCode + leftBorderSection + '\x1b[0m' +
                      styledTitle +
                      bgStr + borderFgCode + rightBorderSection + '\x1b[0m';
        } else {
          const remainingWidth = interiorWidth - titleWidth;
          let leftWidth, rightWidth;

          switch (titleAlign) {
            case 'right':
              leftWidth = remainingWidth - 2;
              rightWidth = 2;
              break;
            case 'center':
              leftWidth = Math.floor(remainingWidth / 2);
              rightWidth = remainingWidth - leftWidth;
              break;
            default:
              leftWidth = 2;
              rightWidth = remainingWidth - 2;
              break;
          }

          // Style the title, then preserve background across any resets
          let styledTitle = applyStyles(paddedTitle, props);
          if (bgAnsiCode) {
            styledTitle = preserveBackground(styledTitle, bgAnsiCode);
          }

          // Apply border color and background to left border section
          const leftBorderSection = borderChars.topLeft + borderChars.horizontal.repeat(Math.max(0, leftWidth));
          // Apply border color and background to right border section
          const rightBorderSection = borderChars.horizontal.repeat(Math.max(0, rightWidth)) + borderChars.topRight;

          topBorderContent = bgStr + borderFgCode + leftBorderSection + '\x1b[0m' +
                      styledTitle +
                      bgStr + borderFgCode + rightBorderSection + '\x1b[0m';
        }
      } else {
        // No title - just simple border
        topBorderContent = borderChars.topLeft + borderChars.horizontal.repeat(interiorWidth) + borderChars.topRight;
        topBorderContent = bgStr + borderFgCode + topBorderContent + '\x1b[0m';
      }

      // Append top border (already contains ANSI codes from above)
      buffer.append(topBorderContent);
    }

    // Add paddingTop empty lines
    if (effectivePaddingTop > 0) {
      let emptyLine;
      if (border) {
        const innerContent = getSpaces(interiorWidth);
        emptyLine = bgStr + borderFgCode + borderChars.vertical + '\x1b[0m' +
                   bgStr + innerContent + '\x1b[0m' +
                   bgStr + borderFgCode + borderChars.vertical + '\x1b[0m';
      } else {
        emptyLine = bgStr + getSpaces(interiorWidth) + '\x1b[0m';
      }
      for (let i = 0; i < effectivePaddingTop; i++) {
        buffer.append(emptyLine);
      }
    }

    // Content lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const visualWidth = getTerminalWidth(line);
      const paddingNeeded = Math.max(0, contentWidth - visualWidth);

      // Calculate left and right padding based on alignment
      let leftContentPadStr, rightContentPadStr;
      if (align === 'center') {
        const leftPad = Math.floor(paddingNeeded / 2);
        const rightPad = paddingNeeded - leftPad;
        leftContentPadStr = getSpaces(leftPad);
        rightContentPadStr = getSpaces(rightPad);
      } else if (align === 'right') {
        leftContentPadStr = getSpaces(paddingNeeded);
        rightContentPadStr = '';
      } else {
        // left alignment (default)
        leftContentPadStr = '';
        rightContentPadStr = getSpaces(paddingNeeded);
      }

      // Preserve background across any ANSI resets in content (e.g., from syntax highlighting)
      const processedLine = bgAnsiCode ? preserveBackground(line, bgAnsiCode) : line;

      // Build full line - apply bg everywhere: borders, padding, and content
      let fullLine;
      if (border) {
        // Structure: [bg+borderFg+border][bg+leftPad+content][bg+rightPad][bg+borderFg+border]
        // Important: re-apply bg before right padding to ensure spaces have background
        fullLine = bgStr + borderFgCode + borderChars.vertical + '\x1b[0m' +
                   bgStr + leftPadStr + leftContentPadStr + processedLine +
                   bgStr + rightContentPadStr + rightPadStr + '\x1b[0m' +
                   bgStr + borderFgCode + borderChars.vertical;
      } else {
        // No border: apply bg to left padding, content, then re-apply for right padding
        fullLine = bgStr + leftPadStr + leftContentPadStr + processedLine +
                   bgStr + rightContentPadStr + rightPadStr;
      }

      buffer.append(fullLine + '\x1b[0m');
    }

    // Handle empty content
    if (lines.length === 0 && (border || bgAnsiCode)) {
      let emptyLine;

      if (border) {
        const innerContent = getSpaces(interiorWidth);
        emptyLine = bgStr + borderFgCode + borderChars.vertical +
                   bgStr + innerContent +
                   bgStr + borderFgCode + borderChars.vertical;
      } else {
        emptyLine = bgStr + getSpaces(interiorWidth);
      }
      buffer.append(emptyLine + '\x1b[0m');
    }

    // Add paddingBottom empty lines
    if (effectivePaddingBottom > 0) {
      let emptyLine;
      if (border) {
        const innerContent = getSpaces(interiorWidth);
        emptyLine = bgStr + borderFgCode + borderChars.vertical + '\x1b[0m' +
                   bgStr + innerContent + '\x1b[0m' +
                   bgStr + borderFgCode + borderChars.vertical + '\x1b[0m';
      } else {
        emptyLine = bgStr + getSpaces(interiorWidth) + '\x1b[0m';
      }
      for (let i = 0; i < effectivePaddingBottom; i++) {
        buffer.append(emptyLine);
      }
    }

    // Bottom border
    if (border) {
      const bottomBorderContent = borderChars.bottomLeft + borderChars.horizontal.repeat(interiorWidth) + borderChars.bottomRight;
      buffer.append(bgStr + borderFgCode + bottomBorderContent + '\x1b[0m');
    }

    return buffer.toString();
  } finally {
    releaseBuffer(buffer);
  }
}

/**
 * Helper to count lines in a string
 */
function countLines(str) {
  if (!str) return 0;
  let count = 1;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 10) count++;
  }
  return count;
}

/**
 * Render handler for box
 */
class BoxRenderHandler extends RenderHandler {
  render(ctx) {
    const { node, depth, absX } = ctx;
    const props = ctx.props;
    const hasBorder = props.border !== false;
    const paddingTop = props.paddingTop ?? props.padding ?? 0;
    const paddingLeft = props.paddingLeft ?? props.padding ?? 0;

    const contentYOffset = (hasBorder ? 1 : 0) + paddingTop;
    const contentXOffset = (hasBorder ? 1 : 0) + paddingLeft;

    let boxContent;
    if (ctx.children.length > 0) {
      const hasNewlineChildren = ctx.children.some(c => c.type === 'newline');

      if (!hasNewlineChildren && ctx.children.length > 1) {
        const childOutputs = [];
        let innerYOffset = 0;

        for (const child of ctx.children) {
          if (child.type === 'comment') continue;
          const childOut = ctx.renderChild(child, {
            parentAbsX: absX + contentXOffset,
            yOffset: contentYOffset + innerYOffset,
            inRow: false
          });
          if (childOut) {
            childOutputs.push(childOut);
            innerYOffset += countLines(childOut);
          }
        }
        boxContent = childOutputs.join('\n');
      } else {
        let innerYOffset = 0;
        boxContent = renderChildrenCached(node, (child) => {
          const childOut = ctx.renderChild(child, {
            parentAbsX: absX + contentXOffset,
            yOffset: contentYOffset + innerYOffset,
            inRow: false
          });
          innerYOffset += countLines(childOut);
          return childOut;
        });
      }
    } else {
      boxContent = ctx.text;
    }

    // Width injection
    const width = ctx.getEffectiveWidth();
    const needsWidth = width !== null && props.width == null;
    if (needsWidth) node.props.width = width;

    const output = renderBox(boxContent, props, depth);

    if (needsWidth) delete node.props.width;
    return output;
  }
}

renderHandlerRegistry.register('box', new BoxRenderHandler());
