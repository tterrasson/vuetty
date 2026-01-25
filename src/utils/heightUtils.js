/**
 * Height adjustment utilities for vertical flex layout
 * Used to constrain rendered output to match Yoga-computed heights
 */

import figlet from 'figlet';
import { getTerminalWidth } from './renderUtils.js';

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

/**
 * Calculate how many lines text will occupy when wrapped to a given width
 * @param {string} text - The text to measure
 * @param {number} maxWidth - Maximum width available
 * @returns {number} Number of lines the text will occupy
 */
export function calculateTextHeight(text, maxWidth) {
  if (!text) return 0;
  if (maxWidth <= 0) return 1;

  const hasNewlines = text.indexOf('\n') !== -1;
  if (!hasNewlines) {
    const textWidth = getTerminalWidth(text);
    if (textWidth <= maxWidth) return 1;
    return Math.ceil(textWidth / maxWidth);
  }

  const paragraphs = text.split('\n');
  let totalLines = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    if (paragraph.length === 0) {
      totalLines += 1;
      continue;
    }

    const textWidth = getTerminalWidth(paragraph);
    if (textWidth <= maxWidth) {
      totalLines += 1;
    } else {
      totalLines += Math.ceil(textWidth / maxWidth);
    }
  }

  return Math.max(1, totalLines);
}

// Cache to store calculated heights (font + text -> height)
const heightCache = new Map();
const CACHE_SIZE = 20;

/**
 * Calculate BigText height by measuring actual figlet output
 * This ensures accurate height calculation that matches the rendered output
 * @param {string} text - The text to render
 * @param {string} font - The figlet font to use (default: 'Standard')
 * @returns {number} Height in lines
 */
export function calculateBigTextHeight(text, font = 'Standard') {
  if (!text) return 0;

  // Create cache key
  const cacheKey = `${font}:${text}`;

  // Check cache first
  if (heightCache.has(cacheKey)) {
    return heightCache.get(cacheKey);
  }

  let height;
  try {
    // Render text with figlet
    const output = figlet.textSync(text, {
      font: font,
      horizontalLayout: 'default'
    });

    // Count lines in output
    const lines = output.split('\n');
    // Filter out empty trailing lines
    height = lines.length;
    while (height > 0 && lines[height - 1].trim() === '') {
      height--;
    }

    // Ensure minimum height of 1
    height = Math.max(1, height);
  } catch (error) {
    // If font not found or other error, fallback to default font
    try {
      const output = figlet.textSync(text, {
        font: 'Standard',
        horizontalLayout: 'default'
      });
      const lines = output.split('\n');
      height = lines.length;
      while (height > 0 && lines[height - 1].trim() === '') {
        height--;
      }
      height = Math.max(1, height);
    } catch (fallbackError) {
      // Last resort: estimate based on text length
      height = 6;
    }
  }

  // Cache result (with size limit)
  if (heightCache.size >= CACHE_SIZE) {
    // Remove oldest entry (first key)
    const firstKey = heightCache.keys().next().value;
    heightCache.delete(firstKey);
  }
  heightCache.set(cacheKey, height);

  return height;
}
