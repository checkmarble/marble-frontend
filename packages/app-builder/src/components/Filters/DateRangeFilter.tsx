import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { formatDateTime, formatDuration, useFormatLanguage } from '@app-builder/utils/format';
import { clsx } from 'clsx';
import { add, sub } from 'date-fns';
import { useCallback } from 'react';
import { Temporal } from 'temporal-polyfill';
import { Calendar, type DateRange } from 'ui-design-system';

interface StaticDateRangeFilterType {
  type: 'static';
  startDate: string;
  endDate: string;
}

interface DynamicDateRangeFilterType {
  type: 'dynamic';
  fromNow: string;
}

type DateRangeFilterType =
  | StaticDateRangeFilterType
  | DynamicDateRangeFilterType
  | null
  | undefined;

function adaptStaticDateRangeFilterType({ from, to }: DateRange): StaticDateRangeFilterType {
  const startDate = from?.toISOString() ?? '';
  // Add a day to the end date because the user expects the end date to be included.
  // To fully understand that, think about the special case where the user selects the same day in the Calendar picker (from = to)
  // "From" means the start of the day, and "to" means the end of the day.
  const endDate = to ? add(to, { days: 1 }).toISOString() : '';

  return {
    type: 'static',
    startDate,
    endDate,
  };
}

function adaptDateRange({ startDate, endDate }: StaticDateRangeFilterType): DateRange | undefined {
  const from = startDate ? new Date(startDate) : undefined;
  // look at adaptStaticDateRangeFilterType for the reason why we substract a day
  const to = endDate ? sub(new Date(endDate), { days: 1 }) : undefined;

  return from || to ? { from, to } : undefined;
}

const DateRangeFilterContext = createSimpleContext<{
  fromNow?: string;
  calendarSelected?: DateRange;
  onCalendarSelect: (range?: DateRange) => void;
  onFromNowSelect: (fromNow: string) => void;
}>('DateRangeFilterContext');

const useDateRangeFilterContext = DateRangeFilterContext.useValue;

function DateRangeFilterRoot({
  dateRangeFilter,
  setDateRangeFilter,
  children,
  className,
}: {
  dateRangeFilter: DateRangeFilterType;
  setDateRangeFilter: (dateRangeFilter: DateRangeFilterType) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const calendarSelected =
    dateRangeFilter?.type === 'static' ? adaptDateRange(dateRangeFilter) : undefined;

  const onCalendarSelect = useCallback(
    (range?: DateRange) => {
      setDateRangeFilter(adaptStaticDateRangeFilterType(range ?? { from: undefined }));
    },
    [setDateRangeFilter],
  );

  const fromNow = dateRangeFilter?.type === 'dynamic' ? dateRangeFilter.fromNow : undefined;
  const onFromNowSelect = useCallback(
    (fromNow: string) => {
      setDateRangeFilter({
        type: 'dynamic',
        fromNow,
      });
    },
    [setDateRangeFilter],
  );

  const value = {
    fromNow,
    calendarSelected,
    onCalendarSelect,
    onFromNowSelect,
  };
  return (
    <DateRangeFilterContext.Provider value={value}>
      <div className={className}>{children}</div>
    </DateRangeFilterContext.Provider>
  );
}

export const fromNowDurations = [
  Temporal.Duration.from({ days: -7 }).toString(),
  Temporal.Duration.from({ days: -14 }).toString(),
  Temporal.Duration.from({ days: -30 }).toString(),
  Temporal.Duration.from({ months: -3 }).toString(),
  Temporal.Duration.from({ months: -6 }).toString(),
  Temporal.Duration.from({ months: -12 }).toString(),
] as const;

function DateRangeFilterFromNowPicker({ title, className }: { title: string; className?: string }) {
  const language = useFormatLanguage();
  const { onFromNowSelect } = useDateRangeFilterContext();

  return (
    <div className={clsx('flex flex-col gap-4 p-4', className)}>
      <div className="flex items-center">
        <p className="text-grey-80 text-s font-normal first-letter:capitalize">{title}</p>
      </div>
      <div className="flex flex-col gap-1">
        {fromNowDurations.map((duration) => (
          <button
            key={duration}
            onClick={() => {
              onFromNowSelect(duration);
            }}
            className="text-s hover:bg-purple-98 active:bg-purple-96 bg-grey-100 text-grey-00 border-grey-100 hover:text-purple-65 focus:border-purple-65 flex h-10 items-center rounded border p-2 outline-none"
          >
            <time dateTime={duration}>{formatDuration(duration, language)}</time>
          </button>
        ))}
      </div>
    </div>
  );
}

function DateRangeFilterCalendar({ className }: { className?: string }) {
  const language = useFormatLanguage();
  const { calendarSelected, onCalendarSelect } = useDateRangeFilterContext();

  return (
    <div className={clsx('p-4', className)}>
      <Calendar
        mode="range"
        selected={calendarSelected}
        onSelect={onCalendarSelect}
        defaultMonth={calendarSelected?.from}
        locale={getDateFnsLocale(language)}
      />
    </div>
  );
}

function DateRangeFilterSummary({ className }: { className?: string }) {
  const language = useFormatLanguage();
  const { fromNow, calendarSelected } = useDateRangeFilterContext();

  if (fromNow) {
    return (
      <div className={clsx('m-4 flex h-10 w-full items-center justify-center', className)}>
        <time className="text-grey-00" dateTime={fromNow}>
          {formatDuration(fromNow, language)}
        </time>
      </div>
    );
  }

  return (
    <div className={clsx('grid grid-cols-[1fr_max-content_1fr] gap-1 p-4', className)}>
      <FormatStaticDate className="justify-self-end" date={calendarSelected?.from} />
      <span className="text-l self-center">→</span>
      <FormatStaticDate date={calendarSelected?.to} />
    </div>
  );
}

function FormatStaticDate({ date, className }: { date?: string | Date; className?: string }) {
  const language = useFormatLanguage();

  const dateTime = typeof date === 'string' ? date : date?.toDateString();
  const formattedDate = date
    ? formatDateTime(date, {
        language,
        timeStyle: undefined,
      })
    : '--/--/----';

  return (
    <time
      dateTime={dateTime}
      className={clsx(
        'border-grey-90 h-10 w-fit rounded border p-2',
        date ? 'text-grey-00' : 'text-grey-50',
        className,
      )}
    >
      {formattedDate}
    </time>
  );
}

export const DateRangeFilter = {
  Root: DateRangeFilterRoot,
  FromNowPicker: DateRangeFilterFromNowPicker,
  Calendar: DateRangeFilterCalendar,
  Summary: DateRangeFilterSummary,
};
