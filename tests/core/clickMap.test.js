/**
 * Tests for ClickMap with render-tracked positions
 * Updated for v7 API which uses screenY for viewport-relative positions
 */

import { test, expect, describe } from 'bun:test';
import { ClickMap } from '../../src/core/clickMap.js';
import { TUINode } from '../../src/core/node.js';

describe('ClickMap', () => {
  describe('constructor', () => {
    test('initializes with empty regions', () => {
      const clickMap = new ClickMap();
      expect(clickMap.regions).toEqual([]);
    });

    test('initializes with isDirty as true', () => {
      const clickMap = new ClickMap();
      expect(clickMap.isDirty).toBe(true);
    });

    test('initializes with zero scroll offset', () => {
      const clickMap = new ClickMap();
      expect(clickMap._scrollOffset).toBe(0);
    });

    test('initializes with null debug server', () => {
      const clickMap = new ClickMap();
      expect(clickMap.debugServer).toBe(null);
    });
  });

  describe('setDebugServer', () => {
    test('sets debug server reference', () => {
      const clickMap = new ClickMap();
      const mockDebugServer = { captureEvent: () => {} };

      clickMap.setDebugServer(mockDebugServer);

      expect(clickMap.debugServer).toBe(mockDebugServer);
    });
  });

  describe('build', () => {
    test('builds click map from render-tracked positions', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-1',
          x: 10,
          y: 5,
          width: 20,
          height: 3,
          depth: 0,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 0, 24);

      expect(clickMap.regions.length).toBe(1);
      expect(clickMap.regions[0].componentId).toBe('btn-1');
      expect(clickMap.regions[0].x).toBe(10);
      expect(clickMap.regions[0].screenY).toBe(5);
      expect(clickMap.regions[0].absY).toBe(5);
    });

    test('calculates screenY from absY minus scroll offset', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-1',
          x: 0,
          y: 20,
          width: 10,
          height: 2,
          depth: 0,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 10, 24);

      expect(clickMap.regions[0].screenY).toBe(10); // 20 - 10
      expect(clickMap.regions[0].absY).toBe(20); // Original position preserved
    });

    test('handles multiple regions', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-1',
          x: 0,
          y: 0,
          width: 10,
          height: 1,
          depth: 0,
          nodeType: 'button'
        },
        {
          componentId: 'btn-2',
          x: 0,
          y: 2,
          width: 10,
          height: 1,
          depth: 0,
          nodeType: 'button'
        },
        {
          componentId: 'btn-3',
          x: 15,
          y: 0,
          width: 10,
          height: 1,
          depth: 0,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 0, 24);

      expect(clickMap.regions.length).toBe(3);
      expect(clickMap.regions[0].componentId).toBe('btn-1');
      expect(clickMap.regions[1].componentId).toBe('btn-2');
      expect(clickMap.regions[2].componentId).toBe('btn-3');
    });

    test('filters out-of-viewport regions (far below)', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-visible',
          x: 0,
          y: 10,
          width: 10,
          height: 1,
          depth: 0,
          nodeType: 'button'
        },
        {
          componentId: 'btn-far-below',
          x: 0,
          y: 200,
          width: 10,
          height: 1,
          depth: 0,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 0, 24);

      const visibleRegion = clickMap.regions.find(r => r.componentId === 'btn-visible');
      const farRegion = clickMap.regions.find(r => r.componentId === 'btn-far-below');

      expect(visibleRegion).toBeDefined();
      expect(farRegion).toBeUndefined();
    });

    test('keeps regions within buffer zone above viewport', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-above',
          x: 0,
          y: 5,
          width: 10,
          height: 2,
          depth: 0,
          nodeType: 'button'
        }
      ];

      // Scroll offset 50, viewport height 24
      // Region at y=5 has screenY = 5 - 50 = -45
      // Buffer is 50, so -45 > -50, should be kept
      clickMap.build(node, 50, 24);

      expect(clickMap.regions.length).toBe(1);
    });

    test('filters regions far above viewport (beyond buffer)', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-far-above',
          x: 0,
          y: 0,
          width: 10,
          height: 1,
          depth: 0,
          nodeType: 'button'
        }
      ];

      // Scroll offset 200, viewport height 24
      // Region at y=0 has screenY = 0 - 200 = -200
      // Buffer is 50, so -200 < -50, should be filtered
      clickMap.build(node, 200, 24);

      expect(clickMap.regions.length).toBe(0);
    });

    test('sets isDirty to false after build', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');
      node._clickRegions = [];

      clickMap.build(node, 0, 24);

      expect(clickMap.isDirty).toBe(false);
    });

    test('stores scroll offset', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');
      node._clickRegions = [];

      clickMap.build(node, 15, 24);

      expect(clickMap._scrollOffset).toBe(15);
    });

    test('stores viewport height', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');
      node._clickRegions = [];

      clickMap.build(node, 0, 30);

      expect(clickMap.viewportHeight).toBe(30);
    });

    test('clears existing regions before building', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        { componentId: 'btn-1', x: 0, y: 0, width: 10, height: 1, depth: 0, nodeType: 'button' }
      ];
      clickMap.build(node, 0, 24);
      expect(clickMap.regions.length).toBe(1);

      // Build with different regions
      node._clickRegions = [
        { componentId: 'btn-2', x: 0, y: 0, width: 10, height: 1, depth: 0, nodeType: 'button' },
        { componentId: 'btn-3', x: 0, y: 2, width: 10, height: 1, depth: 0, nodeType: 'button' }
      ];
      clickMap.build(node, 0, 24);

      expect(clickMap.regions.length).toBe(2);
      expect(clickMap.regions[0].componentId).toBe('btn-2');
    });

    test('preserves all region properties', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'test-btn',
          x: 5,
          y: 10,
          width: 15,
          height: 3,
          depth: 2,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 0, 24);

      const region = clickMap.regions[0];
      expect(region.componentId).toBe('test-btn');
      expect(region.x).toBe(5);
      expect(region.absY).toBe(10);
      expect(region.screenY).toBe(10);
      expect(region.width).toBe(15);
      expect(region.height).toBe(3);
      expect(region.depth).toBe(2);
      expect(region.nodeType).toBe('button');
    });
  });

  describe('hitTest', () => {
    test('finds component at given coordinates', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-1',
          x: 10,
          y: 5,
          width: 10,
          height: 2,
          depth: 0,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 0, 24);

      // Terminal coords are 1-indexed, so (15, 6) -> layout (14, 5)
      const result = clickMap.hitTest(15, 6);
      expect(result).toBe('btn-1');
    });

    test('converts 1-indexed terminal coords to 0-indexed layout coords', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      // Region at layout position (0, 0)
      node._clickRegions = [
        {
          componentId: 'btn-1',
          x: 0,
          y: 0,
          width: 5,
          height: 1,
          depth: 0,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 0, 24);

      // Terminal (1, 1) should map to layout (0, 0)
      expect(clickMap.hitTest(1, 1)).toBe('btn-1');

      // Terminal (5, 1) should map to layout (4, 0) - still in bounds
      expect(clickMap.hitTest(5, 1)).toBe('btn-1');

      // Terminal (6, 1) should map to layout (5, 0) - out of bounds (x >= x + width)
      expect(clickMap.hitTest(6, 1)).toBe(null);
    });

    test('returns null when no match', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-1',
          x: 10,
          y: 5,
          width: 10,
          height: 2,
          depth: 0,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 0, 24);

      const result = clickMap.hitTest(1, 1); // Outside region
      expect(result).toBe(null);
    });

    test('returns null when regions array is empty', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');
      node._clickRegions = [];

      clickMap.build(node, 0, 24);

      expect(clickMap.hitTest(5, 5)).toBe(null);
    });

    test('returns deepest (last rendered) region when overlapping', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      // Regions are stored in render order, last = deepest/on top
      node._clickRegions = [
        {
          componentId: 'box',
          x: 0,
          y: 0,
          width: 20,
          height: 10,
          depth: 0,
          nodeType: 'box'
        },
        {
          componentId: 'btn',
          x: 5,
          y: 3,
          width: 10,
          height: 2,
          depth: 1,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 0, 24);

      // Click at terminal (7, 5) -> layout (6, 4) - overlaps both
      const result = clickMap.hitTest(7, 5);
      expect(result).toBe('btn'); // Returns deeper/last one
    });

    test('checks bounds correctly at edges', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-1',
          x: 5,
          y: 5,
          width: 10,
          height: 3,
          depth: 0,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 0, 24);

      // Region spans x: [5, 15), y: [5, 8) in layout coords
      // Terminal coords are +1

      // Top-left corner (terminal 6, 6 = layout 5, 5)
      expect(clickMap.hitTest(6, 6)).toBe('btn-1');

      // Bottom-right inside (terminal 15, 8 = layout 14, 7)
      expect(clickMap.hitTest(15, 8)).toBe('btn-1');

      // Just outside right (terminal 16, 6 = layout 15, 5)
      expect(clickMap.hitTest(16, 6)).toBe(null);

      // Just outside bottom (terminal 6, 9 = layout 5, 8)
      expect(clickMap.hitTest(6, 9)).toBe(null);

      // Just outside left (terminal 5, 6 = layout 4, 5)
      expect(clickMap.hitTest(5, 6)).toBe(null);

      // Just outside top (terminal 6, 5 = layout 5, 4)
      expect(clickMap.hitTest(6, 5)).toBe(null);
    });

    test('uses screenY for hit testing (viewport-relative)', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-1',
          x: 0,
          y: 20,  // absY = 20
          width: 10,
          height: 2,
          depth: 0,
          nodeType: 'button'
        }
      ];

      // Scroll offset 15, so screenY = 20 - 15 = 5
      clickMap.build(node, 15, 24);

      // Should find at terminal y=6 (layout y=5 = screenY)
      expect(clickMap.hitTest(1, 6)).toBe('btn-1');
      expect(clickMap.hitTest(1, 7)).toBe('btn-1');

      // Should not find at terminal y=5 (layout y=4, below screenY)
      expect(clickMap.hitTest(1, 5)).toBe(null);
    });
  });

  describe('adjustForScroll', () => {
    test('adjusts screenY positions for new scroll offset', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-1',
          x: 0,
          y: 20,
          width: 10,
          height: 2,
          depth: 0,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 0, 24);
      expect(clickMap.regions[0].screenY).toBe(20);

      clickMap.adjustForScroll(10);
      expect(clickMap.regions[0].screenY).toBe(10); // 20 - 10
      expect(clickMap.regions[0].absY).toBe(20); // Preserved
    });

    test('handles scroll in both directions', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-1',
          x: 0,
          y: 20,
          width: 10,
          height: 2,
          depth: 0,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 10, 24);
      expect(clickMap.regions[0].screenY).toBe(10); // 20 - 10

      // Scroll down more
      clickMap.adjustForScroll(15);
      expect(clickMap.regions[0].screenY).toBe(5); // 20 - 15

      // Scroll back up
      clickMap.adjustForScroll(5);
      expect(clickMap.regions[0].screenY).toBe(15); // 20 - 5
    });

    test('does nothing if scroll offset unchanged', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        {
          componentId: 'btn-1',
          x: 0,
          y: 20,
          width: 10,
          height: 2,
          depth: 0,
          nodeType: 'button'
        }
      ];

      clickMap.build(node, 10, 24);
      const originalScreenY = clickMap.regions[0].screenY;

      clickMap.adjustForScroll(10); // Same offset
      expect(clickMap.regions[0].screenY).toBe(originalScreenY);
    });

    test('updates internal scroll offset', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');
      node._clickRegions = [];

      clickMap.build(node, 0, 24);
      expect(clickMap._scrollOffset).toBe(0);

      clickMap.adjustForScroll(25);
      expect(clickMap._scrollOffset).toBe(25);
    });

    test('adjusts all regions', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        { componentId: 'btn-1', x: 0, y: 10, width: 10, height: 1, depth: 0, nodeType: 'button' },
        { componentId: 'btn-2', x: 0, y: 20, width: 10, height: 1, depth: 0, nodeType: 'button' },
        { componentId: 'btn-3', x: 0, y: 30, width: 10, height: 1, depth: 0, nodeType: 'button' }
      ];

      clickMap.build(node, 0, 50);

      clickMap.adjustForScroll(5);

      expect(clickMap.regions[0].screenY).toBe(5);  // 10 - 5
      expect(clickMap.regions[1].screenY).toBe(15); // 20 - 5
      expect(clickMap.regions[2].screenY).toBe(25); // 30 - 5
    });
  });

  describe('invalidate', () => {
    test('sets isDirty to true', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');
      node._clickRegions = [];

      clickMap.build(node, 0, 24);
      expect(clickMap.isDirty).toBe(false);

      clickMap.invalidate();
      expect(clickMap.isDirty).toBe(true);
    });
  });

  describe('clear', () => {
    test('clears all regions', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        { componentId: 'btn-1', x: 0, y: 0, width: 10, height: 1, depth: 0, nodeType: 'button' }
      ];

      clickMap.build(node, 5, 24);
      expect(clickMap.regions.length).toBe(1);

      clickMap.clear();

      expect(clickMap.regions.length).toBe(0);
    });

    test('sets isDirty to true', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');
      node._clickRegions = [];

      clickMap.build(node, 0, 24);
      expect(clickMap.isDirty).toBe(false);

      clickMap.clear();
      expect(clickMap.isDirty).toBe(true);
    });

    test('resets scroll offset to zero', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');
      node._clickRegions = [];

      clickMap.build(node, 15, 24);
      expect(clickMap._scrollOffset).toBe(15);

      clickMap.clear();
      expect(clickMap._scrollOffset).toBe(0);
    });

    test('resets viewport height to zero', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');
      node._clickRegions = [];

      clickMap.build(node, 0, 30);
      expect(clickMap.viewportHeight).toBe(30);

      clickMap.clear();
      expect(clickMap.viewportHeight).toBe(0);
    });
  });

  describe('getRegions', () => {
    test('returns all regions', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        { componentId: 'btn-1', x: 0, y: 0, width: 10, height: 1, depth: 0, nodeType: 'button' },
        { componentId: 'btn-2', x: 0, y: 2, width: 10, height: 1, depth: 0, nodeType: 'button' }
      ];

      clickMap.build(node, 0, 24);

      const regions = clickMap.getRegions();
      expect(regions.length).toBe(2);
      expect(regions).toBe(clickMap.regions); // Same reference
    });
  });

  describe('getStats', () => {
    test('returns statistics object', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        { componentId: 'btn-1', x: 0, y: 0, width: 10, height: 1, depth: 0, nodeType: 'button' },
        { componentId: 'btn-2', x: 0, y: 2, width: 10, height: 1, depth: 0, nodeType: 'button' }
      ];

      clickMap.build(node, 5, 30);

      const stats = clickMap.getStats();

      expect(stats.regionCount).toBe(2);
      expect(stats.maxRegions).toBe(500);
      expect(stats.isDirty).toBe(false);
      expect(stats.scrollOffset).toBe(5);
      expect(stats.viewportHeight).toBe(30);
    });
  });

  describe('edge cases', () => {
    test('handles empty _clickRegions', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');
      node._clickRegions = [];

      clickMap.build(node, 0, 24);

      expect(clickMap.regions.length).toBe(0);
      expect(clickMap.isDirty).toBe(false);
    });

    test('handles missing _clickRegions (falls back to empty)', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');
      // _clickRegions not set

      clickMap.build(node, 0, 24);

      expect(clickMap.regions.length).toBe(0);
      expect(clickMap.isDirty).toBe(false);
    });

    test('handles zero-sized regions', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        { componentId: 'zero-w', x: 0, y: 0, width: 0, height: 1, depth: 0, nodeType: 'button' },
        { componentId: 'zero-h', x: 0, y: 0, width: 10, height: 0, depth: 0, nodeType: 'button' },
        { componentId: 'valid', x: 0, y: 0, width: 10, height: 1, depth: 0, nodeType: 'button' }
      ];

      clickMap.build(node, 0, 24);

      // All regions are stored (filtering happens during registration in render.js)
      expect(clickMap.regions.length).toBe(3);
    });

    test('handles large scroll offsets', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        { componentId: 'btn-1', x: 0, y: 1000, width: 10, height: 1, depth: 0, nodeType: 'button' }
      ];

      clickMap.build(node, 990, 24);

      expect(clickMap.regions.length).toBe(1);
      expect(clickMap.regions[0].screenY).toBe(10); // 1000 - 990
    });

    test('handles negative screenY (scrolled past)', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      node._clickRegions = [
        { componentId: 'btn-1', x: 0, y: 5, width: 10, height: 2, depth: 0, nodeType: 'button' }
      ];

      // Scrolled past this region (within buffer)
      clickMap.build(node, 20, 24);

      expect(clickMap.regions.length).toBe(1);
      expect(clickMap.regions[0].screenY).toBe(-15); // 5 - 20

      // Should still be hittable if click is in negative Y range
      // (though this wouldn't happen in practice as terminal coords are positive)
    });

    test('limits regions count to MAX_REGIONS', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      // Create 600 regions
      node._clickRegions = [];
      for (let i = 0; i < 600; i++) {
        node._clickRegions.push({
          componentId: `btn-${i}`,
          x: 0,
          y: i,
          width: 10,
          height: 1,
          depth: 0,
          nodeType: 'button'
        });
      }

      clickMap.build(node, 0, 1000);

      // Should be limited to MAX_REGIONS (500)
      expect(clickMap.regions.length).toBeLessThanOrEqual(500);
    });
  });

  describe('Row layout scenarios', () => {
    test('handles horizontal buttons at same Y', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      // Three buttons in a row: [Increment][Decrement][Reset]
      node._clickRegions = [
        { componentId: 'btn-inc', x: 0, y: 0, width: 13, height: 1, depth: 1, nodeType: 'button' },
        { componentId: 'btn-dec', x: 13, y: 0, width: 13, height: 1, depth: 1, nodeType: 'button' },
        { componentId: 'btn-reset', x: 26, y: 0, width: 9, height: 1, depth: 1, nodeType: 'button' }
      ];

      clickMap.build(node, 0, 24);

      // Click on Increment (x: 0-12)
      expect(clickMap.hitTest(1, 1)).toBe('btn-inc');
      expect(clickMap.hitTest(13, 1)).toBe('btn-inc');

      // Click on Decrement (x: 13-25)
      expect(clickMap.hitTest(14, 1)).toBe('btn-dec');
      expect(clickMap.hitTest(26, 1)).toBe('btn-dec');

      // Click on Reset (x: 26-34)
      expect(clickMap.hitTest(27, 1)).toBe('btn-reset');
      expect(clickMap.hitTest(35, 1)).toBe('btn-reset');
    });
  });

  describe('Nested layout scenarios', () => {
    test('handles Col > Row > Button structure', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      // Simulating:
      // <Col>
      //   <TextBox>Title</TextBox>        (y: 0)
      //   <Row>                           (y: 1)
      //     <Button>A</Button>            (x: 0)
      //     <Button>B</Button>            (x: 5)
      //   </Row>
      // </Col>
      node._clickRegions = [
        { componentId: 'btn-a', x: 0, y: 1, width: 5, height: 1, depth: 2, nodeType: 'button' },
        { componentId: 'btn-b', x: 5, y: 1, width: 5, height: 1, depth: 2, nodeType: 'button' }
      ];

      clickMap.build(node, 0, 24);

      // Terminal (1, 2) -> layout (0, 1) -> btn-a
      expect(clickMap.hitTest(1, 2)).toBe('btn-a');

      // Terminal (6, 2) -> layout (5, 1) -> btn-b
      expect(clickMap.hitTest(6, 2)).toBe('btn-b');
    });

    test('handles Box with border containing buttons', () => {
      const clickMap = new ClickMap();
      const node = new TUINode('root');

      // Box with border:
      // ┌────────────────┐  (y: 0)
      // │ [A]  [B]       │  (y: 1, content y offset due to border)
      // └────────────────┘  (y: 2)
      // Buttons inside at content y=1, with x offset for border
      node._clickRegions = [
        { componentId: 'btn-a', x: 2, y: 1, width: 3, height: 1, depth: 2, nodeType: 'button' },
        { componentId: 'btn-b', x: 7, y: 1, width: 3, height: 1, depth: 2, nodeType: 'button' }
      ];

      clickMap.build(node, 0, 24);

      // Terminal (3, 2) -> layout (2, 1) -> btn-a
      expect(clickMap.hitTest(3, 2)).toBe('btn-a');

      // Terminal (8, 2) -> layout (7, 1) -> btn-b
      expect(clickMap.hitTest(8, 2)).toBe('btn-b');
    });
  });
});
