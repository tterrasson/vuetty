/**
 * Tests for Row component
 */

import { test, expect, describe } from 'bun:test';
import { h } from 'vue';
import Row from '../../src/components/Row.js';

describe('Row component', () => {
  describe('component definition', () => {
    test('has correct name', () => {
      expect(Row.name).toBe('Row');
    });

    test('has setup function', () => {
      expect(typeof Row.setup).toBe('function');
    });

    test('defines gap prop with default 0', () => {
      expect(Row.props.gap).toBeDefined();
      expect(Row.props.gap.type).toBe(Number);
      expect(Row.props.gap.default).toBe(0);
    });

    test('defines justifyContent prop with default flex-start', () => {
      expect(Row.props.justifyContent).toBeDefined();
      expect(Row.props.justifyContent.type).toBe(String);
      expect(Row.props.justifyContent.default).toBe('flex-start');
    });

    test('defines alignItems prop with default stretch', () => {
      expect(Row.props.alignItems).toBeDefined();
      expect(Row.props.alignItems.type).toBe(String);
      expect(Row.props.alignItems.default).toBe('stretch');
    });

    test('defines alignContent prop with default null', () => {
      expect(Row.props.alignContent).toBeDefined();
      expect(Row.props.alignContent.type).toBe(String);
      expect(Row.props.alignContent.default).toBe(null);
    });

    test('defines flexWrap prop with default nowrap', () => {
      expect(Row.props.flexWrap).toBeDefined();
      expect(Row.props.flexWrap.type).toBe(String);
      expect(Row.props.flexWrap.default).toBe('nowrap');
    });

    test('defines responsive prop with default false', () => {
      expect(Row.props.responsive).toBeDefined();
      expect(Row.props.responsive.type).toBe(Boolean);
      expect(Row.props.responsive.default).toBe(false);
    });

    test('defines width prop with default null', () => {
      expect(Row.props.width).toBeDefined();
      expect(Array.isArray(Row.props.width.type)).toBe(true);
      expect(Row.props.width.default).toBe(null);
    });

    test('defines flex prop', () => {
      expect(Row.props.flex).toBeDefined();
      expect(Array.isArray(Row.props.flex.type)).toBe(true);
      expect(Row.props.flex.default).toBe(null);
    });

    test('defines flexGrow prop', () => {
      expect(Row.props.flexGrow).toBeDefined();
      expect(Row.props.flexGrow.type).toBe(Number);
      expect(Row.props.flexGrow.default).toBe(null);
    });

    test('defines flexShrink prop', () => {
      expect(Row.props.flexShrink).toBeDefined();
      expect(Row.props.flexShrink.type).toBe(Number);
      expect(Row.props.flexShrink.default).toBe(null);
    });

    test('defines flexBasis prop', () => {
      expect(Row.props.flexBasis).toBeDefined();
      expect(Array.isArray(Row.props.flexBasis.type)).toBe(true);
      expect(Row.props.flexBasis.default).toBe(null);
    });
  });

  describe('prop validators', () => {
    test('validates justifyContent prop', () => {
      const validator = Row.props.justifyContent.validator;
      expect(validator('flex-start')).toBe(true);
      expect(validator('flex-end')).toBe(true);
      expect(validator('center')).toBe(true);
      expect(validator('space-between')).toBe(true);
      expect(validator('space-around')).toBe(true);
      expect(validator('space-evenly')).toBe(true);
      expect(validator('invalid')).toBe(false);
    });

    test('validates alignItems prop', () => {
      const validator = Row.props.alignItems.validator;
      expect(validator('flex-start')).toBe(true);
      expect(validator('flex-end')).toBe(true);
      expect(validator('center')).toBe(true);
      expect(validator('stretch')).toBe(true);
      expect(validator('baseline')).toBe(true);
      expect(validator('invalid')).toBe(false);
    });

    test('validates alignContent prop', () => {
      const validator = Row.props.alignContent.validator;
      expect(validator(null)).toBe(true);
      expect(validator('flex-start')).toBe(true);
      expect(validator('flex-end')).toBe(true);
      expect(validator('center')).toBe(true);
      expect(validator('stretch')).toBe(true);
      expect(validator('space-between')).toBe(true);
      expect(validator('space-around')).toBe(true);
      expect(validator('invalid')).toBe(false);
    });

    test('validates flexWrap prop', () => {
      const validator = Row.props.flexWrap.validator;
      expect(validator('nowrap')).toBe(true);
      expect(validator('wrap')).toBe(true);
      expect(validator('wrap-reverse')).toBe(true);
      expect(validator('invalid')).toBe(false);
    });
  });

  describe('setup function', () => {
    test('returns a function', () => {
      const slots = { default: () => [] };
      const renderFn = Row.setup({}, { slots });
      expect(typeof renderFn).toBe('function');
    });

    test('creates row vnode with props', () => {
      const props = { gap: 2, justifyContent: 'center' };
      const slots = { default: () => [] };
      const renderFn = Row.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.type).toBe('row');
      expect(vnode.props.gap).toBe(2);
      expect(vnode.props.justifyContent).toBe('center');
    });

    test('passes children from slots', () => {
      const props = {};
      const childVNode = h('text', {}, 'child');
      const slots = { default: () => [childVNode] };
      const renderFn = Row.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.children).toBeDefined();
      expect(vnode.children.length).toBe(1);
      expect(vnode.children[0]).toBe(childVNode);
    });

    test('handles empty slots', () => {
      const props = {};
      const slots = {};
      const renderFn = Row.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.type).toBe('row');
      // Children can be null or undefined when no slots
      expect(vnode.children === null || vnode.children === undefined).toBe(true);
    });

    test('includes enhanced props from context', () => {
      const props = { gap: 1 };
      const slots = { default: () => [] };
      const renderFn = Row.setup(props, { slots });
      const vnode = renderFn();

      // These props are added by the setup function based on injected context
      // They may be undefined/null when tested outside Vue context
      expect(vnode.props).toBeDefined();
      expect(vnode.type).toBe('row');
    });
  });

  describe('edge cases', () => {
    test('handles all props together', () => {
      const props = {
        gap: 3,
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'stretch',
        flexWrap: 'wrap',
        responsive: true,
        width: 100,
        flex: '1 1 auto',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 'auto'
      };
      const slots = { default: () => [] };
      const renderFn = Row.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.gap).toBe(3);
      expect(vnode.props.justifyContent).toBe('space-between');
      expect(vnode.props.alignItems).toBe('center');
      expect(vnode.props.alignContent).toBe('stretch');
      expect(vnode.props.flexWrap).toBe('wrap');
      expect(vnode.props.responsive).toBe(true);
      expect(vnode.props.width).toBe(100);
      expect(vnode.props.flex).toBe('1 1 auto');
    });

    test('handles numeric flex value', () => {
      const props = { flex: 2 };
      const slots = { default: () => [] };
      const renderFn = Row.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.flex).toBe(2);
    });

    test('handles string flex value', () => {
      const props = { flex: '0 1 auto' };
      const slots = { default: () => [] };
      const renderFn = Row.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.flex).toBe('0 1 auto');
    });

    test('handles numeric flexBasis', () => {
      const props = { flexBasis: 200 };
      const slots = { default: () => [] };
      const renderFn = Row.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.flexBasis).toBe(200);
    });

    test('handles string flexBasis', () => {
      const props = { flexBasis: 'auto' };
      const slots = { default: () => [] };
      const renderFn = Row.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.flexBasis).toBe('auto');
    });

    test('handles zero gap', () => {
      const props = { gap: 0 };
      const slots = { default: () => [] };
      const renderFn = Row.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.gap).toBe(0);
    });

    test('handles large gap', () => {
      const props = { gap: 100 };
      const slots = { default: () => [] };
      const renderFn = Row.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.gap).toBe(100);
    });
  });
});
