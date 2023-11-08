import { forwardRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { decisionsI18n } from '../decisions-i18n';
import { useDecisionFiltersContext } from './DecisionFiltersContext';
import { FilterDetail } from './FilterDetail';
import {
  type DecisionFilterName,
  getFilterIcon,
  getFilterTKey,
} from './filters';
import { FiltersDropdownMenu } from './FiltersDropdownMenu';

export function DecisionFiltersMenu({
  children,
  filterNames,
}: {
  children: React.ReactNode;
  filterNames: readonly DecisionFilterName[];
}) {
  const { onDecisionFilterClose } = useDecisionFiltersContext();

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onDecisionFilterClose();
      }
    },
    [onDecisionFilterClose]
  );

  return (
    <FiltersDropdownMenu.Root onOpenChange={onOpenChange}>
      <FiltersDropdownMenu.Trigger asChild>
        {children}
      </FiltersDropdownMenu.Trigger>
      <FiltersDropdownMenu.Content>
        <FilterContent filterNames={filterNames} />
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
  const Icon = getFilterIcon(filterName);
  const tKey = getFilterTKey(filterName);

  return (
    <FiltersDropdownMenu.Item {...props} ref={ref}>
      <Icon className="text-l" />
      <span className="text-s text-grey-100 font-normal first-letter:capitalize">
        {t(tKey)}
      </span>
    </FiltersDropdownMenu.Item>
  );
});
FiltersMenuItem.displayName = 'FiltersMenuItem';

function FilterContent({
  filterNames,
}: {
  filterNames: readonly DecisionFilterName[];
}) {
  const [selectedFilter, setSelectedFilter] = useState<DecisionFilterName>();

  if (selectedFilter) {
    return <FilterDetail filterName={selectedFilter} />;
  }

  return filterNames.map((filterName) => (
    <FiltersMenuItem
      key={filterName}
      filterName={filterName}
      onClick={(e) => {
        e.preventDefault();
        setSelectedFilter(filterName);
      }}
    />
  ));
}
