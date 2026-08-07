import Dagre from '@dagrejs/dagre';
import { rankdirFromAngle } from '../geometry/angles';
import { topLeftFromCenter } from '../geometry/box';
import { lateralHalfExtent } from '../geometry/extents';
import type { LayoutEdge, LayoutNode, Point, RankDir, SpacingOptions } from '../types';
import { placeSubtreeAt } from './place';
import type { PocketStrategy } from './pocket-strategy';

/**
 * The one place `@dagrejs/dagre` is imported. Anything that does not reach this
 * module does not pull Dagre into the bundle — which is the whole reason
 * `polarPetal` can be used dependency-free.
 */
export function layoutSubtreeLocal(
  subtreeIds: string[],
  treeEdges: LayoutEdge[],
  nodesById: Map<string, LayoutNode>,
  rankdir: RankDir,
  spacing: Required<Pick<SpacingOptions, 'nodeSep' | 'rankSep'>>,
): Map<string, Point> {
  const idSet = new Set(subtreeIds);
  const positions = new Map<string, Point>();

  if (subtreeIds.length === 1) {
    const id = subtreeIds[0]!;
    const node = nodesById.get(id);
    if (!node) return positions;
    positions.set(id, topLeftFromCenter({ x: 0, y: 0 }, node.width, node.height));
    return positions;
  }

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir,
    nodesep: spacing.nodeSep,
    ranksep: spacing.rankSep,
  });

  for (const id of subtreeIds) {
    const node = nodesById.get(id);
    if (!node) continue;
    g.setNode(id, { width: node.width, height: node.height });
  }

  for (const edge of treeEdges) {
    if (!idSet.has(edge.source) || !idSet.has(edge.target)) continue;
    g.setEdge(edge.source, edge.target);
  }

  Dagre.layout(g);

  for (const id of subtreeIds) {
    const positioned = g.node(id);
    const node = nodesById.get(id);
    if (!positioned || !node) continue;
    positions.set(id, {
      x: positioned.x - node.width / 2,
      y: positioned.y - node.height / 2,
    });
  }

  return positions;
}

/** A Dagre subtree, translated so the satellite sits on the outer pocket ring. */
export const dagrePocketStrategy: PocketStrategy = {
  measureLateralHalf({ islandIds, treeEdges, rootId, preferredTheta, nodesById, spacing }) {
    const rankdir = rankdirFromAngle(preferredTheta);
    const localPositions = layoutSubtreeLocal(islandIds, treeEdges, nodesById, rankdir, spacing);
    return lateralHalfExtent(islandIds, localPositions, nodesById, rootId, rankdir);
  },
  place({ islandIds, treeEdges, rootId, targetCenter, theta, nodesById, positionById, spacing }) {
    const localPositions = layoutSubtreeLocal(islandIds, treeEdges, nodesById, rankdirFromAngle(theta), spacing);
    placeSubtreeAt(islandIds, localPositions, nodesById, rootId, targetCenter, positionById);
  },
};
