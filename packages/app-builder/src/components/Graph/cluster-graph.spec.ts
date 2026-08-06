import { describe, expect, it } from 'vitest';
import { clusterGraphElements, clusterNodeId } from './cluster-graph';
import { type ClusterRfNode, type GraphRfEdge, type GraphRfNode } from './graph-rf-types';

function personNode(id: string, isStart = false): GraphRfNode {
  return {
    id,
    position: { x: 0, y: 0 },
    type: 'person',
    data: {
      label: id,
      subEntity: 'natural',
      isStart,
      objectType: 'users',
      objectId: id,
    },
  };
}

function pivotNode(id: string, rawType = 'same_ip'): GraphRfNode {
  return {
    id,
    position: { x: 0, y: 0 },
    type: 'pivot',
    data: { label: id, rawType },
  };
}

function linkEdge(source: string, target: string, label = 'link'): GraphRfEdge {
  return {
    id: `${source}->${target}:${label}`,
    source,
    target,
    type: 'link',
    label,
    data: { kind: 'link' },
  };
}

function matchEdge(source: string, target: string, label = 'same_ip'): GraphRfEdge {
  return {
    id: `${source}->${target}:${label}`,
    source,
    target,
    type: 'match',
    label,
    data: { kind: 'match' },
  };
}

/** `start -- root -- c0..c{n-1}`, a fan of `n` leaves under a single root. */
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

function clustersOf(nodes: GraphRfNode[]): ClusterRfNode[] {
  return nodes.filter((n): n is ClusterRfNode => n.type === 'cluster');
}

describe('clusterGraphElements', () => {
  it('is identity when the threshold is 0', () => {
    const { nodes, edges } = fanFixture(20);
    const result = clusterGraphElements(nodes, edges, options(0));

    expect(result.nodes).toBe(nodes);
    expect(result.edges).toBe(edges);
  });

  it('leaves a subtree below the threshold untouched', () => {
    const { nodes, edges } = fanFixture(3);
    const result = clusterGraphElements(nodes, edges, options(10));

    expect(clustersOf(result.nodes)).toHaveLength(0);
    expect(result.nodes).toHaveLength(5);
  });

  it('collapses a subtree at the threshold into one chip', () => {
    // root + 9 children = 10 foldable nodes, 10 internal edges.
    const { nodes, edges } = fanFixture(9);
    const result = clusterGraphElements(nodes, edges, options(10));

    const clusters = clustersOf(result.nodes);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]!.id).toBe(clusterNodeId('root'));
    expect(clusters[0]!.data.nodeCount).toBe(10);
    // 9 root->child edges are internal; start->root becomes the merged edge.
    expect(clusters[0]!.data.internalEdgeCount).toBe(9);
    // The chip carries its entry point so it can render it like a person node.
    expect(clusters[0]!.data.root.objectId).toBe('root');

    expect(result.nodes.map((n) => n.id)).toEqual(['start', clusterNodeId('root')]);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]!.data?.mergedCount).toBe(1);
  });

  it('never clusters the start node', () => {
    const { nodes, edges } = fanFixture(20);
    const result = clusterGraphElements(nodes, edges, options(2));

    expect(result.nodes.some((n) => n.id === 'start')).toBe(true);
    expect(clustersOf(result.nodes)).toHaveLength(1);
  });

  it('suppresses the chip for an expanded root and re-applies the rule one level down', () => {
    //         start -- root -- a -- a0..a4
    //                       '- b -- b0..b4
    const nodes: GraphRfNode[] = [personNode('start', true), personNode('root'), personNode('a'), personNode('b')];
    const edges: GraphRfEdge[] = [linkEdge('start', 'root'), linkEdge('root', 'a'), linkEdge('root', 'b')];
    for (const parent of ['a', 'b']) {
      for (let i = 0; i < 5; i++) {
        nodes.push(personNode(`${parent}${i}`));
        edges.push(linkEdge(parent, `${parent}${i}`));
      }
    }

    const collapsed = clusterGraphElements(nodes, edges, options(6));
    expect(clustersOf(collapsed.nodes).map((c) => c.id)).toEqual([clusterNodeId('root')]);

    const expanded = clusterGraphElements(nodes, edges, options(6, ['root']));
    const nested = clustersOf(expanded.nodes);
    expect(nested.map((c) => c.id).sort()).toEqual([clusterNodeId('a'), clusterNodeId('b')]);
    expect(nested.every((c) => c.data.nodeCount === 6)).toBe(true);
    // root surfaced, its two children are chips.
    const rootNode = expanded.nodes.find((n) => n.id === 'root');
    expect(rootNode).toBeDefined();
    // ...and it is flagged so it can be regrouped.
    expect(rootNode!.type === 'person' && rootNode!.data.isExpandedClusterRoot).toBe(true);
  });

  it('does not flag a branch root that is too small to regroup', () => {
    const { nodes, edges } = fanFixture(3);
    const result = clusterGraphElements(nodes, edges, options(10, ['root']));

    const rootNode = result.nodes.find((n) => n.id === 'root')!;
    expect(rootNode.type === 'person' && rootNode.data.isExpandedClusterRoot).toBeFalsy();
  });

  it('keeps a pivot inside a collapsed branch on canvas and merges its member edges', () => {
    const { nodes, edges } = fanFixture(9);
    nodes.push(pivotNode('same_ip:1.2.3.4'));
    // The pivot matches three members of the branch.
    edges.push(matchEdge('same_ip:1.2.3.4', 'c0'));
    edges.push(matchEdge('same_ip:1.2.3.4', 'c1'));
    edges.push(matchEdge('same_ip:1.2.3.4', 'c2'));

    const result = clusterGraphElements(nodes, edges, options(10));

    expect(result.nodes.some((n) => n.id === 'same_ip:1.2.3.4')).toBe(true);
    expect(clustersOf(result.nodes)).toHaveLength(1);

    const pivotEdges = result.edges.filter((e) => e.source === 'same_ip:1.2.3.4' || e.target === 'same_ip:1.2.3.4');
    expect(pivotEdges).toHaveLength(1);
    expect(pivotEdges[0]!.type).toBe('match');
    expect(pivotEdges[0]!.data?.mergedCount).toBe(3);
  });

  it('merges many member links to the same external node into one edge', () => {
    const { nodes, edges } = fanFixture(9);
    nodes.push(personNode('outsider'));
    // outsider is reached from start directly, so it stays visible...
    edges.push(linkEdge('start', 'outsider'));
    // ...and five members link across to it.
    for (let i = 0; i < 5; i++) {
      edges.push(linkEdge(`c${i}`, 'outsider'));
    }

    const result = clusterGraphElements(nodes, edges, options(10));
    const crossEdges = result.edges.filter((e) => e.source === 'outsider' || e.target === 'outsider');

    // start->outsider passes through; the five member links merge into one.
    expect(crossEdges).toHaveLength(2);
    const merged = crossEdges.find((e) => e.data?.mergedCount != null)!;
    expect(merged.data?.mergedCount).toBe(5);
    expect(merged.type).toBe('link');
  });

  it('merges links between two collapsed branches into a single edge', () => {
    const nodes: GraphRfNode[] = [personNode('start', true), personNode('a'), personNode('b')];
    const edges: GraphRfEdge[] = [linkEdge('start', 'a'), linkEdge('start', 'b')];
    for (const parent of ['a', 'b']) {
      for (let i = 0; i < 4; i++) {
        nodes.push(personNode(`${parent}${i}`));
        edges.push(linkEdge(parent, `${parent}${i}`));
      }
    }
    // Three cross-branch links.
    edges.push(linkEdge('a0', 'b0'), linkEdge('a1', 'b1'), linkEdge('a2', 'b2'));

    const result = clusterGraphElements(nodes, edges, options(5));
    const chipA = clusterNodeId('a');
    const chipB = clusterNodeId('b');

    expect(
      clustersOf(result.nodes)
        .map((c) => c.id)
        .sort(),
    ).toEqual([chipA, chipB].sort());

    const between = result.edges.filter(
      (e) => (e.source === chipA && e.target === chipB) || (e.source === chipB && e.target === chipA),
    );
    expect(between).toHaveLength(1);
    // Six distinct member nodes are involved across the three merged links.
    expect(between[0]!.data?.mergedCount).toBe(6);
  });

  it('clusters a match-only island owned by a pivot, reachable only via the pivot', () => {
    const nodes: GraphRfNode[] = [personNode('start', true), personNode('neighbor'), pivotNode('same_ip:9.9.9.9')];
    const edges: GraphRfEdge[] = [linkEdge('start', 'neighbor'), matchEdge('same_ip:9.9.9.9', 'neighbor')];
    // A chain of match-only nodes hanging off the pivot.
    let prev = 'same_ip:9.9.9.9';
    for (let i = 0; i < 6; i++) {
      nodes.push(personNode(`island${i}`));
      edges.push(matchEdge(prev, `island${i}`));
      prev = `island${i}`;
    }

    // Drilled into `neighbor`, so the walk descends through the pinned pivot
    // and the island becomes the shallowest qualifying subtree.
    const result = clusterGraphElements(nodes, edges, options(5, ['neighbor']));

    expect(result.nodes.some((n) => n.id === 'same_ip:9.9.9.9')).toBe(true);
    const clusters = clustersOf(result.nodes);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]!.id).toBe(clusterNodeId('island0'));
    expect(clusters[0]!.data.nodeCount).toBe(6);

    const chipEdges = result.edges.filter((e) => e.source === clusters[0]!.id || e.target === clusters[0]!.id);
    expect(chipEdges).toHaveLength(1);
    expect(chipEdges[0]!.source === 'same_ip:9.9.9.9' || chipEdges[0]!.target === 'same_ip:9.9.9.9').toBe(true);
  });

  it('does not count pinned pivots toward a chip nodeCount', () => {
    // start -- root -- c0..c8, with a pivot hanging off c0.
    const { nodes, edges } = fanFixture(9);
    nodes.push(pivotNode('same_iban:DE00'));
    edges.push(matchEdge('same_iban:DE00', 'c0'));

    const result = clusterGraphElements(nodes, edges, options(10));
    const cluster = clustersOf(result.nodes)[0]!;

    expect(cluster.data.nodeCount).toBe(10);
    expect(cluster.data.memberIds).not.toContain('same_iban:DE00');
  });
});
