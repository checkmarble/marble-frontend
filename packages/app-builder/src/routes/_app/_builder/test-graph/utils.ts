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

export type FlowLink = {
  from: string;
  to: string;
  edge: EdgeData;
};

export type TypeGroup = {
  id: string;
  semanticType: NonPersonSemantic;
  depth: number;
  /** Entity keys only — never person keys */
  memberKeys: string[];
};

export type PersonLeaf = {
  kind: 'person';
  node: NodeData;
  semanticType: 'person';
  subEntity: FtmEntityPersonOption;
  depth: number;
  /**
   * Expanded entity subgraph (person depth < expandLevels).
   * Mutually exclusive with non-empty `groups`.
   */
  expanded: ExpandedLeaf | null;
  /** Collapsed type groups (deeper levels) */
  groups: Map<NonPersonSemantic, GroupLeaf>;
};

export type ExpandedLeaf = {
  kind: 'expanded';
  /** Non-person nodes (entities + pivots) in the neighborhood */
  nodes: Map<string, NodeData>;
  /** Edges among owner, neighborhood nodes, and related persons */
  links: FlowLink[];
  /** Newly placed related persons */
  persons: Map<string, PersonLeaf>;
  /** Keys of persons already placed elsewhere */
  backLinks: string[];
  /** Same-type bundles by BFS depth (entities only) */
  typeGroups: TypeGroup[];
  /** Entity key → type-group id */
  memberToGroup: Map<string, string>;
  /** BFS depth from owner for every neighborhood node */
  depths: Map<string, number>;
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
  /**
   * Expand entity nodes for person depths strictly below this value.
   * Default 1 → always expand the first level (root neighborhood), collapse deeper.
   */
  expandLevels?: number;
  /**
   * Max graph hops from the start node (entities, pivots, and persons).
   * `0` (default) explores the full reachable graph; `N > 0` stops after N hops.
   */
  maxExplorationHops?: number;
};

export type ViewNode =
  | {
      kind: 'bundle';
      id: string;
      groupId: string;
      semanticType: NonPersonSemantic;
      count: number;
      depth: number;
    }
  | {
      kind: 'entity';
      id: string;
      node: NodeData;
      semanticType: NonPersonSemantic;
      groupId: string;
      /** True when the group has more than one member (show collapse control) */
      canCollapse: boolean;
      depth: number;
    }
  | {
      kind: 'pivot';
      id: string;
      node: NodeData;
      depth: number;
    };

export type ViewLink = {
  from: string;
  to: string;
  edge: EdgeData;
};

export type ProjectedView = {
  nodes: ViewNode[];
  links: ViewLink[];
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

type RelatedBucket = {
  members: Map<string, NodeData>;
  persons: Set<string>;
};

type ExpandedWalk = {
  nodes: Map<string, NodeData>;
  links: FlowLink[];
  persons: Set<string>;
};

export function typeBundleNodeId(groupId: string): string {
  return `bundle:${groupId}`;
}

export function collectMultiMemberGroupIds(leaf: PersonLeaf): string[] {
  const ids: string[] = [];
  if (leaf.expanded) {
    for (const group of leaf.expanded.typeGroups) {
      if (group.memberKeys.length > 1) ids.push(group.id);
    }
  }
  for (const group of leaf.groups.values()) {
    for (const child of group.persons.values()) {
      ids.push(...collectMultiMemberGroupIds(child));
    }
  }
  if (leaf.expanded) {
    for (const child of leaf.expanded.persons.values()) {
      ids.push(...collectMultiMemberGroupIds(child));
    }
  }
  return ids;
}

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

/**
 * Collect the full non-person neighborhood from a person: every reachable entity/pivot
 * (including dead ends), edges between them, and related persons at the frontier.
 */
function findExpandedNeighborhood(
  personKey: string,
  adj: Map<string, AdjEntry[]>,
  nodesByKey: Map<string, NodeData>,
): ExpandedWalk {
  const nodes = new Map<string, NodeData>();
  const links: FlowLink[] = [];
  const linkKeys = new Set<string>();
  const persons = new Set<string>();

  const addLink = (from: string, to: string, edge: EdgeData) => {
    const key = from < to ? `${from}|${to}` : `${to}|${from}`;
    if (linkKeys.has(key)) return;
    linkKeys.add(key);
    links.push({ from, to, edge });
  };

  const visited = new Set<string>([personKey]);
  const queue: string[] = [];

  for (const { key: neighborKey, edge } of adj.get(personKey) ?? []) {
    const neighbor = nodesByKey.get(neighborKey);
    if (!neighbor) continue;
    if (isPersonType(neighbor.type)) continue;

    visited.add(neighborKey);
    nodes.set(neighborKey, neighbor);
    addLink(personKey, neighborKey, edge);
    queue.push(neighborKey);
  }

  while (queue.length > 0) {
    const key = queue.shift()!;

    for (const { key: nextKey, edge } of adj.get(key) ?? []) {
      if (nextKey === personKey) {
        addLink(key, personKey, edge);
        continue;
      }

      const next = nodesByKey.get(nextKey);
      if (!next) continue;

      if (isPersonType(next.type)) {
        persons.add(nextKey);
        addLink(key, nextKey, edge);
        continue;
      }

      addLink(key, nextKey, edge);
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      nodes.set(nextKey, next);
      queue.push(nextKey);
    }
  }

  return { nodes, links, persons };
}

/** BFS depths from owner across neighborhood nodes (entities + pivots). */
function computeNeighborhoodDepths(
  ownerKey: string,
  nodes: Map<string, NodeData>,
  links: FlowLink[],
): Map<string, number> {
  const localAdj = new Map<string, string[]>();
  const addAdj = (a: string, b: string) => {
    const list = localAdj.get(a) ?? [];
    list.push(b);
    localAdj.set(a, list);
  };

  for (const link of links) {
    const aLocal = link.from === ownerKey || nodes.has(link.from);
    const bLocal = link.to === ownerKey || nodes.has(link.to);
    if (aLocal && bLocal) {
      addAdj(link.from, link.to);
      addAdj(link.to, link.from);
    }
  }

  const depths = new Map<string, number>([[ownerKey, 0]]);
  const queue = [ownerKey];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nxt of localAdj.get(cur) ?? []) {
      if (depths.has(nxt)) continue;
      depths.set(nxt, (depths.get(cur) ?? 0) + 1);
      queue.push(nxt);
    }
  }
  return depths;
}

function buildTypeGroups(
  ownerKey: string,
  nodes: Map<string, NodeData>,
  depths: Map<string, number>,
): { typeGroups: TypeGroup[]; memberToGroup: Map<string, string> } {
  const buckets = new Map<string, TypeGroup>();

  for (const [key, node] of nodes) {
    if (isPivotType(node.type) || isPersonType(node.type)) continue;
    const semanticType = getNonPersonSemantic(node.type);
    if (!semanticType) continue;
    const depth = depths.get(key) ?? 1;
    const id = `${ownerKey}:${semanticType}:d${depth}`;
    let group = buckets.get(id);
    if (!group) {
      group = { id, semanticType, depth, memberKeys: [] };
      buckets.set(id, group);
    }
    group.memberKeys.push(key);
  }

  const typeGroups = [...buckets.values()].sort(
    (a, b) => a.depth - b.depth || a.semanticType.localeCompare(b.semanticType),
  );
  const memberToGroup = new Map<string, string>();
  for (const group of typeGroups) {
    for (const memberKey of group.memberKeys) {
      memberToGroup.set(memberKey, group.id);
    }
  }
  return { typeGroups, memberToGroup };
}

/**
 * Project the expanded neighborhood according to which type-groups are expanded.
 * Persons and pivots are always individual endpoints.
 */
export function projectExpandedView(
  expanded: ExpandedLeaf,
  ownerKey: string,
  expandedGroupIds: Set<string>,
): ProjectedView {
  const nodes: ViewNode[] = [];
  const visibleId = new Map<string, string>();

  // Owner is placed by the caller; still map identity for link remapping.
  visibleId.set(ownerKey, ownerKey);

  for (const group of expanded.typeGroups) {
    const isExpanded = expandedGroupIds.has(group.id) || group.memberKeys.length <= 1;
    if (!isExpanded) {
      const bundleId = typeBundleNodeId(group.id);
      nodes.push({
        kind: 'bundle',
        id: bundleId,
        groupId: group.id,
        semanticType: group.semanticType,
        count: group.memberKeys.length,
        depth: group.depth,
      });
      for (const memberKey of group.memberKeys) {
        visibleId.set(memberKey, bundleId);
      }
      continue;
    }

    for (const memberKey of group.memberKeys) {
      const node = expanded.nodes.get(memberKey);
      if (!node) continue;
      const semanticType = getNonPersonSemantic(node.type) ?? 'other';
      nodes.push({
        kind: 'entity',
        id: memberKey,
        node,
        semanticType,
        groupId: group.id,
        canCollapse: group.memberKeys.length > 1,
        depth: expanded.depths.get(memberKey) ?? group.depth,
      });
      visibleId.set(memberKey, memberKey);
    }
  }

  for (const [key, node] of expanded.nodes) {
    if (!isPivotType(node.type)) continue;
    nodes.push({
      kind: 'pivot',
      id: key,
      node,
      depth: expanded.depths.get(key) ?? 1,
    });
    visibleId.set(key, key);
  }

  // Persons always keep their own ids (never remapped onto a bundle).
  for (const personKey of expanded.persons.keys()) {
    visibleId.set(personKey, personKey);
  }
  for (const personKey of expanded.backLinks) {
    visibleId.set(personKey, personKey);
  }

  const links: ViewLink[] = [];
  const seen = new Set<string>();
  for (const link of expanded.links) {
    const from = visibleId.get(link.from);
    const to = visibleId.get(link.to);
    if (!from || !to || from === to) continue;
    const dedupeKey = from < to ? `${from}|${to}|${link.edge.label}` : `${to}|${from}|${link.edge.label}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    links.push({ from, to, edge: link.edge });
  }

  return { nodes, links };
}

function makePersonLeaf(node: NodeData, depth: number): PersonLeaf {
  return {
    kind: 'person',
    node,
    semanticType: 'person',
    subEntity: getPersonSubEntity(node.type),
    depth,
    expanded: null,
    groups: new Map(),
  };
}

function attachRelatedPersons(
  relatedKeys: Iterable<string>,
  personKey: string,
  personDepth: number,
  nodesByKey: Map<string, NodeData>,
  byKey: Map<string, PersonLeaf>,
  expandQueue: PersonLeaf[],
): { persons: Map<string, PersonLeaf>; backLinks: string[] } {
  const persons = new Map<string, PersonLeaf>();
  const backLinks: string[] = [];

  for (const relatedKey of relatedKeys) {
    if (relatedKey === personKey) continue;

    const existing = byKey.get(relatedKey);
    if (existing) {
      backLinks.push(relatedKey);
      continue;
    }

    const relatedNode = nodesByKey.get(relatedKey);
    if (!relatedNode) continue;

    const child = makePersonLeaf(relatedNode, personDepth + 1);
    persons.set(relatedKey, child);
    byKey.set(relatedKey, child);
    expandQueue.push(child);
  }

  return { persons, backLinks };
}

export function transformDataToFlow(data: GraphData, options: TransformOptions = {}): FlowGraph {
  const maxDepth = options.maxDepth ?? 2;
  const expandLevels = options.expandLevels ?? 1;
  const maxExplorationHops = options.maxExplorationHops ?? 0;
  const nodesByKey = new Map(data.nodes.map((n) => [nodeKey(n), n]));
  const fullAdj = buildUndirectedAdjacency(data.edges);

  const startKey = nodeKey(data.start);
  const startNode = nodesByKey.get(startKey);
  if (!startNode) throw new Error(`Start node ${startKey} missing from nodes`);
  if (!isPersonType(startNode.type)) {
    throw new Error(`Start node ${startKey} is not a person type`);
  }

  const adj = filterAdjacencyByHops(fullAdj, startKey, maxExplorationHops);

  const root = makePersonLeaf(startNode, 0);
  const byKey = new Map<string, PersonLeaf>([[startKey, root]]);

  const expandQueue: PersonLeaf[] = [root];

  while (expandQueue.length > 0) {
    const person = expandQueue.shift()!;
    if (person.depth >= maxDepth) continue;

    const personKey = nodeKey(person.node);
    const shouldExpand = person.depth < expandLevels;

    if (shouldExpand) {
      const walk = findExpandedNeighborhood(personKey, adj, nodesByKey);
      const { persons, backLinks } = attachRelatedPersons(
        walk.persons,
        personKey,
        person.depth,
        nodesByKey,
        byKey,
        expandQueue,
      );

      if (walk.nodes.size > 0 || persons.size > 0 || backLinks.length > 0) {
        const depths = computeNeighborhoodDepths(personKey, walk.nodes, walk.links);
        const { typeGroups, memberToGroup } = buildTypeGroups(personKey, walk.nodes, depths);
        person.expanded = {
          kind: 'expanded',
          nodes: walk.nodes,
          links: walk.links,
          persons,
          backLinks,
          typeGroups,
          memberToGroup,
          depths,
        };
      }
      continue;
    }

    const buckets = findRelatedByGroup(personKey, adj, nodesByKey);

    for (const [semanticType, bucket] of buckets) {
      const { persons, backLinks } = attachRelatedPersons(
        bucket.persons,
        personKey,
        person.depth,
        nodesByKey,
        byKey,
        expandQueue,
      );

      // Only keep groups that introduce at least one new person.
      // Back-links alone (already-placed hubs) are omitted to avoid fan-out noise.
      if (persons.size > 0) {
        person.groups.set(semanticType, {
          kind: 'group',
          semanticType,
          members: [...bucket.members.values()],
          persons,
          backLinks,
        });
      }
    }
  }

  return { root, byKey };
}
