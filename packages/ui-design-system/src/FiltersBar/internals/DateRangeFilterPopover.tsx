import { ar, enUS, fr } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { useFormatting } from '../../contexts/FormattingContext';
import type { DateRangeFilterType, DateRangePopoverFilter } from '../types';
import { DateRangeFilter } from './DateRangeFilter';
import { FilterItem, FilterPopover } from './FilterPopover';
import { useFiltersBarContext } from './FiltersBarContext';

export function DateRangeFilterPopover({ filter }: { filter: DateRangePopoverFilter }) {
  const drFilter = filter;
  const { language, formatDateTimeWithoutPresets } = useFormatting();
  const { emitSet } = useFiltersBarContext();
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

  const summary = (() => {
    const from =
      drFilter.selectedValue?.type === 'static' ? drFilter.selectedValue.startDate : undefined;
    const to =
      drFilter.selectedValue?.type === 'static' ? drFilter.selectedValue.endDate : undefined;
    if (!from && !to) return drFilter.placeholder;
    const fmt = (d?: Date) =>
      d ? formatDateTimeWithoutPresets(d, { language, dateStyle: 'short' }) : '--/--/----';
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
          emitSet(drFilter.name, localDateRangeFilter ?? null);
        }
      }}
    >
      <FilterItem.Root>
        <FilterItem.Trigger>{summary}</FilterItem.Trigger>
        {drFilter.removable ? (
          <FilterItem.Clear
            onClick={() => {
              emitSet(drFilter.name, null);
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
          <div className="grid grid-cols-2 gap-2">
            <DateRangeFilter.FromNowPicker title="Quick ranges" />
            <DateRangeFilter.Calendar locale={dateFnsLocale} />
          </div>
          <DateRangeFilter.Summary />
        </DateRangeFilter.Root>
      </FilterPopover.Content>
    </FilterPopover.Root>
  );
}
