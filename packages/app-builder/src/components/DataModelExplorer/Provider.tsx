import { createSimpleContext } from '@marble/shared';
import { type ReactNode, useCallback, useState } from 'react';

import { type DataModelExplorerNavigationTab } from './types';

export type DataModelExplorerState = {
  tabs: DataModelExplorerNavigationTab[];
  currentTab: DataModelExplorerNavigationTab;
  lastActiveTab: DataModelExplorerNavigationTab | null;
  closedTabsHistory: DataModelExplorerNavigationTab[];
};

type DataModelExplorerContextValue = {
  explorerState: DataModelExplorerState | null;
  setExplorerState: (state: Partial<DataModelExplorerState> | null) => void;
  startNavigation: (tab: DataModelExplorerNavigationTab) => void;
};

export const DataModelExplorerContext =
  createSimpleContext<DataModelExplorerContextValue>('DataModelExplorer');

export function DataModelExplorerProvider({ children }: { children: ReactNode }) {
  const [explorerState, _setExplorerState] = useState<DataModelExplorerState | null>(null);
  const startNavigation = useCallback(
    (tab: DataModelExplorerNavigationTab) => {
      _setExplorerState({
        closedTabsHistory: [],
        currentTab: tab,
        lastActiveTab: null,
        tabs: [tab],
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
