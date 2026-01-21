// src/components/Newline.js
import { h } from 'vue';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

/**
 * Newline component - Adds vertical space (empty lines)
 *
 * When used inside a block container (like Box), each Newline represents
 * one empty line. The count prop specifies how many empty lines to insert.
 *
 * Render behavior (parent containers join children with '' empty string):
 * - count=1: returns '\n' → 1 empty line
 * - count=2: returns '\n\n' → 2 empty lines
 * - count=N: returns '\n'.repeat(N) → N empty lines
 */
export default {
  name: 'Newline',
  props: {
    count: {
      type: Number,
      default: 1
    }
  },
  setup(props) {
    return () => h('newline', props);
  }
};

/**
 * Render a newline
 *
 * Returns count newlines because parent containers join children with '' (empty string).
 *
 * Examples:
 * - count=1: '\n' → 1 empty line
 * - count=2: '\n\n' → 2 empty lines
 * - count=3: '\n\n\n' → 3 empty lines
 */
export function renderNewline(props) {
  const count = (props && props.count) || 1;
  return '\n'.repeat(count);
}

/**
 * Render handler for newline
 */
class NewlineRenderHandler extends RenderHandler {
  render(ctx) {
    return renderNewline(ctx.props);
  }
}

renderHandlerRegistry.register('newline', new NewlineRenderHandler());
