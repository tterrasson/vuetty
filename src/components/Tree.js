// src/components/Tree.js
import { h, inject } from 'vue';
import chalk from 'chalk';
import { VUETTY_VIEWPORT_STATE_KEY, VUETTY_THEME_KEY } from '@core/vuettyKeys.js';
import { WIDTH_CONTEXT_KEY } from '@core/widthContext.js';
import { boxProps } from '@core/layoutProps.js';
import { getChalkColorChain } from '@utils/colorUtils.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';

// Tree branch character themes
const TREE_CHARS = {
  default: {
    branch: '├',      // intermediate child
    last: '└',        // last child
    vertical: '│',    // vertical continuation
    horizontal: '──'  // horizontal line
  },
  rounded: {
    branch: '├',
    last: '└',
    vertical: '│',
    horizontal: '──'
  },
  bold: {
    branch: '┣',
    last: '┗',
    vertical: '┃',
    horizontal: '━━'
  },
  double: {
    branch: '╠',
    last: '╚',
    vertical: '║',
    horizontal: '══'
  },
  classic: {
    branch: '+',
    last: '+',
    vertical: '|',
    horizontal: '--'
  }
};

/**
 * Tree component - Displays hierarchical data structures
 *
 * Data structure:
 * [
 *   {
 *     name: 'folder',
 *     children: [
 *       { name: 'file.js' },
 *       { name: 'subfolder', children: [...] }
 *     ]
 *   }
 * ]
 */
export default {
  name: 'Tree',
  props: {
    // Data structure - array of tree nodes
    data: {
      type: Array,
      default: () => []
    },

    // Styling
    color: String,           // Default text color
    bg: String,              // Background color
    branchColor: {           // Color for tree branch characters (│├└─)
      type: String,
      default: null
    },
    folderColor: {           // Color for folder/parent nodes
      type: String,
      default: null
    },
    fileColor: {             // Color for file/leaf nodes
      type: String,
      default: null          // Falls back to color or theme default
    },

    // Display options
    showIcons: {             // Show folder/file icons
      type: Boolean,
      default: false
    },
    treeStyle: {             // Tree branch character style
      type: [String, Object],
      default: null
    },

    // Include common layout props (padding, margin, dimensions, flex item)
    ...boxProps
  },

  setup(props, { slots }) {
    const injectedWidthContext = inject(WIDTH_CONTEXT_KEY, null);
    const viewportState = inject(VUETTY_VIEWPORT_STATE_KEY, null);
    const theme = inject(VUETTY_THEME_KEY, null);

    return () => {
      const injectedWidth = typeof injectedWidthContext === 'function'
        ? injectedWidthContext()
        : injectedWidthContext;

      // Get slots for custom rendering
      const nodeSlot = slots.node || slots.default || null;
      const iconSlot = slots.icon || null;

      // Apply theme defaults
      const effectiveBranchColor = props.branchColor ?? theme?.components?.tree?.branchColor ?? 'gray';
      const effectiveFolderColor = props.folderColor ?? theme?.components?.tree?.folderColor ?? 'blue';
      const effectiveFileColor = props.fileColor ?? theme?.components?.tree?.fileColor ?? props.color ?? null;

      // Apply theme defaults for treeStyle
      const effectiveTreeStyle = props.treeStyle ?? theme?.components?.tree?.treeStyle ?? 'default';

      return h('tree', {
        ...props,
        branchColor: effectiveBranchColor,
        folderColor: effectiveFolderColor,
        fileColor: effectiveFileColor,
        treeStyle: effectiveTreeStyle,
        _injectedWidth: injectedWidth,
        _viewportVersion: viewportState ? viewportState.version : 0,
        _nodeSlot: nodeSlot,
        _iconSlot: iconSlot
      });
    };
  }
};

/**
 * Render tree data to string
 */
export function renderTree(props) {
  const {
    data = [],
    branchColor = 'gray',
    folderColor = 'blue',
    fileColor = null,
    showIcons = false,
    treeStyle = 'default'
  } = props;

  if (!data || data.length === 0) {
    return '';
  }

  // Get tree characters from theme
  const treeChars = typeof treeStyle === 'string'
    ? (TREE_CHARS[treeStyle] || TREE_CHARS.default)
    : treeStyle;

  const lines = [];
  const branchStyle = getChalkColorChain(branchColor) || chalk;
  const folderStyle = getChalkColorChain(folderColor) || chalk;
  const fileStyle = getChalkColorChain(fileColor) || chalk;

  /**
   * Recursively render a node and its children
   * @param {Object} node - Tree node
   * @param {string} prefix - Prefix string for indentation (accumulated │ and spaces)
   * @param {boolean} isLast - Whether this is the last child at this level
   * @param {number} depth - Current depth level
   */
  function renderNode(node, prefix, isLast, depth) {
    const hasChildren = node.children && node.children.length > 0;
    const isFolder = hasChildren;

    // Build the branch connector for non-root nodes
    let connector = '';
    if (depth > 0) {
      connector = isLast
        ? branchStyle(treeChars.last + treeChars.horizontal + ' ')
        : branchStyle(treeChars.branch + treeChars.horizontal + ' ');
    }

    // Build icon if enabled
    let icon = '';
    if (showIcons) {
      icon = isFolder ? '📁 ' : '📄 ';
    }

    // Style the node name
    const nodeName = node.name || '';
    let styledName;

    if (node.color) {
      // Node has custom color
      const nodeStyle = getChalkColorChain(node.color) || chalk;
      styledName = isFolder ? nodeStyle.bold(nodeName) : nodeStyle(nodeName);
    } else if (isFolder) {
      styledName = folderStyle.bold(nodeName);
    } else {
      styledName = fileStyle(nodeName);
    }

    // Assemble and add the line
    lines.push(prefix + connector + icon + styledName);

    // Render children recursively
    if (hasChildren) {
      const childCount = node.children.length;

      for (let i = 0; i < childCount; i++) {
        const child = node.children[i];
        const isChildLast = i === childCount - 1;

        // Build new prefix for children:
        // The prefix accumulates for the grandchildren, not for the direct children
        // - At depth 0 (root), children start with empty prefix (just their connector)
        // - Otherwise, we extend the prefix based on whether current node is last
        let newPrefix;
        if (depth === 0) {
          // Root's direct children have no prefix (their connector is first character)
          newPrefix = '';
        } else {
          // Add continuation character (│ or spaces) to prefix for grandchildren
          newPrefix = prefix + (isLast ? '    ' : branchStyle(treeChars.vertical) + '   ');
        }

        renderNode(child, newPrefix, isChildLast, depth + 1);
      }
    }
  }

  // Render all root nodes (each root is independent, no connecting lines between them)
  const rootCount = data.length;
  for (let i = 0; i < rootCount; i++) {
    const node = data[i];
    // Roots are always treated as "last" for their children's prefix calculation
    // because there's no connecting line between different root nodes
    renderNode(node, '', true, 0);
  }

  return lines.join('\n');
}

/**
 * Render handler for tree
 */
class TreeRenderHandler extends RenderHandler {
  render(ctx) {
    return renderTree(ctx.props);
  }
}

renderHandlerRegistry.register('tree', new TreeRenderHandler());
