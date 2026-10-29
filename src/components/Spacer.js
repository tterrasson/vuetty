// src/components/Spacer.js
import { h } from 'vue';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

/**
 * Spacer component - Adds horizontal space
 */
export default {
  name: 'Spacer',
  props: {
    count: {
      type: Number,
      default: 1
    }
  },
  setup(props) {
    return () => h('spacer', props);
  }
};

/**
 * Render a spacer
 */
export function renderSpacer(props) {
  // Treat counts < 1 like 0/undefined: a single space (clamps negatives safely)
  const count = (props && props.count) || 1;
  return ' '.repeat(Math.max(1, count));
}

/**
 * Render handler for spacer
 */
class SpacerRenderHandler extends RenderHandler {
  render(ctx) {
    return renderSpacer(ctx.props);
  }
}

renderHandlerRegistry.register('spacer', new SpacerRenderHandler());
