// src/debug/DebugServer.js
import { ConsoleInterceptor } from './consoleInterceptor.js';
import { serializeViewport } from './serializer.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Debug Server for Vuetty
 * Provides a web interface to inspect TUI events, layout, and console output
 */
export class DebugServer {
  constructor(config = {}) {
    this.config = {
      port: 3000,
      host: 'localhost',
      captureConsole: true,
      treeCaptureIntervalMs: 2000,
      treeMaxDepth: 4,
      memoryStatsIntervalMs: 5000,
      ...config
    };

    this.clients = new Set();
    this.eventBuffer = [];
    this.maxBufferSize = 500;
    this.server = null;
    this.vuettyInstance = null;
    this.consoleInterceptor = null;
    this.latestLayoutTree = null;
    this.lastTreeCapture = 0;
    this.latestMemoryStats = null;
    this.memoryStatsInterval = null;
    this.cleanupInterval = null;
  }

  /**
   * Shallow serialize data to cut object references and prevent memory leaks
   */
  shallowSerialize(data) {
    if (data === null || data === undefined) return data;
    if (typeof data !== 'object') return data;

    try {
      return JSON.parse(JSON.stringify(data));
    } catch {
      return { error: 'Serialization failed' };
    }
  }

  /**
   * Set the Vuetty instance reference
   */
  setVuettyInstance(instance) {
    this.vuettyInstance = instance;
  }

  /**
   * Start the debug server
   */
  async start() {
    if (this.server) {
      return; // Already started
    }

    const self = this;
    const staticDir = join(__dirname, 'static');

    try {
      this.server = Bun.serve({
        port: this.config.port,
        hostname: this.config.host,

        fetch(req, server) {
          // Try to upgrade to WebSocket
          if (server.upgrade(req)) {
            return; // WebSocket connection established
          }

          // Serve static files
          const url = new URL(req.url);
          const routes = {
            '/': 'index.html',
            '/debug.js': 'debug.js',
            '/debug.css': 'debug.css',
            '/favicon.ico': 'favicon.ico'
          };

          const fileName = routes[url.pathname];
          if (!fileName) {
            const debugInfo = `404: ${url.pathname}\nAvailable routes: ${Object.keys(routes).join(', ')}`;
            return new Response(debugInfo, { status: 404 });
          }

          const filePath = join(staticDir, fileName);
          const file = Bun.file(filePath);
          return new Response(file);
        },

        websocket: {
          open(ws) {
            self.clients.add(ws);

            // Send initial state to new client (only recent events to reduce memory)
            const recentBuffer = self.eventBuffer.slice(-50);
            ws.send(JSON.stringify({
              type: 'init',
              data: {
                viewport: self.vuettyInstance ? serializeViewport(self.vuettyInstance.viewport) : null,
                buffer: recentBuffer,
                layoutTree: self.latestLayoutTree,
                memory: self.latestMemoryStats
              }
            }));
          },

          close(ws) {
            self.clients.delete(ws);
          },

          message(ws, message) {
            try {
              const msg = JSON.parse(message);

              // Handle commands from client
              if (msg.type === 'clear') {
                self.eventBuffer = [];
                self.broadcast({ type: 'cleared', data: {} });
              }
            } catch (error) {
              // Ignore invalid messages
            }
          }
        }
      });

      // Initialize console interceptor if enabled
      if (this.config.captureConsole) {
        this.consoleInterceptor = new ConsoleInterceptor(this);
        this.consoleInterceptor.activate();
      }

      this.startMemoryStats();
      this.startCleanupInterval();

      // Send server started event
      this.captureEvent('debug.server.started', {
        port: this.config.port,
        host: this.config.host,
        url: `http://${this.config.host}:${this.config.port}`
      });

    } catch (error) {
      throw new Error(`Failed to start debug server: ${error.message}`);
    }
  }

  /**
   * Stop the debug server
   */
  stop() {
    if (!this.server) {
      return;
    }

    this.stopMemoryStats();
    this.stopCleanupInterval();

    // Deactivate console interceptor
    if (this.consoleInterceptor) {
      this.consoleInterceptor.deactivate();
      this.consoleInterceptor = null;
    }

    // Close all client connections
    for (const client of this.clients) {
      client.close();
    }
    this.clients.clear();

    // Stop server
    this.server.stop();
    this.server = null;

    // Clear all references to prevent memory leaks
    this.eventBuffer = [];
    this.latestLayoutTree = null;
    this.latestMemoryStats = null;
  }

  /**
   * Set up Vue error and warning handlers
   */
  interceptVueWarnings(app) {
    if (!this.consoleInterceptor) {
      return;
    }

    this.consoleInterceptor.interceptVueWarnings(app);
  }

  /**
   * Capture render completion with throttled tree serialization
   */
  captureRenderComplete({ duration, outputLength, rootContainer }) {
    this.captureEvent('render.complete', {
      duration,
      outputLength
    });

    if (!rootContainer) return;

    const now = Date.now();
    if (now - this.lastTreeCapture < this.config.treeCaptureIntervalMs) {
      return;
    }

    this.lastTreeCapture = now;

    import('./serializer.js').then(({ serializeNodeTree }) => {
      const tree = serializeNodeTree(rootContainer, 0, this.config.treeMaxDepth);
      this.latestLayoutTree = tree;
      this.broadcast({
        timestamp: Date.now(),
        type: 'layout.tree',
        data: { tree }
      });
    }).catch(() => {});
  }

  /**
   * Start periodic memory stats capture
   */
  startMemoryStats() {
    if (this.memoryStatsInterval) return;
    if (!this.config.memoryStatsIntervalMs || this.config.memoryStatsIntervalMs <= 0) return;

    this.memoryStatsInterval = setInterval(() => {
      if (!this.vuettyInstance || typeof this.vuettyInstance.getMemoryStats !== 'function') {
        return;
      }

      const stats = this.vuettyInstance.getMemoryStats();
      this.latestMemoryStats = stats;
      this.broadcast({
        timestamp: stats.timestamp || Date.now(),
        type: 'vuetty.memory',
        data: stats
      });
    }, this.config.memoryStatsIntervalMs);
  }

  /**
   * Stop periodic memory stats capture
   */
  stopMemoryStats() {
    if (this.memoryStatsInterval) {
      clearInterval(this.memoryStatsInterval);
      this.memoryStatsInterval = null;
    }
  }

  /**
   * Start periodic cleanup to prevent memory accumulation
   */
  startCleanupInterval() {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      // Trim buffer if it grows too large
      if (this.eventBuffer.length > 200) {
        this.eventBuffer = this.eventBuffer.slice(-200);
      }
    }, 30000);
  }

  /**
   * Stop periodic cleanup
   */
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Capture an event and add to buffer
   */
  captureEvent(type, data) {
    const event = {
      timestamp: Date.now(),
      type,
      data: this.shallowSerialize(data)
    };

    // Add to buffer
    this.eventBuffer.push(event);

    // Maintain buffer size limit
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.shift();
    }

    // Broadcast to all connected clients
    this.broadcast(event);
  }

  /**
   * Broadcast an event to all connected clients
   */
  broadcast(event) {
    const message = JSON.stringify(event);

    for (const client of this.clients) {
      try {
        client.send(message);
      } catch (error) {
        // Client may have disconnected
        this.clients.delete(client);
      }
    }
  }
}
