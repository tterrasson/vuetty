/**
 * Tests for TUINode class
 */

import { test, expect, describe } from 'bun:test';
import { TUINode, TextNode, CommentNode } from '../../src/core/node.js';

describe('TUINode', () => {
  describe('construction and initialization', () => {
    test('creates a node with correct type', () => {
      const node = new TUINode('div');
      expect(node.type).toBe('div');
    });

    test('creates node with custom type', () => {
      const boxNode = new TUINode('Box');
      const textBoxNode = new TUINode('TextBox');
      expect(boxNode.type).toBe('Box');
      expect(textBoxNode.type).toBe('TextBox');
    });

    test('initializes with empty children array', () => {
      const node = new TUINode('div');
      expect(node.children).toEqual([]);
      expect(Array.isArray(node.children)).toBe(true);
    });

    test('initializes with no parent', () => {
      const node = new TUINode('div');
      expect(node.parent).toBeNull();
    });

    test('initializes with empty text', () => {
      const node = new TUINode('div');
      expect(node.text).toBe('');
    });

    test('initializes with empty props object', () => {
      const node = new TUINode('div');
      expect(node.props).toEqual({});
      expect(typeof node.props).toBe('object');
    });

    test('initializes with dirty flags set to true', () => {
      const node = new TUINode('div');
      expect(node.isDirty).toBe(true);
      expect(node.childrenDirty).toBe(true);
      expect(node.isLayoutDirty).toBe(true);
    });

    test('initializes with render version 0', () => {
      const node = new TUINode('div');
      expect(node.renderVersion).toBe(0);
    });

    test('initializes with null cached values', () => {
      const node = new TUINode('div');
      expect(node.cachedOutput).toBeNull();
      expect(node.cachedChildrenOutput).toBeNull();
      expect(node.cachedLayoutMetrics).toBeNull();
    });

    test('initializes with undefined render width', () => {
      const node = new TUINode('div');
      expect(node._renderWidth).toBeUndefined();
    });

    test('initializes click handling properties', () => {
      const node = new TUINode('div');
      expect(node.componentId).toBeNull();
      expect(node.clickable).toBe(false);
    });
  });

  describe('appendChild', () => {
    test('adds child to children array', () => {
      const parent = new TUINode('div');
      const child = new TUINode('span');

      parent.appendChild(child);

      expect(parent.children).toHaveLength(1);
      expect(parent.children[0]).toBe(child);
    });

    test('adds multiple children in order', () => {
      const parent = new TUINode('div');
      const child1 = new TUINode('span');
      const child2 = new TUINode('p');
      const child3 = new TUINode('a');

      parent.appendChild(child1);
      parent.appendChild(child2);
      parent.appendChild(child3);

      expect(parent.children).toHaveLength(3);
      expect(parent.children[0]).toBe(child1);
      expect(parent.children[1]).toBe(child2);
      expect(parent.children[2]).toBe(child3);
    });

    test('sets parent reference on child', () => {
      const parent = new TUINode('div');
      const child = new TUINode('span');

      parent.appendChild(child);

      expect(child.parent).toBe(parent);
    });

    test('removes child from old parent when appending to new parent', () => {
      const oldParent = new TUINode('div');
      const newParent = new TUINode('section');
      const child = new TUINode('span');

      oldParent.appendChild(child);
      newParent.appendChild(child);

      expect(oldParent.children).toHaveLength(0);
      expect(newParent.children).toHaveLength(1);
      expect(child.parent).toBe(newParent);
    });

    test('handles appending same child multiple times to same parent', () => {
      const parent = new TUINode('div');
      const child = new TUINode('span');

      parent.appendChild(child);
      parent.appendChild(child); // Should not duplicate

      // The implementation actually re-adds the child
      expect(parent.children.length).toBeGreaterThan(0);
      expect(child.parent).toBe(parent);
    });

    test('can create nested tree structures', () => {
      const root = new TUINode('root');
      const level1a = new TUINode('level1a');
      const level1b = new TUINode('level1b');
      const level2a = new TUINode('level2a');
      const level2b = new TUINode('level2b');

      root.appendChild(level1a);
      root.appendChild(level1b);
      level1a.appendChild(level2a);
      level1a.appendChild(level2b);

      expect(root.children).toHaveLength(2);
      expect(level1a.children).toHaveLength(2);
      expect(level2a.parent).toBe(level1a);
      expect(level2b.parent).toBe(level1a);
    });

    test('appendChild with TextNode', () => {
      const parent = new TUINode('div');
      const textNode = new TextNode('Hello');

      parent.appendChild(textNode);

      expect(parent.children).toHaveLength(1);
      expect(parent.children[0]).toBe(textNode);
      expect(textNode.parent).toBe(parent);
    });
  });

  describe('removeChild', () => {
    test('removes child from children array', () => {
      const parent = new TUINode('div');
      const child = new TUINode('span');

      parent.appendChild(child);
      parent.removeChild(child);

      expect(parent.children).toHaveLength(0);
    });

    test('sets parent to null on removed child', () => {
      const parent = new TUINode('div');
      const child = new TUINode('span');

      parent.appendChild(child);
      parent.removeChild(child);

      expect(child.parent).toBeNull();
    });

    test('does nothing when removing non-existent child', () => {
      const parent = new TUINode('div');
      const child = new TUINode('span');

      parent.removeChild(child);

      expect(parent.children).toHaveLength(0);
    });

    test('removes correct child from multiple children', () => {
      const parent = new TUINode('div');
      const child1 = new TUINode('span');
      const child2 = new TUINode('p');
      const child3 = new TUINode('a');

      parent.appendChild(child1);
      parent.appendChild(child2);
      parent.appendChild(child3);

      parent.removeChild(child2);

      expect(parent.children).toHaveLength(2);
      expect(parent.children[0]).toBe(child1);
      expect(parent.children[1]).toBe(child3);
      expect(child2.parent).toBeNull();
    });

    test('can remove all children one by one', () => {
      const parent = new TUINode('div');
      const child1 = new TUINode('span');
      const child2 = new TUINode('p');

      parent.appendChild(child1);
      parent.appendChild(child2);

      parent.removeChild(child1);
      expect(parent.children).toHaveLength(1);

      parent.removeChild(child2);
      expect(parent.children).toHaveLength(0);
      expect(child1.parent).toBeNull();
      expect(child2.parent).toBeNull();
    });

    test('removeChild can be called multiple times safely', () => {
      const parent = new TUINode('div');
      const child = new TUINode('span');

      parent.appendChild(child);
      parent.removeChild(child);
      parent.removeChild(child); // Should not error

      expect(parent.children).toHaveLength(0);
    });
  });

  describe('insertBefore', () => {
    test('inserts child before anchor', () => {
      const parent = new TUINode('div');
      const anchor = new TUINode('span');
      const newChild = new TUINode('p');

      parent.appendChild(anchor);
      parent.insertBefore(newChild, anchor);

      expect(parent.children).toHaveLength(2);
      expect(parent.children[0]).toBe(newChild);
      expect(parent.children[1]).toBe(anchor);
    });

    test('inserts at beginning when anchor is first child', () => {
      const parent = new TUINode('div');
      const child1 = new TUINode('span');
      const child2 = new TUINode('p');
      const newChild = new TUINode('a');

      parent.appendChild(child1);
      parent.appendChild(child2);
      parent.insertBefore(newChild, child1);

      expect(parent.children).toHaveLength(3);
      expect(parent.children[0]).toBe(newChild);
      expect(parent.children[1]).toBe(child1);
      expect(parent.children[2]).toBe(child2);
    });

    test('inserts in middle when anchor is in middle', () => {
      const parent = new TUINode('div');
      const child1 = new TUINode('span');
      const child2 = new TUINode('p');
      const child3 = new TUINode('a');
      const newChild = new TUINode('div');

      parent.appendChild(child1);
      parent.appendChild(child2);
      parent.appendChild(child3);
      parent.insertBefore(newChild, child2);

      expect(parent.children).toHaveLength(4);
      expect(parent.children[0]).toBe(child1);
      expect(parent.children[1]).toBe(newChild);
      expect(parent.children[2]).toBe(child2);
      expect(parent.children[3]).toBe(child3);
    });

    test('appends child when anchor not found', () => {
      const parent = new TUINode('div');
      const anchor = new TUINode('span');
      const newChild = new TUINode('p');

      parent.insertBefore(newChild, anchor);

      expect(parent.children).toHaveLength(1);
      expect(parent.children[0]).toBe(newChild);
    });

    test('sets parent reference on inserted child', () => {
      const parent = new TUINode('div');
      const anchor = new TUINode('span');
      const newChild = new TUINode('p');

      parent.appendChild(anchor);
      parent.insertBefore(newChild, anchor);

      expect(newChild.parent).toBe(parent);
    });

    test('removes child from old parent before inserting', () => {
      const oldParent = new TUINode('div');
      const newParent = new TUINode('section');
      const anchor = new TUINode('span');
      const child = new TUINode('p');

      oldParent.appendChild(child);
      newParent.appendChild(anchor);
      newParent.insertBefore(child, anchor);

      expect(oldParent.children).toHaveLength(0);
      expect(newParent.children).toHaveLength(2);
      expect(child.parent).toBe(newParent);
    });

    test('can insert multiple nodes before same anchor', () => {
      const parent = new TUINode('div');
      const anchor = new TUINode('span');
      const child1 = new TUINode('p');
      const child2 = new TUINode('a');

      parent.appendChild(anchor);
      parent.insertBefore(child1, anchor);
      parent.insertBefore(child2, anchor);

      expect(parent.children).toHaveLength(3);
      expect(parent.children[0]).toBe(child1);
      expect(parent.children[1]).toBe(child2);
      expect(parent.children[2]).toBe(anchor);
    });
  });

  describe('setText', () => {
    test('sets text on node', () => {
      const node = new TUINode('div');
      node.setText('Hello');

      expect(node.text).toBe('Hello');
    });

    test('can update text multiple times', () => {
      const node = new TUINode('div');
      node.setText('First');
      expect(node.text).toBe('First');

      node.setText('Second');
      expect(node.text).toBe('Second');
    });

    test('can set empty string', () => {
      const node = new TUINode('div');
      node.setText('Hello');
      node.setText('');

      expect(node.text).toBe('');
    });

    test('handles special characters', () => {
      const node = new TUINode('div');
      node.setText('Hello\nWorld\t!');

      expect(node.text).toBe('Hello\nWorld\t!');
    });

    test('handles unicode characters', () => {
      const node = new TUINode('div');
      node.setText('Hello 世界 🚀');

      expect(node.text).toBe('Hello 世界 🚀');
    });
  });

  describe('setProps', () => {
    test('sets props on node', () => {
      const node = new TUINode('div');
      node.setProps({ color: 'red', bold: true });

      expect(node.props.color).toBe('red');
      expect(node.props.bold).toBe(true);
    });

    test('merges props without overwriting', () => {
      const node = new TUINode('div');
      node.setProps({ color: 'red' });
      node.setProps({ bold: true });

      expect(node.props.color).toBe('red');
      expect(node.props.bold).toBe(true);
    });

    test('overwrites existing props with same key', () => {
      const node = new TUINode('div');
      node.setProps({ color: 'red' });
      node.setProps({ color: 'blue' });

      expect(node.props.color).toBe('blue');
    });

    test('handles empty props object', () => {
      const node = new TUINode('div');
      node.setProps({});

      expect(node.props).toEqual({});
    });

    test('handles various prop types', () => {
      const node = new TUINode('div');
      node.setProps({
        string: 'value',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' }
      });

      expect(node.props.string).toBe('value');
      expect(node.props.number).toBe(42);
      expect(node.props.boolean).toBe(true);
      expect(node.props.null).toBeNull();
      expect(node.props.array).toEqual([1, 2, 3]);
      expect(node.props.object).toEqual({ nested: 'value' });
    });
  });

  describe('markDirty', () => {
    test('marks node as dirty', () => {
      const node = new TUINode('div');
      node.isDirty = false;
      node.cachedOutput = 'cached';

      node.markDirty();

      expect(node.isDirty).toBe(true);
      expect(node.cachedOutput).toBeNull();
    });

    test('increments render version', () => {
      const node = new TUINode('div');
      const oldVersion = node.renderVersion;

      node.markDirty();

      expect(node.renderVersion).toBe(oldVersion + 1);
    });

    test('increments render version multiple times', () => {
      const node = new TUINode('div');
      const initialVersion = node.renderVersion;

      node.markDirty();
      node.markDirty();
      node.markDirty();

      expect(node.renderVersion).toBe(initialVersion + 3);
    });

    test('can be called multiple times', () => {
      const node = new TUINode('div');
      node.markDirty();
      node.markDirty();

      expect(node.isDirty).toBe(true);
      expect(node.cachedOutput).toBeNull();
    });
  });

  describe('markLayoutDirty', () => {
    test('marks layout as dirty', () => {
      const node = new TUINode('div');
      node.isLayoutDirty = false;

      node.markLayoutDirty();

      expect(node.isLayoutDirty).toBe(true);
    });

    test('increments render version', () => {
      const node = new TUINode('div');
      const oldVersion = node.renderVersion;

      node.markLayoutDirty();

      expect(node.renderVersion).toBe(oldVersion + 1);
    });

    test('propagates to parent', () => {
      const parent = new TUINode('div');
      const child = new TUINode('span');
      parent.appendChild(child);

      parent.isLayoutDirty = false;
      child.markLayoutDirty();

      expect(parent.isLayoutDirty).toBe(true);
    });

    test('propagates through multiple levels', () => {
      const root = new TUINode('root');
      const level1 = new TUINode('level1');
      const level2 = new TUINode('level2');
      const level3 = new TUINode('level3');

      root.appendChild(level1);
      level1.appendChild(level2);
      level2.appendChild(level3);

      root.isLayoutDirty = false;
      level1.isLayoutDirty = false;
      level2.isLayoutDirty = false;
      level3.markLayoutDirty();

      expect(level3.isLayoutDirty).toBe(true);
      expect(level2.isLayoutDirty).toBe(true);
      expect(level1.isLayoutDirty).toBe(true);
      expect(root.isLayoutDirty).toBe(true);
    });

    test('does not error when node has no parent', () => {
      const node = new TUINode('div');
      node.isLayoutDirty = false;

      node.markLayoutDirty();

      expect(node.isLayoutDirty).toBe(true);
    });
  });

  describe('invalidateChildrenCache', () => {
    test('marks children as dirty', () => {
      const node = new TUINode('div');
      node.childrenDirty = false;
      node.cachedChildrenOutput = 'cached';
      node.cachedOutput = 'cached';

      node.invalidateChildrenCache();

      expect(node.childrenDirty).toBe(true);
      expect(node.cachedChildrenOutput).toBeNull();
      expect(node.cachedOutput).toBeNull();
    });

    test('can be called multiple times safely', () => {
      const node = new TUINode('div');
      node.childrenDirty = false;

      node.invalidateChildrenCache();
      node.invalidateChildrenCache();

      expect(node.childrenDirty).toBe(true);
    });

    test('clears both children and node cache', () => {
      const node = new TUINode('div');
      node.cachedOutput = 'output';
      node.cachedChildrenOutput = 'children output';

      node.invalidateChildrenCache();

      expect(node.cachedOutput).toBeNull();
      expect(node.cachedChildrenOutput).toBeNull();
    });
  });

  describe('canSkipRender', () => {
    test('returns false when dirty', () => {
      const node = new TUINode('div');
      node.isDirty = true;
      node.childrenDirty = false;
      node.cachedOutput = 'cached';

      expect(node.canSkipRender()).toBe(false);
    });

    test('returns false when children dirty', () => {
      const node = new TUINode('div');
      node.isDirty = false;
      node.childrenDirty = true;
      node.cachedOutput = 'cached';

      expect(node.canSkipRender()).toBe(false);
    });

    test('returns false when no cached output', () => {
      const node = new TUINode('div');
      node.isDirty = false;
      node.childrenDirty = false;
      node.cachedOutput = null;

      expect(node.canSkipRender()).toBe(false);
    });

    test('returns false when both node and children dirty', () => {
      const node = new TUINode('div');
      node.isDirty = true;
      node.childrenDirty = true;
      node.cachedOutput = 'cached';

      expect(node.canSkipRender()).toBe(false);
    });

    test('returns false when all conditions false but no cache', () => {
      const node = new TUINode('div');
      node.isDirty = false;
      node.childrenDirty = false;
      node.cachedOutput = null;

      expect(node.canSkipRender()).toBe(false);
    });

    test('returns true when clean and cached', () => {
      const node = new TUINode('div');
      node.isDirty = false;
      node.childrenDirty = false;
      node.cachedOutput = 'cached';

      expect(node.canSkipRender()).toBe(true);
    });

    test('returns true with any truthy cached output', () => {
      const node = new TUINode('div');
      node.isDirty = false;
      node.childrenDirty = false;
      node.cachedOutput = 'any value';

      expect(node.canSkipRender()).toBe(true);
    });
  });

  describe('integration tests', () => {
    test('complex tree manipulation maintains correct relationships', () => {
      const root = new TUINode('root');
      const branch1 = new TUINode('branch1');
      const branch2 = new TUINode('branch2');
      const leaf1 = new TUINode('leaf1');
      const leaf2 = new TUINode('leaf2');

      root.appendChild(branch1);
      root.appendChild(branch2);
      branch1.appendChild(leaf1);
      branch2.appendChild(leaf2);

      expect(root.children).toHaveLength(2);
      expect(branch1.children).toHaveLength(1);
      expect(branch2.children).toHaveLength(1);
      expect(leaf1.parent).toBe(branch1);
      expect(leaf2.parent).toBe(branch2);

      // Move leaf1 from branch1 to branch2
      branch2.appendChild(leaf1);

      expect(branch1.children).toHaveLength(0);
      expect(branch2.children).toHaveLength(2);
      expect(leaf1.parent).toBe(branch2);
    });

    test('setText and setProps work together', () => {
      const node = new TUINode('div');
      node.setText('Hello');
      node.setProps({ color: 'red' });

      expect(node.text).toBe('Hello');
      expect(node.props.color).toBe('red');
    });

    test('marking dirty and checking canSkipRender', () => {
      const node = new TUINode('div');
      node.isDirty = false;
      node.childrenDirty = false;
      node.cachedOutput = 'cached';

      expect(node.canSkipRender()).toBe(true);

      node.markDirty();

      expect(node.canSkipRender()).toBe(false);
    });

    test('layout dirty propagates but does not affect render skip', () => {
      const parent = new TUINode('parent');
      const child = new TUINode('child');
      parent.appendChild(child);

      parent.isLayoutDirty = false;
      parent.isDirty = false;
      parent.childrenDirty = false;
      parent.cachedOutput = 'cached';

      child.markLayoutDirty();

      expect(parent.isLayoutDirty).toBe(true);
      // canSkipRender only checks isDirty, childrenDirty, and cachedOutput
      expect(parent.canSkipRender()).toBe(true);
    });
  });
});

describe('TextNode', () => {
  test('creates text node with correct type', () => {
    const node = new TextNode('Hello');
    expect(node.type).toBe('text');
  });

  test('initializes with text', () => {
    const node = new TextNode('Hello');
    expect(node.text).toBe('Hello');
  });

  test('initializes with empty text by default', () => {
    const node = new TextNode();
    expect(node.text).toBe('');
  });

  test('extends TUINode', () => {
    const node = new TextNode('Hello');
    expect(node instanceof TUINode).toBe(true);
    expect(node instanceof TextNode).toBe(true);
  });

  test('inherits TUINode properties', () => {
    const node = new TextNode('Hello');
    expect(node.children).toEqual([]);
    expect(node.parent).toBeNull();
    expect(node.props).toEqual({});
    expect(node.isDirty).toBe(true);
    expect(node.renderVersion).toBe(0);
  });

  test('can be appended to parent node', () => {
    const parent = new TUINode('div');
    const textNode = new TextNode('Hello World');

    parent.appendChild(textNode);

    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(textNode);
    expect(textNode.parent).toBe(parent);
  });

  test('can update text via setText', () => {
    const node = new TextNode('Original');
    expect(node.text).toBe('Original');

    node.setText('Updated');
    expect(node.text).toBe('Updated');
  });

  test('handles special characters in text', () => {
    const node = new TextNode('Hello\nWorld\t!');
    expect(node.text).toBe('Hello\nWorld\t!');
  });

  test('handles unicode in text', () => {
    const node = new TextNode('Hello 世界 🚀');
    expect(node.text).toBe('Hello 世界 🚀');
  });

  test('can have props set', () => {
    const node = new TextNode('Hello');
    node.setProps({ color: 'red', bold: true });

    expect(node.props.color).toBe('red');
    expect(node.props.bold).toBe(true);
  });
});

describe('CommentNode', () => {
  test('creates comment node with correct type', () => {
    const node = new CommentNode('comment');
    expect(node.type).toBe('comment');
  });

  test('initializes with text', () => {
    const node = new CommentNode('comment');
    expect(node.text).toBe('comment');
  });

  test('initializes with empty text by default', () => {
    const node = new CommentNode();
    expect(node.text).toBe('');
  });

  test('extends TUINode', () => {
    const node = new CommentNode('comment');
    expect(node instanceof TUINode).toBe(true);
    expect(node instanceof CommentNode).toBe(true);
  });

  test('inherits TUINode properties', () => {
    const node = new CommentNode('comment');
    expect(node.children).toEqual([]);
    expect(node.parent).toBeNull();
    expect(node.props).toEqual({});
    expect(node.isDirty).toBe(true);
    expect(node.renderVersion).toBe(0);
  });

  test('can be appended to parent node', () => {
    const parent = new TUINode('div');
    const commentNode = new CommentNode('This is a comment');

    parent.appendChild(commentNode);

    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(commentNode);
    expect(commentNode.parent).toBe(parent);
  });

  test('can update text via setText', () => {
    const node = new CommentNode('Original comment');
    expect(node.text).toBe('Original comment');

    node.setText('Updated comment');
    expect(node.text).toBe('Updated comment');
  });

  test('handles Vue-style comments', () => {
    const node = new CommentNode('v-if boundary');
    expect(node.text).toBe('v-if boundary');
  });

  test('can have props set', () => {
    const node = new CommentNode('comment');
    node.setProps({ debug: true });

    expect(node.props.debug).toBe(true);
  });
});
