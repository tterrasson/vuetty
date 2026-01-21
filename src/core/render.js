// src/core/render.js
import { canSkipRender, cacheOutput, renderChildrenCached } from './memoization.js';
import {
  registerClickRegion,
  isPositionTrackingEnabled,
  startPositionTracking,
  stopPositionTracking
} from './renderContext.js';
import { getTerminalWidth } from '@utils/renderUtils.js';
import { renderHandlerRegistry, RenderContext } from './renderHandlers.js';

// Import all components to trigger their auto-registration
import '@components/Divider.js';
import '@components/Spinner.js';
import '@components/Spacer.js';
import '@components/Newline.js';
import '@components/ProgressBar.js';
import '@components/Table.js';
import '@components/Image.js';
import '@components/Tree.js';
import '@components/Box.js';
import '@components/TextBox.js';
import '@components/BigText.js';
import '@components/Gradient.js';
import '@components/TextInput.js';
import '@components/SelectInput.js';
import '@components/Checkbox.js';
import '@components/Radiobox.js';
import '@components/Button.js';
import './flexRenderers.js';

// ============================================================
// Render Stats
// ============================================================
export const renderStats = {
  totalNodes: 0,
  skippedNodes: 0,
  lastRenderTime: 0
};

// ============================================================
// Utility Functions
// ============================================================

function countLines(str) {
  if (!str) return 0;
  let count = 1;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 10) count++;
  }
  return count;
}

function calculateOutputDimensions(output) {
  if (!output) return { width: 0, height: 0 };

  const lines = output.split('\n');
  const height = lines.length;

  let maxWidth = 0;
  for (const line of lines) {
    const lineWidth = getTerminalWidth(line);
    if (lineWidth > maxWidth) {
      maxWidth = lineWidth;
    }
  }

  return { width: maxWidth, height };
}

/**
 * Register a clickable node
 */
function registerClickableNode(node, absX, absY, depth, output = null) {
  if (!isPositionTrackingEnabled()) return;

  const props = node.props || {};
  const isClickable = props._clickable || node.clickable;
  const componentId = props._componentId || node.componentId;

  if (!isClickable || !componentId) return;

  let width = 0;
  let height = 0;

  // Always calculate dimensions from output if available (most accurate)
  if (output) {
    const dims = calculateOutputDimensions(output);
    width = dims.width;
    height = dims.height;
  } else {
    // Fallback to cached metrics only if no output
    const metrics = node.cachedLayoutMetrics;
    width = metrics?.width || 0;
    height = metrics?.height || 0;
  }

  if (width > 0 && height > 0) {
    registerClickRegion({
      componentId,
      x: Math.round(absX),
      y: Math.round(absY),
      width: Math.round(width),
      height: Math.round(height),
      depth,
      nodeType: node.type
    });
  }
}

// ============================================================
// Main Render Function
// ============================================================

/**
 * Render a node to string
 *
 * @param {TUINode} node - Node to render
 * @param {number} depth - Current render depth
 * @param {Object} options - Render options
 * @param {number} options.parentAbsX - Parent's absolute X (DON'T add node's relX, we do it here)
 * @param {number} options.parentAbsY - Parent's absolute Y
 * @param {number} options.yOffset - Additional Y offset from parent (for gaps/padding)
 * @param {boolean} options.inRow - Whether inside a Row
 */
export function renderNode(node, depth = 0, options = {}) {
  if (!node) return '';

  const {
    parentAbsX = 0,
    parentAbsY = 0,
    yOffset = 0,
    inRow = false
  } = options;

  renderStats.totalNodes++;

  if (node.type === 'comment') return '';

  // Get Yoga metrics for this node
  const metrics = node.cachedLayoutMetrics;
  const relX = metrics?.x || 0;

  // Calculate absolute position
  // parentAbsX is the parent's absolute X, we add this node's relative X
  const absX = parentAbsX + relX;
  const absY = parentAbsY + yOffset;

  // Memoization check
  if (canSkipRender(node)) {
    renderStats.skippedNodes++;

    const cachedOutput = node.cachedOutput;

    // Register at calculated position
    registerClickableNode(node, absX, absY, depth, cachedOutput);

    return cachedOutput;
  }

  // Create render context
  const ctx = new RenderContext({
    node,
    depth,
    absX,
    absY,
    inRow,
    renderNodeFn: renderNode
  });

  // Get handler for this node type
  const handler = renderHandlerRegistry.get(node.type);
  let output;

  if (handler) {
    output = handler.render(ctx);
  } else {
    // Default fallback: render children or text
    let innerYOffset = 0;
    const childrenOutput = renderChildrenCached(node, (child) => {
      const childOut = renderNode(child, depth + 1, {
        parentAbsX: absX,
        parentAbsY: absY,
        yOffset: innerYOffset,
        inRow
      });

      innerYOffset += countLines(childOut);
      return childOut;
    });
    output = node.text || childrenOutput;
  }

  // Track rendered height
  node.actualRenderedHeight = countLines(output);

  // Register clickable region
  registerClickableNode(node, absX, absY, depth, output);

  cacheOutput(node, output);
  return output;
}

/**
 * Main render function
 */
export function renderToString(root) {
  if (!root) return '';

  renderStats.totalNodes = 0;
  renderStats.skippedNodes = 0;

  const startTime = performance.now();

  // Start tracking click regions
  startPositionTracking();

  // Render tree
  let result;
  if (root.children?.length > 0) {
    const outputs = [];
    let cumulativeY = 0;

    for (const child of root.children) {
      if (child.type === 'comment') continue;

      // Don't add child's relX here - renderNode will do it
      const output = renderNode(child, 0, {
        parentAbsX: 0,
        parentAbsY: 0,
        yOffset: cumulativeY,
        inRow: false
      });

      if (output) {
        outputs.push(output);
        cumulativeY += countLines(output);
      }
    }

    result = outputs.join('\n');
  } else {
    result = renderNode(root, 0, {
      parentAbsX: 0,
      parentAbsY: 0,
      yOffset: 0,
      inRow: false
    });
  }

  // Stop tracking and store regions
  const clickRegions = stopPositionTracking();
  root._clickRegions = clickRegions;

  renderStats.lastRenderTime = performance.now() - startTime;

  return result.endsWith('\n') ? result : result + '\n';
}

export function getRenderStats() {
  return { ...renderStats };
}
