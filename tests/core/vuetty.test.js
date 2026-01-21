/**
 * Essential tests for Vuetty
 * Tests core functionality with minimal mocking
 *
 * Note: This file uses isolated mocks to avoid conflicts with other tests
 */

import { test, expect, describe, beforeEach, afterEach, mock } from 'bun:test';
import { Vuetty } from '../../src/core/vuetty.js';

// Store original process.stdout
const originalStdout = process.stdout;

// Mock process.stdout to avoid actual terminal writes
const mockStdout = {
  rows: 24,
  columns: 80,
  write: mock(() => true),
  on: mock(() => {}),
  removeListener: mock(() => {})
};

describe('Vuetty - Constructor and Initialization', () => {
  let vuetty;

  beforeEach(() => {
    // Replace process.stdout with mock
    Object.defineProperty(process, 'stdout', { value: mockStdout, writable: true });
  });

  afterEach(() => {
    if (vuetty) {
      // Don't call unmount as it interacts with real process
      vuetty = null;
    }
    // Restore original stdout
    Object.defineProperty(process, 'stdout', { value: originalStdout, writable: true });
  });

  test('initializes root container', () => {
    vuetty = new Vuetty();

    expect(vuetty.rootContainer).toBeDefined();
    expect(vuetty.rootContainer.type).toBe('root');
  });

  test('initializes viewport state', () => {
    vuetty = new Vuetty();

    expect(vuetty.viewportState).toBeDefined();
    expect(vuetty.viewportState.version).toBe(0);
    expect(vuetty.viewportState.width).toBe(0);
    expect(vuetty.viewportState.height).toBe(0);
  });

  test('initializes viewport configuration', () => {
    vuetty = new Vuetty();

    expect(vuetty.viewport.scrollOffset).toBe(0);
    expect(vuetty.viewport.contentHeight).toBe(0);
    expect(vuetty.viewport.autoScrollToBottom).toBe(true);
    expect(vuetty.viewport.mouseWheelEnabled).toBe(true);
    expect(vuetty.viewport.mouseWheelScrollLines).toBe(3);
  });

  test('accepts custom viewport options', () => {
    vuetty = new Vuetty({
      viewport: {
        autoScrollToBottom: false,
        mouseWheelEnabled: false,
        mouseWheelScrollLines: 5
      }
    });

    expect(vuetty.viewport.autoScrollToBottom).toBe(false);
    expect(vuetty.viewport.mouseWheelEnabled).toBe(false);
    expect(vuetty.viewport.mouseWheelScrollLines).toBe(5);
  });

  test('initializes InputManager', () => {
    vuetty = new Vuetty();

    expect(vuetty.inputManager).toBeDefined();
  });

  test('initializes ClickMap', () => {
    vuetty = new Vuetty();

    expect(vuetty.clickMap).toBeDefined();
    expect(vuetty.clickHandlers).toBeInstanceOf(Map);
  });

  test('initializes with null app and renderer', () => {
    vuetty = new Vuetty();

    expect(vuetty.app).toBeNull();
    expect(vuetty.renderer).toBeNull();
  });
});

describe('Vuetty - Viewport Calculations', () => {
  let vuetty;

  beforeEach(() => {
    Object.defineProperty(process, 'stdout', { value: mockStdout, writable: true });
    vuetty = new Vuetty();
    vuetty.viewport.terminalHeight = 24;
    vuetty.viewport.terminalWidth = 80;
  });

  afterEach(() => {
    vuetty = null;
    Object.defineProperty(process, 'stdout', { value: originalStdout, writable: true });
  });

  test('updateMaxScrollOffset calculates correct max offset', () => {
    vuetty.viewport.contentHeight = 100;
    vuetty.viewport.terminalHeight = 24;

    vuetty.updateMaxScrollOffset();

    expect(vuetty.viewport.maxScrollOffset).toBe(76); // 100 - 24
  });

  test('updateMaxScrollOffset handles content smaller than terminal', () => {
    vuetty.viewport.contentHeight = 10;
    vuetty.viewport.terminalHeight = 24;

    vuetty.updateMaxScrollOffset();

    expect(vuetty.viewport.maxScrollOffset).toBe(0);
  });

  test('clampScrollOffset clamps to zero', () => {
    vuetty.viewport.scrollOffset = -10;
    vuetty.viewport.maxScrollOffset = 50;

    vuetty.clampScrollOffset();

    expect(vuetty.viewport.scrollOffset).toBe(0);
  });

  test('clampScrollOffset clamps to max', () => {
    vuetty.viewport.scrollOffset = 100;
    vuetty.viewport.maxScrollOffset = 50;

    vuetty.clampScrollOffset();

    expect(vuetty.viewport.scrollOffset).toBe(50);
  });

  test('clampScrollOffset leaves valid offset unchanged', () => {
    vuetty.viewport.scrollOffset = 25;
    vuetty.viewport.maxScrollOffset = 50;

    vuetty.clampScrollOffset();

    expect(vuetty.viewport.scrollOffset).toBe(25);
  });

  test('isAtBottom returns true when at bottom', () => {
    vuetty.viewport.scrollOffset = 50;
    vuetty.viewport.maxScrollOffset = 50;

    expect(vuetty.isAtBottom()).toBe(true);
  });

  test('isAtBottom returns false when not at bottom', () => {
    vuetty.viewport.scrollOffset = 25;
    vuetty.viewport.maxScrollOffset = 50;

    expect(vuetty.isAtBottom()).toBe(false);
  });

  test('shouldShowScrollIndicator returns true when content exceeds viewport', () => {
    vuetty.viewport.terminalHeight = 24;
    vuetty.viewport.contentHeight = 100;
    vuetty.viewport.scrollIndicatorMode = 'reserved';

    expect(vuetty.shouldShowScrollIndicator()).toBe(true);
  });

  test('shouldShowScrollIndicator returns false when content fits', () => {
    vuetty.viewport.terminalHeight = 24;
    vuetty.viewport.contentHeight = 20;
    vuetty.viewport.scrollIndicatorMode = 'reserved';

    expect(vuetty.shouldShowScrollIndicator()).toBe(false);
  });
});

describe('Vuetty - Scrolling', () => {
  let vuetty;

  beforeEach(() => {
    Object.defineProperty(process, 'stdout', { value: mockStdout, writable: true });
    vuetty = new Vuetty();
    vuetty.viewport.terminalHeight = 24;
    vuetty.viewport.contentHeight = 100;
    vuetty.viewport.scrollOffset = 0;
    vuetty.updateMaxScrollOffset();

    // Mock render methods
    vuetty.render = mock(() => {});
    vuetty.renderScroll = mock(() => {});
  });

  afterEach(() => {
    if (vuetty.pendingScrollRender) {
      clearTimeout(vuetty.pendingScrollRender);
    }
    vuetty = null;
    Object.defineProperty(process, 'stdout', { value: originalStdout, writable: true });
  });

  test('scrollUp decreases scroll offset', () => {
    vuetty.viewport.scrollOffset = 10;

    vuetty.scrollUp(5);

    expect(vuetty.viewport.scrollOffset).toBe(5);
  });

  test('scrollUp clamps at zero', () => {
    vuetty.viewport.scrollOffset = 3;

    vuetty.scrollUp(5);

    expect(vuetty.viewport.scrollOffset).toBe(0);
  });

  test('scrollUp does nothing when already at top', () => {
    vuetty.viewport.scrollOffset = 0;
    const initialOffset = vuetty.viewport.scrollOffset;

    vuetty.scrollUp(5);

    expect(vuetty.viewport.scrollOffset).toBe(initialOffset);
  });

  test('scrollDown increases scroll offset', () => {
    vuetty.viewport.scrollOffset = 10;

    vuetty.scrollDown(5);

    expect(vuetty.viewport.scrollOffset).toBe(15);
  });

  test('scrollDown clamps at max', () => {
    vuetty.viewport.scrollOffset = 74; // max is 76 (100 - 24)

    vuetty.scrollDown(5);

    expect(vuetty.viewport.scrollOffset).toBe(76);
  });

  test('scrollDown does nothing when already at bottom', () => {
    vuetty.viewport.scrollOffset = 76; // max
    const initialOffset = vuetty.viewport.scrollOffset;

    vuetty.scrollDown(5);

    expect(vuetty.viewport.scrollOffset).toBe(initialOffset);
  });

  test('scrollToTop sets offset to zero', () => {
    vuetty.viewport.scrollOffset = 50;

    vuetty.scrollToTop();

    expect(vuetty.viewport.scrollOffset).toBe(0);
    expect(vuetty.render).toHaveBeenCalled();
  });

  test('scrollToBottom sets offset to max', () => {
    vuetty.viewport.scrollOffset = 10;

    vuetty.scrollToBottom();

    expect(vuetty.viewport.scrollOffset).toBe(76); // 100 - 24
    expect(vuetty.render).toHaveBeenCalled();
  });

  test('pageUp scrolls by terminal height', () => {
    vuetty.viewport.scrollOffset = 50;
    vuetty.scrollUp = mock(() => {});

    vuetty.pageUp();

    expect(vuetty.scrollUp).toHaveBeenCalledWith(24);
  });

  test('pageDown scrolls by terminal height', () => {
    vuetty.viewport.scrollOffset = 10;
    vuetty.scrollDown = mock(() => {});

    vuetty.pageDown();

    expect(vuetty.scrollDown).toHaveBeenCalledWith(24);
  });
});

describe('Vuetty - Click Handlers', () => {
  let vuetty;

  beforeEach(() => {
    Object.defineProperty(process, 'stdout', { value: mockStdout, writable: true });
    vuetty = new Vuetty();
  });

  afterEach(() => {
    vuetty = null;
    Object.defineProperty(process, 'stdout', { value: originalStdout, writable: true });
  });

  test('registerClickHandler adds handler', () => {
    const handler = mock(() => {});

    vuetty.registerClickHandler('btn1', handler);

    expect(vuetty.clickHandlers.has('btn1')).toBe(true);
    expect(vuetty.clickHandlers.get('btn1')).toBe(handler);
  });

  test('unregisterClickHandler removes handler', () => {
    const handler = mock(() => {});
    vuetty.registerClickHandler('btn1', handler);

    vuetty.unregisterClickHandler('btn1');

    expect(vuetty.clickHandlers.has('btn1')).toBe(false);
  });

  test('multiple handlers can be registered', () => {
    const handler1 = mock(() => {});
    const handler2 = mock(() => {});

    vuetty.registerClickHandler('btn1', handler1);
    vuetty.registerClickHandler('btn2', handler2);

    expect(vuetty.clickHandlers.size).toBe(2);
    expect(vuetty.clickHandlers.get('btn1')).toBe(handler1);
    expect(vuetty.clickHandlers.get('btn2')).toBe(handler2);
  });
});

describe('Vuetty - Mouse Tracking', () => {
  let vuetty;
  let writeCallCount;

  beforeEach(() => {
    writeCallCount = 0;
    const mockWrite = mock(() => {
      writeCallCount++;
      return true;
    });
    Object.defineProperty(process, 'stdout', {
      value: { ...mockStdout, write: mockWrite },
      writable: true
    });
    vuetty = new Vuetty();
    vuetty.render = mock(() => {});
  });

  afterEach(() => {
    vuetty = null;
    Object.defineProperty(process, 'stdout', { value: originalStdout, writable: true });
  });

  test('enableMouseTracking sets flag and writes escape sequences', () => {
    vuetty.viewport.mouseTrackingEnabled = false;

    vuetty.enableMouseTracking();

    expect(vuetty.viewport.mouseTrackingEnabled).toBe(true);
    expect(writeCallCount).toBeGreaterThan(0);
  });

  test('enableMouseTracking does nothing if already enabled', () => {
    vuetty.viewport.mouseTrackingEnabled = true;
    writeCallCount = 0;

    vuetty.enableMouseTracking();

    expect(writeCallCount).toBe(0);
  });

  test('disableMouseTracking clears flag and writes escape sequences', () => {
    vuetty.viewport.mouseTrackingEnabled = true;

    vuetty.disableMouseTracking();

    expect(vuetty.viewport.mouseTrackingEnabled).toBe(false);
    expect(writeCallCount).toBeGreaterThan(0);
  });

  test('disableMouseTracking does nothing if already disabled', () => {
    vuetty.viewport.mouseTrackingEnabled = false;
    writeCallCount = 0;

    vuetty.disableMouseTracking();

    expect(writeCallCount).toBe(0);
  });

  test('toggleMouseTracking enables when disabled', () => {
    vuetty.viewport.mouseTrackingEnabled = false;

    vuetty.toggleMouseTracking();

    expect(vuetty.viewport.mouseTrackingEnabled).toBe(true);
  });

  test('toggleMouseTracking disables when enabled', () => {
    vuetty.viewport.mouseTrackingEnabled = true;

    vuetty.toggleMouseTracking();

    expect(vuetty.viewport.mouseTrackingEnabled).toBe(false);
  });
});

describe('Vuetty - Output Management', () => {
  let vuetty;

  beforeEach(() => {
    Object.defineProperty(process, 'stdout', { value: mockStdout, writable: true });
    vuetty = new Vuetty();
  });

  afterEach(() => {
    vuetty = null;
    Object.defineProperty(process, 'stdout', { value: originalStdout, writable: true });
  });

  test('handleUpdate stores output', () => {
    vuetty.render = mock(() => {});
    const output = 'Line 1\nLine 2\nLine 3';

    vuetty.handleUpdate(output);

    expect(vuetty.currentOutput).toBe(output);
  });

  test('handleUpdate invalidates visible lines cache', () => {
    vuetty.render = mock(() => {});
    vuetty.visibleLinesCache.output = 'old';

    vuetty.handleUpdate('new output');

    expect(vuetty.visibleLinesCache.output).toBeNull();
  });

  test('handleUpdate calls render', () => {
    vuetty.render = mock(() => {});

    vuetty.handleUpdate('output');

    expect(vuetty.render).toHaveBeenCalled();
  });

  test('getOutput returns current output', () => {
    vuetty.currentOutput = 'Test output';

    expect(vuetty.getOutput()).toBe('Test output');
  });
});

describe('Vuetty - Scroll Indicator', () => {
  let vuetty;

  beforeEach(() => {
    Object.defineProperty(process, 'stdout', { value: mockStdout, writable: true });
    vuetty = new Vuetty();
    vuetty.viewport.terminalHeight = 24;
    vuetty.viewport.contentHeight = 100;
    vuetty.viewport.mouseTrackingEnabled = true;
  });

  afterEach(() => {
    vuetty = null;
    Object.defineProperty(process, 'stdout', { value: originalStdout, writable: true });
  });

  test('getScrollIndicator shows top position', () => {
    vuetty.viewport.scrollOffset = 0;
    vuetty.updateMaxScrollOffset();

    const indicator = vuetty.getScrollIndicator();

    expect(indicator).toContain('[Top]');
    expect(indicator).toContain('1-24 of 100');
  });

  test('getScrollIndicator shows bottom position', () => {
    vuetty.viewport.scrollOffset = 76; // 100 - 24
    vuetty.updateMaxScrollOffset();

    const indicator = vuetty.getScrollIndicator();

    expect(indicator).toContain('[Bottom]');
    expect(indicator).toContain('77-100 of 100');
  });

  test('getScrollIndicator shows middle position with percentage', () => {
    vuetty.viewport.scrollOffset = 38; // ~50%
    vuetty.updateMaxScrollOffset();

    const indicator = vuetty.getScrollIndicator();

    expect(indicator).toContain('%');
    expect(indicator).toContain('39-62 of 100');
  });

  test('getScrollIndicator shows scroll mode indicator', () => {
    vuetty.viewport.mouseTrackingEnabled = true;

    const indicator = vuetty.getScrollIndicator();

    expect(indicator).toContain('[Scroll]');
    expect(indicator).toContain('(Alt+M)');
  });

  test('getScrollIndicator shows select mode indicator', () => {
    vuetty.viewport.mouseTrackingEnabled = false;

    const indicator = vuetty.getScrollIndicator();

    expect(indicator).toContain('[Select]');
    expect(indicator).toContain('(Alt+M)');
  });

  test('getScrollIndicator handles content equals viewport', () => {
    vuetty.viewport.contentHeight = 24;
    vuetty.viewport.scrollOffset = 0;
    vuetty.updateMaxScrollOffset();

    const indicator = vuetty.getScrollIndicator();

    expect(indicator).toContain('1-24 of 24');
    expect(indicator).not.toContain('[Top]');
    expect(indicator).not.toContain('[Bottom]');
  });
});

describe('Vuetty - Resize Handling', () => {
  let vuetty;

  beforeEach(() => {
    Object.defineProperty(process, 'stdout', { value: mockStdout, writable: true });
    vuetty = new Vuetty();
    vuetty.logUpdate = { clear: mock(() => {}) };
    vuetty.layoutEngine = { invalidateLayout: mock(() => {}) };
    vuetty.clickMap = { invalidate: mock(() => {}) };
    vuetty.renderer = { forceUpdate: mock(() => {}) };
  });

  afterEach(() => {
    if (vuetty.resizeTimeout) {
      clearTimeout(vuetty.resizeTimeout);
    }
    vuetty = null;
    Object.defineProperty(process, 'stdout', { value: originalStdout, writable: true });
  });

  test('handleResize debounces multiple calls', (done) => {
    vuetty.performResize = mock(() => {});

    vuetty.handleResize();
    vuetty.handleResize();
    vuetty.handleResize();

    // Should only call performResize once after debounce
    // Note: debounce is 100ms during rapid resize, so we wait 150ms
    setTimeout(() => {
      expect(vuetty.performResize).toHaveBeenCalledTimes(1);
      done();
    }, 150);
  });

  test('performResize updates viewport dimensions', () => {
    process.stdout.rows = 30;
    process.stdout.columns = 100;
    vuetty.viewport.scrollIndicatorMode = 'reserved';

    vuetty.performResize();

    expect(vuetty.viewport.terminalHeight).toBe(29); // 30 - 1 for indicator
    expect(vuetty.viewport.terminalWidth).toBe(100);
  });

  test('performResize updates reactive viewport state', () => {
    process.stdout.rows = 30;
    process.stdout.columns = 100;
    const initialVersion = vuetty.viewportState.version;

    vuetty.performResize();

    expect(vuetty.viewportState.version).toBe(initialVersion + 1);
    expect(vuetty.viewportState.width).toBe(100);
    expect(vuetty.viewportState.height).toBe(29);
  });

  test('performResize clears logUpdate', () => {
    vuetty.performResize();

    expect(vuetty.logUpdate.clear).toHaveBeenCalled();
  });

  test('performResize invalidates layout engine', () => {
    vuetty.performResize();

    expect(vuetty.layoutEngine.invalidateLayout).toHaveBeenCalledWith(vuetty.rootContainer);
  });

  test('performResize invalidates click map', () => {
    vuetty.performResize();

    expect(vuetty.clickMap.invalidate).toHaveBeenCalled();
  });

  test('performResize forces renderer update', () => {
    vuetty.performResize();

    expect(vuetty.renderer.forceUpdate).toHaveBeenCalled();
  });
});
