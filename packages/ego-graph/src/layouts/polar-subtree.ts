import { sectorAngles } from '../geometry/angles';
import { aabbHalfPerp, aabbHalfRadial, centerOf, topLeftFromCenter } from '../geometry/box';
import { computeArcRadius, computeRingRadius, lateralHalfExtentAtAngle } from '../geometry/extents';
import { descendantCount, greedySlotOrder } from '../geometry/order';
import { buildChildrenMap } from '../tree';
import type { LayoutNode, Point, SpacingOptions } from '../types';
import type { PocketStrategy } from './pocket-strategy';

export type PolarTreeArgs = {
  nodeId: string;
  /** `null` at the root, which then spreads its children over the full circle. */
  outboundTheta: number | null;
  children: Map<string, string[]>;
  nodesById: Map<string, LayoutNode>;
  positionById: Map<string, Point>;
  /** Collects the angles of the root's own children, for satellite gap-finding. */
  ringThetas: number[];
  isRoot: boolean;
  spacing: Required<SpacingOptions>;
  weightOf: (id: string) => number;
};

/**
 * Pure polar flower-petal placement: 360° at the root, else a 180° hemisphere
 * centered on the outbound ray. No Dagre.
 */
export function layoutPolarTree(args: PolarTreeArgs): void {
  const { nodeId, outboundTheta, children, nodesById, positionById, ringThetas, isRoot, spacing, weightOf } = args;
  const kidIds = children.get(nodeId) ?? [];
  const n = kidIds.length;
  if (n === 0) return;

  const parentPos = positionById.get(nodeId);
  const parentNode = nodesById.get(nodeId);
  if (!parentPos || !parentNode) return;

  const parentCenter = centerOf(parentNode, parentPos);

  const weighted = kidIds.map((id) => ({
    id,
    weight: descendantCount(children, id, weightOf),
  }));
  const ordered = greedySlotOrder(weighted);
  const thetas = sectorAngles(n, outboundTheta);
  const closed = outboundTheta == null;

  const lateralHalves = ordered.map((id, i) => {
    const kidNode = nodesById.get(id)!;
    return aabbHalfPerp(kidNode.width, kidNode.height, thetas[i]!);
  });

  const siblingRadius = closed
    ? computeRingRadius(lateralHalves, spacing)
    : computeArcRadius(lateralHalves, Math.PI / n, false, spacing);

  for (let i = 0; i < ordered.length; i++) {
    const kidId = ordered[i]!;
    const theta = thetas[i]!;
    const kidNode = nodesById.get(kidId)!;
    const parentClearance =
      aabbHalfRadial(parentNode.width, parentNode.height, theta) +
      aabbHalfRadial(kidNode.width, kidNode.height, theta) +
      spacing.ringPadding;
    const r = Math.max(siblingRadius, parentClearance);
    const cx = parentCenter.x + r * Math.cos(theta);
    const cy = parentCenter.y + r * Math.sin(theta);
    positionById.set(kidId, topLeftFromCenter({ x: cx, y: cy }, kidNode.width, kidNode.height));

    if (isRoot) ringThetas.push(theta);

    layoutPolarTree({
      nodeId: kidId,
      outboundTheta: theta,
      children,
      nodesById,
      positionById,
      ringThetas,
      isRoot: false,
      spacing,
      weightOf,
    });
  }
}

/** Lay the island out into a scratch map with its root at the origin. */
function layoutIslandLocally(
  rootId: string,
  treeEdges: ReadonlyArray<{ source: string; target: string }>,
  nodesById: Map<string, LayoutNode>,
  theta: number,
  spacing: Required<SpacingOptions>,
  weightOf: (id: string) => number,
): Map<string, Point> {
  const scratch = new Map<string, Point>();
  const rootNode = nodesById.get(rootId);
  if (!rootNode) return scratch;

  scratch.set(rootId, topLeftFromCenter({ x: 0, y: 0 }, rootNode.width, rootNode.height));
  layoutPolarTree({
    nodeId: rootId,
    outboundTheta: theta,
    children: buildChildrenMap([...treeEdges]),
    nodesById,
    positionById: scratch,
    ringThetas: [],
    isRoot: false,
    spacing,
    weightOf,
  });
  return scratch;
}

/** Polar petal islands under each satellite — the same pattern as the main tree. */
export const polarPocketStrategy: PocketStrategy = {
  /**
   * Lay the petals out for real and measure what they actually span.
   *
   * Measuring the largest single node instead — which is the obvious shortcut —
   * under-reports a multi-level island by however far the recursion spreads,
   * and adjacent pockets then overlap.
   */
  measureLateralHalf({ islandIds, treeEdges, rootId, preferredTheta, nodesById, spacing, weightOf }) {
    if (islandIds.length <= 1) {
      const rootNode = nodesById.get(rootId);
      return rootNode ? aabbHalfPerp(rootNode.width, rootNode.height, preferredTheta) : 0;
    }
    const scratch = layoutIslandLocally(rootId, treeEdges, nodesById, preferredTheta, spacing, weightOf);
    return lateralHalfExtentAtAngle(islandIds, scratch, nodesById, rootId, preferredTheta);
  },
  place({ islandIds, treeEdges, rootId, targetCenter, theta, nodesById, positionById, spacing, weightOf }) {
    const rootNode = nodesById.get(rootId);
    if (!rootNode) return;

    positionById.set(rootId, topLeftFromCenter(targetCenter, rootNode.width, rootNode.height));
    if (islandIds.length <= 1) return;

    layoutPolarTree({
      nodeId: rootId,
      outboundTheta: theta,
      children: buildChildrenMap([...treeEdges]),
      nodesById,
      positionById,
      ringThetas: [],
      isRoot: false,
      spacing,
      weightOf,
    });
  },
};
