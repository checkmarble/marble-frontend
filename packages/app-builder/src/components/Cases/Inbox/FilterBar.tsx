import { DateRangeFilter } from '@app-builder/components/Filters';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { QueryEntry } from '@app-builder/hooks/useBase64Query';
import { InboxWithCasesCount } from '@app-builder/models/inbox';
import type { Filters, filtersSchema } from '@app-builder/queries/cases/get-cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { formatDateTimeWithoutPresets } from '@app-builder/utils/format';
import { StaticDateRangeFilterType } from 'packages/ui-design-system/src/FiltersBar/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match, P } from 'ts-pattern';
import { Avatar, ButtonV2, MenuCommand, Separator } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type InboxFilterBarProps = {
  inboxId: string;
  inboxes: InboxWithCasesCount[];
  allowedFilters: readonly (keyof Filters)[];
  filters: QueryEntry<typeof filtersSchema>[];
  updateFilters: (filters: Partial<Filters>) => void;
  onInboxSelect: (inboxId: string) => void;
};
export type PartialInbox = Pick<InboxWithCasesCount, 'id' | 'name'> & { casesCount?: number };

export function InboxFilterBar({
  inboxId,
  inboxes,
  filters,
  allowedFilters,
  updateFilters,
  onInboxSelect,
}: InboxFilterBarProps) {
  const { t } = useTranslation(['cases']);
  const allInboxes: PartialInbox[] = [
    { id: MY_INBOX_ID, name: t('cases:inbox.my-inbox.link') },
    ...inboxes,
  ];
  const selectedInbox = allInboxes.find((inbox) => inbox.id === inboxId) ?? allInboxes[0]!;

  return (
    <div className="flex items-center gap-v2-sm">
      <InboxSelector
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
}

function InboxSelector({
  inboxes,
  selectedInbox,
  onSelectInbox,
}: {
  inboxes: PartialInbox[];
  selectedInbox: PartialInbox;
  onSelectInbox: (inbox: PartialInbox) => void;
}) {
  const { t } = useTranslation(['cases']);
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <ButtonV2 variant="primary" size="default">
          <span>
            {t('cases:case.inbox')}: {selectedInbox.name}
          </span>
          {selectedInbox.casesCount !== undefined ? (
            <div className="px-v2-xs py-v2-xxs rounded-full bg-white border border-grey-border text-purple-65 text-small">
              {selectedInbox.casesCount} cases
            </div>
          ) : null}
          <Icon icon="caret-down" className="size-4" />
        </ButtonV2>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" sideOffset={4} sameWidth>
        <MenuCommand.List>
          {inboxes.map((inbox) => (
            <MenuCommand.Item
              key={inbox.id}
              value={`${inbox.id} ${inbox.name}`}
              onSelect={() => onSelectInbox(inbox)}
            >
              <div className="grid grid-cols-[20px_1fr] items-center gap-v2-xs">
                {inbox.id === selectedInbox.id ? (
                  <Icon icon="tick" className="size-4 text-purple-65" />
                ) : null}
                <span className="col-start-2">{inbox.name}</span>
              </div>
              {inbox.casesCount !== undefined ? (
                <span className="text-small text-grey-50">{inbox.casesCount} cases</span>
              ) : null}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

type InboxFiltersProps = {
  allowedFilters: readonly (keyof Filters)[];
  filters: QueryEntry<typeof filtersSchema>[];
  updateFilters: (filters: Partial<Filters>) => void;
};

function InboxFilters({ allowedFilters, filters, updateFilters }: InboxFiltersProps) {
  const { t } = useTranslation(['filters']);
  const [open, setOpen] = useState(false);

  return (
    <>
      {filters.map((filter) => {
        const [filterName] = filter;
        const handleClear = () => updateFilters({ [filterName]: undefined });

        return <ActivatedFilterItem key={filterName} filter={filter} onClear={handleClear} />;
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
}

type FilterItemProps = {
  filter: QueryEntry<typeof filtersSchema>;
  onClear: () => void;
};

function ActivatedFilterItem({ filter, onClear }: FilterItemProps) {
  return (
    <span className="h-10 bg-purple-98 border border-purple-96 rounded-v2-md p-v2-sm text-default flex items-center gap-v2-xs">
      <span>
        <DisplayFilterValue filter={filter} />
      </span>
      <button type="button" onClick={onClear} className="cursor-pointer">
        <Icon icon="cross" className="size-4" />
      </button>
    </span>
  );
}

const FilterLabel = ({ name }: { name: keyof Filters }) => {
  const { t } = useTranslation(['cases']);

  return match(name)
    .with('name', () => t('cases:case.name'))
    .with('statuses', () => t('cases:filter.closed_only.label'))
    .with('includeSnoozed', () => t('cases:filter.include_snoozed.label'))
    .with('excludeAssigned', () => t('cases:filter.exclude_assigned.label'))
    .with('assignee', () => t('cases:filter.assignee.label'))
    .with('dateRange', () => t('cases:case.date'))
    .exhaustive();
};

function DisplayFilterValue({ filter }: { filter: QueryEntry<typeof filtersSchema> }) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['filters', 'cases']);

  return match(filter)
    .with(['name', P.string], ([name, value]) => (
      <span>
        <FilterLabel name={name} />: {value}
      </span>
    ))
    .with(['statuses', P.array(P.string)], ([name, value]) => (
      <span>
        <FilterLabel name={name} />: {value.join(', ')}
      </span>
    ))
    .with(['includeSnoozed', P.boolean], ([name]) => (
      <span>
        <FilterLabel name={name} />
      </span>
    ))
    .with(['excludeAssigned', P.boolean], ([name]) => (
      <span>
        <FilterLabel name={name} />
      </span>
    ))
    .with(['assignee', P.string], ([name, value]) => (
      <span>
        <FilterLabel name={name} />: {value}
      </span>
    ))
    .with(['dateRange', P.shape({ startDate: P.string, endDate: P.string })], ([name, value]) => {
      const startDate = formatDateTimeWithoutPresets(value.startDate, { language });
      const endDate = formatDateTimeWithoutPresets(value.endDate, { language });
      const dateDisplay =
        startDate === endDate
          ? startDate
          : t('filters:date_range.range_value', { startDate, endDate });

      return (
        <span>
          <FilterLabel name={name} />: {dateDisplay}
        </span>
      );
    })
    .exhaustive();
}

type DisplayFilterMenuItemProps = {
  filterName: keyof Filters;
  onSelect: (filters: Partial<Filters>) => void;
};
function DisplayFilterMenuItem({ filterName, onSelect }: DisplayFilterMenuItemProps) {
  const { orgUsers } = useOrganizationUsers();

  return match(filterName)
    .with('name', () => null)
    .with('statuses', () => (
      <MenuCommand.Item value={filterName} onSelect={() => onSelect({ [filterName]: ['closed'] })}>
        <FilterLabel name={filterName} />
      </MenuCommand.Item>
    ))
    .with('includeSnoozed', () => (
      <MenuCommand.Item value={filterName} onSelect={() => onSelect({ [filterName]: true })}>
        <FilterLabel name={filterName} />
      </MenuCommand.Item>
    ))
    .with('excludeAssigned', () => (
      <MenuCommand.Item value={filterName} onSelect={() => onSelect({ [filterName]: true })}>
        <FilterLabel name={filterName} />
      </MenuCommand.Item>
    ))
    .with('assignee', () => (
      <MenuCommand.SubMenu
        withCombobox
        arrow={false}
        hover={false}
        trigger={
          <span>
            <FilterLabel name={filterName} />
          </span>
        }
      >
        <MenuCommand.List>
          {orgUsers.map((user) => (
            <MenuCommand.Item
              key={user.userId}
              value={`${user.userId} ${user.firstName} ${user.lastName}`}
              onSelect={() => onSelect({ [filterName]: user.userId })}
            >
              <div className="flex items-center gap-v2-xs">
                <Avatar size="xs" firstName={user.firstName} lastName={user.lastName} />
                <span>{`${R.capitalize(user.firstName)} ${R.capitalize(user.lastName)}`}</span>
              </div>
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.SubMenu>
    ))
    .with('dateRange', () => (
      <MenuCommand.SubMenu
        arrow={false}
        hover={false}
        trigger={
          <span>
            <FilterLabel name={filterName} />
          </span>
        }
        className="max-h-[600px]"
      >
        <DateRangeFilterMenu onSelect={(value) => onSelect({ [filterName]: value })} />
      </MenuCommand.SubMenu>
    ))
    .exhaustive();
}

function DateRangeFilterMenu({
  onSelect,
}: {
  onSelect: (value: StaticDateRangeFilterType) => void;
}) {
  const { t } = useTranslation(['common', 'cases']);
  const [value, setValue] = useState<StaticDateRangeFilterType | null>(null);

  return (
    <>
      <MenuCommand.List>
        <DateRangeFilter.Root
          dateRangeFilter={value}
          setDateRangeFilter={(dr) => {
            if (dr?.type === 'static') {
              setValue(dr);
            }
          }}
          className="grid"
        >
          <DateRangeFilter.FromNowPicker title={t('cases:filters.date_range.title')} />
          <Separator className="bg-grey-90" decorative orientation="vertical" />
          <DateRangeFilter.Calendar />
          <Separator className="bg-grey-90 col-span-3" decorative orientation="horizontal" />
          <DateRangeFilter.Summary className="col-span-3 row-span-1" />
        </DateRangeFilter.Root>
      </MenuCommand.List>
      <div className="border-grey-90 flex gap-2 overflow-x-auto border-t p-2 justify-center">
        <MenuCommand.HeadlessItem
          onSelect={() => {
            if (value) {
              onSelect(value);
            }
          }}
        >
          <ButtonV2 disabled={!value} size="default">
            {t('common:save')}
          </ButtonV2>
        </MenuCommand.HeadlessItem>
      </div>
    </>
  );
}
