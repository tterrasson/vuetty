/**
 * Tests for InputManager
 */

import { test, expect, describe, beforeEach } from 'bun:test';
import { InputManager } from '../../src/core/inputManager.js';

describe('InputManager', () => {
  let inputManager;

  beforeEach(() => {
    inputManager = new InputManager();
  });

  describe('constructor', () => {
    test('initializes with empty components map', () => {
      expect(inputManager.components.size).toBe(0);
    });

    test('initializes with empty component order', () => {
      expect(inputManager.componentOrder).toEqual([]);
    });

    test('initializes with null focused ID', () => {
      expect(inputManager.focusedId.value).toBe(null);
    });

    test('initializes with enabled as false', () => {
      expect(inputManager.enabled).toBe(false);
    });

    test('accepts onInputChange callback', () => {
      const callback = () => {};
      const manager = new InputManager({ onInputChange: callback });
      expect(manager.onInputChange).toBe(callback);
    });

    test('accepts onExit callback', () => {
      const callback = () => {};
      const manager = new InputManager({ onExit: callback });
      expect(manager.onExit).toBe(callback);
    });

    test('initializes buffer as empty string', () => {
      expect(inputManager.buffer).toBe('');
    });

    test('binds handleData to instance', () => {
      expect(typeof inputManager.handleData).toBe('function');
    });
  });

  describe('registerComponent', () => {
    test('registers a component', () => {
      const handler = () => {};
      inputManager.registerComponent('comp-1', handler);

      expect(inputManager.components.has('comp-1')).toBe(true);
      expect(inputManager.componentOrder).toContain('comp-1');
    });

    test('stores handler function', () => {
      const handler = () => {};
      inputManager.registerComponent('comp-1', handler);

      const component = inputManager.components.get('comp-1');
      expect(component.handler).toBe(handler);
    });

    test('sets disabled to false by default', () => {
      inputManager.registerComponent('comp-1', () => {});

      const component = inputManager.components.get('comp-1');
      expect(component.disabled).toBe(false);
    });

    test('accepts disabled option', () => {
      inputManager.registerComponent('comp-1', () => {}, { disabled: true });

      const component = inputManager.components.get('comp-1');
      expect(component.disabled).toBe(true);
    });

    test('sets focusable to true by default', () => {
      inputManager.registerComponent('comp-1', () => {});

      const component = inputManager.components.get('comp-1');
      expect(component.focusable).toBe(true);
    });

    test('accepts focusable option', () => {
      inputManager.registerComponent('comp-1', () => {}, { focusable: false });

      const component = inputManager.components.get('comp-1');
      expect(component.focusable).toBe(false);
    });

    test('auto-focuses first enabled focusable component', () => {
      inputManager.registerComponent('comp-1', () => {});

      expect(inputManager.focusedId.value).toBe('comp-1');
    });

    test('does not auto-focus disabled component', () => {
      inputManager.registerComponent('comp-1', () => {}, { disabled: true });

      expect(inputManager.focusedId.value).toBe(null);
    });

    test('does not auto-focus non-focusable component', () => {
      inputManager.registerComponent('comp-1', () => {}, { focusable: false });

      expect(inputManager.focusedId.value).toBe(null);
    });

    test('adds component to component order', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});

      expect(inputManager.componentOrder).toEqual(['comp-1', 'comp-2']);
    });
  });

  describe('unregisterComponent', () => {
    test('removes component from map', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.unregisterComponent('comp-1');

      expect(inputManager.components.has('comp-1')).toBe(false);
    });

    test('removes component from order', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.unregisterComponent('comp-1');

      expect(inputManager.componentOrder).toEqual(['comp-2']);
    });

    test('clears focus if unregistering focused component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.focus('comp-1');
      inputManager.unregisterComponent('comp-1');

      expect(inputManager.focusedId.value).not.toBe('comp-1');
    });

    test('focuses next component when unregistering focused component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.focus('comp-1');
      inputManager.unregisterComponent('comp-1');

      expect(inputManager.focusedId.value).toBe('comp-2');
    });

    test('handles unregistering non-existent component', () => {
      expect(() => {
        inputManager.unregisterComponent('non-existent');
      }).not.toThrow();
    });
  });

  describe('setComponentDisabled', () => {
    test('sets component disabled state', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.setComponentDisabled('comp-1', true);

      const component = inputManager.components.get('comp-1');
      expect(component.disabled).toBe(true);
    });

    test('removes focus when disabling focused component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.focus('comp-1');
      inputManager.setComponentDisabled('comp-1', true);

      expect(inputManager.focusedId.value).not.toBe('comp-1');
    });

    test('focuses next component when disabling focused component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.focus('comp-1');
      inputManager.setComponentDisabled('comp-1', true);

      expect(inputManager.focusedId.value).toBe('comp-2');
    });

    test('handles non-existent component', () => {
      expect(() => {
        inputManager.setComponentDisabled('non-existent', true);
      }).not.toThrow();
    });
  });

  describe('focus', () => {
    test('focuses a component', () => {
      inputManager.registerComponent('comp-1', () => {}, { focusable: true });
      inputManager.focusedId.value = null;
      const result = inputManager.focus('comp-1');

      expect(inputManager.focusedId.value).toBe('comp-1');
      expect(result).toBe(true);
    });

    test('returns false when focusing disabled component', () => {
      inputManager.registerComponent('comp-1', () => {}, { disabled: true });
      const result = inputManager.focus('comp-1');

      expect(result).toBe(false);
      expect(inputManager.focusedId.value).not.toBe('comp-1');
    });

    test('returns false when focusing non-existent component', () => {
      const result = inputManager.focus('non-existent');

      expect(result).toBe(false);
    });

    test('returns false when focusing already focused component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.focus('comp-1');
      const result = inputManager.focus('comp-1');

      expect(result).toBe(false);
    });

    test('calls onInputChange when focus changes', () => {
      let called = false;
      const manager = new InputManager({ onInputChange: () => { called = true; } });
      manager.registerComponent('comp-1', () => {}, { focusable: true });
      manager.focusedId.value = null;
      manager.focus('comp-1');

      expect(called).toBe(true);
    });
  });

  describe('blur', () => {
    test('clears focused component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.focus('comp-1');
      const result = inputManager.blur();

      expect(inputManager.focusedId.value).toBe(null);
      expect(result).toBe(true);
    });

    test('returns false when nothing is focused', () => {
      const result = inputManager.blur();

      expect(result).toBe(false);
    });

    test('calls onInputChange when blurring', () => {
      let called = false;
      const manager = new InputManager({ onInputChange: () => { called = true; } });
      manager.registerComponent('comp-1', () => {});
      manager.focus('comp-1');
      manager.blur();

      expect(called).toBe(true);
    });
  });

  describe('focusNext', () => {
    test('focuses next component in order', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.focus('comp-1');
      inputManager.focusNext();

      expect(inputManager.focusedId.value).toBe('comp-2');
    });

    test('wraps around to first component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.focus('comp-2');
      inputManager.focusNext();

      expect(inputManager.focusedId.value).toBe('comp-1');
    });

    test('skips disabled components', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {}, { disabled: true });
      inputManager.registerComponent('comp-3', () => {});
      inputManager.focus('comp-1');
      inputManager.focusNext();

      expect(inputManager.focusedId.value).toBe('comp-3');
    });

    test('skips non-focusable components', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {}, { focusable: false });
      inputManager.registerComponent('comp-3', () => {});
      inputManager.focus('comp-1');
      inputManager.focusNext();

      expect(inputManager.focusedId.value).toBe('comp-3');
    });

    test('returns false when no components available', () => {
      const result = inputManager.focusNext();

      expect(result).toBe(false);
    });

    test('clears focus when only disabled components exist', () => {
      inputManager.registerComponent('comp-1', () => {}, { disabled: true });
      inputManager.focusNext();

      expect(inputManager.focusedId.value).toBe(null);
    });
  });

  describe('focusPrevious', () => {
    test('focuses previous component in order', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.focus('comp-2');
      inputManager.focusPrevious();

      expect(inputManager.focusedId.value).toBe('comp-1');
    });

    test('wraps around to last component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.focus('comp-1');
      inputManager.focusPrevious();

      expect(inputManager.focusedId.value).toBe('comp-2');
    });

    test('skips disabled components', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {}, { disabled: true });
      inputManager.registerComponent('comp-3', () => {});
      inputManager.focus('comp-3');
      inputManager.focusPrevious();

      expect(inputManager.focusedId.value).toBe('comp-1');
    });

    test('skips non-focusable components', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {}, { focusable: false });
      inputManager.registerComponent('comp-3', () => {});
      inputManager.focus('comp-3');
      inputManager.focusPrevious();

      expect(inputManager.focusedId.value).toBe('comp-1');
    });

    test('returns false when no components available', () => {
      const result = inputManager.focusPrevious();

      expect(result).toBe(false);
    });
  });

  describe('isFocused', () => {
    test('returns true for focused component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.focus('comp-1');

      expect(inputManager.isFocused('comp-1')).toBe(true);
    });

    test('returns false for non-focused component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.focus('comp-1');

      expect(inputManager.isFocused('comp-2')).toBe(false);
    });

    test('returns false when nothing is focused', () => {
      expect(inputManager.isFocused('comp-1')).toBe(false);
    });
  });

  describe('setViewportHandler', () => {
    test('sets viewport handler', () => {
      const handler = () => {};
      inputManager.setViewportHandler(handler);

      expect(inputManager.viewportHandler).toBe(handler);
    });
  });

  describe('setVuettyInstance', () => {
    test('sets vuetty instance', () => {
      const vuetty = {};
      inputManager.setVuettyInstance(vuetty);

      expect(inputManager.vuettyInstance).toBe(vuetty);
    });
  });

  describe('getFocusedId', () => {
    test('returns focused component ID', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.focus('comp-1');

      expect(inputManager.getFocusedId()).toBe('comp-1');
    });

    test('returns null when nothing is focused', () => {
      expect(inputManager.getFocusedId()).toBe(null);
    });
  });

  describe('getComponentCount', () => {
    test('returns count of registered components', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});

      expect(inputManager.getComponentCount()).toBe(2);
    });

    test('returns 0 when no components', () => {
      expect(inputManager.getComponentCount()).toBe(0);
    });
  });

  describe('clear', () => {
    test('removes all components', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.clear();

      expect(inputManager.components.size).toBe(0);
      expect(inputManager.componentOrder).toEqual([]);
    });

    test('clears focused component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.focus('comp-1');
      inputManager.clear();

      expect(inputManager.focusedId.value).toBe(null);
    });
  });

  describe('edge cases', () => {
    test('handles multiple focus calls', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.focus('comp-1');
      inputManager.focus('comp-2');
      inputManager.focus('comp-1');

      expect(inputManager.focusedId.value).toBe('comp-1');
    });

    test('handles rapid register/unregister', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.unregisterComponent('comp-1');
      inputManager.registerComponent('comp-1', () => {});

      expect(inputManager.components.has('comp-1')).toBe(true);
    });

    test('handles focusing after clear', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.clear();
      inputManager.registerComponent('comp-2', () => {});

      expect(inputManager.focusedId.value).toBe('comp-2');
    });

    test('maintains component order on multiple registrations', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.registerComponent('comp-2', () => {});
      inputManager.registerComponent('comp-3', () => {});

      expect(inputManager.componentOrder).toEqual(['comp-1', 'comp-2', 'comp-3']);
    });

    test('handles all disabled components', () => {
      inputManager.registerComponent('comp-1', () => {}, { disabled: true });
      inputManager.registerComponent('comp-2', () => {}, { disabled: true });

      expect(inputManager.focusedId.value).toBe(null);
      expect(inputManager.focusNext()).toBe(false);
    });

    test('handles all non-focusable components', () => {
      inputManager.registerComponent('comp-1', () => {}, { focusable: false });
      inputManager.registerComponent('comp-2', () => {}, { focusable: false });

      expect(inputManager.focusedId.value).toBe(null);
    });

    test('handles single component focus cycling', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.focus('comp-1');
      inputManager.focusNext();

      expect(inputManager.focusedId.value).toBe('comp-1');
    });

    test('handles enabling then disabling component', () => {
      inputManager.registerComponent('comp-1', () => {});
      inputManager.setComponentDisabled('comp-1', true);
      inputManager.setComponentDisabled('comp-1', false);

      const component = inputManager.components.get('comp-1');
      expect(component.disabled).toBe(false);
    });
  });
});
