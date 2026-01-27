// src/utils/markdownRenderer.js
import { h } from 'vue';
import { highlight } from 'cli-highlight';
import { wrapText, getTerminalWidth } from '@utils/renderUtils.js';
import { getCacheConfig } from '@core/cacheConfig.js';

// Reusable empty style object to avoid allocations
const EMPTY_STYLE = Object.freeze({});

function getStyleCacheSize() {
  return getCacheConfig().components.markdown.styles;
}

// Cache for commonly used style combinations
const styleCache = new Map();

function getOrCreateStyle(styleProps) {
  // Fast path for empty style
  if (!styleProps || Object.keys(styleProps).length === 0) {
    return EMPTY_STYLE;
  }

  // Create cache key from sorted properties
  const keys = Object.keys(styleProps).sort();
  const cacheKey = keys.map(k => `${k}:${styleProps[k]}`).join('|');

  let cached = styleCache.get(cacheKey);
  if (cached) return cached;

  // Create frozen style object
  cached = Object.freeze({ ...styleProps });

  // LRU eviction
  if (styleCache.size >= getStyleCacheSize()) {
    const firstKey = styleCache.keys().next().value;
    styleCache.delete(firstKey);
  }

  styleCache.set(cacheKey, cached);
  return cached;
}

/**
 * Clear style cache - call on cleanup
 */
export function clearRendererCaches() {
  styleCache.clear();
}

/**
 * Get cache statistics for markdown renderer
 */
export function getRendererCacheStats() {
  return {
    styleCacheSize: styleCache.size,
    styleCacheMaxSize: getStyleCacheSize()
  };
}

/**
 * Flatten inline tokens to plain string (no styling)
 * Used for simple paragraphs to reduce vnode allocations
 */
export function flattenInlineTokensToString(tokens) {
  if (!tokens || !Array.isArray(tokens)) return '';

  const parts = [];
  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        if (token.text) parts.push(token.text);
        break;
      case 'strong':
        // Flatten nested tokens
        parts.push(token.tokens
          ? flattenInlineTokensToString(token.tokens)
          : (token.text || ''));
        break;
      case 'em':
        parts.push(token.tokens
          ? flattenInlineTokensToString(token.tokens)
          : (token.text || ''));
        break;
      case 'codespan':
        parts.push(` ${token.text} `);
        break;
      case 'link':
        parts.push(`${token.text} (${token.href})`);
        break;
      case 'del':
        parts.push(`~~${token.text}~~`);
        break;
      case 'br':
        parts.push('\n');
        break;
      default:
        if (token.raw) parts.push(token.raw);
        break;
    }
  }
  return parts.join('');
}

/**
 * Render inline markdown tokens (text, strong, em, code, links)
 * Returns array of Vue vnodes
 */
export function renderInlineTokens(tokens, components, props) {
  if (!tokens || !Array.isArray(tokens)) {
    return [];
  }

  const { TextBox } = components;
  const elements = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        if (token.text) {
          elements.push(h(TextBox, { bg: props.bg }, { default: () => token.text }));
        }
        break;

      case 'strong':
        elements.push(
          h(TextBox, {
            bold: true,
            color: props.strongColor,
            bg: props.bg
          }, {
            default: () => token.tokens
              ? renderInlineTokens(token.tokens, components, props)
              : token.text
          })
        );
        break;

      case 'em':
        elements.push(
          h(TextBox, {
            italic: true,
            color: props.emphasisColor,
            bg: props.bg
          }, {
            default: () => token.tokens
              ? renderInlineTokens(token.tokens, components, props)
              : token.text
          })
        );
        break;

      case 'codespan':
        elements.push(
          h(TextBox, {
            color: props.codeColor,
            bg: props.codeBg
          }, {
            default: () => ` ${token.text} `
          })
        );
        break;

      case 'link':
        elements.push(
          h(TextBox, {
            color: props.linkColor,
            underline: true,
            bg: props.bg
          }, {
            default: () => `${token.text} (${token.href})`
          })
        );
        break;

      case 'del':
        elements.push(
          h(TextBox, { dim: true, bg: props.bg }, {
            default: () => `~~${token.text}~~`
          })
        );
        break;

      case 'br':
        elements.push(h(components.Newline));
        break;

      default:
        if (token.raw) {
          elements.push(h(TextBox, { bg: props.bg }, { default: () => token.raw }));
        }
        break;
    }
  }

  return elements;
}

/**
 * Extract plain text from inline tokens (for width calculation)
 */
function getInlineText(tokens) {
  if (!tokens || !Array.isArray(tokens)) return '';

  return tokens.map(token => {
    switch (token.type) {
      case 'text': return token.text || '';
      case 'strong':
      case 'em':
        return token.tokens ? getInlineText(token.tokens) : (token.text || '');
      case 'codespan': return ` ${token.text} `;
      case 'link': return `${token.text} (${token.href})`;
      case 'del': return `~~${token.text}~~`;
      case 'br': return '\n';
      default: return token.raw || '';
    }
  }).join('');
}

/**
 * Render a paragraph with proper text wrapping
 */
export function renderParagraph(token, components, props, availableWidth) {
  const { TextBox, Newline } = components;

  if (!availableWidth || availableWidth <= 0) {
    return [
      ...renderInlineTokens(token.tokens, components, props),
      h(Newline),
    ];
  }

  const fullText = getInlineText(token.tokens);

  if (getTerminalWidth(fullText) <= availableWidth) {
    return [
      ...renderInlineTokens(token.tokens, components, props),
      h(Newline),
    ];
  }

  const wrappedText = wrapText(fullText, availableWidth);

  return [
    h(TextBox, {}, { default: () => wrappedText }),
    h(Newline)
  ];
}

/**
 * Render a paragraph preserving inline styles (advanced version)
 */
export function renderParagraphWithStyles(token, components, props, availableWidth) {
  const { TextBox, Newline } = components;

  if (!availableWidth || availableWidth <= 0) {
    return [
      ...renderInlineTokens(token.tokens, components, props),
      h(Newline)
    ];
  }

  const segments = buildStyledSegments(token.tokens, props);
  const wrappedLines = wrapStyledSegments(segments, availableWidth);

  const elements = [];

  for (let i = 0; i < wrappedLines.length; i++) {
    const line = wrappedLines[i];

    for (const segment of line) {
      elements.push(
        h(TextBox, segment.style, { default: () => segment.text })
      );
    }

    if (i < wrappedLines.length - 1) {
      elements.push(h(Newline));
    }
  }

  elements.push(h(Newline));

  return elements;
}

/**
 * Build styled text segments from tokens
 * Uses cached style objects to reduce memory allocations
 */
function buildStyledSegments(tokens, props, inheritedStyle = null) {
  const segments = [];

  if (!tokens || !Array.isArray(tokens)) return segments;

  // Use cached empty style if no inherited style
  const baseStyle = inheritedStyle || EMPTY_STYLE;

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        if (token.text) {
          segments.push({ text: token.text, style: baseStyle });
        }
        break;

      case 'strong':
        if (token.tokens) {
          const style = getOrCreateStyle({ ...baseStyle, bold: true, color: props.strongColor });
          segments.push(...buildStyledSegments(token.tokens, props, style));
        } else if (token.text) {
          segments.push({
            text: token.text,
            style: getOrCreateStyle({ ...baseStyle, bold: true, color: props.strongColor })
          });
        }
        break;

      case 'em':
        if (token.tokens) {
          const style = getOrCreateStyle({ ...baseStyle, italic: true, color: props.emphasisColor });
          segments.push(...buildStyledSegments(token.tokens, props, style));
        } else if (token.text) {
          segments.push({
            text: token.text,
            style: getOrCreateStyle({ ...baseStyle, italic: true, color: props.emphasisColor })
          });
        }
        break;

      case 'codespan':
        segments.push({
          text: ` ${token.text} `,
          style: getOrCreateStyle({ ...baseStyle, color: props.codeColor, bg: props.codeBg })
        });
        break;

      case 'link':
        segments.push({
          text: `${token.text} (${token.href})`,
          style: getOrCreateStyle({ ...baseStyle, color: props.linkColor, underline: true })
        });
        break;

      case 'del':
        segments.push({
          text: `~~${token.text}~~`,
          style: getOrCreateStyle({ ...baseStyle, dim: true })
        });
        break;

      default:
        if (token.raw) {
          segments.push({ text: token.raw, style: baseStyle });
        }
    }
  }

  return segments;
}

/**
 * Wrap styled segments to fit within width
 * Returns array of lines, each line is array of segments
 */
function wrapStyledSegments(segments, maxWidth) {
  const lines = [[]];
  let currentLineWidth = 0;

  for (const segment of segments) {
    const words = segment.text.split(/(\s+)/);

    for (const word of words) {
      if (!word) continue;

      const wordWidth = getTerminalWidth(word);

      if (currentLineWidth + wordWidth <= maxWidth) {
        const currentLine = lines[lines.length - 1];
        currentLine.push({ text: word, style: segment.style });
        currentLineWidth += wordWidth;
      } else if (wordWidth > maxWidth) {
        let remaining = word;
        while (remaining.length > 0) {
          const availableSpace = maxWidth - currentLineWidth;

          if (availableSpace <= 0) {
            lines.push([]);
            currentLineWidth = 0;
            continue;
          }

          let chunk = '';
          let chunkWidth = 0;
          for (const char of remaining) {
            const charWidth = getTerminalWidth(char);
            if (chunkWidth + charWidth <= availableSpace) {
              chunk += char;
              chunkWidth += charWidth;
            } else {
              break;
            }
          }

          if (chunk) {
            lines[lines.length - 1].push({ text: chunk, style: segment.style });
            currentLineWidth += chunkWidth;
            remaining = remaining.slice(chunk.length);
          }

          if (remaining.length > 0) {
            lines.push([]);
            currentLineWidth = 0;
          }
        }
      } else {
        lines.push([{ text: word, style: segment.style }]);
        currentLineWidth = wordWidth;
      }
    }
  }

  return lines
    .filter(line => line.length > 0)
    .map(line => {
      if (line.length > 0 && line[0].text.match(/^\s+$/)) {
        return line.slice(1);
      }
      if (line.length > 0) {
        line[0] = { ...line[0], text: line[0].text.trimStart() };
      }
      return line;
    })
    .filter(line => line.length > 0);
}

/**
 * Render a markdown list with optional width constraint
 */
export function renderList(token, components, props, depth = 0, contentWidth = null) {
  const { TextBox, Newline } = components;
  const elements = [];
  const indent = '  '.repeat(depth);
  const indentWidth = depth * 2;

  token.items.forEach((item, index) => {
    const prefix = token.ordered
      ? `${token.start + index}. `
      : '• ';

    const prefixWidth = getTerminalWidth(prefix);

    let taskCheckbox = '';
    let taskCheckboxWidth = 0;
    if (item.task) {
      taskCheckbox = item.checked ? '[✓] ' : '[ ] ';
      taskCheckboxWidth = getTerminalWidth(taskCheckbox);
    }

    // Calculate available width for list item content
    const listContentWidth = contentWidth
      ? contentWidth - indentWidth - prefixWidth - taskCheckboxWidth
      : null;

    // Add prefix with color
    elements.push(
      h(TextBox, {
        color: props.listBulletColor
      }, {
        default: () => indent + taskCheckbox + prefix
      })
    );

    // Render item content with width constraint
    if (item.tokens) {
      for (const subToken of item.tokens) {
        if (subToken.type === 'text') {
          if (listContentWidth && subToken.text) {
            const segments = buildStyledSegments(
              subToken.tokens || [{ type: 'text', text: subToken.text }],
              props
            );
            const wrapped = wrapStyledSegments(segments, listContentWidth);

            wrapped.forEach((line, lineIdx) => {
              if (lineIdx > 0) {
                elements.push(h(Newline));
                // Continuation indent
                elements.push(h(TextBox, {}, {
                  default: () => ' '.repeat(indentWidth + prefixWidth + taskCheckboxWidth)
                }));
              }
              for (const seg of line) {
                elements.push(h(TextBox, seg.style, { default: () => seg.text }));
              }
            });
          } else {
            elements.push(...renderInlineTokens(
              subToken.tokens || [{ type: 'text', text: subToken.text }],
              components,
              props
            ));
          }
        } else if (subToken.type === 'list') {
          elements.push(h(Newline));
          elements.push(...renderList(subToken, components, props, depth + 1, contentWidth));
        } else if (subToken.type === 'paragraph') {
          if (listContentWidth) {
            // Remove trailing double newline for list paragraphs
            const paragraphElements = renderParagraphWithStyles(
              subToken,
              components,
              props,
              listContentWidth
            );
            // Remove last 2 Newlines (paragraph adds them)
            while (paragraphElements.length > 0 &&
                   paragraphElements[paragraphElements.length - 1].type === Newline) {
              paragraphElements.pop();
            }
            elements.push(...paragraphElements);
          } else {
            elements.push(...renderInlineTokens(subToken.tokens, components, props));
          }
        }
      }
    }

    elements.push(h(Newline));
  });

  return elements;
}

/**
 * Render a code block with syntax highlighting and width constraint
 */
export function renderCodeBlock(token, components, props, contentWidth = null) {
  const { TextBox, Box, Newline } = components;
  const code = token.text;
  const lang = token.lang || 'text';
  const elements = [];

  // Language label
  if (lang && lang !== 'text') {
    elements.push(
      h(TextBox, {
        color: props.codeColor,
        dim: true
      }, {
        default: () => `[${lang}]`
      })
    );
    elements.push(h(Newline));
  }

  // Calculate inner width for code box (accounting for border + padding)
  // Box has border=true (2 chars) and padding=1 (2 chars) = 4 total
  const codeBoxOverhead = 4;
  const codeWidth = contentWidth ? contentWidth - codeBoxOverhead : null;

  // Process code: wrap long lines if needed
  let processedCode = code;
  if (codeWidth && codeWidth > 0) {
    const codeLines = code.split('\n');
    const wrappedCodeLines = codeLines.map(line => {
      if (getTerminalWidth(line) > codeWidth) {
        return wrapText(line, codeWidth);
      }
      return line;
    });
    processedCode = wrappedCodeLines.join('\n');
  }

  // Try syntax highlighting
  // Note: Do NOT pass bg to TextBox - let the Box apply background via preserveBackground
  let content;
  try {
    const highlighted = highlight(processedCode, {
      language: lang,
      ignoreIllegals: true
    });
    content = h(TextBox, {}, { default: () => highlighted });
  } catch (e) {
    content = h(TextBox, {
      color: props.codeColor
    }, {
      default: () => processedCode
    });
  }

  // Build box props with width constraint
  const boxProps = {
    border: true,
    padding: 1,
    color: props.tableBorderColor,
    bg: props.codeBg
  };

  // Pass width to Box if available
  if (contentWidth) {
    boxProps.width = contentWidth;
  }

  elements.push(
    h(Box, boxProps, {
      default: () => content
    })
  );

  return elements;
}

/**
 * Render a blockquote with width constraint
 */
export function renderBlockquote(token, components, props, renderTokenFn, contentWidth = null) {
  const { Box } = components;

  // Calculate inner width for blockquote (border=true + padding=1 = 4 chars)
  const blockquoteOverhead = 4;
  const innerWidth = contentWidth ? contentWidth - blockquoteOverhead : null;

  // Render inner content with constrained width
  const content = token.tokens.map(t => {
    return renderTokenFn(t, components, props, renderTokenFn, innerWidth);
  }).flat();

  // Remove trailing Newlines from blockquote content
  while (content.length > 0 && content[content.length - 1].type === components.Newline) {
    content.pop();
  }

  // Build box props
  const boxProps = {
    border: true,
    padding: 1,
    color: props.blockquoteBorderColor
  };

  if (contentWidth) {
    boxProps.width = contentWidth;
  }

  return h(Box, boxProps, {
    default: () => content
  });
}

/**
 * Render a markdown table with width constraint
 */
export function renderTable(token, components, props, contentWidth = null) {
  const { TextBox, Newline } = components;

  // Extract headers
  const headers = token.header.map(cell =>
    extractTextFromTokens(cell.tokens)
  );

  // Extract rows
  const rows = token.rows.map(row =>
    row.map(cell => extractTextFromTokens(cell.tokens))
  );

  // Calculate column widths
  let colWidths = headers.map((header, i) => {
    const headerLen = getTerminalWidth(header);
    const maxRowLen = Math.max(
      ...rows.map(row => getTerminalWidth(row[i] || '')),
      0
    );
    return Math.max(headerLen, maxRowLen) + 2; // +2 for padding
  });

  // If we have a width constraint, try to fit the table
  if (contentWidth) {
    const totalWidth = colWidths.reduce((a, b) => a + b, 0) + colWidths.length + 1; // +borders

    if (totalWidth > contentWidth) {
      // Need to shrink columns
      const availableForContent = contentWidth - colWidths.length - 1;
      const totalContentWidth = colWidths.reduce((a, b) => a + b, 0);

      if (availableForContent > 0) {
        // Proportionally shrink columns
        const ratio = availableForContent / totalContentWidth;
        colWidths = colWidths.map(w => Math.max(4, Math.floor(w * ratio))); // min 4 chars
      }
    }
  }

  const elements = [];

  // Helper to pad and truncate text
  const pad = (text, width) => {
    const str = String(text || '');
    const textWidth = getTerminalWidth(str);
    const innerWidth = width - 2; // -2 for padding spaces

    if (textWidth > innerWidth) {
      // Truncate
      let truncated = '';
      let w = 0;
      for (const char of str) {
        const charWidth = getTerminalWidth(char);
        if (w + charWidth > innerWidth - 1) break; // -1 for ellipsis
        truncated += char;
        w += charWidth;
      }
      return ' ' + truncated + '…' + ' '.repeat(Math.max(0, innerWidth - w - 1));
    }

    return ' ' + str + ' '.repeat(Math.max(0, innerWidth - textWidth + 1));
  };

  // Top border
  let topBorder = '┌';
  colWidths.forEach((width, i) => {
    topBorder += '─'.repeat(width);
    topBorder += i < colWidths.length - 1 ? '┬' : '┐';
  });
  elements.push(h(TextBox, { color: props.tableBorderColor }, { default: () => topBorder }));
  elements.push(h(Newline));

  // Header row
  elements.push(h(TextBox, { color: props.tableBorderColor }, { default: () => '│' }));
  headers.forEach((header, i) => {
    elements.push(h(TextBox, { color: props.tableHeaderColor, bold: true }, {
      default: () => pad(header, colWidths[i])
    }));
    elements.push(h(TextBox, { color: props.tableBorderColor }, { default: () => '│' }));
  });
  elements.push(h(Newline));

  // Middle border
  let midBorder = '├';
  colWidths.forEach((width, i) => {
    midBorder += '─'.repeat(width);
    midBorder += i < colWidths.length - 1 ? '┼' : '┤';
  });
  elements.push(h(TextBox, { color: props.tableBorderColor }, { default: () => midBorder }));
  elements.push(h(Newline));

  // Data rows
  rows.forEach((row) => {
    elements.push(h(TextBox, { color: props.tableBorderColor }, { default: () => '│' }));

    row.forEach((cell, colIdx) => {
      elements.push(h(TextBox, {}, { default: () => pad(cell, colWidths[colIdx]) }));
      elements.push(h(TextBox, { color: props.tableBorderColor }, { default: () => '│' }));
    });

    elements.push(h(Newline));
  });

  // Bottom border
  let bottomBorder = '└';
  colWidths.forEach((width, i) => {
    bottomBorder += '─'.repeat(width);
    bottomBorder += i < colWidths.length - 1 ? '┴' : '┘';
  });
  elements.push(h(TextBox, { color: props.tableBorderColor }, { default: () => bottomBorder }));

  return elements;
}

/**
 * Extract plain text from markdown tokens
 */
export function extractTextFromTokens(tokens) {
  if (!tokens || !Array.isArray(tokens)) {
    return '';
  }

  let text = '';
  for (const token of tokens) {
    if (token.text) {
      text += token.text;
    } else if (token.tokens) {
      text += extractTextFromTokens(token.tokens);
    } else if (token.raw) {
      text += token.raw;
    }
  }
  return text;
}