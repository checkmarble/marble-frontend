import { type GraphData } from '@app-builder/models/graph';
import { useGenerateGraphQuery } from '@app-builder/queries/graph/generate-graph';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { type ClusterThreshold, type ControlledGraphSettings, DEFAULT_CLUSTER_THRESHOLD } from './CustomerGraphContext';
import { type GraphLayoutMode } from './graph-layout';
import { EMPTY_RELATION_FILTER, type RelationFilter } from './relation-filter';

export type GraphRecordRef = {
  recordType: string;
  recordId: string;
};

export type GraphSessionContextValue = {
  recordType: string;
  setRecordType: (value: string) => void;
  recordId: string;
  setRecordId: (value: string) => void;

  graphData: GraphData | null;
  /** Incremented on every fetch; keys the graph subtree so it remounts on new data. */
  graphGeneration: number;
  isGeneratingGraph: boolean;
  /** Fetch the graph for the picked record; no-op while the record is incomplete. */
  loadGraph: () => void;
  /** Refetch the graph on screen, after the relation settings changed. */
  reloadGraph: () => void;

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
  const seed = toLoadedRecord(initialRecord);
  const [recordType, setRecordType] = useState(seed?.recordType ?? '');
  const [recordId, setRecordId] = useState(seed?.recordId ?? '');
  const [loadedRecord, setLoadedRecord] = useState<GraphRecordRef | null>(seed);
  const [showPersons, setShowPersons] = useState(true);
  const [showCompanies, setShowCompanies] = useState(true);
  const [showRiskScore, setShowRiskScore] = useState(true);
  const [showTags, setShowTags] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [clusterThreshold, setClusterThreshold] = useState<ClusterThreshold>(DEFAULT_CLUSTER_THRESHOLD);
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>('radialDagre');
  const [relationFilter, setRelationFilter] = useState<RelationFilter>(EMPTY_RELATION_FILTER);

  const { data, dataUpdatedAt, error, isFetching, refetch } = useGenerateGraphQuery(
    {
      recordType: loadedRecord?.recordType ?? '',
      recordId: loadedRecord?.recordId ?? '',
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

    if (loadedRecord?.recordType === recordType && loadedRecord?.recordId === trimmedRecordId) {
      void refetch();
      return;
    }

    setLoadedRecord({ recordType, recordId: trimmedRecordId });
  }, [loadedRecord, recordId, recordType, refetch]);

  const reloadGraph = useCallback(() => {
    if (!data) return;
    void refetch();
  }, [data, refetch]);

  const graphSettings = useMemo<ControlledGraphSettings>(
    () => ({
      showPersons,
      onShowPersonsChange: setShowPersons,
      showCompanies,
      onShowCompaniesChange: setShowCompanies,
      showRiskScore,
      onShowRiskScoreChange: setShowRiskScore,
      showTags,
      onShowTagsChange: setShowTags,
      showEdgeLabels,
      onShowEdgeLabelsChange: setShowEdgeLabels,
      clusterThreshold,
      onClusterThresholdChange: setClusterThreshold,
      layoutMode,
      onLayoutModeChange: setLayoutMode,
      relationFilter,
      onRelationFilterChange: setRelationFilter,
    }),
    [showPersons, showCompanies, showRiskScore, showTags, showEdgeLabels, clusterThreshold, layoutMode, relationFilter],
  );

  const value = useMemo(
    () => ({
      recordType,
      setRecordType,
      recordId,
      setRecordId,
      graphData: data ?? null,
      graphGeneration: dataUpdatedAt,
      isGeneratingGraph: isFetching,
      loadGraph,
      reloadGraph,
      graphSettings,
    }),
    [recordType, recordId, data, dataUpdatedAt, isFetching, loadGraph, reloadGraph, graphSettings],
  );

  return <GraphSessionContext.Provider value={value}>{children}</GraphSessionContext.Provider>;
}
