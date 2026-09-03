import { type GraphObjectRef } from './graph-keys';
import { type GraphRfNode, type PersonRfData, type PivotRfData } from './graph-rf-types';

/**
 * A row in the settings-panel person list: a visible person, a collapsed
 * branch chip, or a pivot kept on a cluster's member list so the panel can
 * drop satellites. `id` is the React Flow node id so hover and selection hit
 * the chip, not the folded root.
 */
export type PersonListItem =
  | { type: 'person'; id: string; ref: GraphObjectRef }
  | { type: 'pivot'; id: string; ref: GraphObjectRef }
  | {
      type: 'cluster';
      id: string;
      ref: GraphObjectRef;
      nodeCount: number;
      internalEdgeCount: number;
      members: PersonListItem[];
    };

/** Person and cluster rows; pivots stay on the member list but are not rendered. */
export type StructuralPersonListItem = Exclude<PersonListItem, { type: 'pivot' }>;

export function personListItemKey(item: PersonListItem) {
  return item.id;
}

export function personRefFromData(data: PersonRfData): GraphObjectRef {
  return {
    objectType: data.objectType,
    objectId: data.objectId,
    label: data.label,
    riskLevel: data.riskLevel,
    semanticType: data.semanticType,
    subEntity: data.subEntity,
  };
}

export function personRefFromRfNode(node: Extract<GraphRfNode, { type: 'person' }>): GraphObjectRef {
  return personRefFromData(node.data);
}

/** Same fields PivotNode shows: relation name as `label`, matched value as `objectId`. */
export function pivotRefFromData(data: PivotRfData): GraphObjectRef {
  return {
    objectType: data.objectType,
    objectId: data.value,
    label: data.label,
  };
}

export function pivotRefFromRfNode(node: Extract<GraphRfNode, { type: 'pivot' }>): GraphObjectRef {
  return pivotRefFromData(node.data);
}

export function personListItemsFromMemberIds(memberIds: readonly string[], allNodes: readonly GraphRfNode[]) {
  const nodesById = new Map(allNodes.map((node) => [node.id, node]));
  const items: PersonListItem[] = [];
  for (const id of memberIds) {
    const node = nodesById.get(id);
    if (node?.type === 'person') {
      items.push({ type: 'person', id, ref: personRefFromData(node.data) });
      continue;
    }
    if (node?.type === 'pivot') {
      items.push({ type: 'pivot', id, ref: pivotRefFromData(node.data) });
    }
  }
  return items;
}

export function toPersonListItem(node: GraphRfNode, allNodes: readonly GraphRfNode[]): PersonListItem | null {
  if (node.type === 'person') return { type: 'person', id: node.id, ref: personRefFromData(node.data) };
  if (node.type !== 'cluster') return null;
  return {
    type: 'cluster',
    id: node.id,
    ref: personRefFromData(node.data.root),
    nodeCount: node.data.nodeCount,
    internalEdgeCount: node.data.internalEdgeCount,
    members: personListItemsFromMemberIds(node.data.memberIds, allNodes),
  };
}

/** Visible person and collapsed-cluster neighbours of `neighborIds`. Pivots and hypernodes are omitted. */
export function connectedPersonListItems(
  visibleNodes: readonly GraphRfNode[],
  neighborIds: ReadonlySet<string> | undefined,
  allNodes: readonly GraphRfNode[],
) {
  if (!neighborIds) return [];
  const items: PersonListItem[] = [];
  for (const node of visibleNodes) {
    if (!neighborIds.has(node.id)) continue;
    const item = toPersonListItem(node, allNodes);
    if (item) items.push(item);
  }
  return items;
}

export function samePersonListItems(a: PersonListItem[], b: PersonListItem[]) {
  if (a.length !== b.length) return false;
  return a.every((item, i) => {
    const other = b[i];
    if (other == null || item.type !== other.type || item.id !== other.id) return false;
    if (item.type === 'cluster' && other.type === 'cluster') {
      return item.nodeCount === other.nodeCount && item.internalEdgeCount === other.internalEdgeCount;
    }
    return true;
  });
}
