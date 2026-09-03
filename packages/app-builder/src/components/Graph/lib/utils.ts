import { type GraphData, type GraphEdgeData } from '@app-builder/models/graph';
import { match } from 'ts-pattern';
import { type GraphTypeHelpers } from './data-model-map';
import { nodeKey } from './graph-keys';
import { type GraphRfEdge, type GraphRfNode } from './graph-rf-types';
import { resolveTitle } from './resolve-object-title';

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

/**
 * Resolve graph data to a flat React Flow graph.
 * One React Flow node type per `GraphNodeData.kind`: record → `person`,
 * connector → `pivot`, hypernode → `hypernode`.
 */
export function toFlatFlowElements(data: GraphData, typeHelpers: GraphTypeHelpers): FlatFlowElements {
  const nodesByKey = new Map(data.nodes.map((n) => [nodeKey(n.type, n.id), n]));
  const adj = buildUndirectedAdjacency(data.edges);

  const startKey = nodeKey(data.start.type, data.start.id);
  const startNode = nodesByKey.get(startKey);
  if (!startNode) throw new Error(`Start node ${startKey} missing from nodes`);

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
    const position = { x: 0, y: 0 };
    nodes.push(
      match(node)
        .returnType<GraphRfNode>()
        .with({ kind: 'hypernode' }, (hypernode) => ({
          id: key,
          position,
          type: 'hypernode',
          data: {
            count: hypernode.hypernodeCount,
            objectType: node.type,
            objectId: node.id,
            label: node.metadata?.label,
          },
        }))
        .with({ kind: 'connector' }, () => ({
          id: key,
          position,
          type: 'pivot',
          data: { value: node.id, objectType: node.type, label: node.metadata?.label },
        }))
        .with({ kind: 'record' }, (record) => ({
          id: key,
          position,
          type: 'person',
          data: {
            label: resolveTitle(node.metadata?.label, node.id),
            semanticType: typeHelpers.getSemanticType(node.type),
            subEntity: typeHelpers.getPersonSubEntity(node.type),
            isStart: key === startKey,
            objectType: node.type,
            objectId: node.id,
            riskLevel: record.metadata?.riskLevel,
            tagIds: record.metadata?.tagIds ?? [],
          },
        }))
        .exhaustive(),
    );
  }

  const edges: GraphRfEdge[] = [];
  const seenEdges = new Set<string>();
  for (const edge of data.edges) {
    const fromKey = nodeKey(edge.from.type, edge.from.id);
    const toKey = nodeKey(edge.to.type, edge.to.id);
    if (!keptKeys.has(fromKey) || !keptKeys.has(toKey)) continue;

    const throughKey = edge.through.join(',');
    const edgeId = `${fromKey}->${toKey}:${throughKey}`;
    if (seenEdges.has(edgeId)) continue;
    seenEdges.add(edgeId);

    const fromNode = nodesByKey.get(fromKey);
    const toNode = nodesByKey.get(toKey);
    const touchesHypernode = fromNode?.kind === 'hypernode' || toNode?.kind === 'hypernode';
    const isMatch = edge.kind === 'match';
    edges.push({
      id: edgeId,
      source: fromKey,
      target: toKey,
      type: touchesHypernode ? 'hypernode' : isMatch ? 'match' : 'link',
      animated: touchesHypernode || isMatch,
      data: { kind: edge.kind, through: edge.through, field: edge.field },
    });
  }

  return { nodes, edges, startKey };
}
