import {
  AddNewFilterButton,
  ClearAllFiltersButton,
  FilterItem,
  FilterPopover,
} from '@app-builder/components/Filters';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { casesI18n } from '../../cases-i18n';
import {
  useCaseHistoryFiltersContext,
  useCaseHistoryFiltersPartition,
  useClearAllFilters,
  useClearFilter,
} from './CaseHistoryFiltersContext';
import { CaseHistoryFiltersMenu } from './CaseHistoryFiltersMenu';
import { FilterDetail } from './FilterDetail';
import { getFilterIcon, getFilterTKey } from './filters';

export function CaseHistoryFiltersBar() {
  const { t } = useTranslation(casesI18n);
  const { onCaseHistoryFilterClose } = useCaseHistoryFiltersContext();
  const clearAllFilters = useClearAllFilters();

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onCaseHistoryFilterClose();
      }
    },
    [onCaseHistoryFilterClose],
  );

  const { undefinedCaseHistoryFilterNames, definedCaseHistoryFilterNames } =
    useCaseHistoryFiltersPartition();
  const clearFilter = useClearFilter();

  if (definedCaseHistoryFilterNames.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between gap-2">
      <div className="flex flex-row flex-wrap gap-2">
        {definedCaseHistoryFilterNames.map((filterName) => {
          const icon = getFilterIcon(filterName);
          const tKey = getFilterTKey(filterName);

          return (
            <FilterPopover.Root key={filterName} onOpenChange={onOpenChange}>
              <FilterItem.Root>
                <FilterItem.Trigger>
                  <Icon icon={icon} className="size-5" />
                  <span className="text-s font-semibold first-letter:capitalize">{t(tKey)}</span>
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
        })}
        {undefinedCaseHistoryFilterNames.length > 0 ? (
          <CaseHistoryFiltersMenu filterNames={undefinedCaseHistoryFilterNames}>
            <AddNewFilterButton />
          </CaseHistoryFiltersMenu>
        ) : null}
      </div>
      <ClearAllFiltersButton onClick={clearAllFilters} />
    </div>
  );
}
