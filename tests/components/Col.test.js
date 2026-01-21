/**
 * Tests for Col component
 */

import { test, expect, describe } from 'bun:test';
import { h } from 'vue';
import Col from '../../src/components/Col.js';

describe('Col component', () => {
  describe('component definition', () => {
    test('has correct name', () => {
      expect(Col.name).toBe('Col');
    });

    test('has setup function', () => {
      expect(typeof Col.setup).toBe('function');
    });

    test('defines flex prop with default "1"', () => {
      expect(Col.props.flex).toBeDefined();
      expect(Array.isArray(Col.props.flex.type)).toBe(true);
      expect(Col.props.flex.default).toBe('1');
    });

    test('defines flexGrow prop with default null', () => {
      expect(Col.props.flexGrow).toBeDefined();
      expect(Col.props.flexGrow.type).toBe(Number);
      expect(Col.props.flexGrow.default).toBe(null);
    });

    test('defines flexShrink prop with default null', () => {
      expect(Col.props.flexShrink).toBeDefined();
      expect(Col.props.flexShrink.type).toBe(Number);
      expect(Col.props.flexShrink.default).toBe(null);
    });

    test('defines flexBasis prop with default null', () => {
      expect(Col.props.flexBasis).toBeDefined();
      expect(Array.isArray(Col.props.flexBasis.type)).toBe(true);
      expect(Col.props.flexBasis.default).toBe(null);
    });

    test('defines alignSelf prop with default null', () => {
      expect(Col.props.alignSelf).toBeDefined();
      expect(Col.props.alignSelf.type).toBe(String);
      expect(Col.props.alignSelf.default).toBe(null);
    });

    test('defines minWidth prop with default null', () => {
      expect(Col.props.minWidth).toBeDefined();
      expect(Col.props.minWidth.type).toBe(Number);
      expect(Col.props.minWidth.default).toBe(null);
    });

    test('defines maxWidth prop with default null', () => {
      expect(Col.props.maxWidth).toBeDefined();
      expect(Col.props.maxWidth.type).toBe(Number);
      expect(Col.props.maxWidth.default).toBe(null);
    });

    test('defines minHeight prop with default null', () => {
      expect(Col.props.minHeight).toBeDefined();
      expect(Col.props.minHeight.type).toBe(Number);
      expect(Col.props.minHeight.default).toBe(null);
    });

    test('defines maxHeight prop with default null', () => {
      expect(Col.props.maxHeight).toBeDefined();
      expect(Col.props.maxHeight.type).toBe(Number);
      expect(Col.props.maxHeight.default).toBe(null);
    });

    test('defines width prop with default null', () => {
      expect(Col.props.width).toBeDefined();
      expect(Array.isArray(Col.props.width.type)).toBe(true);
      expect(Col.props.width.default).toBe(null);
    });

    test('defines gap prop with default 0', () => {
      expect(Col.props.gap).toBeDefined();
      expect(Col.props.gap.type).toBe(Number);
      expect(Col.props.gap.default).toBe(0);
    });

    test('defines justifyContent prop with default flex-start', () => {
      expect(Col.props.justifyContent).toBeDefined();
      expect(Col.props.justifyContent.type).toBe(String);
      expect(Col.props.justifyContent.default).toBe('flex-start');
    });

    test('defines alignItems prop with default stretch', () => {
      expect(Col.props.alignItems).toBeDefined();
      expect(Col.props.alignItems.type).toBe(String);
      expect(Col.props.alignItems.default).toBe('stretch');
    });

    test('defines alignContent prop with default null', () => {
      expect(Col.props.alignContent).toBeDefined();
      expect(Col.props.alignContent.type).toBe(String);
      expect(Col.props.alignContent.default).toBe(null);
    });

    test('defines flexWrap prop with default nowrap', () => {
      expect(Col.props.flexWrap).toBeDefined();
      expect(Col.props.flexWrap.type).toBe(String);
      expect(Col.props.flexWrap.default).toBe('nowrap');
    });

    test('defines responsive prop with default false', () => {
      expect(Col.props.responsive).toBeDefined();
      expect(Col.props.responsive.type).toBe(Boolean);
      expect(Col.props.responsive.default).toBe(false);
    });

    test('defines height prop with default null', () => {
      expect(Col.props.height).toBeDefined();
      expect(Array.isArray(Col.props.height.type)).toBe(true);
      expect(Col.props.height.default).toBe(null);
    });
  });

  describe('prop validators', () => {
    test('validates alignSelf prop', () => {
      const validator = Col.props.alignSelf.validator;
      expect(validator(null)).toBe(true);
      expect(validator('flex-start')).toBe(true);
      expect(validator('flex-end')).toBe(true);
      expect(validator('center')).toBe(true);
      expect(validator('stretch')).toBe(true);
      expect(validator('baseline')).toBe(true);
      expect(validator('invalid')).toBe(false);
    });

    test('validates justifyContent prop', () => {
      const validator = Col.props.justifyContent.validator;
      expect(validator('flex-start')).toBe(true);
      expect(validator('flex-end')).toBe(true);
      expect(validator('center')).toBe(true);
      expect(validator('space-between')).toBe(true);
      expect(validator('space-around')).toBe(true);
      expect(validator('space-evenly')).toBe(true);
      expect(validator('invalid')).toBe(false);
    });

    test('validates alignItems prop', () => {
      const validator = Col.props.alignItems.validator;
      expect(validator('flex-start')).toBe(true);
      expect(validator('flex-end')).toBe(true);
      expect(validator('center')).toBe(true);
      expect(validator('stretch')).toBe(true);
      expect(validator('baseline')).toBe(true);
      expect(validator('invalid')).toBe(false);
    });

    test('validates alignContent prop', () => {
      const validator = Col.props.alignContent.validator;
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
      const validator = Col.props.flexWrap.validator;
      expect(validator('nowrap')).toBe(true);
      expect(validator('wrap')).toBe(true);
      expect(validator('wrap-reverse')).toBe(true);
      expect(validator('invalid')).toBe(false);
    });
  });

  describe('setup function', () => {
    test('returns a function', () => {
      const slots = { default: () => [] };
      const renderFn = Col.setup({}, { slots });
      expect(typeof renderFn).toBe('function');
    });

    test('creates col vnode with props', () => {
      const props = { flex: '2', gap: 3 };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.type).toBe('col');
      expect(vnode.props.flex).toBe('2');
      expect(vnode.props.gap).toBe(3);
    });

    test('passes children from slots', () => {
      const props = {};
      const childVNode = h('text', {}, 'child');
      const slots = { default: () => [childVNode] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.children).toBeDefined();
      expect(vnode.children.length).toBe(1);
      expect(vnode.children[0]).toBe(childVNode);
    });

    test('handles empty slots', () => {
      const props = {};
      const slots = {};
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.type).toBe('col');
      expect(vnode.children.length).toBe(0);
    });

    test('includes enhanced props from context', () => {
      const props = { flex: 1 };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      // Props are enhanced with context data in Vue environment
      expect(vnode.props).toBeDefined();
      expect(vnode.type).toBe('col');
    });
  });

  describe('edge cases', () => {
    test('handles all flex item props together', () => {
      const props = {
        flex: '0 1 auto',
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: 'auto',
        alignSelf: 'center',
        minWidth: 100,
        maxWidth: 500,
        minHeight: 50,
        maxHeight: 300,
        width: '50%'
      };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.flex).toBe('0 1 auto');
      expect(vnode.props.flexGrow).toBe(0);
      expect(vnode.props.flexShrink).toBe(1);
      expect(vnode.props.flexBasis).toBe('auto');
      expect(vnode.props.alignSelf).toBe('center');
      expect(vnode.props.minWidth).toBe(100);
      expect(vnode.props.maxWidth).toBe(500);
    });

    test('handles all container props together', () => {
      const props = {
        gap: 2,
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'stretch',
        flexWrap: 'wrap',
        responsive: true,
        height: 200
      };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.gap).toBe(2);
      expect(vnode.props.justifyContent).toBe('space-between');
      expect(vnode.props.alignItems).toBe('center');
      expect(vnode.props.alignContent).toBe('stretch');
      expect(vnode.props.flexWrap).toBe('wrap');
      expect(vnode.props.responsive).toBe(true);
      expect(vnode.props.height).toBe(200);
    });

    test('handles numeric flex value', () => {
      const props = { flex: 3 };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.flex).toBe(3);
    });

    test('handles string flex value', () => {
      const props = { flex: '1 0 200px' };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.flex).toBe('1 0 200px');
    });

    test('handles numeric width value', () => {
      const props = { width: 300 };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.width).toBe(300);
    });

    test('handles string width value', () => {
      const props = { width: '50%' };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.width).toBe('50%');
    });

    test('handles numeric flexBasis value', () => {
      const props = { flexBasis: 150 };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.flexBasis).toBe(150);
    });

    test('handles string flexBasis value', () => {
      const props = { flexBasis: 'auto' };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.flexBasis).toBe('auto');
    });

    test('handles zero values for sizing props', () => {
      const props = {
        minWidth: 0,
        maxWidth: 0,
        minHeight: 0,
        maxHeight: 0,
        gap: 0
      };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.minWidth).toBe(0);
      expect(vnode.props.maxWidth).toBe(0);
      expect(vnode.props.minHeight).toBe(0);
      expect(vnode.props.maxHeight).toBe(0);
      expect(vnode.props.gap).toBe(0);
    });

    test('handles large values', () => {
      const props = {
        minWidth: 1000,
        maxWidth: 2000,
        gap: 50
      };
      const slots = { default: () => [] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.props.minWidth).toBe(1000);
      expect(vnode.props.maxWidth).toBe(2000);
      expect(vnode.props.gap).toBe(50);
    });

    test('handles all alignSelf values', () => {
      const values = ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'];
      values.forEach(value => {
        const props = { alignSelf: value };
        const slots = { default: () => [] };
        const renderFn = Col.setup(props, { slots });
        const vnode = renderFn();
        expect(vnode.props.alignSelf).toBe(value);
      });
    });

    test('handles multiple children', () => {
      const props = {};
      const child1 = h('text', {}, 'child1');
      const child2 = h('text', {}, 'child2');
      const child3 = h('text', {}, 'child3');
      const slots = { default: () => [child1, child2, child3] };
      const renderFn = Col.setup(props, { slots });
      const vnode = renderFn();

      expect(vnode.children.length).toBe(3);
      expect(vnode.children[0]).toBe(child1);
      expect(vnode.children[1]).toBe(child2);
      expect(vnode.children[2]).toBe(child3);
    });
  });
});
