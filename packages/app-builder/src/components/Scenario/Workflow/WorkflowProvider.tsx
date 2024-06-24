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
  type Node,
  type NodeChange,
} from 'reactflow';
import { assertNever } from 'typescript-utils';
import { createStore, type StoreApi, useStore } from 'zustand';

import {
  adaptNodeType,
  createNode,
  type EmptyNodeData,
  isTriggerData,
  type NodeData,
} from './models/nodes';
import { type ValidWorkflow } from './models/validation';
import { validateWorkflow } from './validate';

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
  selectNode(this: void, id: string): void;
  clearSelection(this: void): void;
}

type WorkflowStore = WorkflowState & {
  actions: WorkflowActions;
};

const WorkflowStoreContext = createSimpleContext<StoreApi<WorkflowStore>>(
  'WorkflowStoreContext',
);

interface WorkflowDataContext {
  nonEditableData: { scenarioId: string | null };
  scenarios: Scenario[];
  inboxes: Inbox[];
  hasPivotValue: boolean;
}

const WorkflowDataContext = createSimpleContext<WorkflowDataContext>(
  'WorkflowDataContext',
);

export const useWorkflowData = WorkflowDataContext.useValue;

interface WorkflowDataFeatureAccess {
  isCreateInboxAvailable: boolean;
}

const WorkflowDataFeatureAccessContext =
  createSimpleContext<WorkflowDataFeatureAccess>(
    'WorkflowDataFeatureAccessContext',
  );

export const useWorkflowDataFeatureAccess =
  WorkflowDataFeatureAccessContext.useValue;

interface WorkflowProviderProps {
  children: React.ReactNode;
  data: WorkflowDataContext;
  workflowDataFeatureAccess: WorkflowDataFeatureAccess;
  initialWorkflow?: ValidWorkflow;
}

export function WorkflowProvider({
  children,
  data,
  workflowDataFeatureAccess,
  initialWorkflow,
}: WorkflowProviderProps) {
  const [store] = React.useState(() =>
    createStore<WorkflowStore>((set, get) => ({
      ...createInitialState(initialWorkflow),
      actions: {
        onNodesChange(changes) {
          const previousNodes = get().nodes;
          const nodes = applyNodeChanges(changes, previousNodes);

          for (const change of changes) {
            if (change.type === 'remove') {
              const node = previousNodes.find((node) => node.id === change.id);
              if (!node) continue;

              if (nodes.length === 0 || isTriggerData(node.data)) {
                const emptyNode = createEmptyNode();
                emptyNode.selected = true;
                emptyNode.position = node.position;
                nodes.push(emptyNode);
              }
            }
          }

          // Should never happen, but just in case
          if (nodes.length === 0) {
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
        selectNode: (id) => {
          const prevNodes = get().nodes;
          const prevEdges = get().edges;

          const nodes = clearSelection(prevNodes).map((node) => {
            if (node.id === id) {
              return { ...node, selected: true };
            }
            return node;
          });

          set({
            nodes,
            edges: clearSelection(prevEdges),
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
      nonEditableData: data.nonEditableData,
      hasPivotValue: data.hasPivotValue,
    }),
    [data.hasPivotValue, data.inboxes, data.nonEditableData, data.scenarios],
  );

  return (
    <WorkflowDataContext.Provider value={dataValue}>
      <WorkflowStoreContext.Provider value={store}>
        <WorkflowDataFeatureAccessContext.Provider
          value={workflowDataFeatureAccess}
        >
          {children}
        </WorkflowDataFeatureAccessContext.Provider>
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

function createInitialState(initialWorkflow?: ValidWorkflow): WorkflowState {
  if (!initialWorkflow) {
    const emptyNode = createEmptyNode();
    emptyNode.selected = true;
    return {
      nodes: [emptyNode],
      edges: [],
    };
  }

  switch (initialWorkflow.type) {
    case 'CREATE_CASE':
    case 'ADD_TO_CASE_IF_POSSIBLE': {
      const triggerNode = createNode({
        type: 'decision-created',
        ...initialWorkflow.trigger,
      });

      const actionNode = createNode({
        type:
          initialWorkflow.type === 'CREATE_CASE'
            ? 'create-case'
            : 'add-to-case-if-possible',
        ...initialWorkflow.action,
      });

      return {
        nodes: [triggerNode, actionNode],
        edges: addEdge(
          {
            source: triggerNode.id,
            target: actionNode.id,
            sourceHandle: null,
            targetHandle: null,
          },
          [],
        ),
      };
    }
    default:
      assertNever('Unknown workflow', initialWorkflow);
  }
}

function useWorkflowStore<Out>(selector: (state: WorkflowStore) => Out) {
  const store = WorkflowStoreContext.useValue();
  return useStore(store, selector);
}

export function useNodes() {
  return useWorkflowStore((state) => state.nodes);
}

export function useNodeData(nodeId: string) {
  return useWorkflowStore(
    (state) => state.nodes.find((node) => node.id === nodeId)?.data,
  );
}

export function useEdges() {
  return useWorkflowStore((state) => state.edges);
}

const nonConnectableNodeDataTypes: NodeData['type'][] = [
  'add-to-case-if-possible',
  'create-case',
];
export function useIsSourceConnectable({ nodeId }: { nodeId: string }) {
  return useWorkflowStore((state) => {
    const nodeType = state.nodes.find((node) => node.id === nodeId)?.data.type;
    if (nodeType && nonConnectableNodeDataTypes.includes(nodeType)) {
      return false;
    }
    return !state.edges.some((edge) => edge.source === nodeId);
  });
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

export function useValidationPayload() {
  return useWorkflowStore((state) =>
    validateWorkflow(state.nodes, state.edges),
  );
}
