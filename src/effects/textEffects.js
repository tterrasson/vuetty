// src/effects/textEffects.js
import chalk from 'chalk';
import { effectRegistry } from './effectRegistry.js';
import { stripAnsi } from '@utils/renderUtils.js';
import {
  parseColor,
  adjustBrightness,
  RAINBOW_PALETTE
} from '@utils/colorUtils.js';

// Cache for effect results
const effectCache = new Map();
const MAX_CACHE = 100;

// Cache for parsed colors (keyed by color string)
const parsedColorCache = new Map();
const MAX_PARSED_COLOR_CACHE = 50;

// Cache for parsed color arrays (keyed by joined colors string)
const parsedColorsArrayCache = new Map();
const MAX_PARSED_COLORS_ARRAY_CACHE = 20;

/**
 * Get cached parsed color or parse and cache it
 * @param {string} color - Color string
 * @returns {{ r: number, g: number, b: number } | null}
 */
function getCachedParsedColor(color) {
  if (!color) return null;

  let parsed = parsedColorCache.get(color);
  if (parsed !== undefined) return parsed;

  parsed = parseColor(color);

  // LRU eviction
  if (parsedColorCache.size >= MAX_PARSED_COLOR_CACHE) {
    const firstKey = parsedColorCache.keys().next().value;
    parsedColorCache.delete(firstKey);
  }

  parsedColorCache.set(color, parsed);
  return parsed;
}

/**
 * Get cached parsed colors array or parse and cache it
 * @param {string[]} colors - Array of color strings
 * @returns {Array<{ r: number, g: number, b: number }>}
 */
function getCachedParsedColorsArray(colors) {
  if (!colors || colors.length === 0) return [];

  const cacheKey = colors.join('|');
  let parsed = parsedColorsArrayCache.get(cacheKey);
  if (parsed !== undefined) return parsed;

  parsed = colors.map(c => getCachedParsedColor(c) || { r: 255, g: 255, b: 255 });

  // LRU eviction
  if (parsedColorsArrayCache.size >= MAX_PARSED_COLORS_ARRAY_CACHE) {
    const firstKey = parsedColorsArrayCache.keys().next().value;
    parsedColorsArrayCache.delete(firstKey);
  }

  parsedColorsArrayCache.set(cacheKey, parsed);
  return parsed;
}

/**
 * Generate stable props key for caching
 * Uses value-based key building instead of JSON.stringify
 * @param {object} props - Effect props
 * @returns {string}
 */
function getPropsKey(props) {
  if (!props || typeof props !== 'object') return '';

  // Build key from known effect prop keys only (avoid full JSON.stringify)
  const parts = [];
  if (props.speed !== undefined) parts.push(`s:${props.speed}`);
  if (props.color !== undefined) parts.push(`c:${props.color}`);
  if (props.colors !== undefined) parts.push(`cs:${props.colors.join(',')}`);
  if (props.minBrightness !== undefined) parts.push(`minB:${props.minBrightness}`);
  if (props.maxBrightness !== undefined) parts.push(`maxB:${props.maxBrightness}`);
  if (props.wavelength !== undefined) parts.push(`wl:${props.wavelength}`);
  if (props.baseColor !== undefined) parts.push(`bc:${props.baseColor}`);
  if (props.highlightColor !== undefined) parts.push(`hc:${props.highlightColor}`);
  if (props.width !== undefined) parts.push(`w:${props.width}`);

  return parts.join('|');
}

/**
 * Generate cache key for effect results
 */
function getCacheKey(text, effectName, props, frame) {
  const propsKey = getPropsKey(props);
  return `${effectName}:${frame}:${propsKey}:${text}`;
}

/**
 * Get from cache or compute and store
 */
function cachedCompute(cacheKey, computeFn) {
  const cached = effectCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const result = computeFn();

  // LRU eviction
  if (effectCache.size >= MAX_CACHE) {
    const firstKey = effectCache.keys().next().value;
    effectCache.delete(firstKey);
  }

  effectCache.set(cacheKey, result);
  return result;
}

/**
 * Process text line by line with an effect function
 * Optimized to avoid unnecessary allocations
 * @param {string} text - Text to process
 * @param {function} lineProcessor - Function that processes each line's characters
 * @returns {string}
 */
function processLines(text, lineProcessor) {
  if (!text) return text;

  const lines = text.split('\n');
  const length = lines.length;

  // Fast path for single line
  if (length === 1) {
    return lineProcessor(lines[0]);
  }

  // Process multiple lines
  const processed = new Array(length);
  for (let i = 0; i < length; i++) {
    const line = lines[i];
    processed[i] = line ? lineProcessor(line) : line;
  }
  return processed.join('\n');
}

/**
 * Interpolate between two RGB colors directly (no hex conversion)
 * @param {{ r: number, g: number, b: number }} color1
 * @param {{ r: number, g: number, b: number }} color2
 * @param {number} ratio - 0.0 to 1.0
 * @returns {{ r: number, g: number, b: number }}
 */
function lerpRgb(color1, color2, ratio) {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * ratio),
    g: Math.round(color1.g + (color2.g - color1.g) * ratio),
    b: Math.round(color1.b + (color2.b - color1.b) * ratio)
  };
}

/**
 * Fast interpolation for pre-parsed color arrays
 * @param {Array<{ r: number, g: number, b: number }>} parsedColors
 * @param {number} ratio - 0.0 to 1.0
 * @returns {{ r: number, g: number, b: number }}
 */
function interpolateParsedColors(parsedColors, ratio) {
  if (parsedColors.length === 0) return { r: 255, g: 255, b: 255 };
  if (parsedColors.length === 1) return parsedColors[0];

  // Clamp ratio
  ratio = Math.max(0, Math.min(1, ratio));

  // Map ratio to color segment
  const segmentCount = parsedColors.length - 1;
  const segmentRatio = ratio * segmentCount;
  const segmentIndex = Math.min(Math.floor(segmentRatio), segmentCount - 1);
  const localRatio = segmentRatio - segmentIndex;

  return lerpRgb(parsedColors[segmentIndex], parsedColors[segmentIndex + 1], localRatio);
}

// ==========================================
// Effect 1: Rainbow (Animated)
// ==========================================
function rainbowEffect(text, props = {}, frame = 0) {
  const cleanText = stripAnsi(text);
  if (!cleanText) return cleanText;

  const { speed = 1 } = props;
  const cacheKey = getCacheKey(cleanText, 'rainbow', props, frame);

  return cachedCompute(cacheKey, () => {
    const offset = frame * speed * 0.05;

    return processLines(cleanText, line => {
      const length = line.length;
      if (length === 0) return line;

      // Use array + join instead of string concatenation
      const chars = new Array(length);
      for (let i = 0; i < length; i++) {
        const char = line[i];
        if (char === ' ' || char === '\t') {
          chars[i] = char;
          continue;
        }

        // Use pre-computed rainbow palette (360 colors)
        const hue = ((i / length) + offset) % 1;
        const paletteIndex = Math.floor(hue * 360) % 360;
        const color = RAINBOW_PALETTE[paletteIndex];
        chars[i] = chalk.rgb(color.r, color.g, color.b)(char);
      }
      return chars.join('');
    });
  });
}

effectRegistry.register('rainbow', rainbowEffect, {
  animated: true,
  defaultInterval: 100
});

// ==========================================
// Effect 2: Pulse (Animated Brightness)
// ==========================================
function pulseEffect(text, props = {}, frame = 0) {
  const cleanText = stripAnsi(text);
  if (!cleanText) return cleanText;

  const {
    color = 'white',
    minBrightness = 0.4,
    maxBrightness = 1.0
  } = props;

  const cacheKey = getCacheKey(cleanText, 'pulse', props, frame);

  return cachedCompute(cacheKey, () => {
    // Sine wave for smooth pulsing (period ~42 frames)
    const sineValue = (Math.sin(frame * 0.15) + 1) / 2;
    const brightness = minBrightness + sineValue * (maxBrightness - minBrightness);

    // Use cached parsed color instead of parsing every frame
    const baseColor = getCachedParsedColor(color) || { r: 255, g: 255, b: 255 };
    const adjusted = adjustBrightness(baseColor, brightness);

    return chalk.rgb(adjusted.r, adjusted.g, adjusted.b)(cleanText);
  });
}

effectRegistry.register('pulse', pulseEffect, {
  animated: true,
  defaultInterval: 50
});

// ==========================================
// Effect 3: Wave (Animated Color Wave)
// ==========================================
function waveEffect(text, props = {}, frame = 0) {
  const cleanText = stripAnsi(text);
  if (!cleanText) return cleanText;

  const {
    colors = ['#00FFFF', '#FF00FF'],
    wavelength = 10,
    speed = 1
  } = props;

  const cacheKey = getCacheKey(cleanText, 'wave', props, frame);

  return cachedCompute(cacheKey, () => {
    const offset = frame * speed * 0.1;
    const PI2 = Math.PI * 2;

    // Pre-parse colors array once (cached)
    const parsedColors = getCachedParsedColorsArray(colors);

    return processLines(cleanText, line => {
      const length = line.length;
      if (length === 0) return line;

      // Use array + join instead of string concatenation
      const chars = new Array(length);
      for (let i = 0; i < length; i++) {
        const char = line[i];
        if (char === ' ' || char === '\t') {
          chars[i] = char;
          continue;
        }

        // Sine wave determines color ratio
        const phase = ((i / wavelength) + offset) * PI2;
        const ratio = (Math.sin(phase) + 1) / 2;

        // Use fast interpolation with pre-parsed colors (returns RGB directly)
        const color = interpolateParsedColors(parsedColors, ratio);
        chars[i] = chalk.rgb(color.r, color.g, color.b)(char);
      }
      return chars.join('');
    });
  });
}

effectRegistry.register('wave', waveEffect, {
  animated: true,
  defaultInterval: 80
});

// ==========================================
// Effect 4: Shimmer (Animated Highlight)
// ==========================================
function shimmerEffect(text, props = {}, frame = 0) {
  const cleanText = stripAnsi(text);
  if (!cleanText) return cleanText;

  const {
    baseColor = '#666666',
    highlightColor = '#FFFFFF',
    width = 3,
    speed = 1
  } = props;

  const cacheKey = getCacheKey(cleanText, 'shimmer', props, frame);

  return cachedCompute(cacheKey, () => {
    // Pre-parse colors once (cached)
    const baseParsed = getCachedParsedColor(baseColor) || { r: 102, g: 102, b: 102 };
    const highlightParsed = getCachedParsedColor(highlightColor) || { r: 255, g: 255, b: 255 };

    return processLines(cleanText, line => {
      const length = line.length;
      if (length === 0) return line;

      const position = (frame * speed * 0.5) % (length + width);

      // Use array + join instead of string concatenation
      const chars = new Array(length);
      for (let i = 0; i < length; i++) {
        const char = line[i];
        if (char === ' ' || char === '\t') {
          chars[i] = char;
          continue;
        }

        // Distance from shimmer center
        const dist = Math.abs(i - position);
        const ratio = dist < width ? 1 - (dist / width) : 0;

        // Use fast RGB interpolation (no hex conversion)
        const color = lerpRgb(baseParsed, highlightParsed, ratio);
        chars[i] = chalk.rgb(color.r, color.g, color.b)(char);
      }
      return chars.join('');
    });
  });
}

effectRegistry.register('shimmer', shimmerEffect, {
  animated: true,
  defaultInterval: 60
});

// Export for testing
export {
  rainbowEffect,
  pulseEffect,
  waveEffect,
  shimmerEffect,
  effectCache,
  parsedColorCache,
  parsedColorsArrayCache
};
