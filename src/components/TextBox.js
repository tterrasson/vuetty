// src/components/TextBox.js
import { h, inject, ref, watch, onUnmounted } from 'vue';
import { applyStyles, wrapText, getTerminalWidth, getSpaces } from '@utils/renderUtils.js';
import { adjustToHeight } from '@utils/heightUtils.js';
import { VUETTY_VIEWPORT_STATE_KEY, VUETTY_THEME_KEY } from '@core/vuettyKeys.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';
import { renderChildrenCached } from '@core/memoization.js';
import { effectRegistry } from '@effects/effectRegistry.js';

/**
 * TextBox component - Styled text
 */
export default {
  name: 'TextBox',
  props: {
    color: String,
    bg: String,
    bold: Boolean,
    italic: Boolean,
    underline: Boolean,
    dim: Boolean,
    // Effect props
    effect: {
      type: String,
      default: null
    },
    effectProps: {
      type: Object,
      default: null
    },
    animated: {
      type: Boolean,
      default: false
    },
    animationInterval: {
      type: Number,
      default: null
    },
    // Include box props (padding, margin, dimensions, flex item props)
    ...boxProps
  },
  setup(props, { slots }) {
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);
    const theme = inject(VUETTY_THEME_KEY, null);

    // Animation state for animated effects
    const currentFrame = ref(0);
    let animationTimerId = null;

    function startAnimation(interval) {
      if (animationTimerId !== null) return;

      const animate = () => {
        currentFrame.value++;
        animationTimerId = setTimeout(animate, interval);
      };
      animate();
    }

    function stopAnimation() {
      if (animationTimerId !== null) {
        clearTimeout(animationTimerId);
        animationTimerId = null;
      }
      currentFrame.value = 0;
    }

    // Watch effect + animated + effectProps to start/stop animation
    watch(
      [() => props.effect, () => props.animated, () => props.effectProps],
      ([effect, animated]) => {
        stopAnimation(); // Always stop first to ensure clean state
        if (effect && animated) {
          const effectDef = effectRegistry.get(effect);
          if (effectDef?.animated) {
            const interval = props.animationInterval || effectDef.defaultInterval;
            startAnimation(interval);
          }
        }
      },
      { immediate: true }
    );

    // Watch interval changes to restart with new interval
    watch(
      () => props.animationInterval,
      () => {
        if (props.effect && props.animated && animationTimerId !== null) {
          stopAnimation();
          const effectDef = effectRegistry.get(props.effect);
          if (effectDef?.animated) {
            const interval = props.animationInterval || effectDef.defaultInterval;
            startAnimation(interval);
          }
        }
      }
    );

    // Cleanup on unmount
    onUnmounted(() => stopAnimation());

    // Cache for enhanced props to avoid allocations
    let lastInjectedWidth = undefined;
    let lastViewportVersion = -1;
    let lastPropsHash = '';
    let cachedEnhancedProps = null;
    let basePropsChanged = false;

    // Track last effectProps reference for shallow comparison
    let lastEffectProps = null;
    let lastEffectPropsHash = '';

    /**
     * Generate hash for effectProps using shallow comparison
     */
    const getEffectPropsHash = (effectProps) => {
      if (!effectProps) return '';
      // If same reference, return cached hash
      if (effectProps === lastEffectProps) return lastEffectPropsHash;

      // Build hash from known effect prop keys (shallow)
      const parts = [];
      if (effectProps.speed !== undefined) parts.push(`s:${effectProps.speed}`);
      if (effectProps.color !== undefined) parts.push(`c:${effectProps.color}`);
      if (effectProps.colors !== undefined) parts.push(`cs:${effectProps.colors.join(',')}`);
      if (effectProps.minBrightness !== undefined) parts.push(`minB:${effectProps.minBrightness}`);
      if (effectProps.maxBrightness !== undefined) parts.push(`maxB:${effectProps.maxBrightness}`);
      if (effectProps.wavelength !== undefined) parts.push(`wl:${effectProps.wavelength}`);
      if (effectProps.baseColor !== undefined) parts.push(`bc:${effectProps.baseColor}`);
      if (effectProps.highlightColor !== undefined) parts.push(`hc:${effectProps.highlightColor}`);
      if (effectProps.width !== undefined) parts.push(`w:${effectProps.width}`);

      lastEffectProps = effectProps;
      lastEffectPropsHash = parts.join('|');
      return lastEffectPropsHash;
    };

    // Simple props hash for change detection (no JSON.stringify)
    const getPropsHash = () => {
      const effectPropsHash = getEffectPropsHash(props.effectProps);
      return `${props.color}|${props.bg}|${props.bold}|${props.italic}|` +
        `${props.underline}|${props.dim}|${props.width}|${props.effect}|` +
        `${props.animated}|${effectPropsHash}`;
    };

    return () => {
      const children = slots.default ? slots.default() : [];

      // Resolve width context
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      const viewportVersion = viewportState ? viewportState.version : 0;
      const propsHash = getPropsHash();
      const frame = currentFrame.value;

      // Only recreate enhanced props if something changed (excluding frame for caching)
      basePropsChanged = (
        injectedWidth !== lastInjectedWidth ||
        viewportVersion !== lastViewportVersion ||
        propsHash !== lastPropsHash ||
        !cachedEnhancedProps
      );

      if (basePropsChanged) {
        lastInjectedWidth = injectedWidth;
        lastViewportVersion = viewportVersion;
        lastPropsHash = propsHash;

        // Resolve colors from theme if not provided in props
        // Only use theme value if prop is undefined AND theme has a value
        // For bg: don't fallback to theme.background to allow terminal's native background (OSC 11) to show through
        const effectiveColor = props.color !== undefined ? props.color : theme?.foreground;
        const effectiveBg = props.bg !== undefined
          ? props.bg
          : theme?.components?.textBox?.bg;

        cachedEnhancedProps = {
          bold: props.bold,
          italic: props.italic,
          underline: props.underline,
          dim: props.dim,
          width: props.width,
          padding: props.padding,
          paddingLeft: props.paddingLeft,
          paddingRight: props.paddingRight,
          paddingTop: props.paddingTop,
          paddingBottom: props.paddingBottom,
          effect: props.effect,
          effectProps: props.effectProps,
          _injectedWidth: injectedWidth,
          _viewportVersion: viewportVersion
        };

        // Only add color/bg if they have a value (either from props or theme)
        if (effectiveColor !== undefined && effectiveColor !== null) {
          cachedEnhancedProps.color = effectiveColor;
        }
        if (effectiveBg !== undefined && effectiveBg !== null) {
          cachedEnhancedProps.bg = effectiveBg;
        }
      }

      // For animated effects, always create a new props object with the current frame
      // This ensures Vue detects the change and triggers re-render
      if (props.effect && props.animated) {
        return h('textbox', {
          ...cachedEnhancedProps,
          _effectFrame: frame
        }, children);
      }

      return h('textbox', cachedEnhancedProps, children);
    };
  }
};

/**
 * Render text with styling and optional wrapping
 */
export function renderText(content, props) {
  if (!content) return '';

  const {
    _injectedWidth,
    _targetHeight,
    _effectFrame = 0,
    width,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    padding = 0,
    effect,
    effectProps
  } = props || {};

  // Calculate effective padding for each side
  const effectivePaddingLeft = paddingLeft !== undefined && paddingLeft !== null ? paddingLeft : padding;
  const effectivePaddingRight = paddingRight !== undefined && paddingRight !== null ? paddingRight : padding;
  const effectivePaddingTop = paddingTop !== undefined && paddingTop !== null ? paddingTop : padding;
  const effectivePaddingBottom = paddingBottom !== undefined && paddingBottom !== null ? paddingBottom : padding;

  // Determine effective width for wrapping
  const effectiveWidth = width != null ? width : _injectedWidth;

  let result = content;

  // Apply width wrapping if needed
  if (effectiveWidth && effectiveWidth > 0) {
    // Adjust width for horizontal padding
    const contentWidth = Math.max(0, effectiveWidth - effectivePaddingLeft - effectivePaddingRight);
    result = wrapText(result, contentWidth);
  }

  // Apply height constraint if specified (before styling and padding)
  if (_targetHeight !== undefined && _targetHeight > 0) {
    const contentHeight = Math.max(0, _targetHeight - effectivePaddingTop - effectivePaddingBottom);
    if (contentHeight > 0) {
      result = adjustToHeight(result, contentHeight);
    }
  }

  // Apply effect OR styles (effects handle their own coloring)
  if (effect && effectRegistry.has(effect)) {
    const effectDef = effectRegistry.get(effect);
    result = effectDef.fn(result, effectProps || {}, _effectFrame);
  } else {
    // Apply styles only if no effect
    result = applyStyles(result, props || {});
  }

  // Apply horizontal padding to each line
  if (effectivePaddingLeft > 0 || effectivePaddingRight > 0) {
    const lines = result.split('\n');
    const leftPad = getSpaces(effectivePaddingLeft);
    const paddedLines = lines.map(line => {
      const visualWidth = getTerminalWidth(line);
      const widthDiff = effectiveWidth
        ? Math.max(0, effectiveWidth - effectivePaddingLeft - effectivePaddingRight - visualWidth)
        : 0;
      const rightPadWidth = effectivePaddingRight + widthDiff;
      const rightPad = getSpaces(rightPadWidth);
      return leftPad + line + rightPad;
    });
    result = paddedLines.join('\n');
  }

  // Apply vertical padding
  if (effectivePaddingTop > 0 || effectivePaddingBottom > 0) {
    const lines = result.split('\n');
    const emptyLineWidth = effectiveWidth || (lines.length > 0 ? getTerminalWidth(lines[0]) : 0);
    const emptyLine = getSpaces(emptyLineWidth);

    // Add top padding lines
    for (let i = 0; i < effectivePaddingTop; i++) {
      lines.unshift(emptyLine);
    }

    // Add bottom padding lines
    for (let i = 0; i < effectivePaddingBottom; i++) {
      lines.push(emptyLine);
    }

    result = lines.join('\n');
  }

  return result;
}

/**
 * Helper to count lines in a string
 */
function countLines(str) {
  if (!str) return 0;
  let count = 1;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 10) count++;
  }
  return count;
}

/**
 * Render handler for textbox
 */
class TextBoxRenderHandler extends RenderHandler {
  render(ctx) {
    const { node } = ctx;
    let childrenOutput = ctx.text;

    if (!childrenOutput) {
      let innerYOffset = 0;
      childrenOutput = renderChildrenCached(node, (child) => {
        const childOut = ctx.renderChild(child, {
          yOffset: innerYOffset
        });
        innerYOffset += countLines(childOut);
        return childOut;
      });
    }

    const width = ctx.getEffectiveWidth();
    const needsWidth = width !== null && ctx.props.width == null;
    if (needsWidth) node.props.width = width;

    const output = renderText(childrenOutput, ctx.props);

    if (needsWidth) delete node.props.width;
    return output;
  }
}

renderHandlerRegistry.register('textbox', new TextBoxRenderHandler());