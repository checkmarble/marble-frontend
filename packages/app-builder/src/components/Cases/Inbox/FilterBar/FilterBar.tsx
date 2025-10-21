import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { QueryEntry } from '@app-builder/hooks/useBase64Query';
import { InboxWithCasesCount } from '@app-builder/models/inbox';
import type { Filters, filtersSchema } from '@app-builder/queries/cases/get-cases';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ActivatedFilterItem } from './ActivatedFilterItem';
import { DisplayFilterMenuItem } from './DisplayFilterMenuItem';
import { FilterInboxSelector } from './FilterInboxSelector';
import { PartialInbox } from './types';

export type InboxFilterBarProps = {
  inboxId: string;
  inboxes: InboxWithCasesCount[];
  allowedFilters: readonly (keyof Filters)[];
  filters: QueryEntry<typeof filtersSchema>[];
  updateFilters: (filters: Partial<Filters>) => void;
  onInboxSelect: (inboxId: string) => void;
};

export const InboxFilterBar = ({
  inboxId,
  inboxes,
  filters,
  allowedFilters,
  updateFilters,
  onInboxSelect,
}: InboxFilterBarProps) => {
  const { t } = useTranslation(['cases']);
  const allInboxes: PartialInbox[] = [
    { id: MY_INBOX_ID, name: t('cases:inbox.my-inbox.link') },
    ...inboxes,
  ];
  const selectedInbox = allInboxes.find((inbox) => inbox.id === inboxId) ?? allInboxes[0]!;

  return (
    <div className="flex items-center gap-v2-sm">
      <FilterInboxSelector
        inboxes={allInboxes}
        selectedInbox={selectedInbox}
        onSelectInbox={(inbox) => {
          onInboxSelect(inbox.id);
        }}
      />
      <InboxFilters
        allowedFilters={allowedFilters}
        filters={filters}
        updateFilters={updateFilters}
      />
    </div>
  );
};

type InboxFiltersProps = {
  allowedFilters: readonly (keyof Filters)[];
  filters: QueryEntry<typeof filtersSchema>[];
  updateFilters: (filters: Partial<Filters>) => void;
};

const InboxFilters = ({ allowedFilters, filters, updateFilters }: InboxFiltersProps) => {
  const { t } = useTranslation(['filters']);
  const [open, setOpen] = useState(false);

  return (
    <>
      {filters.map((filter) => {
        const [filterName] = filter;
        const handleClear = () => updateFilters({ [filterName]: undefined });

        return (
          <ActivatedFilterItem
            onUpdate={updateFilters}
            onClear={handleClear}
            key={filterName}
            filter={filter}
          />
        );
      })}

      <MenuCommand.Menu open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <ButtonV2 variant="secondary" size="default">
            <Icon icon="plus" className="size-4" />
            <span>{t('filters:ds.addNewFilter.label')}</span>
          </ButtonV2>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth align="start" sideOffset={4}>
          <MenuCommand.List>
            {allowedFilters.map((filter) => (
              <DisplayFilterMenuItem
                key={filter}
                filterName={filter}
                onSelect={(filters) => {
                  updateFilters(filters);
                  setOpen(false);
                }}
              />
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </>
  );
};
