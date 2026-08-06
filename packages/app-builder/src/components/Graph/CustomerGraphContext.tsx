import { createSimpleContext } from '@app-builder/utils/create-context';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

export const GRAPH_ATTRIBUTES = ['ip', 'iban', 'device', 'email'] as const;
export type GraphAttribute = (typeof GRAPH_ATTRIBUTES)[number];

export const GRAPH_ATTRIBUTE_LABELS: Record<GraphAttribute, string> = {
  ip: 'IP',
  iban: 'IBAN',
  device: 'Device',
  email: 'Email',
};

/** Branch sizes at which a subtree can collapse into a cluster chip. `0` disables clustering. */
export const CLUSTER_THRESHOLD_OPTIONS = [0, 2, 5, 7, 10, 15] as const;
export type ClusterThreshold = (typeof CLUSTER_THRESHOLD_OPTIONS)[number];
const DEFAULT_CLUSTER_THRESHOLD: ClusterThreshold = 10;

export type GraphPersonRef = {
  objectType: string;
  objectId: string;
};

export type SelectedGraphObject =
  | ({
      nodeType: 'person';
    } & GraphPersonRef)
  | ({
      nodeType: 'pivot';
      connectedPersons: GraphPersonRef[];
    } & GraphPersonRef)
  | ({
      nodeType: 'cluster';
      rootId: string;
      nodeCount: number;
      internalEdgeCount: number;
      members: GraphPersonRef[];
    } & GraphPersonRef);

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

/** Same composite key as graph `nodeKey`: `${objectType}:${objectId}` */
export function personBulkKey(person: GraphPersonRef): string {
  return `${person.objectType}:${person.objectId}`;
}

export function parsePersonBulkKey(key: string): SelectedGraphObject {
  const colonIdx = key.indexOf(':');
  return {
    nodeType: 'person',
    objectType: key.slice(0, colonIdx),
    objectId: key.slice(colonIdx + 1),
  };
}

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
  showEdgeLabels: boolean;
  setShowEdgeLabels: (value: boolean) => void;

  // Clustering (branch size at which a subtree collapses; `0` disables)
  clusterThreshold: ClusterThreshold;
  setClusterThreshold: (value: ClusterThreshold) => void;

  // Focus (settings panel detail card)
  selectedObject: SelectedGraphObject | null;
  setSelectedObject: (value: SelectedGraphObject | null) => void;

  // Selection mode + bulk selection (person checkboxes)
  selectionMode: boolean;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  checkedPersons: Set<string>;
  toggleCheckedPerson: (person: GraphPersonRef) => void;
  isPersonChecked: (person: GraphPersonRef) => boolean;
  clearCheckedPersons: () => void;

  // Hover highlight (person or cluster node id; ignored while selectionMode is on)
  hoveredPersonId: string | null;
  setHoveredPersonId: (id: string | null) => void;

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

export function CustomerGraphProvider({
  children,
  initialSelectedObject = null,
}: {
  children: ReactNode;
  initialSelectedObject?: SelectedGraphObject | null;
}) {
  const [showPersons, setShowPersons] = useState(true);
  const [showCompanies, setShowCompanies] = useState(true);
  const [attributes, setAttributes] = useState<GraphAttribute[]>([...GRAPH_ATTRIBUTES]);
  const [showRiskScore, setShowRiskScore] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [clusterThreshold, setClusterThreshold] = useState<ClusterThreshold>(DEFAULT_CLUSTER_THRESHOLD);
  const [selectedObject, setSelectedObject] = useState<SelectedGraphObject | null>(initialSelectedObject);
  const [selectionMode, setSelectionMode] = useState(false);
  const [checkedPersons, setCheckedPersons] = useState<Set<string>>(() => new Set());
  const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);
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
    setExpandedRootIds((prev) => {
      const next = new Set(prev);
      if (next.has(rootId)) {
        next.delete(rootId);
      } else {
        next.add(rootId);
      }
      return next;
    });
  }, []);

  const toggleAttribute = useCallback((attribute: GraphAttribute) => {
    setAttributes((prev) => (prev.includes(attribute) ? prev.filter((a) => a !== attribute) : [...prev, attribute]));
  }, []);

  const clearCheckedPersons = useCallback(() => {
    setCheckedPersons(new Set());
  }, []);

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
    setHoveredPersonId(null);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setCheckedPersons(new Set());
  }, []);

  const toggleCheckedPerson = useCallback((person: GraphPersonRef) => {
    const key = personBulkKey(person);
    setCheckedPersons((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const isPersonChecked = useCallback(
    (person: GraphPersonRef) => checkedPersons.has(personBulkKey(person)),
    [checkedPersons],
  );

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
      showTags: showTags || selectionMode,
      setShowTags,
      showEdgeLabels,
      setShowEdgeLabels,
      clusterThreshold,
      setClusterThreshold,
      selectedObject,
      setSelectedObject,
      selectionMode,
      enterSelectionMode,
      exitSelectionMode,
      checkedPersons,
      toggleCheckedPerson,
      isPersonChecked,
      clearCheckedPersons,
      hoveredPersonId,
      setHoveredPersonId,
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
      selectedObject,
      selectionMode,
      enterSelectionMode,
      exitSelectionMode,
      checkedPersons,
      toggleCheckedPerson,
      isPersonChecked,
      clearCheckedPersons,
      hoveredPersonId,
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
