/**
 * Tests for flexRenderers render-time state restoration
 * Ensures mutated node props (_targetHeight, width, _renderWidth) are
 * restored even when a child render throws.
 */

import { test, expect, describe } from 'bun:test';
import { TUINode } from '../../src/core/node.js';
import { renderFlexCol, renderFlexRow } from '../../src/core/flexRenderers.js';

function makeRowWithChildren(childrenSpecs, metricsChildren) {
  const row = new TUINode('row');
  for (const spec of childrenSpecs) {
    const child = new TUINode(spec.type);
    child.text = spec.text;
    row.appendChild(child);
  }
  row.cachedLayoutMetrics = {
    width: 40, height: 1, x: 0, y: 0, children: metricsChildren
  };
  return row;
}

function makeColWithBoxChild() {
  const col = new TUINode('col');
  const child = new TUINode('box');
  // flex prop makes shouldConstrainHeight true, enabling the _targetHeight injection path
  child.props.flex = 1;
  col.appendChild(child);

  col.cachedLayoutMetrics = {
    width: 20,
    height: 5,
    x: 0,
    y: 0,
    children: [{ width: 20, height: 5, x: 0, y: 0 }]
  };

  return { col, child };
}

describe('renderFlexCol error safety', () => {
  test('restores child props._targetHeight when child render throws', () => {
    const { col, child } = makeColWithBoxChild();

    const throwingRender = () => {
      renderFlexCol(col, 0, () => {
        throw new Error('render boom');
      });
    };

    expect(throwingRender).toThrow('render boom');
    expect('_targetHeight' in child.props).toBe(false);
    expect(child.props._targetHeight).toBeUndefined();
  });

  test('restores child props.width when child render throws', () => {
    const { col, child } = makeColWithBoxChild();

    expect('width' in child.props).toBe(false);

    const throwingRender = () => {
      renderFlexCol(col, 0, () => {
        throw new Error('render boom');
      });
    };

    expect(throwingRender).toThrow('render boom');
    expect('width' in child.props).toBe(false);
  });

  test('preserves pre-existing props.width when child render throws', () => {
    const { col, child } = makeColWithBoxChild();
    child.props.width = 42;

    expect(() => {
      renderFlexCol(col, 0, () => {
        throw new Error('render boom');
      });
    }).toThrow('render boom');

    expect(child.props.width).toBe(42);
  });

  test('restores pre-existing props._targetHeight when child render throws', () => {
    const { col, child } = makeColWithBoxChild();
    child.props._targetHeight = 9;

    expect(() => {
      renderFlexCol(col, 0, () => {
        throw new Error('render boom');
      });
    }).toThrow('render boom');

    expect(child.props._targetHeight).toBe(9);
  });
});

describe('renderFlexRow error safety', () => {
  test('restores child._renderWidth when child render throws', () => {
    const row = new TUINode('row');
    const child = new TUINode('col');
    row.appendChild(child);

    row.cachedLayoutMetrics = {
      width: 40,
      height: 1,
      x: 0,
      y: 0,
      children: [{ width: 20, height: 1, x: 0, y: 0 }]
    };

    expect(child._renderWidth).toBeUndefined();

    expect(() => {
      renderFlexRow(row, 0, () => {
        throw new Error('render boom');
      });
    }).toThrow('render boom');

    expect(child._renderWidth).toBeUndefined();
  });

  test('restores previous child._renderWidth value when child render throws', () => {
    const row = new TUINode('row');
    const child = new TUINode('col');
    child._renderWidth = 7;
    row.appendChild(child);

    row.cachedLayoutMetrics = {
      width: 40,
      height: 1,
      x: 0,
      y: 0,
      children: [{ width: 20, height: 1, x: 0, y: 0 }]
    };

    expect(() => {
      renderFlexRow(row, 0, () => {
        throw new Error('render boom');
      });
    }).toThrow('render boom');

    expect(child._renderWidth).toBe(7);
  });
});

describe('flexRenderers layout output', () => {
  test('renderFlexRow merges children horizontally using metrics x positions', () => {
    const row = makeRowWithChildren(
      [
        { type: 'textbox', text: 'aa' },
        { type: 'textbox', text: 'bb' }
      ],
      [
        { width: 2, height: 1, x: 0, y: 0 },
        { width: 2, height: 1, x: 10, y: 0 }
      ]
    );

    const renderNode = (node) => node.text;

    const output = renderFlexRow(row, 0, (child, _depth, opts) => renderNode(child));
    expect(output.split('\n')[0]).toBe('aa        bb');
  });

  test('renderFlexRow pads shorter children to the tallest item height', () => {
    const row = makeRowWithChildren(
      [
        { type: 'textbox', text: 'l1\nl2\nl3' },
        { type: 'textbox', text: 'x' }
      ],
      [
        { width: 2, height: 3, x: 0, y: 0 },
        { width: 1, height: 1, x: 5, y: 0 }
      ]
    );

    const output = renderFlexRow(row, 0, (child) => child.text);
    const lines = output.split('\n');
    expect(lines).toHaveLength(3);
    // Shorter item aligns to the top; rows are padded to the tallest item
    expect(lines[0]).toBe('l1   x');
    expect(lines[1]).toBe('l2   ');
    expect(lines[2]).toBe('l3   ');
  });

  test('renderFlexRow wraps items onto multiple rows when y differs', () => {
    const row = makeRowWithChildren(
      [
        { type: 'textbox', text: 'aa' },
        { type: 'textbox', text: 'bb' }
      ],
      [
        { width: 2, height: 1, x: 0, y: 0 },
        { width: 2, height: 1, x: 0, y: 1 }
      ]
    );
    row.props.flexWrap = 'wrap';

    const output = renderFlexRow(row, 0, (child) => child.text);
    expect(output.split('\n')).toEqual(['aa', 'bb']);
  });

  test('renderFlexRow applies vertical padding around content', () => {
    const row = makeRowWithChildren(
      [{ type: 'textbox', text: 'hi' }],
      [{ width: 2, height: 1, x: 0, y: 0 }]
    );
    row.props.padding = 1;

    const output = renderFlexRow(row, 0, (child) => child.text);
    expect(output.split('\n')).toEqual(['', 'hi', '']);
  });

  test('renderFlexCol joins children with gap lines', () => {
    const col = new TUINode('col');
    const a = new TUINode('textbox');
    a.text = 'aa';
    const b = new TUINode('textbox');
    b.text = 'bb';
    col.appendChild(a);
    col.appendChild(b);
    col.props.gap = 1;

    col.cachedLayoutMetrics = {
      width: 10, height: 4, x: 0, y: 0,
      children: [
        { width: 2, height: 1, x: 0, y: 0 },
        { width: 2, height: 1, x: 0, y: 2 }
      ]
    };

    const output = renderFlexCol(col, 0, (child) => child.text);
    expect(output.split('\n')).toEqual(['aa', '', 'bb']);
  });
});
