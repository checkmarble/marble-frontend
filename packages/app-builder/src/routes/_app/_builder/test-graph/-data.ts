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

export const GRAPH_DATASET_LABELS = ['Minimal', 'Star', 'Company', 'Complete'] as const;

/** Test fixtures from simplest to densest. Node ids match seeded DB records. */
export const graphDatasets: GraphData[] = [
  {
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
    ],
  },
  {
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
  {
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
  {
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
    ],
  },
];
