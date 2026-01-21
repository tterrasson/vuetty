/**
 * Test setup file for Vuetty TUI library
 * This file is executed before all tests
 */

import { beforeEach, afterEach } from 'bun:test';
import chalk from 'chalk';

// Disable Vue 3 warnings in tests globally
if (globalThis && !globalThis.__VUE_PROD_DEVTOOLS__) {
  globalThis.__VUE_PROD_DEVTOOLS__ = false;
  globalThis.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;
}

// Suppress console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('[Vue warn]')) {
    return; // Suppress Vue warnings
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('[Vue warn]')) {
    return; // Suppress Vue warnings
  }
  originalError.apply(console, args);
};


// Mock process.stdout for terminal operations
let originalStdout;
let mockStdoutData = [];

beforeEach(() => {
  // Force chalk colors for tests (no TTY detection)
  chalk.level = 3; // Force 16m colors

  // Save original stdout
  originalStdout = {
    write: process.stdout.write,
    rows: process.stdout.rows,
    columns: process.stdout.columns,
  };

  // Mock stdout.write to capture output
  mockStdoutData = [];
  process.stdout.write = (data) => {
    mockStdoutData.push(data.toString());
    return true;
  };

  // Set default terminal size for tests
  Object.defineProperty(process.stdout, 'rows', {
    value: 24,
    configurable: true,
  });
  Object.defineProperty(process.stdout, 'columns', {
    value: 80,
    configurable: true,
  });
});

afterEach(() => {
  // Restore original stdout
  if (originalStdout) {
    process.stdout.write = originalStdout.write;
    Object.defineProperty(process.stdout, 'rows', {
      value: originalStdout.rows,
      configurable: true,
    });
    Object.defineProperty(process.stdout, 'columns', {
      value: originalStdout.columns,
      configurable: true,
    });
  }
  mockStdoutData = [];
});

// Export helper to get captured stdout data
export function getCapturedOutput() {
  return mockStdoutData;
}

export function clearCapturedOutput() {
  mockStdoutData = [];
}
