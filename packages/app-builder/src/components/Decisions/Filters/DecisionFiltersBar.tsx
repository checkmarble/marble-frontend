import { AddNewFilterButton, ClearAllFiltersLink, FilterItem, FilterPopover } from '@app-builder/components/Filters';
import { getRoute } from '@app-builder/utils/routes';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { decisionsI18n } from '../decisions-i18n';
import { useClearFilter, useDecisionFiltersContext, useDecisionFiltersPartition } from './DecisionFiltersContext';
import { DecisionFiltersMenu, FiltersMenuContextProvider } from './DecisionFiltersMenu';
import { FilterDetail } from './FilterDetail';
import { type DecisionFilterName, getFilterIcon, getFilterTKey } from './filters';

function FilterPopoverWithContext({
  filterName,
  onDecisionFilterClose,
  clearFilter,
}: {
  filterName: DecisionFilterName;
  onDecisionFilterClose: () => void;
  clearFilter: (filterName: DecisionFilterName) => void;
}) {
  const { t } = useTranslation(decisionsI18n);
  const [open, setOpen] = useState(false);

  const onOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        onDecisionFilterClose();
      }
    },
    [onDecisionFilterClose],
  );

  const closeMenu = useCallback(() => {
    setOpen(false);
    onDecisionFilterClose();
  }, [onDecisionFilterClose]);

  const contextValue = useMemo(() => ({ closeMenu }), [closeMenu]);

  const icon = getFilterIcon(filterName);
  const tKey = getFilterTKey(filterName);

  return (
    <FilterPopover.Root open={open} onOpenChange={onOpenChange}>
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
        <FiltersMenuContextProvider value={contextValue}>
          <FilterDetail filterName={filterName} />
        </FiltersMenuContextProvider>
      </FilterPopover.Content>
    </FilterPopover.Root>
  );
}

export function DecisionFiltersBar() {
  const { onDecisionFilterClose } = useDecisionFiltersContext();
  const { undefinedDecisionFilterNames, definedDecisionFilterNames } = useDecisionFiltersPartition();
  const clearFilter = useClearFilter();

  if (definedDecisionFilterNames.length === 0) {
    return null;
  }

  return (
    <>
      <Separator className="bg-grey-border" decorative />
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row flex-wrap gap-2">
          {definedDecisionFilterNames.map((filterName) => (
            <FilterPopoverWithContext
              key={filterName}
              filterName={filterName}
              onDecisionFilterClose={onDecisionFilterClose}
              clearFilter={clearFilter}
            />
          ))}
          {undefinedDecisionFilterNames.length > 0 ? (
            <DecisionFiltersMenu filterNames={undefinedDecisionFilterNames}>
              <AddNewFilterButton />
            </DecisionFiltersMenu>
          ) : null}
        </div>
        <ClearAllFiltersLink to={getRoute('/detection/decisions')} replace />
      </div>
    </>
  );
}
