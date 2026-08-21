import { createSimpleContext } from '@app-builder/utils/create-context';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

/**
 * Session tag ids for person nodes. Payload metadata is static, so the canvas
 * reads these on top of it after bulk-tag or settings-panel edits.
 */
export type GraphAnnotations = {
  /** Full lists, replacing the payload's (settings panel). */
  nodeTagIdOverrides: ReadonlyMap<string, readonly string[]>;
  /**
   * Additions only, merged over whichever list applies. The bulk toolbar cannot
   * supply a full list: it reads the base from the annotations cache, which may
   * be cold for a node it never opened.
   */
  addedNodeTagIds: ReadonlyMap<string, readonly string[]>;
};

export type GraphAnnotationsActions = {
  setNodeTagIds: (nodeId: string, tagIds: readonly string[]) => void;
  addTagsToNodes: (updates: ReadonlyArray<{ nodeId: string; tagIds: readonly string[] }>) => void;
};

const GraphAnnotationsContext = createSimpleContext<GraphAnnotations>('GraphAnnotations');
const GraphAnnotationsActionsContext = createSimpleContext<GraphAnnotationsActions>('GraphAnnotationsActions');

export const useGraphAnnotations = GraphAnnotationsContext.useValue;

/** Stable for the provider's lifetime; the tag editors write but never read. */
export const useGraphAnnotationsActions = GraphAnnotationsActionsContext.useValue;

export function GraphAnnotationsProvider({ children }: { children: ReactNode }) {
  const [addedNodeTagIds, setAddedNodeTagIds] = useState<Map<string, string[]>>(() => new Map());
  const [nodeTagIdOverrides, setNodeTagIdOverrides] = useState<Map<string, string[]>>(() => new Map());

  const addTagsToNodes = useCallback((updates: ReadonlyArray<{ nodeId: string; tagIds: readonly string[] }>) => {
    if (updates.length === 0) return;
    setAddedNodeTagIds((prev) => {
      const next = new Map(prev);
      for (const { nodeId, tagIds } of updates) {
        if (tagIds.length === 0) continue;
        next.set(nodeId, [...new Set([...(next.get(nodeId) ?? []), ...tagIds])]);
      }
      return next;
    });
  }, []);

  const setNodeTagIds = useCallback((nodeId: string, tagIds: readonly string[]) => {
    setNodeTagIdOverrides((prev) => {
      const next = new Map(prev);
      next.set(nodeId, [...tagIds]);
      return next;
    });
    // Drop earlier additions for this node: the panel's list is authoritative, and
    // additions merge on top, so a stale one would re-add a tag just removed here.
    setAddedNodeTagIds((prev) => {
      if (!prev.has(nodeId)) return prev;
      const next = new Map(prev);
      next.delete(nodeId);
      return next;
    });
  }, []);

  const actions = useMemo(() => ({ setNodeTagIds, addTagsToNodes }), [setNodeTagIds, addTagsToNodes]);

  const value = useMemo(() => ({ nodeTagIdOverrides, addedNodeTagIds }), [nodeTagIdOverrides, addedNodeTagIds]);

  return (
    <GraphAnnotationsActionsContext.Provider value={actions}>
      <GraphAnnotationsContext.Provider value={value}>{children}</GraphAnnotationsContext.Provider>
    </GraphAnnotationsActionsContext.Provider>
  );
}
