/**
 * Height adjustment utilities for vertical flex layout
 * Used to constrain rendered output to match Yoga-computed heights
 */

/**
 * Adjusts output to match target height by padding or truncating
 * @param {string} output - The rendered output string
 * @param {number} targetHeight - Target height in lines
 * @returns {string} Output adjusted to target height
 */
export function adjustToHeight(output, targetHeight) {
  if (!output || targetHeight <= 0) return '';

  const lines = output.split('\n');
  const currentHeight = lines.length;

  if (currentHeight === targetHeight) return output;

  if (currentHeight < targetHeight) {
    // Pad with empty lines at the bottom
    const padding = targetHeight - currentHeight;
    for (let i = 0; i < padding; i++) {
      lines.push('');
    }
    return lines.join('\n');
  }

  // Truncate - keep first targetHeight lines (preserve top content)
  return lines.slice(0, targetHeight).join('\n');
}
