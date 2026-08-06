/** Graph walks shared by the clustering and layout passes. Ids only, no React Flow shapes. */

export type SimpleEdge = { source: string; target: string };

/** Undirected adjacency restricted to `nodeIds`; endpoints outside the set are dropped. */
export function buildUndirectedAdjacency(nodeIds: string[], edges: SimpleEdge[]): Map<string, string[]> {
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

/** `startKey` when it survived filtering, otherwise the first node id. `''` when there are none. */
function resolveRoot(nodeIds: string[], startKey: string): string {
  if (nodeIds.includes(startKey)) return startKey;
  return nodeIds[0] ?? '';
}

/** Node ids reachable from `startKey` via undirected edges, including the root. */
export function reachableNodeIds(nodeIds: string[], edges: SimpleEdge[], startKey: string): Set<string> {
  const root = resolveRoot(nodeIds, startKey);
  if (!root) return new Set();

  const adj = buildUndirectedAdjacency(nodeIds, edges);
  const visited = new Set<string>([root]);
  const queue = [root];

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
export function bfsTreeEdges(rootId: string, adj: Map<string, string[]>, allowed?: Set<string>): SimpleEdge[] {
  if (allowed && !allowed.has(rootId)) return [];

  const tree: SimpleEdge[] = [];
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

/** {@link bfsTreeEdges} from `startKey` over an edge list, for Dagre ranking. */
export function bfsSpanningTreeEdges(nodeIds: string[], edges: SimpleEdge[], startKey: string): SimpleEdge[] {
  const root = resolveRoot(nodeIds, startKey);
  if (!root) return [];
  return bfsTreeEdges(root, buildUndirectedAdjacency(nodeIds, edges));
}

/** Parent → children adjacency from directed tree edges. */
export function buildChildrenMap(treeEdges: SimpleEdge[]): Map<string, string[]> {
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
