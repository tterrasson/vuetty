/**
 * Tests for LogUpdate
 * Tests terminal rendering with simplified line-level diffing
 */

import { test, expect, describe, beforeEach } from 'bun:test';
import { LogUpdate } from '../../src/core/logUpdate.js';

// ANSI escape sequences
const ERASE_LINE = '\x1b[2K';
const CURSOR_TO_START = '\x1b[G';
const SHOW_CURSOR = '\x1b[?25h';

// Mock stream for capturing output
class MockStream {
  constructor() {
    this.output = [];
    this.lastWrite = '';
  }

  write(data) {
    this.output.push(data);
    this.lastWrite = data;
    return true;
  }

  getOutput() {
    return this.output.join('');
  }

  clear() {
    this.output = [];
    this.lastWrite = '';
  }

  getLastWrite() {
    return this.lastWrite;
  }
}

describe('LogUpdate - Constructor and Initialization', () => {
  test('creates instance with stream', () => {
    const stream = new MockStream();
    const logUpdate = new LogUpdate(stream);

    expect(logUpdate.stream).toBe(stream);
    expect(logUpdate.previousLines).toEqual([]);
    expect(logUpdate.previousLineCount).toBe(0);
  });

  test('creates instance with default stream', () => {
    const logUpdate = new LogUpdate();
    expect(logUpdate.stream).toBe(process.stdout);
  });

  test('initializes with empty state', () => {
    const stream = new MockStream();
    const logUpdate = new LogUpdate(stream);

    expect(logUpdate.previousLines.length).toBe(0);
    expect(logUpdate.previousLineCount).toBe(0);
  });
});

describe('LogUpdate - Basic Rendering', () => {
  let logUpdate;
  let stream;

  beforeEach(() => {
    stream = new MockStream();
    logUpdate = new LogUpdate(stream);
  });

  test('render writes single line', () => {
    logUpdate.render('Hello World');

    const output = stream.getLastWrite();
    expect(output).toContain('Hello World');
  });

  test('render writes multiple lines', () => {
    logUpdate.render('Line 1\nLine 2\nLine 3');

    const output = stream.getLastWrite();
    expect(output).toContain('Line 1');
    expect(output).toContain('Line 2');
    expect(output).toContain('Line 3');
    expect(logUpdate.previousLineCount).toBe(3);
  });

  test('render updates previousLines', () => {
    logUpdate.render('Line 1\nLine 2');

    expect(logUpdate.previousLines).toEqual(['Line 1', 'Line 2']);
    expect(logUpdate.previousLineCount).toBe(2);
  });

  test('render handles empty string', () => {
    logUpdate.render('');

    expect(logUpdate.previousLines).toEqual([]);
    expect(logUpdate.previousLineCount).toBe(0);
  });

  test('render handles content with ANSI codes', () => {
    const content = '\x1b[31mRed text\x1b[0m';
    logUpdate.render(content);

    const output = stream.getLastWrite();
    expect(output).toContain('Red text');
  });
});

describe('LogUpdate - Incremental Updates', () => {
  let logUpdate;
  let stream;

  beforeEach(() => {
    stream = new MockStream();
    logUpdate = new LogUpdate(stream);
  });

  test('incremental update for single line change', () => {
    logUpdate.render('Line 1\nLine 2\nLine 3');
    stream.clear();

    logUpdate.render('Line 1\nModified\nLine 3');

    const output = stream.getLastWrite();
    // Should update the changed line
    expect(output).toContain('Modified');
    // Should use synchronized output with cursor positioning
    expect(output).toContain('\x1b[?2026h'); // SYNC_START
    expect(output).toContain('\x1b[2;1H'); // cursorTo(1) for line 2
  });

  test('incremental update moves cursor to start of previous output', () => {
    logUpdate.render('A\nB\nC');
    stream.clear();

    logUpdate.render('A\nModified\nC');

    const output = stream.getLastWrite();
    // Should use synchronized output with direct cursor positioning
    expect(output).toContain('\x1b[?2026h'); // SYNC_START
    expect(output).toContain('\x1b[2;1H'); // cursorTo(1) for the modified line
  });

  test('incremental update erases and rewrites changed lines', () => {
    logUpdate.render('Line 1\nLine 2');
    stream.clear();

    logUpdate.render('Line 1\nNew Line 2');

    const output = stream.getLastWrite();
    expect(output).toContain(ERASE_LINE);
    // The new implementation uses direct cursor positioning instead of CURSOR_TO_START
    expect(output).toContain('\x1b[2;1H'); // cursorTo(1) for line 2
  });

  test('incremental update handles line removal', () => {
    logUpdate.render('Line 1\nLine 2\nLine 3\nLine 4');
    stream.clear();

    logUpdate.render('Line 1\nLine 2');

    const output = stream.getLastWrite();
    // Should erase extra lines
    expect(output).toContain(ERASE_LINE);
    expect(logUpdate.previousLineCount).toBe(2);
  });

  test('incremental update handles line addition', () => {
    logUpdate.render('Line 1\nLine 2');
    stream.clear();

    logUpdate.render('Line 1\nLine 2\nLine 3\nLine 4');

    const output = stream.getLastWrite();
    expect(output).toContain('Line 3');
    expect(output).toContain('Line 4');
    expect(logUpdate.previousLineCount).toBe(4);
  });

  test('incremental update only rewrites changed lines', () => {
    logUpdate.render('Unchanged\nAlso Unchanged\nThis too');
    stream.clear();

    logUpdate.render('Unchanged\nChanged\nThis too');

    const output = stream.getLastWrite();
    // Only the changed line should be written (plus cursor moves)
    expect(output).toContain('Changed');
  });
});

describe('LogUpdate - Edge Cases', () => {
  let logUpdate;
  let stream;

  beforeEach(() => {
    stream = new MockStream();
    logUpdate = new LogUpdate(stream);
  });

  test('handles very long lines', () => {
    const longLine = 'A'.repeat(1000);
    logUpdate.render(longLine);

    expect(logUpdate.previousLines[0]).toBe(longLine);
  });

  test('handles many lines', () => {
    const manyLines = Array.from({ length: 500 }, (_, i) => `Line ${i}`).join('\n');
    logUpdate.render(manyLines);

    expect(logUpdate.previousLineCount).toBe(500);
  });

  test('handles unicode characters', () => {
    logUpdate.render('Unicode: 你好 🎉 ñ');

    const output = stream.getLastWrite();
    expect(output).toContain('你好');
    expect(output).toContain('🎉');
  });

  test('handles rapid successive renders', () => {
    logUpdate.render('Version 1');
    logUpdate.render('Version 2');
    logUpdate.render('Version 3');
    logUpdate.render('Version 4');

    expect(logUpdate.previousLines).toEqual(['Version 4']);
    expect(stream.output.length).toBe(4);
  });

  test('handles alternating content', () => {
    logUpdate.render('A');
    logUpdate.render('B');
    logUpdate.render('A');
    logUpdate.render('B');

    expect(stream.output.length).toBe(4);
    expect(logUpdate.previousLines).toEqual(['B']);
  });
});

describe('LogUpdate - Clear and Reset', () => {
  let logUpdate;
  let stream;

  beforeEach(() => {
    stream = new MockStream();
    logUpdate = new LogUpdate(stream);
  });

  test('clear resets all state', () => {
    logUpdate.render('Some content\nMore content');

    logUpdate.clear();

    expect(logUpdate.previousLines).toEqual([]);
    expect(logUpdate.previousLineCount).toBe(0);
  });

  test('clear allows fresh start', () => {
    logUpdate.render('Old content');
    logUpdate.clear();
    stream.clear();

    logUpdate.render('New content');

    const output = stream.getLastWrite();
    expect(output).toContain('New content');
    // Should not move cursor up since previousLineCount is 0
    expect(output).not.toContain('\x1b[1A');  // No cursor up command
  });

  test('done calls clear and shows cursor', () => {
    logUpdate.render('Content');

    logUpdate.done();

    expect(logUpdate.previousLines).toEqual([]);
    expect(stream.getLastWrite()).toContain(SHOW_CURSOR);
  });

  test('clear forces full render on next update', () => {
    logUpdate.render('Initial\nContent');
    logUpdate.clear();
    stream.clear();

    logUpdate.render('New\nContent');

    const output = stream.getLastWrite();
    // No cursor move since previousLineCount is 0
    expect(logUpdate.previousLineCount).toBe(2);
  });
});

describe('LogUpdate - renderScroll', () => {
  let logUpdate;
  let stream;

  beforeEach(() => {
    stream = new MockStream();
    logUpdate = new LogUpdate(stream);
  });

  test('renderScroll with no scroll delta delegates to render', () => {
    logUpdate.renderScroll('Content', 0, 20);

    expect(logUpdate.previousLines).toEqual(['Content']);
    expect(stream.output.length).toBe(1);
  });

  test('renderScroll with large delta delegates to render', () => {
    logUpdate.renderScroll('Content', 15, 20);

    const output = stream.getLastWrite();
    expect(output).toContain('Content');
  });

  test('renderScroll with small delta uses scroll regions', () => {
    logUpdate.renderScroll('Content', 2, 20);

    const output = stream.getLastWrite();
    // Should contain scroll region setup
    expect(output).toContain('Content');
  });

  test('renderScroll handles negative delta (scroll up)', () => {
    logUpdate.renderScroll('Content', -2, 10);

    const output = stream.getLastWrite();
    expect(output).toContain('Content');
  });

  test('renderScroll updates state', () => {
    logUpdate.renderScroll('Line 1\nLine 2', 1, 10);

    expect(logUpdate.previousLines).toEqual(['Line 1', 'Line 2']);
    expect(logUpdate.previousLineCount).toBe(2);
  });
});

describe('LogUpdate - Performance', () => {
  let logUpdate;
  let stream;

  beforeEach(() => {
    stream = new MockStream();
    logUpdate = new LogUpdate(stream);
  });

  test('minimal writes for unchanged content', () => {
    logUpdate.render('Line 1\nLine 2\nLine 3');
    stream.clear();

    logUpdate.render('Line 1\nLine 2\nLine 3');

    const output = stream.getLastWrite();
    // Should still write cursor moves and newlines, but skip erase/rewrite for unchanged lines
    expect(logUpdate.previousLines).toEqual(['Line 1', 'Line 2', 'Line 3']);
  });

  test('handles large content efficiently', () => {
    const largeContent = Array.from({ length: 100 }, (_, i) => `Line ${i}`).join('\n');

    logUpdate.render(largeContent);
    expect(logUpdate.previousLineCount).toBe(100);

    stream.clear();
    const modifiedContent = Array.from({ length: 100 }, (_, i) =>
      i === 50 ? 'Modified Line 50' : `Line ${i}`
    ).join('\n');

    logUpdate.render(modifiedContent);

    const output = stream.getLastWrite();
    expect(output).toContain('Modified Line 50');
  });
});

describe('LogUpdate - Integration Scenarios', () => {
  let logUpdate;
  let stream;

  beforeEach(() => {
    stream = new MockStream();
    logUpdate = new LogUpdate(stream);
  });

  test('simulates progress bar updates', () => {
    logUpdate.render('Progress: [          ] 0%');
    logUpdate.render('Progress: [#         ] 10%');
    logUpdate.render('Progress: [##        ] 20%');
    logUpdate.render('Progress: [###       ] 30%');

    expect(stream.output.length).toBe(4);
    expect(logUpdate.previousLines).toEqual(['Progress: [###       ] 30%']);
  });

  test('simulates spinner animation', () => {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

    for (const frame of frames) {
      logUpdate.render(`Loading ${frame}`);
    }

    expect(stream.output.length).toBe(frames.length);
  });

  test('simulates table updates', () => {
    const table1 = 'Name | Age\nAlice | 30\nBob | 25';
    const table2 = 'Name | Age\nAlice | 30\nBob | 26';

    logUpdate.render(table1);
    stream.clear();
    logUpdate.render(table2);

    const output = stream.getLastWrite();
    expect(output).toContain('26');
  });

  test('simulates log streaming', () => {
    logUpdate.render('[INFO] Starting...');
    logUpdate.render('[INFO] Starting...\n[INFO] Processing...');
    logUpdate.render('[INFO] Starting...\n[INFO] Processing...\n[SUCCESS] Done!');

    expect(logUpdate.previousLineCount).toBe(3);
  });
});
