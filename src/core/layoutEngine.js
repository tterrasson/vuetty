// src/core/layoutEngine.js
/**
 * Yoga Layout Engine - Facebook's flexbox implementation for terminal layouts
 */

import Yoga from 'yoga-layout';
import { layoutCache } from './layoutCache.js';
import { generateContentHash } from '@utils/hashUtils.js';
import { componentHandlerRegistry, extractTextContent, calculateTextHeight } from './componentHandlers.js';

/**
 * Yoga Layout Engine
 */
export class YogaLayoutEngine {
  constructor() {
    this.cache = layoutCache;
    this._lastCacheKey = null; // Track last used cache key
  }

  /**
   * Compute layout for a node tree using Yoga
   */
  computeLayout(node, containerWidth, containerHeight) {
    if (!node) {
      return { width: 0, height: 0, x: 0, y: 0, children: [] };
    }

    // Generate cache key - SIMPLIFIED to reduce string allocations
    // Only use dimensions + simple content hash, not full key string
    const contentHash = generateContentHash(node);

    // Use numeric comparison instead of string key when possible
    const cacheKey = `${containerWidth}:${containerHeight}:${contentHash}`;

    // Check cache first
    const cached = this.cache.getLayoutMetrics(node, cacheKey);
    if (cached) {
      this.restoreCachedMetrics(node, cached);
      node.isLayoutDirty = false;
      return cached;
    }

    // Track if we have textboxes that might need height recalculation
    this._hasTextBoxes = false;

    // Pass 1: Initial layout
    const yogaRoot = this.buildYogaTree(node, containerWidth, containerHeight, null, 0, 0);

    try {
      yogaRoot.calculateLayout(containerWidth, containerHeight, Yoga.DIRECTION_LTR);

      // Pass 2: Update text heights with computed widths
      if (this._hasTextBoxes) {
        const needsSecondPass = this.updateTextHeights(yogaRoot, node);
        if (needsSecondPass) {
          yogaRoot.calculateLayout(containerWidth, containerHeight, Yoga.DIRECTION_LTR);
        }
      }

      // Extract computed metrics
      const metrics = this.extractMetrics(yogaRoot, node);

      // Cache result
      this.cache.setLayoutMetrics(node, cacheKey, metrics);
      node.cachedLayoutMetrics = metrics;
      node.isLayoutDirty = false;

      return metrics;
    } finally {
      // Always free Yoga tree to prevent memory leaks
      this.freeYogaTree(yogaRoot);
    }
  }

  /**
   * Update text heights based on computed widths (Pass 2)
   */
  updateTextHeights(yogaNode, tuiNode) {
    let updated = false;

    if (tuiNode.type === 'textbox') {
      const computedWidth = yogaNode.getComputedWidth();
      const textContent = extractTextContent(tuiNode);
      const newHeight = calculateTextHeight(textContent, computedWidth);
      const currentHeight = yogaNode.getComputedHeight();

      if (newHeight !== currentHeight && Math.abs(newHeight - currentHeight) > 0.5) {
        yogaNode.setHeight(newHeight);
        updated = true;
      }
    }

    const children = tuiNode.children;
    if (children && children.length > 0) {
      let yogaChildIndex = 0;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type !== 'comment') {
          const yogaChild = yogaNode.getChild(yogaChildIndex);
          if (yogaChild && this.updateTextHeights(yogaChild, child)) {
            updated = true;
          }
          yogaChildIndex++;
        }
      }
    }

    return updated;
  }

  /**
   * Restore cached metrics to node tree
   */
  restoreCachedMetrics(node, metrics) {
    if (node.cachedLayoutMetrics === metrics) return;

    node.cachedLayoutMetrics = metrics;

    const children = node.children;
    const metricChildren = metrics.children;
    if (metricChildren && children) {
      let metricIndex = 0;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type !== 'comment') {
          const childMetric = metricChildren[metricIndex];
          if (childMetric) {
            this.restoreCachedMetrics(child, childMetric);
          }
          metricIndex++;
        }
      }
    }
  }

  /**
   * Determine the component type for handler lookup
   * Handles special cases like flexDirection overrides
   */
  _getComponentType(tuiNode, props) {
    // Check for flexDirection override
    if (props.flexDirection === 'row') return 'row';
    if (props.flexDirection === 'column') return 'col';
    return tuiNode.type;
  }

  /**
   * Apply flex properties to Yoga node
   */
  _applyFlexProperties(yogaNode, props) {
    // Flex shorthand
    if (props.flex !== undefined) {
      if (typeof props.flex === 'number') {
        yogaNode.setFlexGrow(props.flex);
        yogaNode.setFlexShrink(1);
      } else if (typeof props.flex === 'string') {
        const parts = props.flex.split(/\s+/);
        if (parts.length === 1 && !isNaN(parseFloat(parts[0]))) {
          const value = parseFloat(parts[0]);
          yogaNode.setFlexGrow(value);
          yogaNode.setFlexShrink(1);
          if (value !== 0) {
            yogaNode.setFlexBasis(0);
          }
        } else {
          if (parts[0]) yogaNode.setFlexGrow(parseFloat(parts[0]) || 0);
          if (parts[1]) yogaNode.setFlexShrink(parseFloat(parts[1]) || 1);
          if (parts[2] && parts[2] !== 'auto') {
            yogaNode.setFlexBasis(parseFloat(parts[2]) || 0);
          }
        }
      }
    }

    // Individual flex properties
    if (props.flexGrow !== undefined && props.flexGrow !== null) {
      yogaNode.setFlexGrow(props.flexGrow);
    }
    if (props.flexShrink !== undefined && props.flexShrink !== null) {
      yogaNode.setFlexShrink(props.flexShrink);
    }
    if (props.flexBasis !== undefined && props.flexBasis !== null) {
      yogaNode.setFlexBasis(props.flexBasis);
    }

    // Justify content
    if (props.justifyContent) {
      const justifyMap = {
        'flex-start': Yoga.JUSTIFY_FLEX_START,
        'flex-end': Yoga.JUSTIFY_FLEX_END,
        'center': Yoga.JUSTIFY_CENTER,
        'space-between': Yoga.JUSTIFY_SPACE_BETWEEN,
        'space-around': Yoga.JUSTIFY_SPACE_AROUND,
        'space-evenly': Yoga.JUSTIFY_SPACE_EVENLY,
      };
      const justifyValue = justifyMap[props.justifyContent];
      if (justifyValue !== undefined) {
        yogaNode.setJustifyContent(justifyValue);
      }
    }

    // Align items
    if (props.alignItems) {
      const alignMap = {
        'flex-start': Yoga.ALIGN_FLEX_START,
        'flex-end': Yoga.ALIGN_FLEX_END,
        'center': Yoga.ALIGN_CENTER,
        'stretch': Yoga.ALIGN_STRETCH,
        'baseline': Yoga.ALIGN_BASELINE,
      };
      const alignValue = alignMap[props.alignItems];
      if (alignValue !== undefined) {
        yogaNode.setAlignItems(alignValue);
      }
    }

    // Align self
    if (props.alignSelf) {
      const alignSelfMap = {
        'auto': Yoga.ALIGN_AUTO,
        'flex-start': Yoga.ALIGN_FLEX_START,
        'flex-end': Yoga.ALIGN_FLEX_END,
        'center': Yoga.ALIGN_CENTER,
        'stretch': Yoga.ALIGN_STRETCH,
        'baseline': Yoga.ALIGN_BASELINE,
      };
      const alignSelfValue = alignSelfMap[props.alignSelf];
      if (alignSelfValue !== undefined) {
        yogaNode.setAlignSelf(alignSelfValue);
      }
    }

    // Flex wrap
    if (props.responsive) {
      yogaNode.setFlexWrap(Yoga.WRAP_WRAP);
    } else if (props.flexWrap) {
      const wrapMap = {
        'wrap': Yoga.WRAP_WRAP,
        'nowrap': Yoga.WRAP_NO_WRAP,
        'wrap-reverse': Yoga.WRAP_WRAP_REVERSE,
      };
      const wrapValue = wrapMap[props.flexWrap];
      if (wrapValue !== undefined) {
        yogaNode.setFlexWrap(wrapValue);
      }
    }

    // Align content
    if (props.alignContent) {
      const alignContentMap = {
        'flex-start': Yoga.ALIGN_FLEX_START,
        'flex-end': Yoga.ALIGN_FLEX_END,
        'center': Yoga.ALIGN_CENTER,
        'stretch': Yoga.ALIGN_STRETCH,
        'space-between': Yoga.ALIGN_SPACE_BETWEEN,
        'space-around': Yoga.ALIGN_SPACE_AROUND,
      };
      const alignContentValue = alignContentMap[props.alignContent];
      if (alignContentValue !== undefined) {
        yogaNode.setAlignContent(alignContentValue);
      }
    }
  }

  /**
   * Apply padding properties to Yoga node
   */
  _applyPaddingProperties(yogaNode, props) {
    // General padding
    if (props.padding !== undefined && props.padding !== null) {
      yogaNode.setPadding(Yoga.EDGE_ALL, props.padding);
    }
    // Specific padding edges override the general padding
    if (props.paddingLeft !== undefined && props.paddingLeft !== null) {
      yogaNode.setPadding(Yoga.EDGE_LEFT, props.paddingLeft);
    }
    if (props.paddingRight !== undefined && props.paddingRight !== null) {
      yogaNode.setPadding(Yoga.EDGE_RIGHT, props.paddingRight);
    }
    if (props.paddingTop !== undefined && props.paddingTop !== null) {
      yogaNode.setPadding(Yoga.EDGE_TOP, props.paddingTop);
    }
    if (props.paddingBottom !== undefined && props.paddingBottom !== null) {
      yogaNode.setPadding(Yoga.EDGE_BOTTOM, props.paddingBottom);
    }
  }

  /**
   * Apply margin properties to Yoga node
   */
  _applyMarginProperties(yogaNode, props, parentGap, childIndex, isRow, isCol) {
    if (props.margin !== undefined) {
      const currentLeft = parentGap > 0 && childIndex > 0 && isRow ? parentGap : 0;
      const currentTop = parentGap > 0 && childIndex > 0 && isCol ? parentGap : 0;

      yogaNode.setMargin(Yoga.EDGE_LEFT, currentLeft + props.margin);
      yogaNode.setMargin(Yoga.EDGE_RIGHT, props.margin);
      yogaNode.setMargin(Yoga.EDGE_TOP, currentTop + props.margin);
      yogaNode.setMargin(Yoga.EDGE_BOTTOM, props.margin);
    } else {
      if (props.marginLeft !== undefined) {
        const currentLeft = parentGap > 0 && childIndex > 0 && isRow ? parentGap : 0;
        yogaNode.setMargin(Yoga.EDGE_LEFT, currentLeft + props.marginLeft);
      }
      if (props.marginRight !== undefined) yogaNode.setMargin(Yoga.EDGE_RIGHT, props.marginRight);
      if (props.marginTop !== undefined) {
        const currentTop = parentGap > 0 && childIndex > 0 && isCol ? parentGap : 0;
        yogaNode.setMargin(Yoga.EDGE_TOP, currentTop + props.marginTop);
      }
      if (props.marginBottom !== undefined) yogaNode.setMargin(Yoga.EDGE_BOTTOM, props.marginBottom);
    }
  }

  /**
   * Build Yoga node tree from TUINode tree
   */
  buildYogaTree(tuiNode, containerWidth, containerHeight, parentNode = null, childIndex = 0, siblingCount = 0) {
    const yogaNode = Yoga.Node.create();
    const props = tuiNode.props || {};
    const parentProps = parentNode?.props || {};

    const parentGap = parentProps.gap || 0;
    const isRow = parentNode?.type === 'row' || parentProps.flexDirection === 'row';
    const isCol = parentNode?.type === 'col' || parentProps.flexDirection === 'column';

    // Apply gap as margin on children (except first child)
    if (parentGap > 0 && childIndex > 0) {
      if (isRow) {
        yogaNode.setMargin(Yoga.EDGE_LEFT, parentGap);
      } else if (isCol) {
        yogaNode.setMargin(Yoga.EDGE_TOP, parentGap);
      }
    }

    // Apply common flex/layout properties FIRST (so handlers can override)
    this._applyFlexProperties(yogaNode, props);
    this._applyPaddingProperties(yogaNode, props);
    this._applyMarginProperties(yogaNode, props, parentGap, childIndex, isRow, isCol);

    // Apply dimension properties for explicit width/height (but handlers override height for complex components)
    // Width is applied here, but height will be applied by handlers if needed
    if (props.width != null) {
      if (typeof props.width === 'string' && props.width.endsWith('%')) {
        yogaNode.setWidthPercent(parseFloat(props.width));
      } else {
        yogaNode.setWidth(props.width);
      }
    }

    // Min/Max dimensions
    if (props.minWidth !== undefined) yogaNode.setMinWidth(props.minWidth);
    if (props.maxWidth !== undefined) yogaNode.setMaxWidth(props.maxWidth);
    if (props.minHeight !== undefined) yogaNode.setMinHeight(props.minHeight);
    if (props.maxHeight !== undefined) yogaNode.setMaxHeight(props.maxHeight);

    // Apply component-specific layout using handlers (can override dimensions)
    const componentType = this._getComponentType(tuiNode, props);
    const handler = componentHandlerRegistry.get(componentType);
    if (handler) {
      const metadata = handler.applyLayout(yogaNode, tuiNode, {
        containerWidth,
        containerHeight,
        parentNode,
        childIndex,
        siblingCount
      });
      // Track metadata (e.g., hasTextBoxes)
      if (metadata.hasTextBoxes) {
        this._hasTextBoxes = true;
      }
    }

    // Apply explicit height from props ONLY if handler didn't set height
    // This handles generic components that don't have specific handlers
    if (props.height !== undefined && !handler) {
      if (typeof props.height === 'string' && props.height.endsWith('%')) {
        yogaNode.setHeightPercent(parseFloat(props.height));
      } else {
        yogaNode.setHeight(props.height);
      }
    }

    // Default flex behavior for Col (if not already set AND no explicit height)
    // Don't auto-flex if height is explicitly set
    if (props.flex === undefined && tuiNode.type === 'col' && props.height === undefined) {
      yogaNode.setFlexGrow(1);
      yogaNode.setFlexShrink(1);
      yogaNode.setFlexBasis(0);
    }

    // Calculate available width for children
    let childContainerWidth = containerWidth;
    if (tuiNode.type === 'box') {
      const border = props.border;
      const hasBorder = border !== false;
      const borderWidth = hasBorder ? 2 : 0;
      const paddingWidth = (props.padding || 0) * 2;
      const boxWidth = props.width || props._injectedWidth || containerWidth;
      childContainerWidth = Math.max(0, boxWidth - borderWidth - paddingWidth);
    }
    if ((tuiNode.type === 'col' || tuiNode.type === 'row') && props.width) {
      childContainerWidth = props.width;
    }

    // Calculate available height for children
    let childContainerHeight = containerHeight;
    if (tuiNode.type === 'box') {
      const border = props.border;
      const hasBorder = border !== false;
      const borderHeight = hasBorder ? 2 : 0;
      const paddingHeight = (props.padding || 0) * 2;
      const boxHeight = props.height || props._injectedHeight || containerHeight;
      childContainerHeight = Math.max(0, boxHeight - borderHeight - paddingHeight);
    }
    if ((tuiNode.type === 'col' || tuiNode.type === 'row') && props.height) {
      childContainerHeight = props.height;
    }

    // Build children
    let childCount = 0;
    for (let i = 0; i < tuiNode.children.length; i++) {
      if (tuiNode.children[i].type !== 'comment') childCount++;
    }
    let actualChildIndex = 0;

    for (const child of tuiNode.children) {
      if (child.type !== 'comment') {
        const yogaChild = this.buildYogaTree(
          child,
          childContainerWidth,
          childContainerHeight,
          tuiNode,
          actualChildIndex,
          childCount
        );
        yogaNode.insertChild(yogaChild, actualChildIndex);
        actualChildIndex++;
      }
    }

    return yogaNode;
  }

  /**
   * Extract computed layout metrics from Yoga node
   * Reuse metrics object structure
   */
  extractMetrics(yogaNode, tuiNode) {
    const layout = yogaNode.getComputedLayout();

    const tuiChildren = tuiNode.children;
    let childCount = 0;
    if (tuiChildren) {
      for (let i = 0; i < tuiChildren.length; i++) {
        if (tuiChildren[i].type !== 'comment') childCount++;
      }
    }

    // Create metrics object
    const metrics = {
      width: Math.round(layout.width),
      height: Math.round(layout.height),
      x: Math.round(layout.left),
      y: Math.round(layout.top),
      children: childCount > 0 ? new Array(childCount) : []
    };

    if (tuiChildren && childCount > 0) {
      let nonCommentIndex = 0;
      for (let i = 0; i < tuiChildren.length; i++) {
        const child = tuiChildren[i];
        if (child.type !== 'comment') {
          const yogaChild = yogaNode.getChild(nonCommentIndex);
          const childMetrics = this.extractMetrics(yogaChild, child);
          metrics.children[nonCommentIndex] = childMetrics;
          child.cachedLayoutMetrics = childMetrics;
          nonCommentIndex++;
        }
      }
    }

    return metrics;
  }

  /**
   * Free Yoga node tree to prevent memory leaks
   */
  freeYogaTree(yogaNode) {
    if (!yogaNode) return;

    const childCount = yogaNode.getChildCount();
    for (let i = childCount - 1; i >= 0; i--) {
      const child = yogaNode.getChild(i);
      this.freeYogaTree(child);
    }

    yogaNode.freeRecursive();
  }

  /**
   * Invalidate layout cache for a node and its descendants
   * Uses iterative approach to avoid stack overflow on deep trees
   */
  invalidateLayout(node) {
    if (!node) return;

    // Use iterative BFS to avoid stack overflow
    const queue = [node];
    let processed = 0;
    const MAX_NODES = 10000; // Safety limit

    while (queue.length > 0 && processed < MAX_NODES) {
      const current = queue.shift();
      processed++;

      current.isLayoutDirty = true;
      this.cache.invalidateLayoutMetrics(current);

      const children = current.children;
      if (children) {
        for (let i = 0; i < children.length; i++) {
          queue.push(children[i]);
        }
      }
    }
  }

  /**
   * Clear entire layout cache
   */
  clearCache() {
    this.cache.clearAll();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }
}
