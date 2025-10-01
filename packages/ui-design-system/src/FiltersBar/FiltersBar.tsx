// Import from app-builder package for now - ideally these should be moved to ui-design-system
import { DateRangeFilter, FilterPopover } from '@app-builder/components/Filters';
import { match } from 'ts-pattern';
import { Calendar, type DateRange } from '../Calendar/Calendar';
import { Checkbox } from '../Checkbox/Checkbox';
import { Input } from '../Input/Input';
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
export type Value = string | DateRange | null;

// Base interface for common filter properties
export interface BaseFilter {
  name: string;
  placeholder: string;
  selectedValue: Value | null;
  onChange?: (value: any) => void;
}

// Specific filter type interfaces
export interface TextFilter extends BaseFilter {
  type: 'text';
}

export interface CheckboxFilter extends BaseFilter {
  type: 'checkbox';
}

export interface SelectFilter extends BaseFilter {
  type: 'select';
  options: string[] | { label: string; value: string }[];
}

export interface MultiSelectFilter extends BaseFilter {
  type: 'multi-select';
  options: string[] | { label: string; value: string }[];
}

export interface CalendarFilter extends BaseFilter {
  type: 'calendar';
}

export interface CalendarRangeFilter extends BaseFilter {
  type: 'calendar-range';
  value: DateRange;
}

export interface DateRangePopoverFilter extends BaseFilter {
  type: 'date-range-popover';
  dateRange: DateRange;
  onClear?: () => void;
}

export interface RadioFilter extends BaseFilter {
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

  return (
    <div className="flex flex-row items-center justify-between gap-2">
      {filters.map((filter) =>
        match(filter.type)
          .with('calendar-range', () => <Calendar key={filter.name} mode="range" />)
          .with('text', () => <Input key={filter.name} placeholder={filter.placeholder} />)
          .with('checkbox', () => <Checkbox key={filter.name} />)
          .with('select', () => (
            <SelectFilterComponent key={filter.name} {...(filter as SelectFilter)} />
          ))
          .with('date-range-popover', () => {
            const dateFilter = filter as DateRangePopoverFilter;
            return (
              <FilterPopover.Root key={filter.name}>
                <FilterPopover.Anchor>
                  <div className="bg-purple-98 flex h-10 flex-row items-center rounded-sm">
                    <FilterPopover.Trigger className="text-purple-65 focus:border-purple-65 -mr-1 flex h-full flex-row items-center gap-1 rounded-sm border border-solid border-transparent px-2 outline-hidden">
                      <span className="text-s font-semibold first-letter:capitalize">
                        Period from{' '}
                        {(dateFilter.selectedValue as DateRange)?.from?.toLocaleDateString() ?? ''}{' '}
                        to {(dateFilter.selectedValue as DateRange)?.to?.toLocaleDateString() ?? ''}
                      </span>
                    </FilterPopover.Trigger>
                    {dateFilter.onClear && (
                      <button
                        onClick={dateFilter.onClear}
                        className="focus:border-purple-65 -ml-1 h-full rounded-sm border border-solid border-transparent px-2 outline-hidden"
                      >
                        <svg
                          className="text-purple-65 size-5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </FilterPopover.Anchor>
                <FilterPopover.Content>
                  <DateRangeFilter.Root
                    dateRangeFilter={{
                      type: 'static',
                      startDate: (dateFilter.selectedValue as DateRange)?.from?.toISOString() ?? '',
                      endDate: (dateFilter.selectedValue as DateRange)?.to?.toISOString() ?? '',
                    }}
                    setDateRangeFilter={(newFilter) => {
                      if (newFilter?.type === 'static') {
                        const newRange = {
                          from: new Date(newFilter.startDate),
                          to: new Date(newFilter.endDate),
                        };
                        dateFilter.onChange?.(newRange);
                      }
                    }}
                    className="grid"
                  >
                    <DateRangeFilter.FromNowPicker title="Select time period" />
                    <div className="bg-grey-90" style={{ width: '1px' }} />
                    <DateRangeFilter.Calendar />
                    <div className="bg-grey-90 col-span-3" style={{ height: '1px' }} />
                    <DateRangeFilter.Summary className="col-span-3 row-span-1" />
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
