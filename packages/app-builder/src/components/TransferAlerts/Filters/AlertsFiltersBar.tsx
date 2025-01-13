import {
  AddNewFilterButton,
  ClearAllFiltersButton,
  FilterItem,
  FilterPopover,
} from '@app-builder/components/Filters';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { alertsI18n } from '../alerts-i18n';
import {
  useAlertsFiltersContext,
  useAlertsFiltersPartition,
  useClearAllFilters,
  useClearFilter,
} from './AlertsFiltersContext';
import { AlertsFiltersMenu } from './AlertsFiltersMenu';
import { FilterDetail } from './FilterDetail';
import { type AlertsFilterName, getFilterIcon, getFilterTKey } from './filters';

export function AlertsFiltersBar() {
  const { undefinedAlertsFilterNames, definedAlertsFilterNames } =
    useAlertsFiltersPartition();
  const clearAllFilters = useClearAllFilters();

  if (definedAlertsFilterNames.length === 0) {
    return null;
  }

  return (
    <>
      <Separator className="bg-grey-90" decorative />
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row flex-wrap gap-2">
          {definedAlertsFilterNames.map((filterName) => (
            <FiltersBarItem key={filterName} filterName={filterName} />
          ))}
          {undefinedAlertsFilterNames.length > 0 ? (
            <AlertsFiltersMenu filterNames={undefinedAlertsFilterNames}>
              <AddNewFilterButton />
            </AlertsFiltersMenu>
          ) : null}
        </div>
        <ClearAllFiltersButton onClick={clearAllFilters} />
      </div>
    </>
  );
}

function FiltersBarItem({ filterName }: { filterName: AlertsFilterName }) {
  const { t } = useTranslation(alertsI18n);
  const icon = getFilterIcon(filterName);
  const tKey = getFilterTKey(filterName);

  const clearFilter = useClearFilter();
  const { onAlertsFilterClose } = useAlertsFiltersContext();

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        onAlertsFilterClose();
      }
    },
    [onAlertsFilterClose],
  );

  return (
    <FilterPopover.Root onOpenChange={onOpenChange}>
      <FilterItem.Root>
        <FilterItem.Trigger>
          <Icon icon={icon} className="size-5" />
          <span className="text-s font-semibold first-letter:capitalize">
            {t(tKey)}
          </span>
        </FilterItem.Trigger>
        <FilterItem.Clear
          onClick={() => {
            clearFilter(filterName);
          }}
        />
      </FilterItem.Root>
      <FilterPopover.Content>
        <FilterDetail filterName={filterName} />
      </FilterPopover.Content>
    </FilterPopover.Root>
  );
}
