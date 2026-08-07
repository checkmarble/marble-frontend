import { describe, expect, it } from 'vitest';
import { normalizeAngle, slotAngle } from '../geometry/angles';
import {
  centerOf,
  classify,
  distance,
  graph,
  link,
  match,
  NODE_SIZE,
  node,
  satellite,
  type TestNode,
} from '../test-support';
import { polarPetal } from './polar-petal';
import { radialDagre } from './radial-dagre';
import { sectoredDagre } from './sectored-dagre';

const LAYOUTS = [
  { name: 'radialDagre', run: radialDagre },
  { name: 'sectoredDagre', run: sectoredDagre },
  { name: 'polarPetal', run: polarPetal },
] as const;

describe('radialDagre', () => {
  it('keeps a satellite out of the structural spanning tree', () => {
    const nodes = [node('start'), node('chiara'), node('other'), node('company'), satellite('same_ip:1')];
    const edges = [
      link('start', 'chiara'),
      link('start', 'other'),
      link('start', 'company'),
      match('same_ip:1', 'chiara'),
      match('same_ip:1', 'company'),
    ];

    const positions = radialDagre(graph(nodes, edges, 'start'), classify);
    const start = centerOf(positions, nodes, 'start');
    const sat = centerOf(positions, nodes, 'same_ip:1');
    const chiara = centerOf(positions, nodes, 'chiara');

    expect(start.x).toBeCloseTo(0, 0);
    expect(start.y).toBeCloseTo(0, 0);

    // The satellite sits outside the ring, farther out than a level-1 node.
    expect(distance(sat, start)).toBeGreaterThan(distance(chiara, start));

    // Not parked as a deep branch directly above the root (the legacy bug).
    expect(Math.abs(sat.x)).toBeGreaterThan(40);
  });

  it('places an associative-only chain as an island under the claiming satellite', () => {
    const nodes = [node('start'), node('anchor'), node('orphan_a'), node('orphan_b'), satellite('ip')];
    const edges = [
      link('start', 'anchor'),
      match('ip', 'anchor'),
      match('ip', 'orphan_a'),
      link('orphan_a', 'orphan_b'),
    ];

    const positions = radialDagre(graph(nodes, edges, 'start'), classify);
    for (const id of ['orphan_a', 'orphan_b', 'ip']) {
      expect(positions.get(id)).toBeDefined();
    }

    const ip = centerOf(positions, nodes, 'ip');
    const orphanA = centerOf(positions, nodes, 'orphan_a');
    // The orphan stays with its island, not with the root.
    expect(distance(orphanA, ip)).toBeLessThan(distance(orphanA));
  });

  it('fans two satellites that want the same side', () => {
    const nodes = [node('start'), node('east'), satellite('ip_a'), satellite('ip_b')];
    const edges = [link('start', 'east'), match('ip_a', 'east'), match('ip_b', 'east')];

    const positions = radialDagre(graph(nodes, edges, 'start'), classify);
    const a = centerOf(positions, nodes, 'ip_a');
    const b = centerOf(positions, nodes, 'ip_b');

    expect(Math.abs(normalizeAngle(Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x)))).toBeGreaterThan(0.05);
  });

  it('aims a satellite pocket at the centroid of its placed neighbours', () => {
    const nodes = [
      node('user_0001'),
      node('user_0002'),
      node('user_0003'),
      node('user_0004'),
      node('user_0012'),
      node('comp_0001'),
      satellite('same_ip'),
    ];
    const edges = [
      link('user_0001', 'user_0002'),
      link('user_0001', 'user_0003'),
      link('user_0001', 'user_0012'),
      link('user_0001', 'comp_0001'),
      link('user_0004', 'comp_0001'),
      match('same_ip', 'user_0003'),
      match('same_ip', 'comp_0001'),
      match('same_ip', 'user_0004'),
    ];

    const positions = radialDagre(graph(nodes, edges, 'user_0001'), classify);
    const sat = centerOf(positions, nodes, 'same_ip');
    const chiara = centerOf(positions, nodes, 'user_0003');
    const company = centerOf(positions, nodes, 'comp_0001');
    const fourth = centerOf(positions, nodes, 'user_0004');

    expect(distance(centerOf(positions, nodes, 'user_0001'))).toBeLessThan(1);
    expect(distance(sat)).toBeGreaterThan(distance(chiara));

    const centroid = {
      x: (chiara.x + company.x + fourth.x) / 3,
      y: (chiara.y + company.y + fourth.y) / 3,
    };
    const preferred = Math.atan2(centroid.y, centroid.x);
    const actual = Math.atan2(sat.y, sat.x);
    expect(Math.abs(normalizeAngle(actual - preferred))).toBeLessThan(Math.PI / 2);
  });

  it('uses the largest free ring gap when a satellite has no placed anchors', () => {
    const nodes = [node('start'), node('n1'), node('n2'), node('n3'), satellite('orphan_ip')];
    const edges = [link('start', 'n1'), link('start', 'n2'), link('start', 'n3')];

    const positions = radialDagre(graph(nodes, edges, 'start'), classify);
    const c = centerOf(positions, nodes, 'orphan_ip');

    // Placed on the outer arc, not left at the origin on top of the root.
    expect(distance(c)).toBeGreaterThan(100);

    // And in a gap, not on top of a level-1 slot angle.
    const satAngle = Math.atan2(c.y, c.x);
    for (const i of [0, 1, 2]) {
      expect(Math.abs(normalizeAngle(satAngle - slotAngle(i, 3)))).toBeGreaterThan(0.2);
    }
  });
});

describe.each(LAYOUTS)('$name', ({ run }) => {
  it('returns nothing for an empty graph', () => {
    expect(run(graph([], [], 'nope')).size).toBe(0);
  });

  it('centres the root at the origin', () => {
    const nodes = [node('root'), node('a'), node('b')];
    const positions = run(graph(nodes, [link('root', 'a'), link('root', 'b')], 'root'), classify);
    expect(distance(centerOf(positions, nodes, 'root'))).toBeLessThan(1e-6);
  });

  it('falls back to the first node when the requested root is absent', () => {
    const nodes = [node('a'), node('b')];
    const positions = run(graph(nodes, [link('a', 'b')], 'ghost'), classify);
    expect(distance(centerOf(positions, nodes, 'a'))).toBeLessThan(1e-6);
  });

  it('places every node exactly once, with no two overlapping', () => {
    const nodes = [node('root'), node('a'), node('b'), node('c'), node('d'), node('e'), satellite('sat')];
    const edges = [
      link('root', 'a'),
      link('root', 'b'),
      link('root', 'c'),
      link('a', 'd'),
      link('b', 'e'),
      match('sat', 'd'),
    ];

    const positions = run(graph(nodes, edges, 'root'), classify);
    expect(positions.size).toBe(nodes.length);
    expectNoOverlaps(nodes, positions);
  });

  it('gives an orphan component a pocket even with no satellite to claim it', () => {
    // 'far_a'/'far_b' hang off the root by an associative edge only, so the
    // structural tree cannot reach them and no satellite exists to adopt them.
    const nodes = [node('root'), node('a'), node('far_a'), node('far_b')];
    const edges = [link('root', 'a'), match('root', 'far_a'), link('far_a', 'far_b')];

    const positions = run(graph(nodes, edges, 'root'), classify);
    expect(positions.size).toBe(nodes.length);

    // Placed out on the arc, not stacked at the origin under the root.
    expect(distance(centerOf(positions, nodes, 'far_a'))).toBeGreaterThan(100);
    expect(distance(centerOf(positions, nodes, 'far_b'))).toBeGreaterThan(100);
    expectNoOverlaps(nodes, positions);
  });

  it('honours a getWeight override when ordering ring slots', () => {
    // Six siblings: equal weights order alphabetically, so 'zeta' lands last.
    // Declaring it heavy must promote it to the first slot instead. Six rather
    // than three so sectoredDagre is over its bushy threshold and actually
    // sectors them — below it, it uses one shallow pocket and ignores weight.
    const kids = ['alpha', 'beta', 'delta', 'epsilon', 'gamma', 'zeta'];
    const nodes = [node('root'), ...kids.map((id) => node(id))];
    const edges = kids.map((id) => link('root', id));

    const base = run(graph(nodes, edges, 'root'), classify);
    const weighted = run(graph(nodes, edges, 'root'), {
      ...classify,
      getWeight: (n: TestNode) => (n.id === 'zeta' ? 20 : 1),
    });

    const before = centerOf(base, nodes, 'zeta');
    const after = centerOf(weighted, nodes, 'zeta');
    expect(distance(before, after)).toBeGreaterThan(1);
  });

  it('treats every edge as structural and every node as ordinary by default', () => {
    const nodes = [node('root'), node('a'), node('b')];
    // No predicates: the associative edge must still build the tree.
    const positions = run(graph(nodes, [match('root', 'a'), match('a', 'b')], 'root'));
    expect(positions.size).toBe(3);
    expect(distance(centerOf(positions, nodes, 'b'))).toBeGreaterThan(0);
  });
});

describe('polarPetal pocket sizing', () => {
  it('keeps multi-level islands from overlapping', () => {
    // Two satellites wanting the same side, each owning a two-level island.
    // Measuring only the largest single node under-reports how far the petals
    // spread, and the pockets collide.
    const nodes = [
      node('root'),
      node('east'),
      satellite('s1'),
      satellite('s2'),
      node('a1'),
      node('a2'),
      node('a3'),
      node('b1'),
      node('b2'),
      node('b3'),
    ];
    const edges = [
      link('root', 'east'),
      match('s1', 'east'),
      match('s2', 'east'),
      match('s1', 'a1'),
      link('a1', 'a2'),
      link('a1', 'a3'),
      match('s2', 'b1'),
      link('b1', 'b2'),
      link('b1', 'b3'),
    ];

    const positions = polarPetal(graph(nodes, edges, 'root'), classify);
    expect(positions.size).toBe(nodes.length);
    expectNoOverlaps(nodes, positions);
  });
});

function expectNoOverlaps(nodes: TestNode[], positions: Map<string, { x: number; y: number }>): void {
  const placed = nodes.map((n) => ({ id: n.id, pos: positions.get(n.id)!, node: n })).filter((p) => p.pos);

  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i]!;
      const b = placed[j]!;
      const overlapX = Math.abs(a.pos.x - b.pos.x) < NODE_SIZE.width;
      const overlapY = Math.abs(a.pos.y - b.pos.y) < NODE_SIZE.height;
      if (overlapX && overlapY) {
        throw new Error(`${a.id} and ${b.id} overlap at ${JSON.stringify(a.pos)} / ${JSON.stringify(b.pos)}`);
      }
    }
  }
}
