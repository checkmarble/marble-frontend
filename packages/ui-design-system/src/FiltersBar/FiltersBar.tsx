// Import from app-builder package for now - ideally these should be moved to ui-design-system

import { add, sub } from 'date-fns';
import { ar, enUS, fr } from 'date-fns/locale';
import { createContext, useMemo, useState } from 'react';
import { match } from 'ts-pattern';
import { Calendar, type DateRange } from '../Calendar/Calendar';
import { Checkbox } from '../Checkbox/Checkbox';
import { useFormatting } from '../contexts/FormattingContext';
import { Input } from '../Input/Input';
import { DateRangeFilter } from './DateRangeFilter';
import { FilterItem, FilterPopover } from './FilterPopover';
import { SelectFilter as SelectFilterComponent } from './SelectFilter';

export type FilterType =
  | 'calendar'
  | 'calendar-range'
  | 'text'
  | 'checkbox'
  | 'select'
  | 'date-range-popover'
  | 'radio'
  | 'multi-select';

// Common types
// Generic selected value type is defined per filter using BaseFilter<TValue>

// Deprecated - do not use; consumers should wrap with providers in the host app
export const FiltersBarI18nContext = createContext({});

// Base interface for common filter properties
export interface BaseFilter<TValue = unknown> {
  name: string;
  placeholder: string;
  selectedValue: TValue | null;
  onChange?: (value: TValue | null) => void;
}

// Specific filter type interfaces
export interface TextFilter extends BaseFilter<string> {
  type: 'text';
}

export interface CheckboxFilter extends BaseFilter<boolean> {
  type: 'checkbox';
}

export interface SelectFilter extends BaseFilter<string> {
  type: 'select';
  options: string[] | { label: string; value: string }[];
}

export interface MultiSelectFilter extends BaseFilter<string[]> {
  type: 'multi-select';
  options: string[] | { label: string; value: string }[];
}

export interface CalendarFilter extends BaseFilter<DateRange> {
  type: 'calendar';
}

export interface CalendarRangeFilter extends BaseFilter<DateRange> {
  type: 'calendar-range';
  selectedValue: DateRange;
}

export interface DateRangePopoverFilter extends BaseFilter<DateRange> {
  type: 'date-range-popover';
  onClear?: () => void;
}

export interface RadioFilter extends BaseFilter<string> {
  type: 'radio';
  options: string[] | { label: string; value: string }[];
}

// Union type for all filter types
export type Filter =
  | TextFilter
  | CheckboxFilter
  | SelectFilter
  | MultiSelectFilter
  | CalendarFilter
  | CalendarRangeFilter
  | DateRangePopoverFilter
  | RadioFilter;

export interface FiltersBarProps {
  filters: Filter[];
}
export function FiltersBar(props: FiltersBarProps) {
  const { filters } = props;
  const { language, formatDateTimeWithoutPresets } = useFormatting();

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

  function adaptStaticDateRangeFilterType({ from, to }: DateRange) {
    const startDate = from?.toISOString() ?? '';
    const endDate = to ? add(to, { days: 1 }).toISOString() : '';
    return { type: 'static' as const, startDate, endDate };
  }

  function toDateRangeFromFilterType(
    dateRangeFilter:
      | { type: 'static'; startDate: string; endDate: string }
      | { type: 'dynamic'; fromNow: string },
  ): DateRange {
    if (dateRangeFilter.type === 'static') {
      const from = dateRangeFilter.startDate ? new Date(dateRangeFilter.startDate) : undefined;
      const to = dateRangeFilter.endDate
        ? sub(new Date(dateRangeFilter.endDate), { days: 1 })
        : undefined;
      return { from, to };
    }
    // dynamic (e.g. "-P7D", "-P6M") → now minus duration ... now
    const now = new Date();
    const raw = dateRangeFilter.fromNow.startsWith('-')
      ? dateRangeFilter.fromNow.slice(1)
      : dateRangeFilter.fromNow;
    const match = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?$/i.exec(raw);
    if (!match) return { from: undefined, to: now };
    const years = Number(match[1] ?? 0);
    const months = Number(match[2] ?? 0);
    const days = Number(match[3] ?? 0);
    const from = sub(now, { years, months, days });
    return { from, to: now };
  }

  return (
    <div className="flex flex-row items-center justify-between gap-2">
      {filters.map((filter) =>
        match(filter.type)
          .with('calendar-range', () => {
            const rangeFilter = filter as CalendarRangeFilter;
            return (
              <Calendar
                key={filter.name}
                mode="range"
                selected={rangeFilter.selectedValue}
                onSelect={(value) => rangeFilter.onChange?.(value ?? null)}
              />
            );
          })
          .with('text', () => <Input key={filter.name} placeholder={filter.placeholder} />)
          .with('checkbox', () => <Checkbox key={filter.name} />)
          .with('select', () => (
            <SelectFilterComponent key={filter.name} {...(filter as SelectFilter)} />
          ))
          .with('date-range-popover', () => {
            const drFilter = filter as DateRangePopoverFilter;

            const summary = (() => {
              const from = drFilter.selectedValue?.from ?? undefined;
              const to = drFilter.selectedValue?.to ?? undefined;
              if (!from && !to) return drFilter.placeholder;
              const fmt = (d?: Date) =>
                d
                  ? formatDateTimeWithoutPresets(d, { language, dateStyle: 'short' })
                  : '--/--/----';
              return `${fmt(from)} → ${fmt(to)}`;
            })();

            type LocalStatic = { type: 'static'; startDate: string; endDate: string };
            type LocalDynamic = { type: 'dynamic'; fromNow: string };
            type LocalDateRangeFilterType = LocalStatic | LocalDynamic | null | undefined;

            const [localDateRangeFilter, setLocalDateRangeFilter] =
              useState<LocalDateRangeFilterType>(
                adaptStaticDateRangeFilterType(drFilter.selectedValue ?? { from: undefined }),
              );

            return (
              <FilterPopover.Root
                key={filter.name}
                onOpenChange={(open) => {
                  if (!open) {
                    const eff =
                      localDateRangeFilter ??
                      adaptStaticDateRangeFilterType(drFilter.selectedValue ?? ({} as DateRange));
                    drFilter.onChange?.(toDateRangeFromFilterType(eff));
                  }
                }}
              >
                <FilterItem.Root>
                  <FilterItem.Trigger>{summary}</FilterItem.Trigger>
                  {drFilter.onClear ? (
                    <FilterItem.Clear
                      onClick={() => {
                        setLocalDateRangeFilter(undefined);
                        drFilter.onClear?.();
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
          })
          .with('radio', () => <div key={filter.name}>Radio filter not implemented yet</div>)
          .with('multi-select', () => (
            <div key={filter.name}>Multi-select filter not implemented yet</div>
          ))
          .with('calendar', () => <div key={filter.name}>Calendar filter not implemented yet</div>)
          .exhaustive(),
      )}
    </div>
  );
}
