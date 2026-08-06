import { clusterNodeId } from './graph-keys';
import { type ClusterRfNode, type GraphRfEdge, type GraphRfNode, isMatchEdge } from './graph-rf-types';
import { bfsSpanningTreeEdges, buildChildrenMap, collectSubtreeIds } from './graph-traversal';

export type ClusterOptions = {
  startKey: string;
  /** A branch collapses once its foldable size *exceeds* this. `0` disables clustering. */
  threshold: number;
  /** Branch roots the user drilled into; their chips are suppressed. */
  expandedRootIds: Set<string>;
};

export type ClusterResult = {
  nodes: GraphRfNode[];
  edges: GraphRfEdge[];
};

/** Pivots and the start node are never folded into a chip. */
function isPinned(node: GraphRfNode, startKey: string): boolean {
  if (node.type === 'pivot') return true;
  return node.id === startKey;
}

/**
 * Foldable nodes in each subtree, keyed by root. Pinned nodes count 0, so a
 * chip never advertises pivots it cannot swallow.
 */
function buildSubtreeWeights(
  children: Map<string, string[]>,
  rootId: string,
  pinnedIds: Set<string>,
  weights: Map<string, number>,
): number {
  let weight = pinnedIds.has(rootId) ? 0 : 1;
  for (const child of children.get(rootId) ?? []) {
    weight += buildSubtreeWeights(children, child, pinnedIds, weights);
  }
  weights.set(rootId, weight);
  return weight;
}

/** Unordered pair key so a (chip, external) pair can only ever yield one edge. */
function pairKey(a: string, b: string): string {
  return a < b ? `${a}${b}` : `${b}${a}`;
}

/**
 * Fold branches of the start-rooted BFS tree into single chip nodes.
 *
 * Walks down from the start and collapses the *shallowest* subtree whose
 * foldable size exceeds `threshold`, so expanding a chip re-applies the rule to
 * its children — clusters nest. Pivots stay on canvas even when they sit inside
 * a collapsed branch; their edges to members merge into the chip.
 */
export function clusterGraphElements(
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
  options: ClusterOptions,
): ClusterResult {
  if (options.threshold <= 0 || nodes.length === 0) {
    return { nodes, edges };
  }

  const nodesById = new Map(nodes.map((n) => [n.id, n]));
  const nodeIds = nodes.map((n) => n.id);
  const resolvedStart = nodesById.has(options.startKey) ? options.startKey : (nodeIds[0] ?? '');
  if (!resolvedStart) return { nodes, edges };

  const pinnedIds = new Set(nodes.filter((n) => isPinned(n, resolvedStart)).map((n) => n.id));

  // BFS over *all* edges: pivot-owned match-only islands are in the tree too.
  const treeEdges = bfsSpanningTreeEdges(nodeIds, edges, resolvedStart);
  const children = buildChildrenMap(treeEdges);

  const weights = new Map<string, number>();
  buildSubtreeWeights(children, resolvedStart, pinnedIds, weights);

  // Walk down; collapse the first child that qualifies, otherwise recurse.
  const clusterNodes: ClusterRfNode[] = [];
  const memberOf = new Map<string, string>();
  /** Roots that would have collapsed but for `expandedRootIds` — they can regroup. */
  const expandedRoots = new Set<string>();
  const queue = [resolvedStart];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const child of children.get(cur) ?? []) {
      const weight = weights.get(child) ?? 0;
      const rootNode = nodesById.get(child);
      // A chip renders its root like a person node, so only persons can head one.
      // Strictly greater: a threshold of N collapses branches *larger* than N.
      const qualifies = weight > options.threshold && !pinnedIds.has(child) && rootNode?.type === 'person';

      if (!qualifies || options.expandedRootIds.has(child)) {
        if (qualifies) expandedRoots.add(child);
        queue.push(child);
        continue;
      }

      // Pinned descendants stay on canvas, but everything below them is still
      // part of this subtree — do not re-explore from them or their children
      // would be claimed twice.
      const memberIds = collectSubtreeIds(children, child).filter((id) => !pinnedIds.has(id));
      if (memberIds.length === 0) {
        queue.push(child);
        continue;
      }

      const clusterId = clusterNodeId(child);
      clusterNodes.push({
        id: clusterId,
        position: { x: 0, y: 0 },
        // Explicit size: the first layout pass runs before React Flow measures.
        // Matches the person node's tag-card footprint.
        width: 192,
        height: 72,
        type: 'cluster',
        data: {
          root: rootNode.data,
          nodeCount: memberIds.length,
          internalEdgeCount: 0,
          memberIds,
        },
      });
      for (const id of memberIds) {
        memberOf.set(id, clusterId);
      }
    }
  }

  if (clusterNodes.length === 0 && expandedRoots.size === 0) {
    return { nodes, edges };
  }

  // Rewrite edges: internal ones vanish into a count, external ones merge per
  // endpoint pair (never per pair+kind, so a pair yields exactly one edge).
  const internalEdgeCount = new Map<string, number>();
  type Merged = { source: string; target: string; memberIds: Set<string>; allMatch: boolean };
  const mergedByPair = new Map<string, Merged>();
  const passthrough: GraphRfEdge[] = [];

  for (const edge of edges) {
    const sourceCluster = memberOf.get(edge.source);
    const targetCluster = memberOf.get(edge.target);

    if (sourceCluster != null && sourceCluster === targetCluster) {
      internalEdgeCount.set(sourceCluster, (internalEdgeCount.get(sourceCluster) ?? 0) + 1);
      continue;
    }

    if (sourceCluster == null && targetCluster == null) {
      passthrough.push(edge);
      continue;
    }

    const source = sourceCluster ?? edge.source;
    const target = targetCluster ?? edge.target;
    const key = pairKey(source, target);
    const existing = mergedByPair.get(key);
    const isMatch = isMatchEdge(edge);

    if (existing) {
      if (sourceCluster != null) existing.memberIds.add(edge.source);
      if (targetCluster != null) existing.memberIds.add(edge.target);
      existing.allMatch = existing.allMatch && isMatch;
      continue;
    }

    const memberIds = new Set<string>();
    if (sourceCluster != null) memberIds.add(edge.source);
    if (targetCluster != null) memberIds.add(edge.target);
    mergedByPair.set(key, { source, target, memberIds, allMatch: isMatch });
  }

  for (const cluster of clusterNodes) {
    cluster.data.internalEdgeCount = internalEdgeCount.get(cluster.id) ?? 0;
  }

  const mergedEdges: GraphRfEdge[] = [...mergedByPair.values()].map(({ source, target, memberIds, allMatch }) => ({
    id: `agg:${source}->${target}`,
    source,
    target,
    type: allMatch ? ('match' as const) : ('link' as const),
    animated: true,
    data: { kind: allMatch ? 'match' : 'link', mergedCount: memberIds.size },
  }));

  const survivingNodes = nodes
    .filter((n) => !memberOf.has(n.id))
    .map((n) =>
      n.type === 'person' && expandedRoots.has(n.id) ? { ...n, data: { ...n.data, isExpandedClusterRoot: true } } : n,
    );

  return {
    nodes: [...survivingNodes, ...clusterNodes],
    edges: [...passthrough, ...mergedEdges],
  };
}
