import ReactFlow, {
  Background,
  type DefaultEdgeOptions,
  MarkerType,
  type NodeProps,
} from 'reactflow';
import reactflowStyles from 'reactflow/dist/style.css';

import { type NodeType } from './models/node-types';
import { Action } from './Nodes/Action';
import { EmptyNode } from './Nodes/EmptyNode';
import { Trigger } from './Nodes/Trigger';
import { useEdges, useNodes, useWorkflowActions } from './store';

export const workflowFlowStyles = reactflowStyles;

const nodeTypes = {
  trigger: Trigger,
  action: Action,
  empty_node: EmptyNode,
} satisfies Record<NodeType, React.ComponentType<NodeProps>>;

export const defaultDataModelEdgeOptions: DefaultEdgeOptions = {
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

export function WorkflowFlow() {
  const nodes = useNodes();
  const edges = useEdges();
  const { onNodesChange, onEdgesChange, onConnect } = useWorkflowActions();

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeOrigin={[0.5, 0]}
      fitView
      defaultEdgeOptions={defaultDataModelEdgeOptions}
      connectionLineStyle={defaultDataModelEdgeOptions.style}
    >
      <Background />
    </ReactFlow>
  );
}
