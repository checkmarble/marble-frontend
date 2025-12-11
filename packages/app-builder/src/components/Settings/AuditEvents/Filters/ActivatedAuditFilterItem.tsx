import { DateRangeFilter } from '@app-builder/components/Filters';
import type { AuditEventsFilterName, AuditEventsFilters } from '@app-builder/queries/audit-events/get-audit-events';
import { formatDateTimeWithoutPresets, formatDuration } from '@app-builder/utils/format';
import { useCallbackRef } from '@marble/shared';
import { differenceInDays } from 'date-fns';
import { DateRangeFilterType } from 'packages/ui-design-system/src/FiltersBar/types';
import { type MouseEvent, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, MenuCommand, Separator } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { AuditEventsFilterLabel } from './AuditEventsFilterLabel';

export type FilterEntry =
  | ['dateRange', NonNullable<AuditEventsFilters['dateRange']>]
  | ['table', string]
  | ['entityId', string];

const EDITABLE_FILTERS: readonly AuditEventsFilterName[] = ['dateRange'];

type ActivatedAuditFilterItemProps = {
  filter: FilterEntry;
  onUpdate: (filters: Partial<AuditEventsFilters>) => void;
  onClear: () => void;
};

export const ActivatedAuditFilterItem = ({ filter, onUpdate, onClear }: ActivatedAuditFilterItemProps) => {
  const [open, setOpen] = useState(false);
  const isEditable = EDITABLE_FILTERS.includes(filter[0]);
  const handleClearClick = useCallbackRef((e: MouseEvent) => {
    e.stopPropagation();
    onClear();
  });

  const button = (
    <span className="flex h-10 items-center gap-v2-xs rounded-v2-md border border-purple-96 bg-purple-98 p-v2-sm text-default">
      <span>
        <DisplayFilterValue filter={filter} />
      </span>
      <button type="button" onClick={handleClearClick} className="cursor-pointer">
        <Icon icon="cross" className="size-4" />
      </button>
    </span>
  );

  if (isEditable) {
    return (
      <MenuCommand.Menu open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>{button}</MenuCommand.Trigger>
        <MenuCommand.Content sameWidth align="start" sideOffset={4} className="max-h-[600px]">
          <MenuCommand.List>
            <EditFilterContent filter={filter} onUpdate={onUpdate} onClose={() => setOpen(false)} />
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    );
  }

  return (
    <span className="flex h-10 items-center gap-v2-xs rounded-v2-md border border-purple-96 bg-purple-98 p-v2-sm text-default">
      <span>
        <DisplayFilterValue filter={filter} />
      </span>
      <button type="button" onClick={onClear} className="cursor-pointer">
        <Icon icon="cross" className="size-4" />
      </button>
    </span>
  );
};

type DisplayFilterValueProps = { filter: FilterEntry };

const DisplayFilterValue = ({ filter }: DisplayFilterValueProps): ReactNode => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['filters', 'settings']);

  const [filterName, filterValue] = filter;

  switch (filterName) {
    case 'dateRange': {
      if (filterValue.type === 'static') {
        const startDate = formatDateTimeWithoutPresets(filterValue.startDate, { language });
        const endDate = formatDateTimeWithoutPresets(filterValue.endDate, { language });
        const diff = differenceInDays(new Date(filterValue.endDate), new Date(filterValue.startDate));
        const dateDisplay = diff <= 1 ? startDate : t('filters:date_range.range_value', { startDate, endDate });

        return (
          <span>
            <AuditEventsFilterLabel name={filterName} />: {dateDisplay}
          </span>
        );
      } else {
        const duration = formatDuration(filterValue.fromNow, language);
        const dateDisplay = t('filters:date_range.duration', { duration });

        return (
          <span>
            <AuditEventsFilterLabel name={filterName} />: {dateDisplay}
          </span>
        );
      }
    }
    case 'table':
      return (
        <span>
          <AuditEventsFilterLabel name={filterName} />: {filterValue}
        </span>
      );
    case 'entityId':
      return (
        <span>
          <AuditEventsFilterLabel name={filterName} />: {filterValue}
        </span>
      );
  }
};

type EditFilterContentProps = {
  filter: FilterEntry;
  onUpdate: (filters: Partial<AuditEventsFilters>) => void;
  onClose: () => void;
};

const EditFilterContent = ({ filter, onUpdate, onClose }: EditFilterContentProps): ReactNode => {
  const [filterName] = filter;

  switch (filterName) {
    case 'dateRange':
      return (
        <DateRangeFilterMenu
          onSelect={(value) => {
            onUpdate({ dateRange: value });
            onClose();
          }}
        />
      );
    case 'table':
    case 'entityId':
      return null;
  }
};

type DateRangeFilterMenuProps = {
  onSelect: (value: NonNullable<DateRangeFilterType>) => void;
};

const DateRangeFilterMenu = ({ onSelect }: DateRangeFilterMenuProps) => {
  const { t } = useTranslation(['common', 'settings']);
  const [value, setValue] = useState<DateRangeFilterType | null>(null);

  return (
    <>
      <MenuCommand.List>
        <DateRangeFilter.Root dateRangeFilter={value} setDateRangeFilter={setValue} className="grid">
          <DateRangeFilter.FromNowPicker title={t('settings:activity_follow_up.filter.presets')} />
          <Separator className="bg-grey-90" decorative orientation="vertical" />
          <DateRangeFilter.Calendar />
          <Separator className="bg-grey-90 col-span-3" decorative orientation="horizontal" />
          <DateRangeFilter.Summary className="col-span-3 row-span-1" />
        </DateRangeFilter.Root>
      </MenuCommand.List>
      <div className="border-grey-90 flex justify-center gap-2 overflow-x-auto border-t p-2">
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
};
