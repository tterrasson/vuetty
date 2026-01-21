// src/core/heightContext.js

/**
 * Height context key for Vue provide/inject
 *
 * This allows components to provide their available height to descendants,
 * enabling automatic height propagation through the component tree without
 * manually passing height props.
 *
 * Usage:
 * - Container components (Box, Col, Row, etc.) provide their available height
 * - Layout components (Row, Col) inject this height as a fallback
 * - Explicit height props always take priority over injected context
 */
export const HEIGHT_CONTEXT_KEY = Symbol('vuettyHeightContext');
