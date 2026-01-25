// src/utils/renderUtils.js
import chalk from 'chalk';
import stringWidth from 'string-width';
import { layoutCache } from '@core/layoutCache.js';
import { getChalkColorChain, getChalkBgChain } from '@utils/colorUtils.js';

// Pre-compiled regex
const ANSI_ESCAPE_REGEX = /^\x1b\[[0-9;]*m/;
const ANSI_GLOBAL_REGEX = /\x1b\[[0-9;]*m/g;
const ANSI_RESET_REGEX = /^\x1b\[0?m$/;

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
    const remaining = text.slice(i);
    const ansiMatch = remaining.match(ANSI_ESCAPE_REGEX);

    if (ansiMatch) {
      const code = ansiMatch[0];
      result += code;
      i += code.length;

      // Track style state
      if (ANSI_RESET_REGEX.test(code)) {
        hasActiveStyle = false;
      } else {
        hasActiveStyle = true;
      }
      continue;
    }

    const char = text[i];
    const charWidth = stringWidth(char);

    if (visualWidth + charWidth <= maxWidth) {
      result += char;
      visualWidth += charWidth;
      i++;
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
    let activeStyles = [];

    while (remaining.length > 0) {
      const remainingWidth = getTerminalWidth(remaining);

      if (remainingWidth <= maxWidth) {
        wrappedLines.push(remaining);
        break;
      }

      let visualWidth = 0;
      let byteIndex = 0;
      let lastSpaceByteIndex = -1;
      let lastSpaceVisualWidth = 0;
      let currentChunk = '';

      while (byteIndex < remaining.length && visualWidth < maxWidth) {
        const ansiMatch = remaining.slice(byteIndex).match(ANSI_ESCAPE_REGEX);

        if (ansiMatch) {
          const ansiCode = ansiMatch[0];
          currentChunk += ansiCode;

          if (ANSI_RESET_REGEX.test(ansiCode)) {
            activeStyles = [];
          } else {
            activeStyles.push(ansiCode);
          }

          byteIndex += ansiCode.length;
          continue;
        }

        const char = remaining[byteIndex];
        const charWidth = stringWidth(char);

        if (visualWidth + charWidth <= maxWidth) {
          currentChunk += char;
          visualWidth += charWidth;

          if (char === ' ') {
            lastSpaceByteIndex = byteIndex;
            lastSpaceVisualWidth = visualWidth;
          }

          byteIndex++;
        } else {
          break;
        }
      }

      let finalChunk = currentChunk;
      let finalByteIndex = byteIndex;

      if (lastSpaceByteIndex >= 0 && lastSpaceVisualWidth > maxWidth * 0.3) {
        finalChunk = '';
        let tempIndex = 0;

        while (tempIndex <= lastSpaceByteIndex) {
          const ansiMatch = remaining.slice(tempIndex).match(ANSI_ESCAPE_REGEX);
          if (ansiMatch) {
            finalChunk += ansiMatch[0];
            tempIndex += ansiMatch[0].length;
          } else {
            finalChunk += remaining[tempIndex];
            tempIndex++;
          }
        }

        finalByteIndex = lastSpaceByteIndex + 1;
      }

      if (activeStyles.length > 0) {
        finalChunk += '\x1b[0m';
      }

      wrappedLines.push(finalChunk.trimEnd());

      remaining = remaining.slice(finalByteIndex);
      if (activeStyles.length > 0 && remaining.length > 0) {
        remaining = activeStyles.join('') + remaining;
      }
    }
  }

  return wrappedLines.join('\n');
}

/**
 * Apply text styles using chalk
 */
export function applyStyles(text, props) {
  // Fast path: no styles
  if (!props.bold && !props.italic && !props.underline && !props.dim && !props.color && !props.bg) {
    return text;
  }

  let styled = chalk;

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