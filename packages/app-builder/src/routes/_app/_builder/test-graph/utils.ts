import { type EdgeData, type GraphData, type NodeData } from './data';

/** Composite key: `${type}:${id}` e.g. "user:user_0001" */
export function nodeKey(ref: { type: string; id: string }): string {
  return `${ref.type}:${ref.id}`;
}

export type FlowLeaf = {
  /** Full payload from data.nodes (type, id, pivot, …) */
  node: NodeData;
  depth: number;
  /** Edge that discovered this leaf from its tree parent (undefined on root) */
  edgeFromParent?: EdgeData;
  /** Outgoing children discovered at depth+1 (first visit only), keyed by nodeKey */
  children: Map<string, FlowLeaf>;
  /**
   * Edges to nodes already placed elsewhere in the tree (cycles / shared hubs).
   * Lets React Flow still draw cross-links without duplicating nodes.
   */
  backEdges: EdgeData[];
};

export type FlowGraph = {
  root: FlowLeaf;
  /** O(1) lookup of any placed leaf by nodeKey(type, id) */
  byKey: Map<string, FlowLeaf>;
};

export function transformDataToFlow(data: GraphData): FlowGraph {
  const nodesByKey = new Map(data.nodes.map((n) => [nodeKey(n), n]));
  const outgoing = new Map<string, EdgeData[]>();
  for (const edge of data.edges) {
    const fromKey = nodeKey(edge.from);
    const list = outgoing.get(fromKey) ?? [];
    list.push(edge);
    outgoing.set(fromKey, list);
  }

  const startKey = nodeKey(data.start);
  const startNode = nodesByKey.get(startKey);
  if (!startNode) throw new Error(`Start node ${startKey} missing from nodes`);

  const root: FlowLeaf = {
    node: startNode,
    depth: 0,
    children: new Map(),
    backEdges: [],
  };
  const byKey = new Map<string, FlowLeaf>([[startKey, root]]);
  const queue: FlowLeaf[] = [root];

  while (queue.length > 0) {
    const leaf = queue.shift()!;
    for (const edge of outgoing.get(nodeKey(leaf.node)) ?? []) {
      const toKey = nodeKey(edge.to);
      if (byKey.has(toKey)) {
        leaf.backEdges.push(edge);
        continue;
      }
      const childNode = nodesByKey.get(toKey);
      if (!childNode) continue;
      const child: FlowLeaf = {
        node: childNode,
        depth: leaf.depth + 1,
        edgeFromParent: edge,
        children: new Map(),
        backEdges: [],
      };
      leaf.children.set(toKey, child);
      byKey.set(toKey, child);
      queue.push(child);
    }
  }

  return { root, byKey };
}
