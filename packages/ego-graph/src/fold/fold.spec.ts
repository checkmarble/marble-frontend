import { describe, expect, it } from 'vitest';
import { classify, graph, link, match, node, satellite, type TestEdge, type TestNode } from '../test-support';
import { buildSpanningTree } from '../tree';
import { type FoldOptions, foldGraph } from './index';

/** `start -- root -- c0..c{n-1}`, a fan of `n` leaves under a single root. */
function fanFixture(n: number): { nodes: TestNode[]; edges: TestEdge[] } {
  const nodes: TestNode[] = [node('start'), node('root')];
  const edges: TestEdge[] = [link('start', 'root')];
  for (let i = 0; i < n; i++) {
    nodes.push(node(`c${i}`));
    edges.push(link('root', `c${i}`));
  }
  return { nodes, edges };
}

function options(threshold: number, expanded: string[] = []): FoldOptions<TestNode, TestEdge> {
  return { ...classify, threshold, expandedRoots: new Set(expanded) };
}

function fold(nodes: TestNode[], edges: TestEdge[], opts: FoldOptions<TestNode, TestEdge>) {
  return foldGraph(graph(nodes, edges, 'start'), opts);
}

describe('foldGraph', () => {
  it('plans nothing when the threshold is 0', () => {
    const { nodes, edges } = fanFixture(20);
    const plan = fold(nodes, edges, options(0));

    expect(plan.folds).toHaveLength(0);
    expect(plan.mergedEdges).toHaveLength(0);
    expect(plan.foldOf.size).toBe(0);
  });

  it('leaves a branch below the threshold untouched', () => {
    const { nodes, edges } = fanFixture(3);
    expect(fold(nodes, edges, options(10)).folds).toHaveLength(0);
  });

  it('leaves a branch exactly on the threshold untouched', () => {
    // root + 9 children = 10 foldable nodes; a threshold of 10 is not exceeded.
    const { nodes, edges } = fanFixture(9);
    expect(fold(nodes, edges, options(10)).folds).toHaveLength(0);
  });

  it('collapses a branch above the threshold into one fold', () => {
    // root + 9 children = 10 foldable nodes, one over the threshold of 9.
    const { nodes, edges } = fanFixture(9);
    const plan = fold(nodes, edges, options(9));

    expect(plan.folds).toHaveLength(1);
    const [only] = plan.folds;
    expect(only!.rootId).toBe('root');
    expect(only!.memberIds).toHaveLength(10);
    expect(only!.memberIds).toContain('root');
    // The 9 root->child edges are internal; start->root becomes the merged edge.
    expect(only!.internalEdgeCount).toBe(9);

    expect(plan.mergedEdges).toHaveLength(1);
    expect(plan.mergedEdges[0]!.mergedFrom).toEqual(['root']);
    expect(nodes.filter((n) => !plan.foldOf.has(n.id)).map((n) => n.id)).toEqual(['start']);
  });

  it('never folds the root', () => {
    const { nodes, edges } = fanFixture(20);
    const plan = fold(nodes, edges, options(2));

    expect(plan.foldOf.has('start')).toBe(false);
    expect(plan.folds).toHaveLength(1);
  });

  it('holds an expanded root open and re-applies the rule one level down', () => {
    //         start -- root -- a -- a0..a4
    //                       '- b -- b0..b4
    const nodes: TestNode[] = [node('start'), node('root'), node('a'), node('b')];
    const edges: TestEdge[] = [link('start', 'root'), link('root', 'a'), link('root', 'b')];
    for (const parent of ['a', 'b']) {
      for (let i = 0; i < 5; i++) {
        nodes.push(node(`${parent}${i}`));
        edges.push(link(parent, `${parent}${i}`));
      }
    }

    // Threshold 5: root (13 foldable) and each of a / b (6) are over it.
    expect(fold(nodes, edges, options(5)).folds.map((f) => f.rootId)).toEqual(['root']);

    const expanded = fold(nodes, edges, options(5, ['root']));
    expect(expanded.folds.map((f) => f.rootId).sort()).toEqual(['a', 'b']);
    expect(expanded.folds.every((f) => f.memberIds.length === 6)).toBe(true);
    // root surfaced, and is flagged so it can be regrouped.
    expect(expanded.foldOf.has('root')).toBe(false);
    expect(expanded.heldOpen).toContain('root');
  });

  it('does not hold open a branch root that is too small to regroup', () => {
    const { nodes, edges } = fanFixture(3);
    expect(fold(nodes, edges, options(10, ['root'])).heldOpen).toHaveLength(0);
  });

  it('keeps a satellite out of a fold and merges its member edges into one', () => {
    const { nodes, edges } = fanFixture(9);
    nodes.push(satellite('same_ip:1.2.3.4'));
    for (const member of ['c0', 'c1', 'c2']) {
      edges.push(match('same_ip:1.2.3.4', member));
    }

    const plan = fold(nodes, edges, options(9));

    expect(plan.foldOf.has('same_ip:1.2.3.4')).toBe(false);
    expect(plan.folds).toHaveLength(1);

    const satEdges = plan.mergedEdges.filter((e) => e.source === 'same_ip:1.2.3.4' || e.target === 'same_ip:1.2.3.4');
    expect(satEdges).toHaveLength(1);
    expect(satEdges[0]!.allAssociative).toBe(true);
    expect(satEdges[0]!.mergedFrom).toEqual(['c0', 'c1', 'c2']);
  });

  it('merges many member links to the same external node into one edge', () => {
    const { nodes, edges } = fanFixture(9);
    nodes.push(node('outsider'));
    // outsider is reached from start directly, so it stays visible...
    edges.push(link('start', 'outsider'));
    // ...and five members link across to it.
    for (let i = 0; i < 5; i++) {
      edges.push(link(`c${i}`, 'outsider'));
    }

    const plan = fold(nodes, edges, options(9));
    const crossing = plan.mergedEdges.filter((e) => e.source === 'outsider' || e.target === 'outsider');

    // start->outsider has no folded endpoint, so it is not the plan's business.
    expect(crossing).toHaveLength(1);
    expect(crossing[0]!.mergedFrom).toHaveLength(5);
    expect(crossing[0]!.allAssociative).toBe(false);
  });

  it('merges links between two folded branches into a single edge', () => {
    const nodes: TestNode[] = [node('start'), node('a'), node('b')];
    const edges: TestEdge[] = [link('start', 'a'), link('start', 'b')];
    for (const parent of ['a', 'b']) {
      for (let i = 0; i < 4; i++) {
        nodes.push(node(`${parent}${i}`));
        edges.push(link(parent, `${parent}${i}`));
      }
    }
    edges.push(link('a0', 'b0'), link('a1', 'b1'), link('a2', 'b2'));

    // Each branch is 5 foldable nodes, one over the threshold of 4.
    const plan = fold(nodes, edges, options(4));
    expect(plan.folds.map((f) => f.rootId).sort()).toEqual(['a', 'b']);

    const between = plan.mergedEdges.filter(
      (e) => (e.source === 'a' && e.target === 'b') || (e.source === 'b' && e.target === 'a'),
    );
    expect(between).toHaveLength(1);
    // Six distinct member nodes are involved across the three merged links.
    expect(between[0]!.mergedFrom).toHaveLength(6);
  });

  it('will not fold an island reachable only through a satellite', () => {
    // Rewritten from the pre-unification behaviour, where folding walked every
    // edge and this island DID collapse into a chip. One tree now: a satellite
    // cannot hold a branch together, so this is not a branch. It stays on
    // canvas and the layout gives it a pocket instead.
    const nodes: TestNode[] = [node('start'), node('neighbor'), satellite('same_ip:9.9.9.9')];
    const edges: TestEdge[] = [link('start', 'neighbor'), match('same_ip:9.9.9.9', 'neighbor')];
    let prev = 'same_ip:9.9.9.9';
    for (let i = 0; i < 6; i++) {
      nodes.push(node(`island${i}`));
      edges.push(match(prev, `island${i}`));
      prev = `island${i}`;
    }

    const plan = fold(nodes, edges, options(5, ['neighbor']));

    expect(plan.folds).toHaveLength(0);
    expect(plan.mergedEdges).toHaveLength(0);
    for (let i = 0; i < 6; i++) {
      expect(plan.foldOf.has(`island${i}`)).toBe(false);
    }
  });

  it('excludes satellites in the tree itself, not by filtering members later', () => {
    // start -- root -- c0..c8, with a satellite hanging off c0.
    const { nodes, edges } = fanFixture(9);
    nodes.push(satellite('same_iban:DE00'));
    edges.push(match('same_iban:DE00', 'c0'));

    const tree = buildSpanningTree(graph(nodes, edges, 'start'), classify);
    expect(tree.satelliteIds).toEqual(['same_iban:DE00']);
    expect(tree.memberIds).not.toContain('same_iban:DE00');
    // Absent from the tree entirely — no edge of it, not merely no member of it.
    expect(tree.edges.some((e) => e.source === 'same_iban:DE00' || e.target === 'same_iban:DE00')).toBe(false);

    const only = fold(nodes, edges, options(9)).folds[0]!;
    expect(only.memberIds).toHaveLength(10);
    expect(only.memberIds).not.toContain('same_iban:DE00');
  });
});
