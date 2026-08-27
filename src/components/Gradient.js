// src/components/Gradient.js
import { h } from 'vue';
import chalk from 'chalk';
import tinygradient from 'tinygradient';
import { boxProps } from '@core/layoutProps.js';
import { stripAnsi } from '@utils/renderUtils.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';
import { renderChildrenCached } from '@core/memoization.js';

/**
 * Custom gradient definitions
 */
const CUSTOM_GRADIENTS = {
  fire: ['#8B0000', '#FF4500', '#FFD700'],
  ocean: ['#001F3F', '#0074D9', '#7FDBFF'],
  sunset: ['#4A148C', '#FF6F00', '#FFD54F'],
  forest: ['#1B5E20', '#66BB6A', '#C5E1A5'],
  night: ['#1A237E', '#5E35B1', '#EC407A']
};

const PRESET_GRADIENTS = {
  atlas: { colors: ['#feac5e', '#c779d0', '#4bc0c8'] },
  cristal: { colors: ['#bdfff3', '#4ac29a'] },
  teen: { colors: ['#77a1d3', '#79cbca', '#e684ae'] },
  mind: { colors: ['#473b7b', '#3584a7', '#30d2be'] },
  morning: { colors: ['#ff5f6d', '#ffc371'], interpolation: 'hsv' },
  vice: { colors: ['#5ee7df', '#b490ca'], interpolation: 'hsv' },
  fruit: { colors: ['#ff4e50', '#f9d423'] },
  retro: {
    colors: [
      '#3f51b1', '#5a55ae', '#7b5fac', '#8f6aae', '#a86aa4',
      '#cc6b8e', '#f18271', '#f3a469', '#f7c978'
    ]
  },
  summer: { colors: ['#fdbb2d', '#22c1c3'] },
  rainbow: {
    colors: ['#ff0000', '#ff0100'],
    interpolation: 'hsv',
    hsvSpin: 'long'
  },
  pastel: {
    colors: ['#74ebd5', '#74ecd5'],
    interpolation: 'hsv',
    hsvSpin: 'long'
  }
};

/**
 * Available gradient presets
 */
export const GRADIENT_PRESETS = [
  'rainbow', 'pastel', 'cristal', 'teen', 'mind',
  'morning', 'vice', 'fruit', 'retro', 'summer',
  'fire', 'ocean', 'sunset', 'forest', 'night'
];

// Cache gradient instances (they're expensive to create)
const gradientCache = new Map();

function createGradient(colors, options = {}) {
  const colorGradient = tinygradient(colors);
  const interpolation = options.interpolation?.toLowerCase() || 'rgb';
  const hsvSpin = options.hsvSpin?.toLowerCase() || false;

  const getColors = (count) => interpolation === 'hsv'
    ? colorGradient.hsv(count, hsvSpin)
    : colorGradient.rgb(count);

  const apply = (text) => {
    const count = Math.max(text.replace(/\s/g, '').length, colorGradient.stops.length);
    const generatedColors = getColors(count);

    return [...text].map((character) => character.match(/\s/)
      ? character
      : chalk.hex(generatedColors.shift()?.toHex() || '#000')(character)
    ).join('');
  };

  apply.multiline = (text) => {
    const lines = text.split('\n');
    const count = Math.max(...lines.map(line => line.length), colorGradient.stops.length);
    const generatedColors = getColors(count);

    return lines.map(line => {
      const lineColors = [...generatedColors];
      return [...line].map(character =>
        chalk.hex(lineColors.shift()?.toHex() || '#000')(character)
      ).join('');
    }).join('\n');
  };

  return apply;
}

/**
 * Get or create a gradient instance
 */
function getGradientInstance(name, colors, interpolation) {
  // Build cache key
  const key = colors
    ? `custom:${colors.join(',')}:${interpolation}`
    : `preset:${name}:${interpolation}`;

  let instance = gradientCache.get(key);
  if (instance) return instance;

  if (colors && Array.isArray(colors) && colors.length > 0) {
    instance = createGradient(colors, { interpolation });
  } else if (name && PRESET_GRADIENTS[name]) {
    const preset = PRESET_GRADIENTS[name];
    instance = createGradient(preset.colors, preset);
  } else if (name && CUSTOM_GRADIENTS[name]) {
    instance = createGradient(CUSTOM_GRADIENTS[name], { interpolation });
  } else {
    const preset = PRESET_GRADIENTS.rainbow;
    instance = createGradient(preset.colors, preset);
  }

  // Limit cache size
  if (gradientCache.size > 50) {
    const firstKey = gradientCache.keys().next().value;
    gradientCache.delete(firstKey);
  }

  gradientCache.set(key, instance);
  return instance;
}

/**
 * Gradient Component
 */
export default {
  name: 'Gradient',
  props: {
    name: { type: String, default: null },
    colors: { type: Array, default: null },
    interpolation: {
      type: String,
      default: 'hsv',
      validator: val => ['rgb', 'hsv'].includes(val)
    },
    // Include common layout props (padding, margin, dimensions)
    ...boxProps
  },
  setup(props, { slots }) {
    return () => {
      const children = slots.default ? slots.default() : [];
      return h('gradient', props, children);
    };
  }
};

/**
 * Render content with gradient colors
 */
export function renderGradient(content, props) {
  if (!content) return '';

  const { name = null, colors = null, interpolation = 'hsv' } = props || {};

  // Strip existing ANSI codes before applying gradient
  const cleanContent = stripAnsi(content);
  const gradientInstance = getGradientInstance(name, colors, interpolation);

  // multiline() handles both single and multi-line efficiently
  return cleanContent.includes('\n')
    ? gradientInstance.multiline(cleanContent)
    : gradientInstance(cleanContent);
}

/**
 * Render handler for gradient
 */
class GradientRenderHandler extends RenderHandler {
  render(ctx) {
    const { node } = ctx;
    const childrenOutput = ctx.text || renderChildrenCached(node, (child) =>
      ctx.renderChild(child)
    );
    return renderGradient(childrenOutput, ctx.props);
  }
}

renderHandlerRegistry.register('gradient', new GradientRenderHandler());
