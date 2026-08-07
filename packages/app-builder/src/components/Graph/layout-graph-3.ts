import { nodeMeasuredSize, type Point, topLeftFromCenter, withBestHandles } from './graph-handles';
import { type GraphRfEdge, type GraphRfNode, isLinkEdge } from './graph-rf-types';
import { bfsSpanningTreeEdges, buildChildrenMap } from './graph-traversal';
import { layoutConnectorPockets, layoutPolarTreeRecursive, radialConnectorIslandLayout } from './layout-graph-shared';

/**
 * Pure polar “flower petal” layout for the start's **link** neighborhood,
 * then radial connector islands (same petal pattern). No Dagre.
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

  layoutPolarTreeRecursive({
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
    islandLayout: radialConnectorIslandLayout,
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
