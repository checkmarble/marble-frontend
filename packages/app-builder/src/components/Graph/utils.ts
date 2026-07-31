import { type EdgeData, type GraphData, type NodeData } from '../../routes/_app/_builder/test-graph/-data';
import { type GraphTypeHelpers } from './data-model-map';
import { type GraphRfEdge, type GraphRfNode } from './graph-rf-types';

/** Composite key: `${type}:${id}` e.g. "users:user_0001" */
export function nodeKey(ref: { type: string; id: string }): string {
  return `${ref.type}:${ref.id}`;
}

export function isConnectorNode(node: NodeData): boolean {
  return 'connector' in node && node.connector === true;
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

type AdjEntry = { key: string; edge: EdgeData };

function buildUndirectedAdjacency(edges: EdgeData[]): Map<string, AdjEntry[]> {
  const adj = new Map<string, AdjEntry[]>();
  const add = (from: string, to: string, edge: EdgeData) => {
    const list = adj.get(from) ?? [];
    list.push({ key: to, edge });
    adj.set(from, list);
  };
  for (const edge of edges) {
    const fromKey = nodeKey(edge.from);
    const toKey = nodeKey(edge.to);
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
 * Resolve graph data to a flat person + pivot React Flow graph.
 * Persons come from the data model; pivots are nodes with `connector: true`.
 */
export function toFlatFlowElements(
  data: GraphData,
  typeHelpers: GraphTypeHelpers,
  options: TransformOptions = {},
): FlatFlowElements {
  const maxExplorationHops = options.maxExplorationHops ?? 0;
  const nodesByKey = new Map(data.nodes.map((n) => [nodeKey(n), n]));
  const fullAdj = buildUndirectedAdjacency(data.edges);

  const startKey = nodeKey(data.start);
  const startNode = nodesByKey.get(startKey);
  if (!startNode) throw new Error(`Start node ${startKey} missing from nodes`);
  if (!typeHelpers.isPersonType(startNode.type)) {
    throw new Error(`Start node ${startKey} is not a person type`);
  }

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
    const node = nodesByKey.get(key);
    if (!node) continue;
    if (typeHelpers.isPersonType(node.type) || isConnectorNode(node)) {
      keptKeys.add(key);
    }
  }

  const nodes: GraphRfNode[] = [];
  for (const key of keptKeys) {
    const node = nodesByKey.get(key)!;
    if (typeHelpers.isPersonType(node.type)) {
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
    } else {
      nodes.push({
        id: key,
        position: { x: 0, y: 0 },
        type: 'pivot',
        data: {
          label: node.id,
          rawType: node.type,
        },
      });
    }
  }

  const edges: GraphRfEdge[] = [];
  const seenEdges = new Set<string>();
  for (const edge of data.edges) {
    const fromKey = nodeKey(edge.from);
    const toKey = nodeKey(edge.to);
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
      label: edge.label,
      data: { kind: edge.kind },
    });
  }

  return { nodes, edges, startKey };
}

/** Undirected adjacency for the given node ids and edges. */
function buildUndirectedIdAdjacency(
  nodeIds: string[],
  edges: Array<{ source: string; target: string }>,
): Map<string, string[]> {
  const idSet = new Set(nodeIds);
  const adj = new Map<string, string[]>();
  for (const id of nodeIds) {
    adj.set(id, []);
  }
  for (const edge of edges) {
    if (!idSet.has(edge.source) || !idSet.has(edge.target)) continue;
    adj.get(edge.source)!.push(edge.target);
    adj.get(edge.target)!.push(edge.source);
  }
  return adj;
}

/**
 * Node ids reachable from `startKey` via undirected edges.
 * Falls back to the first node id when `startKey` is missing.
 */
export function reachableNodeIds(
  nodeIds: string[],
  edges: Array<{ source: string; target: string }>,
  startKey: string,
): Set<string> {
  const idSet = new Set(nodeIds);
  const root = idSet.has(startKey) ? startKey : (nodeIds[0] ?? '');
  if (!root) return new Set();

  const adj = buildUndirectedIdAdjacency(nodeIds, edges);
  const visited = new Set<string>([root]);
  const queue = [root];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nxt of adj.get(cur) ?? []) {
      if (visited.has(nxt)) continue;
      visited.add(nxt);
      queue.push(nxt);
    }
  }

  return visited;
}

/**
 * BFS spanning-tree edges from `startKey` (parent → child) for Dagre ranking.
 * Handles cycles by only recording the first discovery edge.
 */
export function bfsSpanningTreeEdges(
  nodeIds: string[],
  edges: Array<{ source: string; target: string }>,
  startKey: string,
): Array<{ source: string; target: string }> {
  const idSet = new Set(nodeIds);
  const root = idSet.has(startKey) ? startKey : (nodeIds[0] ?? '');
  if (!root) return [];

  const adj = buildUndirectedIdAdjacency(nodeIds, edges);
  const tree: Array<{ source: string; target: string }> = [];
  const visited = new Set<string>([root]);
  const queue = [root];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nxt of adj.get(cur) ?? []) {
      if (visited.has(nxt)) continue;
      visited.add(nxt);
      tree.push({ source: cur, target: nxt });
      queue.push(nxt);
    }
  }

  return tree;
}
