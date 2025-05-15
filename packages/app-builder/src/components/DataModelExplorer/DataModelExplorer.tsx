import type { DataModelWithTableOptions } from '@app-builder/models';
import { useCallbackRef } from '@marble/shared';
import { useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { DataTableRender } from './DataTableRender';
import { DataModelExplorerContext, type DataModelExplorerState } from './Provider';
import type { DataModelExplorerNavigationTab } from './types';

export type DataModelExplorerProps = {
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
    const existingTab = explorerContext.explorerState.tabs.find(
      findTabWithUniqValue(newTabUniqValue),
    );

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

  const closeTab = useCallbackRef((tab: DataModelExplorerNavigationTab) => {
    const nextState: Partial<DataModelExplorerState> = {};
    const tabIndex = tabs.indexOf(tab);

    if (tabIndex < 0) {
      return;
    }

    if (tab === currentTab) {
      const nextTab = lastActiveTab ?? tabs[tabIndex + 1] ?? tabs[tabIndex - 1];
      if (nextTab) {
        nextState.lastActiveTab = null;
        nextState.currentTab = nextTab;
      }
    }

    const nextTabsState = [...tabs.slice(0, tabIndex), ...tabs.slice(tabIndex + 1)];
    if (nextTabsState.length === 0) {
      explorerContext.setExplorerState(null);
    }

    nextState.closedTabsHistory = [...closedTabsHistory, tab];
    nextState.tabs = nextTabsState;

    explorerContext.setExplorerState(nextState);
  });

  if (!explorerContext.explorerState) {
    return null;
  }

  const { currentTab, lastActiveTab, closedTabsHistory, tabs } = explorerContext.explorerState;

  return (
    <div className="h-[calc(100vh_-_210px)] min-w-[80vw] overflow-y-scroll p-14 py-2">
      <div className="flex flex-col gap-3">
        <div className="before:bg-grey-90 relative py-2 pr-40 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
          {tabs.map((tab) => {
            const tabUniqValue = getTabUniqValue(tab);
            return (
              <DataModelExplorerTab
                current={tab === currentTab}
                key={tabUniqValue}
                label={`${tab.targetTableName}`}
                onClick={() => {
                  explorerContext.setExplorerState({
                    lastActiveTab: currentTab,
                    currentTab: tab,
                  });
                }}
                onClose={() => {
                  closeTab(tab);
                }}
              />
            );
          })}
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
          <DataTableRender item={currentTab} dataModel={props.dataModel} navigateTo={addTab} />
        </div>
      </div>
    </div>
  );
}

function DataModelExplorerTab(props: {
  current: boolean;
  label: string;
  onClick: () => void;
  onClose: () => void;
}) {
  return (
    <button
      aria-current={props.current}
      type="button"
      className="group/tab text-m text-grey-50 aria-[current=true]:bg-purple-96 aria-[current=true]:text-purple-65 relative inline-flex h-10 items-center gap-2 rounded px-4 py-2"
      onClick={props.onClick}
    >
      {props.label}
      <Icon
        icon="cross"
        className="invisible size-5 group-aria-[current=true]/tab:visible"
        onClick={(e) => {
          e.stopPropagation();
          props.onClose?.();
        }}
      />
    </button>
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
        <Button size="icon" variant="secondary" className={props.className}>
          <Icon icon="more-menu" className="size-4" />
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="end" sideOffset={4}>
        <MenuCommand.List>
          {props.options.map((opt) => (
            <MenuCommand.Item
              disabled={opt.disabled}
              key={opt.value}
              onSelect={() => props.onSelect(opt.value)}
            >
              {opt.label}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
