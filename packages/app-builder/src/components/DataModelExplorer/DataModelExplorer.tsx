import { type DataModelWithTableOptions } from '@app-builder/models';
import { useCallbackRef } from '@marble/shared';
import { useState } from 'react';
import { ButtonV2, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { DataTableRender } from './DataTableRender';
import { DataModelExplorerContext } from './Provider';
import { type DataModelExplorerNavigationTab } from './types';

export type DataModelExplorerProps = {
  caseId: string;
  dataModel: DataModelWithTableOptions;
};

function getTabUniqValue(tab: DataModelExplorerNavigationTab) {
  const sourceId = tab.sourceObject[tab.sourceFieldName];
  return `${tab.sourceTableName}_${tab.sourceFieldName}_${sourceId ?? 'unknown'}_${tab.targetTableName}_${tab.filterFieldName}_${tab.orderingFieldName}`;
}

function findTabWithUniqValue(tabUniqValue: string) {
  return (tab: DataModelExplorerNavigationTab) => tabUniqValue === getTabUniqValue(tab);
}

export function DataModelExplorer(props: DataModelExplorerProps) {
  const explorerContext = DataModelExplorerContext.useValue();

  const reopenClosedTab = useCallbackRef((tabUniqValue: string) => {
    if (!explorerContext.explorerState) return;

    const closedTabsHistory = explorerContext.explorerState.closedTabsHistory;
    const closedTabIndex = closedTabsHistory.findIndex(findTabWithUniqValue(tabUniqValue));
    if (closedTabIndex < 0) return;

    const closedTab = closedTabsHistory[closedTabIndex];
    if (!closedTab) return;

    const newClosedHistory = [
      ...closedTabsHistory.slice(0, closedTabIndex),
      ...closedTabsHistory.slice(closedTabIndex + 1),
    ];

    explorerContext.setExplorerState({
      closedTabsHistory: newClosedHistory,
      tabs: [...tabs, closedTab],
      lastActiveTab: explorerContext.explorerState.currentTab,
      currentTab: closedTab,
    });
  });

  const addTab = useCallbackRef((newTab: DataModelExplorerNavigationTab) => {
    if (!explorerContext.explorerState) return;

    const newTabUniqValue = getTabUniqValue(newTab);
    const existingTab = explorerContext.explorerState.tabs.find(findTabWithUniqValue(newTabUniqValue));

    if (existingTab) {
      explorerContext.setExplorerState({
        ...explorerContext.explorerState,
        lastActiveTab: explorerContext.explorerState.currentTab,
        currentTab: existingTab,
      });
      return;
    }

    const existingClosedTab = explorerContext.explorerState.closedTabsHistory.find(
      findTabWithUniqValue(newTabUniqValue),
    );
    if (existingClosedTab) {
      reopenClosedTab(newTabUniqValue);
      return;
    }

    explorerContext.setExplorerState({
      tabs: [...explorerContext.explorerState.tabs, newTab],
      lastActiveTab: explorerContext.explorerState.currentTab,
      currentTab: newTab,
    });
  });

  if (!explorerContext.explorerState) {
    return null;
  }

  const { currentTab, closedTabsHistory, tabs } = explorerContext.explorerState;

  return (
    <div className="h-[calc(100vh-210px)] min-w-[80vw] overflow-y-scroll p-14 py-2">
      <div className="flex flex-col gap-3">
        <div className="before:bg-grey-border relative py-2 pr-40 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
          <TabBarActions
            className="absolute right-2 top-2"
            options={[
              {
                label: 'Reopen last closed tab',
                value: 'open_last_closed',
                disabled: closedTabsHistory.length === 0,
              },
            ]}
            onSelect={(opt) => {
              switch (opt) {
                case 'open_last_closed': {
                  const tab = closedTabsHistory[closedTabsHistory.length - 1];
                  if (!tab) return;

                  reopenClosedTab(getTabUniqValue(tab));
                  break;
                }
                default:
                  break;
              }
            }}
          />
        </div>
        <div>
          <DataTableRender caseId={props.caseId} item={currentTab} dataModel={props.dataModel} navigateTo={addTab} />
        </div>
      </div>
    </div>
  );
}

function TabBarActions(props: {
  className?: string;
  options: { label: string; disabled: boolean; value: string }[];
  onSelect: (opt: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <ButtonV2 mode="icon" variant="secondary" className={props.className}>
          <Icon icon="more-menu" className="size-3.5" />
        </ButtonV2>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="end" sideOffset={4}>
        <MenuCommand.List>
          {props.options.map((opt) => (
            <MenuCommand.Item disabled={opt.disabled} key={opt.value} onSelect={() => props.onSelect(opt.value)}>
              {opt.label}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
