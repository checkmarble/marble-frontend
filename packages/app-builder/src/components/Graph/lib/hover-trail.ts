import { type GraphIndex } from './graph-index';

/**
 * Nodes and edges that sit on at least one unweighted shortest path between
 * `startId` and `hoveredId`. Walks the visible graph undirected; every edge
 * costs one hop. Same-depth chords between geodesic nodes are excluded.
 */
export type HoverTrail = {
  nodeIds: ReadonlySet<string>;
  edgeIds: ReadonlySet<string>;
};

export const EMPTY_HOVER_TRAIL: HoverTrail = {
  nodeIds: new Set(),
  edgeIds: new Set(),
};

function distancesFrom(neighbors: GraphIndex['neighbors'], origin: string) {
  const dist = new Map<string, number>([[origin, 0]]);
  const queue = [origin];
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]!;
    const d = dist.get(node)!;
    for (const next of neighbors.get(node) ?? []) {
      if (dist.has(next)) continue;
      dist.set(next, d + 1);
      queue.push(next);
    }
  }
  return dist;
}

export function shortestPathUnion(index: GraphIndex, startId: string, hoveredId: string): HoverTrail {
  if (startId === hoveredId) {
    return { nodeIds: new Set([hoveredId]), edgeIds: new Set() };
  }

  const { neighbors, edges } = index;
  const distStart = distancesFrom(neighbors, startId);
  const goal = distStart.get(hoveredId);
  if (goal == null) {
    return { nodeIds: new Set([hoveredId]), edgeIds: new Set() };
  }

  const distHovered = distancesFrom(neighbors, hoveredId);
  const nodeIds = new Set<string>();
  for (const [node, fromStart] of distStart) {
    const fromHovered = distHovered.get(node);
    if (fromHovered != null && fromStart + fromHovered === goal) {
      nodeIds.add(node);
    }
  }

  const edgeIds = new Set<string>();
  for (const edge of edges) {
    const fromStartSource = distStart.get(edge.source);
    const fromStartTarget = distStart.get(edge.target);
    const fromHoveredSource = distHovered.get(edge.source);
    const fromHoveredTarget = distHovered.get(edge.target);
    if (fromStartSource == null || fromStartTarget == null || fromHoveredSource == null || fromHoveredTarget == null) {
      continue;
    }
    const viaSourceThenTarget = fromStartSource + 1 + fromHoveredTarget === goal;
    const viaTargetThenSource = fromStartTarget + 1 + fromHoveredSource === goal;
    if (viaSourceThenTarget || viaTargetThenSource) {
      edgeIds.add(edge.id);
    }
  }

  return { nodeIds, edgeIds };
}
