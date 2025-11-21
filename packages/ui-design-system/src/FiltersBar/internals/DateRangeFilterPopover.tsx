import { add, formatDistanceStrict } from 'date-fns';
import { ar, enUS, fr } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { useFormatting } from '../../contexts/FormattingContext';
import { useI18n } from '../../contexts/I18nContext';
import type { DateRangeFilterType, DateRangePopoverFilter } from '../types';
import { DateRangeFilter } from './DateRangeFilter';
import { FilterItem, FilterPopover } from './FilterPopover';
import { useFiltersBarContext } from './FiltersBarContext';

export function DateRangeFilterPopover({ filter }: { filter: DateRangePopoverFilter }) {
  const { t } = useI18n();

  const drFilter = filter;
  const { language, formatDateTimeWithoutPresets } = useFormatting();
  const { emitSet, emitRemove } = useFiltersBarContext();
  const dateFnsLocale = useMemo(() => {
    switch (language) {
      case 'fr':
        return fr;
      case 'ar':
        return ar;
      default:
        return enUS;
    }
  }, [language]);

  const presetDurations = useMemo(
    () =>
      new Map([
        [Temporal.Duration.from({ days: -7 }).toString(), t('filters:date_range_filter.preset.last_7_days')],
        [Temporal.Duration.from({ days: -14 }).toString(), t('filters:date_range_filter.preset.last_14_days')],
        [Temporal.Duration.from({ days: -30 }).toString(), t('filters:date_range_filter.preset.last_30_days')],
        [Temporal.Duration.from({ months: -3 }).toString(), t('filters:date_range_filter.preset.last_3_months')],
        [Temporal.Duration.from({ months: -6 }).toString(), t('filters:date_range_filter.preset.last_6_months')],
        [Temporal.Duration.from({ months: -12 }).toString(), t('filters:date_range_filter.preset.last_12_months')],
      ]),
    [t],
  );

  const summary = (() => {
    if (drFilter.selectedValue?.type === 'dynamic') {
      const presetDuration = presetDurations.get(drFilter.selectedValue.fromNow);
      if (presetDuration) return presetDuration;

      const date = new Date();
      const duration = Temporal.Duration.from(drFilter.selectedValue.fromNow);
      return formatDistanceStrict(add(date, duration), date, {
        addSuffix: true,
        locale: dateFnsLocale,
      });
    }

    const from = drFilter.selectedValue?.type === 'static' ? drFilter.selectedValue.startDate : undefined;
    const to = drFilter.selectedValue?.type === 'static' ? drFilter.selectedValue.endDate : undefined;
    if (!from && !to) return drFilter.placeholder;
    const fmt = (d?: Date) => (d ? formatDateTimeWithoutPresets(d, { language, dateStyle: 'short' }) : '--/--/----');
    return from && to ? `${fmt(new Date(from))} → ${fmt(new Date(to))}` : drFilter.placeholder;
  })();

  // Use a polyfill or fallback for Temporal.Duration if not available.
  // Here, we fallback to a string "-P7D" for "7 days ago" in ISO 8601 duration format.
  const defaultDynamicFromNow = '-P7D';

  const [localDateRangeFilter, setLocalDateRangeFilter] = useState<DateRangeFilterType>(
    filter.selectedValue ?? { type: 'dynamic', fromNow: defaultDynamicFromNow },
  );

  const [isOpen, setIsOpen] = useState(false);

  return (
    <FilterPopover.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          emitSet(drFilter.name, localDateRangeFilter);
        }
      }}
    >
      <FilterItem.Root>
        <FilterItem.Trigger>{summary}</FilterItem.Trigger>
        {drFilter.removable ? (
          <FilterItem.Clear
            onClick={() => {
              emitRemove(drFilter.name);
            }}
          />
        ) : null}
      </FilterItem.Root>
      <FilterPopover.Content>
        <DateRangeFilter.Root
          dateRangeFilter={localDateRangeFilter as any}
          setDateRangeFilter={(value) => setLocalDateRangeFilter(value as any)}
          locale={dateFnsLocale}
        >
          <div className="flex flex-col md:flex-row gap-2">
            <DateRangeFilter.FromNowPicker
              presetDurations={presetDurations}
              title="Quick ranges"
              className="border-r-1 border-grey-90 pr-v2-md"
            />
            <DateRangeFilter.Calendar locale={dateFnsLocale} />
          </div>
          <DateRangeFilter.Summary
            className="border-t-1 border-grey-90 pt-v2-sm mt-0"
            presetDurations={presetDurations}
          />
        </DateRangeFilter.Root>
      </FilterPopover.Content>
    </FilterPopover.Root>
  );
}
