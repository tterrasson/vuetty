import { describe, expect, mock, test } from 'bun:test';
import {
  RenderContext,
  RenderHandler,
  renderHandlerRegistry
} from '../../src/core/renderHandlers.js';
import { TUINode } from '../../src/core/node.js';

describe('renderHandlers', () => {
  test('RenderContext exposes node data through accessors', () => {
    const node = new TUINode('custom');
    node.text = 'hello';
    node.props = { variant: 'primary' };
    node.cachedLayoutMetrics = { width: 12, height: 2 };
    node.children = [new TUINode('text')];

    const ctx = new RenderContext({
      node,
      depth: 3,
      absX: 4,
      absY: 5,
      inRow: true,
      renderNodeFn: () => ''
    });

    expect(ctx.props).toEqual({ variant: 'primary' });
    expect(ctx.text).toBe('hello');
    expect(ctx.children).toHaveLength(1);
    expect(ctx.metrics).toEqual({ width: 12, height: 2 });
  });

  test('getEffectiveWidth follows renderWidth -> props.width -> metrics.width precedence', () => {
    const node = new TUINode('custom');
    node.props.width = 20;
    node.cachedLayoutMetrics = { width: 30 };

    const ctx = new RenderContext({
      node,
      depth: 0,
      absX: 0,
      absY: 0,
      inRow: false,
      renderNodeFn: () => ''
    });

    node._renderWidth = 10;
    expect(ctx.getEffectiveWidth()).toBe(10);

    node._renderWidth = undefined;
    expect(ctx.getEffectiveWidth()).toBe(20);

    node.props.width = null;
    expect(ctx.getEffectiveWidth()).toBe(30);

    node.cachedLayoutMetrics = null;
    expect(ctx.getEffectiveWidth()).toBeNull();
  });

  test('renderChild delegates to renderNode with default inherited coordinates', () => {
    const child = new TUINode('text');
    const renderNodeFn = mock(() => 'child-output');
    const ctx = new RenderContext({
      node: new TUINode('parent'),
      depth: 2,
      absX: 11,
      absY: 7,
      inRow: false,
      renderNodeFn
    });

    const output = ctx.renderChild(child);
    expect(output).toBe('child-output');
    expect(renderNodeFn).toHaveBeenCalledWith(child, 3, {
      parentAbsX: 11,
      parentAbsY: 7,
      yOffset: 0,
      inRow: false
    });
  });

  test('renderChild allows overriding inherited options', () => {
    const child = new TUINode('text');
    const renderNodeFn = mock(() => 'override-output');
    const ctx = new RenderContext({
      node: new TUINode('parent'),
      depth: 1,
      absX: 3,
      absY: 9,
      inRow: false,
      renderNodeFn
    });

    const output = ctx.renderChild(child, {
      parentAbsX: 42,
      yOffset: 6,
      inRow: true
    });

    expect(output).toBe('override-output');
    expect(renderNodeFn).toHaveBeenCalledWith(child, 2, {
      parentAbsX: 42,
      parentAbsY: 9,
      yOffset: 6,
      inRow: true
    });
  });

  test('RenderHandler base class enforces implementation', () => {
    const handler = new RenderHandler();
    expect(() => handler.render({})).toThrow('render() must be implemented');
  });

  test('registry supports register/get/has/unregister lifecycle', () => {
    const type = 'unit-test-render-handler-registry';
    const handler = { render: () => 'ok' };

    renderHandlerRegistry.register(type, handler);
    expect(renderHandlerRegistry.has(type)).toBe(true);
    expect(renderHandlerRegistry.get(type)).toBe(handler);

    renderHandlerRegistry.unregister(type);
    expect(renderHandlerRegistry.has(type)).toBe(false);
    expect(renderHandlerRegistry.get(type)).toBeNull();
  });
});
