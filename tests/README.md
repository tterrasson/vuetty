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
