import { type DataModel } from '@app-builder/models';
import { useCallback, useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { DataTableRender } from './DataTableRender';
import { DataModelExplorerContext, type DataModelExplorerState } from './Provider';
import { type DataModelExplorerNavigationTab } from './types';

export type DataModelExplorerProps = {
  dataModel: DataModel;
};

export function DataModelExplorer(props: DataModelExplorerProps) {
  const explorerContext = DataModelExplorerContext.useValue();

  const addTab = useCallback(
    (tab: DataModelExplorerNavigationTab) => {
      if (!explorerContext.explorerState) return;

      explorerContext.setExplorerState({
        tabs: [...explorerContext.explorerState.tabs, tab],
        lastActiveTab: explorerContext.explorerState.currentTab,
        currentTab: tab,
      });
    },
    [explorerContext],
  );

  if (!explorerContext.explorerState) {
    return null;
  }

  const { currentTab, lastActiveTab, closedTabsHistory, tabs } = explorerContext.explorerState;
  const tabObjectId = currentTab.sourceObject[currentTab.sourceFieldName];

  return (
    <div className="min-w-[80vw] p-14 pt-2">
      <div className="flex flex-col gap-3">
        <div className="before:bg-grey-90 relative py-2 pr-40 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
          {tabs.map((tab, i) => (
            <DataModelExplorerTab
              current={tab === currentTab}
              key={`${tabObjectId ?? 'unknown'}_${tab.targetTableName}`}
              label={`${tab.targetTableName}`}
              onClick={() => {
                explorerContext.setExplorerState({
                  lastActiveTab: currentTab,
                  currentTab: tab,
                });
              }}
              onClose={() => {
                const nextState: Partial<DataModelExplorerState> = {};

                if (tab === currentTab) {
                  const nextTab = lastActiveTab ?? tabs[i + 1] ?? tabs[i - 1];
                  if (nextTab) {
                    nextState.lastActiveTab = null;
                    nextState.currentTab = nextTab;
                  }
                }

                nextState.closedTabsHistory = [...closedTabsHistory, tab];
                nextState.tabs = [...tabs.slice(0, i), ...tabs.slice(i + 1)];

                explorerContext.setExplorerState(nextState);
              }}
            />
          ))}
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

                  explorerContext.setExplorerState({
                    closedTabsHistory: closedTabsHistory.slice(0, -1),
                    tabs: [...tabs, tab],
                    currentTab: tab,
                  });
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
