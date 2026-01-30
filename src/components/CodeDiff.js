// src/components/CodeDiff.js
import { h, inject } from 'vue';
import { diffLines } from 'diff';
import { highlight } from 'cli-highlight';
import TextBox from './TextBox.js';
import Newline from './Newline.js';
import { boxProps } from '@core/layoutProps.js';
import { VUETTY_THEME_KEY } from '@core/vuettyKeys.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import { preserveBackground, getAnsiBgCode, getChalkColor } from '@utils/colorUtils.js';
import { getTerminalWidth } from '@utils/renderUtils.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

/**
 * CodeDiff component
 * Displays diff between two code snippets with syntax highlighting
 * Supports inline (unified) and side-by-side display modes
 */
export default {
  name: 'CodeDiff',
  props: {
    // Core diff inputs
    oldCode: { type: String, default: '' },
    newCode: { type: String, default: '' },

    // Display mode
    mode: {
      type: String,
      default: 'inline',
      validator: val => ['inline', 'side-by-side'].includes(val)
    },

    // Language for syntax highlighting
    language: { type: String, default: 'text' },

    // Show/hide line numbers
    showLineNumbers: { type: Boolean, default: true },

    // Context lines (lines to show around changes)
    context: { type: Number, default: 3 },

    // Show all lines (ignores context setting)
    showAll: { type: Boolean, default: false },

    // Color props
    addedColor: { type: String, default: null },
    removedColor: { type: String, default: null },
    unchangedColor: { type: String, default: null },
    addedBg: { type: String, default: null },
    removedBg: { type: String, default: null },
    lineNumberColor: { type: String, default: null },

    // Code block styling
    codeBg: { type: String, default: null },

    // Border styling
    border: { type: Boolean, default: true },

    // Include common layout props
    ...boxProps,
    padding: { type: Number, default: 1 }
  },

  setup(props) {
    const parentWidthContext = inject(WIDTH_CONTEXT_KEY, null);
    const theme = inject(VUETTY_THEME_KEY, null);

    // Cache for diff computation
    let lastOldCode = '';
    let lastNewCode = '';
    let cachedDiff = null;

    /**
     * Compute diff between old and new code with caching
     */
    function computeDiff(oldCode, newCode) {
      if (oldCode === lastOldCode && newCode === lastNewCode && cachedDiff) {
        return cachedDiff;
      }
      lastOldCode = oldCode;
      lastNewCode = newCode;
      cachedDiff = diffLines(oldCode, newCode);
      return cachedDiff;
    }

    /**
     * Get effective width for content
     */
    function getEffectiveWidth() {
      if (props.width !== null && props.width !== undefined) {
        return props.width;
      }
      if (parentWidthContext !== null) {
        const contextWidth = typeof parentWidthContext === 'function'
          ? parentWidthContext()
          : parentWidthContext;
        const isValidWidth = contextWidth !== null &&
          contextWidth !== undefined &&
          contextWidth > 0;
        if (isValidWidth) {
          return contextWidth;
        }
      }
      return null;
    }

    return () => {
      const themeCodeDiff = theme?.components?.codeDiff || {};

      // Resolve effective props with theme defaults
      const effectiveProps = {
        addedColor: props.addedColor ??
          themeCodeDiff.addedColor ??
          theme?.success ??
          '#4ecca3',
        removedColor: props.removedColor ??
          themeCodeDiff.removedColor ??
          theme?.danger ??
          '#d64d64',
        unchangedColor: props.unchangedColor ??
          themeCodeDiff.unchangedColor ??
          theme?.foreground ??
          '#e6e8f0',
        addedBg: props.addedBg ??
          themeCodeDiff.addedBg ??
          '#1a2f1a',
        removedBg: props.removedBg ??
          themeCodeDiff.removedBg ??
          '#2f1a1a',
        lineNumberColor: props.lineNumberColor ??
          themeCodeDiff.lineNumberColor ??
          '#4a4f6a',
        codeBg: props.codeBg ??
          themeCodeDiff.codeBg ??
          theme?.components?.markdown?.codeBg ??
          '#1a1a24',
        borderColor: themeCodeDiff.borderColor ?? '#4a4f6a'
      };

      const diff = computeDiff(props.oldCode || '', props.newCode || '');
      const effectiveWidth = getEffectiveWidth();

      // Calculate content width (accounting for border and padding)
      const borderOverhead = props.border ? 2 : 0;
      const paddingOverhead = (props.padding || 0) * 2;
      const contentWidth = effectiveWidth
        ? effectiveWidth - borderOverhead - paddingOverhead
        : null;

      // Build enhanced props for render handler
      // Note: We need to explicitly copy props
      // since Vue's proxy doesn't spread properly
      const enhancedProps = {
        // Core props
        oldCode: props.oldCode,
        newCode: props.newCode,
        mode: props.mode,
        language: props.language,
        showLineNumbers: props.showLineNumbers,
        context: props.context,
        showAll: props.showAll,
        border: props.border,
        padding: props.padding,
        width: props.width,
        // Effective color props (resolved from theme)
        ...effectiveProps,
        // Internal props
        _diff: diff,
        _contentWidth: contentWidth
      };

      return h('codediff', enhancedProps);
    };
  }
};

/**
 * Apply syntax highlighting to a line of code
 * @param {string} line - Line of code
 * @param {string} language - Programming language
 * @returns {string} Highlighted line with ANSI codes
 */
function highlightLine(line, language) {
  if (!line || language === 'text') return line;

  try {
    // Remove trailing newline for highlighting
    const trimmed = line.replace(/\n$/, '');
    const highlighted = highlight(trimmed, {
      language: language,
      ignoreIllegals: true
    });
    return highlighted;
  } catch {
    return line.replace(/\n$/, '');
  }
}

/**
 * Build line number string with padding
 * @param {number|null} num - Line number or null for empty
 * @param {number} width - Width to pad to
 * @returns {string} Padded line number
 */
function formatLineNumber(num, width) {
  if (num === null) return ' '.repeat(width);
  return String(num).padStart(width, ' ');
}

/**
 * Render diff in inline (unified) mode
 * @param {Array} diff - Diff result from diffLines
 * @param {Object} props - Component props with effective values
 * @returns {Array} Array of vnodes
 */
function renderInlineDiff(diff, props) {
  const elements = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  // Calculate max line number width for alignment
  let totalOldLines = 0;
  let totalNewLines = 0;
  for (const part of diff) {
    const lines = part.value.split('\n').filter((l, i, arr) => {
      return i < arr.length - 1 || l !== '';
    });
    if (part.removed) {
      totalOldLines += lines.length;
    } else if (part.added) {
      totalNewLines += lines.length;
    } else {
      totalOldLines += lines.length;
      totalNewLines += lines.length;
    }
  }

  const maxOldNum = Math.max(totalOldLines, 1);
  const maxNewNum = Math.max(totalNewLines, 1);
  const oldNumWidth = String(maxOldNum).length;
  const newNumWidth = String(maxNewNum).length;

  // Track which lines to show (for context filtering)
  const allLines = [];

  // First pass: collect all lines with metadata
  for (const part of diff) {
    const lines = part.value.split('\n');
    // Handle trailing empty string from split
    const hasTrailingEmpty = lines[lines.length - 1] === '';
    const lineCount = hasTrailingEmpty ? lines.length - 1 : lines.length;

    for (let i = 0; i < lineCount; i++) {
      const line = lines[i];
      let type = 'unchanged';
      let oldNum = null;
      let newNum = null;

      if (part.removed) {
        type = 'removed';
        oldNum = oldLineNum++;
      } else if (part.added) {
        type = 'added';
        newNum = newLineNum++;
      } else {
        type = 'unchanged';
        oldNum = oldLineNum++;
        newNum = newLineNum++;
      }

      allLines.push({ line, type, oldNum, newNum });
    }
  }

  // Second pass: filter by context if not showing all
  let linesToShow = allLines;
  if (!props.showAll && props.context >= 0) {
    const changeIndices = new Set();
    allLines.forEach((l, i) => {
      if (l.type !== 'unchanged') {
        changeIndices.add(i);
      }
    });

    const showIndices = new Set();
    for (const idx of changeIndices) {
      const rangeStart = Math.max(0, idx - props.context);
      const rangeEnd = Math.min(allLines.length - 1, idx + props.context);
      for (let i = rangeStart; i <= rangeEnd; i++) {
        showIndices.add(i);
      }
    }

    // Build filtered lines with separators
    linesToShow = [];
    let lastShownIdx = -1;
    const sortedIndices = [...showIndices].sort((a, b) => a - b);

    for (const idx of sortedIndices) {
      if (lastShownIdx !== -1 && idx > lastShownIdx + 1) {
        // Add separator for skipped lines
        const skippedCount = idx - lastShownIdx - 1;
        linesToShow.push({ type: 'separator', count: skippedCount });
      }
      linesToShow.push(allLines[idx]);
      lastShownIdx = idx;
    }
  }

  // Third pass: render lines
  for (const item of linesToShow) {
    if (item.type === 'separator') {
      // Render separator for skipped lines
      const plural = item.count > 1 ? 's' : '';
      const sepText = `@@ ${item.count} line${plural} hidden @@`;
      elements.push(
        h(TextBox, {
          color: props.lineNumberColor,
          dim: true
        }, {
          default: () => sepText
        })
      );
      elements.push(h(Newline));
      continue;
    }

    const { line, type, oldNum, newNum } = item;

    // Build line prefix
    let prefix = '';
    if (props.showLineNumbers) {
      const oldNumStr = formatLineNumber(oldNum, oldNumWidth);
      const newNumStr = formatLineNumber(newNum, newNumWidth);
      prefix = `${oldNumStr} ${newNumStr} `;
    }

    // Determine marker and colors
    let marker = ' ';
    let markerColor = props.unchangedColor;
    let lineBg = null;

    if (type === 'removed') {
      marker = '-';
      markerColor = props.removedColor;
      lineBg = props.removedBg;
    } else if (type === 'added') {
      marker = '+';
      markerColor = props.addedColor;
      lineBg = props.addedBg;
    }

    // Apply syntax highlighting
    let content = highlightLine(line, props.language);

    // Apply background color preservation if needed
    if (lineBg) {
      const bgCode = getAnsiBgCode(lineBg);
      if (bgCode) {
        content = bgCode + preserveBackground(content, bgCode) + '\x1b[0m';
      }
    }

    // Render line number prefix
    if (props.showLineNumbers) {
      elements.push(
        h(TextBox, { color: props.lineNumberColor }, { default: () => prefix })
      );
    }

    // Render marker
    elements.push(
      h(TextBox, {
        color: markerColor,
        bold: type !== 'unchanged'
      }, {
        default: () => marker + ' '
      })
    );

    // Render content
    elements.push(
      h(TextBox, { bg: lineBg }, { default: () => content })
    );

    elements.push(h(Newline));
  }

  // Remove trailing newline
  if (elements.length > 0 && elements[elements.length - 1].type === Newline) {
    elements.pop();
  }

  return elements;
}

/**
 * Render diff in side-by-side mode
 * @param {Array} diff - Diff result from diffLines
 * @param {Object} props - Component props with effective values
 * @returns {Array} Array of vnodes
 */
function renderSideBySideDiff(diff, props) {
  const elements = [];

  // Build parallel line arrays
  const leftLines = [];
  const rightLines = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  for (const part of diff) {
    const lines = part.value.split('\n');
    const hasTrailing = lines[lines.length - 1] === '';
    const lineCount = hasTrailing ? lines.length - 1 : lines.length;

    if (part.removed) {
      for (let i = 0; i < lineCount; i++) {
        leftLines.push({
          line: lines[i],
          type: 'removed',
          num: oldLineNum++
        });
        rightLines.push({ line: '', type: 'empty', num: null });
      }
    } else if (part.added) {
      // Check if we have empty placeholders on right to fill
      let filled = 0;
      for (let j = rightLines.length - 1; j >= 0 && filled < lineCount; j--) {
        const rightIsEmpty = rightLines[j].type === 'empty';
        const leftIsRemoved = leftLines[j]?.type === 'removed';
        if (rightIsEmpty && leftIsRemoved) {
          rightLines[j] = {
            line: lines[filled],
            type: 'added',
            num: newLineNum++
          };
          filled++;
        }
      }
      // Add remaining as new rows
      for (let i = filled; i < lineCount; i++) {
        leftLines.push({ line: '', type: 'empty', num: null });
        rightLines.push({
          line: lines[i],
          type: 'added',
          num: newLineNum++
        });
      }
    } else {
      for (let i = 0; i < lineCount; i++) {
        leftLines.push({
          line: lines[i],
          type: 'unchanged',
          num: oldLineNum++
        });
        rightLines.push({
          line: lines[i],
          type: 'unchanged',
          num: newLineNum++
        });
      }
    }
  }

  // Calculate display widths
  const maxLeftNum = Math.max(...leftLines.map(l => l.num || 0), 1);
  const maxRightNum = Math.max(...rightLines.map(l => l.num || 0), 1);
  const leftNumWidth = String(maxLeftNum).length;
  const rightNumWidth = String(maxRightNum).length;

  // Calculate column width for side-by-side
  const contentWidth = props._contentWidth;
  const separatorWidth = 3; // ' | '
  const columnWidth = contentWidth
    ? Math.floor((contentWidth - separatorWidth) / 2)
    : 40;

  // Filter by context if needed
  let indicesToShow;
  if (!props.showAll && props.context >= 0) {
    const changeIndices = new Set();
    for (let i = 0; i < leftLines.length; i++) {
      const leftChanged = leftLines[i].type !== 'unchanged';
      const rightChanged = rightLines[i].type !== 'unchanged';
      if (leftChanged || rightChanged) {
        changeIndices.add(i);
      }
    }

    indicesToShow = new Set();
    for (const idx of changeIndices) {
      const rangeStart = Math.max(0, idx - props.context);
      const rangeEnd = Math.min(leftLines.length - 1, idx + props.context);
      for (let i = rangeStart; i <= rangeEnd; i++) {
        indicesToShow.add(i);
      }
    }
  } else {
    indicesToShow = new Set([...Array(leftLines.length).keys()]);
  }

  // Render rows
  const sortedIndices = [...indicesToShow].sort((a, b) => a - b);
  let lastIdx = -1;

  for (const i of sortedIndices) {
    // Add separator if there's a gap
    if (lastIdx !== -1 && i > lastIdx + 1) {
      const skipped = i - lastIdx - 1;
      const leftDash = '─'.repeat(columnWidth - 10);
      const rightDash = '─'.repeat(columnWidth - 10);
      const sepText = `${leftDash} ${skipped} lines ${rightDash}`;
      elements.push(
        h(TextBox, {
          color: props.lineNumberColor,
          dim: true
        }, {
          default: () => sepText
        })
      );
      elements.push(h(Newline));
    }
    lastIdx = i;

    const left = leftLines[i];
    const right = rightLines[i];

    // Render left side
    if (props.showLineNumbers) {
      const numStr = formatLineNumber(left.num, leftNumWidth);
      elements.push(
        h(TextBox, { color: props.lineNumberColor }, { default: () => numStr + ' ' })
      );
    }

    // Left marker
    let leftMarker = ' ';
    let leftColor = props.unchangedColor;
    let leftBg = null;
    if (left.type === 'removed') {
      leftMarker = '-';
      leftColor = props.removedColor;
      leftBg = props.removedBg;
    }

    elements.push(
      h(TextBox, {
        color: leftColor,
        bold: left.type === 'removed'
      }, {
        default: () => leftMarker + ' '
      })
    );

    // Left content
    let leftContent = highlightLine(left.line, props.language);
    if (leftBg) {
      const bgCode = getAnsiBgCode(leftBg);
      if (bgCode) {
        leftContent = bgCode + preserveBackground(leftContent, bgCode) + '\x1b[0m';
      }
    }

    // Pad/truncate left content
    const leftDisplayWidth = getTerminalWidth(left.line);
    const leftPadding = Math.max(
      0,
      columnWidth - leftNumWidth - 4 - leftDisplayWidth
    );
    elements.push(
      h(TextBox, {
        bg: leftBg
      }, {
        default: () => leftContent + ' '.repeat(leftPadding)
      })
    );

    // Separator
    elements.push(
      h(TextBox, { color: props.lineNumberColor }, { default: () => ' | ' })
    );

    // Render right side
    if (props.showLineNumbers) {
      const numStr = formatLineNumber(right.num, rightNumWidth);
      elements.push(
        h(TextBox, { color: props.lineNumberColor }, { default: () => numStr + ' ' })
      );
    }

    // Right marker
    let rightMarker = ' ';
    let rightColor = props.unchangedColor;
    let rightBg = null;
    if (right.type === 'added') {
      rightMarker = '+';
      rightColor = props.addedColor;
      rightBg = props.addedBg;
    }

    elements.push(
      h(TextBox, {
        color: rightColor,
        bold: right.type === 'added'
      }, {
        default: () => rightMarker + ' '
      })
    );

    // Right content
    let rightContent = highlightLine(right.line, props.language);
    if (rightBg) {
      const bgCode = getAnsiBgCode(rightBg);
      if (bgCode) {
        rightContent = bgCode + preserveBackground(rightContent, bgCode) + '\x1b[0m';
      }
    }

    elements.push(
      h(TextBox, { bg: rightBg }, { default: () => rightContent })
    );

    elements.push(h(Newline));
  }

  // Remove trailing newline
  if (elements.length > 0 && elements[elements.length - 1].type === Newline) {
    elements.pop();
  }

  return elements;
}

/**
 * Main render function for CodeDiff
 * @param {Object} props - Component props
 * @returns {string} Rendered output
 */
export function renderCodeDiff(props) {
  const diff = props._diff || [];

  if (diff.length === 0) {
    return '';
  }

  // Choose render mode
  const renderFn = props.mode === 'side-by-side'
    ? renderSideBySideDiff
    : renderInlineDiff;

  return renderFn(diff, props);
}

/**
 * Render handler for CodeDiff component
 */
class CodeDiffRenderHandler extends RenderHandler {
  render(ctx) {
    const { props } = ctx;

    // Get diff data from props
    const diff = props._diff || [];

    if (diff.length === 0) {
      return '';
    }

    // Build line-by-line output
    const lines = [];
    let oldLineNum = 1;
    let newLineNum = 1;

    // Calculate max line number width
    let totalOldLines = 0;
    let totalNewLines = 0;
    for (const part of diff) {
      const partLines = part.value.split('\n').filter((l, i, arr) => {
        return i < arr.length - 1 || l !== '';
      });
      if (part.removed) {
        totalOldLines += partLines.length;
      } else if (part.added) {
        totalNewLines += partLines.length;
      } else {
        totalOldLines += partLines.length;
        totalNewLines += partLines.length;
      }
    }

    const maxOldNum = Math.max(totalOldLines, 1);
    const maxNewNum = Math.max(totalNewLines, 1);
    const oldNumWidth = String(maxOldNum).length;
    const newNumWidth = String(maxNewNum).length;

    // Collect all lines with metadata
    const allLines = [];
    for (const part of diff) {
      const partLines = part.value.split('\n');
      const hasTrailing = partLines[partLines.length - 1] === '';
      const lineCount = hasTrailing ? partLines.length - 1 : partLines.length;

      for (let i = 0; i < lineCount; i++) {
        const line = partLines[i];
        let type = 'unchanged';
        let oldNum = null;
        let newNum = null;

        if (part.removed) {
          type = 'removed';
          oldNum = oldLineNum++;
        } else if (part.added) {
          type = 'added';
          newNum = newLineNum++;
        } else {
          oldNum = oldLineNum++;
          newNum = newLineNum++;
        }

        allLines.push({ line, type, oldNum, newNum });
      }
    }

    // Filter by context
    let linesToRender = allLines;
    if (!props.showAll && props.context >= 0) {
      const changeIndices = new Set();
      allLines.forEach((l, i) => {
        if (l.type !== 'unchanged') changeIndices.add(i);
      });

      const showIndices = new Set();
      for (const idx of changeIndices) {
        const rangeStart = Math.max(0, idx - props.context);
        const rangeEnd = Math.min(allLines.length - 1, idx + props.context);
        for (let i = rangeStart; i <= rangeEnd; i++) {
          showIndices.add(i);
        }
      }

      linesToRender = [];
      let lastShownIdx = -1;
      const sortedIndices = [...showIndices].sort((a, b) => a - b);

      for (const idx of sortedIndices) {
        if (lastShownIdx !== -1 && idx > lastShownIdx + 1) {
          const skippedCount = idx - lastShownIdx - 1;
          linesToRender.push({ type: 'separator', count: skippedCount });
        }
        linesToRender.push(allLines[idx]);
        lastShownIdx = idx;
      }
    }

    // Get chalk colors
    const addedChalk = getChalkColor(props.addedColor);
    const removedChalk = getChalkColor(props.removedColor);
    const lineNumChalk = getChalkColor(props.lineNumberColor);
    const addedBgCode = getAnsiBgCode(props.addedBg);
    const removedBgCode = getAnsiBgCode(props.removedBg);

    // Render based on mode
    if (props.mode === 'side-by-side') {
      return renderSideBySideOutput(
        allLines,
        props,
        oldNumWidth,
        newNumWidth,
        addedChalk,
        removedChalk,
        lineNumChalk,
        addedBgCode,
        removedBgCode
      );
    }

    // Inline mode
    for (const item of linesToRender) {
      if (item.type === 'separator') {
        const plural = item.count > 1 ? 's' : '';
        const sepText = `@@ ${item.count} line${plural} hidden @@`;
        const sep = lineNumChalk(sepText);
        lines.push(sep);
        continue;
      }

      const { line, type, oldNum, newNum } = item;
      let output = '';

      // Line numbers
      if (props.showLineNumbers) {
        const oldNumStr = formatLineNumber(oldNum, oldNumWidth);
        const newNumStr = formatLineNumber(newNum, newNumWidth);
        output += lineNumChalk(`${oldNumStr} ${newNumStr} `);
      }

      // Marker
      if (type === 'removed') {
        output += removedChalk.bold('- ');
      } else if (type === 'added') {
        output += addedChalk.bold('+ ');
      } else {
        output += '  ';
      }

      // Content with highlighting
      let content = highlightLine(line, props.language);

      // Apply background
      if (type === 'removed' && removedBgCode) {
        const preserved = preserveBackground(content, removedBgCode);
        content = removedBgCode + preserved + '\x1b[0m';
      } else if (type === 'added' && addedBgCode) {
        const preserved = preserveBackground(content, addedBgCode);
        content = addedBgCode + preserved + '\x1b[0m';
      }

      output += content;
      lines.push(output);
    }

    return lines.join('\n');
  }
}

/**
 * Render side-by-side output
 */
function renderSideBySideOutput(
  allLines,
  props,
  oldNumWidth,
  newNumWidth,
  addedChalk,
  removedChalk,
  lineNumChalk,
  addedBgCode,
  removedBgCode
) {
  const leftLines = [];
  const rightLines = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  // Build parallel arrays
  let i = 0;
  while (i < allLines.length) {
    const item = allLines[i];

    if (item.type === 'removed') {
      // Check if next item is added (modification)
      if (i + 1 < allLines.length && allLines[i + 1].type === 'added') {
        leftLines.push({ ...item, num: oldLineNum++ });
        rightLines.push({ ...allLines[i + 1], num: newLineNum++ });
        i += 2;
        continue;
      }
      leftLines.push({ ...item, num: oldLineNum++ });
      rightLines.push({ line: '', type: 'empty', num: null });
    } else if (item.type === 'added') {
      leftLines.push({ line: '', type: 'empty', num: null });
      rightLines.push({ ...item, num: newLineNum++ });
    } else {
      leftLines.push({ line: item.line, type: 'unchanged', num: oldLineNum++ });
      rightLines.push({ line: item.line, type: 'unchanged', num: newLineNum++ });
    }
    i++;
  }

  // Filter by context
  let indicesToShow;
  if (!props.showAll && props.context >= 0) {
    const changeIndices = new Set();
    for (let j = 0; j < leftLines.length; j++) {
      if (leftLines[j].type !== 'unchanged' || rightLines[j].type !== 'unchanged') {
        changeIndices.add(j);
      }
    }
    indicesToShow = new Set();
    for (const idx of changeIndices) {
      const rangeStart = Math.max(0, idx - props.context);
      const rangeEnd = Math.min(leftLines.length - 1, idx + props.context);
      for (let k = rangeStart; k <= rangeEnd; k++) {
        indicesToShow.add(k);
      }
    }
  } else {
    indicesToShow = new Set([...Array(leftLines.length).keys()]);
  }

  const sortedIndices = [...indicesToShow].sort((a, b) => a - b);
  const outputLines = [];
  let lastIdx = -1;

  for (const idx of sortedIndices) {
    if (lastIdx !== -1 && idx > lastIdx + 1) {
      const skipped = idx - lastIdx - 1;
      const plural = skipped > 1 ? 's' : '';
      const sepText = `@@ ${skipped} line${plural} hidden @@`;
      outputLines.push(lineNumChalk(sepText));
    }
    lastIdx = idx;

    const left = leftLines[idx];
    const right = rightLines[idx];
    let line = '';

    // Left side
    if (props.showLineNumbers) {
      line += lineNumChalk(formatLineNumber(left.num, oldNumWidth) + ' ');
    }

    if (left.type === 'removed') {
      line += removedChalk.bold('- ');
      let content = highlightLine(left.line, props.language);
      if (removedBgCode) {
        const preserved = preserveBackground(content, removedBgCode);
        content = removedBgCode + preserved + '\x1b[0m';
      }
      line += content;
    } else if (left.type === 'empty') {
      line += '  ';
    } else {
      line += '  ';
      line += highlightLine(left.line, props.language);
    }

    // Pad left side
    const leftWidth = getTerminalWidth(left.line || '');
    const targetWidth = 40;
    line += ' '.repeat(Math.max(0, targetWidth - leftWidth));

    // Separator
    line += lineNumChalk(' | ');

    // Right side
    if (props.showLineNumbers) {
      line += lineNumChalk(formatLineNumber(right.num, newNumWidth) + ' ');
    }

    if (right.type === 'added') {
      line += addedChalk.bold('+ ');
      let content = highlightLine(right.line, props.language);
      if (addedBgCode) {
        const preserved = preserveBackground(content, addedBgCode);
        content = addedBgCode + preserved + '\x1b[0m';
      }
      line += content;
    } else if (right.type === 'empty') {
      line += '  ';
    } else {
      line += '  ';
      line += highlightLine(right.line, props.language);
    }

    outputLines.push(line);
  }

  return outputLines.join('\n');
}

// Register render handler
renderHandlerRegistry.register('codediff', new CodeDiffRenderHandler());
