// src/components/Button.js
import { h, inject, onUnmounted, watch, computed, ref } from 'vue';
import chalk from 'chalk';
import {
  VUETTY_INPUT_MANAGER_KEY,
  VUETTY_VIEWPORT_STATE_KEY,
  VUETTY_INSTANCE_KEY,
  VUETTY_THEME_KEY
} from '@core/vuettyKeys.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import { KEY_ENTER } from '@utils/keyParser.js';
import { getChalkColorChain } from '@utils/colorUtils.js';
import { boxProps } from '@core/layoutProps.js';
import { renderBox } from './Box.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

let buttonIdCounter = 0;

/**
 * Predefined button style variants
 */
const BUTTON_VARIANTS = {
  primary: {
    bg: 'brightBlue',
    color: 'white',
    bold: true,
    focusBg: 'blue'  // Lighter blue when focused
  },
  secondary: {
    bg: 'brightWhite',
    color: 'white',
    bold: false,
    focusBg: 'white'  // Lighter gray when focused
  },
  danger: {
    bg: 'brightRed',
    color: 'white',
    bold: true,
    focusBg: 'red'  // Lighter red when focused
  },
  warning: {
    bg: 'brightYellow',
    color: 'black',
    bold: true,
    focusBg: 'yellow'  // Lighter yellow when focused
  },
  info: {
    bg: 'brightCyan',
    color: 'black',
    bold: false,
    focusBg: 'cyan'  // Lighter cyan when focused
  },
  success: {
    bg: 'brightGreen',
    color: 'white',
    bold: true,
    focusBg: 'green'  // Lighter green when focused
  }
};

/**
 * Button component - Interactive clickable button
 */
export default {
  name: 'Button',
  props: {
    // Content
    label: {
      type: String,
      required: true
    },

    // Style variant
    variant: {
      type: String,
      default: 'primary',
      validator: (val) => [
        'primary', 'secondary', 'danger', 'warning', 'info', 'success'
      ].includes(val)
    },

    // Custom styling (overrides variant)
    color: String,
    bg: String,

    // Visual modifiers
    bold: Boolean,
    italic: Boolean,
    dim: Boolean,

    // State
    disabled: {
      type: Boolean,
      default: false
    },

    // Focus styling
    focusColor: {
      type: String,
      default: 'brightYellow'
    },
    focusBg: {
      type: String,
      default: null
    },

    // Width behavior
    fullWidth: {
      type: Boolean,
      default: false
    },

    // Include common layout props (padding, margin, dimensions)
    ...boxProps
  },

  emits: ['click', 'focus', 'blur'],

  setup(props, { emit }) {
    const inputManager = inject(VUETTY_INPUT_MANAGER_KEY);
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);
    const vuettyInstance = inject(VUETTY_INSTANCE_KEY, null);
    const theme = inject(VUETTY_THEME_KEY, null);

    // Generate unique component ID
    const componentId = `button-${++buttonIdCounter}`;

    // Pressed state for visual feedback
    const isPressed = ref(false);

    // Computed: Check if this component is focused
    const isFocused = computed(() => {
      return inputManager && inputManager.isFocused(componentId);
    });

    // Watch focus state for events
    watch(isFocused, (newVal, oldVal) => {
      if (newVal && !oldVal) {
        emit('focus');
      } else if (!newVal && oldVal) {
        emit('blur');
      }
    });

    /**
     * Key handler
     */
    function handleKey(parsedKey) {
      if (props.disabled) return false;

      // Activate on Enter or Space
      if (parsedKey.key === KEY_ENTER || parsedKey.char === ' ') {
        // Visual feedback: pressed state
        isPressed.value = true;
        emit('click');

        // Reset pressed state after brief delay
        setTimeout(() => {
          isPressed.value = false;
        }, 250);

        return true; // consumed
      }

      return false; // not consumed
    }

    /**
     * Mouse click handler
     */
    function handleClick(mouseEvent) {
      if (props.disabled) return;

      // Handle release event
      if (mouseEvent.action === 'left_release') {
        // Clear pressed state on release
        isPressed.value = false;
        return;
      }

      // Handle click event (left_click)
      // Visual feedback: pressed state
      isPressed.value = true;

      emit('click', {
        source: 'mouse',
        x: mouseEvent.x,
        y: mouseEvent.y,
        shift: mouseEvent.shift,
        ctrl: mouseEvent.ctrl,
        alt: mouseEvent.alt
      });

      // Reset pressed state after brief delay (for visual feedback)
      setTimeout(() => {
        isPressed.value = false;
      }, 250);
    }

    // Register component with InputManager
    inputManager.registerComponent(componentId, handleKey, {
      disabled: props.disabled
    });

    vuettyInstance.registerClickHandler(componentId, handleClick);

    // Cleanup on unmount
    onUnmounted(() => {
      inputManager.unregisterComponent(componentId);
      vuettyInstance.unregisterClickHandler(componentId);
    });

    // Watch disabled prop
    watch(() => props.disabled, (newVal) => {
      inputManager.setComponentDisabled(componentId, newVal);
    });

    // Render
    return () => {
      // Resolve width context
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      // Merge theme variants with default variants
      const effectiveVariants = theme?.components?.button?.variants
        ? { ...BUTTON_VARIANTS, ...theme.components.button.variants }
        : BUTTON_VARIANTS;

      return h('button', {
        ...props,
        _componentId: componentId,
        _clickable: true,
        _variants: effectiveVariants,
        isFocused: isFocused.value,
        isPressed: isPressed.value,
        _injectedWidth: injectedWidth,
        _viewportVersion: viewportState ? viewportState.version : 0
      });
    };
  }
};

/**
 * Render a button with styling using Box component
 */
export function renderButton(props) {
  const {
    label = '',
    variant = 'primary',
    color,
    bg,
    bold,
    italic,
    dim,
    disabled = false,
    isFocused = false,
    isPressed = false,
    _variants,
    _injectedWidth,
    width,
    fullWidth = false
  } = props;

  // Resolve styles (variant + custom overrides)
  const variants = _variants || BUTTON_VARIANTS;
  const variantStyle = variants[variant] || variants.primary;
  let finalBg = bg || variantStyle.bg;
  const finalBold = bold !== undefined ? bold : variantStyle.bold;

  // Determine border color based on state
  let borderColor = color || finalBg;  // Border uses custom color or background color from variant

  // Build button text without extra padding (Box adds the border)
  let styledLabel = label;
  let textColor = color || finalBg;  // Text color uses custom color or matches border color

  // Focus state: use white text for strong visibility (unless custom color is set)
  if (isFocused && !disabled && !color) {
    textColor = 'white';  // Text becomes white when focused
  }

  // Apply text color
  if (textColor) {
    const colorChain = getChalkColorChain(textColor);
    if (colorChain) {
      styledLabel = colorChain(styledLabel);
    }
  }

  // Apply bold to text when focused or when defined by variant/prop
  const shouldBeBold = (isFocused && !disabled) || finalBold;
  if (shouldBeBold) styledLabel = chalk.bold(styledLabel);
  if (italic) styledLabel = chalk.italic(styledLabel);
  if (disabled || dim) styledLabel = chalk.dim(styledLabel);

  // Pressed state: apply inverse effect ON TOP of everything else (focus or not)
  if (isPressed && !disabled) {
    styledLabel = chalk.inverse(styledLabel);
  }

  // Use Box component with border only (background only if custom bg is set)
  // Only use injected width if fullWidth is enabled
  const effectiveWidth = fullWidth ? (width || _injectedWidth) : width;

  const boxProps = {
    border: true,
    borderStyle: 'button',
    bg: bg || null,  // Apply custom background if provided
    color: borderColor,
    paddingLeft: 1,    // Just horizontal padding for aesthetics
    paddingRight: 1,
    paddingTop: 0,     // No vertical padding
    paddingBottom: 0,
    bold: isFocused && !disabled,  // Make border bold when focused
    width: effectiveWidth,
    align: fullWidth ? 'center' : undefined  // Center text when fullWidth
  };

  return renderBox(styledLabel, boxProps, 0);
}

/**
 * Render handler for button
 */
class ButtonRenderHandler extends RenderHandler {
  render(ctx) {
    const { node } = ctx;
    const props = ctx.props;

    // Button only uses parent width if fullWidth is enabled
    const originalWidth = props.width;
    if (!props.fullWidth) {
      delete node.props.width;
    }

    const output = renderButton(props);

    if (originalWidth !== undefined) {
      node.props.width = originalWidth;
    }

    return output;
  }
}

renderHandlerRegistry.register('button', new ButtonRenderHandler());
