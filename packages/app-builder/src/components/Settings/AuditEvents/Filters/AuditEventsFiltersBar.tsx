import { type ApiKey } from '@app-builder/models/api-keys';
import type { AuditEventsFilterName, AuditEventsFilters } from '@app-builder/queries/audit-events/get-audit-events';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ActivatedAuditFilterItem, type FilterEntry } from './ActivatedAuditFilterItem';
import { DisplayAuditFilterMenuItem } from './DisplayAuditFilterMenuItem';

export type AuditEventsFiltersBarProps = {
  filters: FilterEntry[];
  availableFilters: AuditEventsFilterName[];
  updateFilters: (filters: Partial<AuditEventsFilters>) => void;
  apiKeys: ApiKey[];
};

export const AuditEventsFiltersBar = ({
  filters,
  availableFilters,
  updateFilters,
  apiKeys,
}: AuditEventsFiltersBarProps) => {
  const { t } = useTranslation(['filters']);
  const [open, setOpen] = useState(false);

  // Filter out already active filters from available filters
  const activeFilterNames = filters.map(([name]) => name);
  const remainingFilters = availableFilters.filter((name) => !activeFilterNames.includes(name));

  return (
    <div className="flex flex-row flex-wrap items-center gap-2">
      {filters.map((filter) => {
        const [filterName] = filter;
        const handleClear = () => updateFilters({ [filterName]: undefined });

        return (
          <ActivatedAuditFilterItem
            key={filterName}
            filter={filter}
            onUpdate={updateFilters}
            onClear={handleClear}
            apiKeys={apiKeys}
          />
        );
      })}

      {remainingFilters.length > 0 && (
        <MenuCommand.Menu open={open} onOpenChange={setOpen}>
          <MenuCommand.Trigger>
            <ButtonV2 variant="secondary" size="default">
              <Icon icon="plus" className="size-4" />
              <span>{t('filters:ds.addNewFilter.label')}</span>
            </ButtonV2>
          </MenuCommand.Trigger>
          <MenuCommand.Content sameWidth align="start" sideOffset={4}>
            <MenuCommand.List>
              {remainingFilters.map((filterName) => (
                <DisplayAuditFilterMenuItem
                  key={filterName}
                  filterName={filterName}
                  onSelect={(filterValue) => {
                    updateFilters(filterValue);
                    setOpen(false);
                  }}
                  apiKeys={apiKeys}
                />
              ))}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      )}
    </div>
  );
};
