import { type DataModel } from '@app-builder/models';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useCallbackRef } from '@marble/shared';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { cn, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { CustomerKpis } from '../CustomerKpis/CustomerKpis';
import { type ColumnFilters } from './column-filters';
import { DataTableRender } from './DataTableRender';
import { DataModelExplorerContext, type DataModelExplorerState } from './Provider';
import { type DataModelExplorerNavigationTab } from './types';

export type DataModelExplorerProps = {
  caseId?: string;
  client?: { objectType: string; objectId: string };
  dataModel: DataModel;
};

const NO_FILTERS: ColumnFilters = {};

function getTabUniqValue(tab: DataModelExplorerNavigationTab) {
  const sourceId = tab.sourceObject[tab.sourceFieldName];
  return `${tab.sourceTableName}_${tab.sourceFieldName}_${sourceId ?? 'unknown'}_${tab.targetTableName}_${tab.filterFieldName}_${tab.orderingFieldName}`;
}

export function DataModelExplorer(props: DataModelExplorerProps) {
  const explorerContext = DataModelExplorerContext.useValue();
  const { currentUser } = useOrganizationDetails();

  const addTab = useCallbackRef((newTab: DataModelExplorerNavigationTab) => {
    if (!explorerContext.explorerState) return;

    const newTabUniqValue = getTabUniqValue(newTab);
    const existingTab = explorerContext.explorerState.tabs.find((tab) => getTabUniqValue(tab) === newTabUniqValue);

    explorerContext.setExplorerState({
      tabs: existingTab ? explorerContext.explorerState.tabs : [...explorerContext.explorerState.tabs, newTab],
      lastActiveTab: explorerContext.explorerState.currentTab,
      currentTab: existingTab ?? newTab,
    });
  });

  const closeTab = useCallbackRef((tab: DataModelExplorerNavigationTab) => {
    const nextState: Partial<DataModelExplorerState> = {};
    const tabIndex = tabs.indexOf(tab);

    if (tabIndex < 0) {
      return;
    }

    if (tab === currentTab) {
      const previousTab = lastActiveTab && lastActiveTab !== tab ? lastActiveTab : undefined;
      const nextTab = previousTab ?? tabs[tabIndex + 1] ?? tabs[tabIndex - 1];
      if (nextTab) {
        nextState.lastActiveTab = null;
        nextState.currentTab = nextTab;
      }
    }

    const nextTabsState = [...tabs.slice(0, tabIndex), ...tabs.slice(tabIndex + 1)];
    if (nextTabsState.length === 0) {
      explorerContext.setExplorerState(null);
    }

    nextState.tabs = nextTabsState;
    // A closed tab starts without filters if it is opened again.
    nextState.filtersByTab = R.omit(filtersByTab, [getTabUniqValue(tab)]);

    explorerContext.setExplorerState(nextState);
  });

  if (!explorerContext.explorerState) {
    return null;
  }

  const { currentTab, lastActiveTab, tabs, filtersByTab } = explorerContext.explorerState;
  const currentTabUniqValue = getTabUniqValue(currentTab);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-md pt-md">
      {props.client ? <CustomerKpis tinted currentUser={currentUser} {...props.client} /> : null}
      <div className="flex flex-wrap items-center gap-sm">
        {tabs.map((tab) => {
          const targetTable = props.dataModel.find((table) => table.name === tab.targetTableName);
          return (
            <DataModelExplorerTab
              current={tab === currentTab}
              key={getTabUniqValue(tab)}
              label={targetTable?.alias || tab.targetTableName}
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
      </div>
      {/* Keyed per tab: scroll position and pending filter input never leak from one tab to another. */}
      <DataTableRender
        key={currentTabUniqValue}
        caseId={props.caseId}
        item={currentTab}
        filters={filtersByTab[currentTabUniqValue] ?? NO_FILTERS}
        onFiltersChange={(filters) =>
          explorerContext.setExplorerState({ filtersByTab: { ...filtersByTab, [currentTabUniqValue]: filters } })
        }
        dataModel={props.dataModel}
        navigateTo={addTab}
      />
    </div>
  );
}

function DataModelExplorerTab(props: { current: boolean; label: string; onClick: () => void; onClose: () => void }) {
  const { t } = useTranslation(['cases']);

  return (
    <Tag
      color={props.current ? 'purple' : 'grey'}
      className={cn('rounded-md font-medium', props.current && 'bg-purple-background dark:bg-transparent')}
    >
      <button type="button" aria-current={props.current ? 'true' : undefined} onClick={props.onClick}>
        {props.label}
      </button>
      {props.current ? (
        <button type="button" aria-label={t('cases:data_explorer.close_tab')} onClick={props.onClose}>
          <Icon icon="cross" className="size-3.5" />
        </button>
      ) : null}
    </Tag>
  );
}
