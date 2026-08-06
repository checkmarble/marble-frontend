import { createSimpleContext } from '@app-builder/utils/create-context';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { type GraphObjectRef } from './graph-keys';

export const GRAPH_ATTRIBUTES = ['ip', 'iban', 'device', 'email'] as const;
export type GraphAttribute = (typeof GRAPH_ATTRIBUTES)[number];

export const GRAPH_ATTRIBUTE_LABELS: Record<GraphAttribute, string> = {
  ip: 'IP',
  iban: 'IBAN',
  device: 'Device',
  email: 'Email',
};

/** Pivot `rawType` → the attribute filter governing it. Unlisted pivot types are always shown. */
export const PIVOT_TYPE_ATTRIBUTES: Record<string, GraphAttribute> = {
  same_ip: 'ip',
  same_iban: 'iban',
  same_device: 'device',
  same_email: 'email',
};

/** Branch sizes a subtree must exceed to collapse into a cluster chip. `0` disables clustering. */
export const CLUSTER_THRESHOLD_OPTIONS = [0, 2, 5, 7, 10, 15, 30, 50] as const;
export type ClusterThreshold = (typeof CLUSTER_THRESHOLD_OPTIONS)[number];
export const DEFAULT_CLUSTER_THRESHOLD: ClusterThreshold = 10;

/**
 * The node backing the settings panel's detail card. `persons` are the selection's
 * connected persons, or the folded members of a cluster.
 */
export type SelectedGraphObject = GraphObjectRef & { persons: GraphObjectRef[] } & (
    | { nodeType: 'person' | 'pivot' }
    | { nodeType: 'cluster'; nodeCount: number; internalEdgeCount: number }
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

  // Attribute filters (pivots)
  attributes: GraphAttribute[];
  setAttributes: (value: GraphAttribute[]) => void;
  toggleAttribute: (attribute: GraphAttribute) => void;

  // Display options
  showRiskScore: boolean;
  setShowRiskScore: (value: boolean) => void;
  showTags: boolean;
  setShowTags: (value: boolean) => void;
  /** `showTags`, forced on while bulk-tagging so the canvas shows what changed. */
  nodeTagsVisible: boolean;
  showEdgeLabels: boolean;
  setShowEdgeLabels: (value: boolean) => void;

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

  // Hover highlight (person or cluster node id; ignored while selectionMode is on)
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
}: {
  children: ReactNode;
  initialSelectedObject?: SelectedGraphObject | null;
  /** When provided with `onClusterThresholdChange`, survives provider remounts (e.g. graph regenerate). */
  clusterThreshold?: ClusterThreshold;
  onClusterThresholdChange?: (value: ClusterThreshold) => void;
}) {
  const [showPersons, setShowPersons] = useState(true);
  const [showCompanies, setShowCompanies] = useState(true);
  const [attributes, setAttributes] = useState<GraphAttribute[]>([...GRAPH_ATTRIBUTES]);
  const [showRiskScore, setShowRiskScore] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
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
    setExpandedRootIds((prev) => toggleInSet(prev, rootId));
  }, []);

  const toggleAttribute = useCallback((attribute: GraphAttribute) => {
    setAttributes((prev) => (prev.includes(attribute) ? prev.filter((a) => a !== attribute) : [...prev, attribute]));
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
      attributes,
      setAttributes,
      toggleAttribute,
      showRiskScore,
      setShowRiskScore,
      showTags,
      setShowTags,
      nodeTagsVisible: showTags || selectionMode,
      showEdgeLabels,
      setShowEdgeLabels,
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
      attributes,
      toggleAttribute,
      showRiskScore,
      showTags,
      showEdgeLabels,
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
