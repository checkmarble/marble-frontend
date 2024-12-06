import {
  AddNewFilterButton,
  ClearAllFiltersButton,
  FilterItem,
  FilterPopover,
} from '@app-builder/components/Filters';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from 'ui-design-system';
import { Icon } from 'ui-icons';

import {
  useTestRunsFiltersContext,
  useTestRunsFiltersPartition,
  useClearFilter,
  useClearAllFilters,
} from './TestRunsFiltersContext';
import { TestRunsFiltersMenu } from './TestRunsFiltersMenu';
import { FilterDetail } from './FilterDetail';
import { getFilterIcon, getFilterTKey } from './filters';

export function TestRunsFiltersBar() {
  const { t } = useTranslation(['scenarios', 'common']);
  const { onTestRunsFilterClose } = useTestRunsFiltersContext();

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onTestRunsFilterClose();
      }
    },
    [onTestRunsFilterClose],
  );

  const { undefinedTestRunsFilterNames, definedTestRunsFilterNames } =
    useTestRunsFiltersPartition();

  const clearFilter = useClearFilter();
  const clearAllFilters = useClearAllFilters();

  if (definedTestRunsFilterNames.length === 0) {
    return null;
  }

  return (
    <>
      <Separator className="bg-grey-10" decorative />
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row flex-wrap gap-2">
          {definedTestRunsFilterNames.map((filterName) => {
            const icon = getFilterIcon(filterName);
            const tKey = getFilterTKey(filterName);

            return (
              <FilterPopover.Root key={filterName} onOpenChange={onOpenChange}>
                <FilterItem.Root>
                  <FilterItem.Trigger>
                    <Icon icon={icon} className="size-5" />
                    <span className="text-s font-semibold first-letter:capitalize">
                      <span>{t(tKey)}</span>
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
          })}
          {undefinedTestRunsFilterNames.length > 0 ? (
            <TestRunsFiltersMenu filterNames={undefinedTestRunsFilterNames}>
              <AddNewFilterButton />
            </TestRunsFiltersMenu>
          ) : null}
        </div>
        <ClearAllFiltersButton onClick={clearAllFilters} />
      </div>
    </>
  );
}
