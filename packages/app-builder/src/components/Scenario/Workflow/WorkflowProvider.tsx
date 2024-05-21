import { type Inbox } from '@app-builder/models/inbox';
import { type Scenario } from '@app-builder/models/scenario';
import { createSimpleContext } from '@app-builder/utils/create-context';
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
import { createStore, type StoreApi, useStore } from 'zustand';

import {
  type EmptyNodeData,
  isTriggerData,
  type NodeData,
} from './models/node-data';
import { adaptNodeType } from './models/node-types';

interface WorkflowState {
  nodes: Node<NodeData>[];
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

type WorkflowStore = WorkflowState & {
  actions: WorkflowActions;
};

const WorkflowStoreContext = createSimpleContext<StoreApi<WorkflowStore>>(
  'WorkflowStoreContext',
);

interface WorkflowDataContext {
  scenarios: Scenario[];
  inboxes: Inbox[];
}

const WorkflowDataContext = createSimpleContext<WorkflowDataContext>(
  'WorkflowDataContext',
);

export const useWorkflowData = WorkflowDataContext.useValue;

export function WorkflowProvider({
  children,
  data,
}: { children: React.ReactNode } & { data: WorkflowDataContext }) {
  const [store] = React.useState(() =>
    createStore<WorkflowStore>((set, get) => ({
      ...createInitialState(),
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
              y: parentNode.position.y + (parentNode.height ?? 0) + nodesep,
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
    })),
  );

  const dataValue = React.useMemo(
    () => ({
      inboxes: data.inboxes,
      scenarios: data.scenarios,
    }),
    [data.inboxes, data.scenarios],
  );

  return (
    <WorkflowDataContext.Provider value={dataValue}>
      <WorkflowStoreContext.Provider value={store}>
        {children}
      </WorkflowStoreContext.Provider>
    </WorkflowDataContext.Provider>
  );
}

function clearSelection<T extends { selected?: boolean }>(items: T[]): T[] {
  return items.map((node) => ({ ...node, selected: false }));
}

function createEmptyNode(): Node<EmptyNodeData> {
  return {
    id: nanoid(6),
    type: 'empty_node',
    data: {
      type: 'empty-node',
    },
    position: { x: 0, y: 0 },
  };
}

// Layout settings to be used by Dagre and addEmptyNode: define the distance between nodes
export const nodesep = 100;

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

function createInitialState(): WorkflowState {
  const emptyNode = createEmptyNode();
  emptyNode.selected = true;
  return {
    nodes: [emptyNode],
    edges: [],
  };
}

function useWorkflowStore<Out>(selector: (state: WorkflowStore) => Out) {
  const store = WorkflowStoreContext.useValue();
  return useStore(store, selector);
}

export function useNodes() {
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
