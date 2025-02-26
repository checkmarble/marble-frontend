import { FiltersDropdownMenu } from '@app-builder/components/Filters';
import { forwardRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { decisionsI18n } from '../decisions-i18n';
import { useDecisionFiltersContext } from './DecisionFiltersContext';
import { FilterDetail } from './FilterDetail';
import { type DecisionFilterName, getFilterIcon, getFilterTKey } from './filters';

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
    [onDecisionFilterClose],
  );

  return (
    <FiltersDropdownMenu.Root onOpenChange={onOpenChange}>
      <FiltersDropdownMenu.Trigger asChild>{children}</FiltersDropdownMenu.Trigger>
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
  const icon = getFilterIcon(filterName);
  const tKey = getFilterTKey(filterName);

  return (
    <FiltersDropdownMenu.Item {...props} ref={ref}>
      <Icon icon={icon} className="size-5" />
      <span className="text-s text-grey-00 font-normal first-letter:capitalize">{t(tKey)}</span>
    </FiltersDropdownMenu.Item>
  );
});
FiltersMenuItem.displayName = 'FiltersMenuItem';

function FilterContent({ filterNames }: { filterNames: readonly DecisionFilterName[] }) {
  const [selectedFilter, setSelectedFilter] = useState<DecisionFilterName>();

  if (selectedFilter) {
    return <FilterDetail filterName={selectedFilter} />;
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
