import { Page } from '@app-builder/components';
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
  getStraightPath,
  Handle,
  type Node,
  type NodeChange,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { type EdgeData, graphData, type NodeData } from './data';
import '@xyflow/react/dist/style.css';
import { type FlowGraph, nodeKey, transformDataToFlow } from './utils';

const ShowEdgeLabelsContext = createSimpleContext<{ show: boolean }>('ShowEdgeLabels');

const CLUSTER_THRESHOLD = 10;
const CHILD_X = 280;
const CHILD_Y_GAP = 80;

const uploadLoader = createServerFn().handler(() => ({ data: graphData }));

export const Route = createFileRoute('/_app/_builder/test-graph/')({
  loader: () => uploadLoader(),
  component: RouteComponent,
});

type StartRfNode = Node<NodeData, 'start'>;
type LeafRfNode = Node<NodeData, 'leaf'>;
type ClusterRfNode = Node<{ count: number }, 'cluster'>;
type GraphRfNode = StartRfNode | LeafRfNode | ClusterRfNode;

type LinkRfEdge = Edge<EdgeData, 'link'>;
type MatchRfEdge = Edge<EdgeData, 'match'>;
type OtherRfEdge = Edge<EdgeData, 'other'>;
type GraphRfEdge = LinkRfEdge | MatchRfEdge | OtherRfEdge;

function edgeTypeFromKind(kind: string): GraphRfEdge['type'] {
  if (kind === 'link') return 'link';
  if (kind === 'match') return 'match';
  return 'other';
}

function RouteComponent() {
  const { data } = Route.useLoaderData();
  const flowGraph = useMemo(() => transformDataToFlow(data), [data]);

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

function expandChildren(
  parentId: string,
  parentX: number,
  parentY: number,
  children: FlowGraph['root']['children'],
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
) {
  const childList = [...children.values()];
  if (childList.length === 0) return;

  if (childList.length > CLUSTER_THRESHOLD) {
    const clusterId = `cluster:${parentId}`;
    nodes.push({
      id: clusterId,
      position: { x: parentX + CHILD_X, y: parentY },
      type: 'cluster',
      data: { count: childList.length },
    });
    edges.push({
      id: `${parentId}->${clusterId}`,
      source: parentId,
      target: clusterId,
      type: 'other',
      label: `${childList.length} links`,
    });
    return;
  }

  const offsetY = ((childList.length - 1) * CHILD_Y_GAP) / 2;
  childList.forEach((child, index) => {
    const childId = nodeKey(child.node);
    const childY = parentY + index * CHILD_Y_GAP - offsetY;
    const childX = parentX + CHILD_X;

    nodes.push({
      id: childId,
      position: { x: childX, y: childY },
      type: 'leaf',
      data: child.node,
    });

    const edge = child.edgeFromParent;
    if (edge) {
      edges.push({
        id: `${parentId}->${childId}`,
        source: parentId,
        target: childId,
        type: edgeTypeFromKind(edge.kind),
        label: `${edge.kind} · ${edge.label}`,
        data: edge,
      });
    }

    expandChildren(childId, childX, childY, child.children, nodes, edges);
  });
}

function GraphImpl({ data }: { data: FlowGraph }) {
  const initial = useMemo((): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } => {
    const startId = nodeKey(data.root.node);
    const startNode: StartRfNode = {
      id: startId,
      position: { x: 0, y: 0 },
      type: 'start',
      data: data.root.node,
    };

    const nodes: GraphRfNode[] = [startNode];
    const edges: GraphRfEdge[] = [];
    expandChildren(startId, 0, 0, data.root.children, nodes, edges);

    return { nodes, edges };
  }, [data]);

  const [nodes, setNodes] = useState(initial.nodes);
  const [edges, setEdges] = useState(initial.edges);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);

  useEffect(() => {
    setNodes(initial.nodes);
    setEdges(initial.edges);
  }, [initial]);

  const onNodesChange = useCallback((changes: NodeChange<GraphRfNode>[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<GraphRfEdge>[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  return (
    <ShowEdgeLabelsContext.Provider value={{ show: showEdgeLabels }}>
      <ReactFlow
        nodeTypes={{
          start: StartNode,
          leaf: LeafNode,
          cluster: ClusterNode,
        }}
        edgeTypes={{
          link: LinkEdge,
          match: MatchEdge,
          other: OtherEdge,
        }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
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

function StartNode({ data }: NodeProps<StartRfNode>) {
  return (
    <Card className="p-md relative w-fit bg-red-primary text-white">
      <Handle type="source" position={Position.Right} className="!bg-grey-border" />
      {`${data.type} : ${data.id}`}
    </Card>
  );
}

function LeafNode({ data }: NodeProps<LeafRfNode>) {
  const isPivot = 'pivot' in data && data.pivot;
  return (
    <Card className="p-md relative w-fit">
      <Handle type="target" position={Position.Left} className="!bg-grey-border" />
      <div>{`${data.type} : ${data.id}`}</div>
      {isPivot ? <div className="text-grey-secondary text-xs">pivot</div> : null}
      <Handle type="source" position={Position.Right} className="!bg-grey-border" />
    </Card>
  );
}

function ClusterNode({ data }: NodeProps<ClusterRfNode>) {
  return (
    <div className="bg-purple-background-light text-purple-primary border-purple-border relative flex size-[72px] items-center justify-center rounded-full border text-lg font-semibold">
      <Handle type="target" position={Position.Left} className="!bg-grey-border" />
      {data.count}
      <Handle type="source" position={Position.Right} className="!bg-grey-border" />
    </div>
  );
}

function GraphEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
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
  const [path, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
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

function LinkEdge(props: EdgeProps<LinkRfEdge>) {
  return (
    <GraphEdge
      {...props}
      strokeClassName="!stroke-purple-primary !stroke-[2]"
      labelClassName="bg-purple-background-light text-purple-primary border border-purple-border"
    />
  );
}

function MatchEdge(props: EdgeProps<MatchRfEdge>) {
  return (
    <GraphEdge
      {...props}
      style={{ ...props.style, strokeDasharray: '6 4' }}
      strokeClassName="!stroke-orange-primary !stroke-[2]"
      labelClassName="bg-orange-background-light text-orange-primary border border-orange-border"
    />
  );
}

function OtherEdge(props: EdgeProps<OtherRfEdge>) {
  return (
    <GraphEdge
      {...props}
      strokeClassName="!stroke-grey-secondary !stroke-[1.5]"
      labelClassName="bg-grey-background-light text-grey-secondary border border-grey-border"
    />
  );
}
