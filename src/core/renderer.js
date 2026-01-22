// src/core/renderer.js
import { createRenderer } from '@vue/runtime-core';
import { TUINode, TextNode, CommentNode } from './node.js';
import { renderToString } from './render.js';
import { markSelfDirty } from './memoization.js';
import { isLayoutAffectingProp } from './layoutPropRegistry.js';

function isPlainObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

/**
 * Custom Vue renderer for TUI
 */
export function createTUIRenderer(options = {}) {
  const {
    onUpdate = () => {},
    rootContainer = null,
    beforeRender = () => {},
    afterRender = () => {}
  } = options;

  const renderer = createRenderer({
    createElement(type) {
      return new TUINode(type);
    },

    createText(text) {
      return new TextNode(text);
    },

    createComment(text) {
      return new CommentNode(text);
    },

    setText(node, text) {
      if (node.text !== text) {
        node.setText(text);
        markSelfDirty(node);
      }
      triggerUpdate();
    },

    setElementText(node, text) {
      if (node.text !== text) {
        node.setText(text);
        markSelfDirty(node);
      }
      triggerUpdate();
    },

    insert(child, parent, anchor = null) {
      if (anchor) {
        parent.insertBefore(child, anchor);
      } else {
        parent.appendChild(child);
      }

      markSelfDirty(child);
      parent.invalidateChildrenCache();
      parent.markLayoutDirty();
      triggerUpdate();
    },

    remove(child) {
      const parent = child.parent;
      if (parent) {
        parent.removeChild(child);
        parent.invalidateChildrenCache();
        markSelfDirty(parent);
        parent.markLayoutDirty();
        triggerUpdate();
      }
    },

    patchProp(node, key, prevValue, nextValue) {
      // Capture component metadata (don't store in props)
      if (key === '_componentId') {
        node.componentId = nextValue;
        return;
      }
      if (key === '_clickable') {
        node.clickable = nextValue;
        return;
      }

      let changed = prevValue !== nextValue;

      // Array comparison
      if (!changed && Array.isArray(nextValue) && Array.isArray(prevValue)) {
        changed = prevValue.length !== nextValue.length ||
                  prevValue.some((v, i) => v !== nextValue[i]);
      }
      // Object comparison (shallow)
      else if (!changed && isPlainObject(nextValue) && isPlainObject(prevValue)) {
        const prevKeys = Object.keys(prevValue);
        const nextKeys = Object.keys(nextValue);
        changed = prevKeys.length !== nextKeys.length ||
                  nextKeys.some(k => prevValue[k] !== nextValue[k]);
      }

      if (nextValue == null) {
        delete node.props[key];
      } else {
        node.props[key] = nextValue;
      }

      if (changed) {
        markSelfDirty(node);
        if (isLayoutAffectingProp(key)) {
          node.markLayoutDirty();
        }
      }

      triggerUpdate();
    },

    parentNode(node) {
      return node.parent;
    },

    nextSibling(node) {
      if (!node.parent) return null;
      const siblings = node.parent.children;
      const index = siblings.indexOf(node);
      return siblings[index + 1] || null;
    },

    querySelector() {
      return null;
    },

    setScopeId() {},

    cloneNode(node) {
      const cloned = new TUINode(node.type);
      cloned.props = { ...node.props };
      cloned.text = node.text;
      return cloned;
    },

    insertStaticContent(content, parent, anchor) {
      const textNode = new TextNode(content);
      if (anchor) {
        parent.insertBefore(textNode, anchor);
      } else {
        parent.appendChild(textNode);
      }
      parent.invalidateChildrenCache();
      triggerUpdate();
      return [textNode, textNode];
    }
  });

  // Render scheduling state
  let renderScheduled = false;
  let updateNeeded = false;
  let lastRenderOutput = '';

  function triggerUpdate() {
    updateNeeded = true;
    if (!renderScheduled) {
      scheduleRender();
    }
  }

  function scheduleRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    Promise.resolve().then(performRender);
  }

  function performRender() {
    const startTime = performance.now();

    renderScheduled = false;
    updateNeeded = false;

    if (rootContainer) {
      beforeRender(rootContainer);
      const output = renderToString(rootContainer);
      afterRender(rootContainer);

      // Only update if output changed
      if (output !== lastRenderOutput) {
        lastRenderOutput = output;
        onUpdate(output);

        if (renderer.vuettyInstance?.debugServer) {
          const duration = performance.now() - startTime;
          renderer.vuettyInstance.debugServer.captureRenderComplete({
            duration,
            outputLength: output.length,
            rootContainer
          });
        }
      }
    }

    // Handle updates that arrived during render
    if (updateNeeded) {
      scheduleRender();
    }
  }

  renderer.forceUpdate = () => {
    lastRenderOutput = '';
    triggerUpdate();
  };

  renderer.vuettyInstance = null;

  return renderer;
}
