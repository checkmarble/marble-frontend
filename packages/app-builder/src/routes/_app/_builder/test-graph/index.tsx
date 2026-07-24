import { Page } from '@app-builder/components';
import { type FtmEntityPersonOption } from '@app-builder/models/data-model';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import {
  applyEdgeChanges,
  applyNodeChanges,
  BaseEdge,
  ControlButton,
  Controls,
  type Edge,
  type EdgeChange,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  Handle,
  type Node,
  type NodeChange,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { graphData } from './data';
import { type NonPersonSemantic, semanticTypeLabel } from './data-model-map';
import { type FlowGraph, type GroupLeaf, nodeKey, type PersonLeaf, transformDataToFlow } from './utils';
import '@xyflow/react/dist/style.css';

const ShowEdgeLabelsContext = createSimpleContext<{ show: boolean }>('ShowEdgeLabels');

const GROUP_RADIUS = 200;
const PERSON_RADIUS = 380;
const NESTED_GROUP_RADIUS = 160;
const NESTED_PERSON_RADIUS = 300;

const uploadLoader = createServerFn().handler(() => ({ data: graphData }));

export const Route = createFileRoute('/_app/_builder/test-graph/')({
  loader: () => uploadLoader(),
  component: RouteComponent,
});

type PersonRfData = {
  label: string;
  subEntity: FtmEntityPersonOption;
  isStart: boolean;
};

type GroupRfData = {
  semanticType: NonPersonSemantic;
  label: string;
  memberCount: number;
};

type PersonRfNode = Node<PersonRfData, 'person'>;
/** Not named `group` — that collides with React Flow's built-in parent-group node styles. */
type GroupRfNode = Node<GroupRfData, 'typeGroup'>;
type GraphRfNode = PersonRfNode | GroupRfNode;

type GraphRfEdge = Edge<{ kind?: string }, 'link' | 'back'>;

type HandleSide = 't' | 'r' | 'b' | 'l';

function nodeCenter(node: GraphRfNode): { x: number; y: number } {
  const w = node.measured?.width ?? 120;
  const h = node.measured?.height ?? 40;
  return { x: node.position.x + w / 2, y: node.position.y + h / 2 };
}

/** Dominant axis from source → target (avoids e.g. Top→Bottom when nodes are side-by-side). */
function sideFromDelta(dx: number, dy: number): HandleSide {
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'r' : 'l';
  }
  return dy >= 0 ? 'b' : 't';
}

function handlesForEdge(
  source: GraphRfNode,
  target: GraphRfNode,
): {
  sourceHandle: string;
  targetHandle: string;
} {
  const from = nodeCenter(source);
  const to = nodeCenter(target);
  const sourceSide = sideFromDelta(to.x - from.x, to.y - from.y);
  const targetSide = sideFromDelta(from.x - to.x, from.y - to.y);
  return {
    sourceHandle: `s${sourceSide}`,
    targetHandle: targetSide,
  };
}

function withBestHandles(nodes: GraphRfNode[], edges: GraphRfEdge[]): GraphRfEdge[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return edges.map((edge) => {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target) return edge;
    const { sourceHandle, targetHandle } = handlesForEdge(source, target);
    if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) return edge;
    return { ...edge, sourceHandle, targetHandle };
  });
}

function RouteComponent() {
  const { data } = Route.useLoaderData();
  const flowGraph = useMemo(() => transformDataToFlow(data, { maxDepth: 2 }), [data]);

  return (
    <Page.Main>
      <Page.Header>Test graph</Page.Header>
      <Page.Container>
        <Page.Content>
          <ReactFlowProvider>
            <GraphImpl data={flowGraph} />
          </ReactFlowProvider>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

function personLabel(leaf: PersonLeaf): string {
  return leaf.node.id;
}

function groupNodeId(ownerKey: string, semanticType: NonPersonSemantic): string {
  return `group:${ownerKey}:${semanticType}`;
}

function expandPerson(
  leaf: PersonLeaf,
  cx: number,
  cy: number,
  /** Angle from this person back toward its parent (undefined for root) */
  inwardAngle: number | undefined,
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
) {
  const groups = [...leaf.groups.entries()];
  if (groups.length === 0) return;

  const ownerKey = nodeKey(leaf.node);
  const isRoot = inwardAngle === undefined;
  const groupRadius = isRoot ? GROUP_RADIUS : NESTED_GROUP_RADIUS;
  const personRadius = isRoot ? PERSON_RADIUS : NESTED_PERSON_RADIUS;

  // Root: full circle. Nested: fan outward (away from parent).
  const outwardBase = isRoot ? -Math.PI / 2 : inwardAngle! + Math.PI;
  const spread = isRoot ? Math.PI * 2 : Math.PI * 0.9;

  groups.forEach(([semanticType, group], groupIndex) => {
    const groupAngle = isRoot
      ? -Math.PI / 2 + (Math.PI * 2 * groupIndex) / groups.length
      : groups.length === 1
        ? outwardBase
        : outwardBase - spread / 2 + (spread * groupIndex) / (groups.length - 1);

    const groupPos = polar(cx, cy, groupRadius, groupAngle);
    const gId = groupNodeId(ownerKey, semanticType);

    nodes.push({
      id: gId,
      position: groupPos,
      type: 'typeGroup',
      data: {
        semanticType,
        label: semanticTypeLabel[semanticType],
        memberCount: group.members.length,
      },
    });

    edges.push({
      id: `${ownerKey}->${gId}`,
      source: ownerKey,
      target: gId,
      type: 'link',
      data: { kind: 'link' },
    });

    placeGroupPersons(group, gId, cx, cy, groupAngle, personRadius, spread / Math.max(groups.length, 1), nodes, edges);

    // Recurse into newly placed persons
    for (const [personKey, child] of group.persons) {
      const childNode = nodes.find((n) => n.id === personKey);
      if (!childNode) continue;
      const childInward = Math.atan2(cy - childNode.position.y, cx - childNode.position.x);
      expandPerson(child, childNode.position.x, childNode.position.y, childInward, nodes, edges);
    }
  });
}

function placeGroupPersons(
  group: GroupLeaf,
  groupId: string,
  originX: number,
  originY: number,
  groupAngle: number,
  personRadius: number,
  sectorWidth: number,
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
) {
  const persons = [...group.persons.entries()];

  persons.forEach(([key, leaf], index) => {
    const t = persons.length === 1 ? 0.5 : (index + 0.5) / persons.length;
    const angle = groupAngle - sectorWidth / 2 + sectorWidth * t;
    const pos = polar(originX, originY, personRadius, angle);

    nodes.push({
      id: key,
      position: pos,
      type: 'person',
      data: {
        label: personLabel(leaf),
        subEntity: leaf.subEntity,
        isStart: false,
      },
    });

    edges.push({
      id: `${groupId}->${key}`,
      source: groupId,
      target: key,
      type: 'link',
      data: { kind: 'link' },
    });
  });

  // Back-links: edge to already-placed persons without moving them
  for (const key of group.backLinks) {
    if (!nodes.some((n) => n.id === key)) continue;
    edges.push({
      id: `${groupId}->${key}:back`,
      source: groupId,
      target: key,
      type: 'back',
      data: { kind: 'back' },
    });
  }
}

function buildRadialGraph(data: FlowGraph): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } {
  const startId = nodeKey(data.root.node);
  const nodes: GraphRfNode[] = [
    {
      id: startId,
      position: { x: 0, y: 0 },
      type: 'person',
      data: {
        label: personLabel(data.root),
        subEntity: data.root.subEntity,
        isStart: true,
      },
    },
  ];
  const edges: GraphRfEdge[] = [];
  expandPerson(data.root, 0, 0, undefined, nodes, edges);
  return { nodes, edges: withBestHandles(nodes, edges) };
}

function GraphImpl({ data }: { data: FlowGraph }) {
  const initial = useMemo(() => buildRadialGraph(data), [data]);

  const [nodes, setNodes] = useState(initial.nodes);
  const [edges, setEdges] = useState(initial.edges);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);

  useEffect(() => {
    setNodes(initial.nodes);
    setEdges(initial.edges);
  }, [initial]);

  const onNodesChange = useCallback((changes: NodeChange<GraphRfNode>[]) => {
    setNodes((nds) => {
      const next = applyNodeChanges(changes, nds);
      const shouldRetarget = changes.some((c) => c.type === 'position' || c.type === 'dimensions');
      if (shouldRetarget) {
        setEdges((eds) => withBestHandles(next, eds));
      }
      return next;
    });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<GraphRfEdge>[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  return (
    <ShowEdgeLabelsContext.Provider value={{ show: showEdgeLabels }}>
      <ReactFlow
        nodeTypes={{
          person: PersonNode,
          typeGroup: GroupNode,
        }}
        edgeTypes={{
          link: LinkEdge,
          back: BackEdge,
        }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls>
          <ControlButton
            onClick={() => setShowEdgeLabels((prev) => !prev)}
            title={showEdgeLabels ? 'Hide edge labels' : 'Show edge labels'}
            aria-label={showEdgeLabels ? 'Hide edge labels' : 'Show edge labels'}
          >
            <Icon icon={showEdgeLabels ? 'tip' : 'eye-slash'} className="size-4" />
          </ControlButton>
        </Controls>
      </ReactFlow>
    </ShowEdgeLabelsContext.Provider>
  );
}

function subEntityIcon(subEntity: FtmEntityPersonOption): IconName {
  switch (subEntity) {
    case 'moral':
      return 'dns';
    case 'generic':
      return 'users';
    case 'natural':
    default:
      return 'person';
  }
}

function PersonNode({ data }: NodeProps<PersonRfNode>) {
  return (
    <div
      className={cn(
        'relative flex w-fit items-center gap-xs rounded-lg px-md py-sm text-sm font-medium text-purple-primary shadow-sm bg-purple-background-light border-purple-border',
        data.isStart && 'bg-purple-primary ring-2 ring-purple-primary ring-offset-2 text-white',
      )}
    >
      <Handle type="target" position={Position.Top} id="t" className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Right} id="r" className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Bottom} id="b" className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Left} id="l" className="!bg-transparent !border-0" />
      <div
        className={cn(
          'absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-1/2 rounded-full shrink-0 bg-purple-background-light border-purple-border p-xs',
          data.isStart && 'bg-purple-primary border-purple-primary',
        )}
      >
        <Icon
          icon={subEntityIcon(data.subEntity)}
          className={cn('size-4 text-purple-primary', data.isStart && 'text-white')}
        />
      </div>
      <span>{data.label}</span>
      <Handle type="source" position={Position.Top} id="st" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} id="sr" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Bottom} id="sb" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Left} id="sl" className="!bg-transparent !border-0" />
    </div>
  );
}

function GroupNode({ data }: NodeProps<GroupRfNode>) {
  return (
    <div className="border-purple-border bg-grey-white text-grey-primary relative w-fit rounded-md border px-md py-sm text-sm shadow-sm">
      <Handle type="target" position={Position.Top} id="t" className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Right} id="r" className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Bottom} id="b" className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Left} id="l" className="!bg-transparent !border-0" />
      <span>{data.label}</span>
      <Handle type="source" position={Position.Top} id="st" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} id="sr" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Bottom} id="sb" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Left} id="sl" className="!bg-transparent !border-0" />
    </div>
  );
}

function GraphEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  label,
  strokeClassName,
  labelClassName,
}: EdgeProps & {
  strokeClassName: string;
  labelClassName: string;
}) {
  const { show: showEdgeLabels } = ShowEdgeLabelsContext.useValue();
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} className={strokeClassName} />
      {showEdgeLabels && label ? (
        <EdgeLabelRenderer>
          <div
            className={cn('nodrag nopan absolute origin-center rounded-sm', labelClassName)}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: '6px',
              padding: '2px 4px',
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

function LinkEdge(props: EdgeProps<GraphRfEdge>) {
  return (
    <GraphEdge
      {...props}
      strokeClassName="!stroke-purple-primary !stroke-[2]"
      labelClassName="bg-purple-background-light text-purple-primary border border-purple-border"
    />
  );
}

function BackEdge(props: EdgeProps<GraphRfEdge>) {
  return (
    <GraphEdge
      {...props}
      style={{ ...props.style, strokeDasharray: '6 4' }}
      strokeClassName="!stroke-purple-primary/40 !stroke-[1.5]"
      labelClassName="bg-purple-background-light text-purple-primary border border-purple-border"
    />
  );
}
