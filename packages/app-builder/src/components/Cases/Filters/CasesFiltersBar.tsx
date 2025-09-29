import {
  AddNewFilterButton,
  ClearAllFiltersLink,
  FilterItem,
  FilterPopover,
  FiltersButton,
} from '@app-builder/components/Filters';
import { SimpleFilter } from '@app-builder/components/Filters/SimpleFilter';
import { useLocation } from '@remix-run/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { casesI18n } from '../cases-i18n';
import {
  useCasesFiltersContext,
  useCasesFiltersPartition,
  useClearFilter,
} from './CasesFiltersContext';
import { CasesFiltersMenu } from './CasesFiltersMenu';
import { FilterDetail } from './FilterDetail';
import { casesSimpleFilterNames, getFilterIcon, getFilterTKey } from './filters';

export function CasesFiltersBar({ excludedFilters }: { excludedFilters?: readonly string[] }) {
  const { t } = useTranslation(casesI18n);
  const { onCasesFilterClose } = useCasesFiltersContext();
  const [open, setOpen] = useState(false);
  const onOpenChange = useCallback(
    (state: boolean) => {
      setOpen(state);
      if (!state) {
        onCasesFilterClose();
      }
    },
    [onCasesFilterClose],
  );

  const { undefinedCasesFilterNames, definedCasesFilterNames } =
    useCasesFiltersPartition(excludedFilters);
  const clearFilter = useClearFilter();

  const { pathname } = useLocation();
  return (
    <>
      <Separator className="bg-grey-90" decorative />
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row flex-wrap gap-2">
          {undefinedCasesFilterNames.length > 0 && !definedCasesFilterNames.length ? (
            <CasesFiltersMenu filterNames={undefinedCasesFilterNames}>
              <FiltersButton />
            </CasesFiltersMenu>
          ) : null}
          {definedCasesFilterNames.map((filterName) => {
            const icon = getFilterIcon(filterName);
            const tKey = getFilterTKey(filterName);

            return casesSimpleFilterNames.includes(
              filterName as (typeof casesSimpleFilterNames)[number],
            ) ? (
              <SimpleFilter key={filterName}>
                <Icon icon={icon} className="size-5" />
                <span className="text-s font-semibold first-letter:capitalize">{t(tKey)}</span>
                <FilterItem.Clear
                  onClick={() => {
                    clearFilter(filterName);
                  }}
                />
              </SimpleFilter>
            ) : (
              <FilterPopover.Root key={filterName} onOpenChange={onOpenChange} open={open}>
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
                  <FilterDetail filterName={filterName} close={() => setOpen(false)} />
                </FilterPopover.Content>
              </FilterPopover.Root>
            );
          })}

          {definedCasesFilterNames.length > 0 && undefinedCasesFilterNames.length > 0 ? (
            <CasesFiltersMenu filterNames={undefinedCasesFilterNames}>
              <AddNewFilterButton />
            </CasesFiltersMenu>
          ) : null}
        </div>
        <ClearAllFiltersLink to={pathname} replace />
      </div>
    </>
  );
}
