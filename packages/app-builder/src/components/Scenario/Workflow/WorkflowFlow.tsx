import {
  AutoLayoutControlButton,
  useIsValidConnection,
  useLayoutInitializedNodes,
} from '@app-builder/components/ReactFlow';
import Dagre from '@dagrejs/dagre';
import type * as React from 'react';
import {
  Background,
  Controls,
  type DefaultEdgeOptions,
  type Edge,
  MarkerType,
  type Node,
  type NodeOrigin,
  type NodeProps,
  ReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import reactflowStyles from 'reactflow/dist/style.css';

import { type NodeData, type NodeType } from './models/nodes';
import { Action } from './Nodes/Action';
import { EmptyNode } from './Nodes/EmptyNode';
import { Trigger } from './Nodes/Trigger';
import {
  nodesep,
  useEdges,
  useNodes,
  useWorkflowActions,
} from './WorkflowProvider';

export const workflowFlowStyles = reactflowStyles;

const nodeTypes = {
  trigger: Trigger,
  action: Action,
  empty_node: EmptyNode,
} satisfies Record<NodeType, React.ComponentType<NodeProps>>;

export function WorkflowFlow() {
  return (
    <ReactFlowProvider>
      <WorkflowFlowImpl />
    </ReactFlowProvider>
  );
}

function WorkflowFlowImpl() {
  const nodes = useNodes();
  const edges = useEdges();
  const { onNodesChange, onEdgesChange, onConnect } = useWorkflowActions();
  const isValidConnection = useIsValidConnection({
    singleIncomer: true,
    singleOutgoer: true,
    noCycle: true,
  });

  useLayoutInitializedNodes({
    mode: 'onMount',
    layoutElements,
  });

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeOrigin={nodeOrigin}
      fitView
      defaultEdgeOptions={defaultDataModelEdgeOptions}
      connectionLineStyle={defaultDataModelEdgeOptions.style}
      isValidConnection={isValidConnection}
    >
      <Background />
      <Controls position="bottom-left">
        <AutoLayoutControlButton layoutElements={layoutElements} />
      </Controls>
    </ReactFlow>
  );
}

const nodeOrigin: NodeOrigin = [0.5, 0];
const defaultDataModelEdgeOptions: DefaultEdgeOptions = {
  style: {
    strokeWidth: 3,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
  interactionWidth: 25,
  labelBgStyle: {
    fill: 'rgb(252, 252, 255)',
  },
};

function layoutElements(
  nodes: Node<NodeData>[],
  edges: Edge[],
): {
  nodes: Node<NodeData>[];
  edges: Edge[];
} {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    nodesep,
    ranksep: 100,
  });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      width: node.width ?? undefined,
      height: node.height ?? undefined,
    }),
  );

  Dagre.layout(g, {
    weight: 1000,
    minlen: 3,
  });

  return {
    nodes: nodes.map((nd) => {
      const { x, y } = g.node(nd.id);
      const position = {
        x: x,
        y: y - (nd.height ?? 0) / 2,
      };

      if (position.x === nd.position.x && position.y === nd.position.y) {
        return nd;
      }

      return {
        ...nd,
        position,
      };
    }),
    edges: edges,
  };
}
