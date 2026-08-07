import { describe, expect, it } from 'vitest';
import { applyPositions, DEFAULT_NODE_SIZE, measuredSize, retargetHandles, toLayoutGraph } from './index';

const at = (id: string, x: number, y: number) => ({ id, position: { x, y }, measured: { width: 100, height: 40 } });

describe('measuredSize', () => {
  it('prefers measured, then declared, then the fallback', () => {
    expect(measuredSize({ id: 'a', position: { x: 0, y: 0 }, measured: { width: 10, height: 20 }, width: 99 })).toEqual(
      {
        width: 10,
        height: 20,
      },
    );
    expect(measuredSize({ id: 'a', position: { x: 0, y: 0 }, width: 99, height: 33 })).toEqual({
      width: 99,
      height: 33,
    });
    expect(measuredSize({ id: 'a', position: { x: 0, y: 0 } })).toEqual(DEFAULT_NODE_SIZE);
  });
});

describe('toLayoutGraph', () => {
  it('adds a footprint while keeping the caller’s own fields', () => {
    const nodes = [{ ...at('a', 0, 0), type: 'pivot' as const }];
    const result = toLayoutGraph(nodes, [{ source: 'a', target: 'b' }], 'a');

    expect(result.root).toBe('a');
    expect(result.nodes[0]).toMatchObject({ id: 'a', width: 100, height: 40, type: 'pivot' });
    // So predicates like `n => n.type === 'pivot'` still work downstream.
    expect(result.nodes[0]!.type).toBe('pivot');
  });
});

describe('applyPositions', () => {
  it('writes placements through and leaves unplaced nodes alone', () => {
    const nodes = [at('a', 0, 0), at('b', 5, 5)];
    const result = applyPositions(nodes, new Map([['a', { x: 10, y: 20 }]]));

    expect(result[0]!.position).toEqual({ x: 10, y: 20 });
    expect(result[1]).toBe(nodes[1]);
  });
});

describe('retargetHandles', () => {
  it('picks the dominant axis rather than the nearest corner', () => {
    // b is far to the right and slightly below: that is a right/left pairing.
    const nodes = [at('a', 0, 0), at('b', 500, 30)];
    const [edge] = retargetHandles(nodes, [{ source: 'a', target: 'b' }]);

    expect(edge!.sourceHandle).toBe('sr');
    expect(edge!.targetHandle).toBe('l');
  });

  it('pairs vertically when the vertical delta dominates', () => {
    const nodes = [at('a', 0, 0), at('b', 30, 500)];
    const [edge] = retargetHandles(nodes, [{ source: 'a', target: 'b' }]);

    expect(edge!.sourceHandle).toBe('sb');
    expect(edge!.targetHandle).toBe('t');
  });

  it('honours a custom handle id mapper', () => {
    const nodes = [at('a', 0, 0), at('b', 500, 0)];
    const [edge] = retargetHandles(nodes, [{ source: 'a', target: 'b' }], (side, kind) => `${kind}-${side}`);

    expect(edge!.sourceHandle).toBe('source-r');
    expect(edge!.targetHandle).toBe('target-l');
  });

  it('returns unchanged edges by identity so React Flow does not re-render them', () => {
    const nodes = [at('a', 0, 0), at('b', 500, 0)];
    const edges = [{ source: 'a', target: 'b', sourceHandle: 'sr', targetHandle: 'l' }];

    expect(retargetHandles(nodes, edges)[0]).toBe(edges[0]);
  });

  it('leaves an edge alone when an endpoint is missing', () => {
    const edges = [{ source: 'a', target: 'ghost' }];
    expect(retargetHandles([at('a', 0, 0)], edges)[0]).toBe(edges[0]);
  });
});
