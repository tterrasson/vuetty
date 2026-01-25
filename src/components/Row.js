// src/components/Row.js
import { h, inject, provide } from 'vue';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import { HEIGHT_CONTEXT_KEY } from '@core/heightContext.js';
import { VUETTY_VIEWPORT_STATE_KEY } from '@core/vuettyKeys.js';
import { layoutProps } from '@core/layoutProps.js';

/**
 * Row component - Horizontal flex layout
 */
export default {
  name: 'Row',
  props: {
    // Include all layout props (flex, padding, margin, dimensions, etc.)
    ...layoutProps,
    // Override defaults for Row-specific behavior
    gap: { type: Number, default: 0 },
    justifyContent: {
      type: String,
      default: 'flex-start',
      validator: val =>
        [
          'flex-start',
          'flex-end',
          'center',
          'space-between',
          'space-around',
          'space-evenly',
        ].includes(val)
    },
    alignItems: {
      type: String,
      default: 'stretch',
      validator: val => [
        'flex-start',
        'flex-end',
        'center',
        'stretch',
        'baseline'
      ].includes(val)
    },
    flexWrap: {
      type: String,
      default: 'nowrap',
      validator: val => ['nowrap', 'wrap', 'wrap-reverse'].includes(val)
    },
    responsive: { type: Boolean, default: false }
  },
  setup(props, { slots }) {
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);
    const injectedHeightContext = inject(HEIGHT_CONTEXT_KEY, null);
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);

    // Provide height context to children
    provide(HEIGHT_CONTEXT_KEY, () => {
      if (props.height !== undefined && props.height !== null) return props.height;
      const injectedHeight = typeof injectedHeightContext === 'function'
        ? injectedHeightContext()
        : injectedHeightContext;
      if (injectedHeight !== undefined && injectedHeight !== null) return injectedHeight;
      return null;
    });

    return () => {
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      const injectedHeight = typeof injectedHeightContext === 'function'
        ? injectedHeightContext()
        : injectedHeightContext;

      const enhancedProps = {
        ...props,
        _injectedWidth: injectedWidth,
        _injectedHeight: injectedHeight,
        _viewportVersion: viewportState ? viewportState.version : 0
      };
      return h('row', enhancedProps, slots.default?.());
    };
  }
};
