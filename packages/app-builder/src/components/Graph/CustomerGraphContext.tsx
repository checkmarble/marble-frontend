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

export type SelectedGraphObject = {
  objectType: string;
  objectId: string;
};

/** Same composite key as graph `nodeKey`: `${objectType}:${objectId}` */
export function personBulkKey(person: SelectedGraphObject): string {
  return `${person.objectType}:${person.objectId}`;
}

export function parsePersonBulkKey(key: string): SelectedGraphObject {
  const colonIdx = key.indexOf(':');
  return {
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

  // Focus (settings panel detail card)
  selectedObject: SelectedGraphObject | null;
  setSelectedObject: (value: SelectedGraphObject | null) => void;

  // Selection mode + bulk selection (person checkboxes)
  selectionMode: boolean;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  checkedPersons: Set<string>;
  toggleCheckedPerson: (person: SelectedGraphObject) => void;
  isPersonChecked: (person: SelectedGraphObject) => boolean;
  clearCheckedPersons: () => void;

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

export function CustomerGraphProvider({
  children,
  initialSelectedObject = null,
}: {
  children: ReactNode;
  initialSelectedObject?: SelectedGraphObject | null;
}) {
  const [showPersons, setShowPersons] = useState(true);
  const [showCompanies, setShowCompanies] = useState(true);
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [attributes, setAttributes] = useState<GraphAttribute[]>([...GRAPH_ATTRIBUTES]);
  const [showRiskScore, setShowRiskScore] = useState(true);
  const [showTags, setShowTags] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [selectedObject, setSelectedObject] = useState<SelectedGraphObject | null>(initialSelectedObject);
  const [selectionMode, setSelectionMode] = useState(false);
  const [checkedPersons, setCheckedPersons] = useState<Set<string>>(() => new Set());
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set());

  const toggleAttribute = useCallback((attribute: GraphAttribute) => {
    setAttributes((prev) => (prev.includes(attribute) ? prev.filter((a) => a !== attribute) : [...prev, attribute]));
  }, []);

  const clearCheckedPersons = useCallback(() => {
    setCheckedPersons(new Set());
  }, []);

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setCheckedPersons(new Set());
  }, []);

  const toggleCheckedPerson = useCallback((person: SelectedGraphObject) => {
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
    (person: SelectedGraphObject) => checkedPersons.has(personBulkKey(person)),
    [checkedPersons],
  );

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
      selectedObject,
      setSelectedObject,
      selectionMode,
      enterSelectionMode,
      exitSelectionMode,
      checkedPersons,
      toggleCheckedPerson,
      isPersonChecked,
      clearCheckedPersons,
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
      selectedObject,
      selectionMode,
      enterSelectionMode,
      exitSelectionMode,
      checkedPersons,
      toggleCheckedPerson,
      isPersonChecked,
      clearCheckedPersons,
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
