import { createSimpleContext } from '@app-builder/utils/create-context';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

/**
 * Which nodes the graph is built from. Everything here feeds the layout, so a
 * change re-runs clustering and positioning anyway — a broad re-render is
 * honest work rather than waste.
 */
export type GraphStructure = {
  /** Manually hidden node ids. Orphans cascade out via the reachability sweep. */
  hiddenNodeIds: Set<string>;
  /** Branch roots the user drilled into; their cluster chips are suppressed. */
  expandedRootIds: Set<string>;
};

export type GraphStructureActions = {
  hideNodes: (ids: string[]) => void;
  restoreHiddenNodes: () => void;
  toggleClusterExpanded: (rootId: string) => void;
};

const GraphStructureContext = createSimpleContext<GraphStructure>('GraphStructure');
const GraphStructureActionsContext = createSimpleContext<GraphStructureActions>('GraphStructureActions');

export const useGraphStructure = GraphStructureContext.useValue;

/**
 * Stable for the provider's lifetime. Every node runs `useCollapseCluster`, so
 * the components that only mutate the structure must not subscribe to it.
 */
export const useGraphStructureActions = GraphStructureActionsContext.useValue;

function toggleInSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function GraphStructureProvider({ children }: { children: ReactNode }) {
  const [hiddenNodeIds, setHiddenNodeIds] = useState<Set<string>>(() => new Set());
  const [expandedRootIds, setExpandedRootIds] = useState<Set<string>>(() => new Set());

  const hideNodes = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setHiddenNodeIds((prev) => new Set([...prev, ...ids]));
  }, []);

  const restoreHiddenNodes = useCallback(() => {
    setHiddenNodeIds(new Set());
  }, []);

  const toggleClusterExpanded = useCallback((rootId: string) => {
    setExpandedRootIds((prev) => toggleInSet(prev, rootId));
  }, []);

  const actions = useMemo(
    () => ({ hideNodes, restoreHiddenNodes, toggleClusterExpanded }),
    [hideNodes, restoreHiddenNodes, toggleClusterExpanded],
  );

  const value = useMemo(() => ({ hiddenNodeIds, expandedRootIds }), [hiddenNodeIds, expandedRootIds]);

  return (
    <GraphStructureActionsContext.Provider value={actions}>
      <GraphStructureContext.Provider value={value}>{children}</GraphStructureContext.Provider>
    </GraphStructureActionsContext.Provider>
  );
}
