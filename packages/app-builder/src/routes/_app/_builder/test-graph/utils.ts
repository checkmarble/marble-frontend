import { type FtmEntityPersonOption } from '@app-builder/models/data-model';
import { type EdgeData, type GraphData, type NodeData } from './data';
import {
  getNonPersonSemantic,
  getPersonSubEntity,
  isPersonType,
  isPivotType,
  type NonPersonSemantic,
} from './data-model-map';

/** Composite key: `${type}:${id}` e.g. "user:user_0001" */
export function nodeKey(ref: { type: string; id: string }): string {
  return `${ref.type}:${ref.id}`;
}

export type PersonLeaf = {
  kind: 'person';
  node: NodeData;
  semanticType: 'person';
  subEntity: FtmEntityPersonOption;
  depth: number;
  /** Outgoing groups keyed by non-person semantic type */
  groups: Map<NonPersonSemantic, GroupLeaf>;
};

export type GroupLeaf = {
  kind: 'group';
  semanticType: NonPersonSemantic;
  /** Collapsed intermediate nodes (accounts, txns, …) — not rendered */
  members: NodeData[];
  /** Newly placed related persons under this group */
  persons: Map<string, PersonLeaf>;
  /** Keys of persons already placed elsewhere (shared hubs / cycles) */
  backLinks: string[];
};

export type FlowGraph = {
  root: PersonLeaf;
  /** O(1) lookup of any placed person by nodeKey */
  byKey: Map<string, PersonLeaf>;
};

export type TransformOptions = {
  /** Max person-hop depth from the start (default 2) */
  maxDepth?: number;
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

type RelatedBucket = {
  members: Map<string, NodeData>;
  persons: Set<string>;
};

/**
 * From a person, walk only through non-person nodes and collect related persons
 * bucketed by the first non-pivot semantic type on each path.
 */
function findRelatedByGroup(
  personKey: string,
  adj: Map<string, AdjEntry[]>,
  nodesByKey: Map<string, NodeData>,
): Map<NonPersonSemantic, RelatedBucket> {
  const buckets = new Map<NonPersonSemantic, RelatedBucket>();

  type QueueItem = {
    key: string;
    groupType: NonPersonSemantic | null;
    pathMembers: Map<string, NodeData>;
  };

  const visited = new Set<string>([personKey]);
  const queue: QueueItem[] = [];

  for (const { key: neighborKey } of adj.get(personKey) ?? []) {
    if (visited.has(neighborKey)) continue;
    const neighbor = nodesByKey.get(neighborKey);
    if (!neighbor) continue;

    if (isPersonType(neighbor.type)) {
      // Direct person↔person links have no intermediate group — skip for now
      continue;
    }

    const groupType = isPivotType(neighbor.type) ? null : getNonPersonSemantic(neighbor.type);
    const pathMembers = new Map<string, NodeData>();
    if (!isPivotType(neighbor.type)) {
      pathMembers.set(neighborKey, neighbor);
    }
    visited.add(neighborKey);
    queue.push({ key: neighborKey, groupType, pathMembers });
  }

  while (queue.length > 0) {
    const item = queue.shift()!;
    const node = nodesByKey.get(item.key);
    if (!node) continue;

    for (const { key: nextKey } of adj.get(item.key) ?? []) {
      if (nextKey === personKey) continue;
      const next = nodesByKey.get(nextKey);
      if (!next) continue;

      if (isPersonType(next.type)) {
        if (!item.groupType) continue;
        let bucket = buckets.get(item.groupType);
        if (!bucket) {
          bucket = { members: new Map(), persons: new Set() };
          buckets.set(item.groupType, bucket);
        }
        for (const [mk, mn] of item.pathMembers) {
          bucket.members.set(mk, mn);
        }
        bucket.persons.add(nextKey);
        continue;
      }

      if (visited.has(nextKey)) continue;
      visited.add(nextKey);

      const nextGroupType = item.groupType ?? (isPivotType(next.type) ? null : getNonPersonSemantic(next.type));
      const pathMembers = new Map(item.pathMembers);
      if (!isPivotType(next.type)) {
        pathMembers.set(nextKey, next);
      }
      queue.push({ key: nextKey, groupType: nextGroupType, pathMembers });
    }
  }

  return buckets;
}

function makePersonLeaf(node: NodeData, depth: number): PersonLeaf {
  return {
    kind: 'person',
    node,
    semanticType: 'person',
    subEntity: getPersonSubEntity(node.type),
    depth,
    groups: new Map(),
  };
}

export function transformDataToFlow(data: GraphData, options: TransformOptions = {}): FlowGraph {
  const maxDepth = options.maxDepth ?? 2;
  const nodesByKey = new Map(data.nodes.map((n) => [nodeKey(n), n]));
  const adj = buildUndirectedAdjacency(data.edges);

  const startKey = nodeKey(data.start);
  const startNode = nodesByKey.get(startKey);
  if (!startNode) throw new Error(`Start node ${startKey} missing from nodes`);
  if (!isPersonType(startNode.type)) {
    throw new Error(`Start node ${startKey} is not a person type`);
  }

  const root = makePersonLeaf(startNode, 0);
  const byKey = new Map<string, PersonLeaf>([[startKey, root]]);

  const expandQueue: PersonLeaf[] = [root];

  while (expandQueue.length > 0) {
    const person = expandQueue.shift()!;
    if (person.depth >= maxDepth) continue;

    const personKey = nodeKey(person.node);
    const buckets = findRelatedByGroup(personKey, adj, nodesByKey);

    for (const [semanticType, bucket] of buckets) {
      const group: GroupLeaf = {
        kind: 'group',
        semanticType,
        members: [...bucket.members.values()],
        persons: new Map(),
        backLinks: [],
      };

      for (const relatedKey of bucket.persons) {
        if (relatedKey === personKey) continue;

        const existing = byKey.get(relatedKey);
        if (existing) {
          group.backLinks.push(relatedKey);
          continue;
        }

        const relatedNode = nodesByKey.get(relatedKey);
        if (!relatedNode) continue;

        const child = makePersonLeaf(relatedNode, person.depth + 1);
        group.persons.set(relatedKey, child);
        byKey.set(relatedKey, child);
        expandQueue.push(child);
      }

      // Only keep groups that introduce at least one new person.
      // Back-links alone (already-placed hubs) are omitted to avoid fan-out noise.
      if (group.persons.size > 0) {
        person.groups.set(semanticType, group);
      }
    }
  }

  return { root, byKey };
}
