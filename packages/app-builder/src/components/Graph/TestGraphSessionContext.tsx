import { type GraphData } from '@app-builder/models/graph';
import { useGenerateGraphMutation } from '@app-builder/queries/graph/generate-graph';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type Dispatch, type ReactNode, type SetStateAction, useCallback, useMemo, useState } from 'react';
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
  const [recordType, setRecordType] = useState('');
  const [recordId, setRecordId] = useState('');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [graphGeneration, setGraphGeneration] = useState(0);
  const [showPersons, setShowPersons] = useState(true);
  const [showCompanies, setShowCompanies] = useState(true);
  const [showRiskScore, setShowRiskScore] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [clusterThreshold, setClusterThreshold] = useState<ClusterThreshold>(DEFAULT_CLUSTER_THRESHOLD);
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>('rad-dagre');
  const [relationFilter, setRelationFilter] = useState<RelationFilter>(EMPTY_RELATION_FILTER);
  const { mutate: generateGraph, isPending: isGeneratingGraph } = useGenerateGraphMutation();

  const loadGraph = useCallback(() => {
    const trimmedRecordId = recordId.trim();
    if (!recordType || !trimmedRecordId) return;

    generateGraph(
      { recordType, recordId: trimmedRecordId },
      {
        onSuccess: (data) => {
          setGraphData(data);
          setGraphGeneration((generation) => generation + 1);
        },
      },
    );
  }, [generateGraph, recordId, recordType]);

  const reloadGraph = useCallback(() => {
    if (!graphData) return;
    loadGraph();
  }, [graphData, loadGraph]);

  const value = useMemo(
    () => ({
      recordType,
      setRecordType,
      recordId,
      setRecordId,
      graphData,
      graphGeneration,
      isGeneratingGraph,
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
      graphData,
      graphGeneration,
      isGeneratingGraph,
      loadGraph,
      reloadGraph,
      showPersons,
      showCompanies,
      showRiskScore,
      showTags,
      clusterThreshold,
      layoutMode,
      relationFilter,
    ],
  );

  return <TestGraphSessionContext.Provider value={value}>{children}</TestGraphSessionContext.Provider>;
}
