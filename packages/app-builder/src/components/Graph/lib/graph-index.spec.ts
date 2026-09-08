import { describe, expect, it } from 'vitest';
import { areNodesAdjacent, buildGraphIndex, EMPTY_GRAPH_INDEX } from './graph-index';

function edge(source: string, target: string, id = `${source}->${target}`) {
  return { id, source, target };
}

describe('buildGraphIndex', () => {
  it('treats every edge as undirected', () => {
    const index = buildGraphIndex([edge('a', 'b')]);

    expect(areNodesAdjacent(index, 'a', 'b')).toBe(true);
    expect(areNodesAdjacent(index, 'b', 'a')).toBe(true);
  });

  it('reports nodes two hops apart as not adjacent', () => {
    const index = buildGraphIndex([edge('a', 'b'), edge('b', 'c')]);

    expect(areNodesAdjacent(index, 'a', 'c')).toBe(false);
  });

  it('collapses parallel edges into a single neighbour entry', () => {
    const index = buildGraphIndex([edge('a', 'b', 'link'), edge('a', 'b', 'match')]);

    expect(index.neighbors.get('a')).toEqual(new Set(['b']));
  });

  it('keeps the edges it was built from, for callers that need edge ids', () => {
    const edges = [edge('a', 'b')];

    expect(buildGraphIndex(edges).edges).toBe(edges);
  });

  it('answers false for nodes it has never seen', () => {
    expect(areNodesAdjacent(buildGraphIndex([edge('a', 'b')]), 'a', 'zzz')).toBe(false);
    expect(areNodesAdjacent(EMPTY_GRAPH_INDEX, 'a', 'b')).toBe(false);
  });
});
