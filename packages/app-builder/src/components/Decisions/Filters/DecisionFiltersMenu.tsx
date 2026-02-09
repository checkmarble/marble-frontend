import { FiltersDropdownMenu } from '@app-builder/components/Filters';
import * as React from 'react';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { decisionsI18n } from '../decisions-i18n';
import { useDecisionFiltersContext } from './DecisionFiltersContext';
import { FilterDetail } from './FilterDetail';
import { type DecisionFilterName, getFilterIcon, getFilterTKey } from './filters';

interface FiltersMenuContextValue {
  closeMenu: () => void;
}

const FiltersMenuContext = React.createContext<FiltersMenuContextValue>({
  closeMenu: () => {
    // Default no-op, will be overridden by Provider
  },
});

export const FiltersMenuContextProvider = FiltersMenuContext.Provider;

export function useFiltersMenuContext() {
  return React.useContext(FiltersMenuContext);
}

export function DecisionFiltersMenu({
  children,
  filterNames,
}: {
  children: React.ReactNode;
  filterNames: readonly DecisionFilterName[];
}) {
  const { onDecisionFilterClose } = useDecisionFiltersContext();
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

  return (
    <FiltersDropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <FiltersDropdownMenu.Trigger asChild>{children}</FiltersDropdownMenu.Trigger>
      <FiltersDropdownMenu.Content>
        <FilterContent filterNames={filterNames} closeMenu={closeMenu} />
      </FiltersDropdownMenu.Content>
    </FiltersDropdownMenu.Root>
  );
}

const FiltersMenuItem = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof FiltersDropdownMenu.Item> & {
    filterName: DecisionFilterName;
  }
>(({ filterName, ...props }, ref) => {
  const { t } = useTranslation(decisionsI18n);
  const icon = getFilterIcon(filterName);
  const tKey = getFilterTKey(filterName);

  return (
    <FiltersDropdownMenu.Item {...props} ref={ref}>
      <Icon icon={icon} className="size-5" />
      <span className="text-s text-grey-primary font-normal first-letter:capitalize">{t(tKey)}</span>
    </FiltersDropdownMenu.Item>
  );
});
FiltersMenuItem.displayName = 'FiltersMenuItem';

function FilterContent({
  filterNames,
  closeMenu,
}: {
  filterNames: readonly DecisionFilterName[];
  closeMenu: () => void;
}) {
  const [selectedFilter, setSelectedFilter] = useState<DecisionFilterName>();
  const contextValue = useMemo(() => ({ closeMenu }), [closeMenu]);

  if (selectedFilter) {
    return (
      <FiltersMenuContext.Provider value={contextValue}>
        <FilterDetail filterName={selectedFilter} />
      </FiltersMenuContext.Provider>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {filterNames.map((filterName) => (
        <FiltersMenuItem
          key={filterName}
          filterName={filterName}
          onClick={(e) => {
            e.preventDefault();
            setSelectedFilter(filterName);
          }}
        />
      ))}
    </div>
  );
}
