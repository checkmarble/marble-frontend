import { clsx } from 'clsx';
import { add, type Locale, sub } from 'date-fns';
import { createContext, useCallback, useContext } from 'react';
import { Calendar, type DateRange } from '../../Calendar/Calendar';
import { useFormatting } from '../../contexts/FormattingContext';
import { useI18n } from '../../contexts/I18nContext';
import type { DateRangeFilterType, StaticDateRangeFilterType } from '../types';

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

const DateRangeFilterContext = createContext<
  | {
      fromNow?: string;
      calendarSelected?: DateRange;
      onCalendarSelect: (range?: DateRange) => void;
      onFromNowSelect: (fromNow: string) => void;
    }
  | undefined
>(undefined);

const useDateRangeFilterContext = () => {
  const ctx = useContext(DateRangeFilterContext);
  if (!ctx) {
    throw new Error('useDateRangeFilterContext must be used within DateRangeFilterContext.Provider');
  }
  return ctx;
};

function DateRangeFilterRoot({
  dateRangeFilter,
  setDateRangeFilter,
  locale,
  children,
  className,
}: {
  dateRangeFilter: DateRangeFilterType;
  setDateRangeFilter: (dateRangeFilter: DateRangeFilterType) => void;
  locale: Locale;
  children: React.ReactNode;
  className?: string;
}) {
  const calendarSelected = dateRangeFilter?.type === 'static' ? adaptDateRange(dateRangeFilter) : undefined;

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

function DateRangeFilterFromNowPicker({
  presetDurations,
  title,
  className,
}: {
  presetDurations: Map<string, string>;
  title: string;
  className?: string;
}) {
  const { onFromNowSelect } = useDateRangeFilterContext();
  const { fromNow } = useDateRangeFilterContext();

  return (
    <div className={clsx('flex flex-col gap-4 p-4', className)}>
      <div className="flex items-center">
        <p className="text-grey-80 text-s font-normal first-letter:capitalize">{title}</p>
      </div>
      <div className="flex flex-col gap-1">
        {Array.from(presetDurations.entries()).map(([duration, label]) => (
          <button
            key={duration}
            onClick={() => {
              onFromNowSelect(duration);
            }}
            className={clsx(
              'text-s bg-grey-100 text-grey-00 border-grey-100 flex h-10 items-center rounded-sm border p-2 outline-hidden',
              'hover:bg-purple-98 active:bg-purple-96 hover:text-purple-65',
              fromNow === duration && 'bg-purple-96 border-purple-65 text-purple-65', // highlight the currently selected
            )}
          >
            <time dateTime={duration}>{label}</time>
          </button>
        ))}
      </div>
    </div>
  );
}

function DateRangeFilterCalendar({ className, locale }: { className?: string; locale: Locale }) {
  const { calendarSelected, onCalendarSelect } = useDateRangeFilterContext();

  return (
    <div className={clsx('p-4', className)}>
      <Calendar
        mode="range"
        selected={calendarSelected}
        onSelect={onCalendarSelect}
        defaultMonth={calendarSelected?.from}
        locale={locale}
      />
    </div>
  );
}

function DateRangeFilterSummary({
  presetDurations,
  className,
}: {
  presetDurations: Map<string, string>;
  className?: string;
}) {
  const { language, formatDuration } = useFormatting();
  const { t } = useI18n();
  const { fromNow, calendarSelected } = useDateRangeFilterContext();

  if (fromNow) {
    if (presetDurations.has(fromNow)) {
      return (
        <div className={clsx('m-4 flex h-10 w-full items-center justify-center', className)}>
          {presetDurations.get(fromNow)}
        </div>
      );
    }
    return (
      <div className={clsx('m-4 flex h-10 w-full items-center justify-center', className)}>
        <time className="text-s text-grey-00 flex h-10 items-center rounded-sm p-2 outline-hidden" dateTime={fromNow}>
          {t('filters:up_to', {
            duration: formatDuration(fromNow, language),
          })}
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
  const { language, formatDateTimeWithoutPresets } = useFormatting();

  const dateTime = typeof date === 'string' ? date : date?.toDateString();
  const formattedDate = date
    ? formatDateTimeWithoutPresets(date, {
        language,
        dateStyle: 'short',
      })
    : '--/--/----';

  return (
    <time
      dateTime={dateTime}
      className={clsx(
        'border-grey-90 h-10 w-fit rounded-sm border p-2',
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
