import type { ClassifyOptions, EgoGraph, LayoutEdge, LayoutNode } from './types';

/** Undirected adjacency restricted to `nodeIds`; endpoints outside the set are dropped. */
export function buildUndirectedAdjacency(nodeIds: string[], edges: LayoutEdge[]): Map<string, string[]> {
  const idSet = new Set(nodeIds);
  const adj = new Map<string, string[]>();
  for (const id of nodeIds) {
    adj.set(id, []);
  }
  for (const edge of edges) {
    if (!idSet.has(edge.source) || !idSet.has(edge.target)) continue;
    adj.get(edge.source)!.push(edge.target);
    adj.get(edge.target)!.push(edge.source);
  }
  return adj;
}

/** `requested` when it survived filtering, otherwise the first id. `''` when there are none. */
export function resolveRoot(nodeIds: string[], requested: string): string {
  if (nodeIds.includes(requested)) return requested;
  return nodeIds[0] ?? '';
}

/**
 * Node ids reachable from `root` over the given edges, including the root.
 *
 * Note this walks *every* edge it is given, associative ones included — it
 * answers "what is connected", not "what is in the tree".
 */
export function reachableNodeIds(nodeIds: string[], edges: LayoutEdge[], root: string): Set<string> {
  const start = resolveRoot(nodeIds, root);
  if (!start) return new Set();

  const adj = buildUndirectedAdjacency(nodeIds, edges);
  const visited = new Set<string>([start]);
  const queue = [start];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nxt of adj.get(cur) ?? []) {
      if (visited.has(nxt)) continue;
      visited.add(nxt);
      queue.push(nxt);
    }
  }

  return visited;
}

/**
 * BFS spanning-tree edges (parent → child) rooted at `rootId`.
 * Cycles are handled by only recording the first discovery edge.
 * `allowed`, when given, restricts the walk to that id set.
 */
export function bfsTreeEdges(rootId: string, adj: Map<string, string[]>, allowed?: Set<string>): LayoutEdge[] {
  if (allowed && !allowed.has(rootId)) return [];

  const tree: LayoutEdge[] = [];
  const visited = new Set<string>([rootId]);
  const queue = [rootId];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nxt of adj.get(cur) ?? []) {
      if (visited.has(nxt) || (allowed && !allowed.has(nxt))) continue;
      visited.add(nxt);
      tree.push({ source: cur, target: nxt });
      queue.push(nxt);
    }
  }

  return tree;
}

/** Parent → children adjacency from directed tree edges. */
export function buildChildrenMap(treeEdges: LayoutEdge[]): Map<string, string[]> {
  const children = new Map<string, string[]>();
  for (const { source, target } of treeEdges) {
    const list = children.get(source) ?? [];
    list.push(target);
    children.set(source, list);
  }
  return children;
}

/** `rootId` and every descendant, in depth-first order. */
export function collectSubtreeIds(children: Map<string, string[]>, rootId: string): string[] {
  const ids: string[] = [];
  const stack = [rootId];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    ids.push(cur);
    const kids = children.get(cur);
    if (kids) {
      for (let i = kids.length - 1; i >= 0; i--) {
        stack.push(kids[i]!);
      }
    }
  }
  return ids;
}

/**
 * The hierarchy every pass in this package agrees on.
 *
 * One definition, deliberately: structural edges between non-satellite nodes,
 * BFS'd from the root. Satellites are excluded here rather than filtered out
 * later, so they can never reparent a branch or warp the star.
 */
export type SpanningTree = {
  /** The requested root if it exists, else the first node. `''` for an empty graph. */
  root: string;
  /** Parent → child edges. */
  edges: LayoutEdge[];
  /** Parent → children adjacency. */
  children: Map<string, string[]>;
  /** Ids eligible for the tree — every non-satellite node, in input order. */
  memberIds: string[];
  /** Ids `isSatellite` excluded, sorted for stable downstream iteration. */
  satelliteIds: string[];
};

export function buildSpanningTree<N extends LayoutNode, E extends LayoutEdge>(
  graph: EgoGraph<N, E>,
  options: Required<Pick<ClassifyOptions<N, E>, 'isStructural' | 'isSatellite'>>,
): SpanningTree {
  const { isStructural, isSatellite } = options;

  const memberIds: string[] = [];
  const satelliteIds: string[] = [];
  for (const node of graph.nodes) {
    (isSatellite(node) ? satelliteIds : memberIds).push(node.id);
  }
  satelliteIds.sort((a, b) => a.localeCompare(b));

  const memberIdSet = new Set(memberIds);
  const structural = graph.edges.filter(
    (e) => isStructural(e) && memberIdSet.has(e.source) && memberIdSet.has(e.target),
  );

  const root = resolveRoot(memberIds, graph.root);
  const edges = root ? bfsTreeEdges(root, buildUndirectedAdjacency(memberIds, structural)) : [];

  return { root, edges, children: buildChildrenMap(edges), memberIds, satelliteIds };
}
