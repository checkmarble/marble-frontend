import {
  AddNewFilterButton,
  ClearAllFiltersLink,
  FilterItem,
  FilterPopover,
} from '@app-builder/components/Filters';
import { getRoute } from '@app-builder/utils/routes';
import { useCallback } from 'react';
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
import { getFilterIcon, getFilterTKey } from './filters';

export function CasesFiltersBar() {
  const { t } = useTranslation(casesI18n);
  const { onCasesFilterClose } = useCasesFiltersContext();

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onCasesFilterClose();
      }
    },
    [onCasesFilterClose],
  );

  const { undefinedCasesFilterNames, definedCasesFilterNames } =
    useCasesFiltersPartition();
  const clearFilter = useClearFilter();

  if (definedCasesFilterNames.length === 0) {
    return null;
  }

  return (
    <>
      <Separator className="bg-grey-90" decorative />
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row flex-wrap gap-2">
          {definedCasesFilterNames.map((filterName) => {
            const icon = getFilterIcon(filterName);
            const tKey = getFilterTKey(filterName);

            return (
              <FilterPopover.Root key={filterName} onOpenChange={onOpenChange}>
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
          })}
          {undefinedCasesFilterNames.length > 0 ? (
            <CasesFiltersMenu filterNames={undefinedCasesFilterNames}>
              <AddNewFilterButton />
            </CasesFiltersMenu>
          ) : null}
        </div>
        <ClearAllFiltersLink to={getRoute('/cases')} replace />
      </div>
    </>
  );
}
