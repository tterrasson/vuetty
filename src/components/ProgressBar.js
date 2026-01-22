// src/components/ProgressBar.js
import { h, inject } from 'vue';
import { applyStyles } from '@utils/renderUtils.js';
import { VUETTY_VIEWPORT_STATE_KEY } from '@core/vuettyKeys.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

/**
 * ProgressBar component - Visual progress indicator
 */
export default {
  name: 'ProgressBar',
  props: {
    value: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    width: {
      type: Number,
      default: 40
    },
    char: {
      type: String,
      default: '█'
    },
    emptyChar: {
      type: String,
      default: '░'
    },
    showPercentage: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: ''
    },
    labelPosition: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'right', 'above', 'below'].includes(value)
    },
    brackets: {
      type: Boolean,
      default: true
    },
    color: String,
    emptyColor: String,
    percentageColor: String,
    bold: Boolean,
    italic: Boolean,
    underline: Boolean,
    dim: Boolean,
    // Include common layout props (padding, margin, dimensions)
    ...boxProps
  },
  setup(props) {
    // Inject viewport state to trigger re-renders on resize
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);

    // Inject width context from parent (Box, etc.)
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);

    return () => {
      // Resolve width context (call function if it's a function for reactive width)
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      // Pass injected width and viewport version through props
      // The viewport version creates a reactive dependency - when it changes, Vue re-renders
      const enhancedProps = {
        ...props,
        _injectedWidth: injectedWidth,
        _viewportVersion: viewportState ? viewportState.version : 0
      };

      return h('progressbar', enhancedProps);
    };
  }
};

/**
 * Render a progress bar
 */
export function renderProgressBar(props) {
  const {
    value = 0,
    max = 100,
    width = 40,
    char = '█',
    emptyChar = '░',
    showPercentage = true,
    label = '',
    labelPosition = 'left',
    brackets = true,
    color = 'green',
    emptyColor = 'white',
    percentageColor = 'white'
  } = props;

  // Calculate percentage and widths
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const filledWidth = Math.round((percentage / 100) * width);
  const emptyWidth = width - filledWidth;

  // Build bar with separate styling for filled/empty portions
  const filled = applyStyles(char.repeat(filledWidth), { color, bold: props.bold });
  const empty = applyStyles(emptyChar.repeat(emptyWidth), { color: emptyColor, dim: true });

  let bar = filled + empty;
  if (brackets) {
    bar = '[' + bar + ']';
  }

  // Add percentage
  let percentageText = '';
  if (showPercentage) {
    percentageText = applyStyles(` ${percentage.toFixed(0)}%`, { color: percentageColor });
  }

  const barWithPercentage = bar + percentageText;

  // Position label
  if (labelPosition === 'above') {
    return applyStyles(label, props) + '\n' + barWithPercentage;
  } else if (labelPosition === 'below') {
    return barWithPercentage + '\n' + applyStyles(label, props);
  } else if (labelPosition === 'left') {
    return applyStyles(label, props) + (label ? ' ' : '') + barWithPercentage;
  } else { // right
    return barWithPercentage + (label ? ' ' : '') + applyStyles(label, props);
  }
}

/**
 * Render handler for progressbar
 */
class ProgressBarRenderHandler extends RenderHandler {
  render(ctx) {
    return renderProgressBar(ctx.props);
  }
}

renderHandlerRegistry.register('progressbar', new ProgressBarRenderHandler());
