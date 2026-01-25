// src/components/Spinner.js
import { h, ref, watch, onUnmounted, nextTick, inject } from 'vue';
import { VUETTY_THEME_KEY } from '@core/vuettyKeys.js';
import { applyStyles } from '@utils/renderUtils.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

/**
 * Spinner frame sets for different animation types
 */
export const SPINNER_FRAMES = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['-', '\\', '|', '/'],
  arc: ['◐', '◓', '◑', '◒'],
  arrow: ['▹', '▸', '▹', '▸'],
  bounce: ['⠁', '⠈', '⠐', '⠠', '⢀', '⡀', '⠄', '⠂'],
  clock: ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛'],
  box: ['▖', '▘', '▝', '▗']
};

/**
 * Spinner component - Self-animating loading indicator with v-model support
 */
export default {
  name: 'Spinner',
  props: {
    type: {
      type: String,
      default: 'dots',
      validator: (value) => [
        'dots',
        'line',
        'arc',
        'arrow',
        'bounce',
        'clock',
        'box'
      ].includes(value)
    },
    modelValue: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 100,
      validator: (value) => value > 0
    },
    label: {
      type: String,
      default: ''
    },
    labelPosition: {
      type: String,
      default: 'right',
      validator: (value) => ['left', 'right'].includes(value)
    },
    color: String,
    bold: Boolean,
    italic: Boolean,
    underline: Boolean,
    dim: Boolean,
    // Include common layout props (padding, margin, dimensions)
    ...boxProps
  },
  emits: ['update:modelValue'],
  setup(props) {
    const theme = inject(VUETTY_THEME_KEY, null);
    const currentFrame = ref(0);
    const isAnimating = ref(false);
    let animationTimerId = null;

    /**
     * Start the animation loop
     */
    function startAnimation() {
      if (isAnimating.value) return;
      isAnimating.value = true;
      currentFrame.value = 0;
      animate();
    }

    /**
     * Stop the animation loop
     */
    function stopAnimation() {
      isAnimating.value = false;
      if (animationTimerId !== null) {
        clearTimeout(animationTimerId);
        animationTimerId = null;
      }
      currentFrame.value = 0;
    }

    /**
     * Animation loop - advances frame and schedules next iteration
     */
    function animate() {
      if (!isAnimating.value) return;

      const frames = SPINNER_FRAMES[props.type] || SPINNER_FRAMES.dots;
      currentFrame.value = (currentFrame.value + 1) % frames.length;

      nextTick(() => {
        if (isAnimating.value) {
          animationTimerId = setTimeout(animate, props.interval);
        }
      });
    }

    // Watch modelValue to control animation
    watch(
      () => props.modelValue,
      (isActive) => {
        isActive ? startAnimation() : stopAnimation();
      },
      { immediate: true }
    );

    // Reset frame if type changes
    watch(() => props.type, () => {
      if (isAnimating.value) {
        currentFrame.value = 0;
      }
    });

    // Restart animation with new interval
    watch(() => props.interval, () => {
      if (isAnimating.value) {
        stopAnimation();
        startAnimation();
      }
    });

    // Cleanup on unmount
    onUnmounted(() => {
      stopAnimation();
    });

    return () => {
      const effectiveColor = props.color || theme?.components?.spinner?.color;

      return h('spinner', {
        ...props,
        color: effectiveColor,
        frame: currentFrame.value
      });
    };
  }
};

/**
 * Render a spinner
 */
export function renderSpinner(props) {
  const {
    type = 'dots',
    frame = 0,
    label = '',
    labelPosition = 'right'
  } = props;

  const frames = SPINNER_FRAMES[type] || SPINNER_FRAMES.dots;
  const spinnerChar = frames[frame % frames.length];

  const parts = labelPosition === 'left'
    ? [label, label ? ' ' : '', spinnerChar]
    : [spinnerChar, label ? ' ' : '', label];

  return applyStyles(parts.join(''), props);
}

/**
 * Render handler for spinner
 */
class SpinnerRenderHandler extends RenderHandler {
  render(ctx) {
    return renderSpinner(ctx.props);
  }
}

renderHandlerRegistry.register('spinner', new SpinnerRenderHandler());
