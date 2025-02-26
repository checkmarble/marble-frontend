import {
  AddNewFilterButton,
  ClearAllFiltersButton,
  FilterItem,
  FilterPopover,
} from '@app-builder/components/Filters';
import { useCallback } from 'react';
import { Separator } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { FilterDetail } from './FilterDetail/FilterDetail';
import { getFilterIcon, type RulesFilterName, useFilterLabel } from './filters';
import {
  useClearAllFilters,
  useClearFilter,
  useRulesFiltersContext,
  useRulesFiltersPartition,
} from './RulesFiltersContext';
import { RulesFiltersMenu } from './RulesFiltersMenu';

export function RulesFiltersBar() {
  const { undefinedRulesFilterNames, definedRulesFilterNames } = useRulesFiltersPartition();
  const clearAllFilters = useClearAllFilters();

  if (definedRulesFilterNames.length === 0) {
    return null;
  }

  return (
    <>
      <Separator className="bg-grey-90" decorative />
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row flex-wrap gap-2">
          {definedRulesFilterNames.map((filterName) => (
            <FiltersBarItem key={filterName} filterName={filterName} />
          ))}
          {undefinedRulesFilterNames.length > 0 ? (
            <RulesFiltersMenu filterNames={undefinedRulesFilterNames}>
              <AddNewFilterButton />
            </RulesFiltersMenu>
          ) : null}
        </div>
        <ClearAllFiltersButton onClick={clearAllFilters} />
      </div>
    </>
  );
}

function FiltersBarItem({ filterName }: { filterName: RulesFilterName }) {
  const icon = getFilterIcon(filterName);
  const label = useFilterLabel(filterName);

  const clearFilter = useClearFilter();
  const { onRulesFilterClose } = useRulesFiltersContext();

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onRulesFilterClose();
      }
    },
    [onRulesFilterClose],
  );

  return (
    <FilterPopover.Root onOpenChange={onOpenChange}>
      <FilterItem.Root>
        <FilterItem.Trigger>
          <Icon icon={icon} className="size-5" />
          <span className="text-s font-semibold first-letter:capitalize">{label}</span>
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
