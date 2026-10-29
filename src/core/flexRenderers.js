// src/core/flexRenderers.js

import { getTerminalWidth } from '@utils/renderUtils.js';
import { adjustToHeight } from '@utils/heightUtils.js';
import { RenderHandler, renderHandlerRegistry } from './renderHandlers.js';

/**
 * Render a flex row (horizontal layout)
 * @param {TUINode} node - Row node
 * @param {number} depth - Rendering depth
 * @param {Function} renderNode - Render function: (child, depth, options) => string
 *                                options.rowY = Y position for this row
 * @returns {string} Rendered output
 */
export function renderFlexRow(node, depth, renderNode) {
  const {
    paddingTop,
    paddingBottom,
    padding = 0
  } = node.props || {};

  const effectivePaddingTop = paddingTop !== undefined && paddingTop !== null ? paddingTop : (padding || 0);
  const effectivePaddingBottom =
    paddingBottom !== undefined && paddingBottom !== null
      ? paddingBottom
      : (padding || 0);

  if (!node.children || node.children.length === 0) {
    if (effectivePaddingTop > 0 || effectivePaddingBottom > 0) {
      const emptyLines = [];
      for (let i = 0; i < effectivePaddingTop + effectivePaddingBottom; i++) {
        emptyLines.push('');
      }
      return emptyLines.join('\n');
    }
    return '';
  }

  const metrics = node.cachedLayoutMetrics || { children: [] };
  const children = node.children;
  const len = children.length;

  const items = [];
  let childIndex = 0;

  for (let i = 0; i < len; i++) {
    const child = children[i];
    if (child.type === 'comment') continue;

    const childMetrics = metrics.children[childIndex++];

    if (!childMetrics) {
      // Pass yOffset for click tracking (padding top offset)
      items.push({
        rendered: renderNode(child, depth + 1, { yOffset: effectivePaddingTop }),
        x: 0,
        width: 0,
        height: 1,
        y: 0
      });
      continue;
    }

    const shouldConstrainWidth = childMetrics.width > 0 && (
      child.type === 'col' ||
      child.type === 'box' ||
      child.props.flex !== undefined ||
      child.props.width !== undefined
    );

    // Pass yOffset to callback for accurate Y tracking
    const rendered = shouldConstrainWidth
      ? renderNodeWithConstrainedWidth(
          child,
          childMetrics.width,
          depth + 1,
          renderNode,
          { yOffset: effectivePaddingTop }
        )
      : renderNode(child, depth + 1, { yOffset: effectivePaddingTop });

    items.push({
      rendered,
      x: childMetrics.x,
      y: childMetrics.y,
      width: childMetrics.width,
      height: childMetrics.height
    });
  }

  const flexWrap = node.props?.flexWrap || 'nowrap';
  const responsive = node.props?.responsive;
  const wrapEnabled = flexWrap === 'wrap' || flexWrap === 'wrap-reverse' || responsive;

  let result;
  if (wrapEnabled && items.length > 1) {
    const rows = groupItemsByRow(items);
    if (rows.length > 1) {
      result = renderMultipleRows(rows);
    } else {
      result = renderSingleRow(items);
    }
  } else {
    result = renderSingleRow(items);
  }

  return applyVerticalPadding(result, effectivePaddingTop, effectivePaddingBottom);
}

/**
 * Render a flex column (vertical layout with Yoga)
 * @param {TUINode} node - Col node
 * @param {number} depth - Rendering depth
 * @param {Function} renderNode - Render function: (child, depth, options) => string
 *                                options.yOffset = cumulative Y offset including gaps
 * @returns {string} Rendered output
 */
export function renderFlexCol(node, depth, renderNode) {
  const {
    gap = 0,
    paddingTop,
    paddingBottom,
    padding = 0
  } = node.props || {};

  const effectivePaddingTop = paddingTop !== undefined && paddingTop !== null ? paddingTop : (padding || 0);
  const effectivePaddingBottom =
    paddingBottom !== undefined && paddingBottom !== null
      ? paddingBottom
      : (padding || 0);

  if (!node.children || node.children.length === 0) {
    if (effectivePaddingTop > 0 || effectivePaddingBottom > 0) {
      const emptyLines = [];
      for (let i = 0; i < effectivePaddingTop + effectivePaddingBottom; i++) {
        emptyLines.push('');
      }
      return emptyLines.join('\n');
    }
    return '';
  }

  const explicitWidth = node.props?.width;
  const injectedWidth = node.props?._injectedWidth;
  const renderWidth = node._renderWidth;
  const parentWidth = explicitWidth !== null && explicitWidth !== undefined
    ? explicitWidth
    : (renderWidth !== undefined ? renderWidth : injectedWidth);

  const metrics = node.cachedLayoutMetrics || { children: [] };

  const outputs = [];
  let childIndex = 0;

  // Track cumulative Y offset including gaps and padding
  let cumulativeY = effectivePaddingTop;

  for (const child of node.children) {
    if (child.type === 'comment') continue;

    const childMetrics = metrics.children[childIndex];
    childIndex++;

    // Add gap before this child (except first)
    if (outputs.length > 0 && gap > 0) {
      cumulativeY += gap;
    }

    if (!childMetrics) {
      const rendered = renderNode(child, depth + 1, { yOffset: cumulativeY });
      outputs.push(rendered);
      cumulativeY += countLinesSimple(rendered);
      continue;
    }

    const childProps = child.props || {};

    const shouldConstrainHeight = childMetrics.height > 0 && (
      childProps.flex !== undefined ||
      childProps.flexGrow !== undefined ||
      childProps.height !== undefined ||
      childProps._injectedHeight !== undefined ||
      child.type === 'col' ||
      child.type === 'row'
    );

    const childWidth = parentWidth !== null && parentWidth !== undefined
      ? parentWidth
      : childMetrics.width;

    const hasTargetHeightInjection = shouldConstrainHeight && (child.type === 'box' || child.type === 'row');

    if (hasTargetHeightInjection) {
      const originalTargetHeight = child.props._targetHeight;
      const hadTargetHeight = '_targetHeight' in child.props;
      child.props._targetHeight = childMetrics.height;

      if (originalTargetHeight !== childMetrics.height && child.cachedOutput !== null) {
        child.isDirty = true;
        child.cachedOutput = null;
      }

      let rendered;
      try {
        // Pass yOffset for accurate click tracking
        rendered = renderNodeWithDimensions(child, childWidth, depth + 1, renderNode, { yOffset: cumulativeY });
      } finally {
        if (hadTargetHeight) {
          child.props._targetHeight = originalTargetHeight;
        } else {
          delete child.props._targetHeight;
        }
      }

      outputs.push(rendered);
      cumulativeY += countLinesSimple(rendered);
      continue;
    }

    // Pass yOffset for accurate click tracking
    const rendered = renderNodeWithDimensions(child, childWidth, depth + 1, renderNode, { yOffset: cumulativeY });

    const finalOutput = (shouldConstrainHeight && !hasTargetHeightInjection)
      ? adjustToHeight(rendered, childMetrics.height)
      : rendered;

    outputs.push(finalOutput);
    cumulativeY += countLinesSimple(finalOutput);
  }

  // Join with gap
  let result;
  if (gap > 0) {
    const separator = '\n' + '\n'.repeat(gap);
    result = outputs.join(separator);
  } else {
    result = outputs.join('\n');
  }

  return applyVerticalPadding(result, effectivePaddingTop, effectivePaddingBottom);
}

function countLinesSimple(str) {
  if (!str) return 0;
  let count = 1;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 10) count++;
  }
  return count;
}

// Helper functions

// Apply vertical padding around already-rendered content
function applyVerticalPadding(result, paddingTop, paddingBottom) {
  if (paddingTop <= 0 && paddingBottom <= 0) return result;

  const lines = result ? result.split('\n') : [];

  for (let i = 0; i < paddingTop; i++) {
    lines.unshift('');
  }

  for (let i = 0; i < paddingBottom; i++) {
    lines.push('');
  }

  return lines.join('\n');
}

// Merge horizontally-positioned rendered items into output lines
function mergeRowItemsToLines(items) {
  const len = items.length;

  const itemLines = new Array(len);
  let maxHeight = 0;

  for (let i = 0; i < len; i++) {
    const lines = items[i].rendered.split('\n');
    itemLines[i] = { lines, x: items[i].x };
    if (lines.length > maxHeight) maxHeight = lines.length;
  }

  const outputLines = new Array(maxHeight);

  for (let lineIndex = 0; lineIndex < maxHeight; lineIndex++) {
    let line = '';
    let currentX = 0;

    for (let i = 0; i < len; i++) {
      const item = itemLines[i];
      const contentLine = item.lines[lineIndex] || '';
      const targetX = item.x;

      if (targetX > currentX) {
        line += ' '.repeat(targetX - currentX);
        currentX = targetX;
      }

      line += contentLine;
      currentX += getTerminalWidth(contentLine);
    }

    outputLines[lineIndex] = line;
  }

  return outputLines;
}

function groupItemsByRow(items) {
  if (items.length === 0) return [];

  const sorted = items.slice().sort((a, b) => a.y - b.y);

  const rows = [];
  let currentRow = [sorted[0]];
  let currentRowBottom = sorted[0].y + (sorted[0].height || 1);

  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    const itemHeight = item.height || 1;

    if (item.y >= currentRowBottom) {
      rows.push(currentRow);
      currentRow = [item];
      currentRowBottom = item.y + itemHeight;
    } else {
      currentRow.push(item);
      currentRowBottom = Math.max(currentRowBottom, item.y + itemHeight);
    }
  }
  rows.push(currentRow);

  return rows;
}

function renderMultipleRows(rows) {
  const allLines = [];

  for (let r = 0; r < rows.length; r++) {
    const rowItems = rows[r];
    rowItems.sort((a, b) => a.x - b.x);
    allLines.push(...mergeRowItemsToLines(rowItems));
  }

  return allLines.join('\n');
}

function renderSingleRow(items) {
  return mergeRowItemsToLines(items).join('\n');
}

function renderNodeWithConstrainedWidth(node, width, depth, renderNode, options = {}) {
  const prevRenderWidth = node._renderWidth;
  node._renderWidth = width;

  if (prevRenderWidth !== width && node.cachedOutput !== null) {
    node.isDirty = true;
    node.cachedOutput = null;
  }

  try {
    return renderNode(node, depth, options);
  } finally {
    node._renderWidth = prevRenderWidth;
  }
}

function renderNodeWithDimensions(node, width, depth, renderNode, options = {}) {
  const hasOriginalWidth = 'width' in node.props;
  const originalWidth = node.props.width;

  node.props.width = width;
  try {
    return renderNode(node, depth, options);
  } finally {
    if (hasOriginalWidth) {
      node.props.width = originalWidth;
    } else {
      delete node.props.width;
    }
  }
}

/**
 * Render handler for row
 */
class RowRenderHandler extends RenderHandler {
  render(ctx) {
    const { node, depth, absX } = ctx;

    return renderFlexRow(node, depth, (child, _d, childOptions = {}) => {
      const childYOffset = childOptions.yOffset || 0;

      return ctx.renderChild(child, {
        parentAbsX: absX,
        yOffset: childYOffset,
        inRow: true
      });
    });
  }
}

/**
 * Render handler for col
 */
class ColRenderHandler extends RenderHandler {
  render(ctx) {
    const { node, depth, absX } = ctx;

    return renderFlexCol(node, depth, (child, _d, childOptions = {}) => {
      const childYOffset = childOptions.yOffset || 0;

      return ctx.renderChild(child, {
        parentAbsX: absX,
        yOffset: childYOffset,
        inRow: false
      });
    });
  }
}

renderHandlerRegistry.register('row', new RowRenderHandler());
renderHandlerRegistry.register('col', new ColRenderHandler());
