import { createSimpleContext } from '@marble/shared';
import { type ReactNode, useCallback, useState } from 'react';

import { type ColumnFilters } from './column-filters';
import { type DataModelExplorerNavigationTab } from './types';

export type DataModelExplorerState = {
  tabs: DataModelExplorerNavigationTab[];
  currentTab: DataModelExplorerNavigationTab;
  lastActiveTab: DataModelExplorerNavigationTab | null;
  /** Column filters of each open tab, by tab key: they survive a switch to another tab. */
  filtersByTab: Record<string, ColumnFilters>;
};

type DataModelExplorerContextValue = {
  explorerState: DataModelExplorerState | null;
  setExplorerState: (state: Partial<DataModelExplorerState> | null) => void;
  startNavigation: (tab: DataModelExplorerNavigationTab) => void;
};

export const DataModelExplorerContext = createSimpleContext<DataModelExplorerContextValue>('DataModelExplorer');

export function DataModelExplorerProvider({ children }: { children: ReactNode }) {
  const [explorerState, _setExplorerState] = useState<DataModelExplorerState | null>(null);
  const startNavigation = useCallback(
    (tab: DataModelExplorerNavigationTab) => {
      _setExplorerState({
        currentTab: tab,
        lastActiveTab: null,
        tabs: [tab],
        filtersByTab: {},
      });
    },
    [_setExplorerState],
  );
  const setExplorerState = useCallback(
    (partialState: Partial<DataModelExplorerState> | null) => {
      _setExplorerState((state) => {
        if (state === null || partialState === null) return null;
        return { ...state, ...partialState };
      });
    },
    [_setExplorerState],
  );

  return (
    <DataModelExplorerContext.Provider value={{ explorerState, startNavigation, setExplorerState }}>
      {children}
    </DataModelExplorerContext.Provider>
  );
}
