// src/core/node.js
/**
 * TUINode - Represents a node in the TUI tree
 */
export class TUINode {
  constructor(type) {
    this.type = type;
    this.props = {};
    this.children = [];
    this.parent = null;
    this.text = '';

    // Memoization flags
    this.isDirty = true;
    this.childrenDirty = true;
    this.renderVersion = 0;
    this.cachedOutput = null;
    this.cachedChildrenOutput = null;

    // Layout flags
    this.isLayoutDirty = true;
    this.cachedLayoutMetrics = null;

    // Render-time width (set by Row/Col, doesn't affect dirty state)
    this._renderWidth = undefined;

    // Click handling
    this.componentId = null;  // Link to interactive component
    this.clickable = false;   // Flag for quick filtering
  }

  appendChild(child) {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this.children.push(child);
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
      child.clearCaches();
    }
  }

  insertBefore(child, anchor) {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;

    const index = this.children.indexOf(anchor);
    if (index !== -1) {
      this.children.splice(index, 0, child);
    } else {
      this.children.push(child);
    }
  }

  setText(text) {
    this.text = text;
  }

  setProps(props) {
    Object.assign(this.props, props);
  }

  /**
   * Mark this node as dirty (does not propagate)
   * Use markSelfDirty() from memoization.js for proper propagation
   */
  markDirty() {
    this.isDirty = true;
    this.cachedOutput = null;
    this.renderVersion++;
  }

  /**
   * Mark layout as dirty (propagates to ancestors)
   */
  markLayoutDirty() {
    this.isLayoutDirty = true;
    this.renderVersion++;

    if (this.parent) {
      this.parent.markLayoutDirty();
    }
  }

  /**
   * Invalidate children cache
   */
  invalidateChildrenCache() {
    this.childrenDirty = true;
    this.cachedChildrenOutput = null;
    this.cachedOutput = null;
  }

  /**
   * Check if render can be skipped
   */
  canSkipRender() {
    return !this.isDirty && !this.childrenDirty && this.cachedOutput !== null;
  }

  /**
   * Clear all caches to help garbage collection
   * Call this when a node is removed from the tree
   */
  clearCaches() {
    this.cachedOutput = null;
    this.cachedChildrenOutput = null;
    this.cachedLayoutMetrics = null;
    this.isDirty = true;
    this.childrenDirty = true;
    this.isLayoutDirty = true;
  }

  /**
   * Deep cleanup - clears this node and all descendants
   * Use when unmounting or removing large subtrees
   */
  cleanup() {
    this.clearCaches();
    this.parent = null;
    this.props = {};
    this.text = '';
    this.componentId = null;

    // Recursively cleanup children
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].cleanup();
    }
    this.children = [];
  }
}

/**
 * TextNode - Represents a text node
 */
export class TextNode extends TUINode {
  constructor(text = '') {
    super('text');
    this.text = text;
  }
}

/**
 * CommentNode - Represents a comment node (Vue internals)
 */
export class CommentNode extends TUINode {
  constructor(text = '') {
    super('comment');
    this.text = text;
  }
}