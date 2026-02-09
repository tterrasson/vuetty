import { describe, expect, mock, test } from 'bun:test';
import { createStaticVNode, h } from 'vue';
import { TUINode } from '../../src/core/node.js';
import { createTUIRenderer } from '../../src/core/renderer.js';

async function flushRender() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('createTUIRenderer', () => {
  test('renders output, deduplicates unchanged output, and supports forceUpdate', async () => {
    const root = new TUINode('root');
    const onUpdate = mock(() => {});
    const beforeRender = mock(() => {});
    const afterRender = mock(() => {});

    const renderer = createTUIRenderer({
      rootContainer: root,
      onUpdate,
      beforeRender,
      afterRender
    });

    renderer.render(h('box', { id: 'one' }, 'hello'), root);
    await flushRender();

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][0]).toBe('hello\n');
    expect(beforeRender).toHaveBeenCalledWith(root);
    expect(afterRender).toHaveBeenCalledWith(root);

    renderer.render(h('box', { id: 'one' }, 'hello'), root);
    await flushRender();
    expect(onUpdate).toHaveBeenCalledTimes(1);

    renderer.forceUpdate();
    await flushRender();
    expect(onUpdate).toHaveBeenCalledTimes(2);

    renderer.render(null, root);
    await flushRender();
    expect(root.children).toHaveLength(0);
    expect(onUpdate).toHaveBeenCalledTimes(3);
    expect(onUpdate.mock.calls[2][0]).toBe('\n');
  });

  test('handles metadata props, shallow equality for arrays/objects, prop deletion and layout dirtying', async () => {
    const root = new TUINode('root');
    const renderer = createTUIRenderer({
      rootContainer: root,
      onUpdate: () => {}
    });

    renderer.render(h('box', {
      _componentId: 'btn-1',
      _clickable: true,
      width: 10,
      label: { text: 'X' },
      options: ['a', 'b'],
      title: 'hello'
    }, 'x'), root);
    await flushRender();

    const node = root.children[0];
    expect(node.componentId).toBe('btn-1');
    expect(node.clickable).toBe(true);
    expect(node.props._componentId).toBeUndefined();
    expect(node.props._clickable).toBeUndefined();
    expect(node.props.title).toBe('hello');

    const markLayoutDirty = mock(() => {});
    node.markLayoutDirty = markLayoutDirty;
    node.isDirty = false;

    renderer.render(h('box', {
      _componentId: 'btn-1',
      _clickable: true,
      width: 10,
      label: { text: 'X' },
      options: ['a', 'b'],
      title: 'hello'
    }, 'x'), root);
    await flushRender();
    expect(node.props.width).toBe(10);
    expect(node.props.title).toBe('hello');

    markLayoutDirty.mockClear();
    node.isDirty = false;

    renderer.render(h('box', {
      _componentId: 'btn-1',
      _clickable: true,
      width: 11,
      label: { text: 'Y' },
      options: ['a', 'c'],
      title: null
    }, 'x'), root);

    expect(node.isDirty).toBe(true);
    expect(markLayoutDirty).toHaveBeenCalled();
    await flushRender();

    expect('title' in node.props).toBe(false);
    expect(node.props.width).toBe(11);
  });

  test('supports text-node updates, keyed moves with anchors, and static content insertion', async () => {
    const root = new TUINode('root');
    const onUpdate = mock(() => {});
    const renderer = createTUIRenderer({
      rootContainer: root,
      onUpdate
    });

    renderer.render(h('box', null, ['A']), root);
    await flushRender();
    expect(onUpdate.mock.calls.at(-1)[0]).toBe('A\n');

    renderer.render(h('box', null, ['B']), root);
    await flushRender();
    expect(onUpdate.mock.calls.at(-1)[0]).toBe('B\n');

    renderer.render(h('box', null, [
      h('item', { key: 'a' }, 'A'),
      h('item', { key: 'b' }, 'B')
    ]), root);
    await flushRender();
    const ordered = onUpdate.mock.calls.at(-1)[0];
    expect(ordered.indexOf('A')).toBeLessThan(ordered.indexOf('B'));

    renderer.render(h('box', null, [
      h('item', { key: 'b' }, 'B'),
      h('item', { key: 'a' }, 'A')
    ]), root);
    await flushRender();
    const reversed = onUpdate.mock.calls.at(-1)[0];
    expect(reversed.indexOf('B')).toBeLessThan(reversed.indexOf('A'));

    renderer.render(h('box', null, [
      createStaticVNode('STATIC', 1)
    ]), root);
    await flushRender();
    expect(onUpdate.mock.calls.at(-1)[0]).toBe('STATIC\n');
  });

  test('skips onUpdate when no root container and reports debug render stats when present', async () => {
    const onUpdate = mock(() => {});
    const rendererNoRoot = createTUIRenderer({
      rootContainer: null,
      onUpdate
    });

    rendererNoRoot.forceUpdate();
    await flushRender();
    expect(onUpdate).not.toHaveBeenCalled();

    const root = new TUINode('root');
    const captureRenderComplete = mock(() => {});
    const renderer = createTUIRenderer({
      rootContainer: root,
      onUpdate
    });
    renderer.vuettyInstance = {
      debugServer: {
        captureRenderComplete
      }
    };

    renderer.render(h('box', null, 'debug'), root);
    await flushRender();

    expect(captureRenderComplete).toHaveBeenCalledTimes(1);
    expect(captureRenderComplete.mock.calls[0][0].outputLength).toBe(6);
    expect(captureRenderComplete.mock.calls[0][0].rootContainer).toBe(root);
    expect(typeof captureRenderComplete.mock.calls[0][0].duration).toBe('number');
  });
});
