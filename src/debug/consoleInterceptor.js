// src/debug/consoleInterceptor.js

/**
 * Console Interceptor
 * Intercepts console.log/error/warn and redirects to debug server
 * Also intercepts Vue.js warnings and errors
 */
export class ConsoleInterceptor {
  constructor(debugServer) {
    this.debugServer = debugServer;
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn
    };
    this.isActive = false;
  }

  /**
   * Activate console interception
   */
  activate() {
    if (this.isActive) {
      return;
    }

    const self = this;

    // Intercept console.log
    console.log = (...args) => {
      self.debugServer.captureEvent('console.log', {
        args: args.map(arg => self.serialize(arg))
      });
    };

    // Intercept console.error
    console.error = (...args) => {
      self.debugServer.captureEvent('console.error', {
        args: args.map(arg => self.serialize(arg))
      });
    };

    // Intercept console.warn
    console.warn = (...args) => {
      self.debugServer.captureEvent('console.warn', {
        args: args.map(arg => self.serialize(arg))
      });
    };

    this.isActive = true;
  }

  /**
   * Deactivate console interception
   */
  deactivate() {
    if (!this.isActive) {
      return;
    }

    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;

    this.isActive = false;
  }

  /**
   * Set up Vue.js error and warning handlers
   */
  interceptVueWarnings(app) {
    const self = this;

    // Capture Vue warnings
    app.config.warnHandler = (msg, instance, trace) => {
      self.debugServer.captureEvent('vue.warn', {
        message: msg,
        trace: trace || '',
        component: instance?.$options?.name || instance?.__name || 'Anonymous'
      });
    };

    // Capture Vue errors
    app.config.errorHandler = (err, instance, info) => {
      self.debugServer.captureEvent('vue.error', {
        message: err.message || String(err),
        stack: err.stack || '',
        info: info || '',
        component: instance?.$options?.name || instance?.__name || 'Anonymous'
      });
    };
  }

  /**
   * Serialize a value to string for sending over WebSocket
   */
  serialize(value) {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (value === null) {
      return 'null';
    }

    if (value === undefined) {
      return 'undefined';
    }

    if (value instanceof Error) {
      return `${value.name}: ${value.message}\n${value.stack || ''}`;
    }

    // Try to JSON stringify
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      // Circular reference or non-serializable
      return String(value);
    }
  }
}
