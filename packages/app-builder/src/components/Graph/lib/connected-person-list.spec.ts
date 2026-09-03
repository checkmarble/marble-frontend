import { describe, expect, it } from 'vitest';
import {
  connectedPersonListItems,
  personListItemKey,
  personListItemsFromMemberIds,
  samePersonListItems,
} from './connected-person-list';
import { clusterNodeId } from './graph-keys';
import { type ClusterRfNode, type GraphRfNode, type HypernodeRfNode, type PivotRfNode } from './graph-rf-types';

function personNode(id: string, label = id): Extract<GraphRfNode, { type: 'person' }> {
  return {
    id,
    position: { x: 0, y: 0 },
    type: 'person',
    data: {
      label,
      semanticType: 'person',
      subEntity: 'natural',
      isStart: false,
      objectType: 'users',
      objectId: id,
      tagIds: [],
    },
  };
}

function clusterNode(
  root: Extract<GraphRfNode, { type: 'person' }>,
  memberIds: string[],
  nodeCount = memberIds.length,
) {
  return {
    id: clusterNodeId(root.id),
    position: { x: 0, y: 0 },
    type: 'cluster',
    data: {
      root: root.data,
      nodeCount,
      internalEdgeCount: memberIds.length - 1,
      memberIds,
    },
  } satisfies ClusterRfNode;
}

function pivotNode(id: string, value = id, label?: string) {
  return {
    id,
    position: { x: 0, y: 0 },
    type: 'pivot',
    data: { value, objectType: 'same_ip', label },
  } satisfies PivotRfNode;
}

function hypernode(id: string) {
  return {
    id,
    position: { x: 0, y: 0 },
    type: 'hypernode',
    data: { count: 99, objectType: 'users', objectId: id },
  } satisfies HypernodeRfNode;
}

describe('connectedPersonListItems', () => {
  it('includes person neighbours and skips pivots and hypernodes', () => {
    const alice = personNode('alice', 'Alice');
    const visible = [alice, pivotNode('same_ip:1'), hypernode('users:bulk')];

    const items = connectedPersonListItems(visible, new Set(['alice', 'same_ip:1', 'users:bulk']), [alice]);

    expect(items).toEqual([
      { type: 'person', id: 'alice', ref: expect.objectContaining({ objectId: 'alice', label: 'Alice' }) },
    ]);
  });

  it('includes collapsed-cluster neighbours with the root name and hidden count', () => {
    const root = personNode('root', 'Acme Corp');
    const members = [personNode('c0'), personNode('c1'), root];
    const chip = clusterNode(root, ['root', 'c0', 'c1'], 3);
    const start = personNode('start', 'Start');

    const items = connectedPersonListItems([start, chip], new Set([chip.id]), members);

    expect(items).toEqual([
      {
        type: 'cluster',
        id: chip.id,
        ref: expect.objectContaining({ objectId: 'root', label: 'Acme Corp' }),
        nodeCount: 3,
        internalEdgeCount: 2,
        members: [
          expect.objectContaining({ type: 'person', id: 'root' }),
          expect.objectContaining({ type: 'person', id: 'c0' }),
          expect.objectContaining({ type: 'person', id: 'c1' }),
        ],
      },
    ]);
    expect(personListItemKey(items[0]!)).toBe(chip.id);
  });

  it('returns an empty list when there are no neighbours', () => {
    expect(connectedPersonListItems([personNode('alice')], undefined, [])).toEqual([]);
    expect(connectedPersonListItems([personNode('alice')], new Set(), [])).toEqual([]);
  });
});

describe('samePersonListItems', () => {
  it('treats a person and a collapsed chip of the same root as different', () => {
    const personItem = {
      type: 'person' as const,
      id: 'root',
      ref: { objectType: 'users', objectId: 'root', label: 'Acme Corp' },
    };
    const clusterItem = {
      type: 'cluster' as const,
      id: clusterNodeId('root'),
      ref: { objectType: 'users', objectId: 'root', label: 'Acme Corp' },
      nodeCount: 3,
      internalEdgeCount: 2,
      members: [],
    };

    expect(samePersonListItems([personItem], [clusterItem])).toBe(false);
    expect(samePersonListItems([personItem], [personItem])).toBe(true);
  });

  it('treats clusters with the same counts but different members as different', () => {
    const member = {
      type: 'person' as const,
      id: 'c0',
      ref: { objectType: 'users', objectId: 'c0', label: 'Child' },
    };
    const otherMember = {
      type: 'person' as const,
      id: 'c1',
      ref: { objectType: 'users', objectId: 'c1', label: 'Other' },
    };
    const cluster = {
      type: 'cluster' as const,
      id: clusterNodeId('root'),
      ref: { objectType: 'users', objectId: 'root', label: 'Acme Corp' },
      nodeCount: 2,
      internalEdgeCount: 1,
      members: [member],
    };

    expect(samePersonListItems([cluster], [{ ...cluster, members: [member] }])).toBe(true);
    expect(samePersonListItems([cluster], [{ ...cluster, members: [otherMember] }])).toBe(false);
  });
});

describe('personListItemsFromMemberIds', () => {
  it('resolves folded members from the unclustered node list', () => {
    const nodes = [personNode('root', 'Acme Corp'), personNode('c0', 'Child')];

    expect(personListItemsFromMemberIds(['root', 'c0'], nodes)).toEqual([
      { type: 'person', id: 'root', ref: expect.objectContaining({ objectId: 'root', label: 'Acme Corp' }) },
      { type: 'person', id: 'c0', ref: expect.objectContaining({ objectId: 'c0', label: 'Child' }) },
    ]);
  });

  it('tags pivot members and omits hypernodes', () => {
    const root = personNode('root', 'Acme Corp');
    const pivot = pivotNode('same_ip:1.2.3.4', '1.2.3.4', 'Same IP');
    const bulk = hypernode('users:bulk');

    expect(personListItemsFromMemberIds(['root', pivot.id, bulk.id, 'gone'], [root, pivot, bulk])).toEqual([
      { type: 'person', id: 'root', ref: expect.objectContaining({ objectId: 'root', label: 'Acme Corp' }) },
      {
        type: 'pivot',
        id: pivot.id,
        ref: { objectType: 'same_ip', objectId: '1.2.3.4', label: 'Same IP' },
      },
    ]);
  });
});
