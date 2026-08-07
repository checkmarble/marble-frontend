import { nodeCenter, nodeMeasuredSize, type Point, topLeftFromCenter, withBestHandles } from './graph-handles';
import { type GraphRfEdge, type GraphRfNode, isLinkEdge } from './graph-rf-types';
import { bfsSpanningTreeEdges, buildChildrenMap, type SimpleEdge } from './graph-traversal';
import {
  computeArcRadius,
  computeRingRadius,
  descendantCount,
  greedySlotOrder,
  lateralHalfExtent,
  layoutConnectorPockets,
  layoutSubtreeLocal,
  type RankDir,
  rankdirFromAngle,
  slotAngle,
} from './layout-graph-shared';

const BUSHY_THRESHOLD = 3;

function rankdirAxisAngle(rankdir: RankDir): number {
  switch (rankdir) {
    case 'LR':
      return 0;
    case 'TB':
      return Math.PI / 2;
    case 'RL':
      return Math.PI;
    case 'BT':
      return -Math.PI / 2;
  }
}

function rotateOffset(dx: number, dy: number, delta: number): Point {
  const c = Math.cos(delta);
  const s = Math.sin(delta);
  return { x: dx * c - dy * s, y: dx * s + dy * c };
}

/** Sector center angles: full circle at the start, outward hemisphere when nested. */
function sectorAngles(sectorCount: number, outboundTheta: number | null): number[] {
  if (sectorCount <= 0) return [];
  if (outboundTheta == null) {
    return Array.from({ length: sectorCount }, (_, i) => slotAngle(i, sectorCount));
  }
  const span = Math.PI;
  const start = outboundTheta - span / 2;
  const width = span / sectorCount;
  return Array.from({ length: sectorCount }, (_, i) => start + width * (i + 0.5));
}

function shallowEdges(parentId: string, kidIds: string[]): SimpleEdge[] {
  return kidIds.map((target) => ({ source: parentId, target }));
}

/**
 * Place direct children with a shallow Dagre pocket, rotated so the rank axis
 * aligns with `theta`. Optionally push the pocket outward so the innermost
 * child sits at least `ringRadius` from the parent along that ray.
 */
function placeShallowPocket(args: {
  parentId: string;
  kidIds: string[];
  theta: number;
  nodesById: Map<string, GraphRfNode>;
  positionById: Map<string, Point>;
  ringRadius?: number;
}): number {
  const { parentId, kidIds, theta, nodesById, positionById, ringRadius } = args;
  if (kidIds.length === 0) return 0;

  const parentPos = positionById.get(parentId);
  const parentNode = nodesById.get(parentId);
  if (!parentPos || !parentNode) return 0;

  const parentSize = nodeMeasuredSize(parentNode);
  const parentCenter = nodeCenter(parentNode, parentPos);

  const rankdir = rankdirFromAngle(theta);
  const ids = [parentId, ...kidIds];
  const local = layoutSubtreeLocal(ids, shallowEdges(parentId, kidIds), nodesById, rankdir);
  const lateralHalf = lateralHalfExtent(ids, local, nodesById, parentId, rankdir);

  const localParent = local.get(parentId);
  if (!localParent) return lateralHalf;
  const localParentCenter = {
    x: localParent.x + parentSize.width / 2,
    y: localParent.y + parentSize.height / 2,
  };

  const delta = theta - rankdirAxisAngle(rankdir);
  const unit = { x: Math.cos(theta), y: Math.sin(theta) };

  type KidPlacement = { id: string; offset: Point };
  const placements: KidPlacement[] = [];
  let minProj = Infinity;

  for (const kidId of kidIds) {
    const localKid = local.get(kidId);
    const kidNode = nodesById.get(kidId);
    if (!localKid || !kidNode) continue;
    const kidSize = nodeMeasuredSize(kidNode);
    const localKidCenter = {
      x: localKid.x + kidSize.width / 2,
      y: localKid.y + kidSize.height / 2,
    };
    const rotated = rotateOffset(localKidCenter.x - localParentCenter.x, localKidCenter.y - localParentCenter.y, delta);
    const proj = rotated.x * unit.x + rotated.y * unit.y;
    minProj = Math.min(minProj, proj);
    placements.push({ id: kidId, offset: rotated });
  }

  const push = ringRadius != null && Number.isFinite(minProj) ? Math.max(0, ringRadius - minProj) : 0;

  for (const { id, offset } of placements) {
    const kidNode = nodesById.get(id)!;
    const { width, height } = nodeMeasuredSize(kidNode);
    const cx = parentCenter.x + offset.x + push * unit.x;
    const cy = parentCenter.y + offset.y + push * unit.y;
    positionById.set(id, topLeftFromCenter({ x: cx, y: cy }, width, height));
  }

  return lateralHalf;
}

function layoutNodeRecursive(args: {
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

  if (n < BUSHY_THRESHOLD) {
    const theta = outboundTheta ?? Math.PI / 2; // TB at start
    placeShallowPocket({
      parentId: nodeId,
      kidIds,
      theta,
      nodesById,
      positionById,
    });
  } else {
    const sectorCount = Math.ceil(n / BUSHY_THRESHOLD);
    const weighted = kidIds.map((id) => ({
      id,
      weight: descendantCount(children, id, nodesById),
    }));
    const ordered = greedySlotOrder(weighted);
    const sectors: string[][] = Array.from({ length: sectorCount }, () => []);
    ordered.forEach((id, i) => {
      sectors[i % sectorCount]!.push(id);
    });

    const thetas = sectorAngles(sectorCount, outboundTheta);
    const closed = outboundTheta == null;

    // Measure each sector pocket, then choose a shared clearance radius.
    const lateralHalves: number[] = [];
    for (let s = 0; s < sectorCount; s++) {
      const kids = sectors[s]!;
      const theta = thetas[s]!;
      const rankdir = rankdirFromAngle(theta);
      const ids = [nodeId, ...kids];
      const local = layoutSubtreeLocal(ids, shallowEdges(nodeId, kids), nodesById, rankdir);
      lateralHalves.push(lateralHalfExtent(ids, local, nodesById, nodeId, rankdir));
    }

    const radius = closed
      ? computeRingRadius(lateralHalves)
      : computeArcRadius(lateralHalves, Math.PI / sectorCount, false);

    for (let s = 0; s < sectorCount; s++) {
      placeShallowPocket({
        parentId: nodeId,
        kidIds: sectors[s]!,
        theta: thetas[s]!,
        nodesById,
        positionById,
        ringRadius: radius,
      });
    }
  }

  const parentPos = positionById.get(nodeId);
  const parentNode = nodesById.get(nodeId);
  if (!parentPos || !parentNode) return;
  const parentCenter = nodeCenter(parentNode, parentPos);

  for (const kidId of kidIds) {
    const kidPos = positionById.get(kidId);
    const kidNode = nodesById.get(kidId);
    if (!kidPos || !kidNode) continue;
    const kidCenter = nodeCenter(kidNode, kidPos);
    const kidTheta = Math.atan2(kidCenter.y - parentCenter.y, kidCenter.x - parentCenter.x);
    if (isStart) l1Thetas.push(kidTheta);

    layoutNodeRecursive({
      nodeId: kidId,
      outboundTheta: kidTheta,
      children,
      nodesById,
      positionById,
      l1Thetas,
      isStart: false,
    });
  }
}

/**
 * Recursive sector + shallow-Dagre layout for the start's **link** neighborhood,
 * then the shared outer-arc connector pockets.
 */
export function layoutGraphElements(
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
  startKey: string,
): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } {
  if (nodes.length === 0) return { nodes, edges };

  const nodesById = new Map(nodes.map((n) => [n.id, n]));
  const resolvedStart = nodesById.has(startKey) ? startKey : (nodes[0]?.id ?? '');
  if (!resolvedStart) return { nodes, edges };

  const personIds = nodes.filter((n) => n.type !== 'pivot').map((n) => n.id);
  const pivotIds = nodes
    .filter((n) => n.type === 'pivot')
    .map((n) => n.id)
    .sort((a, b) => a.localeCompare(b));
  const personIdSet = new Set(personIds);

  const linkEdges = edges.filter((e) => isLinkEdge(e) && personIdSet.has(e.source) && personIdSet.has(e.target));
  const treeEdges = bfsSpanningTreeEdges(personIds, linkEdges, resolvedStart);
  const children = buildChildrenMap(treeEdges);

  const positionById = new Map<string, Point>();
  const startNode = nodesById.get(resolvedStart)!;
  const startSize = nodeMeasuredSize(startNode);
  const startCenter = { x: 0, y: 0 };
  positionById.set(resolvedStart, topLeftFromCenter(startCenter, startSize.width, startSize.height));

  const l1Thetas: number[] = [];

  layoutNodeRecursive({
    nodeId: resolvedStart,
    outboundTheta: null,
    children,
    nodesById,
    positionById,
    l1Thetas,
    isStart: true,
  });

  layoutConnectorPockets({
    nodes,
    edges,
    personIds,
    pivotIds,
    nodesById,
    positionById,
    startCenter,
    l1Thetas,
  });

  const laidNodes = nodes.map((node) => {
    const pos = positionById.get(node.id);
    return pos ? { ...node, position: pos } : node;
  });

  return {
    nodes: laidNodes,
    edges: withBestHandles(laidNodes, edges),
  };
}
