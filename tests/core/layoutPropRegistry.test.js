// tests/core/layoutPropRegistry.test.js
import { describe, it, expect } from 'bun:test';
import { LAYOUT_AFFECTING_PROPS, isLayoutAffectingProp } from '../../src/core/layoutPropRegistry.js';
import { getLayoutPropNames } from '../../src/core/layoutProps.js';

describe('layoutPropRegistry', () => {
  describe('LAYOUT_AFFECTING_PROPS', () => {
    it('should be a Set', () => {
      expect(LAYOUT_AFFECTING_PROPS).toBeInstanceOf(Set);
    });

    it('should include all props from layoutProps.js', () => {
      const layoutProps = getLayoutPropNames();
      for (const prop of layoutProps) {
        expect(LAYOUT_AFFECTING_PROPS.has(prop)).toBe(true);
      }
    });

    it('should include universal layout props', () => {
      const universalProps = ['border', 'borderStyle', 'responsive', '_injectedWidth', '_viewportVersion', 'text'];
      for (const prop of universalProps) {
        expect(LAYOUT_AFFECTING_PROPS.has(prop)).toBe(true);
      }
    });

    it('should include visual state props that affect dimensions', () => {
      const visualStateProps = ['label', 'hint', 'validationError', 'isFocused', 'disabled'];
      for (const prop of visualStateProps) {
        expect(LAYOUT_AFFECTING_PROPS.has(prop)).toBe(true);
      }
    });

    it('should include component-specific layout props', () => {
      const componentProps = [
        'rows', 'headers', 'options', 'showHeader',
        'minRows', 'maxRows', 'autoResize',
        'imageLines', 'count', 'lines', 'direction', 'font', 'length'
      ];
      for (const prop of componentProps) {
        expect(LAYOUT_AFFECTING_PROPS.has(prop)).toBe(true);
      }
    });

    it('should have expected size (core + universal + visual state + component-specific)', () => {
      // This test will fail if categories change, forcing us to update
      const coreLayoutPropsCount = getLayoutPropNames().length; // 27
      const universalPropsCount = 6; // border, borderStyle, responsive, _injectedWidth, _viewportVersion, text
      const visualStatePropsCount = 5; // label, hint, validationError, isFocused, disabled
      const componentSpecificPropsCount = 13; // rows, headers, etc.

      const expectedTotal = coreLayoutPropsCount + universalPropsCount + visualStatePropsCount + componentSpecificPropsCount;
      expect(LAYOUT_AFFECTING_PROPS.size).toBe(expectedTotal);
    });
  });

  describe('isLayoutAffectingProp', () => {
    describe('core layout props', () => {
      it('should detect flex container props', () => {
        expect(isLayoutAffectingProp('justifyContent')).toBe(true);
        expect(isLayoutAffectingProp('alignItems')).toBe(true);
        expect(isLayoutAffectingProp('alignContent')).toBe(true);
        expect(isLayoutAffectingProp('flexWrap')).toBe(true);
        expect(isLayoutAffectingProp('flexDirection')).toBe(true);
        expect(isLayoutAffectingProp('gap')).toBe(true);
      });

      it('should detect flex item props', () => {
        expect(isLayoutAffectingProp('flex')).toBe(true);
        expect(isLayoutAffectingProp('flexGrow')).toBe(true);
        expect(isLayoutAffectingProp('flexShrink')).toBe(true);
        expect(isLayoutAffectingProp('flexBasis')).toBe(true);
        expect(isLayoutAffectingProp('alignSelf')).toBe(true);
      });

      it('should detect dimension props', () => {
        expect(isLayoutAffectingProp('width')).toBe(true);
        expect(isLayoutAffectingProp('height')).toBe(true);
        expect(isLayoutAffectingProp('minWidth')).toBe(true);
        expect(isLayoutAffectingProp('maxWidth')).toBe(true);
        expect(isLayoutAffectingProp('minHeight')).toBe(true);
        expect(isLayoutAffectingProp('maxHeight')).toBe(true);
      });

      it('should detect padding props', () => {
        expect(isLayoutAffectingProp('padding')).toBe(true);
        expect(isLayoutAffectingProp('paddingLeft')).toBe(true);
        expect(isLayoutAffectingProp('paddingRight')).toBe(true);
        expect(isLayoutAffectingProp('paddingTop')).toBe(true);
        expect(isLayoutAffectingProp('paddingBottom')).toBe(true);
      });

      it('should detect margin props', () => {
        expect(isLayoutAffectingProp('margin')).toBe(true);
        expect(isLayoutAffectingProp('marginLeft')).toBe(true);
        expect(isLayoutAffectingProp('marginRight')).toBe(true);
        expect(isLayoutAffectingProp('marginTop')).toBe(true);
        expect(isLayoutAffectingProp('marginBottom')).toBe(true);
      });
    });

    describe('universal layout props', () => {
      it('should detect border props', () => {
        expect(isLayoutAffectingProp('border')).toBe(true);
        expect(isLayoutAffectingProp('borderStyle')).toBe(true);
      });

      it('should detect responsive and internal flags', () => {
        expect(isLayoutAffectingProp('responsive')).toBe(true);
        expect(isLayoutAffectingProp('_injectedWidth')).toBe(true);
        expect(isLayoutAffectingProp('_viewportVersion')).toBe(true);
      });

      it('should detect text content prop', () => {
        expect(isLayoutAffectingProp('text')).toBe(true);
      });
    });

    describe('visual state props', () => {
      it('should detect input state props', () => {
        expect(isLayoutAffectingProp('label')).toBe(true);
        expect(isLayoutAffectingProp('hint')).toBe(true);
        expect(isLayoutAffectingProp('validationError')).toBe(true);
        expect(isLayoutAffectingProp('isFocused')).toBe(true);
        expect(isLayoutAffectingProp('disabled')).toBe(true);
      });
    });

    describe('component-specific props', () => {
      it('should detect Table props', () => {
        expect(isLayoutAffectingProp('rows')).toBe(true);
        expect(isLayoutAffectingProp('headers')).toBe(true);
        expect(isLayoutAffectingProp('options')).toBe(true);
        expect(isLayoutAffectingProp('showHeader')).toBe(true);
      });

      it('should detect TextInput props', () => {
        expect(isLayoutAffectingProp('minRows')).toBe(true);
        expect(isLayoutAffectingProp('maxRows')).toBe(true);
        expect(isLayoutAffectingProp('autoResize')).toBe(true);
      });

      it('should detect Image props', () => {
        expect(isLayoutAffectingProp('imageLines')).toBe(true);
      });

      it('should detect other component props', () => {
        expect(isLayoutAffectingProp('count')).toBe(true);
        expect(isLayoutAffectingProp('lines')).toBe(true);
        expect(isLayoutAffectingProp('direction')).toBe(true);
        expect(isLayoutAffectingProp('font')).toBe(true);
        expect(isLayoutAffectingProp('length')).toBe(true);
      });
    });

    describe('non-layout props', () => {
      it('should NOT detect style props that do not affect layout', () => {
        expect(isLayoutAffectingProp('color')).toBe(false);
        expect(isLayoutAffectingProp('backgroundColor')).toBe(false);
        expect(isLayoutAffectingProp('style')).toBe(false);
        expect(isLayoutAffectingProp('bold')).toBe(false);
        expect(isLayoutAffectingProp('italic')).toBe(false);
        expect(isLayoutAffectingProp('underline')).toBe(false);
      });

      it('should NOT detect content props that do not affect layout', () => {
        expect(isLayoutAffectingProp('value')).toBe(false);
        expect(isLayoutAffectingProp('placeholder')).toBe(false);
        expect(isLayoutAffectingProp('name')).toBe(false);
        expect(isLayoutAffectingProp('id')).toBe(false);
      });

      it('should NOT detect event handler props', () => {
        expect(isLayoutAffectingProp('onClick')).toBe(false);
        expect(isLayoutAffectingProp('onChange')).toBe(false);
        expect(isLayoutAffectingProp('onSubmit')).toBe(false);
      });

      it('should return false for undefined/random props', () => {
        expect(isLayoutAffectingProp('randomProp')).toBe(false);
        expect(isLayoutAffectingProp('unknownProp')).toBe(false);
        expect(isLayoutAffectingProp('')).toBe(false);
      });
    });
  });
});
