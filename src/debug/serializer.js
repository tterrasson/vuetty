// src/debug/serializer.js

/**
 * Serialize TUINode tree to JSON for debug inspection
 */
export function serializeNodeTree(node, depth = 0, maxDepth = 5) {
  if (!node || depth > maxDepth) {
    return null;
  }

  const serialized = {
    type: node.type,
    text: node.text || null,
    isDirty: node.isDirty || false,
    isLayoutDirty: node.isLayoutDirty || false
  };

  // Include props (but filter out complex values)
  if (node.props && Object.keys(node.props).length > 0) {
    serialized.props = {};
    for (const [key, value] of Object.entries(node.props)) {
      // Only include primitive values
      if (value === null || value === undefined ||
          typeof value === 'string' || typeof value === 'number' ||
          typeof value === 'boolean') {
        serialized.props[key] = value;
      } else if (Array.isArray(value)) {
        serialized.props[key] = `[Array(${value.length})]`;
      } else if (typeof value === 'object') {
        serialized.props[key] = '[Object]';
      } else if (typeof value === 'function') {
        serialized.props[key] = '[Function]';
      }
    }
  }

  // Include layout metrics if available
  if (node.cachedLayoutMetrics) {
    serialized.layout = {
      x: node.cachedLayoutMetrics.left || 0,
      y: node.cachedLayoutMetrics.top || 0,
      width: node.cachedLayoutMetrics.width || 0,
      height: node.cachedLayoutMetrics.height || 0
    };
  }

  // Include children recursively
  if (node.children && node.children.length > 0) {
    serialized.children = node.children
      .map(child => serializeNodeTree(child, depth + 1, maxDepth))
      .filter(child => child !== null);
  }

  return serialized;
}

/**
 * Serialize viewport state
 */
export function serializeViewport(viewport) {
  if (!viewport) {
    return null;
  }

  return {
    scrollOffset: viewport.scrollOffset || 0,
    contentHeight: viewport.contentHeight || 0,
    terminalHeight: viewport.terminalHeight || 0,
    terminalWidth: viewport.terminalWidth || 0,
    autoScrollToBottom: viewport.autoScrollToBottom !== false,
    mouseWheelEnabled: viewport.mouseWheelEnabled !== false,
    mouseWheelScrollLines: viewport.mouseWheelScrollLines || 3,
    scrollIndicatorMode: viewport.scrollIndicatorMode || 'reserved',
    mouseTrackingEnabled: viewport.mouseTrackingEnabled !== false
  };
}
