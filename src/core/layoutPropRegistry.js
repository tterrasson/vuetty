// src/core/layoutPropRegistry.js
/**
 * Layout-Affecting Props Registry
 *
 * Properties that trigger layout recalculation (isLayoutDirty flag).
 * This separates visual changes (color, etc.) from structural changes.
 *
 * Categories:
 * 1. Core Layout Props - Derived from layoutProps.js (flex, dimensions, spacing)
 * 2. Universal Props - Always affect layout (border, responsive, internal flags)
 * 3. Visual State Props - Affect visual dimensions (label, hint, validation)
 * 4. Component-Specific Props - Component data that affects layout (rows, headers)
 *
 * To add new layout-affecting props:
 * - Standard layout props → add to layoutProps.js (auto-detected)
 * - New component data props → add to componentSpecificProps
 * - New universal props → add to universalLayoutProps
 */

import { getLayoutPropNames } from './layoutProps.js';

/**
 * Core layout props - derived automatically from layoutProps.js
 * Includes: justifyContent, alignItems, alignContent, flexWrap, flexDirection,
 * gap, flex, flexGrow, flexShrink, flexBasis, alignSelf, width, height,
 * minWidth, maxWidth, minHeight, maxHeight, padding*, margin*
 */
const coreLayoutProps = new Set(getLayoutPropNames());

/**
 * Universal props that always affect layout
 * - border/borderStyle: add visual space around components
 * - responsive: triggers viewport-based layout adjustments
 * - _injectedWidth/_viewportVersion: internal reactive layout flags
 * - text: TextNode content changes affect layout
 */
const universalLayoutProps = new Set([
  'border',
  'borderStyle',
  'responsive',
  '_injectedWidth',
  '_viewportVersion',
  'text'
]);

/**
 * Visual state props that affect dimensions
 * These don't map to Yoga properties directly but change visual height/width:
 * - label/hint: add text lines above/below inputs
 * - validationError: adds error message line
 * - isFocused: may add focus indicator visual elements
 * - disabled: may change visual appearance size
 */
const visualStateProps = new Set([
  'label',
  'hint',
  'validationError',
  'isFocused',
  'disabled'
]);

/**
 * Component-specific props that affect layout
 * Consolidated list of data props that determine component dimensions:
 * - rows/headers/options/showHeader: Table component layout
 * - minRows/maxRows/autoResize: TextInput multiline behavior
 * - imageLines: Image component height
 * - count/lines: Various components that render lists
 * - direction: Component orientation
 * - font/length: Text measurement props
 */
const componentSpecificProps = new Set([
  'rows',
  'headers',
  'options',
  'showHeader',
  'minRows',
  'maxRows',
  'autoResize',
  'imageLines',
  'count',
  'lines',
  'direction',
  'font',
  'length'
]);

/**
 * Combined set of all layout-affecting props
 * Used by hashUtils.js for content hash generation
 */
export const LAYOUT_AFFECTING_PROPS = new Set([
  ...coreLayoutProps,
  ...universalLayoutProps,
  ...visualStateProps,
  ...componentSpecificProps
]);

/**
 * Check if a prop change affects layout
 * Used by renderer.js to determine if node.markLayoutDirty() should be called
 *
 * @param {string} propName - The prop name to check
 * @returns {boolean} True if the prop affects layout
 */
export function isLayoutAffectingProp(propName) {
  return LAYOUT_AFFECTING_PROPS.has(propName);
}
