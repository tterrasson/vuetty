// src/core/theme.js

/**
 * Default theme configuration
 * Deep-blue colorscheme with deep-purple accents and desaturated orange highlights
 */
export const DEFAULT_THEME = {
  // Global colors
  background: '#0a0a0f',        // Deep black with subtle violet tint
  foreground: '#e6e8f0',        // Soft blue-gray text

  // Semantic color palette
  primary: '#3d5eff',           // Deep blue
  secondary: '#969ebd',         // Blue-gray
  success: '#4ecca3',           // Teal-green
  warning: '#c97945',           // Desaturated orange
  danger: '#d64d64',            // Deep red-pink
  info: '#5eb3d6',              // Sky blue

  // Component-specific defaults
  components: {
    box: {
      color: '#4a4f6a',         // Deep blue-gray border
      bg: null                    // No background - use terminal's OSC 11 background
    },
    textBox: {
      color: '#e6e8f0',
      bg: null                    // No background - use terminal's OSC 11 background
    },
    textInput: {
      color: '#e6e8f0',
      borderColor: '#3d5eff',
      bg: null,
      focusColor: '#7d5fff',     // Deep purple
      errorColor: '#d64d64'      // Deep red-pink
    },
    button: {
      variants: {
        primary: { bg: '#3d5eff', color: '#ffffff', bold: true },      // Deep blue
        secondary: { bg: '#5a617a', color: '#e6e8f0', bold: false },   // Blue-gray
        danger: { bg: '#d64d64', color: '#ffffff', bold: true },       // Deep red-pink
        warning: { bg: '#c97945', color: '#ffffff', bold: true },      // Desaturated orange
        info: { bg: '#5eb3d6', color: '#0a0a0f', bold: false },        // Sky blue
        success: { bg: '#4ecca3', color: '#0a0a0f', bold: true }       // Teal-green
      }
    },
    checkbox: {
      color: '#5a617a',
      checkedColor: '#7d5fff',   // Deep purple
      uncheckedColor: '#4a4f6a'
    },
    radiobox: {
      color: '#5a617a',
      selectedColor: '#7d5fff',  // Deep purple
      unselectedColor: '#4a4f6a'
    }
  }
};

/**
 * Deep merge utility for objects
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined && source[key] !== null) {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * Create a theme by merging user configuration with defaults
 *
 * @param {Object} userTheme - User theme configuration
 * @returns {Object} Merged theme object
 *
 * @example
 * const theme = createTheme({
 *   background: 'black',
 *   foreground: 'white',
 *   primary: 'cyan',
 *   components: {
 *     box: { color: 'cyan' }
 *   }
 * });
 */
export function createTheme(userTheme = {}) {
  if (!userTheme || typeof userTheme !== 'object') {
    return { ...DEFAULT_THEME };
  }

  return deepMerge(DEFAULT_THEME, userTheme);
}

/**
 * Resolve a color from the theme by path
 * Supports dot notation for nested properties
 *
 * @param {Object} theme - Theme object
 * @param {string} path - Dot-separated path to color (e.g., 'primary', 'components.button.bg')
 * @returns {string|null} Resolved color or null
 *
 * @example
 * resolveThemeColor(theme, 'primary') // 'blue'
 * resolveThemeColor(theme, 'components.button.bg') // 'blue'
 */
export function resolveThemeColor(theme, path) {
  if (!theme || !path) return null;

  const parts = path.split('.');
  let current = theme;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  return typeof current === 'string' ? current : null;
}
