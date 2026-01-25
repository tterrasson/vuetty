/**
 * Tests for List component (static display)
 */

import { test, expect, describe } from 'bun:test';
import { renderList } from '../../src/components/List.js';
import { stripAnsi } from '../helpers/test-utils.js';

describe('List component', () => {
  const items = [
    { label: 'Alpha', value: 'alpha' },
    { label: 'Beta', value: 'beta' },
    { label: 'Gamma', value: 'gamma' }
  ];

  test('renders list items', () => {
    const result = renderList({
      items
    });
    const stripped = stripAnsi(result);

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(stripped).toContain('Alpha');
    expect(stripped).toContain('Beta');
    expect(stripped).toContain('Gamma');
  });

  test('renders primitive items (strings)', () => {
    const primitiveItems = [
      { label: 'Apple', value: 'Apple' },
      { label: 'Banana', value: 'Banana' },
      { label: 'Cherry', value: 'Cherry' }
    ];

    const result = renderList({
      items: primitiveItems
    });
    const stripped = stripAnsi(result);

    expect(stripped).toContain('Apple');
    expect(stripped).toContain('Banana');
    expect(stripped).toContain('Cherry');
  });

  test('renders label when provided', () => {
    const result = renderList({
      items,
      label: 'Items'
    });
    const stripped = stripAnsi(result);

    expect(stripped).toContain('Items');
  });

  test('shows empty list message', () => {
    const result = renderList({
      items: []
    });
    const stripped = stripAnsi(result);

    expect(stripped).toContain('(empty list)');
  });

  test('shows highlight marker for highlighted value', () => {
    const result = renderList({
      items,
      highlightedValue: 'beta'
    });
    const stripped = stripAnsi(result);

    expect(stripped).toContain('•');
    expect(stripped).toContain('Beta');
  });

  test('uses custom marker', () => {
    const result = renderList({
      items,
      highlightedValue: 'beta',
      marker: '→'
    });
    const stripped = stripAnsi(result);

    expect(stripped).toContain('→');
    expect(stripped).toContain('Beta');
  });

  test('limits display to height when provided', () => {
    const manyItems = Array.from({ length: 12 }, (_, i) => ({
      label: `Item ${i + 1}`,
      value: i + 1
    }));

    const result = renderList({
      items: manyItems,
      height: 5
    });
    const stripped = stripAnsi(result);

    // Should only show first 5 items
    expect(stripped).toContain('Item 1');
    expect(stripped).toContain('Item 5');
    expect(stripped).not.toContain('Item 6');
    expect(stripped).toContain('showing 5 of 12 items');
  });

  test('shows all items when no height specified', () => {
    const result = renderList({
      items
    });
    const stripped = stripAnsi(result);

    expect(stripped).toContain('Alpha');
    expect(stripped).toContain('Beta');
    expect(stripped).toContain('Gamma');
    expect(stripped).not.toContain('showing');
  });

  test('respects color prop', () => {
    const result = renderList({
      items,
      color: 'green'
    });

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('respects bold prop', () => {
    const result = renderList({
      items,
      bold: true
    });

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('respects dim prop', () => {
    const result = renderList({
      items,
      dim: true
    });

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('handles mixed item formats', () => {
    const mixedItems = [
      { label: 'String item', value: 'String item' },
      { label: 'Object item', value: 'obj' },
      { label: '42', value: 42 }
    ];

    const result = renderList({
      items: mixedItems
    });
    const stripped = stripAnsi(result);

    expect(stripped).toContain('String item');
    expect(stripped).toContain('Object item');
    expect(stripped).toContain('42');
  });
});
