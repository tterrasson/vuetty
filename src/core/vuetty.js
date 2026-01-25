// src/core/vuetty.js
import { createTUIRenderer } from './renderer.js';
import { TUINode } from './node.js';
import { InputManager } from './inputManager.js';
import { reactive } from 'vue';
import {
  VUETTY_INPUT_MANAGER_KEY,
  VUETTY_ROUTER_KEY,
  VUETTY_RENDERER_KEY,
  VUETTY_VIEWPORT_STATE_KEY,
  VUETTY_INSTANCE_KEY,
  VUETTY_THEME_KEY
} from './vuettyKeys.js';
import * as VuettyComponents from '@components/index.js';
import { setRenderContext } from './renderContext.js';
import { LogUpdate } from './logUpdate.js';
import { YogaLayoutEngine } from './layoutEngine.js';
import { getTerminalWidth, truncateWithAnsi } from '@utils/renderUtils.js';
import { processVisibleLines, clearLineCaches, getLineCacheStats } from './lineCache.js';
import { invalidateCache } from './memoization.js';
import { ClickMap } from './clickMap.js';
import { clearBoxCaches } from '@components/Box.js';
import { clearMarkdownCaches } from '@components/Markdown.js';
import { clearRendererCaches } from '@utils/markdownRenderer.js';
import {
  KEY_UP, KEY_DOWN, KEY_PAGEUP, KEY_PAGEDOWN,
  KEY_HOME, KEY_END, KEY_ESCAPE
} from '@utils/keyParser.js';
import { createTheme } from './theme.js';
import { colorToAnsiBg, colorToOSC11 } from '@utils/colorUtils.js';
import chalk from 'chalk';

/**
 * Vuetty - TUI Framework using Vue Custom Renderer
 * uses alternate screen buffer for clean rendering
 */

// Maximum click handlers to prevent memory leaks from unregistered handlers
const MAX_CLICK_HANDLERS = 200;

export class Vuetty {
  constructor(options = {}) {
    this.config = {...options};

    // Force chalk colors if requested (useful for tests)
    if (options.forceColors) {
      chalk.level = 3; // Force 16m colors
    }

    // Initialize theme from options
    this.theme = createTheme(options.theme || {});
    this.themeBgCode = colorToAnsiBg(this.theme?.background);

    // Initialize debug server if enabled (will be started in mount())
    this.debugServer = null;
    this.debugServerConfig = this.config.debugServer;

    this.rootContainer = new TUINode('root');
    this.rootContainer.vuettyViewport = this.viewport;

    // Reactive viewport version - incremented on resize to trigger re-renders
    this.viewportState = reactive({
      version: 0,
      width: 0,
      height: 0
    });

    this.app = null;
    this.renderer = null;
    this.currentOutput = '';
    this.resizeHandler = null;
    this.cleanupHandler = null;

    // Resize debounce timer
    this.resizeTimeout = null;

    // Rendering engine components
    this.layoutEngine = null;
    this.logUpdate = null;

    this.scrollThrottleMs = options.scrollThrottleMs ?? 16; // ~60fps max
    this.lastScrollTime = 0;
    this.pendingScrollRender = null;
    this.lastScrollOffset = 0;
    this.accumulatedScrollDelta = 0;  // Track total scroll during throttle

    // Cache for visible lines to avoid re-slicing
    this.visibleLinesCache = {
      offset: -1,
      lines: null,
      output: null
    };

    // Viewport state for global scrolling
    this.viewport = {
      scrollOffset: 0,
      contentHeight: 0,
      terminalHeight: 0,
      terminalWidth: 0,
      enabled: true,
      autoScrollToBottom: true,
      mouseWheelEnabled: true,
      mouseWheelScrollLines: options.mouseWheelScrollLines ?? 3,
      scrollIndicatorMode: options.scrollIndicatorMode || 'reserved',
      mouseTrackingEnabled: options.mouseTrackingEnabled ?? true,
      ...options.viewport
    };

    // Create InputManager for keyboard input handling
    this.inputManager = new InputManager({
      onExit: () => this.handleExit()
    });

    // Click handling system
    this.clickMap = new ClickMap();
    this.clickHandlers = new Map(); // componentId → click handler

    // Track handler registration order for LRU eviction
    this._handlerOrder = [];
  }

  /**
   * Install a plugin (must be called after createApp, before mount)
   * @param {Object} plugin - Vue plugin to install
   * @returns {Vuetty} - Returns this for chaining
   */
  use(plugin, ...options) {
    if (!this.app) {
      throw new Error('No app created. Call createApp() first.');
    }

    this.app.use(plugin, ...options);

    return this; // Chainable
  }

  /**
   * Handle exit signal (Ctrl+C)
   */
  handleExit() {
    this.unmount();
    process.exit(0);
  }

  /**
   * Enable mouse tracking (wheel scrolling)
   */
  enableMouseTracking() {
    if (this.viewport.mouseTrackingEnabled) return;

    process.stdout.write('\x1b[?1000h'); // Normal tracking (clicks only, no drag)
    process.stdout.write('\x1b[?1006h'); // SGR mouse mode

    this.viewport.mouseTrackingEnabled = true;
    this.render();
  }

  /**
   * Disable mouse tracking (allow native text selection)
   */
  disableMouseTracking() {
    if (!this.viewport.mouseTrackingEnabled) return;

    process.stdout.write('\x1b[?1006l'); // Disable SGR mode
    process.stdout.write('\x1b[?1000l'); // Disable normal tracking

    this.viewport.mouseTrackingEnabled = false;
    this.render();
  }

  /**
   * Toggle mouse tracking on/off (Alt+M)
   */
  toggleMouseTracking() {
    if (this.viewport.mouseTrackingEnabled) {
      this.disableMouseTracking();
    } else {
      this.enableMouseTracking();
    }
  }

  /**
   * Handle terminal resize event (SIGWINCH) with debounce
   * Debouncing prevents race conditions when multiple resize events fire rapidly
   */
  handleResize() {
    // Clear any pending resize
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Track if we're in rapid resize mode
    if (!this._resizeStartTime) {
      this._resizeStartTime = Date.now();
    }

    // Debounce: wait for resize to stabilize
    // Use longer debounce (100ms) for rapid resizing to reduce CPU usage
    const timeSinceStart = Date.now() - this._resizeStartTime;
    const debounceMs = timeSinceStart < 500 ? 100 : 50;

    this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = null;
      this._resizeStartTime = null;
      this.performResize();
    }, debounceMs);
  }

  /**
   * Actually perform the resize logic (called after debounce)
   */
  performResize() {
    // Update viewport dimensions from current terminal size
    this.viewport.terminalHeight = (process.stdout.rows || 24);
    this.viewport.terminalWidth = (process.stdout.columns || 80);

    // Reserve 1 line for scroll indicator if enabled
    if (this.viewport.scrollIndicatorMode === 'reserved') {
      this.viewport.terminalHeight -= 1;
    }

    this.updateMaxScrollOffset();

    // Update render context
    setRenderContext(this.viewport);

    // Clamp scroll position
    this.clampScrollOffset();

    // Update reactive viewport state
    this.viewportState.version++;
    this.viewportState.width = this.viewport.terminalWidth;
    this.viewportState.height = this.viewport.terminalHeight;

    // Capture resize event for debug server
    if (this.debugServer) {
      this.debugServer.captureEvent('vuetty.resize', {
        width: this.viewport.terminalWidth,
        height: this.viewport.terminalHeight,
        version: this.viewportState.version
      });
    }

    this.logUpdate.clear();

    // Only clear width-dependent caches on resize
    // Note: clearBoxCaches() clears chalk style cache which is NOT width-dependent
    // so we skip it here to avoid unnecessary re-creation
    clearLineCaches();

    // Clear visible lines cache (width-dependent)
    this.visibleLinesCache = {
      offset: -1,
      lines: null,
      output: null
    };

    // Invalidate layout cache (width-dependent)
    if (this.layoutEngine && this.rootContainer) {
      this.layoutEngine.invalidateLayout(this.rootContainer);
    }

    // Invalidate render cache (width-dependent)
    if (this.rootContainer) {
      invalidateCache(this.rootContainer, true);
    }

    // Invalidate click map
    this.clickMap.invalidate();

    // Force render with new dimensions
    if (this.renderer && this.renderer.forceUpdate) {
      this.renderer.forceUpdate();
    }
  }

  /**
   * Scroll viewport up by N lines
   */
  scrollUp(lines = 1) {
    const now = Date.now();
    const newOffset = Math.max(0, this.viewport.scrollOffset - lines);

    if (newOffset === this.viewport.scrollOffset) return;

    this.viewport.scrollOffset = newOffset;

    // Adjust clickMap Y positions (fast path - no rebuild needed)
    if (!this.clickMap.isDirty) {
      this.clickMap.adjustForScroll(newOffset);
    }

    // Throttle renders during rapid scrolling
    if (now - this.lastScrollTime < this.scrollThrottleMs) {
      // Accumulate delta (negative for up)
      this.accumulatedScrollDelta -= lines;

      if (!this.pendingScrollRender) {
        this.pendingScrollRender = setTimeout(() => {
          this.pendingScrollRender = null;
          const totalDelta = this.accumulatedScrollDelta;
          this.accumulatedScrollDelta = 0;
          this.renderScrollSafe(totalDelta);
        }, this.scrollThrottleMs);
      }
      return;
    }

    this.lastScrollTime = now;
    this.accumulatedScrollDelta = 0;
    this.renderScroll(-lines);
  }

  /**
   * Scroll viewport down by N lines
   */
  scrollDown(lines = 1) {
    const now = Date.now();
    const maxOffset = this.viewport.maxScrollOffset;
    const newOffset = Math.min(maxOffset, this.viewport.scrollOffset + lines);

    if (newOffset === this.viewport.scrollOffset) return;

    this.viewport.scrollOffset = newOffset;

    // Adjust clickMap Y positions (fast path - no rebuild needed)
    if (!this.clickMap.isDirty) {
      this.clickMap.adjustForScroll(newOffset);
    }

    if (now - this.lastScrollTime < this.scrollThrottleMs) {
      // Accumulate delta (positive for down)
      this.accumulatedScrollDelta += lines;

      if (!this.pendingScrollRender) {
        this.pendingScrollRender = setTimeout(() => {
          this.pendingScrollRender = null;
          const totalDelta = this.accumulatedScrollDelta;
          this.accumulatedScrollDelta = 0;
          this.renderScrollSafe(totalDelta);
        }, this.scrollThrottleMs);
      }
      return;
    }

    this.lastScrollTime = now;
    this.accumulatedScrollDelta = 0;
    this.renderScroll(lines);
  }

  /**
   * Safe scroll render - handles accumulated deltas from throttling
   * Falls back to full render for large deltas to prevent desync
   */
  renderScrollSafe(scrollDelta) {
    const absScroll = Math.abs(scrollDelta);

    // If delta is large, force full redraw to resync terminal state
    // Hardware scroll regions can desync with rapid/accumulated scrolls
    if (absScroll > this.viewport.terminalHeight / 2) {
      this.logUpdate.clear(); // Reset line cache
      this.render();          // Full render
    } else {
      this.renderScroll(scrollDelta);
    }
  }

  /**
   * Render after scroll - uses cached content, just changes visible slice
   */
  renderScroll(scrollDelta = 0) {
    const output = this.currentOutput;

    const cache = this.visibleLinesCache;
    let allLines;

    if (cache.output === output) {
      allLines = cache.lines;
    } else {
      allLines = output.split('\n');
      cache.output = output;
      cache.lines = allLines;
    }

    this.viewport.contentHeight = allLines.length;
    this.updateMaxScrollOffset();
    this.clampScrollOffset();

    const visibleStart = this.viewport.scrollOffset;
    const visibleEnd = Math.min(
      this.viewport.scrollOffset + this.viewport.terminalHeight,
      this.viewport.contentHeight
    );

    const visibleLines = allLines.slice(visibleStart, visibleEnd);
    const showIndicator = this.shouldShowScrollIndicator();

    // Pass theme background for full-width fill
    const croppedLines = processVisibleLines(
      visibleLines,
      this.viewport.terminalWidth,
      getTerminalWidth,
      truncateWithAnsi,
      this.themeBgCode
    );

    let displayOutput = croppedLines.join('\n');
    const contentAreaHeight = croppedLines.length;

    if (showIndicator) {
      displayOutput += '\n' + this.getScrollIndicator();
    }

    this.logUpdate.renderScroll(displayOutput, scrollDelta, contentAreaHeight);
    this.lastScrollOffset = this.viewport.scrollOffset;
  }

  /**
   * Scroll to top of content
   */
  scrollToTop() {
    if (this.viewport.scrollOffset === 0) return;
    this.viewport.scrollOffset = 0;

    // Adjust clickMap positions for scroll (fast path)
    if (!this.clickMap.isDirty && this.clickMap.regions.length > 0) {
      this.clickMap.adjustForScroll(0);
    }

    this.render();
  }

  /**
   * Scroll to bottom of content
   */
  scrollToBottom() {
    const maxOffset = this.viewport.maxScrollOffset;
    if (this.viewport.scrollOffset === maxOffset) return;
    this.viewport.scrollOffset = maxOffset;

    // Adjust clickMap positions for scroll (fast path)
    if (!this.clickMap.isDirty && this.clickMap.regions.length > 0) {
      this.clickMap.adjustForScroll(maxOffset);
    }

    this.render();
  }

  /**
   * Page up (scroll up by full terminal height)
   */
  pageUp() {
    this.scrollUp(this.viewport.terminalHeight);
  }

  /**
   * Page down (scroll down by full terminal height)
   */
  pageDown() {
    this.scrollDown(this.viewport.terminalHeight);
  }

  /**
   * Clamp scroll offset to valid bounds
   */
  clampScrollOffset() {
    const maxOffset = this.viewport.maxScrollOffset;
    this.viewport.scrollOffset = Math.max(0, Math.min(this.viewport.scrollOffset, maxOffset));
  }

  /**
   * Check if viewport is scrolled to bottom
   */
  isAtBottom() {
    const maxOffset = this.viewport.maxScrollOffset;
    return this.viewport.scrollOffset >= maxOffset;
  }

  /**
   * Handle viewport-level keyboard input
   * Returns true if key was handled, false to pass to components
   */
  handleViewportKey(parsedKey) {
    const hasFocus = this.inputManager.getFocusedId() !== null;

    // Shift+Up/Down: ALWAYS scroll viewport
    if (parsedKey.shift && parsedKey.key === KEY_UP) {
      this.scrollUp();
      return true;
    }

    if (parsedKey.shift && parsedKey.key === KEY_DOWN) {
      this.scrollDown();
      return true;
    }

    // Navigation keys only when no component focused
    if (!hasFocus) {
      if (parsedKey.key === KEY_PAGEUP) {
        this.pageUp();
        return true;
      }

      if (parsedKey.key === KEY_PAGEDOWN) {
        this.pageDown();
        return true;
      }

      if (parsedKey.key === KEY_UP) {
        this.scrollUp();
        return true;
      }

      if (parsedKey.key === KEY_DOWN) {
        this.scrollDown();
        return true;
      }

      if (parsedKey.key === KEY_HOME) {
        this.scrollToTop();
        return true;
      }

      if (parsedKey.key === KEY_END) {
        this.scrollToBottom();
        return true;
      }
    }

    // Escape: Blur focused component
    if (parsedKey.key === KEY_ESCAPE && hasFocus) {
      this.inputManager.blur();
      return true;
    }

    return false;
  }

  /**
   * Register a click handler for a component
   */
  registerClickHandler(componentId, handler) {
    // Remove from order list if re-registering
    const existingIndex = this._handlerOrder.indexOf(componentId);
    if (existingIndex !== -1) {
      this._handlerOrder.splice(existingIndex, 1);
    }

    // Add to end of order list
    this._handlerOrder.push(componentId);

    // Evict oldest handlers if over limit
    while (this._handlerOrder.length > MAX_CLICK_HANDLERS) {
      const oldestId = this._handlerOrder.shift();
      this.clickHandlers.delete(oldestId);
    }

    this.clickHandlers.set(componentId, handler);
  }

  /**
   * Unregister click handler
   */
  unregisterClickHandler(componentId) {
    this.clickHandlers.delete(componentId);
    const index = this._handlerOrder.indexOf(componentId);
    if (index !== -1) {
      this._handlerOrder.splice(index, 1);
    }
  }

  /**
   * Handle a click event
   * @param {number} x - Terminal X (1-indexed)
   * @param {number} y - Terminal Y (1-indexed)
   * @param {Object} event - Mouse event data
   * @returns {boolean} True if click was handled
   */
  handleClick(x, y, event) {
    // Rebuild click map if dirty
    if (this.clickMap.isDirty) {
      this.clickMap.build(
        this.rootContainer,
        this.viewport.scrollOffset,
        this.viewport.terminalHeight
      );
    }

    // Hit test with terminal coordinates (clickMap handles conversion)
    const componentId = this.clickMap.hitTest(x, y);

    if (this.debugServer) {
      this.debugServer.captureEvent('input.click', {
        x, y, componentId, handled: !!componentId
      });
    }

    if (componentId) {
      const handler = this.clickHandlers.get(componentId);
      if (handler) {
        // Track which component is currently pressed for release handling
        this._pressedComponentId = componentId;
        handler(event);
        // Force re-render after click handling
        this.inputManager.onInputChange();
        return true;
      }
    }

    return false;
  }

  /**
   * Handle a mouse release event
   * @param {number} x - Terminal X (1-indexed)
   * @param {number} y - Terminal Y (1-indexed)
   * @param {Object} event - Mouse event data
   * @returns {boolean} True if release was handled
   */
  handleRelease(x, y, event) {
    // Check if we have a pressed component
    if (!this._pressedComponentId) {
      return false;
    }

    const componentId = this._pressedComponentId;
    this._pressedComponentId = null;

    if (this.debugServer) {
      this.debugServer.captureEvent('input.release', {
        x, y, componentId
      });
    }

    // Call handler with release event
    const handler = this.clickHandlers.get(componentId);
    if (handler) {
      handler({ ...event, action: 'left_release' });
      // Force re-render after release handling
      this.inputManager.onInputChange();
      return true;
    }

    return false;
  }

  /**
   * Handle viewport-level mouse input (wheel scrolling and clicks)
   * Returns true if event was handled
   */
  handleViewportMouse(event) {
    if (!this.viewport.mouseWheelEnabled) {
      return false;
    }

    // Handle wheel scrolling
    if (event.action === 'wheel_up') {
      this.scrollUp(this.viewport.mouseWheelScrollLines);
      return true;
    }

    if (event.action === 'wheel_down') {
      this.scrollDown(this.viewport.mouseWheelScrollLines);
      return true;
    }

    // Handle clicks
    if (event.action === 'left_click') {
      return this.handleClick(event.x, event.y, event);
    }

    // Handle releases
    if (event.action === 'left_release') {
      return this.handleRelease(event.x, event.y, event);
    }

    return false;
  }

  /**
   * Provide a router instance to the app
   */
  provideRouter(router) {
    if (!this.app) {
      throw new Error('No app created. Call createApp() first.');
    }
    this.app.provide(VUETTY_ROUTER_KEY, router);
  }

  /**
   * Setup signal handlers for proper terminal restoration
   */
  setupCleanupHandlers() {
    const cleanup = () => {
      // Clear any pending resize timeout
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = null;
      }
      process.stdout.write('\x1b[?25h');   // Show cursor
      process.stdout.write('\x1b[?1049l'); // Exit alternate screen
    };

    this.cleanupHandler = cleanup;

    process.on('exit', this.cleanupHandler);

    process.on('SIGTERM', () => {
      cleanup();
      process.exit(0);
    });

    process.on('SIGHUP', () => {
      cleanup();
      process.exit(0);
    });

    process.on('uncaughtException', (err) => {
      cleanup();
      console.error('Uncaught exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      cleanup();
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  /**
   * Create a TUI app from a Vue component
   */
  createApp(rootComponent, rootProps = null) {
    this.renderer = createTUIRenderer({
      onUpdate: (output) => this.handleUpdate(output),
      rootContainer: this.rootContainer,
      beforeRender: (container) => {
        if (this.debugServer) {
          this.debugServer.captureEvent('layout.compute', {
            width: this.viewport.terminalWidth,
            height: this.viewport.terminalHeight
          });
        }

        // Check if layout will be recomputed BEFORE calling computeLayout
        // so we can invalidate clickMap if needed
        const hadLayoutDirty = container.isLayoutDirty || container.childrenDirty;

        this.layoutEngine.computeLayout(
          container,
          this.viewport.terminalWidth,
          this.viewport.terminalHeight
        );

        // Invalidate clickMap if layout was recomputed (not cache hit)
        if (hadLayoutDirty) {
          this.clickMap.invalidate();
        }
      },
      afterRender: (container) => {
        // Rebuild click map after render if dirty
        // Positions come from render tracking (_clickRegions on container)
        if (this.clickMap.isDirty) {
          this.clickMap.build(
            container,
            this.viewport.scrollOffset,
            this.viewport.terminalHeight
          );
        }
      }
    });

    this.renderer.vuettyInstance = this;
    this.app = this.renderer.createApp(rootComponent, rootProps);

    // Set up Vue error/warning handlers for debug server
    if (this.debugServer) {
      this.debugServer.interceptVueWarnings(this.app);
    }

    return this.app;
  }

  /**
   * Mount the app
   */
  mount() {
    if (!this.app) {
      throw new Error('No app created. Call createApp() first.');
    }

    // Build all ANSI codes in a single string to prevent race conditions
    let ansiCodes = '';

    // Enter alternate screen buffer and clear it
    ansiCodes += '\x1b[?1049h\x1b[2J\x1b[H';

    // Set terminal background color (OSC 11) if theme has background
    // OSC 11 expects rgb:rrrr/gggg/bbbb format
    if (this.theme?.background) {
      const bgRgbFormat = colorToOSC11(this.theme.background);
      if (bgRgbFormat) {
        ansiCodes += `\x1b]11;${bgRgbFormat}\x07`;
      }
    }

    // Hide cursor
    ansiCodes += '\x1b[?25l';

    // Enable mouse tracking (normal mode - no drag tracking)
    if (this.viewport.mouseTrackingEnabled) {
      ansiCodes += '\x1b[?1000h'; // Normal tracking (no drags)
      ansiCodes += '\x1b[?1006h'; // SGR mouse mode
    }

    // Send all codes at once to prevent race conditions
    process.stdout.write(ansiCodes);

    // Capture terminal dimensions FIRST
    this.viewport.terminalHeight = (process.stdout.rows || 24);
    this.viewport.terminalWidth = (process.stdout.columns || 80);

    // Reserve line for scroll indicator
    if (this.viewport.scrollIndicatorMode === 'reserved') {
      this.viewport.terminalHeight -= 1;
    }

    // Setup LogUpdate for incremental rendering
    this.logUpdate = new LogUpdate(process.stdout);

    // Initialize Yoga layout engine
    this.layoutEngine = new YogaLayoutEngine();

    // Setup cleanup handlers
    this.setupCleanupHandlers();

    // Initialize reactive viewport state
    this.viewportState.width = this.viewport.terminalWidth;
    this.viewportState.height = this.viewport.terminalHeight;

    // Set global render context
    setRenderContext(this.viewport);

    // Provide services to components
    this.app.provide(VUETTY_INPUT_MANAGER_KEY, this.inputManager);
    this.app.provide(VUETTY_RENDERER_KEY, this.renderer);
    this.app.provide(VUETTY_VIEWPORT_STATE_KEY, this.viewportState);
    this.app.provide(VUETTY_INSTANCE_KEY, this);
    this.app.provide(VUETTY_THEME_KEY, this.theme);

    this.app.mount(this.rootContainer);

    // Setup viewport handlers
    this.inputManager.setVuettyInstance(this);
    this.inputManager.setViewportHandler((event) => {
      if (event.action) {
        return this.handleViewportMouse(event);
      }
      return this.handleViewportKey(event);
    });

    // Enable input handling
    this.inputManager.enable();

    // Register global components
    this.registerGlobalComponents();

    // Listen for resize
    this.resizeHandler = () => this.handleResize();
    process.on('SIGWINCH', this.resizeHandler);

    // Start debug server
    if (this.debugServerConfig?.enabled) {
      import('../debug/DebugServer.js').then(async ({ DebugServer }) => {
        const { serializeViewport } = await import('../debug/serializer.js');

        this.debugServer = new DebugServer(this.debugServerConfig);
        this.debugServer.setVuettyInstance(this);
        this.clickMap.setDebugServer(this.debugServer);

        try {
          await this.debugServer.start();

          // Only log to terminal if console not captured
          if (!this.debugServer.consoleInterceptor?.isActive) {
            console.log(`Debug server running at http://${this.debugServer.config.host}:${this.debugServer.config.port}`);
          }

          // Capture mount event
          this.debugServer.captureEvent('vuetty.mount', {
            viewport: serializeViewport(this.viewport)
          });
        } catch (error) {
          console.error('[Vuetty] Failed to start debug server:', error);
        }
      });
    }

    return this;
  }

  /**
   * Unmount the app
   */
  unmount() {
    if (this.pendingScrollRender) {
      clearTimeout(this.pendingScrollRender);
      this.pendingScrollRender = null;
    }

    // Clear any pending resize timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    // Disable input handling and clear registered components
    this.inputManager.disable();
    this.inputManager.clear();

    // Remove resize listener
    if (this.resizeHandler) {
      process.removeListener('SIGWINCH', this.resizeHandler);
      this.resizeHandler = null;
    }

    // Remove cleanup handlers
    if (this.cleanupHandler) {
      process.removeListener('exit', this.cleanupHandler);
      process.removeListener('SIGTERM', this.cleanupHandler);
      process.removeListener('SIGHUP', this.cleanupHandler);
      process.removeListener('uncaughtException', this.cleanupHandler);
      process.removeListener('unhandledRejection', this.cleanupHandler);
      this.cleanupHandler = null;
    }

    if (this.app) {
      this.app.unmount();
    }

    if (this.logUpdate) {
      this.logUpdate.done();
      this.logUpdate = null;
    }

    // Clear layout engine cache to free any cached Yoga nodes
    if (this.layoutEngine) {
      this.layoutEngine.clearCache();
      this.layoutEngine = null;
    }

    this.clickHandlers.clear();
    this._handlerOrder.length = 0;

    if (this.clickMap) {
      this.clickMap.clear();
    }

    // Clear root container to release all node references
    if (this.rootContainer) {
      this.rootContainer.cleanup();
    }

    // Clear visible lines cache
    this.visibleLinesCache = {
      offset: -1,
      lines: null,
      output: null
    };

    // Disable mouse tracking
    if (this.viewport.mouseTrackingEnabled) {
      process.stdout.write('\x1b[?1006l');
      process.stdout.write('\x1b[?1000l');
    }

    // Stop debug server
    if (this.debugServer) {
      this.debugServer.captureEvent('vuetty.unmount', {});
      this.debugServer.stop();
    }

    // Restore terminal default background color before exiting
    process.stdout.write('\x1b]111\x07');  // OSC 111 resets to default

    // Exit alternate screen buffer
    process.stdout.write('\x1b[?1049l');

    // Show cursor
    process.stdout.write('\x1b[?25h');

    return this;
  }

  /**
   * Register all Vuetty components globally
   */
  registerGlobalComponents() {
    try {
      const components = Object.entries(VuettyComponents)
        .filter(([name, component]) => {
          return component &&
                 typeof component === 'object' &&
                 component.name &&
                 typeof component.setup === 'function';
        });

      components.forEach(([exportName, component]) => {
        if (this.app && typeof this.app.component === 'function') {
          this.app.component(component.name, component);
        }
      });
    } catch (error) {
      if (this.debugServer) {
        this.debugServer.captureEvent('vue.error', {
          message: 'Failed to register global components',
          error: error.message,
          stack: error.stack
        });
      }
    }
  }

  /**
   * Handle output updates from renderer
   */
  handleUpdate(output) {
    // Check if content actually changed
    const contentChanged = this.currentOutput !== output;

    this.currentOutput = output;
    // Invalidate visible lines cache when content changes
    this.visibleLinesCache.output = null;

    // Content changed - positions may have shifted, need to rebuild clickMap
    if (contentChanged) {
      this.clickMap.invalidate();
    }

    this.render();
  }

  /**
   * Check if scroll indicator should be shown
   */
  shouldShowScrollIndicator() {
    const effectiveHeight = this.viewport.scrollIndicatorMode === 'reserved'
      ? this.viewport.terminalHeight
      : (process.stdout.rows || 24);

    return this.viewport.contentHeight > effectiveHeight;
  }

  /**
   * Render current output to terminal
   */
  render() {
    const output = this.currentOutput;

    // Reuse cached lines array if output unchanged
    const cache = this.visibleLinesCache;
    let allLines;
    if (cache.output === output && cache.lines) {
      allLines = cache.lines;
    } else {
      allLines = output.split('\n');
      cache.output = output;
      cache.lines = allLines;
    }

    // Viewport-based rendering
    const oldContentHeight = this.viewport.contentHeight;
    this.viewport.contentHeight = allLines.length;
    this.updateMaxScrollOffset();

    // Auto-scroll to bottom when content grows
    if (this.viewport.autoScrollToBottom && oldContentHeight > 0) {
      const wasAtBottom = this.viewport.scrollOffset >= Math.max(0, oldContentHeight - this.viewport.terminalHeight) - 1;
      if (wasAtBottom && this.viewport.contentHeight > oldContentHeight) {
        const maxOffset = Math.max(0, this.viewport.contentHeight - this.viewport.terminalHeight);
        this.viewport.scrollOffset = maxOffset;
      }
    }

    this.clampScrollOffset();

    // Calculate visible range
    const visibleStart = this.viewport.scrollOffset;
    const visibleEnd = Math.min(
      this.viewport.scrollOffset + this.viewport.terminalHeight,
      this.viewport.contentHeight
    );
    const visibleLines = allLines.slice(visibleStart, visibleEnd);

    // Check if scroll indicator will be shown
    const showIndicator = this.shouldShowScrollIndicator();

    // Use cached line processing - pass theme background for full-width fill
    const croppedLines = processVisibleLines(
      visibleLines,
      this.viewport.terminalWidth,
      getTerminalWidth,
      truncateWithAnsi,
      this.themeBgCode
    );

    // Add scroll indicator
    let displayOutput = croppedLines.join('\n');
    if (showIndicator) {
      displayOutput += '\n' + this.getScrollIndicator();
    }

    this.logUpdate.render(displayOutput);

    // Ensure clickMap is in sync with current state
    if (this.clickMap.isDirty) {
      this.clickMap.build(this.rootContainer, this.viewport.scrollOffset, this.viewport.terminalHeight);
    } else if (this.clickMap.regions.length > 0 &&
               this.clickMap._scrollOffset !== this.viewport.scrollOffset) {
      this.clickMap.adjustForScroll(this.viewport.scrollOffset);
    }
  }

  /**
   * Generate scroll indicator text
   * Note: OSC 11 already sets terminal background, so we don't need ANSI bg codes
   */
  getScrollIndicator() {
    const {
      scrollOffset,
      contentHeight,
      terminalHeight,
      mouseTrackingEnabled
    } = this.viewport;
    const visibleStart = scrollOffset + 1;
    const visibleEnd = Math.min(scrollOffset + terminalHeight, contentHeight);

    const maxOffset = Math.max(0, contentHeight - terminalHeight);
    const scrollPercent = maxOffset > 0 ? Math.round((scrollOffset / maxOffset) * 100) : 0;

    const atTop = scrollOffset === 0;
    const atBottom = scrollOffset >= maxOffset;

    let indicator = '';

    if (atTop && atBottom) {
      indicator = `Lines ${visibleStart}-${visibleEnd} of ${contentHeight}`;
    } else if (atTop) {
      indicator = `[Top] ↓ Lines ${visibleStart}-${visibleEnd} of ${contentHeight}`;
    } else if (atBottom) {
      indicator = `↑ [Bottom] Lines ${visibleStart}-${visibleEnd} of ${contentHeight}`;
    } else {
      indicator = `↑ ${scrollPercent}% ↓ Lines ${visibleStart}-${visibleEnd} of ${contentHeight}`;
    }

    const modeIndicator = mouseTrackingEnabled ? ' [Scroll]' : ' [Select]';
    indicator += modeIndicator + ' (Alt+M)';

    // Pad to full terminal width
    const indicatorWidth = getTerminalWidth(indicator);
    const padding = Math.max(0, this.viewport.terminalWidth - indicatorWidth);
    const paddedIndicator = indicator + ' '.repeat(padding);

    // Apply theme background + dim style
    if (this.themeBgCode) {
      return this.themeBgCode + '\x1b[2m' + paddedIndicator + '\x1b[0m';
    }

    return '\x1b[2m' + paddedIndicator + '\x1b[0m';
  }

  /**
   * Clear terminal
   */
  clear() {
    process.stdout.write('\x1b[2J\x1b[0f');
    this.logUpdate.clear();
  }

  /**
   * Get current output as string (for testing)
   */
  getOutput() {
    return this.currentOutput;
  }

  updateMaxScrollOffset() {
    this.viewport.maxScrollOffset = Math.max(
      0,
      this.viewport.contentHeight - this.viewport.terminalHeight
    );
  }

  // ============================================================
  // MEMORY MANAGEMENT METHODS
  // ============================================================

  /**
   * Get comprehensive memory diagnostics
   * @returns {object} Memory statistics
   */
  getMemoryStats() {
    const stats = {
      timestamp: Date.now(),
      caches: {},
      nodeTree: {},
      viewport: {},
      process: {}
    };

    // Layout engine stats
    if (this.layoutEngine) {
      stats.caches.layoutEngine = this.layoutEngine.getStats();
    }

    // Line cache stats
    try {
      stats.caches.lineCache = getLineCacheStats();
    } catch (e) {
      stats.caches.lineCache = { error: e.message };
    }

    // Click map stats
    if (this.clickMap) {
      stats.caches.clickMap = this.clickMap.getStats ? this.clickMap.getStats() : {
        regions: this.clickMap.regions?.length || 0,
        isDirty: this.clickMap.isDirty
      };
    }

    // Click handlers
    stats.caches.clickHandlers = this.clickHandlers?.size || 0;

    // Node tree stats
    if (this.rootContainer) {
      stats.nodeTree = this._countNodes(this.rootContainer);
    }

    // Viewport stats
    stats.viewport = {
      contentHeight: this.viewport.contentHeight,
      outputLength: this.currentOutput?.length || 0,
      visibleLinesCached: this.visibleLinesCache?.output !== null
    };

    // Process memory (Node.js)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      stats.process = {
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100,
        rssMB: Math.round(mem.rss / 1024 / 1024 * 100) / 100,
        externalMB: Math.round((mem.external || 0) / 1024 / 1024 * 100) / 100
      };
    }

    return stats;
  }

  /**
   * Force clear all caches to reclaim memory
   * @returns {object} Memory stats after cleanup
   */
  clearAllCaches() {
    // Clear layout engine cache
    if (this.layoutEngine) {
      this.layoutEngine.clearCache();
    }

    // Clear line caches
    clearLineCaches();

    // Clear Box caches (string interning, chalk styles)
    clearBoxCaches();

    // Clear Markdown caches (token cache)
    clearMarkdownCaches();

    // Clear markdown renderer caches (style objects)
    clearRendererCaches();

    // Clear visible lines cache
    this.visibleLinesCache = {
      offset: -1,
      lines: null,
      output: null
    };

    // Invalidate all node caches
    if (this.rootContainer) {
      invalidateCache(this.rootContainer, true);
    }

    // Clear click map
    if (this.clickMap) {
      this.clickMap.clear();
    }

    // Clear logUpdate previous state
    if (this.logUpdate) {
      this.logUpdate.clear();
    }

    // Force GC if available (requires --expose-gc flag)
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }

    return this.getMemoryStats();
  }

  /**
   * Helper to count nodes in the tree
   * @private
   */
  _countNodes(node, depth = 0) {
    if (!node) return { total: 0, maxDepth: 0, withCache: 0, withLayoutCache: 0 };

    let total = 1;
    let maxDepth = depth;
    let withCache = node.cachedOutput !== null ? 1 : 0;
    let withLayoutCache = node.cachedLayoutMetrics !== null ? 1 : 0;

    if (node.children) {
      for (const child of node.children) {
        const childStats = this._countNodes(child, depth + 1);
        total += childStats.total;
        maxDepth = Math.max(maxDepth, childStats.maxDepth);
        withCache += childStats.withCache;
        withLayoutCache += childStats.withLayoutCache;
      }
    }

    return { total, maxDepth, withCache, withLayoutCache };
  }
}

/**
 * Factory function
 */
export function createVuetty(options) {
  return new Vuetty(options);
}

/**
 * Quick utility to create and mount a TUI app
 */
export function vuetty(component, options = {}) {
  const app = new Vuetty(options);
  app.createApp(component);
  app.mount();
  return app;
}

export default Vuetty;