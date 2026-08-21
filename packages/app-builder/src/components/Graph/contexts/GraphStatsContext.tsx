import { createSimpleContext } from '@app-builder/utils/create-context';
import { type Dispatch, type ReactNode, type SetStateAction, useState } from 'react';

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

const GraphStatsContext = createSimpleContext<GraphStats>('GraphStats');
const SetGraphStatsContext = createSimpleContext<Dispatch<SetStateAction<GraphStats>>>('SetGraphStats');

export const useGraphStats = GraphStatsContext.useValue;

/**
 * Kept apart from {@link useGraphStats} on purpose: `GraphImpl` produces these
 * counts but never displays them. Reading the value it writes would make every
 * hide or check re-render the whole canvas a second time to no effect.
 */
export const useSetGraphStats = SetGraphStatsContext.useValue;

export function GraphStatsProvider({ children }: { children: ReactNode }) {
  const [graphStats, setGraphStats] = useState<GraphStats>(EMPTY_GRAPH_STATS);

  return (
    <SetGraphStatsContext.Provider value={setGraphStats}>
      <GraphStatsContext.Provider value={graphStats}>{children}</GraphStatsContext.Provider>
    </SetGraphStatsContext.Provider>
  );
}
