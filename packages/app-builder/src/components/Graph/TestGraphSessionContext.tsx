import { type GraphData } from '@app-builder/models/graph';
import { useGenerateGraphQuery } from '@app-builder/queries/graph/generate-graph';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type Dispatch, type ReactNode, type SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { type ClusterThreshold, DEFAULT_CLUSTER_THRESHOLD } from './CustomerGraphContext';
import { type GraphLayoutMode } from './graph-layout';
import { EMPTY_RELATION_FILTER, type RelationFilter } from './relation-filter';

export type TestGraphSessionContextValue = {
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

  // Graph options the provider borrows, so they outlive the remount above.
  showPersons: boolean;
  setShowPersons: (value: boolean) => void;
  showCompanies: boolean;
  setShowCompanies: (value: boolean) => void;
  showRiskScore: boolean;
  setShowRiskScore: (value: boolean) => void;
  showTags: boolean;
  setShowTags: (value: boolean) => void;
  showEdgeLabels: boolean;
  setShowEdgeLabels: (value: boolean) => void;
  clusterThreshold: ClusterThreshold;
  setClusterThreshold: (value: ClusterThreshold) => void;
  layoutMode: GraphLayoutMode;
  setLayoutMode: (value: GraphLayoutMode) => void;
  relationFilter: RelationFilter;
  setRelationFilter: Dispatch<SetStateAction<RelationFilter>>;
};

const TestGraphSessionContext = createSimpleContext<TestGraphSessionContextValue>('TestGraphSession');

export const useTestGraphSession = TestGraphSessionContext.useValue;

export function TestGraphSessionProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation(['common']);
  const [recordType, setRecordType] = useState('');
  const [recordId, setRecordId] = useState('');
  const [loadedRecord, setLoadedRecord] = useState<{ recordType: string; recordId: string } | null>(null);
  const [showPersons, setShowPersons] = useState(true);
  const [showCompanies, setShowCompanies] = useState(true);
  const [showRiskScore, setShowRiskScore] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [clusterThreshold, setClusterThreshold] = useState<ClusterThreshold>(DEFAULT_CLUSTER_THRESHOLD);
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>('rad-dagre');
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
      showPersons,
      setShowPersons,
      showCompanies,
      setShowCompanies,
      showRiskScore,
      setShowRiskScore,
      showTags,
      setShowTags,
      showEdgeLabels,
      setShowEdgeLabels,
      clusterThreshold,
      setClusterThreshold,
      layoutMode,
      setLayoutMode,
      relationFilter,
      setRelationFilter,
    }),
    [
      recordType,
      recordId,
      data,
      dataUpdatedAt,
      isFetching,
      loadGraph,
      reloadGraph,
      showPersons,
      showCompanies,
      showRiskScore,
      showTags,
      showEdgeLabels,
      clusterThreshold,
      layoutMode,
      relationFilter,
    ],
  );

  return <TestGraphSessionContext.Provider value={value}>{children}</TestGraphSessionContext.Provider>;
}
