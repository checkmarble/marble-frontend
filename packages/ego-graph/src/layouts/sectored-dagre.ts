import { rankdirAxisAngle, rankdirFromAngle, rotateOffset, sectorAngles } from '../geometry/angles';
import { centerOf, topLeftFromCenter } from '../geometry/box';
import { computeArcRadius, computeRingRadius, lateralHalfExtent } from '../geometry/extents';
import { descendantCount, greedySlotOrder } from '../geometry/order';
import { resolveOptions } from '../options';
import { buildChildrenMap, buildSpanningTree } from '../tree';
import type { EgoGraph, LayoutEdge, LayoutNode, LayoutOptions, Point, Positions, SpacingOptions } from '../types';
import { dagrePocketStrategy, layoutSubtreeLocal } from './dagre-subtree';
import type { PocketStrategy } from './pocket-strategy';
import { layoutSatellitePockets } from './pockets';

/** Above this many children, a node splits them across sectors instead of one pocket. */
const BUSHY_THRESHOLD = 5;

function shallowEdges(parentId: string, kidIds: string[]): LayoutEdge[] {
  return kidIds.map((target) => ({ source: parentId, target }));
}

type ShallowPocketArgs = {
  parentId: string;
  kidIds: string[];
  theta: number;
  nodesById: Map<string, LayoutNode>;
  positionById: Map<string, Point>;
  spacing: Required<SpacingOptions>;
  /** Push the pocket out so the innermost child clears this radius from the parent. */
  ringRadius?: number;
};

/**
 * Place direct children with a shallow Dagre pocket, rotated so the rank axis
 * aligns with `theta`. Returns the pocket's lateral half-extent.
 */
function placeShallowPocket(args: ShallowPocketArgs): number {
  const { parentId, kidIds, theta, nodesById, positionById, spacing, ringRadius } = args;
  if (kidIds.length === 0) return 0;

  const parentPos = positionById.get(parentId);
  const parentNode = nodesById.get(parentId);
  if (!parentPos || !parentNode) return 0;

  const parentCenter = centerOf(parentNode, parentPos);

  const rankdir = rankdirFromAngle(theta);
  const ids = [parentId, ...kidIds];
  const local = layoutSubtreeLocal(ids, shallowEdges(parentId, kidIds), nodesById, rankdir, spacing);
  const lateralHalf = lateralHalfExtent(ids, local, nodesById, parentId, rankdir);

  const localParent = local.get(parentId);
  if (!localParent) return lateralHalf;
  const localParentCenter = {
    x: localParent.x + parentNode.width / 2,
    y: localParent.y + parentNode.height / 2,
  };

  const delta = theta - rankdirAxisAngle(rankdir);
  const unit = { x: Math.cos(theta), y: Math.sin(theta) };

  const placements: Array<{ id: string; offset: Point }> = [];
  let minProj = Infinity;

  for (const kidId of kidIds) {
    const localKid = local.get(kidId);
    const kidNode = nodesById.get(kidId);
    if (!localKid || !kidNode) continue;
    const localKidCenter = {
      x: localKid.x + kidNode.width / 2,
      y: localKid.y + kidNode.height / 2,
    };
    const rotated = rotateOffset(localKidCenter.x - localParentCenter.x, localKidCenter.y - localParentCenter.y, delta);
    minProj = Math.min(minProj, rotated.x * unit.x + rotated.y * unit.y);
    placements.push({ id: kidId, offset: rotated });
  }

  const push = ringRadius != null && Number.isFinite(minProj) ? Math.max(0, ringRadius - minProj) : 0;

  for (const { id, offset } of placements) {
    const kidNode = nodesById.get(id)!;
    const cx = parentCenter.x + offset.x + push * unit.x;
    const cy = parentCenter.y + offset.y + push * unit.y;
    positionById.set(id, topLeftFromCenter({ x: cx, y: cy }, kidNode.width, kidNode.height));
  }

  return lateralHalf;
}

type SectorTreeArgs = {
  nodeId: string;
  outboundTheta: number | null;
  children: Map<string, string[]>;
  nodesById: Map<string, LayoutNode>;
  positionById: Map<string, Point>;
  ringThetas: number[];
  isRoot: boolean;
  spacing: Required<SpacingOptions>;
  weightOf: (id: string) => number;
};

function layoutSectorTree(args: SectorTreeArgs): void {
  const { nodeId, outboundTheta, children, nodesById, positionById, ringThetas, isRoot, spacing, weightOf } = args;
  const kidIds = children.get(nodeId) ?? [];
  const n = kidIds.length;
  if (n === 0) return;

  if (n < BUSHY_THRESHOLD) {
    placeShallowPocket({
      parentId: nodeId,
      kidIds,
      theta: outboundTheta ?? Math.PI / 2, // straight down at the root
      nodesById,
      positionById,
      spacing,
    });
  } else {
    const sectorCount = Math.ceil(n / BUSHY_THRESHOLD);
    const ordered = greedySlotOrder(kidIds.map((id) => ({ id, weight: descendantCount(children, id, weightOf) })));
    const sectors: string[][] = Array.from({ length: sectorCount }, () => []);
    ordered.forEach((id, i) => {
      sectors[i % sectorCount]!.push(id);
    });

    const thetas = sectorAngles(sectorCount, outboundTheta);
    const closed = outboundTheta == null;

    // Measure every sector pocket first, then pick one shared clearance radius.
    const lateralHalves: number[] = [];
    for (let s = 0; s < sectorCount; s++) {
      const kids = sectors[s]!;
      const rankdir = rankdirFromAngle(thetas[s]!);
      const ids = [nodeId, ...kids];
      const local = layoutSubtreeLocal(ids, shallowEdges(nodeId, kids), nodesById, rankdir, spacing);
      lateralHalves.push(lateralHalfExtent(ids, local, nodesById, nodeId, rankdir));
    }

    const radius = closed
      ? computeRingRadius(lateralHalves, spacing)
      : computeArcRadius(lateralHalves, Math.PI / sectorCount, false, spacing);

    for (let s = 0; s < sectorCount; s++) {
      placeShallowPocket({
        parentId: nodeId,
        kidIds: sectors[s]!,
        theta: thetas[s]!,
        nodesById,
        positionById,
        spacing,
        ringRadius: radius,
      });
    }
  }

  const parentPos = positionById.get(nodeId);
  const parentNode = nodesById.get(nodeId);
  if (!parentPos || !parentNode) return;
  const parentCenter = centerOf(parentNode, parentPos);

  for (const kidId of kidIds) {
    const kidPos = positionById.get(kidId);
    const kidNode = nodesById.get(kidId);
    if (!kidPos || !kidNode) continue;
    const kidCenter = centerOf(kidNode, kidPos);
    const kidTheta = Math.atan2(kidCenter.y - parentCenter.y, kidCenter.x - parentCenter.x);
    if (isRoot) ringThetas.push(kidTheta);

    layoutSectorTree({
      nodeId: kidId,
      outboundTheta: kidTheta,
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

/** Sectored islands under each satellite — the same rules as the main tree. */
const sectoredPocketStrategy: PocketStrategy = {
  // Fanning still uses the honest Dagre measure.
  measureLateralHalf: dagrePocketStrategy.measureLateralHalf,
  place({ islandIds, treeEdges, rootId, targetCenter, theta, nodesById, positionById, spacing, weightOf }) {
    const rootNode = nodesById.get(rootId);
    if (!rootNode) return;

    positionById.set(rootId, topLeftFromCenter(targetCenter, rootNode.width, rootNode.height));
    if (islandIds.length <= 1) return;

    layoutSectorTree({
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

/**
 * Recursive sectors of shallow Dagre pockets. Every node lays its own children
 * out, splitting them across sectors once there are enough to be unwieldy.
 *
 * Balances better than {@link radialDagre} on wide, shallow graphs, where one
 * Dagre pass per level-1 branch would leave the ring lopsided.
 * Requires `@dagrejs/dagre`.
 */
export function sectoredDagre<N extends LayoutNode = LayoutNode, E extends LayoutEdge = LayoutEdge>(
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
  layoutSectorTree({
    nodeId: tree.root,
    outboundTheta: null,
    children: tree.children,
    nodesById,
    positionById,
    ringThetas,
    isRoot: true,
    spacing: resolved,
    weightOf,
  });

  layoutSatellitePockets({
    graph,
    tree,
    nodesById,
    positionById,
    rootCenter,
    ringThetas,
    strategy: sectoredPocketStrategy,
    options: resolved,
  });

  return positionById;
}
