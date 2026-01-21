# Vuetty Tests

This directory contains unit tests for the Vuetty TUI library.

## Structure

```
tests/
├── setup.js                  # Global test configuration
├── helpers/
│   └── test-utils.js        # Reusable test utilities
├── core/                    # Tests for core components
│   ├── node.test.js
│   └── flexLayout.test.js
└── components/              # Tests for UI components
    ├── Box.test.js
    └── Button.test.js
```

## Running Tests

### All tests
```bash
bun test
```

### Specific file
```bash
bun test tests/core/node.test.js
```

### Specific directory
```bash
bun test tests/core/
```

### Watch mode (re-run on changes)
```bash
bun test --watch
```

## Writing New Tests

### Basic test structure

```javascript
import { test, expect, describe } from 'bun:test';
import { myModule } from '../../src/myModule.js';

describe('MyModule', () => {
  test('does something', () => {
    const result = myModule.doSomething();
    expect(result).toBe('expected value');
  });
});
```

### Using helpers

```javascript
import { stripAnsi, createMockNode } from '../helpers/test-utils.js';

test('test with helpers', () => {
  const node = createMockNode('div', { color: 'red' });
  const output = renderSomething(node);
  expect(stripAnsi(output)).toBe('plain text');
});
```

## Available Helpers

### `test-utils.js`

- **`createMockNode(type, props)`** - Create a test TUINode
- **`createMockTextNode(text)`** - Create a test TextNode
- **`stripAnsi(str)`** - Remove ANSI codes from a string
- **`stripAllEscapeSequences(str)`** - Remove all escape sequences
- **`createNodeTree(type, children, props)`** - Create a node tree
- **`getNodeTextContent(node)`** - Extract text content from a node
- **`countNodes(node)`** - Count nodes in a tree
- **`nextTick()`** - Wait for next tick (async)
- **`setMockTerminalSize(rows, columns)`** - Set terminal dimensions
- **`getLines(output)`** - Split output into lines
- **`getLineCount(output)`** - Count lines in output

### `setup.js`

- **`getCapturedOutput()`** - Get captured stdout output
- **`clearCapturedOutput()`** - Clear captured output

## Best Practices

1. **Organization**: Group tests with `describe()` for better readability
2. **Naming**: Use descriptive names for tests
3. **Isolation**: Each test should be independent
4. **Clear assertions**: Use explicit and easy-to-understand assertions
5. **Minimal mocking**: Only mock what's necessary

## Available Bun Matchers

- `expect(x).toBe(y)` - Strict equality (===)
- `expect(x).toEqual(y)` - Deep equality
- `expect(x).toBeTruthy()` - Truthy value
- `expect(x).toBeFalsy()` - Falsy value
- `expect(x).toBeNull()` - null
- `expect(x).toBeUndefined()` - undefined
- `expect(x).toContain(y)` - Contains element
- `expect(x).toMatch(regex)` - Matches regex
- `expect(x).toHaveLength(n)` - Array/string length
- `expect(x).toHaveProperty(key)` - Has property
- `expect(x).toBeGreaterThan(n)` - Greater than
- `expect(x).toBeLessThan(n)` - Less than

## Code Coverage

To generate a coverage report:

```bash
bun test --coverage
```

## Debugging

To debug a test:

```javascript
test('debug example', () => {
  const value = someFunction();
  console.log('Debug:', value); // Displays in console
  expect(value).toBe(expected);
});
```

## Test Statistics

- **Total Tests:** 384
- **Total Assertions:** 567
- **Pass Rate:** 100%
- **Execution Time:** ~378ms

For detailed coverage information, see [TEST_COVERAGE.md](./TEST_COVERAGE.md).
