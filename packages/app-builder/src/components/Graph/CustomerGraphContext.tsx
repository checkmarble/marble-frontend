import { createSimpleContext } from '@app-builder/utils/create-context';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { type GraphObjectRef } from './graph-keys';
import { type GraphLayoutMode } from './graph-layout';

/** Branch sizes a subtree must exceed to collapse into a cluster chip. `0` disables clustering. */
export const CLUSTER_THRESHOLD_OPTIONS = [0, 2, 5, 7, 10, 15, 30, 50] as const;
export type ClusterThreshold = (typeof CLUSTER_THRESHOLD_OPTIONS)[number];
export const DEFAULT_CLUSTER_THRESHOLD: ClusterThreshold = 10;

export const LAYOUT_MODE_OPTIONS = ['rad-dagre', 'balanced', 'radial'] as const satisfies readonly GraphLayoutMode[];

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

  /** Configured relation labels available for filtering pivots. */
  relationLabels: string[];
  setRelationLabels: (labels: string[]) => void;
  /** Selected relation labels (pivots matching these labels are shown). */
  selectedRelationLabels: string[];
  setSelectedRelationLabels: (labels: string[]) => void;
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
  clusterThreshold: controlledClusterThreshold,
  onClusterThresholdChange,
  layoutMode: controlledLayoutMode,
  onLayoutModeChange,
}: {
  children: ReactNode;
  initialSelectedObject?: SelectedGraphObject | null;
  /** When provided with `onClusterThresholdChange`, survives provider remounts (e.g. graph regenerate). */
  clusterThreshold?: ClusterThreshold;
  onClusterThresholdChange?: (value: ClusterThreshold) => void;
  layoutMode?: GraphLayoutMode;
  onLayoutModeChange?: (value: GraphLayoutMode) => void;
}) {
  const [showPersons, setShowPersons] = useState(true);
  const [showCompanies, setShowCompanies] = useState(true);
  const [relationLabels, setRelationLabels] = useState<string[]>([]);
  const [selectedRelationLabels, setSelectedRelationLabels] = useState<string[]>([]);
  const [showRiskScore, setShowRiskScore] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [uncontrolledLayoutMode, setUncontrolledLayoutMode] = useState<GraphLayoutMode>('rad-dagre');
  const layoutMode = controlledLayoutMode ?? uncontrolledLayoutMode;
  const setLayoutMode = useCallback(
    (value: GraphLayoutMode) => {
      onLayoutModeChange?.(value);
      if (controlledLayoutMode === undefined) {
        setUncontrolledLayoutMode(value);
      }
    },
    [controlledLayoutMode, onLayoutModeChange],
  );
  const [uncontrolledClusterThreshold, setUncontrolledClusterThreshold] =
    useState<ClusterThreshold>(DEFAULT_CLUSTER_THRESHOLD);
  const clusterThreshold = controlledClusterThreshold ?? uncontrolledClusterThreshold;
  const setClusterThreshold = useCallback(
    (value: ClusterThreshold) => {
      onClusterThresholdChange?.(value);
      if (controlledClusterThreshold === undefined) {
        setUncontrolledClusterThreshold(value);
      }
    },
    [controlledClusterThreshold, onClusterThresholdChange],
  );
  const [selectedObject, setSelectedObject] = useState<SelectedGraphObject | null>(initialSelectedObject);
  const [selectionMode, setSelectionMode] = useState(false);
  const [checkedNodeIds, setCheckedNodeIds] = useState<Set<string>>(() => new Set());
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hiddenNodeIds, setHiddenNodeIds] = useState<Set<string>>(() => new Set());
  const [expandedRootIds, setExpandedRootIds] = useState<Set<string>>(() => new Set());
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

  const toggleRelationLabel = useCallback((label: string) => {
    setSelectedRelationLabels((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );
  }, []);

  const syncRelationLabels = useCallback((labels: string[]) => {
    const uniqueLabels = [...new Set(labels)];
    setRelationLabels(uniqueLabels);
    setSelectedRelationLabels((prev) => {
      // First load → select all; otherwise keep selection and auto-select newly added labels.
      if (prev.length === 0) return uniqueLabels;
      const kept = prev.filter((label) => uniqueLabels.includes(label));
      const added = uniqueLabels.filter((label) => !prev.includes(label));
      return [...kept, ...added];
    });
  }, []);

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
      relationLabels,
      setRelationLabels: syncRelationLabels,
      selectedRelationLabels,
      setSelectedRelationLabels,
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
      graphStats,
      setGraphStats,
    }),
    [
      showPersons,
      showCompanies,
      relationLabels,
      syncRelationLabels,
      selectedRelationLabels,
      toggleRelationLabel,
      showRiskScore,
      showTags,
      showEdgeLabels,
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
      graphStats,
    ],
  );

  return <CustomerGraphContext.Provider value={value}>{children}</CustomerGraphContext.Provider>;
}
