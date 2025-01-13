import { FiltersDropdownMenu } from '@app-builder/components/Filters';
import { forwardRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { alertsI18n } from '../alerts-i18n';
import { useAlertsFiltersContext } from './AlertsFiltersContext';
import { FilterDetail } from './FilterDetail';
import { type AlertsFilterName, getFilterIcon, getFilterTKey } from './filters';

export function AlertsFiltersMenu({
  children,
  filterNames,
}: {
  children: React.ReactNode;
  filterNames: readonly AlertsFilterName[];
}) {
  const { onAlertsFilterClose } = useAlertsFiltersContext();

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onAlertsFilterClose();
      }
    },
    [onAlertsFilterClose],
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
    filterName: AlertsFilterName;
  }
>(({ filterName, ...props }, ref) => {
  const { t } = useTranslation(alertsI18n);
  const icon = getFilterIcon(filterName);
  const tKey = getFilterTKey(filterName);

  return (
    <FiltersDropdownMenu.Item {...props} ref={ref}>
      <Icon icon={icon} className="size-5" />
      <span className="text-s text-grey-00 font-normal first-letter:capitalize">
        {t(tKey)}
      </span>
    </FiltersDropdownMenu.Item>
  );
});
FiltersMenuItem.displayName = 'FiltersMenuItem';

function FilterContent({
  filterNames,
}: {
  filterNames: readonly AlertsFilterName[];
}) {
  const [selectedFilter, setSelectedFilter] = useState<AlertsFilterName>();

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
