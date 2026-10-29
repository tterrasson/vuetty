// src/components/Divider.js
import { h } from 'vue';
import { applyStyles } from '@utils/renderUtils.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

/**
 * Divider component - Horizontal line
 */
export default {
  name: 'Divider',
  props: {
    char: {
      type: String,
      default: '─'
    },
    length: {
      type: Number,
      default: 40
    },
    color: String,
    // Include common layout props (padding, margin, dimensions)
    ...boxProps
  },
  setup(props) {
    return () => h('divider', props);
  }
};

/**
 * Render a divider
 */
export function renderDivider(props) {
  const { char = '─', length = 40 } = props;
  // Clamp negative lengths to 0 to avoid RangeError from repeat()
  const safeLength = Math.max(0, length);
  return applyStyles(char.repeat(safeLength) + '\n', props);
}

/**
 * Render handler for divider
 */
class DividerRenderHandler extends RenderHandler {
  render(ctx) {
    return renderDivider(ctx.props);
  }
}

renderHandlerRegistry.register('divider', new DividerRenderHandler());
