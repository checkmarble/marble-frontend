import { describe, expect, it } from 'vitest';
import { type GraphRfEdge, type GraphRfNode } from './graph-rf-types';
import { applyVisibilityFilters } from './use-laid-out-graph';

function person(id: string, isStart = false): GraphRfNode {
  return {
    id,
    position: { x: 0, y: 0 },
    type: 'person',
    data: {
      label: id,
      semanticType: 'person',
      subEntity: 'natural',
      isStart,
      objectType: 'users',
      objectId: id,
      tagIds: [],
    },
  };
}

function edge(source: string, target: string): GraphRfEdge {
  return { id: `${source}->${target}`, source, target, type: 'link', data: { kind: 'link' } };
}

function hypernode(id: string): GraphRfNode {
  return {
    id,
    position: { x: 0, y: 0 },
    type: 'hypernode',
    data: { count: 100, objectType: 'accounts', objectId: id },
  };
}

describe('applyVisibilityFilters', () => {
  it('keeps the start node even when it is in the hidden set', () => {
    const visible = applyVisibilityFilters(
      [person('start', true), person('a')],
      [edge('start', 'a')],
      new Set(['start']),
      'start',
    );

    expect(visible.nodes.map((node) => node.id)).toEqual(['start', 'a']);
  });

  it('hides a node and orphans that only reached start through it', () => {
    const visible = applyVisibilityFilters(
      [person('start', true), person('mid'), person('leaf')],
      [edge('start', 'mid'), edge('mid', 'leaf')],
      new Set(['mid']),
      'start',
    );

    expect(visible.nodes.map((node) => node.id)).toEqual(['start']);
    expect(visible.edges).toEqual([]);
  });

  it('drops hypernodes and their edges when hideHypernodes is set', () => {
    const visible = applyVisibilityFilters(
      [person('start', true), hypernode('h1'), person('a')],
      [edge('start', 'h1'), edge('start', 'a')],
      new Set(),
      'start',
      true,
    );

    expect(visible.nodes.map((node) => node.id)).toEqual(['start', 'a']);
    expect(visible.edges.map((item) => item.id)).toEqual(['start->a']);
  });

  it('keeps hypernodes when hideHypernodes is unset', () => {
    const visible = applyVisibilityFilters(
      [person('start', true), hypernode('h1')],
      [edge('start', 'h1')],
      new Set(),
      'start',
    );

    expect(visible.nodes.map((node) => node.id)).toEqual(['start', 'h1']);
  });
});
