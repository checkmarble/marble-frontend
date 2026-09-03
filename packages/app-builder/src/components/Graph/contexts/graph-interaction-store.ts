import { EMPTY_HOVER_TRAIL, type HoverTrail } from '../lib/hover-trail';

/**
 * Hover and bulk-selection state, held outside React.
 *
 * Every node and edge on the canvas depends on this, and it changes on every
 * mouse move. Through a context value, one hover invalidates that value for all
 * of them at once; through this store each component subscribes to a derived
 * boolean and re-renders only when its own answer flips — so the cost of a
 * hover tracks the size of the highlighted neighbourhood, not the graph.
 */
export type GraphInteractionState = {
  selectionMode: boolean;
  /** Node ids. Cluster chips contribute their branch root, never their members. */
  checkedNodeIds: ReadonlySet<string>;
  /** Any node id; highlighting ignores it while `selectionMode` is on. */
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;
  /**
   * Shortest-path trail back to start. Filled on person hover only; empty for
   * cluster/pivot/hypernode hover so those stay 1-hop.
   */
  hoverTrail: HoverTrail;
};

export type GraphInteractionActions = {
  hoverNode: (nodeId: string | null, trail?: HoverTrail) => void;
  hoverEdge: (edgeId: string | null) => void;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleCheckedNode: (nodeId: string) => void;
  clearCheckedNodes: () => void;
};

export type GraphInteractionStore = {
  getState: () => GraphInteractionState;
  subscribe: (listener: () => void) => () => void;
  /** Stable for the store's lifetime, so write-only consumers never re-render. */
  actions: GraphInteractionActions;
};

const INITIAL_STATE: GraphInteractionState = {
  selectionMode: false,
  checkedNodeIds: new Set(),
  hoveredNodeId: null,
  hoveredEdgeId: null,
  hoverTrail: EMPTY_HOVER_TRAIL,
};

export function createGraphInteractionStore(): GraphInteractionStore {
  let state = INITIAL_STATE;
  const listeners = new Set<() => void>();

  const setState = (patch: Partial<GraphInteractionState>) => {
    state = { ...state, ...patch };
    for (const listener of listeners) listener();
  };

  const actions: GraphInteractionActions = {
    hoverNode(nodeId, trail = EMPTY_HOVER_TRAIL) {
      if (state.hoveredNodeId === nodeId && state.hoverTrail === trail) return;
      setState({ hoveredNodeId: nodeId, hoverTrail: trail });
    },
    hoverEdge(edgeId) {
      if (state.hoveredEdgeId === edgeId) return;
      setState({ hoveredEdgeId: edgeId });
    },
    enterSelectionMode() {
      // Highlighting is suppressed in selection mode, so drop the hover rather
      // than let a stale one light up again on exit.
      setState({ selectionMode: true, hoveredNodeId: null, hoverTrail: EMPTY_HOVER_TRAIL });
    },
    exitSelectionMode() {
      setState({ selectionMode: false, checkedNodeIds: new Set() });
    },
    toggleCheckedNode(nodeId) {
      const next = new Set(state.checkedNodeIds);
      if (!next.delete(nodeId)) next.add(nodeId);
      setState({ checkedNodeIds: next });
    },
    clearCheckedNodes() {
      if (state.checkedNodeIds.size === 0) return;
      setState({ checkedNodeIds: new Set() });
    },
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    actions,
  };
}
