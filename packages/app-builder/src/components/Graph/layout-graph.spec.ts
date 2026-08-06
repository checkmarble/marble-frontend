import { describe, expect, it } from 'vitest';
import { type GraphRfEdge, type GraphRfNode } from './graph-rf-types';
import {
  claimUnplacedComponent,
  fanConnectorAngles,
  largestFreeGapAngle,
  layoutGraphElements,
  normalizeAngle,
  preferredConnectorAngle,
  slotAngle,
} from './layout-graph';

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

function companyNode(id: string): GraphRfNode {
  return {
    id,
    position: { x: 0, y: 0 },
    type: 'person',
    data: {
      label: id,
      subEntity: 'moral',
      isStart: false,
      objectType: 'companies',
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
    animated: true,
    label,
    data: { kind: 'match' },
  };
}

function centerOf(node: GraphRfNode): { x: number; y: number } {
  const w = node.measured?.width ?? node.width ?? 180;
  const h = node.measured?.height ?? node.height ?? 56;
  return { x: node.position.x + w / 2, y: node.position.y + h / 2 };
}

describe('preferredConnectorAngle', () => {
  it('returns null when there are no placed anchors', () => {
    expect(preferredConnectorAngle({ x: 0, y: 0 }, [])).toBeNull();
  });

  it('points toward the centroid of placed match neighbors', () => {
    const theta = preferredConnectorAngle({ x: 0, y: 0 }, [
      { x: 100, y: 0 },
      { x: 200, y: 0 },
    ]);
    expect(theta).not.toBeNull();
    expect(theta!).toBeCloseTo(0, 5);
  });
});

describe('largestFreeGapAngle', () => {
  it('defaults to east when there are no L1 slots', () => {
    expect(largestFreeGapAngle([])).toBe(0);
  });

  it('returns the midpoint of the largest gap between L1 angles', () => {
    // Clustered on the right; largest open sector is the left half-plane.
    const thetas = [-0.2, 0, 0.2];
    const mid = largestFreeGapAngle(thetas);
    // Wrap gap from 0.2 → (-0.2 + 2π); midpoint ≈ π.
    expect(Math.abs(normalizeAngle(mid - Math.PI))).toBeLessThan(0.05);
  });
});

describe('fanConnectorAngles', () => {
  it('keeps a single connector on its preferred angle', () => {
    const angles = fanConnectorAngles([{ id: 'a', preferredTheta: Math.PI / 2, lateralHalf: 40 }], 300);
    expect(angles.get('a')).toBeCloseTo(Math.PI / 2, 5);
  });

  it('spreads two connectors that share a preferred side', () => {
    const angles = fanConnectorAngles(
      [
        { id: 'a', preferredTheta: 0, lateralHalf: 80 },
        { id: 'b', preferredTheta: 0.05, lateralHalf: 80 },
      ],
      300,
    );
    const a = angles.get('a')!;
    const b = angles.get('b')!;
    expect(Math.abs(normalizeAngle(b - a))).toBeGreaterThan(0.1);
  });
});

describe('claimUnplacedComponent', () => {
  it('claims the full unplaced component and removes ids from the set', () => {
    const unplaced = new Set(['pivot', 'only_a', 'only_b', 'other']);
    const adj = new Map<string, string[]>([
      ['pivot', ['only_a']],
      ['only_a', ['pivot', 'only_b']],
      ['only_b', ['only_a']],
      ['other', []],
    ]);

    const claimed = claimUnplacedComponent('pivot', unplaced, adj);
    expect(claimed).toEqual(['pivot', 'only_a', 'only_b']);
    expect(unplaced.has('other')).toBe(true);
    expect(unplaced.has('pivot')).toBe(false);
  });

  it('first claim wins — second pivot cannot re-claim nodes', () => {
    const unplaced = new Set(['p1', 'p2', 'shared']);
    const adj = new Map<string, string[]>([
      ['p1', ['shared']],
      ['p2', ['shared']],
      ['shared', ['p1', 'p2']],
    ]);
    const skipPivots = new Set(['p1', 'p2']);

    const first = claimUnplacedComponent('p1', unplaced, adj, skipPivots);
    const second = claimUnplacedComponent('p2', unplaced, adj, skipPivots);
    expect(first).toEqual(['p1', 'shared']);
    expect(second).toEqual(['p2']);
  });
});

describe('layoutGraphElements', () => {
  it('keeps the connector out of the link spanning-tree star (not a deep child above start)', () => {
    const nodes: GraphRfNode[] = [
      personNode('start', true),
      personNode('chiara'),
      personNode('other'),
      companyNode('company'),
      pivotNode('same_ip:1'),
    ];
    const edges: GraphRfEdge[] = [
      linkEdge('start', 'chiara'),
      linkEdge('start', 'other'),
      linkEdge('start', 'company'),
      matchEdge('same_ip:1', 'chiara'),
      matchEdge('same_ip:1', 'company'),
    ];

    const { nodes: laid } = layoutGraphElements(nodes, edges, 'start');
    const byId = new Map(laid.map((n) => [n.id, n]));
    const start = centerOf(byId.get('start')!);
    const pivot = centerOf(byId.get('same_ip:1')!);
    const chiara = centerOf(byId.get('chiara')!);

    // Start stays near origin.
    expect(start.x).toBeCloseTo(0, 0);
    expect(start.y).toBeCloseTo(0, 0);

    // Connector is outside the person ring (farther from start than L1 persons).
    const pivotDist = Math.hypot(pivot.x - start.x, pivot.y - start.y);
    const chiaraDist = Math.hypot(chiara.x - start.x, chiara.y - start.y);
    expect(pivotDist).toBeGreaterThan(chiaraDist);

    // Not parked as a deep TB branch directly above start (legacy bug).
    expect(Math.abs(pivot.x)).toBeGreaterThan(40);
  });

  it('places a match-only chain as a Dagre island under the claiming connector', () => {
    const nodes: GraphRfNode[] = [
      personNode('start', true),
      personNode('anchor'),
      personNode('orphan_a'),
      personNode('orphan_b'),
      pivotNode('ip'),
    ];
    const edges: GraphRfEdge[] = [
      linkEdge('start', 'anchor'),
      matchEdge('ip', 'anchor'),
      matchEdge('ip', 'orphan_a'),
      linkEdge('orphan_a', 'orphan_b'),
    ];

    const { nodes: laid } = layoutGraphElements(nodes, edges, 'start');
    const byId = new Map(laid.map((n) => [n.id, n]));

    expect(byId.get('orphan_a')?.position).toBeDefined();
    expect(byId.get('orphan_b')?.position).toBeDefined();
    expect(byId.get('ip')?.position).toBeDefined();

    const ip = centerOf(byId.get('ip')!);
    const orphanA = centerOf(byId.get('orphan_a')!);
    // Orphan stays near the connector island, not near start.
    const distOrphanToIp = Math.hypot(orphanA.x - ip.x, orphanA.y - ip.y);
    const distOrphanToStart = Math.hypot(orphanA.x, orphanA.y);
    expect(distOrphanToIp).toBeLessThan(distOrphanToStart);
  });

  it('fans two connectors that share the same preferred side', () => {
    const nodes: GraphRfNode[] = [personNode('start', true), personNode('east'), pivotNode('ip_a'), pivotNode('ip_b')];
    const edges: GraphRfEdge[] = [linkEdge('start', 'east'), matchEdge('ip_a', 'east'), matchEdge('ip_b', 'east')];

    const { nodes: laid } = layoutGraphElements(nodes, edges, 'start');
    const byId = new Map(laid.map((n) => [n.id, n]));
    const a = centerOf(byId.get('ip_a')!);
    const b = centerOf(byId.get('ip_b')!);

    const angleA = Math.atan2(a.y, a.x);
    const angleB = Math.atan2(b.y, b.x);
    expect(Math.abs(normalizeAngle(angleA - angleB))).toBeGreaterThan(0.05);
  });

  it('Complete-shaped fixture: start at hub, same_ip on the match-neighbor side', () => {
    const nodes: GraphRfNode[] = [
      personNode('users:user_0001', true),
      personNode('users:user_0002'),
      personNode('users:user_0003'),
      personNode('users:user_0004'),
      personNode('users:user_0012'),
      companyNode('companies:comp_0001'),
      pivotNode('same_ip:96.220.94.92/32'),
    ];
    const edges: GraphRfEdge[] = [
      linkEdge('users:user_0001', 'users:user_0002'),
      linkEdge('users:user_0001', 'users:user_0003'),
      linkEdge('users:user_0001', 'users:user_0012'),
      linkEdge('users:user_0001', 'companies:comp_0001'),
      linkEdge('users:user_0004', 'companies:comp_0001'),
      matchEdge('same_ip:96.220.94.92/32', 'users:user_0003'),
      matchEdge('same_ip:96.220.94.92/32', 'companies:comp_0001'),
      matchEdge('same_ip:96.220.94.92/32', 'users:user_0004'),
    ];

    const { nodes: laid } = layoutGraphElements(nodes, edges, 'users:user_0001');
    const byId = new Map(laid.map((n) => [n.id, n]));

    const start = centerOf(byId.get('users:user_0001')!);
    const pivot = centerOf(byId.get('same_ip:96.220.94.92/32')!);
    const chiara = centerOf(byId.get('users:user_0003')!);
    const company = centerOf(byId.get('companies:comp_0001')!);

    expect(Math.hypot(start.x, start.y)).toBeLessThan(1);

    const pivotDist = Math.hypot(pivot.x, pivot.y);
    const chiaraDist = Math.hypot(chiara.x, chiara.y);
    expect(pivotDist).toBeGreaterThan(chiaraDist);

    // Preferred side aligns with the match-neighbor centroid (not straight up as a TB leaf).
    const neighborCentroid = {
      x: (chiara.x + company.x + centerOf(byId.get('users:user_0004')!).x) / 3,
      y: (chiara.y + company.y + centerOf(byId.get('users:user_0004')!).y) / 3,
    };
    const preferred = Math.atan2(neighborCentroid.y, neighborCentroid.x);
    const actual = Math.atan2(pivot.y, pivot.x);
    expect(Math.abs(normalizeAngle(actual - preferred))).toBeLessThan(Math.PI / 2);
  });

  it('uses the largest free L1 gap when a connector has no placed match anchors', () => {
    // Connector present but its only match target is filtered out / absent from nodes.
    const nodes: GraphRfNode[] = [
      personNode('start', true),
      personNode('n1'),
      personNode('n2'),
      personNode('n3'),
      pivotNode('orphan_ip'),
    ];
    const edges: GraphRfEdge[] = [
      linkEdge('start', 'n1'),
      linkEdge('start', 'n2'),
      linkEdge('start', 'n3'),
      // Match edge to a node not in the graph — connector has zero placed anchors.
    ];

    const { nodes: laid } = layoutGraphElements(nodes, edges, 'start');
    const pivot = laid.find((n) => n.id === 'orphan_ip')!;
    const c = centerOf(pivot);

    // Still placed somewhere on the outer pocket (not left at 0,0 overlapping start).
    expect(Math.hypot(c.x, c.y)).toBeGreaterThan(100);

    // Should land in a free gap — not on top of an L1 person center angle.
    const l1Angles = [0, 1, 2].map((i) => slotAngle(i, 3));
    const pivotAngle = Math.atan2(c.y, c.x);
    for (const a of l1Angles) {
      expect(Math.abs(normalizeAngle(pivotAngle - a))).toBeGreaterThan(0.2);
    }
  });
});
