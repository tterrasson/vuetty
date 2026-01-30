/**
 * Tests for CodeDiff component
 */

import { test, expect, describe } from 'bun:test';
import CodeDiff from '../../src/components/CodeDiff.js';
import { renderHandlerRegistry } from '../../src/core/renderHandlers.js';

describe('CodeDiff component', () => {
  describe('diff computation', () => {
    test('computes diff for simple change', () => {
      const component = CodeDiff.setup({
        oldCode: 'const a = 1;',
        newCode: 'const a = 2;'
      });
      const result = component();

      expect(result.props._diff).toBeDefined();
      expect(result.props._diff.length).toBeGreaterThan(0);

      // Should have both removed and added parts
      const hasRemoved = result.props._diff.some(p => p.removed);
      const hasAdded = result.props._diff.some(p => p.added);
      expect(hasRemoved).toBe(true);
      expect(hasAdded).toBe(true);
    });

    test('handles identical code with no changes', () => {
      const component = CodeDiff.setup({
        oldCode: 'same content',
        newCode: 'same content'
      });
      const result = component();

      expect(result.props._diff).toBeDefined();
      expect(result.props._diff.length).toBe(1);
      expect(result.props._diff[0].added).toBeFalsy();
      expect(result.props._diff[0].removed).toBeFalsy();
    });

    test('handles empty old code (all additions)', () => {
      const component = CodeDiff.setup({
        oldCode: '',
        newCode: 'new content\nline 2'
      });
      const result = component();

      expect(result.props._diff).toBeDefined();
      const hasAdded = result.props._diff.some(p => p.added);
      expect(hasAdded).toBe(true);
    });

    test('handles empty new code (all deletions)', () => {
      const component = CodeDiff.setup({
        oldCode: 'old content\nline 2',
        newCode: ''
      });
      const result = component();

      expect(result.props._diff).toBeDefined();
      const hasRemoved = result.props._diff.some(p => p.removed);
      expect(hasRemoved).toBe(true);
    });

    test('caches diff computation for identical inputs', () => {
      const props = {
        oldCode: 'const x = 1;',
        newCode: 'const x = 2;'
      };
      const component = CodeDiff.setup(props);

      const result1 = component();
      const result2 = component();

      // Should return the same diff object (cached)
      expect(result1.props._diff).toBe(result2.props._diff);
    });

    test('recomputes diff when code changes', () => {
      const props = {
        oldCode: 'original',
        newCode: 'modified'
      };
      const component = CodeDiff.setup(props);

      const result1 = component();
      const diff1 = result1.props._diff;

      props.oldCode = 'completely different';
      const result2 = component();
      const diff2 = result2.props._diff;

      // Should be different diff objects
      expect(diff1).not.toBe(diff2);
    });
  });

  describe('render handler', () => {
    test('renders inline diff correctly', () => {
      const handler = renderHandlerRegistry.handlers.get('codediff');
      expect(handler).toBeDefined();

      const component = CodeDiff.setup({
        oldCode: 'line1\nline2',
        newCode: 'line1\nline3'
      });
      const vnode = component();

      const ctx = {
        props: vnode.props,
        type: 'codediff'
      };

      const output = handler.render(ctx);
      expect(typeof output).toBe('string');
      expect(output.length).toBeGreaterThan(0);

      // Should contain line markers
      expect(output.includes('-') || output.includes('+')).toBe(true);
    });

    test('renders empty diff for identical code', () => {
      const handler = renderHandlerRegistry.handlers.get('codediff');

      const component = CodeDiff.setup({
        oldCode: 'same',
        newCode: 'same'
      });
      const vnode = component();

      const ctx = {
        props: vnode.props,
        type: 'codediff'
      };

      const output = handler.render(ctx);
      expect(typeof output).toBe('string');
      // Should render unchanged lines
      expect(output.includes('same')).toBe(true);
    });

    test('renders with line numbers when enabled', () => {
      const handler = renderHandlerRegistry.handlers.get('codediff');

      const component = CodeDiff.setup({
        oldCode: 'line1\nline2',
        newCode: 'line1\nline3',
        showLineNumbers: true
      });
      const vnode = component();

      const ctx = {
        props: vnode.props,
        type: 'codediff'
      };

      const output = handler.render(ctx);
      expect(output).toBeDefined();
      // Line numbers should appear (space-padded numbers at start of lines)
      const lines = output.split('\n');
      expect(lines.length).toBeGreaterThan(0);
    });

    test('renders without line numbers when disabled', () => {
      const handler = renderHandlerRegistry.handlers.get('codediff');

      const component = CodeDiff.setup({
        oldCode: 'line1\nline2',
        newCode: 'line1\nline3',
        showLineNumbers: false
      });
      const vnode = component();

      const ctx = {
        props: vnode.props,
        type: 'codediff'
      };

      const output = handler.render(ctx);
      expect(output).toBeDefined();
      expect(typeof output).toBe('string');
    });

    test('renders side-by-side mode', () => {
      const handler = renderHandlerRegistry.handlers.get('codediff');

      const component = CodeDiff.setup({
        oldCode: 'line1\nold line',
        newCode: 'line1\nnew line',
        mode: 'side-by-side',
        showLineNumbers: true
      });
      const vnode = component();

      const ctx = {
        props: vnode.props,
        type: 'codediff'
      };

      const output = handler.render(ctx);
      expect(output).toBeDefined();
      expect(typeof output).toBe('string');
      // Should contain separator for side-by-side
      expect(output.includes('|')).toBe(true);
    });

    test('applies syntax highlighting for javascript', () => {
      const handler = renderHandlerRegistry.handlers.get('codediff');

      const component = CodeDiff.setup({
        oldCode: 'const x = 1;',
        newCode: 'const x = 2;',
        language: 'javascript'
      });
      const vnode = component();

      const ctx = {
        props: vnode.props,
        type: 'codediff'
      };

      const output = handler.render(ctx);
      expect(output).toBeDefined();
      // Should contain ANSI escape codes for syntax highlighting
      expect(output.includes('\x1b[')).toBe(true);
    });

    test('handles context lines filtering', () => {
      const handler = renderHandlerRegistry.handlers.get('codediff');

      const manyLines = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n');
      const modifiedLines = manyLines.replace('line 10', 'modified line 10');

      const component = CodeDiff.setup({
        oldCode: manyLines,
        newCode: modifiedLines,
        context: 2,
        showAll: false,
        language: 'text' // Disable syntax highlighting for simpler testing
      });
      const vnode = component();

      const ctx = {
        props: vnode.props,
        type: 'codediff'
      };

      const output = handler.render(ctx);
      expect(output).toBeDefined();

      // When using context, should show fewer lines than original
      const lines = output.split('\n').filter(l => l.trim());
      expect(lines.length).toBeLessThan(20); // Less than original 20 lines

      // Should contain the modified line (check both old and new)
      expect(output).toContain('modified');
      expect(output).toContain('line 10');
    });

    test('shows all lines when showAll is true', () => {
      const handler = renderHandlerRegistry.handlers.get('codediff');

      const manyLines = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n');
      const modifiedLines = manyLines.replace('line 10', 'modified line 10');

      const component = CodeDiff.setup({
        oldCode: manyLines,
        newCode: modifiedLines,
        context: 2,
        showAll: true
      });
      const vnode = component();

      const ctx = {
        props: vnode.props,
        type: 'codediff'
      };

      const output = handler.render(ctx);
      expect(output).toBeDefined();
      const lines = output.split('\n').filter(l => l.trim());
      // Should have many lines (all shown)
      expect(lines.length).toBeGreaterThan(15);
    });
  });

  describe('color and theme props', () => {
    test('uses default colors when not specified', () => {
      const component = CodeDiff.setup({
        oldCode: 'a',
        newCode: 'b'
      });
      const result = component();

      // Should have default colors
      expect(result.props.addedColor).toBe('#4ecca3');
      expect(result.props.removedColor).toBe('#d64d64');
      expect(result.props.addedBg).toBe('#1a2f1a');
      expect(result.props.removedBg).toBe('#2f1a1a');
    });

    test('accepts custom colors', () => {
      const component = CodeDiff.setup({
        oldCode: 'a',
        newCode: 'b',
        addedColor: 'green',
        removedColor: 'red',
        addedBg: '#002200',
        removedBg: '#220000'
      });
      const result = component();

      expect(result.props.addedColor).toBe('green');
      expect(result.props.removedColor).toBe('red');
      expect(result.props.addedBg).toBe('#002200');
      expect(result.props.removedBg).toBe('#220000');
    });
  });

  describe('edge cases', () => {
    test('handles null/undefined inputs', () => {
      const component = CodeDiff.setup({
        oldCode: null,
        newCode: undefined
      });
      const result = component();

      expect(result.props._diff).toBeDefined();
      expect(result.type).toBe('codediff');
    });

    test('handles unicode and special characters', () => {
      const component = CodeDiff.setup({
        oldCode: 'const emoji = "👍";',
        newCode: 'const emoji = "🎉";'
      });
      const result = component();

      expect(result.props._diff).toBeDefined();
      const hasChanges = result.props._diff.some(p => p.added || p.removed);
      expect(hasChanges).toBe(true);
    });

    test('handles very long lines', () => {
      const longLine = 'x'.repeat(1000);
      const component = CodeDiff.setup({
        oldCode: longLine,
        newCode: longLine + 'y'
      });
      const result = component();

      expect(result.props._diff).toBeDefined();
      const hasAdded = result.props._diff.some(p => p.added);
      expect(hasAdded).toBe(true);
    });

    test('handles multiline changes correctly', () => {
      const component = CodeDiff.setup({
        oldCode: 'line1\nline2\nline3\nline4',
        newCode: 'line1\nmodified2\nmodified3\nline4'
      });
      const result = component();

      expect(result.props._diff).toBeDefined();
      const hasRemoved = result.props._diff.some(p => p.removed);
      const hasAdded = result.props._diff.some(p => p.added);
      expect(hasRemoved).toBe(true);
      expect(hasAdded).toBe(true);
    });
  });

  describe('mode validation', () => {
    test('accepts inline mode', () => {
      const component = CodeDiff.setup({
        oldCode: 'a',
        newCode: 'b',
        mode: 'inline'
      });
      const result = component();

      expect(result.props.mode).toBe('inline');
    });

    test('accepts side-by-side mode', () => {
      const component = CodeDiff.setup({
        oldCode: 'a',
        newCode: 'b',
        mode: 'side-by-side'
      });
      const result = component();

      expect(result.props.mode).toBe('side-by-side');
    });
  });

  describe('real-world scenarios', () => {
    test('shows git-style diff for code refactoring', () => {
      const handler = renderHandlerRegistry.handlers.get('codediff');

      const oldCode = `function calculate(x) {
  const result = x * 2;
  console.log(result);
  return result;
}`;

      const newCode = `function calculate(x) {
  const doubled = x * 2;
  return doubled;
}`;

      const component = CodeDiff.setup({
        oldCode,
        newCode,
        language: 'javascript',
        showLineNumbers: true
      });
      const vnode = component();

      const ctx = {
        props: vnode.props,
        type: 'codediff'
      };

      const output = handler.render(ctx);
      expect(output).toBeDefined();
      expect(output.includes('calculate')).toBe(true);

      // Should show removed and added markers
      const hasMarkers = output.includes('-') || output.includes('+');
      expect(hasMarkers).toBe(true);
    });

    test('displays JSON configuration changes', () => {
      const handler = renderHandlerRegistry.handlers.get('codediff');

      const oldCode = JSON.stringify({ version: "1.0.0", name: "old" }, null, 2);
      const newCode = JSON.stringify({ version: "2.0.0", name: "new" }, null, 2);

      const component = CodeDiff.setup({
        oldCode,
        newCode,
        language: 'json'
      });
      const vnode = component();

      const ctx = {
        props: vnode.props,
        type: 'codediff'
      };

      const output = handler.render(ctx);
      expect(output).toBeDefined();
      expect(typeof output).toBe('string');
      expect(output.length).toBeGreaterThan(0);
    });

    test('handles large file diff with context', () => {
      const handler = renderHandlerRegistry.handlers.get('codediff');

      const largeFile = Array.from({ length: 100 }, (_, i) => {
        return `function func${i}() {\n  return ${i};\n}`;
      }).join('\n');

      const modifiedFile = largeFile.replace('return 50;', 'return 999;');

      const component = CodeDiff.setup({
        oldCode: largeFile,
        newCode: modifiedFile,
        context: 3,
        showAll: false,
        language: 'javascript'
      });
      const vnode = component();

      const ctx = {
        props: vnode.props,
        type: 'codediff'
      };

      const output = handler.render(ctx);
      expect(output).toBeDefined();

      // Should use context filtering and show separators
      const lines = output.split('\n');
      expect(lines.length).toBeLessThan(50); // Much less than 100 lines due to context
    });
  });
});
