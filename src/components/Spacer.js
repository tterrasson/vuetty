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
  return ' '.repeat((props && props.count) || 1);
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
