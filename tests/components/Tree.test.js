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

  describe('treeStyle option', () => {
    const data = [
      {
        name: 'folder',
        children: [
          { name: 'file1.js' },
          { name: 'file2.js' }
        ]
      }
    ];

    test('uses default style by default', () => {
      const result = renderTree({ data });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('├');
      expect(stripped).toContain('└');
      expect(stripped).toContain('──');
    });

    test('uses bold style when specified', () => {
      const result = renderTree({ data, treeStyle: 'bold' });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('┣');
      expect(stripped).toContain('┗');
      expect(stripped).toContain('━━');
    });

    test('uses double style when specified', () => {
      const result = renderTree({ data, treeStyle: 'double' });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('╠');
      expect(stripped).toContain('╚');
      expect(stripped).toContain('══');
    });

    test('uses classic style when specified', () => {
      const result = renderTree({ data, treeStyle: 'classic' });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('+');
      expect(stripped).toContain('--');
    });

    test('uses rounded style when specified', () => {
      const result = renderTree({ data, treeStyle: 'rounded' });
      const stripped = stripAnsi(result);

      // Rounded is same as default
      expect(stripped).toContain('├');
      expect(stripped).toContain('└');
      expect(stripped).toContain('──');
    });

    test('accepts custom style object', () => {
      const customStyle = {
        branch: '>',
        last: '\\',
        vertical: '|',
        horizontal: '-'
      };
      const result = renderTree({ data, treeStyle: customStyle });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('>');
      expect(stripped).toContain('\\');
      expect(stripped).toContain('-');
    });

    test('falls back to default for unknown style name', () => {
      const result = renderTree({ data, treeStyle: 'unknown' });
      const stripped = stripAnsi(result);

      // Should use default characters
      expect(stripped).toContain('├');
      expect(stripped).toContain('└');
      expect(stripped).toContain('──');
    });

    test('custom style applies to all tree levels', () => {
      const deepData = [
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
      const customStyle = {
        branch: '*',
        last: '*',
        vertical: '!',
        horizontal: '=='
      };
      const result = renderTree({ data: deepData, treeStyle: customStyle });
      const stripped = stripAnsi(result);

      // Custom characters should appear in nested levels
      expect(stripped).toContain('*');
      expect(stripped).toContain('==');
    });

    test('vertical character appears with nested siblings', () => {
      const deepData = [
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
      const customStyle = {
        branch: '>',
        last: '\\',
        vertical: '!',
        horizontal: '--'
      };
      const result = renderTree({ data: deepData, treeStyle: customStyle });
      const stripped = stripAnsi(result);

      // Vertical line should appear between subfolder's children and sibling
      expect(stripped).toContain('!');
    });

    test('classic style shows vertical character with nested siblings', () => {
      const deepData = [
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
      const result = renderTree({ data: deepData, treeStyle: 'classic' });
      const stripped = stripAnsi(result);

      expect(stripped).toContain('|');
    });
  });

  describe('custom colors', () => {
    test('applies custom node color when specified', () => {
      const data = [
        {
          name: 'custom-file.js',
          color: 'red'
        }
      ];
      const result = renderTree({ data });
      // Should not crash and should render the node
      const stripped = stripAnsi(result);
      expect(stripped).toContain('custom-file.js');
    });

    test('applies custom color to folder nodes', () => {
      const data = [
        {
          name: 'custom-folder',
          color: 'green',
          children: [
            { name: 'child.js' }
          ]
        }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);
      expect(stripped).toContain('custom-folder');
      expect(stripped).toContain('child.js');
    });

    test('custom node color overrides default colors', () => {
      const data = [
        {
          name: 'parent',
          children: [
            { name: 'normal.js' },
            { name: 'custom.js', color: 'yellow' }
          ]
        }
      ];
      const result = renderTree({ data });
      const stripped = stripAnsi(result);
      expect(stripped).toContain('normal.js');
      expect(stripped).toContain('custom.js');
    });

    test('applies folderColor prop', () => {
      const data = [
        {
          name: 'folder',
          children: [{ name: 'file.js' }]
        }
      ];
      const result = renderTree({ data, folderColor: 'cyan' });
      const stripped = stripAnsi(result);
      expect(stripped).toContain('folder');
    });

    test('applies fileColor prop', () => {
      const data = [{ name: 'file.js' }];
      const result = renderTree({ data, fileColor: 'magenta' });
      const stripped = stripAnsi(result);
      expect(stripped).toContain('file.js');
    });

    test('applies branchColor prop', () => {
      const data = [
        {
          name: 'folder',
          children: [
            { name: 'file1.js' },
            { name: 'file2.js' }
          ]
        }
      ];
      const result = renderTree({ data, branchColor: 'yellow' });
      const stripped = stripAnsi(result);
      expect(stripped).toContain('├');
      expect(stripped).toContain('└');
    });
  });

  describe('color combinations', () => {
    test('combines showIcons with custom colors', () => {
      const data = [
        {
          name: 'colored-folder',
          color: 'green',
          children: [
            { name: 'colored-file.js', color: 'red' }
          ]
        }
      ];
      const result = renderTree({ data, showIcons: true });
      const stripped = stripAnsi(result);
      expect(stripped).toContain('📁');
      expect(stripped).toContain('📄');
      expect(stripped).toContain('colored-folder');
      expect(stripped).toContain('colored-file.js');
    });

    test('combines treeStyle with custom colors', () => {
      const data = [
        {
          name: 'folder',
          children: [
            { name: 'file1.js' },
            { name: 'file2.js' }
          ]
        }
      ];
      const result = renderTree({
        data,
        treeStyle: 'bold',
        folderColor: 'cyan',
        fileColor: 'yellow',
        branchColor: 'magenta'
      });
      const stripped = stripAnsi(result);
      expect(stripped).toContain('┣');
      expect(stripped).toContain('┗');
      expect(stripped).toContain('folder');
      expect(stripped).toContain('file1.js');
    });
  });
});
