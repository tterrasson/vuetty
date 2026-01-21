// src/core/flexLayout.js
import { getTerminalWidth } from '@utils/renderUtils.js';

/**
 * Parse flex shorthand property into {grow, shrink, basis}
 * Examples:
 *   "1" → {grow: 1, shrink: 1, basis: 0}
 *   "0 1 auto" → {grow: 0, shrink: 1, basis: 'auto'}
 *   "2 0 50" → {grow: 2, shrink: 0, basis: 50}
 */
export function parseFlexShorthand(flex) {
  if (flex === null || flex === undefined) {
    return { grow: 0, shrink: 1, basis: 'auto' };
  }

  // If it's a number, treat as flex-grow only
  if (typeof flex === 'number') {
    // Special case: flex: 0 means "don't grow, use intrinsic size"
    // CSS spec: flex: 0 === flex: 0 1 auto (not flex: 0 1 0)
    if (flex === 0) {
      return { grow: 0, shrink: 1, basis: 'auto' };
    }
    // For other numbers (1, 2, etc.), use basis: 0 to distribute space
    return { grow: flex, shrink: 1, basis: 0 };
  }

  // Parse string format
  const parts = String(flex).trim().split(/\s+/);

  if (parts.length === 1) {
    const value = parseFloat(parts[0]);
    if (!isNaN(value)) {
      // Special case: "0" means "don't grow, use intrinsic size"
      if (value === 0) {
        return { grow: 0, shrink: 1, basis: 'auto' };
      }
      return { grow: value, shrink: 1, basis: 0 };
    }
    return { grow: 0, shrink: 1, basis: parts[0] };
  }

  if (parts.length === 2) {
    const grow = parseFloat(parts[0]);
    const shrink = parseFloat(parts[1]);
    return {
      grow: !isNaN(grow) ? grow : 0,
      shrink: !isNaN(shrink) ? shrink : 1,
      basis: 0
    };
  }

  if (parts.length >= 3) {
    const grow = parseFloat(parts[0]);
    const shrink = parseFloat(parts[1]);
    const basisStr = parts[2];
    const basisNum = parseFloat(basisStr);

    return {
      grow: !isNaN(grow) ? grow : 0,
      shrink: !isNaN(shrink) ? shrink : 1,
      basis: !isNaN(basisNum) ? basisNum : basisStr
    };
  }

  return { grow: 0, shrink: 1, basis: 'auto' };
}

/**
 * Measure children by pre-rendering them
 * Returns array of { node, width, height, lines, rendered }
 */
export function measureChildren(children, renderFn) {
  return children
    .filter(child => child && child.type !== 'comment')
    .map(child => {
      const rendered = renderFn(child);
      const lines = rendered.split('\n').filter(l => l.length > 0);
      const width = Math.max(0, ...lines.map(l => getTerminalWidth(l)));
      const height = lines.length;

      return {
        node: child,
        width,
        height,
        lines,
        rendered
      };
    });
}
