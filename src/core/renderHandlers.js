// src/core/renderHandlers.js
/**
 * Render handler system for modular component rendering
 * Each component registers its own render handler
 */

/**
 * Context passed to render handlers
 * Provides everything a component needs to render itself
 */
export class RenderContext {
  constructor({ node, depth, absX, absY, inRow, renderNodeFn }) {
    this.node = node;
    this.depth = depth;
    this.absX = absX;
    this.absY = absY;
    this.inRow = inRow;
    this._renderNode = renderNodeFn;
  }

  get props() {
    return this.node.props || {};
  }

  get text() {
    return this.node.text || '';
  }

  get children() {
    return this.node.children || [];
  }

  get metrics() {
    return this.node.cachedLayoutMetrics;
  }

  /**
   * Get effective width for this node
   * Checks _renderWidth, props.width, and cachedLayoutMetrics in order
   */
  getEffectiveWidth() {
    if (this.node._renderWidth !== undefined) return this.node._renderWidth;
    if (this.node.props?.width != null) return this.node.props.width;
    if (this.metrics?.width) return this.metrics.width;
    return null;
  }

  /**
   * Render a child node
   * @param {Object} child - Child node to render
   * @param {Object} options - Render options
   * @param {number} options.parentAbsX - Override parent absolute X
   * @param {number} options.yOffset - Y offset from parent
   * @param {boolean} options.inRow - Whether inside a Row
   * @returns {string} Rendered output
   */
  renderChild(child, options = {}) {
    return this._renderNode(child, this.depth + 1, {
      parentAbsX: options.parentAbsX ?? this.absX,
      parentAbsY: this.absY,
      yOffset: options.yOffset ?? 0,
      inRow: options.inRow ?? this.inRow
    });
  }
}

/**
 * Base class for render handlers
 * Each component should extend this and implement render()
 */
export class RenderHandler {
  /**
   * Render the component
   * @param {RenderContext} ctx - Render context
   * @returns {string} Rendered output
   */
  render(ctx) {
    throw new Error('render() must be implemented');
  }
}

/**
 * Registry of render handlers
 * Components register themselves at module load time
 */
class RenderHandlerRegistry {
  constructor() {
    this.handlers = new Map();
  }

  /**
   * Register a handler for a component type
   * @param {string} type - Component type (e.g., 'button', 'box')
   * @param {RenderHandler} handler - Handler instance
   */
  register(type, handler) {
    this.handlers.set(type, handler);
  }

  /**
   * Get handler for a component type
   * @param {string} type - Component type
   * @returns {RenderHandler|null}
   */
  get(type) {
    return this.handlers.get(type) || null;
  }

  /**
   * Check if handler exists for a component type
   * @param {string} type - Component type
   * @returns {boolean}
   */
  has(type) {
    return this.handlers.has(type);
  }

  /**
   * Unregister a handler
   * @param {string} type - Component type
   */
  unregister(type) {
    this.handlers.delete(type);
  }
}

// Singleton registry
export const renderHandlerRegistry = new RenderHandlerRegistry();
