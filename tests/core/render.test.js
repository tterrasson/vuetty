import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { TUINode } from '../../src/core/node.js';
import { getRenderStats, renderNode, renderToString } from '../../src/core/render.js';
import {
  startPositionTracking,
  stopPositionTracking
} from '../../src/core/renderContext.js';
import { renderHandlerRegistry } from '../../src/core/renderHandlers.js';

const CUSTOM_HANDLER_TYPE = 'unit-test-render-handler';

describe('render core', () => {
  beforeEach(() => {
    stopPositionTracking();
    renderHandlerRegistry.unregister(CUSTOM_HANDLER_TYPE);
  });

  afterEach(() => {
    stopPositionTracking();
    renderHandlerRegistry.unregister(CUSTOM_HANDLER_TYPE);
  });

  test('renderNode handles null and comment nodes', () => {
    expect(renderNode(null)).toBe('');

    const comment = new TUINode('comment');
    comment.text = 'ignored';
    expect(renderNode(comment)).toBe('');
  });

  test('renderNode uses registered handler and caches output', () => {
    const handler = { render: mock((ctx) => `x:${ctx.absX},y:${ctx.absY},row:${ctx.inRow}`) };
    renderHandlerRegistry.register(CUSTOM_HANDLER_TYPE, handler);

    const node = new TUINode(CUSTOM_HANDLER_TYPE);
    node.cachedLayoutMetrics = { x: 3 };
    const output = renderNode(node, 2, {
      parentAbsX: 5,
      parentAbsY: 7,
      yOffset: 4,
      inRow: true
    });

    expect(output).toBe('x:8,y:11,row:true');
    expect(handler.render).toHaveBeenCalledTimes(1);
    expect(node.cachedOutput).toBe(output);
    expect(node.isDirty).toBe(false);
  });

  test('renderNode falls back to node text when no handler exists', () => {
    const parent = new TUINode('unknown-parent');
    parent.text = 'parent';

    const child = new TUINode('text');
    child.text = 'child';
    parent.appendChild(child);

    expect(renderNode(parent)).toBe('parent');
  });

  test('renderNode reuses cached output and registers clickable region dimensions from output', () => {
    const node = new TUINode('cached');
    node.props._clickable = true;
    node.props._componentId = 'cached-btn';
    node.cachedLayoutMetrics = { x: 2 };
    node.cachedOutput = 'ok\nxy';
    node.isDirty = false;
    node.childrenDirty = false;

    const statsBefore = getRenderStats();

    startPositionTracking();
    const output = renderNode(node, 1, {
      parentAbsX: 3,
      parentAbsY: 4,
      yOffset: 5
    });
    const regions = stopPositionTracking();
    const statsAfter = getRenderStats();

    expect(output).toBe('ok\nxy');
    expect(regions).toEqual([{
      componentId: 'cached-btn',
      x: 5,
      y: 9,
      width: 2,
      height: 2,
      depth: 1,
      nodeType: 'cached'
    }]);

    expect(statsAfter.totalNodes).toBe(statsBefore.totalNodes + 1);
    expect(statsAfter.skippedNodes).toBe(statsBefore.skippedNodes + 1);
  });

  test('renderNode falls back to cached layout metrics for empty cached output', () => {
    const node = new TUINode('cached-empty');
    node.props._clickable = true;
    node.props._componentId = 'empty-btn';
    node.cachedLayoutMetrics = { x: 1, width: 6, height: 2 };
    node.cachedOutput = '';
    node.isDirty = false;
    node.childrenDirty = false;

    startPositionTracking();
    const output = renderNode(node, 0, {
      parentAbsX: 2,
      parentAbsY: 1
    });
    const regions = stopPositionTracking();

    expect(output).toBe('');
    expect(regions).toEqual([{
      componentId: 'empty-btn',
      x: 3,
      y: 1,
      width: 6,
      height: 2,
      depth: 0,
      nodeType: 'cached-empty'
    }]);
  });

  test('renderToString renders root children, skips comments, and appends final newline', () => {
    const root = new TUINode('root');

    const first = new TUINode('text');
    first.text = 'line1';

    const comment = new TUINode('comment');
    comment.text = 'skip';

    const second = new TUINode('text');
    second.text = 'line2';
    second.props._clickable = true;
    second.props._componentId = 'line2-btn';
    second.cachedLayoutMetrics = { x: 4 };

    root.appendChild(first);
    root.appendChild(comment);
    root.appendChild(second);

    const output = renderToString(root);
    const stats = getRenderStats();

    expect(output).toBe('line1\nline2\n');
    expect(root._clickRegions).toEqual([{
      componentId: 'line2-btn',
      x: 4,
      y: 1,
      width: 5,
      height: 1,
      depth: 0,
      nodeType: 'text'
    }]);
    expect(stats.totalNodes).toBeGreaterThan(0);
    expect(stats.lastRenderTime).toBeGreaterThanOrEqual(0);
  });

  test('getRenderStats returns a copy', () => {
    const stats = getRenderStats();
    stats.totalNodes = -1;

    expect(getRenderStats().totalNodes).not.toBe(-1);
  });
});
