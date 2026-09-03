import {
  type ClusterThreshold,
  type ControlledGraphSettings,
  DEFAULT_CLUSTER_THRESHOLD,
} from '@app-builder/components/Graph/contexts/GraphViewSettingsContext';
import {
  type GraphFilterOption,
  graphFilterParamsEqual,
  personTableNames,
  relationGroupsFromRelations,
  toGenerateGraphFilterParams,
} from '@app-builder/components/Graph/lib/graph-query-filters';
import { type GraphData } from '@app-builder/models/graph';
import { useGetGenerateGraphQuery } from '@app-builder/queries/graph/generate-graph';
import { useListGraphRelationsQuery } from '@app-builder/queries/graph/list-relations';
import { useDataModel } from '@app-builder/services/data/data-model';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { toggle } from 'radash';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export type GraphRecordRef = {
  recordType: string;
  recordId: string;
};

export const GRAPH_DEGREE_OPTIONS = [1, 2, 3, 4, 5] as const;
export type GraphDegree = (typeof GRAPH_DEGREE_OPTIONS)[number];
export const DEFAULT_GRAPH_DEGREES: GraphDegree = 2;

export function isGraphDegree(value: number): value is GraphDegree {
  return (GRAPH_DEGREE_OPTIONS as readonly number[]).includes(value);
}

export type GraphSessionContextValue = {
  recordType: string;
  setRecordType: (value: string) => void;
  recordId: string;
  setRecordId: (value: string) => void;
  degrees: GraphDegree;
  setDegrees: (value: GraphDegree) => void;

  graphData: GraphData | null;
  /** Incremented on every fetch; keys the graph subtree so it remounts on new data. */
  graphGeneration: number;
  isGeneratingGraph: boolean;
  /** Fetch the graph for the picked record; no-op while the record is incomplete. */
  loadGraph: () => void;

  selectedTableNames: string[];
  toggleTableName: (name: string) => void;
  relationGroups: GraphFilterOption[];
  selectedRelationGroupIds: string[];
  toggleRelationGroup: (groupId: string) => void;
  isFilterDirty: boolean;
  refreshGraph: () => void;

  /** Graph view settings the provider borrows, so they outlive the remount above. */
  graphSettings: ControlledGraphSettings;
};

const GraphSessionContext = createSimpleContext<GraphSessionContextValue>('GraphSession');

export const useGraphSession = GraphSessionContext.useValue;

function toLoadedRecord(record: GraphRecordRef | undefined): GraphRecordRef | null {
  if (!record) return null;
  const recordId = record.recordId.trim();
  if (!record.recordType || !recordId) return null;
  return { recordType: record.recordType, recordId };
}

export function GraphSessionProvider({
  children,
  initialRecord,
}: {
  children: ReactNode;
  initialRecord?: GraphRecordRef;
}) {
  const { t } = useTranslation(['common']);
  const dataModel = useDataModel();
  const seed = toLoadedRecord(initialRecord);
  const initialTableNames = personTableNames(dataModel);

  const [recordType, setRecordType] = useState(seed?.recordType ?? '');
  const [recordId, setRecordId] = useState(seed?.recordId ?? '');
  const [degrees, setDegrees] = useState<GraphDegree>(DEFAULT_GRAPH_DEGREES);
  const [committedDegrees, setCommittedDegrees] = useState<GraphDegree>(DEFAULT_GRAPH_DEGREES);
  const [loadedRecord, setLoadedRecord] = useState<GraphRecordRef | null>(seed);
  const [selectedTableNames, setSelectedTableNames] = useState(initialTableNames);
  /** `null` means "every group", so groups loading in later are included without a sync effect. */
  const [relationGroupSelection, setRelationGroupSelection] = useState<string[] | null>(null);
  const [committedFilterParams, setCommittedFilterParams] = useState(() =>
    toGenerateGraphFilterParams({ selectedTableNames: initialTableNames, selectedRelationGroupIds: null }),
  );
  const [showRiskScore, setShowRiskScore] = useState(true);
  const [showTags, setShowTags] = useState(false);
  const [showHypernodes, setShowHypernodes] = useState(true);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [clusterThreshold, setClusterThreshold] = useState<ClusterThreshold>(DEFAULT_CLUSTER_THRESHOLD);

  const relationsQuery = useListGraphRelationsQuery();

  const relationGroups = useMemo(() => relationGroupsFromRelations(relationsQuery.data ?? []), [relationsQuery.data]);
  const allGroupIds = useMemo(() => relationGroups.map((group) => group.value), [relationGroups]);

  /** Drops picks whose group has since been deleted; still `null` while every group is selected. */
  const activeGroupIds = useMemo(
    () => relationGroupSelection?.filter((id) => allGroupIds.includes(id)) ?? null,
    [relationGroupSelection, allGroupIds],
  );

  const draftFilterParams = useMemo(
    () => toGenerateGraphFilterParams({ selectedTableNames, selectedRelationGroupIds: activeGroupIds }),
    [selectedTableNames, activeGroupIds],
  );

  const isFilterDirty = !graphFilterParamsEqual(draftFilterParams, committedFilterParams);

  const { data, dataUpdatedAt, error, isFetching, refetch } = useGetGenerateGraphQuery(
    {
      recordType: loadedRecord?.recordType ?? '',
      recordId: loadedRecord?.recordId ?? '',
      degrees: committedDegrees,
      ...committedFilterParams,
    },
    loadedRecord != null,
  );

  useEffect(() => {
    if (!error) return;
    toast.error(error.message ?? t('common:errors.unknown'));
  }, [error, t]);

  const loadGraph = useCallback(() => {
    const trimmedRecordId = recordId.trim();
    if (!recordType || !trimmedRecordId) return;

    const sameFilters = graphFilterParamsEqual(draftFilterParams, committedFilterParams);
    const sameDegrees = degrees === committedDegrees;
    setCommittedFilterParams(draftFilterParams);
    setCommittedDegrees(degrees);

    if (loadedRecord?.recordType === recordType && loadedRecord?.recordId === trimmedRecordId) {
      if (sameFilters && sameDegrees) void refetch();
      return;
    }

    setLoadedRecord({ recordType, recordId: trimmedRecordId });
  }, [
    committedDegrees,
    committedFilterParams,
    degrees,
    draftFilterParams,
    loadedRecord,
    recordId,
    recordType,
    refetch,
  ]);

  const refreshGraph = useCallback(() => {
    setCommittedFilterParams(draftFilterParams);
  }, [draftFilterParams]);

  const toggleTableName = useCallback((name: string) => {
    setSelectedTableNames((prev) => toggle(prev, name));
  }, []);

  const toggleRelationGroup = useCallback(
    (groupId: string) => {
      setRelationGroupSelection((prev) => {
        const next = toggle(prev?.filter((id) => allGroupIds.includes(id)) ?? allGroupIds, groupId);
        // `next` is always a subset of `allGroupIds`, so equal lengths mean "all selected".
        return next.length === allGroupIds.length ? null : next;
      });
    },
    [allGroupIds],
  );

  const graphSettings = useMemo<ControlledGraphSettings>(
    () => ({
      showRiskScore,
      onShowRiskScoreChange: setShowRiskScore,
      showTags,
      onShowTagsChange: setShowTags,
      showHypernodes,
      onShowHypernodesChange: setShowHypernodes,
      showEdgeLabels,
      onShowEdgeLabelsChange: setShowEdgeLabels,
      clusterThreshold,
      onClusterThresholdChange: setClusterThreshold,
    }),
    [showRiskScore, showTags, showHypernodes, showEdgeLabels, clusterThreshold],
  );

  const value = useMemo(
    () => ({
      recordType,
      setRecordType,
      recordId,
      setRecordId,
      degrees,
      setDegrees,
      graphData: data ?? null,
      graphGeneration: dataUpdatedAt,
      isGeneratingGraph: isFetching,
      loadGraph,
      selectedTableNames,
      toggleTableName,
      relationGroups,
      selectedRelationGroupIds: activeGroupIds ?? allGroupIds,
      toggleRelationGroup,
      isFilterDirty,
      refreshGraph,
      graphSettings,
    }),
    [
      recordType,
      recordId,
      degrees,
      data,
      dataUpdatedAt,
      isFetching,
      loadGraph,
      selectedTableNames,
      toggleTableName,
      relationGroups,
      activeGroupIds,
      allGroupIds,
      toggleRelationGroup,
      isFilterDirty,
      refreshGraph,
      graphSettings,
    ],
  );

  return <GraphSessionContext.Provider value={value}>{children}</GraphSessionContext.Provider>;
}
