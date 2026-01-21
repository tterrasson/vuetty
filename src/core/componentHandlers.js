// src/core/componentHandlers.js
/**
 * Component-specific layout handlers for Yoga tree building
 * Each handler encapsulates the layout logic for a specific component type
 */

import Yoga from 'yoga-layout';
import { getTerminalWidth } from '@utils/renderUtils.js';

/**
 * Calculate how many lines text will occupy when wrapped to a given width
 */
function calculateTextHeight(text, maxWidth) {
  if (!text) return 0;
  if (maxWidth <= 0) return 1;

  const hasNewlines = text.indexOf('\n') !== -1;
  if (!hasNewlines) {
    const textWidth = getTerminalWidth(text);
    if (textWidth <= maxWidth) return 1;
    return Math.ceil(textWidth / maxWidth);
  }

  const paragraphs = text.split('\n');
  let totalLines = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    if (paragraph.length === 0) {
      totalLines += 1;
      continue;
    }

    const textWidth = getTerminalWidth(paragraph);
    if (textWidth <= maxWidth) {
      totalLines += 1;
    } else {
      totalLines += Math.ceil(textWidth / maxWidth);
    }
  }

  return Math.max(1, totalLines);
}

/**
 * Calculate BigText height by estimating figlet output
 */
function calculateBigTextHeight(text, font) {
  if (!text) return 0;

  const fontHeights = {
    'Standard': 6, 'Big': 8, 'Slant': 6, 'Small': 5, 'Banner': 8,
    'Block': 8, 'Bubble': 7, 'Digital': 6, 'Ivrit': 6, 'Lean': 7,
    'Mini': 4, 'Script': 6, 'Shadow': 7, 'Smscript': 5, 'Smshadow': 6,
    'Smslant': 5, 'Terrace': 6, 'Thick': 6
  };

  return fontHeights[font] || 6;
}

/**
 * Extract text content from a TUI node's children
 */
function extractTextContent(node) {
  if (!node) return '';
  if (node.text) return node.text;
  if (node.props?.text) return node.props.text;

  const children = node.children;
  if (!children || children.length === 0) return '';

  // Single child optimization
  if (children.length === 1) {
    const child = children[0];
    if (typeof child === 'string') return child;
    if (child?.type === 'text') return child.text || '';
    return extractTextContent(child);
  }

  // Multiple children - reuse array if possible
  const parts = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (typeof child === 'string') {
      parts.push(child);
    } else if (child?.type === 'text') {
      if (child.text) parts.push(child.text);
    } else if (child) {
      const text = extractTextContent(child);
      if (text) parts.push(text);
    }
  }

  return parts.join('');
}

/**
 * Base class for component handlers
 * Subclasses can override applyLayout() to customize layout behavior
 */
class ComponentHandler {
  /**
   * Apply component-specific layout to the Yoga node
   * @param {YogaNode} yogaNode - The Yoga node to configure
   * @param {TUINode} tuiNode - The TUI node with props
   * @param {Object} context - Layout context (containerWidth, containerHeight, etc.)
   * @returns {Object} - Metadata (e.g., { hasTextBoxes: true })
   */
  applyLayout(yogaNode, tuiNode, context) {
    // Default: no-op
    return {};
  }
}

/**
 * Handler for root container
 */
class RootHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const { containerWidth, containerHeight } = context;
    yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
    yogaNode.setWidth(containerWidth);
    if (containerHeight && containerHeight !== Infinity) {
      yogaNode.setHeight(containerHeight);
      yogaNode.setMaxHeight(containerHeight); // Prevent root from exceeding terminal height
    }
    yogaNode.setAlignItems(Yoga.ALIGN_STRETCH);
    return {};
  }
}

/**
 * Handler for Row components
 */
class RowHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
    if (props.width === undefined || props.width === null) {
      yogaNode.setWidthPercent(100);
    }

    // Apply explicit height if specified
    if (props.height !== undefined) {
      if (typeof props.height === 'string' && props.height.endsWith('%')) {
        yogaNode.setHeightPercent(parseFloat(props.height));
      } else {
        yogaNode.setHeight(props.height);
        yogaNode.setMinHeight(props.height);
        yogaNode.setMaxHeight(props.height);
      }
    } else if (props._injectedHeight !== undefined && props._injectedHeight !== null) {
      // Use injected height from parent context
      yogaNode.setMaxHeight(props._injectedHeight);
      if (process.env.DEBUG_FLEX) {
        console.log(`[DEBUG] ${tuiNode.type}Handler: setting maxHeight=${props._injectedHeight} (from injected)`);
      }
    }

    return {};
  }
}

/**
 * Handler for Col components
 */
class ColHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);

    // Apply explicit height if specified
    const props = tuiNode.props || {};
    const { containerHeight } = context;

    if (props.height !== undefined) {
      if (typeof props.height === 'string' && props.height.endsWith('%')) {
        yogaNode.setHeightPercent(parseFloat(props.height));
      } else {
        // Set height, min-height and max-height to enforce the constraint
        // This prevents Yoga from expanding the container beyond the specified height
        yogaNode.setHeight(props.height);
        yogaNode.setMinHeight(props.height);
        yogaNode.setMaxHeight(props.height);
        if (process.env.DEBUG_FLEX) {
          console.log(`[DEBUG] ColHandler: setting height=${props.height} (min/max enforced)`);
        }
      }
    } else if (props._injectedHeight !== undefined && props._injectedHeight !== null) {
      // Use injected height from parent context
      yogaNode.setMaxHeight(props._injectedHeight);
      if (process.env.DEBUG_FLEX) {
        console.log(`[DEBUG] ColHandler: setting maxHeight=${props._injectedHeight} (from injected)`);
      }
    } else if (containerHeight && containerHeight !== Infinity) {
      // Use container height as constraint (from layout engine)
      // Set both height and maxHeight to enforce the limit
      yogaNode.setHeight(containerHeight);
      yogaNode.setMaxHeight(containerHeight);
      if (process.env.DEBUG_FLEX) {
        console.log(`[DEBUG] ColHandler: setting height+maxHeight=${containerHeight} (from containerHeight)`);
      }
    }

    return {};
  }
}

/**
 * Handler for Text nodes
 */
class TextHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const textContent = tuiNode.text || '';
    const textWidth = getTerminalWidth(textContent);
    yogaNode.setWidth(textWidth);
    yogaNode.setHeight(1);
    return {};
  }
}

/**
 * Handler for Textbox nodes
 */
class TextboxHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const { containerWidth } = context;
    const props = tuiNode.props || {};
    const textContent = extractTextContent(tuiNode);

    let availableWidth = containerWidth;
    if (props.width != null) {
      availableWidth = typeof props.width === 'string' && props.width.endsWith('%')
        ? Math.floor(containerWidth * parseFloat(props.width) / 100)
        : props.width;
    } else if (props._injectedWidth !== undefined && props._injectedWidth !== null) {
      availableWidth = props._injectedWidth;
    }

    const textHeight = calculateTextHeight(textContent, availableWidth);
    yogaNode.setHeight(textHeight);

    return { hasTextBoxes: true };
  }
}

/**
 * Handler for BigText nodes
 */
class BigTextHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    const textContent = extractTextContent(tuiNode);
    const font = props.font || 'Standard';
    const bigTextHeight = calculateBigTextHeight(textContent, font);
    yogaNode.setHeight(bigTextHeight);

    if (props.width === undefined && props.flex === undefined) {
      yogaNode.setWidthPercent(100);
    }
    return {};
  }
}

/**
 * Handler for Divider nodes
 */
class DividerHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    yogaNode.setHeight(1);
    if (props.length !== undefined) {
      yogaNode.setWidth(props.length);
    } else if (props.width === undefined && props.flex === undefined) {
      yogaNode.setWidthPercent(100);
    }
    return {};
  }
}

/**
 * Handler for Table nodes
 */
class TableHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    const label = props.label || '';
    const tableHeight = props.height || 10;
    const headers = props.headers || [];
    const rows = props.rows || [];
    const showHeader = props.showHeader !== false;
    const isFocused = props.isFocused || false;
    const disabled = props.disabled || false;

    if (headers.length === 0 && rows.length === 0) {
      let height = 3;
      if (label) height += 1;
      yogaNode.setHeight(height);
    } else {
      let height = 1;
      if (label) height += 1;
      if (showHeader && headers.length > 0) {
        height += 2;
      }
      height += tableHeight;
      height += 1;
      if (isFocused && !disabled) height += 1;
      if (rows.length > tableHeight) height += 1;
      yogaNode.setHeight(height);
    }

    if (props.width === undefined && props.flex === undefined) {
      yogaNode.setWidthPercent(100);
    }
    return {};
  }
}

/**
 * Handler for Image nodes
 */
class ImageHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    const lines = props.imageLines || 1;
    yogaNode.setHeight(lines);
    if (props.width === undefined && props.flex === undefined) {
      yogaNode.setWidthPercent(100);
    }
    return {};
  }
}

/**
 * Handler for Newline nodes
 */
class NewlineHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    const count = props.count || 1;
    yogaNode.setHeight(Math.max(1, count));
    return {};
  }
}

/**
 * Handler for Spacer nodes
 */
class SpacerHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    const lines = props.lines || 1;
    yogaNode.setHeight(Math.max(1, lines));
    return {};
  }
}

/**
 * Handler for Button nodes
 */
class ButtonHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    const label = props.label || '';
    const bracketWidth = 1;
    const paddingWidth = 2;
    const buttonWidth = (bracketWidth * 2) + paddingWidth + getTerminalWidth(label);

    yogaNode.setHeight(1);
    if (props.width === undefined && props.flex === undefined) {
      yogaNode.setWidth(buttonWidth);
    }
    return {};
  }
}

/**
 * Handler for TextInput nodes
 */
class TextInputHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const { containerWidth } = context;
    const props = tuiNode.props || {};
    const label = props.label || '';
    const rows = props.rows || 3;
    const minRows = props.minRows || 1;
    const maxRows = props.maxRows;
    const autoResize = props.autoResize || false;
    const text = props.text || '';
    const hint = props.hint;
    const validationError = props.validationError;
    const isFocused = props.isFocused || false;
    const disabled = props.disabled || false;

    let availableWidth = containerWidth;
    if (props.width != null) {
      availableWidth = typeof props.width === 'string' && props.width.endsWith('%')
        ? Math.floor(containerWidth * parseFloat(props.width) / 100)
        : props.width;
    } else if (props._injectedWidth !== undefined && props._injectedWidth !== null) {
      availableWidth = props._injectedWidth;
    }

    let effectiveRows = rows;
    if (autoResize) {
      const visualLineCount = text ? calculateTextHeight(text, availableWidth) : minRows;
      effectiveRows = Math.max(minRows, visualLineCount);
      if (maxRows) effectiveRows = Math.min(effectiveRows, maxRows);
    }

    let height = 1 + effectiveRows + 1;
    if (label) height += 1;
    if (validationError) {
      height += 1;
    } else if (isFocused && !disabled && hint !== false && hint !== '') {
      height += 1;
    }

    yogaNode.setHeight(height);

    if (props.width != null) {
      if (typeof props.width === 'string' && props.width.endsWith('%')) {
        yogaNode.setWidthPercent(parseFloat(props.width));
      } else {
        yogaNode.setWidth(props.width + 2);
      }
    }
    // Don't force width - let parent flex container control sizing
    return {};
  }
}

/**
 * Handler for Checkbox nodes
 */
class CheckboxHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    const label = props.label || '';
    const maxHeight = props.height || 10;
    const options = props.options || [];
    const isFocused = props.isFocused || false;
    const disabled = props.disabled || false;
    const direction = props.direction || 'vertical';

    if (direction === 'vertical') {
      const visibleOptions = options.length === 0 ? 1 : Math.min(maxHeight, options.length);
      let totalHeight = 1 + visibleOptions + 1;
      if (label) totalHeight += 1;
      if (isFocused && !disabled) totalHeight += 1;
      if (options.length > maxHeight) totalHeight += 1;

      yogaNode.setHeight(totalHeight);

      if (props.width === undefined && props.flex === undefined) {
        let maxWidth = 20;
        for (let i = 0; i < options.length; i++) {
          const optLabel = options[i].label || String(options[i].value);
          const width = getTerminalWidth(optLabel);
          if (width > maxWidth) maxWidth = width;
        }
        yogaNode.setWidth(maxWidth + 8);
      }
    } else {
      yogaNode.setHeight(label ? 4 : 3);
    }
    return {};
  }
}

/**
 * Handler for Radiobox nodes
 */
class RadioboxHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    const label = props.label || '';
    const maxHeight = props.height || 10;
    const options = props.options || [];
    const isFocused = props.isFocused || false;
    const disabled = props.disabled || false;
    const direction = props.direction || 'vertical';

    if (direction === 'vertical') {
      const visibleOptions = options.length === 0 ? 1 : Math.min(maxHeight, options.length);
      let totalHeight = 1 + visibleOptions + 1;
      if (label) totalHeight += 1;
      if (isFocused && !disabled) totalHeight += 1;
      if (options.length > maxHeight) totalHeight += 1;

      yogaNode.setHeight(totalHeight);

      if (props.width === undefined && props.flex === undefined) {
        let maxWidth = 20;
        for (let i = 0; i < options.length; i++) {
          const optLabel = options[i].label || String(options[i].value);
          const width = getTerminalWidth(optLabel);
          if (width > maxWidth) maxWidth = width;
        }
        yogaNode.setWidth(maxWidth + 8);
      }
    } else {
      yogaNode.setHeight(label ? 4 : 3);
    }
    return {};
  }
}

/**
 * Handler for SelectInput nodes
 */
class SelectInputHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    const label = props.label || '';
    const maxHeight = props.height || 10;
    const options = props.options || [];
    const isFocused = props.isFocused || false;
    const disabled = props.disabled || false;

    const visibleOptions = options.length === 0 ? 1 : Math.min(maxHeight, options.length);
    let totalHeight = 1 + visibleOptions + 1;
    if (label) totalHeight += 1;
    if (isFocused && !disabled) totalHeight += 1;
    if (options.length > maxHeight) totalHeight += 1;

    yogaNode.setHeight(totalHeight);

    if (props.width === undefined && props.flex === undefined) {
      let maxWidth = 20;
      for (let i = 0; i < options.length; i++) {
        const optLabel = options[i].label || String(options[i].value);
        const width = getTerminalWidth(optLabel);
        if (width > maxWidth) maxWidth = width;
      }
      yogaNode.setWidth(maxWidth + 4);
    }
    return {};
  }
}

/**
 * Handler for Box nodes
 */
class BoxHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    const border = props.border;
    const padding = props.padding || 0;
    const bg = props.bg;

    const hasBorder = border !== false;
    const hasBg = !!bg;

    if (!hasBorder && padding === 0 && !hasBg) {
      // Transparent box
    } else if (hasBorder) {
      yogaNode.setBorder(Yoga.EDGE_ALL, 1);
    } else if (hasBg) {
      yogaNode.setPadding(Yoga.EDGE_TOP, 1);
      yogaNode.setPadding(Yoga.EDGE_BOTTOM, 1);
    }

    // Adjust maxHeight to account for borders and padding
    // maxHeight should constrain content, not the whole box including chrome
    if (props.maxHeight !== undefined) {
      const borderHeight = hasBorder ? 2 : (hasBg ? 2 : 0);
      const paddingHeight = padding * 2; // top + bottom
      const adjustedMaxHeight = props.maxHeight + borderHeight + paddingHeight;
      yogaNode.setMaxHeight(adjustedMaxHeight);
    }

    return {};
  }
}

/**
 * Handler for Tree nodes
 */
class TreeHandler extends ComponentHandler {
  applyLayout(yogaNode, tuiNode, context) {
    const props = tuiNode.props || {};
    const data = props.data || [];

    /**
     * Count total visible nodes in tree
     */
    function countNodes(nodes) {
      if (!nodes || nodes.length === 0) return 0;

      let count = 0;
      for (const node of nodes) {
        count++; // This node
        if (node.children && node.children.length > 0) {
          count += countNodes(node.children);
        }
      }
      return count;
    }

    const totalLines = countNodes(data);
    yogaNode.setHeight(Math.max(1, totalLines));

    if (props.width === undefined && props.flex === undefined) {
      yogaNode.setWidthPercent(100);
    }

    return {};
  }
}

/**
 * Registry of component handlers
 * Can be extended by registering custom handlers
 */
class ComponentHandlerRegistry {
  constructor() {
    this.handlers = new Map();
    this._registerDefaultHandlers();
  }

  _registerDefaultHandlers() {
    this.register('root', new RootHandler());
    this.register('row', new RowHandler());
    this.register('col', new ColHandler());
    this.register('text', new TextHandler());
    this.register('textbox', new TextboxHandler());
    this.register('bigtext', new BigTextHandler());
    this.register('divider', new DividerHandler());
    this.register('table', new TableHandler());
    this.register('image', new ImageHandler());
    this.register('newline', new NewlineHandler());
    this.register('spacer', new SpacerHandler());
    this.register('button', new ButtonHandler());
    this.register('textinput', new TextInputHandler());
    this.register('checkbox', new CheckboxHandler());
    this.register('radiobox', new RadioboxHandler());
    this.register('selectinput', new SelectInputHandler());
    this.register('box', new BoxHandler());
    this.register('tree', new TreeHandler());
  }

  /**
   * Register a handler for a component type
   * @param {string} type - Component type
   * @param {ComponentHandler} handler - Handler instance
   */
  register(type, handler) {
    this.handlers.set(type, handler);
  }

  /**
   * Get handler for a component type
   * @param {string} type - Component type
   * @returns {ComponentHandler|null}
   */
  get(type) {
    return this.handlers.get(type) || null;
  }

  /**
   * Check if a handler exists for a component type
   * @param {string} type - Component type
   * @returns {boolean}
   */
  has(type) {
    return this.handlers.has(type);
  }
}

// Export singleton registry
export const componentHandlerRegistry = new ComponentHandlerRegistry();

// Export base class for extensions
export { ComponentHandler };

// Export utility functions used by layoutEngine
export { extractTextContent, calculateTextHeight, calculateBigTextHeight };
