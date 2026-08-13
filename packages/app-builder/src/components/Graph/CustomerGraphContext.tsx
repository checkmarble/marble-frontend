import { useControllableState } from '@app-builder/hooks/useControllableState';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type Dispatch, type ReactNode, type SetStateAction, useCallback, useMemo, useState } from 'react';
import { type IconName } from 'ui-icons';
import { type GraphObjectRef } from './graph-keys';
import { type GraphLayoutMode } from './graph-layout';
import { EMPTY_RELATION_FILTER, type RelationFilter, withAvailableLabels, withLabelToggled } from './relation-filter';

/** Branch sizes a subtree must exceed to collapse into a cluster chip. `0` disables clustering. */
export const CLUSTER_THRESHOLD_OPTIONS = [0, 2, 5, 7, 10, 15, 30, 50] as const;
export type ClusterThreshold = (typeof CLUSTER_THRESHOLD_OPTIONS)[number];
export const DEFAULT_CLUSTER_THRESHOLD: ClusterThreshold = 10;

export const LAYOUT_MODE_OPTIONS = [
  { value: 'rad-dagre', icon: 'radial-dagre' },
  { value: 'balanced', icon: 'radial-adptative' },
  { value: 'radial', icon: 'radial-petals' },
] as const satisfies readonly { value: GraphLayoutMode; icon: IconName }[];

/**
 * The node backing the settings panel's detail card. `persons` are the selection's
 * connected persons, or the folded members of a cluster.
 */
export type SelectedGraphObject = GraphObjectRef & { persons: GraphObjectRef[] } & (
    | { nodeType: 'person' | 'pivot' }
    | { nodeType: 'cluster'; nodeCount: number; internalEdgeCount: number }
    | { nodeType: 'hypernode'; hypernodeCount: number }
  );

/**
 * Counts only `GraphImpl` can compute, since the toolbar and settings panel are
 * its siblings and never see the node/edge arrays.
 */
export type GraphStats = {
  /** Nodes currently removed by the hidden set, including cascade orphans. */
  hiddenCount: number;
  /** Extra nodes that would be orphaned by hiding the current selection. */
  hidePreviewOrphans: number;
};

const EMPTY_GRAPH_STATS: GraphStats = { hiddenCount: 0, hidePreviewOrphans: 0 };

export type CustomerGraphContextValue = {
  // Node type filters
  showPersons: boolean;
  setShowPersons: (value: boolean) => void;
  showCompanies: boolean;
  setShowCompanies: (value: boolean) => void;

  /** Which relation labels exist and which of them let pivots through. */
  relationFilter: RelationFilter;
  /** Reconcile the filter with the configured labels; keeps the user's picks. */
  syncRelationLabels: (labels: string[]) => void;
  toggleRelationLabel: (label: string) => void;

  // Display options
  showRiskScore: boolean;
  setShowRiskScore: (value: boolean) => void;
  showTags: boolean;
  setShowTags: (value: boolean) => void;
  /** `showTags`, forced on while bulk-tagging so the canvas shows what changed. */
  nodeTagsVisible: boolean;
  showEdgeLabels: boolean;
  setShowEdgeLabels: (value: boolean) => void;

  layoutMode: GraphLayoutMode;
  setLayoutMode: (value: GraphLayoutMode) => void;

  // Clustering (branch size at which a subtree collapses; `0` disables)
  clusterThreshold: ClusterThreshold;
  setClusterThreshold: (value: ClusterThreshold) => void;

  // Focus (settings panel detail card)
  selectedObject: SelectedGraphObject | null;
  setSelectedObject: (value: SelectedGraphObject | null) => void;

  // Selection mode + bulk selection. Keys are node ids; cluster chips contribute
  // their branch root, so `rootNodeId` maps any endpoint into this set.
  selectionMode: boolean;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  checkedNodeIds: Set<string>;
  toggleCheckedNode: (nodeId: string) => void;
  isNodeChecked: (nodeId: string) => boolean;
  clearCheckedNodes: () => void;

  // Hover highlight (any node id; ignored while selectionMode is on)
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;

  // Manually hidden nodes (node ids). Orphans cascade out via the reachability sweep.
  hiddenNodeIds: Set<string>;
  hideNodes: (ids: string[]) => void;
  restoreHiddenNodes: () => void;

  // Branch roots the user drilled into; their cluster chips are suppressed.
  expandedRootIds: Set<string>;
  toggleClusterExpanded: (rootId: string) => void;

  /**
   * Session tag ids for person nodes. Payload metadata is static, so the canvas
   * reads these on top of it after bulk-tag or settings-panel edits.
   * - `nodeTagIdOverrides`: full list, replacing the payload's (settings panel)
   * - `addedNodeTagIds`: additions only, merged over whichever list applies. The
   *   bulk toolbar cannot supply a full list: it reads the base from the
   *   annotations cache, which may be cold for a node it never opened.
   */
  nodeTagIdOverrides: ReadonlyMap<string, readonly string[]>;
  setNodeTagIds: (nodeId: string, tagIds: readonly string[]) => void;
  addedNodeTagIds: ReadonlyMap<string, readonly string[]>;
  addTagsToNodes: (updates: ReadonlyArray<{ nodeId: string; tagIds: readonly string[] }>) => void;

  graphStats: GraphStats;
  setGraphStats: (stats: GraphStats) => void;
};

const CustomerGraphContext = createSimpleContext<CustomerGraphContextValue>('CustomerGraph');

export const useCustomerGraph = CustomerGraphContext.useValue;

function toggleInSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function CustomerGraphProvider({
  children,
  initialSelectedObject = null,
  showPersons: controlledShowPersons,
  onShowPersonsChange,
  showCompanies: controlledShowCompanies,
  onShowCompaniesChange,
  showRiskScore: controlledShowRiskScore,
  onShowRiskScoreChange,
  showTags: controlledShowTags,
  onShowTagsChange,
  showEdgeLabels: controlledShowEdgeLabels,
  onShowEdgeLabelsChange,
  clusterThreshold: controlledClusterThreshold,
  onClusterThresholdChange,
  layoutMode: controlledLayoutMode,
  onLayoutModeChange,
  relationFilter: controlledRelationFilter,
  onRelationFilterChange,
}: {
  children: ReactNode;
  initialSelectedObject?: SelectedGraphObject | null;
  /** When provided with matching onChange, survives provider remounts (e.g. graph regenerate). */
  showPersons?: boolean;
  onShowPersonsChange?: (value: boolean) => void;
  showCompanies?: boolean;
  onShowCompaniesChange?: (value: boolean) => void;
  showRiskScore?: boolean;
  onShowRiskScoreChange?: (value: boolean) => void;
  showTags?: boolean;
  onShowTagsChange?: (value: boolean) => void;
  showEdgeLabels?: boolean;
  onShowEdgeLabelsChange?: (value: boolean) => void;
  clusterThreshold?: ClusterThreshold;
  onClusterThresholdChange?: (value: ClusterThreshold) => void;
  layoutMode?: GraphLayoutMode;
  onLayoutModeChange?: (value: GraphLayoutMode) => void;
  /** When provided with `onRelationFilterChange`, the user's label picks survive provider remounts. */
  relationFilter?: RelationFilter;
  onRelationFilterChange?: Dispatch<SetStateAction<RelationFilter>>;
}) {
  const [showPersons, setShowPersons] = useControllableState(true, controlledShowPersons, onShowPersonsChange);
  const [showCompanies, setShowCompanies] = useControllableState(true, controlledShowCompanies, onShowCompaniesChange);
  const [uncontrolledRelationFilter, setUncontrolledRelationFilter] = useState<RelationFilter>(EMPTY_RELATION_FILTER);
  // Not `useControllableState`: the mutators below update from the previous filter,
  // and taking an updater is what keeps their identity stable for `syncRelationLabels`'
  // caller effect.
  const relationFilter = controlledRelationFilter ?? uncontrolledRelationFilter;
  const setRelationFilter = onRelationFilterChange ?? setUncontrolledRelationFilter;
  const [showRiskScore, setShowRiskScore] = useControllableState(false, controlledShowRiskScore, onShowRiskScoreChange);
  const [showTags, setShowTags] = useControllableState(false, controlledShowTags, onShowTagsChange);
  const [showEdgeLabels, setShowEdgeLabels] = useControllableState(
    false,
    controlledShowEdgeLabels,
    onShowEdgeLabelsChange,
  );
  const [layoutMode, setLayoutMode] = useControllableState<GraphLayoutMode>(
    'rad-dagre',
    controlledLayoutMode,
    onLayoutModeChange,
  );
  const [clusterThreshold, setClusterThreshold] = useControllableState<ClusterThreshold>(
    DEFAULT_CLUSTER_THRESHOLD,
    controlledClusterThreshold,
    onClusterThresholdChange,
  );
  const [selectedObject, setSelectedObject] = useState<SelectedGraphObject | null>(initialSelectedObject);
  const [selectionMode, setSelectionMode] = useState(false);
  const [checkedNodeIds, setCheckedNodeIds] = useState<Set<string>>(() => new Set());
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hiddenNodeIds, setHiddenNodeIds] = useState<Set<string>>(() => new Set());
  const [expandedRootIds, setExpandedRootIds] = useState<Set<string>>(() => new Set());
  const [addedNodeTagIds, setAddedNodeTagIds] = useState<Map<string, string[]>>(() => new Map());
  const [nodeTagIdOverrides, setNodeTagIdOverrides] = useState<Map<string, string[]>>(() => new Map());
  const [graphStats, setGraphStats] = useState<GraphStats>(EMPTY_GRAPH_STATS);

  const hideNodes = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setHiddenNodeIds((prev) => new Set([...prev, ...ids]));
  }, []);

  const restoreHiddenNodes = useCallback(() => {
    setHiddenNodeIds(new Set());
  }, []);

  const toggleClusterExpanded = useCallback((rootId: string) => {
    setHoveredNodeId(null);
    setExpandedRootIds((prev) => toggleInSet(prev, rootId));
  }, []);

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

  const toggleRelationLabel = useCallback(
    (label: string) => {
      setRelationFilter((prev) => withLabelToggled(prev, label));
    },
    [setRelationFilter],
  );

  const syncRelationLabels = useCallback(
    (labels: string[]) => {
      setRelationFilter((prev) => withAvailableLabels(prev, labels));
    },
    [setRelationFilter],
  );

  const clearCheckedNodes = useCallback(() => {
    setCheckedNodeIds(new Set());
  }, []);

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
    setHoveredNodeId(null);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setCheckedNodeIds(new Set());
  }, []);

  const toggleCheckedNode = useCallback((nodeId: string) => {
    setCheckedNodeIds((prev) => toggleInSet(prev, nodeId));
  }, []);

  const isNodeChecked = useCallback((nodeId: string) => checkedNodeIds.has(nodeId), [checkedNodeIds]);

  const value = useMemo(
    () => ({
      showPersons,
      setShowPersons,
      showCompanies,
      setShowCompanies,
      relationFilter,
      syncRelationLabels,
      toggleRelationLabel,
      showRiskScore,
      setShowRiskScore,
      showTags,
      setShowTags,
      nodeTagsVisible: showTags || selectionMode,
      showEdgeLabels,
      setShowEdgeLabels,
      layoutMode,
      setLayoutMode,
      clusterThreshold,
      setClusterThreshold,
      selectedObject,
      setSelectedObject,
      selectionMode,
      enterSelectionMode,
      exitSelectionMode,
      checkedNodeIds,
      toggleCheckedNode,
      isNodeChecked,
      clearCheckedNodes,
      hoveredNodeId,
      setHoveredNodeId,
      hiddenNodeIds,
      hideNodes,
      restoreHiddenNodes,
      expandedRootIds,
      toggleClusterExpanded,
      nodeTagIdOverrides,
      setNodeTagIds,
      addedNodeTagIds,
      addTagsToNodes,
      graphStats,
      setGraphStats,
    }),
    [
      showPersons,
      setShowPersons,
      showCompanies,
      setShowCompanies,
      relationFilter,
      syncRelationLabels,
      toggleRelationLabel,
      showRiskScore,
      setShowRiskScore,
      showTags,
      setShowTags,
      showEdgeLabels,
      setShowEdgeLabels,
      layoutMode,
      setLayoutMode,
      clusterThreshold,
      setClusterThreshold,
      selectedObject,
      selectionMode,
      enterSelectionMode,
      exitSelectionMode,
      checkedNodeIds,
      toggleCheckedNode,
      isNodeChecked,
      clearCheckedNodes,
      hoveredNodeId,
      hiddenNodeIds,
      hideNodes,
      restoreHiddenNodes,
      expandedRootIds,
      toggleClusterExpanded,
      nodeTagIdOverrides,
      setNodeTagIds,
      addedNodeTagIds,
      addTagsToNodes,
      graphStats,
    ],
  );

  return <CustomerGraphContext.Provider value={value}>{children}</CustomerGraphContext.Provider>;
}
