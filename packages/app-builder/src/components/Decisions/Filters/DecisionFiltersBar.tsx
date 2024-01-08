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

import { decisionsI18n } from '../decisions-i18n';
import {
  useClearFilter,
  useDecisionFiltersContext,
  useDecisionFiltersPartition,
} from './DecisionFiltersContext';
import { DecisionFiltersMenu } from './DecisionFiltersMenu';
import { FilterDetail } from './FilterDetail';
import { getFilterIcon, getFilterTKey } from './filters';

export function DecisionFiltersBar() {
  const { t } = useTranslation(decisionsI18n);
  const { onDecisionFilterClose } = useDecisionFiltersContext();

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onDecisionFilterClose();
      }
    },
    [onDecisionFilterClose],
  );

  const { undefinedDecisionFilterNames, definedDecisionFilterNames } =
    useDecisionFiltersPartition();
  const clearFilter = useClearFilter();

  if (definedDecisionFilterNames.length === 0) {
    return null;
  }

  return (
    <>
      <Separator className="bg-grey-10" decorative />
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row flex-wrap gap-2">
          {definedDecisionFilterNames.map((filterName) => {
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
          <DecisionFiltersMenu filterNames={undefinedDecisionFilterNames}>
            <AddNewFilterButton />
          </DecisionFiltersMenu>
        </div>
        <ClearAllFiltersLink to={getRoute('/decisions/')} replace />
      </div>
    </>
  );
}
