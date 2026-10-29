// src/components/renderHelpers.js
// Shared helpers for component render functions (kept free of component state)
import { getTerminalWidth, getSpaces, truncateWithAnsi } from '@utils/renderUtils.js';

/**
 * Pad or truncate a label to an exact terminal display width.
 * Unlike String.padEnd/substring, this is safe for wide characters
 * (CJK, emoji) and never splits surrogate pairs.
 *
 * @param {string} label - Label to pad/truncate
 * @param {number} maxWidth - Target display width (<= 0 yields '')
 * @returns {string} Label occupying exactly maxWidth columns (or '')
 */
export function padLabelToWidth(label, maxWidth) {
  if (maxWidth <= 0) return '';

  const width = getTerminalWidth(label);
  if (width > maxWidth) {
    return truncateWithAnsi(label, maxWidth);
  }
  return label + getSpaces(maxWidth - width);
}

/**
 * Largest display width across a list of items, computed with a plain loop
 * (avoids temp arrays and Math.max spread on hot render paths).
 *
 * @param {Array} items - Items to measure
 * @param {Function} getLabel - Returns the label for an item
 * @param {number} [minimum=0] - Lower bound for the result
 * @returns {number} Maximum display width (at least `minimum`)
 */
export function maxDisplayWidthOf(items, getLabel, minimum = 0) {
  let max = minimum;
  for (let i = 0; i < items.length; i++) {
    const width = getTerminalWidth(getLabel(items[i]));
    if (width > max) max = width;
  }
  return max;
}

/**
 * Count the number of lines in a rendered string output.
 *
 * @param {string} str - Rendered output
 * @returns {number} Line count (0 for empty input)
 */
export function countLines(str) {
  if (!str) return 0;
  let count = 1;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 10) count++;
  }
  return count;
}

/**
 * Resolve the hint text to display from a `hint` prop.
 *
 * @param {string|boolean} hint - Hint prop: 'default' | false | custom string
 * @param {string} defaultText - Text shown when hint === 'default'
 * @returns {string} Hint text, or '' when no hint should be shown
 */
export function resolveHintText(hint, defaultText) {
  if (hint === false || hint === null || hint === undefined) return '';
  if (hint === 'default') return defaultText;
  return hint !== '' ? hint : '';
}

/**
 * Render the bordered "No options" / "No data" placeholder box.
 *
 * @param {Function} borderStyle - Chalk chain used to style the border
 * @param {string} [message='No options'] - Message shown inside the box
 * @param {number} [width=20] - Inner width of the box
 * @returns {string} Rendered box (3 lines, newline-terminated)
 */
export function renderNoDataBox(borderStyle, message = 'No options', width = 20) {
  return borderStyle('┌' + '─'.repeat(width + 2) + '┐') + '\n' +
    borderStyle('│') + ` ${message}`.padEnd(width + 2, ' ') + borderStyle('│') + '\n' +
    borderStyle('└' + '─'.repeat(width + 2) + '┘') + '\n';
}

/**
 * Format the "[X% - showing A-B of N]" scroll indicator.
 *
 * @param {number} scrollOffset - Current scroll offset
 * @param {number} visibleCount - Number of visible rows (viewport height)
 * @param {number} total - Total number of items
 * @param {string} [unit=''] - Optional unit label appended after the total (e.g. 'rows')
 * @returns {string} Formatted indicator text
 */
export function formatScrollIndicator(scrollOffset, visibleCount, total, unit = '') {
  const scrollPercent = Math.round((scrollOffset / Math.max(1, total - visibleCount)) * 100);
  const start = scrollOffset + 1;
  const end = Math.min(scrollOffset + visibleCount, total);
  const unitSuffix = unit ? ` ${unit}` : '';
  return `[${scrollPercent}% - showing ${start}-${end} of ${total}${unitSuffix}]`;
}
