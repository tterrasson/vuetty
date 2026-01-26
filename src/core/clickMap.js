// src/core/clickMap.js

/**
 * ClickMap - Spatial mapping of clickable components
 *
 * Uses Yoga-computed absolute positions for accurate hit testing.
 * Regions are collected during render and stored with their absolute
 * coordinates, then adjusted for viewport scroll during hit testing.
 */

// Maximum number of clickable regions to track
// Prevents memory issues with many dynamic components
const MAX_REGIONS = 500;

export class ClickMap {
  constructor() {
    /** @type {Array<ClickRegion>} Clickable regions sorted by render order (z-order) */
    this.regions = [];

    /** @type {boolean} Whether the map needs rebuilding */
    this.isDirty = true;

    /** @type {number} Current viewport scroll offset */
    this._scrollOffset = 0;

    /** @type {number} Viewport height for filtering */
    this.viewportHeight = 0;

    /** @type {Object|null} Debug server for event capture */
    this.debugServer = null;
  }

  /**
   * Build click map from render-tracked positions
   * Regions come with absolute Y positions from Yoga layout.
   *
   * @param {TUINode} rootNode - Root of the node tree (with _clickRegions from render)
   * @param {number} scrollOffset - Viewport scroll offset
   * @param {number} viewportHeight - Terminal height for filtering
   */
  build(rootNode, scrollOffset = 0, viewportHeight = 0) {
    const sourceRegions = rootNode._clickRegions || [];

    this._scrollOffset = scrollOffset;
    this.viewportHeight = viewportHeight;

    // Filter to visible regions (with buffer for smooth scrolling)
    // Regions have absolute Y from Yoga, we filter based on viewport visibility
    const visibleBuffer = 50; // Lines of buffer above/below viewport

    this.regions = [];

    for (const region of sourceRegions) {
      // Calculate screen position (absolute Y minus scroll offset)
      const screenY = region.y - scrollOffset;

      // Keep regions that are visible or within buffer zone
      const isVisible = screenY < viewportHeight + visibleBuffer &&
                        screenY + region.height > -visibleBuffer;

      if (isVisible) {
        this.regions.push({
          componentId: region.componentId,
          x: region.x,
          absY: region.y,        // Absolute Y (from Yoga)
          screenY: screenY,      // Screen Y (viewport-relative)
          width: region.width,
          height: region.height,
          depth: region.depth,
          nodeType: region.nodeType
        });
      }
    }

    // Limit regions count to prevent memory issues
    if (this.regions.length > MAX_REGIONS) {
      // Keep the most recently rendered (highest depth/last in array)
      this.regions = this.regions.slice(-MAX_REGIONS);
    }

    this.isDirty = false;

    if (this.debugServer) {
      this.debugServer.captureEvent('clickmap.build', {
        sourceCount: sourceRegions.length,
        filteredCount: this.regions.length,
        scrollOffset,
        viewportHeight
      });
    }
  }

  /**
   * Find which component was clicked
   *
   * @param {number} x - Terminal X coordinate (1-indexed from mouse event)
   * @param {number} y - Terminal Y coordinate (1-indexed from mouse event)
   * @returns {string|null} Component ID or null if no match
   */
  hitTest(x, y) {
    // Convert 1-indexed terminal coords to 0-indexed layout coords
    const layoutX = x - 1;
    const layoutY = y - 1;  // This is screen Y (viewport-relative)

    if (this.debugServer) {
      this.debugServer.captureEvent('clickmap.hittest', {
        terminalX: x,
        terminalY: y,
        layoutX,
        layoutY,
        scrollOffset: this._scrollOffset,
        regionCount: this.regions.length
      });
    }

    // Search in REVERSE order (last rendered = highest z-order = on top)
    for (let i = this.regions.length - 1; i >= 0; i--) {
      const region = this.regions[i];

      // Check if click is within region bounds
      // Use screenY for comparison since layoutY is viewport-relative
      const inX = layoutX >= region.x && layoutX < region.x + region.width;
      const inY = layoutY >= region.screenY && layoutY < region.screenY + region.height;

      if (inX && inY) {
        if (this.debugServer) {
          this.debugServer.captureEvent('clickmap.hit', {
            componentId: region.componentId,
            nodeType: region.nodeType,
            region: {
              x: region.x,
              screenY: region.screenY,
              width: region.width,
              height: region.height
            }
          });
        }
        return region.componentId;
      }
    }

    if (this.debugServer) {
      this.debugServer.captureEvent('clickmap.miss', { layoutX, layoutY });
    }

    return null;
  }

  /**
   * Adjust screen Y positions for scroll without full rebuild
   * Much faster than rebuild() when only scroll offset changed
   *
   * IMPORTANT: Only safe when visibility filtering didn't affect the regions
   * (i.e., all clickable components are already in the regions array).
   * For user-initiated scrolls that may bring filtered components into view,
   * use invalidate() instead to force a rebuild.
   *
   * @param {number} newScrollOffset - New scroll offset
   */
  adjustForScroll(newScrollOffset) {
    if (this._scrollOffset === newScrollOffset) return;

    const delta = newScrollOffset - this._scrollOffset;
    this._scrollOffset = newScrollOffset;

    // Update screenY for all regions
    // screenY = absY - scrollOffset
    for (let i = 0; i < this.regions.length; i++) {
      this.regions[i].screenY -= delta;
    }

    if (this.debugServer) {
      this.debugServer.captureEvent('clickmap.scroll', {
        delta,
        newScrollOffset,
        regionCount: this.regions.length
      });
    }
  }

  /**
   * Mark click map as dirty (requires rebuild on next hit test)
   */
  invalidate() {
    this.isDirty = true;
  }

  /**
   * Clear all regions and reset state
   */
  clear() {
    this.regions.length = 0;
    this.isDirty = true;
    this._scrollOffset = 0;
    this.viewportHeight = 0;
  }

  /**
   * Set debug server for event capture
   * @param {Object} debugServer - Debug server instance
   */
  setDebugServer(debugServer) {
    this.debugServer = debugServer;
  }

  /**
   * Get all clickable regions (for debugging)
   * @returns {Array<ClickRegion>}
   */
  getRegions() {
    return this.regions;
  }

  /**
   * Get statistics for debugging and memory monitoring
   * @returns {Object} Stats object
   */
  getStats() {
    return {
      regionCount: this.regions.length,
      maxRegions: MAX_REGIONS,
      isDirty: this.isDirty,
      scrollOffset: this._scrollOffset,
      viewportHeight: this.viewportHeight
    };
  }

  /**
   * Debug: Print all regions to console
   * Useful for debugging click alignment issues
   */
  debugPrint() {
    console.error('=== ClickMap Debug ===');
    console.error(`Scroll: ${this._scrollOffset}, Viewport: ${this.viewportHeight}, Dirty: ${this.isDirty}`);
    console.error(`Regions (${this.regions.length}):`);

    for (let i = 0; i < this.regions.length; i++) {
      const r = this.regions[i];
      console.error(
        `  [${i}] ${r.nodeType} "${r.componentId}" ` +
        `x:${r.x}-${r.x + r.width} screenY:${r.screenY}-${r.screenY + r.height} ` +
        `(absY:${r.absY})`
      );
    }

    console.error('======================');
  }
}

/**
 * @typedef {Object} ClickRegion
 * @property {string} componentId - Unique component identifier
 * @property {number} x - X position (absolute, from Yoga)
 * @property {number} absY - Absolute Y position (from Yoga)
 * @property {number} screenY - Screen Y position (viewport-relative)
 * @property {number} width - Region width
 * @property {number} height - Region height
 * @property {number} depth - Render depth (z-order)
 * @property {string} nodeType - Node type for debugging
 */