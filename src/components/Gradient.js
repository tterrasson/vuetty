// src/components/Gradient.js
import { h } from 'vue';
import gradient from 'gradient-string';
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

  const options = { interpolation };

  if (colors && Array.isArray(colors) && colors.length > 0) {
    instance = gradient(colors, options);
  } else if (name && gradient[name]) {
    instance = gradient[name];
  } else if (name && CUSTOM_GRADIENTS[name]) {
    instance = gradient(CUSTOM_GRADIENTS[name], options);
  } else {
    instance = gradient.rainbow;
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