// src/core/inputManager.js
import { ref } from 'vue';
import { parseKey, parseMouseEvent, KEY_TAB, KEY_CTRL_C } from '@utils/keyParser.js';

/**
 * InputManager - Centralized keyboard input handling for TUI
 *
 * Manages:
 * - Raw mode stdin
 * - Component registration
 * - Focus management
 * - Key event dispatching
 */
export class InputManager {
  constructor(options = {}) {
    this.components = new Map();
    this.componentOrder = [];
    this.focusedId = ref(null);
    this.enabled = false;
    this.onInputChange = options.onInputChange || (() => {});
    this.onExit = options.onExit || (() => {});
    this.viewportHandler = null;
    this.vuettyInstance = null;

    this.handleData = this.handleData.bind(this);
    this.buffer = '';
  }

  /**
   * Enable input handling - set stdin to raw mode
   */
  enable() {
    if (this.enabled) return;

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', this.handleData);

    this.enabled = true;
  }

  /**
   * Disable input handling - restore stdin
   */
  disable() {
    if (!this.enabled) return;

    process.stdin.removeListener('data', this.handleData);
    process.stdin.pause();

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    this.enabled = false;
  }

  /**
   * Register a component to receive keyboard input
   */
  registerComponent(id, handler, options = {}) {
    this.components.set(id, {
      handler,
      disabled: options.disabled || false,
      focusable: options.focusable !== undefined ? options.focusable : true
    });

    this.componentOrder.push(id);

    if (!this.focusedId.value && !options.disabled && options.focusable !== false) {
      this.focus(id);
    }
  }

  /**
   * Unregister a component
   */
  unregisterComponent(id) {
    this.components.delete(id);

    const index = this.componentOrder.indexOf(id);
    if (index !== -1) {
      this.componentOrder.splice(index, 1);
    }

    if (this.focusedId.value === id) {
      this.focusedId.value = null;
      this.focusNext();
    }
  }

  /**
   * Update component disabled state
   */
  setComponentDisabled(id, disabled) {
    const component = this.components.get(id);
    if (component) {
      component.disabled = disabled;

      if (disabled && this.focusedId.value === id) {
        this.focusNext();
      }
    }
  }

  /**
   * Set viewport-level key handler
   */
  setViewportHandler(handler) {
    this.viewportHandler = handler;
  }

  /**
   * Set reference to Vuetty instance
   */
  setVuettyInstance(vuetty) {
    this.vuettyInstance = vuetty;
  }

  /**
   * Blur the current component
   */
  blur() {
    if (this.focusedId.value) {
      this.focusedId.value = null;
      this.onInputChange();
      return true;
    }
    return false;
  }

  /**
   * Focus a specific component
   */
  focus(id) {
    const component = this.components.get(id);

    if (!component || component.disabled) {
      return false;
    }

    if (this.focusedId.value === id) {
      return false;
    }

    this.focusedId.value = id;
    this.onInputChange();
    return true;
  }

  /**
   * Focus next component (Tab key)
   */
  focusNext() {
    if (this.componentOrder.length === 0) {
      return false;
    }

    const currentIndex = this.componentOrder.indexOf(this.focusedId.value);
    let nextIndex = (currentIndex + 1) % this.componentOrder.length;

    let attempts = 0;
    while (attempts < this.componentOrder.length) {
      const nextId = this.componentOrder[nextIndex];
      const component = this.components.get(nextId);

      if (component && !component.disabled && component.focusable !== false) {
        return this.focus(nextId);
      }

      nextIndex = (nextIndex + 1) % this.componentOrder.length;
      attempts++;
    }

    this.focusedId.value = null;
    return false;
  }

  /**
   * Focus previous component (Shift+Tab)
   */
  focusPrevious() {
    if (this.componentOrder.length === 0) {
      return false;
    }

    const currentIndex = this.componentOrder.indexOf(this.focusedId.value);
    let prevIndex = currentIndex <= 0
      ? this.componentOrder.length - 1
      : currentIndex - 1;

    let attempts = 0;
    while (attempts < this.componentOrder.length) {
      const prevId = this.componentOrder[prevIndex];
      const component = this.components.get(prevId);

      if (component && !component.disabled && component.focusable !== false) {
        return this.focus(prevId);
      }

      prevIndex = prevIndex <= 0
        ? this.componentOrder.length - 1
        : prevIndex - 1;
      attempts++;
    }

    this.focusedId.value = null;
    return false;
  }

  /**
   * Check if a component is focused
   */
  isFocused(id) {
    return this.focusedId.value === id;
  }

  /**
   * Handle raw data from stdin
   */
  handleData(data) {
    this.buffer += data;

    while (this.buffer.length > 0) {
      // Check for ANSI escape sequence
      if (this.buffer.startsWith('\x1b')) {
        let sequenceEnd = -1;

        // SGR mouse format: \x1b[<button;x;y;M or m
        if (this.buffer.startsWith('\x1b[<')) {
          const mouseMatch = this.buffer.match(/^\x1b\[<\d+;\d+;\d+[Mm]/);
          if (mouseMatch) {
            const sequence = mouseMatch[0];
            this.buffer = this.buffer.slice(sequence.length);
            this.handleMouseEvent(sequence);
            continue;
          } else if (this.buffer.match(/^\x1b\[<[\d;]*$/)) {
            // Incomplete mouse sequence
            break;
          }
        }

        // Normal/X10 extended format: \x1b[button;x;yM
        const normalMouseMatch = this.buffer.match(/^\x1b\[\d+;\d+;\d+M/);
        if (normalMouseMatch) {
          const sequence = normalMouseMatch[0];
          this.buffer = this.buffer.slice(sequence.length);
          this.handleMouseEvent(sequence);
          continue;
        }

        // CSI sequence: \x1b[<params><letter>
        if (this.buffer.length >= 2 && this.buffer[1] === '[') {
          for (let i = 2; i < this.buffer.length; i++) {
            const code = this.buffer.charCodeAt(i);
            if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 126) {
              sequenceEnd = i + 1;
              break;
            }
          }
        } else if (this.buffer.length >= 2) {
          sequenceEnd = 2;
        }

        if (sequenceEnd > 0) {
          const sequence = this.buffer.slice(0, sequenceEnd);
          this.buffer = this.buffer.slice(sequenceEnd);
          this.handleKeyPress(sequence);
        } else if (this.buffer.length === 1) {
          this.buffer = '';
          this.handleKeyPress('\x1b');
        } else {
          break;
        }
      } else {
        const char = this.buffer[0];
        this.buffer = this.buffer.slice(1);
        this.handleKeyPress(char);
      }
    }
  }

  /**
   * Handle a key press
   */
  handleKeyPress(str) {
    // Check for mouse event first
    const mouseEvent = parseMouseEvent(str);
    if (mouseEvent) {
      this.handleMouseEvent(str);
      return;
    }

    const parsedKey = parseKey(str);

    // Capture key event for debug server
    if (this.vuettyInstance?.debugServer) {
      this.vuettyInstance.debugServer.captureEvent('input.key', {
        key: parsedKey.key,
        char: parsedKey.char,
        shift: parsedKey.shift,
        ctrl: parsedKey.ctrl,
        alt: parsedKey.alt
      });
    }

    // Global: Ctrl+C exits
    if (parsedKey.key === KEY_CTRL_C) {
      this.onExit();
      return;
    }

    // Global: Alt+M toggles mouse tracking
    if (parsedKey.alt && parsedKey.key === 'm') {
      if (this.vuettyInstance) {
        this.vuettyInstance.toggleMouseTracking();
      }
      return;
    }

    // Tab navigation
    if (parsedKey.key === KEY_TAB) {
      if (parsedKey.shift) {
        this.focusPrevious();
      } else {
        this.focusNext();
      }
      return;
    }

    // Viewport-level keys
    if (this.viewportHandler) {
      const consumed = this.viewportHandler(parsedKey);
      if (consumed) {
        return;
      }
    }

    // Dispatch to focused component
    if (this.focusedId.value) {
      const component = this.components.get(this.focusedId.value);
      if (component && !component.disabled && component.handler) {
        const consumed = component.handler(parsedKey);
        if (consumed) {
          this.onInputChange();
          return;
        }
      }
    }

    // Dispatch to non-focusable components (global shortcuts)
    for (const componentId of this.componentOrder) {
      const component = this.components.get(componentId);

      if (!component || component.disabled || component.focusable !== false) {
        continue;
      }

      const consumed = component.handler(parsedKey);
      if (consumed) {
        this.onInputChange();
        return;
      }
    }
  }

  /**
   * Handle a mouse event
   * Wheel events and clicks are processed
   */
  handleMouseEvent(str) {
    const mouseEvent = parseMouseEvent(str);

    if (!mouseEvent) {
      return;
    }

    // Capture mouse event for debug server
    if (this.vuettyInstance?.debugServer) {
      this.vuettyInstance.debugServer.captureEvent('input.mouse', {
        action: mouseEvent.action,
        x: mouseEvent.x,
        y: mouseEvent.y,
        button: mouseEvent.button
      });
    }

    // Pass ALL mouse events to viewport handler
    if (this.viewportHandler) {
      const handled = this.viewportHandler(mouseEvent);
      if (handled) {
        return; // Event was consumed
      }
    }

    // If not handled, ignore
  }

  /**
   * Get current focused component ID
   */
  getFocusedId() {
    return this.focusedId.value;
  }

  /**
   * Get count of registered components
   */
  getComponentCount() {
    return this.components.size;
  }

  /**
   * Clear all components
   */
  clear() {
    this.components.clear();
    this.componentOrder = [];
    this.focusedId.value = null;
  }
}