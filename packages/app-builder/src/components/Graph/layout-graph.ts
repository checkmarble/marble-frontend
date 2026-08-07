import { nodeMeasuredSize, type Point, topLeftFromCenter, withBestHandles } from './graph-handles';
import { type GraphRfEdge, type GraphRfNode, isLinkEdge } from './graph-rf-types';
import { bfsSpanningTreeEdges, buildChildrenMap, collectSubtreeIds } from './graph-traversal';
import {
  claimUnplacedComponent,
  computeRingRadius,
  descendantCount,
  fanConnectorAngles,
  greedySlotOrder,
  largestFreeGapAngle,
  lateralHalfExtent,
  layoutConnectorPockets,
  layoutSubtreeLocal,
  normalizeAngle,
  placeSubtreeAt,
  preferredConnectorAngle,
  rankdirFromAngle,
  slotAngle,
} from './layout-graph-shared';

export {
  claimUnplacedComponent,
  fanConnectorAngles,
  greedySlotOrder,
  largestFreeGapAngle,
  normalizeAngle,
  preferredConnectorAngle,
  rankdirFromAngle,
  slotAngle,
};

/**
 * Radial L1 ring + per-subtree Dagre for the start's **link** neighborhood,
 * then outer-arc side pockets for match/connector (pivot) nodes.
 *
 * Match edges never participate in the person spanning tree — connectors are
 * cross-cutting and would otherwise warp the star (deep Dagre branches).
 * All edges remain for rendering / handle targeting.
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

  // Link-only edges among non-pivots drive the start-centered radial star.
  const linkEdges = edges.filter((e) => isLinkEdge(e) && personIdSet.has(e.source) && personIdSet.has(e.target));

  const treeEdges = bfsSpanningTreeEdges(personIds, linkEdges, resolvedStart);
  const children = buildChildrenMap(treeEdges);
  const l1Ids = children.get(resolvedStart) ?? [];

  const positionById = new Map<string, Point>();

  const startNode = nodesById.get(resolvedStart)!;
  const startSize = nodeMeasuredSize(startNode);
  const startCenter = { x: 0, y: 0 };
  positionById.set(resolvedStart, topLeftFromCenter(startCenter, startSize.width, startSize.height));

  const l1Thetas: number[] = [];

  if (l1Ids.length > 0) {
    const weighted = l1Ids.map((id) => ({
      id,
      weight: descendantCount(children, id, nodesById),
    }));
    const orderedL1 = greedySlotOrder(weighted);
    const n = orderedL1.length;

    type SubtreeLayout = {
      id: string;
      theta: number;
      subtreeIds: string[];
      localPositions: Map<string, Point>;
      lateralHalf: number;
    };

    const subtreeLayouts: SubtreeLayout[] = orderedL1.map((id, slotIndex) => {
      const theta = slotAngle(slotIndex, n);
      l1Thetas.push(theta);
      const rankdir = rankdirFromAngle(theta);
      const subtreeIds = collectSubtreeIds(children, id);
      const localPositions = layoutSubtreeLocal(subtreeIds, treeEdges, nodesById, rankdir);
      const lateralHalf = lateralHalfExtent(subtreeIds, localPositions, nodesById, id, rankdir);
      return { id, theta, subtreeIds, localPositions, lateralHalf };
    });

    const radius = computeRingRadius(subtreeLayouts.map((s) => s.lateralHalf));

    for (const layout of subtreeLayouts) {
      placeSubtreeAt(
        layout.subtreeIds,
        layout.localPositions,
        nodesById,
        layout.id,
        { x: radius * Math.cos(layout.theta), y: radius * Math.sin(layout.theta) },
        positionById,
      );
    }
  }

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
