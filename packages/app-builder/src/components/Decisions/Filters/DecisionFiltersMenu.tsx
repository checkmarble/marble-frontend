import { forwardRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { decisionsI18n } from '../decisions-i18n';
import { type DecisionFilter, getFilterIcon, getFilterTKey } from './filters';
import { FiltersDropdownMenu } from './FiltersDropdownMenu';
import { OutcomeFilter } from './OutcomeFilter';

export function DecisionFiltersMenu({
  children,
  filters,
}: {
  children: React.ReactNode;
  filters: readonly DecisionFilter[];
}) {
  const [selectedFilter, setSelectedFilter] = useState<DecisionFilter>();
  const onOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedFilter(undefined);
  }, []);

  return (
    <FiltersDropdownMenu.Root onOpenChange={onOpenChange}>
      <FiltersDropdownMenu.Trigger asChild>
        {children}
      </FiltersDropdownMenu.Trigger>
      <FiltersDropdownMenu.Content>
        <FilterContent
          selectedFilter={selectedFilter}
          filters={filters}
          setSelectedFilter={setSelectedFilter}
        />
      </FiltersDropdownMenu.Content>
    </FiltersDropdownMenu.Root>
  );
}

const FiltersMenuItem = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof FiltersDropdownMenu.Item> & {
    filter: DecisionFilter;
  }
>(({ filter, ...props }, ref) => {
  const { t } = useTranslation(decisionsI18n);
  const Icon = getFilterIcon(filter);
  const tKey = getFilterTKey(filter);

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
  selectedFilter,
  filters,
  setSelectedFilter,
}: {
  selectedFilter?: DecisionFilter;
  filters: readonly DecisionFilter[];
  setSelectedFilter: (filter: DecisionFilter) => void;
}) {
  switch (selectedFilter) {
    case 'dateRange':
      return 'dateRange';
    case 'scenarioId':
      return 'scenarioId';
    case 'outcome':
      return <OutcomeFilter />;
    case 'triggerObject':
      return 'triggerObject';
    default:
      return filters.map((filter) => (
        <FiltersMenuItem
          key={filter}
          filter={filter}
          onClick={(e) => {
            e.preventDefault();
            setSelectedFilter(filter);
          }}
        />
      ));
  }
}
