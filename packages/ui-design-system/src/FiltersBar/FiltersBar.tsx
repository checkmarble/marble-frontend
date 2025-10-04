// Import from app-builder package for now - ideally these should be moved to ui-design-system

import { add, sub } from 'date-fns';
import { ar, enUS, fr } from 'date-fns/locale';
import { createContext, useMemo, useState } from 'react';
import { match } from 'ts-pattern';
import { ButtonV2 } from '../Button/Button';
import { Calendar, type DateRange } from '../Calendar/Calendar';
import { Checkbox } from '../Checkbox/Checkbox';
import { useFormatting } from '../contexts/FormattingContext';
import { Input } from '../Input/Input';
import { Modal } from '../Modal/Modal';
import { cn } from '../utils';
import { DateRangeFilter } from './DateRangeFilter';
import { FilterItem, FilterPopover } from './FilterPopover';
import { useFiltersContext } from './FiltersProvider';
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
  // Optional dynamic filter controls
  removable?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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

// (No custom types; dynamic dummy filter uses 'text')

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
  const filtersCtx = useFiltersContext();

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
    <div className="flex flex-col gap-2">
      {/* First row: static filters (e.g., scenario selector, date ranges) */}
      <div className="flex flex-row items-center gap-2">
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
            .with('text', () => {
              const f = filter as TextFilter;
              const label = f.selectedValue ? String(f.selectedValue) : f.placeholder;
              if (typeof f.isOpen === 'boolean' || f.removable) {
                return (
                  <FilterPopover.Root
                    key={f.name}
                    open={f.isOpen}
                    onOpenChange={(open) => f.onOpenChange?.(open)}
                  >
                    <FilterItem.Root>
                      <FilterItem.Trigger>{label}</FilterItem.Trigger>
                      {f.removable && filtersCtx ? (
                        <FilterItem.Clear onClick={() => filtersCtx.removeFilter(f.name)} />
                      ) : null}
                    </FilterItem.Root>
                    <FilterPopover.Content>
                      <div className="p-4 flex flex-col gap-2 w-80">
                        <Input
                          placeholder={f.placeholder}
                          value={(f.selectedValue as string) ?? ''}
                          onChange={(e) => f.onChange?.(e.currentTarget.value)}
                        />
                        <div className="flex justify-end">
                          <button
                            className={cn(
                              'text-s bg-purple-65 text-white rounded-sm px-3 py-1.5 outline-hidden',
                            )}
                            onClick={() => f.onOpenChange?.(false)}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </FilterPopover.Content>
                  </FilterPopover.Root>
                );
              }
              return <Input key={f.name} placeholder={f.placeholder} />;
            })
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

              const controlledProps =
                typeof drFilter.isOpen === 'boolean'
                  ? { open: drFilter.isOpen }
                  : ({} as Record<string, unknown>);

              const handleOpenChange = (open: boolean) => {
                if (!open) {
                  const eff =
                    localDateRangeFilter ??
                    adaptStaticDateRangeFilterType(drFilter.selectedValue ?? ({} as DateRange));
                  drFilter.onChange?.(toDateRangeFromFilterType(eff));
                }
                drFilter.onOpenChange?.(open);
              };

              return (
                <FilterPopover.Root
                  key={filter.name}
                  {...controlledProps}
                  onOpenChange={handleOpenChange}
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
            .with('calendar', () => (
              <div key={filter.name}>Calendar filter not implemented yet</div>
            ))
            .exhaustive(),
        )}
      </div>

      {/* Second row: custom filters and add button */}
      {filtersCtx ? (
        <div className="flex flex-row items-center gap-2">
          {(filtersCtx.dynamicFilters ?? []).map((filter) =>
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
              .with('text', () => {
                const f = filter as TextFilter;
                const label = f.selectedValue ? String(f.selectedValue) : f.placeholder;
                if (typeof f.isOpen === 'boolean' || f.removable) {
                  return (
                    <FilterPopover.Root
                      key={f.name}
                      open={f.isOpen}
                      onOpenChange={(open) => f.onOpenChange?.(open)}
                    >
                      <FilterItem.Root>
                        <FilterItem.Trigger>{label}</FilterItem.Trigger>
                        {f.removable && filtersCtx ? (
                          <FilterItem.Clear onClick={() => filtersCtx.removeFilter(f.name)} />
                        ) : null}
                      </FilterItem.Root>
                      <FilterPopover.Content>
                        <div className="p-4 flex flex-col gap-2 w-80">
                          <Input
                            placeholder={f.placeholder}
                            value={(f.selectedValue as string) ?? ''}
                            onChange={(e) => f.onChange?.(e.currentTarget.value)}
                          />
                          <div className="flex justify-end">
                            <button
                              className={cn(
                                'text-s bg-purple-65 text-white rounded-sm px-3 py-1.5 outline-hidden',
                              )}
                              onClick={() => f.onOpenChange?.(false)}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </FilterPopover.Content>
                    </FilterPopover.Root>
                  );
                }
                return <Input key={f.name} placeholder={f.placeholder} />;
              })
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

                const controlledProps =
                  typeof drFilter.isOpen === 'boolean'
                    ? { open: drFilter.isOpen }
                    : ({} as Record<string, unknown>);

                const handleOpenChange = (open: boolean) => {
                  if (!open) {
                    const eff =
                      localDateRangeFilter ??
                      adaptStaticDateRangeFilterType(drFilter.selectedValue ?? ({} as DateRange));
                    drFilter.onChange?.(toDateRangeFromFilterType(eff));
                  }
                  drFilter.onOpenChange?.(open);
                };

                return (
                  <FilterPopover.Root
                    key={filter.name}
                    {...controlledProps}
                    onOpenChange={handleOpenChange}
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
              .with('calendar', () => (
                <div key={filter.name}>Calendar filter not implemented yet</div>
              ))
              .exhaustive(),
          )}

          {/* Add filter button + modal */}
          <ButtonV2 variant="secondary" onClick={() => filtersCtx.setAddModalOpen(true)}>
            Add new filter
          </ButtonV2>
          <Modal.Root open={filtersCtx.isAddModalOpen} onOpenChange={filtersCtx.setAddModalOpen}>
            <Modal.Content size="small">
              <Modal.Title>Choose a filter</Modal.Title>
              <div className="p-4 grid grid-cols-1 gap-2">
                {filtersCtx.availableTypes.map((t) => (
                  <button
                    key={t.key}
                    className={cn(
                      'text-left border border-grey-90 rounded-sm px-3 py-2 hover:bg-purple-98 outline-hidden',
                    )}
                    onClick={() => filtersCtx.addFilter(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Modal.Content>
          </Modal.Root>
        </div>
      ) : null}
    </div>
  );
}
