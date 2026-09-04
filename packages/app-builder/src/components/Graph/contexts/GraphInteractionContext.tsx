import { createSimpleContext } from '@app-builder/utils/create-context';
import { type ReactNode, useState, useSyncExternalStore } from 'react';
import { areNodesAdjacent } from '../lib/graph-index';
import { rootNodeId } from '../lib/graph-keys';
import { useGraphIndex } from './GraphIndexContext';
import {
  createGraphInteractionStore,
  type GraphInteractionActions,
  type GraphInteractionState,
  type GraphInteractionStore,
} from './graph-interaction-store';

const GraphInteractionContext = createSimpleContext<GraphInteractionStore>('GraphInteraction');

export function GraphInteractionProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createGraphInteractionStore);

  return <GraphInteractionContext.Provider value={store}>{children}</GraphInteractionContext.Provider>;
}

/**
 * Subscribe to one derived value. The selector must return a primitive or an
 * already-stable reference: `useSyncExternalStore` re-renders whenever
 * `Object.is` says the result changed, so building a fresh object per read
 * would render in a loop.
 */
function useGraphInteraction<T>(selector: (state: GraphInteractionState) => T): T {
  const store = GraphInteractionContext.useValue();
  const read = () => selector(store.getState());

  return useSyncExternalStore(store.subscribe, read, read);
}

/** Stable for the provider's lifetime — components that only write never re-render. */
export function useGraphInteractionActions(): GraphInteractionActions {
  return GraphInteractionContext.useValue().actions;
}

export function useSelectionMode(): boolean {
  return useGraphInteraction((state) => state.selectionMode);
}

/** The whole set — for the few consumers that count or iterate it. */
export function useCheckedNodeIds(): ReadonlySet<string> {
  return useGraphInteraction((state) => state.checkedNodeIds);
}

export function useIsNodeChecked(nodeId: string): boolean {
  return useGraphInteraction((state) => state.checkedNodeIds.has(nodeId));
}

/** True while this node is the hover target and highlighting is not suppressed. */
export function useIsNodeHovered(nodeId: string): boolean {
  return useGraphInteraction((state) => !state.selectionMode && state.hoveredNodeId === nodeId);
}

export function useIsEdgeHovered(edgeId: string): boolean {
  return useGraphInteraction((state) => state.hoveredEdgeId === edgeId);
}

/**
 * A node stays fully opaque when nothing is hovered, when it is the hovered
 * node, when it shares an edge with the hovered node, or — on person hover —
 * when it sits on a shortest path from that person back to start.
 */
export function useIsNodeHighlighted(nodeId: string): boolean {
  const graphIndex = useGraphIndex();

  return useGraphInteraction((state) => {
    if (state.selectionMode || state.hoveredNodeId == null) return true;
    if (nodeId === state.hoveredNodeId) return true;
    if (state.hoverTrail.nodeIds.has(nodeId)) return true;
    return areNodesAdjacent(graphIndex, state.hoveredNodeId, nodeId);
  });
}

/**
 * An edge is dimmed unless it touches the hovered node, sits on a shortest
 * path to start (person hover only), or — in selection mode — joins two
 * checked nodes. Nothing is dimmed when neither is active.
 */
export function useIsEdgeHighlighted(edgeId: string, source: string, target: string): boolean {
  return useGraphInteraction((state) => {
    if (state.selectionMode) {
      return state.checkedNodeIds.has(rootNodeId(source)) && state.checkedNodeIds.has(rootNodeId(target));
    }
    if (state.hoveredNodeId != null) {
      return source === state.hoveredNodeId || target === state.hoveredNodeId || state.hoverTrail.edgeIds.has(edgeId);
    }
    return true;
  });
}
