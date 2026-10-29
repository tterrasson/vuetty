// src/utils/renderUtils.js
import chalk from 'chalk';
import stringWidth from 'string-width';
import { layoutCache } from '@core/layoutCache.js';
import { getChalkColorChain, getChalkBgChain } from '@utils/colorUtils.js';

// Terminal ANSI control sequences
export const SYNC_START = '\x1b[?2026h';
export const SYNC_END = '\x1b[?2026l';
export const ERASE_LINE = '\x1b[2K';
export const CURSOR_HOME = '\x1b[H';
export const CLEAR_BELOW = '\x1b[J';
export const SHOW_CURSOR = '\x1b[?25h';

// Pre-compiled regex
const ANSI_ESCAPE_REGEX = /^\x1b\[[0-9;]*m/;
const ANSI_GLOBAL_REGEX = /\x1b\[[0-9;]*m/g;
const ANSI_RESET_REGEX = /^\x1b\[0?m$/;

/**
 * Match an SGR escape sequence (\x1b[...m) starting exactly at `index`.
 * Equivalent to ANSI_ESCAPE_REGEX.test(str.slice(index)) but without
 * allocating a substring, so it is safe in per-character hot loops.
 * @param {string} text
 * @param {number} index
 * @returns {string|null} The full escape sequence, or null
 */
function matchAnsiCodeAt(text, index) {
  if (text.charCodeAt(index) !== 0x1b || text.charCodeAt(index + 1) !== 0x5b /* [ */) {
    return null;
  }
  const len = text.length;
  let j = index + 2;
  while (j < len) {
    const c = text.charCodeAt(j);
    if (c === 0x6d /* m */) {
      return text.slice(index, j + 1);
    }
    if ((c >= 0x30 && c <= 0x39) || c === 0x3b /* ; */) {
      j++;
      continue;
    }
    return null;
  }
  return null;
}

/**
 * Length in UTF-16 code units of the code point at `index`.
 * Surrogate pairs (emoji, rare CJK) must be consumed as one visual unit.
 * @param {string} text
 * @param {number} index
 * @returns {number} 1 or 2
 */
function codePointLengthAt(text, index) {
  const code = text.charCodeAt(index);
  if (code >= 0xd800 && code <= 0xdbff) {
    const low = text.charCodeAt(index + 1);
    if (low >= 0xdc00 && low <= 0xdfff) return 2;
  }
  return 1;
}

// Pre-allocated space strings
const SPACE_CACHE = (() => {
  const cache = new Array(201);

  cache[0] = '';
  for (let i = 1; i <= 200; i++) {
    cache[i] = ' '.repeat(i);
  }

  return cache;
})();

export function getSpaces(count) {
  if (count <= 0) return '';
  return SPACE_CACHE[count] ?? ' '.repeat(count);
}

/**
 * Strip ANSI escape codes from a string
 */
export function stripAnsi(str) {
  return str.replace(ANSI_GLOBAL_REGEX, '');
}

/**
 * Calculate terminal display width
 */
export function getTerminalWidth(text) {
  const cached = layoutCache.measureText(text);
  if (cached !== null && cached !== undefined) return cached;

  const width = stringWidth(text);
  layoutCache.setMeasurement(text, width);

  return width;
}

/**
 * Truncate text preserving ANSI codes
 * Adds reset code at end if truncation occurs with active styles
 */
export function truncateWithAnsi(text, maxWidth) {
  if (!text || maxWidth <= 0) return '';

  let visualWidth = 0;
  let result = '';
  let i = 0;
  const len = text.length;
  let hasActiveStyle = false;  // Track if styles are active

  while (i < len && visualWidth < maxWidth) {
    const code = matchAnsiCodeAt(text, i);

    if (code !== null) {
      result += code;
      i += code.length;

      // Track style state
      hasActiveStyle = !ANSI_RESET_REGEX.test(code);
      continue;
    }

    // Consume a full code point (surrogate pairs count as one visual char)
    const charLen = codePointLengthAt(text, i);
    let char;
    let charWidth;
    if (charLen === 1) {
      const code = text.charCodeAt(i);
      char = text[i];
      // Printable ASCII is always exactly one column wide
      charWidth = (code >= 0x20 && code <= 0x7e) ? 1 : stringWidth(char);
    } else {
      char = text.slice(i, i + charLen);
      charWidth = stringWidth(char);
    }

    if (visualWidth + charWidth <= maxWidth) {
      result += char;
      visualWidth += charWidth;
      i += charLen;
    } else {
      break;
    }
  }

  // If we truncated and have active styles, add reset to prevent style bleeding
  if (i < len && hasActiveStyle) {
    result += '\x1b[0m';
  }

  return result;
}

/**
 * Pad line to target width
 */
export function padLineToWidth(line, targetWidth, align = 'left') {
  const currentWidth = getTerminalWidth(line);
  const padding = targetWidth - currentWidth;

  if (padding <= 0) return line;

  switch (align) {
    case 'right':
      return getSpaces(padding) + line;
    case 'center': {
      const leftPad = padding >> 1;
      return getSpaces(leftPad) + line + getSpaces(padding - leftPad);
    }
    default:
      return line + getSpaces(padding);
  }
}

/**
 * Wrap text to fit width
 */
export function wrapText(text, maxWidth) {
  if (!maxWidth || maxWidth <= 0) return text;

  const lines = text.split('\n');
  const wrappedLines = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineWidth = getTerminalWidth(line);

    if (lineWidth <= maxWidth) {
      wrappedLines.push(line);
      continue;
    }

    let remaining = line;
    let remainingWidth = lineWidth; // tracked incrementally; ANSI prefixes are zero-width
    // Incremental tracking is exact only while every consumed char is
    // printable ASCII (width 1) or an ANSI escape (width 0). Grapheme
    // clusters (ZWJ emoji, combining marks) make per-char sums diverge
    // from a whole-string measurement, so fall back to re-measuring.
    let trackWidth = true;
    let activeStyles = [];

    while (remaining.length > 0) {
      if (trackWidth) {
        if (remainingWidth <= maxWidth) {
          wrappedLines.push(remaining);
          break;
        }
      } else if (getTerminalWidth(remaining) <= maxWidth) {
        wrappedLines.push(remaining);
        break;
      }

      let visualWidth = 0;
      let byteIndex = 0;
      let lastSpaceByteIndex = -1;
      let lastSpaceVisualWidth = 0;
      let currentChunk = '';

      while (byteIndex < remaining.length && visualWidth < maxWidth) {
        const ansiCode = matchAnsiCodeAt(remaining, byteIndex);

        if (ansiCode !== null) {
          currentChunk += ansiCode;

          if (ANSI_RESET_REGEX.test(ansiCode)) {
            activeStyles = [];
          } else {
            activeStyles.push(ansiCode);
          }

          byteIndex += ansiCode.length;
          continue;
        }

        // Consume a full code point (surrogate pairs count as one visual char)
        const charLen = codePointLengthAt(remaining, byteIndex);
        let char;
        let charWidth;
        if (charLen === 1) {
          const code = remaining.charCodeAt(byteIndex);
          char = remaining[byteIndex];
          if (code >= 0x20 && code <= 0x7e) {
            // Printable ASCII is always exactly one column wide
            charWidth = 1;
          } else {
            charWidth = stringWidth(char);
            trackWidth = false;
          }
        } else {
          char = remaining.slice(byteIndex, byteIndex + charLen);
          charWidth = stringWidth(char);
          trackWidth = false;
        }

        if (visualWidth + charWidth <= maxWidth) {
          currentChunk += char;
          visualWidth += charWidth;

          if (char === ' ') {
            lastSpaceByteIndex = byteIndex;
            lastSpaceVisualWidth = visualWidth;
          }

          byteIndex += charLen;
        } else {
          break;
        }
      }

      let finalChunk = currentChunk;
      let finalByteIndex = byteIndex;
      // Visual width consumed by finalChunk (before the trailing-space trim)
      let consumedWidth = visualWidth;

      if (lastSpaceByteIndex >= 0 && lastSpaceVisualWidth > maxWidth * 0.3) {
        finalChunk = '';
        let tempIndex = 0;

        while (tempIndex <= lastSpaceByteIndex) {
          const ansiCode = matchAnsiCodeAt(remaining, tempIndex);
          if (ansiCode !== null) {
            finalChunk += ansiCode;
            tempIndex += ansiCode.length;
          } else {
            finalChunk += remaining[tempIndex];
            tempIndex++;
          }
        }

        finalByteIndex = lastSpaceByteIndex + 1;
        consumedWidth = lastSpaceVisualWidth;
      }

      // No progress possible: the next char is wider than maxWidth
      // (e.g. a CJK char with maxWidth 1). Force-emit it on its own
      // line, otherwise this loop never terminates.
      // Also covers chunks that consumed only ANSI escapes (zero visual
      // width) and stop on a too-wide char: without this, re-prepending
      // the carried styles would loop forever at the same position.
      if (finalByteIndex === 0 || (visualWidth === 0 && finalByteIndex < remaining.length)) {
        // Consume the full code point (emoji are 2 code units)
        const cp = remaining.codePointAt(finalByteIndex);
        const cpStr = String.fromCodePoint(cp);
        finalChunk = finalChunk + cpStr;
        finalByteIndex += cpStr.length;
        consumedWidth = stringWidth(cpStr);
      }

      if (activeStyles.length > 0) {
        finalChunk += '\x1b[0m';
      }

      wrappedLines.push(finalChunk.trimEnd());

      remaining = remaining.slice(finalByteIndex);
      remainingWidth -= consumedWidth;
      if (remainingWidth < 0) remainingWidth = 0;
      if (activeStyles.length > 0 && remaining.length > 0) {
        remaining = activeStyles.join('') + remaining;
        // The re-applied codes are consumed (and re-tracked) by the next
        // chunk, since ANSI escapes are always consumed before the first
        // printable char. Keeping them in activeStyles would re-append the
        // whole prefix on every chunk, doubling it each iteration and
        // growing the string exponentially when no reset is consumed.
        activeStyles = [];
      }
    }
  }

  return wrappedLines.join('\n');
}

// Cached style chains: building a chalk chain allocates several objects,
// and applyStyles runs for every styled node on every render.
const styleChainCache = new Map();
const MAX_STYLE_CHAIN_CACHE = 100;

/**
 * Apply text styles using chalk
 */
export function applyStyles(text, props) {
  // Fast path: no styles
  if (!props.bold && !props.italic && !props.underline && !props.dim && !props.color && !props.bg) {
    return text;
  }

  // Build cache key for the style combination
  const chainKey =
    (props.bold ? '1' : '0') +
    (props.italic ? '1' : '0') +
    (props.underline ? '1' : '0') +
    (props.dim ? '1' : '0') +
    '|' + (props.color || '') +
    '|' + (props.bg || '');

  let styled = styleChainCache.get(chainKey);
  if (styled === undefined) {
    styled = chalk;

    if (props.bold) styled = styled.bold;
    if (props.italic) styled = styled.italic;
    if (props.underline) styled = styled.underline;
    if (props.dim) styled = styled.dim;

    // Use utility for foreground color (supports named, hex, RGB)
    if (props.color) {
      const colorChain = getChalkColorChain(props.color, styled);
      if (colorChain) styled = colorChain;
    }

    // Use utility for background color (supports named, hex, RGB)
    if (props.bg) {
      const bgChain = getChalkBgChain(props.bg, styled);
      if (bgChain) styled = bgChain;
    }

    if (styleChainCache.size >= MAX_STYLE_CHAIN_CACHE) {
      const firstKey = styleChainCache.keys().next().value;
      styleChainCache.delete(firstKey);
    }
    styleChainCache.set(chainKey, styled);
  }

  return styled(text);
}

/**
 * Extract text content from a TUI node's children
 * @param {Object} node - TUI node
 * @returns {string} Extracted text content
 */
export function extractTextContent(node) {
  if (!node) return '';
  if (node.text) return node.text;
  if (node.props?.text) return node.props.text;

  const children = node.children;
  if (!children || children.length === 0) return '';

  // Single child optimization
  if (children.length === 1) {
    const child = children[0];
    if (typeof child === 'string') return child;
    if (child?.type === 'text') return child.text || '';
    return extractTextContent(child);
  }

  // Multiple children - reuse array if possible
  const parts = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (typeof child === 'string') {
      parts.push(child);
    } else if (child?.type === 'text') {
      if (child.text) parts.push(child.text);
    } else if (child) {
      const text = extractTextContent(child);
      if (text) parts.push(text);
    }
  }

  return parts.join('');
}
