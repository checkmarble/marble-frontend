import { useControllableState } from '@app-builder/hooks/useControllableState';
import { isMaxRiskLevelInRange, type MaxRiskLevel, type ScoringSettings } from '@app-builder/models/scoring';
import { useGetScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type ReactNode, useMemo } from 'react';
import { type GraphLayoutMode } from '../lib/graph-layout';

/** Branch sizes a subtree must exceed to collapse into a cluster chip. `0` disables clustering. */
export const CLUSTER_THRESHOLD_OPTIONS = [0, 1, 2, 3, 5, 8, 13, 21, 34] as const;
export type ClusterThreshold = (typeof CLUSTER_THRESHOLD_OPTIONS)[number];
export const DEFAULT_CLUSTER_THRESHOLD: ClusterThreshold = 8;

/**
 * The view settings a host can own instead of the provider. Handed over whole, they
 * survive the provider's remount when the graph regenerates.
 */
export type ControlledGraphSettings = {
  showRiskScore: boolean;
  onShowRiskScoreChange: (value: boolean) => void;
  showTags: boolean;
  onShowTagsChange: (value: boolean) => void;
  showHypernodes: boolean;
  onShowHypernodesChange: (value: boolean) => void;
  showEdgeLabels: boolean;
  onShowEdgeLabelsChange: (value: boolean) => void;
  clusterThreshold: ClusterThreshold;
  onClusterThresholdChange: (value: ClusterThreshold) => void;
  layoutMode: GraphLayoutMode;
  onLayoutModeChange: (value: GraphLayoutMode) => void;
};

/**
 * How the graph is drawn. Changing any of these is a deliberate user action from
 * the settings panel, never a side effect of pointing at the canvas.
 */
export type GraphViewSettings = {
  showRiskScore: boolean;
  setShowRiskScore: (value: boolean) => void;
  /** Org scoring settings; loaded once when risk scores are shown. */
  scoringSettings: ScoringSettings | undefined;
  /** Validated palette size derived from {@link GraphViewSettings.scoringSettings}. */
  maxRiskLevel: MaxRiskLevel | undefined;
  showTags: boolean;
  setShowTags: (value: boolean) => void;
  showHypernodes: boolean;
  setShowHypernodes: (value: boolean) => void;
  showEdgeLabels: boolean;
  setShowEdgeLabels: (value: boolean) => void;
  layoutMode: GraphLayoutMode;
  setLayoutMode: (value: GraphLayoutMode) => void;
  /** Branch size at which a subtree collapses; `0` disables clustering. */
  clusterThreshold: ClusterThreshold;
  setClusterThreshold: (value: ClusterThreshold) => void;
};

const GraphViewSettingsContext = createSimpleContext<GraphViewSettings>('GraphViewSettings');

export const useGraphViewSettings = GraphViewSettingsContext.useValue;

export function GraphViewSettingsProvider({
  children,
  showRiskScore: controlledShowRiskScore,
  onShowRiskScoreChange,
  showTags: controlledShowTags,
  onShowTagsChange,
  showHypernodes: controlledShowHypernodes,
  onShowHypernodesChange,
  showEdgeLabels: controlledShowEdgeLabels,
  onShowEdgeLabelsChange,
  clusterThreshold: controlledClusterThreshold,
  onClusterThresholdChange,
  layoutMode: controlledLayoutMode,
  onLayoutModeChange,
}: Partial<ControlledGraphSettings> & { children: ReactNode }) {
  const [showRiskScore, setShowRiskScore] = useControllableState(false, controlledShowRiskScore, onShowRiskScoreChange);
  const settingsQuery = useGetScoringSettingsQuery(showRiskScore);
  const scoringSettings = settingsQuery.data?.settings ?? undefined;
  const rawMaxRiskLevel = scoringSettings?.maxRiskLevel;
  const maxRiskLevel = rawMaxRiskLevel != null && isMaxRiskLevelInRange(rawMaxRiskLevel) ? rawMaxRiskLevel : undefined;
  const [showTags, setShowTags] = useControllableState(false, controlledShowTags, onShowTagsChange);
  const [showHypernodes, setShowHypernodes] = useControllableState(
    true,
    controlledShowHypernodes,
    onShowHypernodesChange,
  );
  const [showEdgeLabels, setShowEdgeLabels] = useControllableState(
    false,
    controlledShowEdgeLabels,
    onShowEdgeLabelsChange,
  );
  const [layoutMode, setLayoutMode] = useControllableState<GraphLayoutMode>(
    'polarPetal',
    controlledLayoutMode,
    onLayoutModeChange,
  );
  const [clusterThreshold, setClusterThreshold] = useControllableState<ClusterThreshold>(
    DEFAULT_CLUSTER_THRESHOLD,
    controlledClusterThreshold,
    onClusterThresholdChange,
  );

  const value = useMemo(
    () => ({
      showRiskScore,
      setShowRiskScore,
      scoringSettings,
      maxRiskLevel,
      showTags,
      setShowTags,
      showHypernodes,
      setShowHypernodes,
      showEdgeLabels,
      setShowEdgeLabels,
      layoutMode,
      setLayoutMode,
      clusterThreshold,
      setClusterThreshold,
    }),
    [
      showRiskScore,
      setShowRiskScore,
      scoringSettings,
      maxRiskLevel,
      showTags,
      setShowTags,
      showHypernodes,
      setShowHypernodes,
      showEdgeLabels,
      setShowEdgeLabels,
      layoutMode,
      setLayoutMode,
      clusterThreshold,
      setClusterThreshold,
    ],
  );

  return <GraphViewSettingsContext.Provider value={value}>{children}</GraphViewSettingsContext.Provider>;
}
