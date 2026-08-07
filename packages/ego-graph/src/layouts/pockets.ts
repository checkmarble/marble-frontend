import { angleDelta, largestFreeGapAngle, normalizeAngle, preferredSatelliteAngle } from '../geometry/angles';
import { centerOf } from '../geometry/box';
import { computeSatellitePocketRadius } from '../geometry/extents';
import type { ResolvedOptions } from '../options';
import { bfsTreeEdges, buildUndirectedAdjacency, type SpanningTree } from '../tree';
import type { EgoGraph, LayoutEdge, LayoutNode, Point, SpacingOptions } from '../types';
import type { PocketStrategy } from './pocket-strategy';

/**
 * Claim the still-unplaced connected component reachable from `rootId` via
 * `adj`, removing claimed ids from `unplaced`. First caller wins, so the
 * caller is responsible for iterating roots in a stable order.
 *
 * `skipIds` (typically the other satellites) are never entered — otherwise a
 * shared neighbour would let the first satellite swallow its siblings.
 *
 * Returns claimed ids including `rootId`, in BFS order.
 */
export function claimUnplacedComponent(
  rootId: string,
  unplaced: Set<string>,
  adj: Map<string, string[]>,
  skipIds: Set<string> = new Set(),
): string[] {
  if (!unplaced.has(rootId)) return [];

  const claimed: string[] = [];
  const queue = [rootId];
  unplaced.delete(rootId);

  while (queue.length > 0) {
    const cur = queue.shift()!;
    claimed.push(cur);
    for (const nxt of adj.get(cur) ?? []) {
      if (!unplaced.has(nxt)) continue;
      // Other satellites stay for their own claim pass.
      if (skipIds.has(nxt) && nxt !== rootId) continue;
      unplaced.delete(nxt);
      queue.push(nxt);
    }
  }

  return claimed;
}

/**
 * Fan satellites that want the same side onto an outer arc.
 *
 * 1. Sort by preferred angle
 * 2. Cluster consecutive items within `satelliteGap`
 * 3. Within each cluster, spread around the circular mean with separation
 *    driven by lateral half-extents at `radius` — the same geometric idea as
 *    the main ring radius computation
 */
export function fanSatelliteAngles(
  items: Array<{ id: string; preferredTheta: number; lateralHalf: number }>,
  radius: number,
  spacing: Required<Pick<SpacingOptions, 'satelliteGap' | 'minSatelliteGap' | 'ringPadding'>>,
): Map<string, number> {
  const result = new Map<string, number>();
  if (items.length === 0) return result;
  if (items.length === 1) {
    result.set(items[0]!.id, normalizeAngle(items[0]!.preferredTheta));
    return result;
  }

  const sorted = [...items].sort(
    (a, b) => normalizeAngle(a.preferredTheta) - normalizeAngle(b.preferredTheta) || a.id.localeCompare(b.id),
  );

  type Cluster = typeof sorted;
  const clusters: Cluster[] = [];
  let current: Cluster = [sorted[0]!];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const item = sorted[i]!;
    const gap = Math.abs(angleDelta(prev.preferredTheta, item.preferredTheta));
    if (gap > spacing.satelliteGap) {
      clusters.push(current);
      current = [item];
    } else {
      current.push(item);
    }
  }
  clusters.push(current);

  for (const cluster of clusters) {
    if (cluster.length === 1) {
      result.set(cluster[0]!.id, normalizeAngle(cluster[0]!.preferredTheta));
      continue;
    }

    // Circular mean of preferred angles (average of unit vectors).
    let ux = 0;
    let uy = 0;
    for (const item of cluster) {
      ux += Math.cos(item.preferredTheta);
      uy += Math.sin(item.preferredTheta);
    }
    const mean = Math.atan2(uy, ux);

    // Adjacent separation from lateral extents; clamp to a readable minimum.
    const separations: number[] = [];
    for (let i = 0; i < cluster.length - 1; i++) {
      const needed =
        radius > 1e-6
          ? (cluster[i]!.lateralHalf + cluster[i + 1]!.lateralHalf + spacing.ringPadding) / radius
          : spacing.minSatelliteGap;
      separations.push(Math.max(spacing.minSatelliteGap, needed));
    }
    const totalSpan = separations.reduce((a, b) => a + b, 0);

    let cursor = mean - totalSpan / 2;
    result.set(cluster[0]!.id, normalizeAngle(cursor));
    for (let i = 0; i < separations.length; i++) {
      cursor += separations[i]!;
      result.set(cluster[i + 1]!.id, normalizeAngle(cursor));
    }
  }

  return result;
}

/**
 * Place everything the spanning tree could not reach, in pockets on an outer
 * arc around the already-placed core. Mutates `positionById`.
 *
 * Two kinds of island get a pocket:
 *   - one per satellite, rooted at the satellite, claimed in sorted id order;
 *   - one per leftover component, rooted at its smallest id.
 *
 * The second kind matters more than it looks. Without it, a graph with no
 * satellites at all — or one with components no satellite happens to touch —
 * silently leaves those nodes at the origin, stacked on top of each other.
 */
export function layoutSatellitePockets<N extends LayoutNode, E extends LayoutEdge>(args: {
  graph: EgoGraph<N, E>;
  tree: SpanningTree;
  nodesById: Map<string, N>;
  positionById: Map<string, Point>;
  rootCenter: Point;
  ringThetas: number[];
  strategy: PocketStrategy;
  options: ResolvedOptions<N, E>;
}): void {
  const { graph, tree, nodesById, positionById, rootCenter, ringThetas, strategy, options } = args;

  const allIds = graph.nodes.map((n) => n.id);
  const unplaced = new Set(allIds.filter((id) => !positionById.has(id)));
  if (unplaced.size === 0) return;

  const weightOf = (id: string): number => {
    const node = nodesById.get(id);
    return node ? options.getWeight(node) : 1;
  };

  // Pockets are about connectivity, not hierarchy, so this walks every edge —
  // associative ones included. That is the point: an island hangs off its
  // satellite precisely by the edges the tree refused.
  const fullAdj = buildUndirectedAdjacency(allIds, graph.edges);
  const satelliteIdSet = new Set(tree.satelliteIds);

  const islands: Array<{ rootId: string; ids: string[]; anchorIds: string[] }> = [];

  for (const satelliteId of tree.satelliteIds) {
    if (!unplaced.has(satelliteId)) continue;
    const ids = claimUnplacedComponent(satelliteId, unplaced, fullAdj, satelliteIdSet);
    if (ids.length === 0) continue;
    // A satellite points at its own neighbours.
    islands.push({ rootId: satelliteId, ids, anchorIds: [satelliteId] });
  }

  // Whatever no satellite claimed. Sorted so the choice of root is deterministic.
  for (const orphanId of [...unplaced].sort((a, b) => a.localeCompare(b))) {
    if (!unplaced.has(orphanId)) continue;
    const ids = claimUnplacedComponent(orphanId, unplaced, fullAdj);
    if (ids.length === 0) continue;
    // An orphan root is arbitrary, so aim the pocket using the whole component.
    islands.push({ rootId: orphanId, ids, anchorIds: ids });
  }

  if (islands.length === 0) return;

  const placedBoxes: Array<{ center: Point; width: number; height: number }> = [];
  for (const id of tree.memberIds) {
    const pos = positionById.get(id);
    const node = nodesById.get(id);
    if (!pos || !node) continue;
    placedBoxes.push({ center: centerOf(node, pos), width: node.width, height: node.height });
  }
  const pocketRadius = computeSatellitePocketRadius(placedBoxes, rootCenter, options);

  const prepared = islands.map(({ rootId, ids, anchorIds }) => {
    const placedNeighborCenters: Point[] = [];
    for (const anchorId of anchorIds) {
      for (const neighborId of fullAdj.get(anchorId) ?? []) {
        const pos = positionById.get(neighborId);
        const node = nodesById.get(neighborId);
        if (!pos || !node) continue;
        placedNeighborCenters.push(centerOf(node, pos));
      }
    }

    const preferredTheta =
      preferredSatelliteAngle(rootCenter, placedNeighborCenters) ?? largestFreeGapAngle(ringThetas);

    const treeEdges = bfsTreeEdges(rootId, fullAdj, new Set(ids));
    const lateralHalf = strategy.measureLateralHalf({
      islandIds: ids,
      treeEdges,
      rootId,
      preferredTheta,
      nodesById,
      spacing: options,
      weightOf,
    });

    return { id: rootId, islandIds: ids, treeEdges, preferredTheta, lateralHalf };
  });

  const finalAngles = fanSatelliteAngles(
    prepared.map((p) => ({ id: p.id, preferredTheta: p.preferredTheta, lateralHalf: p.lateralHalf })),
    pocketRadius,
    options,
  );

  for (const prep of prepared) {
    const theta = finalAngles.get(prep.id) ?? prep.preferredTheta;
    strategy.place({
      islandIds: prep.islandIds,
      treeEdges: prep.treeEdges,
      rootId: prep.id,
      targetCenter: {
        x: rootCenter.x + pocketRadius * Math.cos(theta),
        y: rootCenter.y + pocketRadius * Math.sin(theta),
      },
      theta,
      nodesById,
      positionById,
      spacing: options,
      weightOf,
    });
  }
}
