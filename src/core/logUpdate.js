// src/core/logUpdate.js

/**
 * LogUpdate - Efficient terminal rendering with line diffing
 * Uses synchronized output to prevent tearing
 */

const SYNC_START = '\x1b[?2026h';
const SYNC_END = '\x1b[?2026l';
const ERASE_LINE = '\x1b[2K';
const CURSOR_HOME = '\x1b[H';
const CLEAR_BELOW = '\x1b[J';
const SHOW_CURSOR = '\x1b[?25h';

export class LogUpdate {
  // Pre-allocated cursor sequences for performance
  static cursorCache = (() => {
    const cache = new Array(500);
    for (let i = 0; i < 500; i++) {
      cache[i] = `\x1b[${i + 1};1H`;
    }
    return cache;
  })();

  static cursorTo(row) {
    return LogUpdate.cursorCache[row] ?? `\x1b[${row + 1};1H`;
  }

  constructor(stream = process.stdout) {
    this.stream = stream;
    this.previousLines = [];
    this.previousLineCount = 0;
    this.previousContent = '';
    this.bufferParts = [];
  }

  /**
   * Detect which lines changed and where
   * @private
   */
  _detectChangeRegion(newLines, prevLines) {
    const changes = [];
    const maxLines = Math.max(newLines.length, prevLines.length);

    for (let i = 0; i < maxLines; i++) {
      if (newLines[i] !== prevLines[i]) {
        changes.push(i);
      }
    }

    if (changes.length === 0) return null;

    return {
      firstChanged: changes[0],
      lastChanged: changes[changes.length - 1],
      totalChanged: changes.length
    };
  }

  /**
   * Render with line diffing and synchronized output
   */
  render(content) {
    // Fast path: identical content
    if (content === this.previousContent) {
      return;
    }
    this.previousContent = content;

    const newLines = content.split('\n');
    const prevLines = this.previousLines;
    const newLineCount = newLines.length;
    const prevLineCount = prevLines.length;

    // Detect change region
    const changeRegion = this._detectChangeRegion(newLines, prevLines);

    if (!changeRegion) {
      // No changes at all - early return
      this.previousLines = newLines;
      this.previousLineCount = newLineCount;
      return;
    }

    this.bufferParts.length = 0;
    this.bufferParts.push(SYNC_START);

    if (prevLineCount === 0 || Math.abs(newLineCount - prevLineCount) > 20) {
      this._fullRedraw(newLines);
    } else {
      this._incrementalUpdate(newLines, prevLines);
    }

    this.bufferParts.push(SYNC_END);
    this.stream.write(this.bufferParts.join(''));

    this.previousLines = newLines;
    this.previousLineCount = newLineCount;
  }

  _fullRedraw(lines) {
    this.bufferParts.push(CURSOR_HOME);

    const len = lines.length;
    for (let i = 0; i < len; i++) {
      if (i > 0) this.bufferParts.push('\n');
      this.bufferParts.push(ERASE_LINE, lines[i]);
    }

    this.bufferParts.push(CLEAR_BELOW);
  }

  _incrementalUpdate(newLines, prevLines) {
    const newLen = newLines.length;
    const prevLen = prevLines.length;
    const maxLines = Math.max(newLen, prevLen);

    // Count changes
    let changedCount = 0;
    for (let i = 0; i < maxLines; i++) {
      if (newLines[i] !== prevLines[i]) changedCount++;
    }

    // Too many changes - full redraw faster
    if (changedCount > maxLines * 0.7) {
      this._fullRedraw(newLines);
      return;
    }

    // Update only changed lines
    for (let i = 0; i < maxLines; i++) {
      const newLine = newLines[i];
      const prevLine = prevLines[i];

      if (i >= newLen) {
        this.bufferParts.push(LogUpdate.cursorTo(i), ERASE_LINE);
      } else if (newLine !== prevLine) {
        this.bufferParts.push(LogUpdate.cursorTo(i), ERASE_LINE, newLine);
      }
    }

    if (newLen < prevLen) {
      this.bufferParts.push(LogUpdate.cursorTo(newLen), CLEAR_BELOW);
    }
  }

  renderScroll(content) {
    // For now, delegate to standard render
    // The scroll delta could be used for DECSTBM scroll region optimization in the future
    this.render(content);
  }

  /**
   * Force a full redraw on next render by clearing previous state
   */
  clear() {
    this.previousLines = [];
    this.previousLineCount = 0;
    this.previousContent = '';
  }

  /**
   * Clean up - show cursor
   */
  done() {
    this.stream.write(SHOW_CURSOR);
    this.clear();
  }
}