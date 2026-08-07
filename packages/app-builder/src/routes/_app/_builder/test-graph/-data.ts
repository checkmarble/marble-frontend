const USER_ID_MIN = 100;
const USER_ID_MAX = 300;
const COMPANY_ID_MIN = 100;
const COMPANY_ID_MAX = 299;
const DEFAULT_EDGE_DENSITY = 0.5;

const PIVOT_TYPES = ['same_ip', 'same_iban', 'same_email', 'same_device'] as const;
type PivotType = (typeof PIVOT_TYPES)[number];

const LINK_LABEL_DEVICE = 'login_user > login_device > login_device > login_user';
const LINK_LABEL_COMPANY = 'login_company > login_user';

export type GraphNodeRef = {
  type: string;
  id: string;
};

export type NodeData = GraphNodeRef & {
  connector?: boolean;
  connector_kind?: string;
};

export type EdgeData = {
  from: GraphNodeRef;
  to: GraphNodeRef;
  kind: string;
  label: string;
  field?: string;
  value?: string;
};

export type GraphData = {
  start: GraphNodeRef;
  nodes: NodeData[];
  edges: EdgeData[];
};

export type StartData = GraphData['start'];

/** Test fixtures from simplest to densest. Node ids match seeded DB records. */
export const graphDatasets: Record<string, GraphData> = {
  simple: {
    start: {
      type: 'users',
      id: 'user_0001',
    },
    nodes: [
      {
        type: 'users',
        id: 'user_0001',
      },
      {
        type: 'users',
        id: 'user_0002',
      },
      {
        type: 'users',
        id: 'user_0003',
      },
      {
        type: 'users',
        id: 'user_0004',
      },
    ],
    edges: [
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0002',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0003',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0004',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
    ],
  },
  star: {
    start: {
      type: 'users',
      id: 'user_0001',
    },
    nodes: [
      {
        type: 'users',
        id: 'user_0001',
      },
      {
        type: 'users',
        id: 'user_0002',
      },
      {
        type: 'users',
        id: 'user_0003',
      },
      {
        type: 'users',
        id: 'user_0012',
      },
      {
        type: 'users',
        id: 'user_0018',
      },
      {
        type: 'users',
        id: 'user_0021',
      },
      {
        type: 'users',
        id: 'user_0023',
      },
      {
        type: 'users',
        id: 'user_0032',
      },
    ],
    edges: [
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0002',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0003',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0012',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0018',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0021',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0018',
        },
        to: {
          type: 'users',
          id: 'user_0032',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0023',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0002',
        },
        to: {
          type: 'users',
          id: 'user_0003',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
    ],
  },
  company: {
    start: {
      type: 'users',
      id: 'user_0001',
    },
    nodes: [
      {
        type: 'users',
        id: 'user_0001',
      },
      {
        type: 'users',
        id: 'user_0002',
      },
      {
        type: 'users',
        id: 'user_0003',
      },
      {
        type: 'users',
        id: 'user_0004',
      },
      {
        type: 'companies',
        id: 'comp_0001',
      },
      {
        type: 'users',
        id: 'user_0006',
      },
      {
        type: 'users',
        id: 'user_0012',
      },
      {
        type: 'users',
        id: 'user_0018',
      },
      {
        type: 'users',
        id: 'user_0021',
      },
      {
        type: 'users',
        id: 'user_0023',
      },
      {
        type: 'users',
        id: 'user_0032',
      },
    ],
    edges: [
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0002',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0003',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0012',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0018',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0021',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0018',
        },
        to: {
          type: 'users',
          id: 'user_0032',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0023',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0002',
        },
        to: {
          type: 'users',
          id: 'user_0003',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0004',
        },
        to: {
          type: 'companies',
          id: 'comp_0001',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'companies',
          id: 'comp_0001',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0003',
        },
        to: {
          type: 'companies',
          id: 'comp_0001',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'companies',
          id: 'comp_0001',
        },
        to: {
          type: 'users',
          id: 'user_0006',
        },
        kind: 'link',
        label: 'login_company > login_user',
      },
    ],
  },
  complex: {
    start: {
      type: 'users',
      id: 'user_0001',
    },
    nodes: [
      {
        type: 'users',
        id: 'user_0001',
      },
      {
        type: 'users',
        id: 'user_0002',
      },
      {
        type: 'users',
        id: 'user_0003',
      },
      {
        type: 'same_ip',
        id: '96.220.94.92/32',
        connector: true,
        connector_kind: 'match',
      },
      {
        type: 'same_iban',
        id: 'DE89370400440532013000',
        connector: true,
        connector_kind: 'match',
      },
      {
        type: 'same_email',
        id: 'john.doe@example.com',
        connector: true,
        connector_kind: 'match',
      },

      {
        type: 'users',
        id: 'user_0004',
      },
      {
        type: 'companies',
        id: 'comp_0001',
      },
      {
        type: 'users',
        id: 'user_0006',
      },
      {
        type: 'users',
        id: 'user_0012',
      },
      {
        type: 'users',
        id: 'user_0018',
      },
      {
        type: 'users',
        id: 'user_0021',
      },
      {
        type: 'users',
        id: 'user_0023',
      },
      {
        type: 'users',
        id: 'user_0029',
      },
      {
        type: 'users',
        id: 'user_0030',
      },
      {
        type: 'users',
        id: 'user_0031',
      },
      {
        type: 'users',
        id: 'user_0032',
      },
      {
        type: 'users',
        id: 'user_0037',
      },
      {
        type: 'users',
        id: 'user_0040',
      },
    ],
    edges: [
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0002',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0003',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0012',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0018',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0021',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0018',
        },
        to: {
          type: 'users',
          id: 'user_0032',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'same_ip',
          id: '96.220.94.92/32',
        },
        to: {
          type: 'users',
          id: 'user_0003',
        },
        kind: 'match',
        label: 'same_ip',
      },
      {
        from: {
          type: 'same_ip',
          id: '96.220.94.92/32',
        },
        to: {
          type: 'companies',
          id: 'comp_0001',
        },
        kind: 'match',
        label: 'same_ip',
      },
      {
        from: {
          type: 'same_ip',
          id: '96.220.94.92/32',
        },
        to: {
          type: 'users',
          id: 'user_0004',
        },
        kind: 'match',
        label: 'same_ip',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'users',
          id: 'user_0023',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0002',
        },
        to: {
          type: 'users',
          id: 'user_0003',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0004',
        },
        to: {
          type: 'companies',
          id: 'comp_0001',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0001',
        },
        to: {
          type: 'companies',
          id: 'comp_0001',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'users',
          id: 'user_0003',
        },
        to: {
          type: 'companies',
          id: 'comp_0001',
        },
        kind: 'link',
        label: 'login_user > login_device > login_device > login_user',
      },
      {
        from: {
          type: 'companies',
          id: 'comp_0001',
        },
        to: {
          type: 'users',
          id: 'user_0006',
        },
        kind: 'link',
        label: 'login_company > login_user',
      },
      {
        from: {
          type: 'same_iban',
          id: 'DE89370400440532013000',
        },
        to: {
          type: 'users',
          id: 'user_0001',
        },
        kind: 'match',
        label: 'same_iban',
      },
      {
        from: {
          type: 'same_iban',
          id: 'DE89370400440532013000',
        },
        to: {
          type: 'companies',
          id: 'comp_0001',
        },
        kind: 'match',
        label: 'same_iban',
      },
      {
        from: {
          type: 'same_iban',
          id: 'DE89370400440532013000',
        },
        to: {
          type: 'users',
          id: 'user_0032',
        },
        kind: 'match',
        label: 'same_iban',
      },
      {
        from: {
          type: 'same_email',
          id: 'john.doe@example.com',
        },
        to: {
          type: 'users',
          id: 'user_0001',
        },
        kind: 'match',
        label: 'same_email',
      },
      {
        from: {
          type: 'same_email',
          id: 'john.doe@example.com',
        },
        to: {
          type: 'users',
          id: 'user_0004',
        },
        kind: 'match',
        label: 'same_email',
      },
      {
        from: {
          type: 'same_email',
          id: 'john.doe@example.com',
        },
        to: {
          type: 'users',
          id: 'user_0006',
        },
        kind: 'match',
        label: 'same_email',
      },
      {
        from: {
          type: 'same_email',
          id: 'john.doe@example.com',
        },
        to: {
          type: 'users',
          id: 'user_0021',
        },
        kind: 'match',
        label: 'same_email',
      },
      {
        from: {
          type: 'same_email',
          id: 'john.doe@example.com',
        },
        to: {
          type: 'users',
          id: 'user_0029',
        },
        kind: 'match',
        label: 'same_email',
      },
      {
        from: {
          type: 'same_email',
          id: 'john.doe@example.com',
        },
        to: {
          type: 'users',
          id: 'user_0012',
        },
        kind: 'match',
        label: 'same_email',
      },
    ],
  },
  custom: generateCustomGraph(),
} as const;

export const GRAPH_DATASET_LABELS = Object.keys(graphDatasets);

export function generateCustomGraph(
  nodeCount = 20,
  startConnections = 5,
  edgeDensity = DEFAULT_EDGE_DENSITY,
): GraphData {
  const nodes = generateNodes(nodeCount);
  const startUser = nodes.find((n) => n.type === 'users') ?? nodes[0]!;
  const start = { type: startUser.type, id: startUser.id };
  return {
    start,
    nodes,
    edges: generateEdges(nodes, undefined, start, startConnections, edgeDensity),
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sampleUnique<T>(items: T[], count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

function padId(prefix: string, n: number, width: number): string {
  return `${prefix}_${n.toString().padStart(width, '0')}`;
}

function buildEntityPool(): NodeData[] {
  const users: NodeData[] = Array.from({ length: USER_ID_MAX - USER_ID_MIN + 1 }, (_, i) => ({
    type: 'users',
    id: padId('user', USER_ID_MIN + i, 4),
  }));
  const companies: NodeData[] = Array.from({ length: COMPANY_ID_MAX - COMPANY_ID_MIN + 1 }, (_, i) => ({
    type: 'companies',
    id: padId('comp', COMPANY_ID_MIN + i, 4),
  }));
  return [...users, ...companies];
}

function makePivotId(type: PivotType, index: number): string {
  switch (type) {
    case 'same_ip':
      return `${randomInt(1, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}/32`;
    case 'same_iban':
      return `DE${randomInt(10, 99)}${randomInt(10000000, 99999999)}${randomInt(10000000, 99999999)}${index}`;
    case 'same_email':
      return `pivot${index}.${randomInt(1000, 9999)}@example.com`;
    case 'same_device':
      return `device_${index}`;
  }
}

function generatePivots(): NodeData[] {
  const count = randomInt(1, 5);
  const usedIds = new Set<string>();
  const pivots: NodeData[] = [];

  for (let i = 0; i < count; i++) {
    const type = PIVOT_TYPES[randomInt(0, PIVOT_TYPES.length - 1)]!;
    let id = makePivotId(type, i);
    while (usedIds.has(`${type}:${id}`)) {
      id = makePivotId(type, i);
    }
    usedIds.add(`${type}:${id}`);
    pivots.push({
      type,
      id,
      connector: true,
      connector_kind: 'match',
    });
  }

  return pivots;
}

function linkLabel(from: NodeData, to: NodeData): string {
  if (from.type === 'companies' || to.type === 'companies') {
    return Math.random() < 0.5 ? LINK_LABEL_COMPANY : LINK_LABEL_DEVICE;
  }
  return LINK_LABEL_DEVICE;
}

function pairKey(a: GraphNodeRef, b: GraphNodeRef): string {
  const left = `${a.type}:${a.id}`;
  const right = `${b.type}:${b.id}`;
  return left < right ? `${left}|${right}` : `${right}|${left}`;
}

function generateNodes(nodeCount = 100): NodeData[] {
  const pool = buildEntityPool();
  const count = Math.min(nodeCount, pool.length);
  let entities = sampleUnique(pool, count);

  if (!entities.some((n) => n.type === 'users')) {
    const user = pool.find((n) => n.type === 'users')!;
    entities = [user, ...entities.slice(0, Math.max(0, entities.length - 1))];
  }

  return [...entities, ...generatePivots()];
}

function isSameRef(a: GraphNodeRef, b: GraphNodeRef): boolean {
  return a.type === b.type && a.id === b.id;
}

function generateEdges(
  nodes: NodeData[],
  edgeCount?: number,
  start?: GraphNodeRef,
  startConnections = 5,
  edgeDensity = DEFAULT_EDGE_DENSITY,
): EdgeData[] {
  const entities = nodes.filter((n) => !n.connector);
  const pivots = nodes.filter((n) => n.connector);
  const linkEdgeCount = edgeCount ?? entities.length * edgeDensity;
  const edges: EdgeData[] = [];
  const seenPairs = new Set<string>();
  const randomizedStart = randomInt(startConnections * 0.8, startConnections);

  const startNode =
    (start ? entities.find((n) => isSameRef(n, start)) : undefined) ?? entities.find((n) => n.type === 'users');
  const others = startNode ? entities.filter((n) => !isSameRef(n, startNode)) : entities;

  if (startNode && others.length > 0) {
    const targetDegree = Math.min(Math.max(1, randomizedStart), others.length);
    for (const neighbor of sampleUnique(others, targetDegree)) {
      const key = pairKey(startNode, neighbor);
      seenPairs.add(key);
      edges.push({
        from: { type: startNode.type, id: startNode.id },
        to: { type: neighbor.type, id: neighbor.id },
        kind: 'link',
        label: linkLabel(startNode, neighbor),
      });
    }
  }

  // Remaining link edges avoid the start node so its degree stays in [5, 20].
  const peripheral = others;
  const maxPeripheralPairs = (peripheral.length * (peripheral.length - 1)) / 2;
  let peripheralEdges = 0;
  let attempts = 0;
  const maxAttempts = linkEdgeCount * 10;
  while (edges.length < linkEdgeCount && peripheralEdges < maxPeripheralPairs && attempts < maxAttempts) {
    attempts++;
    if (peripheral.length < 2) break;
    const [from, to] = sampleUnique(peripheral, 2);
    if (!from || !to) break;
    const key = pairKey(from, to);
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);
    peripheralEdges++;
    edges.push({
      from: { type: from.type, id: from.id },
      to: { type: to.type, id: to.id },
      kind: 'link',
      label: linkLabel(from, to),
    });
  }

  // Attach pivots to peripheral entities only so the start node's degree stays in [5, 20].
  const pivotTargets = others.length > 0 ? others : entities;
  for (const pivot of pivots) {
    const maxAttach = Math.max(0, Math.ceil(entities.length * 0.2) - 1);
    if (maxAttach < 1 || pivotTargets.length === 0) continue;
    const minAttach = Math.min(2, maxAttach);
    const k = randomInt(minAttach, Math.min(maxAttach, pivotTargets.length));
    const attached = sampleUnique(pivotTargets, k);
    for (const entity of attached) {
      edges.push({
        from: { type: pivot.type, id: pivot.id },
        to: { type: entity.type, id: entity.id },
        kind: 'match',
        label: pivot.type,
      });
    }
  }

  return edges;
}
