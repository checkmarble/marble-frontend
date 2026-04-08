import { DateRangeFilter } from '@app-builder/components/Filters';
import { formatDuration, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Separator } from 'ui-design-system';
import { type DateRangeFilterType } from 'ui-design-system/src/FiltersBar/types';
import { Icon } from 'ui-icons';

interface CaseAnalyticsDateRangeMenuProps {
  value: DateRangeFilterType;
  onChange: (value: NonNullable<DateRangeFilterType>) => void;
}

export function CaseAnalyticsDateRangeMenu({ value, onChange }: CaseAnalyticsDateRangeMenuProps) {
  const { t } = useTranslation(['cases', 'common', 'filters']);
  const formatDateTime = useFormatDateTime();
  const language = useFormatLanguage();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeFilterType>(value);

  const label = formatLabel(value, formatDateTime, language, t);

  return (
    <MenuCommand.Menu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setDraft(value);
      }}
    >
      <MenuCommand.Trigger>
        <Button variant="secondary" className="flex h-12 min-w-60 items-center gap-v2-sm px-v2-md text-s">
          <Icon icon="calendar-month" className="size-5" />
          <span className="flex-1 text-left">{label}</span>
          <Icon icon="caret-down" className="size-5" />
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" sideOffset={4} className="max-h-[600px]">
        <MenuCommand.List>
          <DateRangeFilter.Root dateRangeFilter={draft} setDateRangeFilter={setDraft} className="grid">
            <DateRangeFilter.FromNowPicker title={t('cases:analytics.filters.date_range_title')} />
            <Separator className="bg-grey-border" decorative orientation="vertical" />
            <DateRangeFilter.Calendar />
            <Separator className="bg-grey-border col-span-3" decorative orientation="horizontal" />
            <DateRangeFilter.Summary className="col-span-3 row-span-1" />
          </DateRangeFilter.Root>
        </MenuCommand.List>
        <div className="border-grey-border flex justify-center gap-2 overflow-x-auto border-t p-2">
          <MenuCommand.HeadlessItem
            onSelect={() => {
              if (draft) {
                onChange(draft);
                setOpen(false);
              }
            }}
          >
            <Button disabled={!draft} size="default">
              {t('common:save')}
            </Button>
          </MenuCommand.HeadlessItem>
        </div>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

function formatLabel(
  value: DateRangeFilterType,
  formatDateTime: ReturnType<typeof useFormatDateTime>,
  language: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (!value) return t('cases:analytics.filters.select_date_range');

  if (value.type === 'dynamic') {
    return t('filters:up_to', { duration: formatDuration(value.fromNow, language) });
  }

  const { startDate, endDate } = value;
  if (!startDate && !endDate) return t('cases:analytics.filters.select_date_range');
  const from = startDate ? formatDateTime(startDate, { dateStyle: 'short' }) : '...';
  const to = endDate ? formatDateTime(endDate, { dateStyle: 'short' }) : '...';
  return `${from} → ${to}`;
}
