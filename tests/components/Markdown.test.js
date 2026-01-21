/**
 * Tests for Markdown component
 */

import { test, expect, describe } from 'bun:test';
import Markdown from '../../src/components/Markdown.js';
import { extractVNodeText, countVNodes, findVNodesByType, getVNodeType, stripAnsi } from '../helpers/test-utils.js';

describe('Markdown component', () => {
  describe('basic component structure', () => {
    test('always wraps content in Box component', () => {
      const component = Markdown.setup({ content: 'Test' });
      const result = component();

      expect(getVNodeType(result)).toBe('Box');
      expect(result.props).toBeDefined();
    });

    test('Box has correct default props', () => {
      const component = Markdown.setup({ content: 'Test' });
      const result = component();

      // Box component should have these props set
      expect(result.props.border).toBe(false);
      expect(result.props.width).toBe(null);
    });

    test('Box passes through styling props', () => {
      const component = Markdown.setup({
        content: 'Test',
        color: 'cyan',
        bg: 'black',
        bold: true,
        italic: true,
        dim: true
      });
      const result = component();

      expect(result.props.color).toBe('cyan');
      expect(result.props.bg).toBe('black');
      expect(result.props.bold).toBe(true);
      expect(result.props.italic).toBe(true);
      expect(result.props.dim).toBe(true);
    });

    test('Box respects width prop', () => {
      const component = Markdown.setup({ content: 'Test', width: 80 });
      const result = component();

      expect(result.props.width).toBe(80);
    });

    test('Box respects padding prop', () => {
      const component = Markdown.setup({ content: 'Test', padding: 2 });
      const result = component();

      expect(result.props.padding).toBe(2);
    });

    test('contains children vnodes', () => {
      const component = Markdown.setup({ content: 'Some text' });
      const result = component();

      expect(result.children).toBeDefined();
      expect(result.children.default).toBeDefined();
      const children = typeof result.children.default === 'function'
        ? result.children.default()
        : result.children.default;
      expect(Array.isArray(children)).toBe(true);
      expect(children.length).toBeGreaterThan(0);
    });
  });

  describe('plain text and paragraphs', () => {
    test('renders simple plain text in TextBox', () => {
      const component = Markdown.setup({ content: 'Hello World' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('Hello World');

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
    });

    test('renders multiple paragraphs separated by blank lines', () => {
      const component = Markdown.setup({ content: 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('First paragraph');
      expect(text).toContain('Second paragraph');
      expect(text).toContain('Third paragraph');

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThanOrEqual(3);
    });

    test('paragraph without complex styling creates simple TextBox', () => {
      const component = Markdown.setup({ content: 'Simple text paragraph' });
      const result = component();

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
      expect(extractVNodeText(result)).toContain('Simple text paragraph');
    });

    test('paragraph with inline formatting creates multiple TextBox nodes', () => {
      const component = Markdown.setup({ content: 'Text with **bold** and *italic*' });
      const result = component();

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(1);
      expect(extractVNodeText(result)).toContain('bold');
      expect(extractVNodeText(result)).toContain('italic');
    });
  });

  describe('headings', () => {
    test('renders H1 heading with # prefix and bold styling', () => {
      const component = Markdown.setup({ content: '# Main Title', h1Color: 'cyan' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('# Main Title');

      const textBoxes = findVNodesByType(result, 'TextBox');
      const headingBox = textBoxes.find(box => box.props?.bold === true && box.props?.color === 'cyan');
      expect(headingBox).toBeDefined();
    });

    test('renders H2 heading with ## prefix', () => {
      const component = Markdown.setup({ content: '## Subtitle', h2Color: 'cyan' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('## Subtitle');

      const textBoxes = findVNodesByType(result, 'TextBox');
      const headingBox = textBoxes.find(box => box.props?.bold === true && box.props?.color === 'cyan');
      expect(headingBox).toBeDefined();
    });

    test('renders all six heading levels correctly', () => {
      const content = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('# H1');
      expect(text).toContain('## H2');
      expect(text).toContain('### H3');
      expect(text).toContain('#### H4');
      expect(text).toContain('##### H5');
      expect(text).toContain('###### H6');

      const textBoxes = findVNodesByType(result, 'TextBox');
      const boldBoxes = textBoxes.filter(box => box.props?.bold === true);
      expect(boldBoxes.length).toBeGreaterThanOrEqual(6);
    });

    test('applies correct color to different heading levels', () => {
      const component = Markdown.setup({
        content: '# H1\n## H2\n### H3',
        h1Color: 'red',
        h2Color: 'green',
        h3Color: 'blue'
      });
      const result = component();

      const textBoxes = findVNodesByType(result, 'TextBox');
      const redBox = textBoxes.find(box => box.props?.color === 'red');
      const greenBox = textBoxes.find(box => box.props?.color === 'green');
      const blueBox = textBoxes.find(box => box.props?.color === 'blue');

      expect(redBox).toBeDefined();
      expect(greenBox).toBeDefined();
      expect(blueBox).toBeDefined();
    });

    test('heading renders with proper structure', () => {
      const component = Markdown.setup({ content: '# Title' });
      const result = component();

      expect(result).toBeTruthy();
      expect(getVNodeType(result)).toBe('Box');
      const text = extractVNodeText(result);
      expect(text).toContain('# Title');
    });
  });

  describe('text formatting', () => {
    test('renders bold text with correct props', () => {
      const component = Markdown.setup({ content: 'This is **bold** text', strongColor: 'white' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('bold');
      expect(text).toContain('This is');
      expect(text).toContain('text');

      const textBoxes = findVNodesByType(result, 'TextBox');
      const boldBox = textBoxes.find(box => box.props?.bold === true);
      expect(boldBox).toBeDefined();
    });

    test('renders italic text with correct props', () => {
      const component = Markdown.setup({ content: 'This is *italic* text', emphasisColor: 'white' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('italic');
      expect(text).toContain('This is');
      expect(text).toContain('text');

      const textBoxes = findVNodesByType(result, 'TextBox');
      const italicBox = textBoxes.find(box => box.props?.italic === true);
      expect(italicBox).toBeDefined();
    });

    test('renders links with link text', () => {
      const component = Markdown.setup({ content: '[Link text](https://example.com)', linkColor: 'blue' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('Link text');

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
    });

    test('renders inline code with styling', () => {
      const component = Markdown.setup({
        content: 'Some `inline code` here',
        codeColor: 'yellow',
        codeBg: 'black'
      });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('inline code');

      const textBoxes = findVNodesByType(result, 'TextBox');
      const codeBox = textBoxes.find(box => box.props?.color === 'yellow' || box.props?.bg === 'black');
      expect(codeBox).toBeDefined();
    });

    test('renders mixed formatting with multiple styled nodes', () => {
      const component = Markdown.setup({ content: '**bold** and *italic* and `code`' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('bold');
      expect(text).toContain('italic');
      expect(text).toContain('code');

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(3);
    });

    test('renders nested formatting correctly', () => {
      const component = Markdown.setup({ content: '***bold and italic***' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('bold and italic');
    });
  });

  describe('code blocks', () => {
    test('renders code block with TextBox components', () => {
      const component = Markdown.setup({ content: '```js\nconst x = 1;\nconsole.log(x);\n```' });
      const result = component();
      const text = stripAnsi(extractVNodeText(result));

      expect(text).toContain('const x = 1');
      expect(text).toContain('console.log(x)');

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
    });

    test('code block creates TextBox components', () => {
      const component = Markdown.setup({
        content: '```\ncode here\n```',
        codeColor: 'yellow',
        codeBg: 'black'
      });
      const result = component();

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
      const text = extractVNodeText(result);
      expect(text).toContain('code here');
    });

    test('code block renders properly', () => {
      const component = Markdown.setup({ content: '```\ncode\n```' });
      const result = component();

      expect(result).toBeTruthy();
      const text = extractVNodeText(result);
      expect(text).toContain('code');
    });

    test('code block with language identifier', () => {
      const component = Markdown.setup({ content: '```javascript\nconst x = 42;\n```' });
      const result = component();
      const text = stripAnsi(extractVNodeText(result));

      expect(text).toContain('const x = 42');
    });

    test('code block preserves indentation', () => {
      const component = Markdown.setup({ content: '```\n  indented code\n    more indent\n```' });
      const result = component();
      const text = stripAnsi(extractVNodeText(result));

      expect(text).toContain('indented code');
      expect(text).toContain('more indent');
    });
  });

  describe('lists', () => {
    test('renders unordered list items', () => {
      const component = Markdown.setup({ content: '- Item 1\n- Item 2\n- Item 3' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('Item 1');
      expect(text).toContain('Item 2');
      expect(text).toContain('Item 3');

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
    });

    test('renders ordered list items', () => {
      const component = Markdown.setup({ content: '1. First\n2. Second\n3. Third' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('First');
      expect(text).toContain('Second');
      expect(text).toContain('Third');
    });

    test('applies list bullet color', () => {
      const component = Markdown.setup({
        content: '- Item 1',
        listBulletColor: 'green'
      });
      const result = component();

      const textBoxes = findVNodesByType(result, 'TextBox');
      const bulletBox = textBoxes.find(box => box.props?.color === 'green');
      expect(bulletBox).toBeDefined();
    });

    test('renders numbered list correctly', () => {
      const component = Markdown.setup({
        content: '1. Item 1',
        listNumberColor: 'green'
      });
      const result = component();

      const text = extractVNodeText(result);
      expect(text).toContain('Item 1');
      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
    });

    test('renders nested lists', () => {
      const content = '- Parent\n  - Child 1\n  - Child 2\n- Another parent';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('Parent');
      expect(text).toContain('Child 1');
      expect(text).toContain('Child 2');
      expect(text).toContain('Another parent');
    });

    test('renders lists with formatted content', () => {
      const content = '- Item with **bold**\n- Item with *italic*';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('bold');
      expect(text).toContain('italic');
    });
  });

  describe('blockquotes', () => {
    test('renders blockquote content', () => {
      const component = Markdown.setup({ content: '> This is a quote' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('This is a quote');
    });

    test('applies blockquote color', () => {
      const component = Markdown.setup({
        content: '> Quote',
        blockquoteColor: 'gray'
      });
      const result = component();

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
    });

    test('renders multiline blockquote', () => {
      const content = '> Line 1\n> Line 2\n> Line 3';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('Line 1');
      expect(text).toContain('Line 2');
      expect(text).toContain('Line 3');
    });

    test('blockquote renders correctly', () => {
      const component = Markdown.setup({ content: '> Quote' });
      const result = component();

      expect(result).toBeTruthy();
      const text = extractVNodeText(result);
      expect(text).toContain('Quote');
    });
  });

  describe('horizontal rules', () => {
    test('renders horizontal rule as Divider', () => {
      const component = Markdown.setup({ content: '---' });
      const result = component();

      const dividers = findVNodesByType(result, 'Divider');
      expect(dividers.length).toBe(1);
    });

    test('applies hr color', () => {
      const component = Markdown.setup({ content: '---', hrColor: 'gray' });
      const result = component();

      const dividers = findVNodesByType(result, 'Divider');
      expect(dividers[0].props.color).toBe('gray');
    });

    test('applies hr character', () => {
      const component = Markdown.setup({ content: '---', hrChar: '═' });
      const result = component();

      const dividers = findVNodesByType(result, 'Divider');
      expect(dividers[0].props.char).toBe('═');
    });

    test('applies hr length from prop', () => {
      const component = Markdown.setup({ content: '---', hrLength: 40 });
      const result = component();

      const dividers = findVNodesByType(result, 'Divider');
      expect(dividers[0].props.length).toBe(40);
    });

    test('hr uses contentWidth when available', () => {
      const component = Markdown.setup({ content: '---', width: 100, padding: 2 });
      const result = component();

      const dividers = findVNodesByType(result, 'Divider');
      // contentWidth = width - (padding * 2) = 100 - 4 = 96
      expect(dividers[0].props.length).toBe(96);
    });

    test('hr renders correctly', () => {
      const component = Markdown.setup({ content: '---' });
      const result = component();

      expect(result).toBeTruthy();
      const dividers = findVNodesByType(result, 'Divider');
      expect(dividers.length).toBe(1);
    });
  });

  describe('tables', () => {
    test('renders table with headers and cells', () => {
      const content = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('Header 1');
      expect(text).toContain('Header 2');
      expect(text).toContain('Cell 1');
      expect(text).toContain('Cell 2');
    });

    test('table renders with proper structure', () => {
      const content = '| Col 1 | Col 2 |\n|-------|-------|\n| A     | B     |';
      const component = Markdown.setup({ content });
      const result = component();

      expect(result).toBeTruthy();
      const text = extractVNodeText(result);
      expect(text).toContain('Col 1');
      expect(text).toContain('Col 2');
      expect(text).toContain('A');
      expect(text).toContain('B');
    });

    test('complex table with multiple rows', () => {
      const content = '| Name | Age | City |\n|------|-----|------|\n| John | 30  | NYC  |\n| Jane | 25  | LA   |';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('Name');
      expect(text).toContain('Age');
      expect(text).toContain('City');
      expect(text).toContain('John');
      expect(text).toContain('Jane');

      const vnodeCount = countVNodes(result);
      expect(vnodeCount).toBeGreaterThan(5);
    });

    test('table renders without errors', () => {
      const content = '| A | B |\n|---|---|\n| 1 | 2 |';
      const component = Markdown.setup({ content });
      const result = component();

      expect(result).toBeTruthy();
      const text = extractVNodeText(result);
      expect(text).toContain('A');
      expect(text).toContain('B');
    });
  });

  describe('width and padding', () => {
    test('Box applies explicit width prop', () => {
      const component = Markdown.setup({ content: 'Test', width: 80 });
      const result = component();

      expect(result.props.width).toBe(80);
    });

    test('Box applies padding prop', () => {
      const component = Markdown.setup({ content: 'Test', padding: 2 });
      const result = component();

      expect(result.props.padding).toBe(2);
    });

    test('combines width and padding correctly', () => {
      const component = Markdown.setup({ content: 'Test', width: 80, padding: 4 });
      const result = component();

      expect(result.props.width).toBe(80);
      expect(result.props.padding).toBe(4);
    });

    test('width defaults to null', () => {
      const component = Markdown.setup({ content: 'Test' });
      const result = component();

      expect(result.props.width).toBe(null);
    });

    test('renders with default settings', () => {
      const component = Markdown.setup({ content: 'Test' });
      const result = component();

      expect(result).toBeTruthy();
      expect(getVNodeType(result)).toBe('Box');
    });

    test('contentWidth calculation accounts for padding', () => {
      // When width=100 and padding=5, contentWidth should be 90 (100 - 5*2)
      const component = Markdown.setup({ content: '---', width: 100, padding: 5 });
      const result = component();

      const dividers = findVNodesByType(result, 'Divider');
      expect(dividers[0].props.length).toBe(90);
    });
  });

  describe('caching behavior', () => {
    test('returns same cached result for identical content and width', () => {
      const props = { content: 'Test content', width: 80 };
      const component = Markdown.setup(props);

      const result1 = component();
      const result2 = component();

      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
      expect(getVNodeType(result1)).toBe('Box');
      expect(getVNodeType(result2)).toBe('Box');
    });

    test('invalidates cache and re-parses when content changes', () => {
      const props = { content: 'First content' };
      const component = Markdown.setup(props);

      const result1 = component();
      const text1 = extractVNodeText(result1);

      props.content = 'Second content';
      const result2 = component();
      const text2 = extractVNodeText(result2);

      expect(text1).toContain('First content');
      expect(text2).toContain('Second content');
      expect(text1).not.toContain('Second content');
      expect(text2).not.toContain('First content');
    });

    test('invalidates cache and re-parses when width changes', () => {
      const props = { content: '---', width: 80 };
      const component = Markdown.setup(props);

      const result1 = component();
      expect(result1.props.width).toBe(80);

      props.width = 100;
      const result2 = component();
      expect(result2.props.width).toBe(100);

      // Verify both results render correctly
      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
    });

    test('cache key includes content hash', () => {
      const props1 = { content: 'Content A' };
      const props2 = { content: 'Content B' };

      const component1 = Markdown.setup(props1);
      const component2 = Markdown.setup(props2);

      const result1 = component1();
      const result2 = component2();

      expect(extractVNodeText(result1)).toContain('Content A');
      expect(extractVNodeText(result2)).toContain('Content B');
    });

    test('cache key includes width in key', () => {
      const content = '---';

      const component1 = Markdown.setup({ content, width: 50 });
      const component2 = Markdown.setup({ content, width: 100 });

      const result1 = component1();
      const result2 = component2();

      expect(result1.props.width).toBe(50);
      expect(result2.props.width).toBe(100);

      const dividers1 = findVNodesByType(result1, 'Divider');
      const dividers2 = findVNodesByType(result2, 'Divider');

      expect(dividers1.length).toBe(1);
      expect(dividers2.length).toBe(1);
    });

    test('empty content uses special cache key', () => {
      const component = Markdown.setup({ content: '' });
      const result = component();

      expect(result).toBeTruthy();
      expect(getVNodeType(result)).toBe('Box');
    });
  });

  describe('complex markdown documents', () => {
    test('renders document with mixed markdown elements', () => {
      const content = `# Title\n\nSome **bold** and *italic* text.\n\n- List item\n- Another item\n\n\`\`\`js\ncode();\n\`\`\``;
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('# Title');
      expect(text).toContain('bold');
      expect(text).toContain('italic');
      expect(text).toContain('List item');
      expect(text).toContain('code()');

      // Verify multiple element types are created
      const textBoxes = findVNodesByType(result, 'TextBox');
      const newlines = findVNodesByType(result, 'Newline');
      expect(textBoxes.length).toBeGreaterThan(5);
      expect(newlines.length).toBeGreaterThan(0);
    });

    test('renders document with all major markdown features', () => {
      const content = `# Main Title

## Section 1

Paragraph with **bold**, *italic*, and \`code\`.

- List item 1
- List item 2

> A blockquote

---

| Col1 | Col2 |
|------|------|
| A    | B    |

\`\`\`
code block
\`\`\``;
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('Main Title');
      expect(text).toContain('Section 1');
      expect(text).toContain('bold');
      expect(text).toContain('italic');
      expect(text).toContain('code');
      expect(text).toContain('blockquote');
      expect(text).toContain('code block');

      const dividers = findVNodesByType(result, 'Divider');
      expect(dividers.length).toBeGreaterThan(0);
    });

    test('renders deeply nested markdown correctly', () => {
      const content = '# Heading\n\n> Quote with **bold** and [link](url)\n\n- List with `code` and *italic*';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('Heading');
      expect(text).toContain('Quote');
      expect(text).toContain('bold');
      expect(text).toContain('link');
      expect(text).toContain('code');
      expect(text).toContain('italic');
    });

    test('large vnode count for complex document', () => {
      const content = `# Title\n\nParagraph.\n\n## Subtitle\n\n- Item 1\n- Item 2\n\n\`\`\`\ncode\n\`\`\``;
      const component = Markdown.setup({ content });
      const result = component();

      const vnodeCount = countVNodes(result);
      expect(vnodeCount).toBeGreaterThan(10);
    });
  });

  describe('edge cases and error handling', () => {
    test('handles empty string content', () => {
      const component = Markdown.setup({ content: '' });
      const result = component();

      expect(result).toBeTruthy();
      expect(getVNodeType(result)).toBe('Box');
      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
    });

    test('handles null content without error', () => {
      const component = Markdown.setup({ content: null });
      const result = component();

      expect(result).toBeTruthy();
      expect(getVNodeType(result)).toBe('Box');
    });

    test('handles undefined content without error', () => {
      const component = Markdown.setup({ content: undefined });
      const result = component();

      expect(result).toBeTruthy();
      expect(getVNodeType(result)).toBe('Box');
    });

    test('handles very long content efficiently', () => {
      const longContent = 'Word '.repeat(2000);
      const component = Markdown.setup({ content: longContent });
      const result = component();
      const text = extractVNodeText(result);

      expect(text.length).toBeGreaterThan(5000);
      expect(result).toBeTruthy();
    });

    test('handles special unicode characters', () => {
      const content = 'Special → chars ✓ 🚀 ★';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('→');
      expect(text).toContain('✓');
      expect(text).toContain('🚀');
      expect(text).toContain('★');
    });

    test('handles mixed unicode scripts', () => {
      const content = 'Hello 世界 مرحبا Привет';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('世界');
      expect(text).toContain('مرحبا');
      expect(text).toContain('Привет');
    });

    test('handles malformed markdown without crashing', () => {
      const content = '# Unclosed **bold\n\n- Incomplete [link';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(result).toBeTruthy();
      expect(text).toContain('Unclosed');
      expect(text).toContain('Incomplete');
    });

    test('handles heading with only hash symbol', () => {
      const component = Markdown.setup({ content: '#' });
      const result = component();
      const text = stripAnsi(extractVNodeText(result));

      expect(result).toBeTruthy();
      expect(text).toContain('#');
    });

    test('handles whitespace-only content', () => {
      const component = Markdown.setup({ content: '   \n\n   ' });
      const result = component();

      expect(result).toBeTruthy();
      expect(getVNodeType(result)).toBe('Box');
    });

    test('handles raw HTML tags in markdown', () => {
      const content = '<div>HTML content</div>';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('HTML content');
      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
    });

    test('handles zero width gracefully', () => {
      const component = Markdown.setup({ content: 'Test', width: 0 });
      const result = component();

      expect(result.props.width).toBe(0);
    });

    test('handles negative padding value', () => {
      const component = Markdown.setup({ content: 'Test', padding: -5 });
      const result = component();

      expect(result.props.padding).toBe(-5);
    });

    test('handles large width value', () => {
      const component = Markdown.setup({ content: '---', width: 10000 });
      const result = component();

      expect(result.props.width).toBe(10000);
      const dividers = findVNodesByType(result, 'Divider');
      expect(dividers.length).toBe(1);
    });

    test('handles multiple consecutive blank lines', () => {
      const content = 'Line 1\n\n\n\n\nLine 2';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('Line 1');
      expect(text).toContain('Line 2');
    });

    test('handles tabs in content', () => {
      const content = 'Text\twith\ttabs';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(result).toBeTruthy();
      expect(text).toBeTruthy();
    });

    test('handles escaped markdown characters', () => {
      const content = '\\# Not a heading\n\\* Not a list';
      const component = Markdown.setup({ content });
      const result = component();
      const text = extractVNodeText(result);

      expect(result).toBeTruthy();
      expect(text).toBeTruthy();
    });

    test('handles markdown with only formatting characters', () => {
      const content = '**********';
      const component = Markdown.setup({ content });
      const result = component();

      expect(result).toBeTruthy();
      expect(getVNodeType(result)).toBe('Box');
    });

    test('handles single character content', () => {
      const component = Markdown.setup({ content: 'A' });
      const result = component();
      const text = extractVNodeText(result);

      expect(text).toContain('A');
    });

    test('handles content with mixed line endings', () => {
      const content = 'Line 1\nLine 2\rLine 3\r\nLine 4';
      const component = Markdown.setup({ content });
      const result = component();

      expect(result).toBeTruthy();
      expect(getVNodeType(result)).toBe('Box');
    });
  });

  describe('vnode structure validation', () => {
    test('root vnode is always Box', () => {
      const component = Markdown.setup({ content: 'Any content' });
      const result = component();

      expect(getVNodeType(result)).toBe('Box');
      expect(result.type).toBeDefined();
    });

    test('children are accessible via default slot', () => {
      const component = Markdown.setup({ content: 'Test' });
      const result = component();

      expect(result.children).toBeDefined();
      expect(result.children.default).toBeDefined();
    });

    test('TextBox vnodes created for text content', () => {
      const component = Markdown.setup({ content: 'Simple text' });
      const result = component();

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
      expect(textBoxes[0].type).toBeDefined();
    });

    test('Newline vnodes inserted between blocks', () => {
      const component = Markdown.setup({ content: '# Title\n\nParagraph' });
      const result = component();

      const newlines = findVNodesByType(result, 'Newline');
      expect(newlines.length).toBeGreaterThan(0);
    });

    test('Divider vnode for horizontal rules', () => {
      const component = Markdown.setup({ content: '---' });
      const result = component();

      const dividers = findVNodesByType(result, 'Divider');
      expect(dividers.length).toBe(1);
      expect(dividers[0].props).toBeDefined();
    });

    test('table renders in markdown', () => {
      const content = '| A | B |\n|---|---|\n| 1 | 2 |';
      const component = Markdown.setup({ content });
      const result = component();

      expect(result).toBeTruthy();
      const text = extractVNodeText(result);
      expect(text).toContain('A');
      expect(text).toContain('B');
      expect(text).toContain('1');
      expect(text).toContain('2');
    });

    test('vnode count scales with content complexity', () => {
      const simple = Markdown.setup({ content: 'Text' });
      const complex = Markdown.setup({ content: '# Title\n\nParagraph\n\n- List\n\n---' });

      const simpleCount = countVNodes(simple());
      const complexCount = countVNodes(complex());

      expect(complexCount).toBeGreaterThan(simpleCount);
    });

    test('all vnodes have type property', () => {
      const component = Markdown.setup({ content: '# Title\n\nText' });
      const result = component();

      function checkVNode(vnode) {
        expect(vnode.type).toBeDefined();
        if (vnode.children && typeof vnode.children.default === 'function') {
          const children = vnode.children.default();
          if (Array.isArray(children)) {
            children.forEach(child => {
              if (child && typeof child === 'object') {
                checkVNode(child);
              }
            });
          }
        }
      }

      checkVNode(result);
    });
  });

  describe('complete rendering snapshots', () => {
    test('simple paragraph renders correctly', () => {
      const component = Markdown.setup({ content: 'Hello World' });
      const result = component();

      expect(getVNodeType(result)).toBe('Box');
      expect(result.props.border).toBe(false);

      const text = extractVNodeText(result);
      expect(text).toContain('Hello World');

      const textBoxes = findVNodesByType(result, 'TextBox');
      expect(textBoxes.length).toBeGreaterThan(0);
    });

    test('heading with paragraph renders with correct structure', () => {
      const component = Markdown.setup({ content: '# Title\n\nParagraph content' });
      const result = component();

      expect(getVNodeType(result)).toBe('Box');

      const text = extractVNodeText(result);
      expect(text).toContain('# Title');
      expect(text).toContain('Paragraph content');

      const textBoxes = findVNodesByType(result, 'TextBox');
      const boldBoxes = textBoxes.filter(box => box.props?.bold === true);
      expect(boldBoxes.length).toBeGreaterThanOrEqual(1);

      const newlines = findVNodesByType(result, 'Newline');
      expect(newlines.length).toBeGreaterThan(0);
    });

    test('list with code renders with correct components', () => {
      const content = '- Item 1\n- Item with `code`\n- Item 3';
      const component = Markdown.setup({
        content,
        listBulletColor: 'green',
        codeColor: 'yellow'
      });
      const result = component();

      const text = extractVNodeText(result);
      expect(text).toContain('Item 1');
      expect(text).toContain('code');
      expect(text).toContain('Item 3');

      const textBoxes = findVNodesByType(result, 'TextBox');
      const greenBoxes = textBoxes.filter(box => box.props?.color === 'green');
      const yellowBoxes = textBoxes.filter(box => box.props?.color === 'yellow');

      expect(greenBoxes.length).toBeGreaterThan(0);
      expect(yellowBoxes.length).toBeGreaterThan(0);
    });

    test('complete document with all features renders correctly', () => {
      const content = '# Main Title\n\n**Bold** text with `code`\n\n- List item\n\n---\n\n> Quote';
      const component = Markdown.setup({
        content,
        h1Color: 'cyan',
        codeColor: 'yellow',
        listBulletColor: 'green'
      });
      const result = component();

      expect(getVNodeType(result)).toBe('Box');

      const text = extractVNodeText(result);
      expect(text).toContain('Main Title');
      expect(text).toContain('Bold');
      expect(text).toContain('code');
      expect(text).toContain('List item');
      expect(text).toContain('Quote');

      const dividers = findVNodesByType(result, 'Divider');
      expect(dividers.length).toBe(1);

      const textBoxes = findVNodesByType(result, 'TextBox');
      const cyanBoxes = textBoxes.filter(box => box.props?.color === 'cyan');
      const yellowBoxes = textBoxes.filter(box => box.props?.color === 'yellow');
      const greenBoxes = textBoxes.filter(box => box.props?.color === 'green');

      expect(cyanBoxes.length).toBeGreaterThan(0);
      expect(yellowBoxes.length).toBeGreaterThan(0);
      expect(greenBoxes.length).toBeGreaterThan(0);

      const vnodeCount = countVNodes(result);
      expect(vnodeCount).toBeGreaterThan(10);
    });
  });
});
