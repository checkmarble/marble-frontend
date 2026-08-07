import Dagre from '@dagrejs/dagre';
import { DEFAULT_NODE_WIDTH, nodeCenter, nodeMeasuredSize, type Point, topLeftFromCenter } from './graph-handles';
import { type GraphRfEdge, type GraphRfNode, isMatchEdge } from './graph-rf-types';
import { bfsTreeEdges, buildChildrenMap, buildUndirectedAdjacency, type SimpleEdge } from './graph-traversal';

export const NODESEP = 80;
export const RANKSEP = 100;
/** Minimum ring radius so L1 nodes clear the start node. */
export const RING_RADIUS_MIN = 220;
/** Extra space between adjacent subtree lateral extents. */
export const RING_PADDING = 60;
/**
 * Preferred connector angles within this circular distance are treated as the
 * same "side" and fanned on an outer arc instead of stacking on one ray.
 */
const CONNECTOR_CLUSTER_GAP = Math.PI / 3;
/** Minimum angular separation between fanned connectors on the outer arc. */
const CONNECTOR_MIN_ANGLE_GAP = Math.PI / 12;

export type RankDir = 'TB' | 'BT' | 'LR' | 'RL';

/** A cluster chip stands in for the whole branch it folded away. */
export function nodeWeight(node: GraphRfNode | undefined): number {
  return node?.type === 'cluster' ? node.data.nodeCount : 1;
}

/** Subtree size including `id` itself, counting a chip as the branch it represents. */
export function descendantCount(
  children: Map<string, string[]>,
  id: string,
  nodesById: Map<string, GraphRfNode>,
): number {
  let count = nodeWeight(nodesById.get(id));
  for (const child of children.get(id) ?? []) {
    count += descendantCount(children, child, nodesById);
  }
  return count;
}

/**
 * Heaviest-first greedy: each item goes in the open slot whose nearest
 * already-placed neighbors have the smallest combined weight.
 */
export function greedySlotOrder(items: Array<{ id: string; weight: number }>): string[] {
  const n = items.length;
  if (n === 0) return [];

  const slots: Array<string | null> = Array.from({ length: n }, () => null);
  const slotWeight = Array.from({ length: n }, () => 0);
  const sorted = [...items].sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));

  for (const item of sorted) {
    let bestSlot = -1;
    let bestScore = Infinity;

    for (let s = 0; s < n; s++) {
      if (slots[s] !== null) continue;

      let leftW = 0;
      let leftDist = 0;
      let rightW = 0;
      let rightDist = 0;
      for (let d = 1; d < n; d++) {
        const left = (s - d + n) % n;
        if (slots[left] !== null) {
          leftW = slotWeight[left]!;
          leftDist = d;
          break;
        }
      }
      for (let d = 1; d < n; d++) {
        const right = (s + d) % n;
        if (slots[right] !== null) {
          rightW = slotWeight[right]!;
          rightDist = d;
          break;
        }
      }

      // Distance-weighted so opposite empty slots beat adjacent ones when only
      // one neighbor is placed (plain sum would tie and pick the next index).
      const score = (leftDist > 0 ? leftW / leftDist : 0) + (rightDist > 0 ? rightW / rightDist : 0);
      if (score < bestScore || (score === bestScore && (bestSlot < 0 || s < bestSlot))) {
        bestScore = score;
        bestSlot = s;
      }
    }

    slots[bestSlot] = item.id;
    slotWeight[bestSlot] = item.weight;
  }

  return slots as string[];
}

/** Slot angle: 12 o'clock, increasing clockwise (screen y-down). */
export function slotAngle(slotIndex: number, slotCount: number): number {
  return Math.PI / 2 + (2 * Math.PI * slotIndex) / slotCount;
}

/** Normalize angle into (-π, π]. */
export function normalizeAngle(theta: number): number {
  let a = theta;
  while (a <= -Math.PI) a += 2 * Math.PI;
  while (a > Math.PI) a -= 2 * Math.PI;
  return a;
}

/** Smallest signed delta from `from` to `to` in (-π, π]. */
export function angleDelta(from: number, to: number): number {
  return normalizeAngle(to - from);
}

/** Outward Dagre rankdir from angle (nearest cardinal axis). */
export function rankdirFromAngle(theta: number): RankDir {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  if (Math.abs(cos) >= Math.abs(sin)) {
    return cos >= 0 ? 'LR' : 'RL';
  }
  return sin >= 0 ? 'TB' : 'BT';
}

/**
 * Layout a subtree with Dagre. Positions are React Flow top-left.
 * Returns a map of node id → position for every id in `subtreeIds`.
 */
export function layoutSubtreeLocal(
  subtreeIds: string[],
  treeEdges: SimpleEdge[],
  nodesById: Map<string, GraphRfNode>,
  rankdir: RankDir,
): Map<string, Point> {
  const idSet = new Set(subtreeIds);
  const positions = new Map<string, Point>();

  if (subtreeIds.length === 1) {
    const id = subtreeIds[0]!;
    const node = nodesById.get(id);
    if (!node) return positions;
    const { width, height } = nodeMeasuredSize(node);
    positions.set(id, topLeftFromCenter({ x: 0, y: 0 }, width, height));
    return positions;
  }

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir,
    nodesep: NODESEP,
    ranksep: RANKSEP,
  });

  for (const id of subtreeIds) {
    const node = nodesById.get(id);
    if (!node) continue;
    const { width, height } = nodeMeasuredSize(node);
    g.setNode(id, { width, height });
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
    const { width, height } = nodeMeasuredSize(node);
    positions.set(id, {
      x: positioned.x - width / 2,
      y: positioned.y - height / 2,
    });
  }

  return positions;
}

/** Half-extent of the subtree perpendicular to the outward (rank) axis, from the root center. */
export function lateralHalfExtent(
  subtreeIds: string[],
  positions: Map<string, Point>,
  nodesById: Map<string, GraphRfNode>,
  rootId: string,
  rankdir: RankDir,
): number {
  const rootPos = positions.get(rootId);
  const rootNode = nodesById.get(rootId);
  if (!rootPos || !rootNode) return DEFAULT_NODE_WIDTH / 2;

  const rootSize = nodeMeasuredSize(rootNode);
  const rootCenter = {
    x: rootPos.x + rootSize.width / 2,
    y: rootPos.y + rootSize.height / 2,
  };

  const horizontal = rankdir === 'LR' || rankdir === 'RL';
  let half = horizontal ? rootSize.height / 2 : rootSize.width / 2;

  for (const id of subtreeIds) {
    const pos = positions.get(id);
    const node = nodesById.get(id);
    if (!pos || !node) continue;
    const { width, height } = nodeMeasuredSize(node);
    const cx = pos.x + width / 2;
    const cy = pos.y + height / 2;
    if (horizontal) {
      half = Math.max(half, Math.abs(cy - rootCenter.y) + height / 2);
    } else {
      half = Math.max(half, Math.abs(cx - rootCenter.x) + width / 2);
    }
  }

  return half;
}

/**
 * Ring radius for `n` items spaced over a full circle (adjacent gap `2π/n`).
 */
export function computeRingRadius(lateralHalves: number[]): number {
  const n = lateralHalves.length;
  if (n <= 1) return RING_RADIUS_MIN;
  return computeArcRadius(lateralHalves, (2 * Math.PI) / n, true);
}

/**
 * Radius so adjacent lateral extents clear each other when placed with the
 * given angular gap between neighbors. When `closed` is true the first and
 * last items are also neighbors (full ring).
 */
export function computeArcRadius(lateralHalves: number[], adjacentGap: number, closed: boolean): number {
  const n = lateralHalves.length;
  if (n <= 1) return RING_RADIUS_MIN;

  let r = RING_RADIUS_MIN;
  const sinHalf = Math.sin(adjacentGap / 2);
  if (sinHalf <= 1e-6) return r;

  const pairCount = closed ? n : n - 1;
  for (let i = 0; i < pairCount; i++) {
    const j = (i + 1) % n;
    const needed = (lateralHalves[i]! + lateralHalves[j]! + RING_PADDING) / (2 * sinHalf);
    r = Math.max(r, needed);
  }
  return r;
}

/**
 * Preferred pocket angle for a connector: direction from the start center toward
 * the centroid of already-placed match neighbors.
 *
 * Returns `null` when there are no placed anchors (caller should use
 * {@link largestFreeGapAngle}).
 */
export function preferredConnectorAngle(startCenter: Point, placedNeighborCenters: Point[]): number | null {
  if (placedNeighborCenters.length === 0) return null;

  let sx = 0;
  let sy = 0;
  for (const p of placedNeighborCenters) {
    sx += p.x;
    sy += p.y;
  }
  const cx = sx / placedNeighborCenters.length;
  const cy = sy / placedNeighborCenters.length;
  return Math.atan2(cy - startCenter.y, cx - startCenter.x);
}

/**
 * Angle in the middle of the largest gap between existing L1 slot angles.
 * Used when a connector has no placed match anchors. Falls back to east (0)
 * when there are no L1 slots to avoid.
 */
export function largestFreeGapAngle(l1Thetas: number[]): number {
  if (l1Thetas.length === 0) return 0;

  const sorted = [...l1Thetas].map(normalizeAngle).sort((a, b) => a - b);
  let bestMid = sorted[0]!;
  let bestGap = -Infinity;

  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const next = i + 1 < sorted.length ? sorted[i + 1]! : sorted[0]! + 2 * Math.PI;
    const gap = next - cur;
    if (gap > bestGap) {
      bestGap = gap;
      bestMid = normalizeAngle(cur + gap / 2);
    }
  }

  return bestMid;
}

/**
 * Fan connectors that share a preferred side onto an outer arc.
 *
 * 1. Sort by preferred angle
 * 2. Cluster consecutive items within {@link CONNECTOR_CLUSTER_GAP}
 * 3. Within each cluster, spread around the circular mean with separation
 *    driven by lateral half-extents at `radius` (same geometric idea as the
 *    L1 ring radius computation)
 */
export function fanConnectorAngles(
  items: Array<{ id: string; preferredTheta: number; lateralHalf: number }>,
  radius: number,
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
    if (gap > CONNECTOR_CLUSTER_GAP) {
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
          ? (cluster[i]!.lateralHalf + cluster[i + 1]!.lateralHalf + RING_PADDING) / radius
          : CONNECTOR_MIN_ANGLE_GAP;
      separations.push(Math.max(CONNECTOR_MIN_ANGLE_GAP, needed));
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
 * Claim the still-unplaced connected component reachable from `rootId` via
 * `adj`, removing claimed ids from `unplaced`. First caller wins (stable pivot
 * id order is the caller's responsibility).
 *
 * `skipIds` (typically other pivot ids) are never entered — otherwise a shared
 * match-only neighbor would let the first connector swallow sibling connectors.
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
      // Other connectors stay for their own claim pass.
      if (skipIds.has(nxt) && nxt !== rootId) continue;
      unplaced.delete(nxt);
      queue.push(nxt);
    }
  }

  return claimed;
}

/**
 * Radius of the outer connector pocket: clears the axis-aligned bbox of already
 * placed (person) nodes from the start center, plus padding.
 */
export function computeConnectorPocketRadius(
  placedCentersWithSize: Array<{ center: Point; width: number; height: number }>,
  startCenter: Point,
): number {
  let r = RING_RADIUS_MIN;
  for (const { center, width, height } of placedCentersWithSize) {
    const dx = Math.abs(center.x - startCenter.x) + width / 2;
    const dy = Math.abs(center.y - startCenter.y) + height / 2;
    // Conservative clearance: distance to farthest bbox corner from start.
    const dist = Math.hypot(center.x - startCenter.x, center.y - startCenter.y);
    const halfDiag = Math.hypot(width / 2, height / 2);
    r = Math.max(r, dist + halfDiag + RING_PADDING, dx + RING_PADDING, dy + RING_PADDING);
  }
  return r;
}

/**
 * Translate a locally-laid-out subtree so `rootId`'s center lands on `targetCenter`.
 */
export function placeSubtreeAt(
  subtreeIds: string[],
  localPositions: Map<string, Point>,
  nodesById: Map<string, GraphRfNode>,
  rootId: string,
  targetCenter: Point,
  positionById: Map<string, Point>,
): void {
  const localRoot = localPositions.get(rootId);
  const rootNode = nodesById.get(rootId);
  if (!localRoot || !rootNode) return;

  const rootSize = nodeMeasuredSize(rootNode);
  const localRootCenter = {
    x: localRoot.x + rootSize.width / 2,
    y: localRoot.y + rootSize.height / 2,
  };
  const dx = targetCenter.x - localRootCenter.x;
  const dy = targetCenter.y - localRootCenter.y;

  for (const nodeId of subtreeIds) {
    const local = localPositions.get(nodeId);
    if (!local) continue;
    positionById.set(nodeId, { x: local.x + dx, y: local.y + dy });
  }
}

/** How to size and place a connector's unplaced island under its pivot. */
export type ConnectorIslandLayout = {
  measureLateralHalf: (args: {
    islandIds: string[];
    treeEdges: SimpleEdge[];
    rootId: string;
    preferredTheta: number;
    nodesById: Map<string, GraphRfNode>;
  }) => number;
  place: (args: {
    islandIds: string[];
    treeEdges: SimpleEdge[];
    rootId: string;
    targetCenter: Point;
    theta: number;
    nodesById: Map<string, GraphRfNode>;
    positionById: Map<string, Point>;
  }) => void;
};

/** Default: Dagre subtree translated so the pivot sits on the outer pocket. */
export const dagreConnectorIslandLayout: ConnectorIslandLayout = {
  measureLateralHalf({ islandIds, treeEdges, rootId, preferredTheta, nodesById }) {
    const rankdir = rankdirFromAngle(preferredTheta);
    const localPositions = layoutSubtreeLocal(islandIds, treeEdges, nodesById, rankdir);
    return lateralHalfExtent(islandIds, localPositions, nodesById, rootId, rankdir);
  },
  place({ islandIds, treeEdges, rootId, targetCenter, theta, nodesById, positionById }) {
    const localPositions = layoutSubtreeLocal(islandIds, treeEdges, nodesById, rankdirFromAngle(theta));
    placeSubtreeAt(islandIds, localPositions, nodesById, rootId, targetCenter, positionById);
  },
};

/** Sector center angles: full circle when `outboundTheta` is null, else outward hemisphere. */
export function polarSectorAngles(sectorCount: number, outboundTheta: number | null): number[] {
  if (sectorCount <= 0) return [];
  if (outboundTheta == null) {
    return Array.from({ length: sectorCount }, (_, i) => slotAngle(i, sectorCount));
  }
  const span = Math.PI;
  const start = outboundTheta - span / 2;
  const width = span / sectorCount;
  return Array.from({ length: sectorCount }, (_, i) => start + width * (i + 0.5));
}

/** Half-extent of an axis-aligned box perpendicular to angle `theta`. */
export function aabbHalfPerp(width: number, height: number, theta: number): number {
  return (width / 2) * Math.abs(Math.sin(theta)) + (height / 2) * Math.abs(Math.cos(theta));
}

/** Half-extent of an axis-aligned box along angle `theta`. */
export function aabbHalfRadial(width: number, height: number, theta: number): number {
  return (width / 2) * Math.abs(Math.cos(theta)) + (height / 2) * Math.abs(Math.sin(theta));
}

/**
 * Pure polar flower-petal placement: 360° at a root (`outboundTheta == null`),
 * else 180° hemisphere centered on the outbound ray.
 */
export function layoutPolarTreeRecursive(args: {
  nodeId: string;
  outboundTheta: number | null;
  children: Map<string, string[]>;
  nodesById: Map<string, GraphRfNode>;
  positionById: Map<string, Point>;
  l1Thetas: number[];
  isStart: boolean;
}): void {
  const { nodeId, outboundTheta, children, nodesById, positionById, l1Thetas, isStart } = args;
  const kidIds = children.get(nodeId) ?? [];
  const n = kidIds.length;
  if (n === 0) return;

  const parentPos = positionById.get(nodeId);
  const parentNode = nodesById.get(nodeId);
  if (!parentPos || !parentNode) return;

  const parentSize = nodeMeasuredSize(parentNode);
  const parentCenter = nodeCenter(parentNode, parentPos);

  const weighted = kidIds.map((id) => ({
    id,
    weight: descendantCount(children, id, nodesById),
  }));
  const ordered = greedySlotOrder(weighted);
  const thetas = polarSectorAngles(n, outboundTheta);
  const closed = outboundTheta == null;

  const lateralHalves = ordered.map((id, i) => {
    const kidNode = nodesById.get(id)!;
    const { width, height } = nodeMeasuredSize(kidNode);
    return aabbHalfPerp(width, height, thetas[i]!);
  });

  const siblingRadius = closed ? computeRingRadius(lateralHalves) : computeArcRadius(lateralHalves, Math.PI / n, false);

  for (let i = 0; i < ordered.length; i++) {
    const kidId = ordered[i]!;
    const theta = thetas[i]!;
    const kidNode = nodesById.get(kidId)!;
    const kidSize = nodeMeasuredSize(kidNode);
    const parentClearance =
      aabbHalfRadial(parentSize.width, parentSize.height, theta) +
      aabbHalfRadial(kidSize.width, kidSize.height, theta) +
      RING_PADDING;
    const r = Math.max(siblingRadius, parentClearance);
    const cx = parentCenter.x + r * Math.cos(theta);
    const cy = parentCenter.y + r * Math.sin(theta);
    positionById.set(kidId, topLeftFromCenter({ x: cx, y: cy }, kidSize.width, kidSize.height));

    if (isStart) l1Thetas.push(theta);

    layoutPolarTreeRecursive({
      nodeId: kidId,
      outboundTheta: theta,
      children,
      nodesById,
      positionById,
      l1Thetas,
      isStart: false,
    });
  }
}

/** Polar petal islands under each connector (same pattern as the radial person tree). */
export const radialConnectorIslandLayout: ConnectorIslandLayout = {
  measureLateralHalf({ islandIds, preferredTheta, nodesById }) {
    let half = 0;
    for (const id of islandIds) {
      const node = nodesById.get(id);
      if (!node) continue;
      const { width, height } = nodeMeasuredSize(node);
      half = Math.max(half, aabbHalfPerp(width, height, preferredTheta));
    }
    return half;
  },
  place({ islandIds, treeEdges, rootId, targetCenter, theta, nodesById, positionById }) {
    const rootNode = nodesById.get(rootId);
    if (!rootNode) return;

    const rootSize = nodeMeasuredSize(rootNode);
    positionById.set(rootId, topLeftFromCenter(targetCenter, rootSize.width, rootSize.height));

    if (islandIds.length <= 1) return;

    layoutPolarTreeRecursive({
      nodeId: rootId,
      outboundTheta: theta,
      children: buildChildrenMap(treeEdges),
      nodesById,
      positionById,
      l1Thetas: [],
      isStart: false,
    });
  },
};

/**
 * Outer-arc side pockets for match/connector (pivot) nodes.
 * Mutates `positionById` in place.
 */
export function layoutConnectorPockets(args: {
  nodes: GraphRfNode[];
  edges: GraphRfEdge[];
  personIds: string[];
  pivotIds: string[];
  nodesById: Map<string, GraphRfNode>;
  positionById: Map<string, Point>;
  startCenter: Point;
  l1Thetas: number[];
  /** Defaults to {@link dagreConnectorIslandLayout}. */
  islandLayout?: ConnectorIslandLayout;
}): void {
  const {
    nodes,
    edges,
    personIds,
    pivotIds,
    nodesById,
    positionById,
    startCenter,
    l1Thetas,
    islandLayout = dagreConnectorIslandLayout,
  } = args;
  if (pivotIds.length === 0) return;

  const allIds = nodes.map((n) => n.id);
  const fullAdj = buildUndirectedAdjacency(
    allIds,
    edges.map((e) => ({ source: e.source, target: e.target })),
  );

  const matchAdj = new Map<string, string[]>();
  for (const id of pivotIds) {
    matchAdj.set(id, []);
  }
  for (const edge of edges) {
    if (!isMatchEdge(edge)) continue;
    if (pivotIds.includes(edge.source)) {
      matchAdj.get(edge.source)!.push(edge.target);
    }
    if (pivotIds.includes(edge.target)) {
      matchAdj.get(edge.target)!.push(edge.source);
    }
  }

  const unplaced = new Set(allIds.filter((id) => !positionById.has(id)));
  const islands = new Map<string, string[]>();
  const pivotIdSet = new Set(pivotIds);

  for (const pivotId of pivotIds) {
    if (!unplaced.has(pivotId)) continue;
    islands.set(pivotId, claimUnplacedComponent(pivotId, unplaced, fullAdj, pivotIdSet));
  }

  const placedPersonBoxes: Array<{ center: Point; width: number; height: number }> = [];
  for (const id of personIds) {
    const pos = positionById.get(id);
    const node = nodesById.get(id);
    if (!pos || !node) continue;
    const size = nodeMeasuredSize(node);
    placedPersonBoxes.push({ center: nodeCenter(node, pos), width: size.width, height: size.height });
  }
  const pocketRadius = computeConnectorPocketRadius(placedPersonBoxes, startCenter);

  type IslandPrep = {
    id: string;
    preferredTheta: number;
    islandIds: string[];
    treeEdges: SimpleEdge[];
    lateralHalf: number;
  };

  const prepared: IslandPrep[] = [];
  for (const pivotId of pivotIds) {
    const islandIds = islands.get(pivotId);
    if (!islandIds || islandIds.length === 0) continue;

    const placedNeighborCenters: Point[] = [];
    for (const neighborId of matchAdj.get(pivotId) ?? []) {
      const pos = positionById.get(neighborId);
      const node = nodesById.get(neighborId);
      if (!pos || !node) continue;
      placedNeighborCenters.push(nodeCenter(node, pos));
    }

    const preferred = preferredConnectorAngle(startCenter, placedNeighborCenters) ?? largestFreeGapAngle(l1Thetas);

    const islandTree = bfsTreeEdges(pivotId, fullAdj, new Set(islandIds));
    const lateralHalf = islandLayout.measureLateralHalf({
      islandIds,
      treeEdges: islandTree,
      rootId: pivotId,
      preferredTheta: preferred,
      nodesById,
    });

    prepared.push({
      id: pivotId,
      preferredTheta: preferred,
      islandIds,
      treeEdges: islandTree,
      lateralHalf,
    });
  }

  const finalAngles = fanConnectorAngles(
    prepared.map((p) => ({
      id: p.id,
      preferredTheta: p.preferredTheta,
      lateralHalf: p.lateralHalf,
    })),
    pocketRadius,
  );

  for (const prep of prepared) {
    const theta = finalAngles.get(prep.id) ?? prep.preferredTheta;
    islandLayout.place({
      islandIds: prep.islandIds,
      treeEdges: prep.treeEdges,
      rootId: prep.id,
      targetCenter: { x: pocketRadius * Math.cos(theta), y: pocketRadius * Math.sin(theta) },
      theta,
      nodesById,
      positionById,
    });
  }
}
