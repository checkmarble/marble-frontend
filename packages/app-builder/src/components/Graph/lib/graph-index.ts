/**
 * Undirected neighbour lookup over the rendered graph, built once per layout.
 *
 * Both hover readers ask "is this node next to the hovered one?" for every node
 * on every mouse move. Answering from an edge array is O(E) per node, so one
 * hover over a graph of N nodes costs O(N·E); this index makes each answer O(1)
 * and the build cost O(E) per layout instead of per hover.
 */
export type GraphEdgeLike = {
  id: string;
  source: string;
  target: string;
};

export type GraphIndex = {
  /** Node id → the ids it shares an edge with, in either direction. */
  neighbors: ReadonlyMap<string, ReadonlySet<string>>;
  /** The edges this was built from; the trail walk still needs their ids. */
  edges: readonly GraphEdgeLike[];
};

export const EMPTY_GRAPH_INDEX: GraphIndex = { neighbors: new Map(), edges: [] };

export function buildGraphIndex(edges: readonly GraphEdgeLike[]): GraphIndex {
  const neighbors = new Map<string, Set<string>>();
  const add = (from: string, to: string) => {
    const existing = neighbors.get(from);
    if (existing) existing.add(to);
    else neighbors.set(from, new Set([to]));
  };
  for (const edge of edges) {
    add(edge.source, edge.target);
    add(edge.target, edge.source);
  }
  return { neighbors, edges };
}

export function areNodesAdjacent(index: GraphIndex, a: string, b: string): boolean {
  return index.neighbors.get(a)?.has(b) ?? false;
}
