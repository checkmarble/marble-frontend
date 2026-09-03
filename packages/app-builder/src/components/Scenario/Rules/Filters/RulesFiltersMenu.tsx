import { FiltersDropdownMenu } from '@app-builder/components/Filters';
import { useCallback, useState } from 'react';
import { Icon } from 'ui-icons';

import { FilterDetail } from './FilterDetail/FilterDetail';
import { getFilterIcon, type RulesFilterName, useFilterLabel } from './filters';
import { useRulesFiltersContext } from './RulesFiltersContext';

export function RulesFiltersMenu({
  children,
  filterNames,
}: {
  children: React.ReactNode;
  filterNames: readonly RulesFilterName[];
}) {
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
    <FiltersDropdownMenu.Root onOpenChange={onOpenChange}>
      <FiltersDropdownMenu.Trigger asChild>{children}</FiltersDropdownMenu.Trigger>
      <FiltersDropdownMenu.Content>
        <FilterContent filterNames={filterNames} />
      </FiltersDropdownMenu.Content>
    </FiltersDropdownMenu.Root>
  );
}

const FiltersMenuItem = ({
  ref,
  filterName,
  ...props
}: React.ComponentProps<typeof FiltersDropdownMenu.Item> & {
  filterName: RulesFilterName;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const icon = getFilterIcon(filterName);
  const label = useFilterLabel(filterName);

  return (
    <FiltersDropdownMenu.Item {...props} ref={ref}>
      <Icon icon={icon} className="size-5" />
      <span className="text-s text-grey-primary font-normal first-letter:capitalize">{label}</span>
    </FiltersDropdownMenu.Item>
  );
};

function FilterContent({ filterNames }: { filterNames: readonly RulesFilterName[] }) {
  const [selectedFilter, setSelectedFilter] = useState<RulesFilterName>();

  if (selectedFilter) {
    return <FilterDetail filterName={selectedFilter} />;
  }

  return (
    <div className="flex flex-col gap-xs p-sm">
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
