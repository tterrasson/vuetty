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
