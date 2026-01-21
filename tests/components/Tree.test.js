/**
 * Tests for Tree component
 */

import { test, expect, describe } from 'bun:test';
import { renderTree } from '../../src/components/Tree.js';
import { stripAnsi } from '../helpers/test-utils.js';

describe('Tree component', () => {
  const sampleData = [
    {
      name: 'src',
      children: [
        { name: 'index.js' },
        {
          name: 'components',
          children: [
            { name: 'Box.js' },
            { name: 'Tree.js' }
          ]
        }
      ]
    }
  ];

  describe('basic rendering', () => {
    test('renders empty tree', () => {
      const result = renderTree({ data: [] });
      expect(result).toBe('');
    });

    test('renders null data as empty', () => {
      const result = renderTree({ data: null });
      expect(result).toBe('');
    });

    test('renders undefined data as empty', () => {
      const result = renderTree({});
      expect(result).toBe('');
    });

    test('renders single file', () => {
      const result = renderTree({ data: [{ name: 'file.js' }] });
      const stripped = stripAnsi(result);
      expect(stripped).toContain('file.js');
    });

    test('renders single folder with children', () => {
      const data = [
        {
          name: 'folder',
          children: [
            { name: 'file1.js' },
            { name: 'file2.js' }
          ]
        }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('folder');
      expect(stripped).toContain('file1.js');
      expect(stripped).toContain('file2.js');
    });

    test('renders folder with children and nested folders', () => {
      const result = renderTree({ data: sampleData });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('src');
      expect(stripped).toContain('index.js');
      expect(stripped).toContain('components');
      expect(stripped).toContain('Box.js');
      expect(stripped).toContain('Tree.js');
    });
  });

  describe('tree branch characters', () => {
    test('renders tree branch characters', () => {
      const result = renderTree({ data: sampleData });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('├');
      expect(stripped).toContain('└');
      expect(stripped).toContain('──');
    });

    test('renders vertical continuation line when needed', () => {
      // When a folder has children and there are siblings after it,
      // the vertical line should continue
      const data = [
        {
          name: 'folder',
          children: [
            {
              name: 'subfolder',
              children: [
                { name: 'deep.js' }
              ]
            },
            { name: 'file.js' }
          ]
        }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      // Should have │ to connect subfolder's children to file.js
      expect(stripped).toContain('│');
    });

    test('uses └ for last child', () => {
      const data = [
        {
          name: 'folder',
          children: [
            { name: 'first.js' },
            { name: 'last.js' }
          ]
        }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // last.js should have └ prefix
      const lastLine = lines.find(l => l.includes('last.js'));
      expect(lastLine).toContain('└');
    });

    test('uses ├ for intermediate children', () => {
      const data = [
        {
          name: 'folder',
          children: [
            { name: 'first.js' },
            { name: 'last.js' }
          ]
        }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // first.js should have ├ prefix
      const firstLine = lines.find(l => l.includes('first.js'));
      expect(firstLine).toContain('├');
    });

    test('vertical line continues for intermediate siblings', () => {
      const data = [
        {
          name: 'folder',
          children: [
            {
              name: 'subfolder',
              children: [
                { name: 'nested.js' }
              ]
            },
            { name: 'sibling.js' }
          ]
        }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      // Should have vertical line connecting subfolder's children to sibling
      expect(stripped).toContain('│');
    });
  });

  describe('nested levels', () => {
    test('renders deeply nested structure', () => {
      const data = [
        {
          name: 'a',
          children: [{
            name: 'b',
            children: [{
              name: 'c',
              children: [{
                name: 'd',
                children: [{ name: 'e.txt' }]
              }]
            }]
          }]
        }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('a');
      expect(stripped).toContain('b');
      expect(stripped).toContain('c');
      expect(stripped).toContain('d');
      expect(stripped).toContain('e.txt');
    });

    test('each level increases indentation', () => {
      const data = [
        {
          name: 'root',
          children: [
            {
              name: 'level1',
              children: [
                { name: 'level2' }
              ]
            }
          ]
        }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n');

      // Root should have no indentation
      expect(lines[0]).toBe('root');

      // Level 1 should be indented with tree characters
      const level1Line = lines.find(l => l.includes('level1'));
      expect(level1Line).toContain('└──');
      expect(level1Line).toContain('level1');

      // Level 2 should be more indented (position of name in string)
      const level2Line = lines.find(l => l.includes('level2'));
      expect(level2Line.indexOf('level2')).toBeGreaterThan(level1Line.indexOf('level1'));
    });
  });

  describe('multiple root nodes', () => {
    test('renders multiple root folders', () => {
      const data = [
        { name: 'src', children: [{ name: 'app.js' }] },
        { name: 'tests', children: [{ name: 'app.test.js' }] }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('src');
      expect(stripped).toContain('tests');
      expect(stripped).toContain('app.js');
      expect(stripped).toContain('app.test.js');
    });

    test('renders multiple root files', () => {
      const data = [
        { name: 'package.json' },
        { name: 'README.md' },
        { name: 'tsconfig.json' }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('package.json');
      expect(stripped).toContain('README.md');
      expect(stripped).toContain('tsconfig.json');
    });
  });

  describe('edge cases', () => {
    test('handles empty folder', () => {
      const data = [{ name: 'empty', children: [] }];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('empty');
      // Should only have 1 line (just the folder name)
      expect(stripped.split('\n').filter(l => l.trim()).length).toBe(1);
    });

    test('handles special characters in names', () => {
      const data = [{ name: 'file with spaces.js' }];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('file with spaces.js');
    });

    test('handles unicode in names', () => {
      const data = [{ name: 'fichier-français.js' }];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('fichier-français.js');
    });

    test('handles empty name', () => {
      const data = [{ name: '' }];
      const result = renderTree({ data });
      // Should not crash, just render empty string for name
      expect(result).toBeDefined();
    });

    test('handles node without name property', () => {
      const data = [{ children: [{ name: 'child.js' }] }];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      // Should still render children
      expect(stripped).toContain('child.js');
    });
  });

  describe('showIcons option', () => {
    test('does not show icons by default', () => {
      const data = [
        {
          name: 'folder',
          children: [{ name: 'file.js' }]
        }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      expect(stripped).not.toContain('📁');
      expect(stripped).not.toContain('📄');
    });

    test('shows folder icon when showIcons is true', () => {
      const data = [
        {
          name: 'folder',
          children: [{ name: 'file.js' }]
        }
      ];
      const result = renderTree({ data, showIcons: true });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('📁');
    });

    test('shows file icon when showIcons is true', () => {
      const data = [{ name: 'file.js' }];
      const result = renderTree({ data, showIcons: true });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('📄');
    });
  });

  describe('line count', () => {
    test('line count matches node count', () => {
      const data = [
        {
          name: 'folder',
          children: [
            { name: 'file1.js' },
            { name: 'file2.js' },
            { name: 'file3.js' }
          ]
        }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n').filter(l => l.trim());

      // 1 folder + 3 files = 4 lines
      expect(lines.length).toBe(4);
    });

    test('nested structure has correct line count', () => {
      const result = renderTree({ data: sampleData });
      const stripped = stripAnsi(result);
      const lines = stripped.split('\n').filter(l => l.trim());

      // src (1) + index.js (1) + components (1) + Box.js (1) + Tree.js (1) = 5
      expect(lines.length).toBe(5);
    });
  });
});
