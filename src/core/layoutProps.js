// src/composables/useLayoutProps.js
/**
 * Common layout props that can be applied to any component
 * These props are handled by the Yoga layout engine
 */

/**
 * Flex container props
 */
export const flexContainerProps = {
  justifyContent: {
    type: String,
    default: null,
    validator: val => val === null || ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'].includes(val)
  },
  alignItems: {
    type: String,
    default: null,
    validator: val => val === null || ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'].includes(val)
  },
  alignContent: {
    type: String,
    default: null,
    validator: val => val === null || ['flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around'].includes(val)
  },
  flexWrap: {
    type: String,
    default: null,
    validator: val => val === null || ['nowrap', 'wrap', 'wrap-reverse'].includes(val)
  },
  flexDirection: {
    type: String,
    default: null,
    validator: val => val === null || ['row', 'column', 'row-reverse', 'column-reverse'].includes(val)
  },
  gap: {
    type: Number,
    default: null
  }
};

/**
 * Flex item props
 */
export const flexItemProps = {
  flex: {
    type: [Number, String],
    default: null
  },
  flexGrow: {
    type: Number,
    default: null
  },
  flexShrink: {
    type: Number,
    default: null
  },
  flexBasis: {
    type: [Number, String],
    default: null
  },
  alignSelf: {
    type: String,
    default: null,
    validator: val => val === null || ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'].includes(val)
  }
};

/**
 * Dimension props
 */
export const dimensionProps = {
  width: {
    type: [Number, String],
    default: null
  },
  height: {
    type: [Number, String],
    default: null
  },
  minWidth: {
    type: Number,
    default: null
  },
  maxWidth: {
    type: Number,
    default: null
  },
  minHeight: {
    type: Number,
    default: null
  },
  maxHeight: {
    type: Number,
    default: null
  }
};

/**
 * Spacing props - padding
 */
export const paddingProps = {
  padding: {
    type: Number,
    default: null
  },
  paddingLeft: {
    type: Number,
    default: null
  },
  paddingRight: {
    type: Number,
    default: null
  },
  paddingTop: {
    type: Number,
    default: null
  },
  paddingBottom: {
    type: Number,
    default: null
  }
};

/**
 * Spacing props - margin
 */
export const marginProps = {
  margin: {
    type: Number,
    default: null
  },
  marginLeft: {
    type: Number,
    default: null
  },
  marginRight: {
    type: Number,
    default: null
  },
  marginTop: {
    type: Number,
    default: null
  },
  marginBottom: {
    type: Number,
    default: null
  }
};

/**
 * All layout props combined (for Row/Col - includes flex item props)
 */
export const layoutProps = {
  ...flexContainerProps,
  ...flexItemProps,
  ...dimensionProps,
  ...paddingProps,
  ...marginProps
};

/**
 * Box props for visual components that can be flex items
 * Includes flex item properties (flex, flexGrow, etc.) so Box/TextBox can participate in flex layouts
 * Used by Box, TextBox
 */
export const boxProps = {
  ...flexItemProps,
  ...dimensionProps,
  ...paddingProps,
  ...marginProps
};

/**
 * Extract only the layout prop values from a props object
 * Useful for passing to enhanced props without duplicating other props
 */
export function extractLayoutProps(props) {
  const layoutPropNames = new Set(Object.keys(layoutProps));
  const extracted = {};

  for (const key in props) {
    if (layoutPropNames.has(key) && props[key] !== null && props[key] !== undefined) {
      extracted[key] = props[key];
    }
  }

  return extracted;
}

/**
 * Get all layout prop names as an array
 */
export function getLayoutPropNames() {
  return Object.keys(layoutProps);
}
