import { rankdirFromAngle, slotAngle } from '../geometry/angles';
import { topLeftFromCenter } from '../geometry/box';
import { computeRingRadius, lateralHalfExtent } from '../geometry/extents';
import { descendantCount, greedySlotOrder } from '../geometry/order';
import { resolveOptions } from '../options';
import { buildSpanningTree, collectSubtreeIds } from '../tree';
import type { EgoGraph, LayoutEdge, LayoutNode, LayoutOptions, Point, Positions } from '../types';
import { dagrePocketStrategy, layoutSubtreeLocal } from './dagre-subtree';
import { placeSubtreeAt } from './place';
import { layoutSatellitePockets } from './pockets';

/**
 * A ring of level-1 branches around the root, each branch drawn by Dagre
 * pointing outward, then satellites in pockets on an outer arc.
 *
 * The workhorse: deep, uneven branches stay legible because Dagre handles the
 * inside of each one. Requires `@dagrejs/dagre`.
 */
export function radialDagre<N extends LayoutNode = LayoutNode, E extends LayoutEdge = LayoutEdge>(
  graph: EgoGraph<N, E>,
  options: LayoutOptions<N, E> = {},
): Positions {
  const positionById: Positions = new Map();
  if (graph.nodes.length === 0) return positionById;

  const resolved = resolveOptions(options);
  const nodesById = new Map(graph.nodes.map((n) => [n.id, n]));
  const tree = buildSpanningTree(graph, resolved);
  if (!tree.root) return positionById;

  const weightOf = (id: string): number => {
    const node = nodesById.get(id);
    return node ? resolved.getWeight(node) : 1;
  };

  const rootNode = nodesById.get(tree.root)!;
  const rootCenter = { x: 0, y: 0 };
  positionById.set(tree.root, topLeftFromCenter(rootCenter, rootNode.width, rootNode.height));

  const ringThetas: number[] = [];
  const level1 = tree.children.get(tree.root) ?? [];

  if (level1.length > 0) {
    const ordered = greedySlotOrder(level1.map((id) => ({ id, weight: descendantCount(tree.children, id, weightOf) })));
    const n = ordered.length;

    const branches = ordered.map((id, slotIndex) => {
      const theta = slotAngle(slotIndex, n);
      ringThetas.push(theta);
      const rankdir = rankdirFromAngle(theta);
      const subtreeIds = collectSubtreeIds(tree.children, id);
      const localPositions = layoutSubtreeLocal(subtreeIds, tree.edges, nodesById, rankdir, resolved);
      return {
        id,
        theta,
        subtreeIds,
        localPositions,
        lateralHalf: lateralHalfExtent(subtreeIds, localPositions, nodesById, id, rankdir),
      };
    });

    const radius = computeRingRadius(
      branches.map((b) => b.lateralHalf),
      resolved,
    );

    for (const branch of branches) {
      const target: Point = {
        x: rootCenter.x + radius * Math.cos(branch.theta),
        y: rootCenter.y + radius * Math.sin(branch.theta),
      };
      placeSubtreeAt(branch.subtreeIds, branch.localPositions, nodesById, branch.id, target, positionById);
    }
  }

  layoutSatellitePockets({
    graph,
    tree,
    nodesById,
    positionById,
    rootCenter,
    ringThetas,
    strategy: dagrePocketStrategy,
    options: resolved,
  });

  return positionById;
}
