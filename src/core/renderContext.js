// src/core/renderContext.js
import { reactive } from 'vue';

/**
 * Global rendering context
 * Provides access to viewport and other rendering state
 */

let currentViewport = null;
let currentWidthContext = null;

// Reactive viewport dimensions that update on resize
// This allows components to reactively respond to terminal size changes
export const reactiveViewport = reactive({
  terminalWidth: 80,
  terminalHeight: 24
});

export function setRenderContext(viewport) {
  currentViewport = viewport;

  // Update reactive viewport dimensions
  if (viewport) {
    reactiveViewport.terminalWidth = viewport.terminalWidth;
    reactiveViewport.terminalHeight = viewport.terminalHeight;
  }
}

export function getRenderContext() {
  return currentViewport;
}

export function setWidthContext(width) {
  currentWidthContext = width;
}

export function getWidthContext() {
  return currentWidthContext;
}

/**
 * Get the current viewport width (terminal columns)
 * Returns reactive value that updates on terminal resize
 * Falls back to process.stdout.columns if viewport not set
 * @returns {number} Terminal width in columns
 */
export function getViewportWidth() {
  return reactiveViewport.terminalWidth || (process.stdout.columns || 80);
}

/**
 * Get the current viewport height (terminal rows)
 * Returns reactive value that updates on terminal resize
 * Falls back to process.stdout.rows if viewport not set
 * @returns {number} Terminal height in rows
 */
export function getViewportHeight() {
  return reactiveViewport.terminalHeight || (process.stdout.rows || 24);
}

/**
 * ============================================================
 * Click Region Tracking
 * ============================================================
 *
 * Collects clickable regions during render using Yoga-computed
 * absolute positions. No linear Y tracking - positions come
 * directly from layout metrics.
 */

let clickRegions = [];
let isTrackingEnabled = false;

/**
 * Start tracking click regions during render
 * Call this before renderToString()
 */
export function startPositionTracking() {
  clickRegions = [];
  isTrackingEnabled = true;
}

/**
 * Stop tracking and return collected regions
 * Call this after renderToString()
 * @returns {Array} Array of click regions with absolute positions
 */
export function stopPositionTracking() {
  isTrackingEnabled = false;
  const result = clickRegions;
  clickRegions = [];
  return result;
}

/**
 * Check if position tracking is currently enabled
 * @returns {boolean} True if tracking is active
 */
export function isPositionTrackingEnabled() {
  return isTrackingEnabled;
}

/**
 * Register a clickable region with absolute position from Yoga metrics
 * @param {Object} region - Region data
 * @param {string} region.componentId - Unique component identifier
 * @param {number} region.x - Absolute X position (from Yoga)
 * @param {number} region.y - Absolute Y position (from Yoga)
 * @param {number} region.width - Region width
 * @param {number} region.height - Region height
 * @param {number} region.depth - Render depth (for z-order)
 * @param {string} region.nodeType - Node type for debugging
 */
export function registerClickRegion(region) {
  if (isTrackingEnabled && region.width > 0 && region.height > 0) {
    clickRegions.push(region);
  }
}
