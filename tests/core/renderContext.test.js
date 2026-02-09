import { beforeEach, describe, expect, test } from 'bun:test';
import {
  getRenderContext,
  getViewportHeight,
  getViewportWidth,
  getWidthContext,
  isPositionTrackingEnabled,
  reactiveViewport,
  registerClickRegion,
  setRenderContext,
  setWidthContext,
  startPositionTracking,
  stopPositionTracking
} from '../../src/core/renderContext.js';

describe('renderContext', () => {
  beforeEach(() => {
    stopPositionTracking();
    setRenderContext(null);
    setWidthContext(null);
    reactiveViewport.terminalWidth = 80;
    reactiveViewport.terminalHeight = 24;
  });

  test('stores render and width contexts', () => {
    const viewport = { terminalWidth: 132, terminalHeight: 41 };

    setRenderContext(viewport);
    setWidthContext(55);

    expect(getRenderContext()).toBe(viewport);
    expect(getWidthContext()).toBe(55);
    expect(reactiveViewport.terminalWidth).toBe(132);
    expect(reactiveViewport.terminalHeight).toBe(41);
  });

  test('falls back to process stdout dimensions when reactive dimensions are not set', () => {
    reactiveViewport.terminalWidth = 0;
    reactiveViewport.terminalHeight = 0;

    Object.defineProperty(process.stdout, 'columns', {
      value: 101,
      configurable: true
    });
    Object.defineProperty(process.stdout, 'rows', {
      value: 37,
      configurable: true
    });

    expect(getViewportWidth()).toBe(101);
    expect(getViewportHeight()).toBe(37);
  });

  test('tracks clickable regions only while tracking is enabled', () => {
    registerClickRegion({
      componentId: 'ignored',
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      depth: 0,
      nodeType: 'text'
    });

    startPositionTracking();
    expect(isPositionTrackingEnabled()).toBe(true);

    registerClickRegion({
      componentId: 'button-1',
      x: 4,
      y: 2,
      width: 6,
      height: 1,
      depth: 1,
      nodeType: 'button'
    });

    registerClickRegion({
      componentId: 'invalid-width',
      x: 1,
      y: 1,
      width: 0,
      height: 2,
      depth: 0,
      nodeType: 'text'
    });

    const regions = stopPositionTracking();

    expect(isPositionTrackingEnabled()).toBe(false);
    expect(regions).toEqual([{
      componentId: 'button-1',
      x: 4,
      y: 2,
      width: 6,
      height: 1,
      depth: 1,
      nodeType: 'button'
    }]);
  });

  test('stopPositionTracking flushes collected regions', () => {
    startPositionTracking();
    registerClickRegion({
      componentId: 'one',
      x: 0,
      y: 0,
      width: 2,
      height: 1,
      depth: 0,
      nodeType: 'text'
    });

    const first = stopPositionTracking();
    const second = stopPositionTracking();

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(0);
  });
});
