import { LAYOUT_NAMES } from 'ego-graph';
import { describe, expect, it } from 'vitest';
import { clusterNodeId } from './graph-keys';
import { clusterGraphElements, layoutByMode } from './graph-layout';
import { type ClusterRfNode, type GraphRfEdge, type GraphRfNode } from './graph-rf-types';

/**
 * Covers Marble's half of the `ego-graph` contract: turning a fold plan into
 * chips, and applying positions and handles. The planning and geometry
 * themselves are tested in the `ego-graph` package.
 */

function personNode(id: string, isStart = false): GraphRfNode {
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

function pivotNode(id: string): GraphRfNode {
  return {
    id,
    position: { x: 0, y: 0 },
    type: 'pivot',
    data: { value: id, objectType: 'same_ip', label: 'same_ip' },
  };
}

function linkEdge(source: string, target: string): GraphRfEdge {
  return { id: `${source}->${target}`, source, target, type: 'link', data: { kind: 'link' } };
}

function matchEdge(source: string, target: string): GraphRfEdge {
  return { id: `${source}->${target}`, source, target, type: 'match', data: { kind: 'match' } };
}

/** `start -- root -- c0..c{n-1}` */
function fanFixture(n: number): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } {
  const nodes: GraphRfNode[] = [personNode('start', true), personNode('root')];
  const edges: GraphRfEdge[] = [linkEdge('start', 'root')];
  for (let i = 0; i < n; i++) {
    nodes.push(personNode(`c${i}`));
    edges.push(linkEdge('root', `c${i}`));
  }
  return { nodes, edges };
}

function options(threshold: number, expanded: string[] = []) {
  return { startKey: 'start', threshold, expandedRootIds: new Set(expanded) };
}

function chipsOf(nodes: GraphRfNode[]): ClusterRfNode[] {
  return nodes.filter((n): n is ClusterRfNode => n.type === 'cluster');
}

describe('clusterGraphElements', () => {
  it('is identity when the threshold is 0', () => {
    const { nodes, edges } = fanFixture(20);
    const result = clusterGraphElements(nodes, edges, options(0));

    expect(result.nodes).toBe(nodes);
    expect(result.edges).toBe(edges);
  });

  it('builds one chip carrying its branch root, counts and members', () => {
    const { nodes, edges } = fanFixture(9);
    const result = clusterGraphElements(nodes, edges, options(9));

    const chips = chipsOf(result.nodes);
    expect(chips).toHaveLength(1);
    expect(chips[0]!.id).toBe(clusterNodeId('root'));
    expect(chips[0]!.data.nodeCount).toBe(10);
    expect(chips[0]!.data.internalEdgeCount).toBe(9);
    // The chip renders its entry point like a person card.
    expect(chips[0]!.data.root.objectId).toBe('root');
    // Explicit footprint: layout runs before React Flow measures.
    expect({ width: chips[0]!.width, height: chips[0]!.height }).toEqual({ width: 192, height: 72 });

    expect(result.nodes.map((n) => n.id)).toEqual(['start', clusterNodeId('root')]);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]!.data?.mergedCount).toBe(1);
  });

  it('keeps a pivot on canvas and merges its member edges into one match edge', () => {
    const { nodes, edges } = fanFixture(9);
    nodes.push(pivotNode('same_ip:1.2.3.4'));
    for (const member of ['c0', 'c1', 'c2']) {
      edges.push(matchEdge('same_ip:1.2.3.4', member));
    }

    const result = clusterGraphElements(nodes, edges, options(9));
    expect(result.nodes.some((n) => n.id === 'same_ip:1.2.3.4')).toBe(true);

    const pivotEdges = result.edges.filter((e) => e.source === 'same_ip:1.2.3.4' || e.target === 'same_ip:1.2.3.4');
    expect(pivotEdges).toHaveLength(1);
    expect(pivotEdges[0]!.type).toBe('match');
    expect(pivotEdges[0]!.data?.mergedCount).toBe(3);
  });

  it('passes through edges with no folded endpoint and merges the rest', () => {
    const { nodes, edges } = fanFixture(9);
    nodes.push(personNode('outsider'));
    edges.push(linkEdge('start', 'outsider'));
    for (let i = 0; i < 5; i++) {
      edges.push(linkEdge(`c${i}`, 'outsider'));
    }

    const crossing = clusterGraphElements(nodes, edges, options(9)).edges.filter(
      (e) => e.source === 'outsider' || e.target === 'outsider',
    );

    // start->outsider survives untouched; the five member links become one.
    expect(crossing).toHaveLength(2);
    const merged = crossing.find((e) => e.data?.mergedCount != null)!;
    expect(merged.data?.mergedCount).toBe(5);
    expect(merged.type).toBe('link');
  });

  it('surfaces an expanded root, flags it for regrouping, and chips its children', () => {
    const nodes: GraphRfNode[] = [personNode('start', true), personNode('root'), personNode('a'), personNode('b')];
    const edges: GraphRfEdge[] = [linkEdge('start', 'root'), linkEdge('root', 'a'), linkEdge('root', 'b')];
    for (const parent of ['a', 'b']) {
      for (let i = 0; i < 5; i++) {
        nodes.push(personNode(`${parent}${i}`));
        edges.push(linkEdge(parent, `${parent}${i}`));
      }
    }

    expect(chipsOf(clusterGraphElements(nodes, edges, options(5)).nodes).map((c) => c.id)).toEqual([
      clusterNodeId('root'),
    ]);

    const expanded = clusterGraphElements(nodes, edges, options(5, ['root']));
    expect(
      chipsOf(expanded.nodes)
        .map((c) => c.id)
        .sort(),
    ).toEqual([clusterNodeId('a'), clusterNodeId('b')]);

    const rootNode = expanded.nodes.find((n) => n.id === 'root');
    expect(rootNode?.type === 'person' && rootNode.data.isExpandedClusterRoot).toBe(true);
  });

  it('will not fold an island reachable only through a pivot', () => {
    // One spanning tree: a pivot cannot hold a branch together.
    const nodes: GraphRfNode[] = [personNode('start', true), personNode('neighbor'), pivotNode('same_ip:9.9.9.9')];
    const edges: GraphRfEdge[] = [linkEdge('start', 'neighbor'), matchEdge('same_ip:9.9.9.9', 'neighbor')];
    let prev = 'same_ip:9.9.9.9';
    for (let i = 0; i < 6; i++) {
      nodes.push(personNode(`island${i}`));
      edges.push(matchEdge(prev, `island${i}`));
      prev = `island${i}`;
    }

    const result = clusterGraphElements(nodes, edges, options(5, ['neighbor']));
    expect(chipsOf(result.nodes)).toHaveLength(0);
    expect(result.nodes).toHaveLength(nodes.length);
  });
});

describe('layoutByMode', () => {
  it.each(LAYOUT_NAMES)('%s positions every node and wires handles', (mode) => {
    const { nodes, edges } = fanFixture(6);
    nodes.push(pivotNode('same_ip:1'));
    edges.push(matchEdge('same_ip:1', 'c0'));

    const result = layoutByMode(mode, nodes, edges, 'start');

    // The start node anchors the origin; 180x56 is the pre-measurement default.
    const start = result.nodes.find((n) => n.id === 'start')!;
    expect(start.position).toEqual({ x: -90, y: -28 });

    // Nothing left stacked on the origin behind it.
    const stacked = result.nodes.filter((n) => n.id !== 'start' && n.position.x === -90 && n.position.y === -28);
    expect(stacked).toHaveLength(0);

    for (const edge of result.edges) {
      expect(edge.sourceHandle).toMatch(/^s[trbl]$/);
      expect(edge.targetHandle).toMatch(/^[trbl]$/);
    }
  });
});
