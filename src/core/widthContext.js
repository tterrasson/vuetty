// src/core/widthContext.js

/**
 * Width context key for Vue provide/inject
 *
 * This allows components to provide their available width to descendants,
 * enabling automatic width propagation through the component tree without
 * manually passing width props.
 *
 * Usage:
 * - Container components (Box, etc.) provide their available width
 * - Layout components (Row, Col) inject this width as a fallback
 * - Explicit width props always take priority over injected context
 */
export const WIDTH_CONTEXT_KEY = Symbol('vuettyWidthContext');
