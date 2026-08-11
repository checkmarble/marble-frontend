import { type GraphData, type GraphEdgeData, type GraphNodeData } from '@app-builder/models/graph';
import { type GraphTypeHelpers } from './data-model-map';
import { nodeKey } from './graph-keys';
import { type GraphRfEdge, type GraphRfNode } from './graph-rf-types';

export function isConnectorNode(node: GraphNodeData): boolean {
  return node.connector === true;
}

export function isHypernode(node: GraphNodeData): boolean {
  return node.hypernode_count != null;
}

export type TransformOptions = {
  /**
   * Max graph hops from the start node.
   * `0` (default) explores the full reachable graph; `N > 0` stops after N hops.
   */
  maxExplorationHops?: number;
};

export type FlatFlowElements = {
  nodes: GraphRfNode[];
  edges: GraphRfEdge[];
  startKey: string;
};

type AdjEntry = { key: string; edge: GraphEdgeData };

function buildUndirectedAdjacency(edges: GraphEdgeData[]): Map<string, AdjEntry[]> {
  const adj = new Map<string, AdjEntry[]>();
  const add = (from: string, to: string, edge: GraphEdgeData) => {
    const list = adj.get(from) ?? [];
    list.push({ key: to, edge });
    adj.set(from, list);
  };
  for (const edge of edges) {
    const fromKey = nodeKey(edge.from.type, edge.from.id);
    const toKey = nodeKey(edge.to.type, edge.to.id);
    add(fromKey, toKey, edge);
    add(toKey, fromKey, edge);
  }
  return adj;
}

/** Keep only nodes within `maxHops` of `startKey`. `maxHops <= 0` returns `adj` unchanged. */
function filterAdjacencyByHops(
  adj: Map<string, AdjEntry[]>,
  startKey: string,
  maxHops: number,
): Map<string, AdjEntry[]> {
  if (maxHops <= 0) return adj;

  const dist = new Map<string, number>([[startKey, 0]]);
  const queue = [startKey];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const d = dist.get(cur) ?? 0;
    if (d >= maxHops) continue;
    for (const { key: nxt } of adj.get(cur) ?? []) {
      if (dist.has(nxt)) continue;
      dist.set(nxt, d + 1);
      queue.push(nxt);
    }
  }

  const filtered = new Map<string, AdjEntry[]>();
  for (const [from, entries] of adj) {
    if (!dist.has(from)) continue;
    filtered.set(
      from,
      entries.filter((e) => dist.has(e.key)),
    );
  }
  return filtered;
}

/**
 * Resolve graph data to a flat React Flow graph.
 * Entity records render as `person` nodes; `connector: true` → pivots;
 * `hypernode_count` → hypernodes.
 */
export function toFlatFlowElements(
  data: GraphData,
  typeHelpers: GraphTypeHelpers,
  options: TransformOptions = {},
): FlatFlowElements {
  const maxExplorationHops = options.maxExplorationHops ?? 0;
  const nodesByKey = new Map(data.nodes.map((n) => [nodeKey(n.type, n.id), n]));
  const fullAdj = buildUndirectedAdjacency(data.edges);

  const startKey = nodeKey(data.start.type, data.start.id);
  const startNode = nodesByKey.get(startKey);
  if (!startNode) throw new Error(`Start node ${startKey} missing from nodes`);

  const adj = filterAdjacencyByHops(fullAdj, startKey, maxExplorationHops);

  const candidateKeys = new Set<string>([startKey]);
  for (const [from, entries] of adj) {
    candidateKeys.add(from);
    for (const { key } of entries) {
      candidateKeys.add(key);
    }
  }

  const keptKeys = new Set<string>();
  for (const key of candidateKeys) {
    if (nodesByKey.has(key)) keptKeys.add(key);
  }

  const nodes: GraphRfNode[] = [];
  for (const key of keptKeys) {
    const node = nodesByKey.get(key)!;
    if (isHypernode(node)) {
      nodes.push({
        id: key,
        position: { x: 0, y: 0 },
        type: 'hypernode',
        data: {
          count: node.hypernode_count!,
          objectType: node.type,
          objectId: node.id,
        },
      });
    } else if (isConnectorNode(node)) {
      nodes.push({
        id: key,
        position: { x: 0, y: 0 },
        type: 'pivot',
        data: {
          label: node.id,
          rawType: node.type,
        },
      });
    } else {
      nodes.push({
        id: key,
        position: { x: 0, y: 0 },
        type: 'person',
        data: {
          label: node.id,
          subEntity: typeHelpers.getPersonSubEntity(node.type),
          isStart: key === startKey,
          objectType: node.type,
          objectId: node.id,
        },
      });
    }
  }

  const edges: GraphRfEdge[] = [];
  const seenEdges = new Set<string>();
  for (const edge of data.edges) {
    const fromKey = nodeKey(edge.from.type, edge.from.id);
    const toKey = nodeKey(edge.to.type, edge.to.id);
    if (!keptKeys.has(fromKey) || !keptKeys.has(toKey)) continue;

    const edgeId = `${fromKey}->${toKey}:${edge.label}`;
    if (seenEdges.has(edgeId)) continue;
    seenEdges.add(edgeId);

    const isMatch = edge.kind === 'match';
    edges.push({
      id: edgeId,
      source: fromKey,
      target: toKey,
      type: isMatch ? 'match' : 'link',
      animated: isMatch,
      label: edge.label,
      data: { kind: edge.kind },
    });
  }

  return { nodes, edges, startKey };
}
