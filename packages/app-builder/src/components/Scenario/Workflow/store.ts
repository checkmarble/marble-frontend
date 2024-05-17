import { nanoid } from 'nanoid';
import * as React from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  getConnectedEdges,
  type Node,
  type NodeChange,
} from 'reactflow';
import { create } from 'zustand';

import { isTriggerData, type NodeData } from './models/node-data';
import { adaptNodeType } from './models/node-types';

type CommonData = {
  state: 'initialized' | 'laid_out' | 'visible';
};

function createEmptyNode(): Node<
  NodeData & { $internal_commonData: CommonData }
> {
  return {
    id: nanoid(6),
    type: 'empty_node',
    data: {
      type: 'empty-node',
      $internal_commonData: {
        state: 'initialized',
      },
    },
    position: { x: 0, y: 0 },
  };
}

interface WorkflowState {
  nodes: Node<NodeData & { $internal_commonData: CommonData }>[];
  edges: Edge[];
}

interface WorkflowActions {
  onNodesChange(this: void, changes: NodeChange[]): void;
  onEdgesChange(this: void, changes: EdgeChange[]): void;
  onConnect(this: void, connection: Connection): void;
  updateNode(this: void, id: string, data: NodeData): void;
  addEmptyNode(this: void, parentId?: string): void;
  clearSelection(this: void): void;
}

function createInitialState(): WorkflowState {
  const emptyNode = createEmptyNode();
  emptyNode.selected = true;
  return {
    nodes: [emptyNode],
    edges: [],
  };
}

const initialState: WorkflowState = createInitialState();

function clearSelection<T extends { selected?: boolean }>(items: T[]): T[] {
  return items.map((node) => ({ ...node, selected: false }));
}

function shouldCreateEmptyNode(
  nodes: Node<NodeData>[],
  edges: Edge[],
): boolean {
  if (nodes.length === 0) return true;
  if (nodes.some((node) => isTriggerData(node.data))) return false;

  const emptyNodes = nodes.filter((node) => node.type === 'empty_node');
  for (const emptyNode of emptyNodes) {
    const connectedEdges = getConnectedEdges([emptyNode], edges);
    if (connectedEdges.length === 0) return false;
  }
  return true;
}

const useWorkflowStore = create<WorkflowState & { actions: WorkflowActions }>()(
  (set, get) => ({
    ...initialState,
    actions: {
      onNodesChange(changes) {
        const nodes = applyNodeChanges(changes, get().nodes);
        if (shouldCreateEmptyNode(nodes, get().edges)) {
          const emptyNode = createEmptyNode();
          emptyNode.selected = true;
          nodes.push(emptyNode);
        }
        set({
          nodes,
        });
      },
      onEdgesChange(changes) {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      onConnect(connection) {
        set({ edges: addEdge(connection, get().edges) });
      },
      updateNode(id, data) {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id !== id) return node;

            return {
              ...node,
              type: adaptNodeType(data),
              data: { ...node.data, ...data },
            };
          }),
        });
      },
      clearSelection: () => {
        const prevNodes = get().nodes;
        const prevEdges = get().edges;

        set({
          nodes: clearSelection(prevNodes),
          edges: clearSelection(prevEdges),
        });
      },
      addEmptyNode: (parentId) => {
        const prevNodes = get().nodes;
        const prevEdges = get().edges;
        const parentNode = prevNodes.find((node) => node.id === parentId);

        const nodes = clearSelection(prevNodes);
        let edges = clearSelection(prevEdges);

        const newNode = createEmptyNode();
        newNode.selected = true;
        if (parentNode) {
          newNode.position = {
            x: parentNode.position.x,
            y: parentNode.position.y + (parentNode.height ?? 0) + 100,
          };
        }
        nodes.push(newNode);

        if (parentId) {
          const newConnection: Connection = {
            source: parentId,
            target: newNode.id,
            sourceHandle: null,
            targetHandle: null,
          };
          edges = addEdge(newConnection, edges);
        }

        set({
          nodes,
          edges,
        });
      },
    },
  }),
);

// On purpose strip out CommonData from the public interface
export function useNodes(): Node<NodeData>[] {
  return useWorkflowStore((state) => state.nodes);
}

export function useEdges() {
  return useWorkflowStore((state) => state.edges);
}

export function useIsSourceConnectable({ nodeId }: { nodeId: string }) {
  const edges = useWorkflowStore((state) => state.edges);

  return React.useMemo(
    () => !edges.some((edge) => edge.source === nodeId),
    [edges, nodeId],
  );
}

export function useSelectedNodes() {
  const nodes = useNodes();
  return nodes.filter((node) => node.selected === true);
}

/**
 * Returns the type of node that can be created in place of the given node.
 * If a trigger already exists, it can only be replaced by an action.
 * If an incoming edge exists, the node can only be an action.
 * Otherwise, the node can only be a trigger.
 */
export function useCreateNodeType(nodeId: string) {
  const edges = useEdges();
  const nodes = useNodes();
  if (edges.some((edge) => edge.target === nodeId)) {
    return 'action';
  }
  if (nodes.some((node) => isTriggerData(node.data))) {
    return 'action';
  }
  return 'trigger';
}

export function useWorkflowActions() {
  return useWorkflowStore((state) => state.actions);
}
