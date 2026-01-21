// src/utils/colorUtils.js
import chalk from 'chalk';

// Pre-compiled regex for performance
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const RGB_COLOR_REGEX = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;

/**
 * Centralized RGB values for named colors
 * IMPORTANT: These use explicit RGB values to avoid palette conflicts.
 * Terminals can remap palette colors when OSC 11 sets the default background.
 */
const NAMED_COLOR_RGB = {
  black: [0, 0, 0],
  red: [205, 49, 49],
  green: [13, 188, 121],
  yellow: [229, 229, 16],
  blue: [36, 114, 200],
  magenta: [188, 63, 188],
  cyan: [17, 168, 205],
  white: [229, 229, 229],
  gray: [102, 102, 102],
  grey: [102, 102, 102],
  brightRed: [241, 76, 76],
  brightGreen: [35, 209, 139],
  brightYellow: [245, 245, 67],
  brightBlue: [59, 142, 234],
  brightMagenta: [214, 112, 214],
  brightCyan: [41, 184, 219],
  brightWhite: [255, 255, 255]
};

// Cached chalk colors for performance
const chalkColorCache = new Map();
const MAX_COLOR_CACHE = 50;

/**
 * Get chalk chain for foreground color with caching (supports named, hex, RGB)
 * Returns chalk.white as fallback if color is invalid
 * @param {string} color - Color name, hex (#DEADED), or rgb (rgb(15,100,204))
 * @returns {object} Chalk style function (never null)
 */
export function getChalkColor(color) {
  if (!color) return chalk.white;

  const normalized = normalizeColorForCache(color);
  let style = chalkColorCache.get(normalized);
  if (style) return style;

  style = getChalkColorChain(color) || chalk.white;

  if (chalkColorCache.size >= MAX_COLOR_CACHE) {
    const firstKey = chalkColorCache.keys().next().value;
    chalkColorCache.delete(firstKey);
  }
  chalkColorCache.set(normalized, style);
  return style;
}

/**
 * Get chalk chain for foreground color (supports named, hex, RGB)
 * @param {string} color - Color name, hex (#DEADED), or rgb (rgb(15,100,204))
 * @param {object} chalkChain - Existing chalk chain to extend
 * @returns {object|null} Extended chalk chain or null if invalid
 */
export function getChalkColorChain(color, chalkChain = chalk) {
  if (!color) return null;

  // Named color (fast path)
  if (chalkChain[color]) {
    return chalkChain[color];
  }

  // Hex color: #DEADED or #FFF
  if (HEX_COLOR_REGEX.test(color)) {
    return chalkChain.hex(color);
  }

  // RGB color: rgb(15, 100, 204)
  const rgbMatch = color.match(RGB_COLOR_REGEX);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    const rNum = parseInt(r), gNum = parseInt(g), bNum = parseInt(b);

    // Validate range 0-255
    if (rNum >= 0 && rNum <= 255 && gNum >= 0 && gNum <= 255 && bNum >= 0 && bNum <= 255) {
      return chalkChain.rgb(rNum, gNum, bNum);
    }
  }

  return null;
}

/**
 * Get chalk chain for background color (supports named, hex, RGB)
 * @param {string} bg - Background color in any supported format
 * @param {object} chalkChain - Existing chalk chain to extend
 * @returns {object|null} Extended chalk chain or null if invalid
 */
export function getChalkBgChain(bg, chalkChain = chalk) {
  if (!bg) return null;

  // Named color: bgRed, bgBlue
  const bgKey = `bg${bg.charAt(0).toUpperCase()}${bg.slice(1)}`;
  if (chalkChain[bgKey]) {
    return chalkChain[bgKey];
  }

  // Hex color: #a61fcf
  if (HEX_COLOR_REGEX.test(bg)) {
    return chalkChain.bgHex(bg);
  }

  // RGB color: rgb(15, 100, 204)
  const rgbMatch = bg.match(RGB_COLOR_REGEX);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    const rNum = parseInt(r), gNum = parseInt(g), bNum = parseInt(b);

    if (rNum >= 0 && rNum <= 255 && gNum >= 0 && gNum <= 255 && bNum >= 0 && bNum <= 255) {
      return chalkChain.bgRgb(rNum, gNum, bNum);
    }
  }

  return null;
}

/**
 * Normalize color string for cache keys
 * Ensures equivalent colors produce same cache key
 * @param {string} color - Color string to normalize
 * @returns {string} Normalized color string
 */
export function normalizeColorForCache(color) {
  if (!color || typeof color !== 'string') return '';

  // Hex: convert to lowercase
  if (color.startsWith('#')) {
    return color.toLowerCase();
  }

  // RGB: remove spaces
  if (color.startsWith('rgb(')) {
    return color.replace(/\s+/g, '');
  }

  // Named: return as-is
  return color;
}

/**
 * Get raw ANSI foreground color code for a color
 * Returns the ANSI escape sequence without reset
 * Used for inline coloring without disrupting background
 *
 * @param {string} color - Color name, hex, or RGB
 * @returns {string|null} ANSI escape sequence or null
 */
export function getAnsiFgCode(color) {
  if (!color) return null;

  // Named colors mapping to ANSI codes
  const namedColors = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    grey: '\x1b[90m',
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    brightWhite: '\x1b[97m'
  };

  // Check named colors first
  if (namedColors[color]) {
    return namedColors[color];
  }

  // Handle hex colors (#RGB or #RRGGBB)
  if (color.startsWith('#')) {
    let hex = color.slice(1);

    // Expand short hex (#RGB -> #RRGGBB)
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return `\x1b[38;2;${r};${g};${b}m`;
      }
    }
  }

  // Handle rgb(r, g, b) format
  const rgbMatch = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return `\x1b[38;2;${r};${g};${b}m`;
  }

  return null;
}

/**
 * Get raw ANSI background color code for a color
 * Returns the ANSI escape sequence without reset
 *
 * IMPORTANT: Uses RGB true color (24-bit) for named colors to avoid palette conflicts.
 * Named colors use explicit RGB values instead of palette codes because terminals can
 * remap palette colors when OSC 11 is used to set the default background color.
 *
 * @param {string} color - Color name, hex, or RGB
 * @returns {string|null} ANSI escape sequence or null
 */
export function getAnsiBgCode(color) {
  if (!color) return null;

  // Use RGB true color for named colors (from centralized mapping)
  if (NAMED_COLOR_RGB[color]) {
    const [r, g, b] = NAMED_COLOR_RGB[color];
    return `\x1b[48;2;${r};${g};${b}m`;
  }

  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return `\x1b[48;2;${r};${g};${b}m`;
      }
    }
  }

  const rgbMatch = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return `\x1b[48;2;${r};${g};${b}m`;
  }

  return null;
}

/**
 * Convert color to ANSI background code (RGB true color)
 * @param {string} color - hex color like #1a1a2e
 * @returns {string|null} ANSI escape code
 */
export function colorToAnsiBg(color) {
  // Reuse getAnsiBgCode for consistency
  return getAnsiBgCode(color);
}

/**
 * Convert color to OSC 11 format (rgb:rrrr/gggg/bbbb)
 * OSC 11 uses 16-bit color components (0000-ffff)
 * This ensures the terminal background matches the theme background exactly
 *
 * @param {string} color - Color name, hex (#RRGGBB), or rgb(r,g,b)
 * @returns {string|null} OSC 11 formatted string or null
 */
export function colorToOSC11(color) {
  if (!color) return null;

  let r, g, b;

  // Named colors (use centralized mapping)
  if (NAMED_COLOR_RGB[color]) {
    [r, g, b] = NAMED_COLOR_RGB[color];
  }
  // Hex color (#RGB or #RRGGBB)
  else if (HEX_COLOR_REGEX.test(color)) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
  }
  // RGB format: rgb(r, g, b)
  else {
    const rgbMatch = color.match(RGB_COLOR_REGEX);
    if (rgbMatch) {
      r = parseInt(rgbMatch[1], 10);
      g = parseInt(rgbMatch[2], 10);
      b = parseInt(rgbMatch[3], 10);
    }
  }

  if (r === undefined || g === undefined || b === undefined) {
    return null;
  }

  // Validate RGB range
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return null;
  }

  // Convert 8-bit (0-255) to 16-bit (0000-ffff) by duplicating the hex byte
  // For OSC 11 format: 0xRR becomes 0xRRRR (e.g., 0xFF -> 0xFFFF, 0x1A -> 0x1A1A)
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');

  const r16 = rHex + rHex;
  const g16 = gHex + gHex;
  const b16 = bHex + bHex;

  return `rgb:${r16}/${g16}/${b16}`;
}