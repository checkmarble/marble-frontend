import { nodeCenter, nodeMeasuredSize, type Point, topLeftFromCenter, withBestHandles } from './graph-handles';
import { type GraphRfEdge, type GraphRfNode, isLinkEdge } from './graph-rf-types';
import { bfsSpanningTreeEdges, buildChildrenMap } from './graph-traversal';
import {
  computeArcRadius,
  computeRingRadius,
  descendantCount,
  greedySlotOrder,
  layoutConnectorPockets,
  RING_PADDING,
  slotAngle,
} from './layout-graph-shared';

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

/** Half-extent of an axis-aligned box perpendicular to angle `theta`. */
function aabbHalfPerp(width: number, height: number, theta: number): number {
  return (width / 2) * Math.abs(Math.sin(theta)) + (height / 2) * Math.abs(Math.cos(theta));
}

/** Half-extent of an axis-aligned box along angle `theta`. */
function aabbHalfRadial(width: number, height: number, theta: number): number {
  return (width / 2) * Math.abs(Math.cos(theta)) + (height / 2) * Math.abs(Math.sin(theta));
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
  const thetas = sectorAngles(n, outboundTheta);
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

    layoutNodeRecursive({
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

/**
 * Pure polar “flower petal” layout for the start's **link** neighborhood,
 * then the shared outer-arc connector pockets. No Dagre.
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
