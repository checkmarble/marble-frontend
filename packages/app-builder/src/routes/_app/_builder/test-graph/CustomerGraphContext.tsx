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

export type EventFilter = 'all' | 'none';

export type CustomerGraphContextValue = {
  // Node type filters
  showPersons: boolean;
  setShowPersons: (value: boolean) => void;
  showCompanies: boolean;
  setShowCompanies: (value: boolean) => void;

  // Event / attribute filters
  eventFilter: EventFilter;
  setEventFilter: (value: EventFilter) => void;
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

  // Selection (settings panel detail card)
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  // Type-bundle expand/collapse
  expandedGroupIds: Set<string>;
  expandGroup: (groupId: string) => void;
  collapseGroup: (groupId: string) => void;
  expandAllGroups: (groupIds: string[]) => void;
  collapseAllGroups: () => void;
  resetExpandedGroups: () => void;
};

const CustomerGraphContext = createSimpleContext<CustomerGraphContextValue>('CustomerGraph');

export const useCustomerGraph = CustomerGraphContext.useValue;

export function CustomerGraphProvider({ children }: { children: ReactNode }) {
  const [showPersons, setShowPersons] = useState(true);
  const [showCompanies, setShowCompanies] = useState(true);
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [attributes, setAttributes] = useState<GraphAttribute[]>([...GRAPH_ATTRIBUTES]);
  const [showRiskScore, setShowRiskScore] = useState(true);
  const [showTags, setShowTags] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set());

  const toggleAttribute = useCallback((attribute: GraphAttribute) => {
    setAttributes((prev) => (prev.includes(attribute) ? prev.filter((a) => a !== attribute) : [...prev, attribute]));
  }, []);

  const expandGroup = useCallback((groupId: string) => {
    setExpandedGroupIds((prev) => {
      if (prev.has(groupId)) return prev;
      const next = new Set(prev);
      next.add(groupId);
      return next;
    });
  }, []);

  const collapseGroup = useCallback((groupId: string) => {
    setExpandedGroupIds((prev) => {
      if (!prev.has(groupId)) return prev;
      const next = new Set(prev);
      next.delete(groupId);
      return next;
    });
  }, []);

  const expandAllGroups = useCallback((groupIds: string[]) => {
    setExpandedGroupIds(new Set(groupIds));
  }, []);

  const collapseAllGroups = useCallback(() => {
    setExpandedGroupIds(new Set());
  }, []);

  const resetExpandedGroups = useCallback(() => {
    setExpandedGroupIds(new Set());
  }, []);

  const value = useMemo(
    () => ({
      showPersons,
      setShowPersons,
      showCompanies,
      setShowCompanies,
      eventFilter,
      setEventFilter,
      attributes,
      setAttributes,
      toggleAttribute,
      showRiskScore,
      setShowRiskScore,
      showTags,
      setShowTags,
      showEdgeLabels,
      setShowEdgeLabels,
      selectedNodeId,
      setSelectedNodeId,
      expandedGroupIds,
      expandGroup,
      collapseGroup,
      expandAllGroups,
      collapseAllGroups,
      resetExpandedGroups,
    }),
    [
      showPersons,
      showCompanies,
      eventFilter,
      attributes,
      toggleAttribute,
      showRiskScore,
      showTags,
      showEdgeLabels,
      selectedNodeId,
      expandedGroupIds,
      expandGroup,
      collapseGroup,
      expandAllGroups,
      collapseAllGroups,
      resetExpandedGroups,
    ],
  );

  return <CustomerGraphContext.Provider value={value}>{children}</CustomerGraphContext.Provider>;
}
