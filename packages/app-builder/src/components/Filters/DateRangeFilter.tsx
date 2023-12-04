import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { formatDateTime, formatDuration } from '@app-builder/utils/format';
import { clsx } from 'clsx';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { Calendar, type DateRange } from 'ui-design-system';

type DateRangeFilterType =
  | {
      type: 'static';
      startDate: string;
      endDate: string;
    }
  | {
      type: 'dynamic';
      fromNow: string;
    }
  | null
  | undefined;

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
  const calendarSelected = getSelected(dateRangeFilter);
  const onCalendarSelect = useCallback(
    (range?: DateRange) => {
      const startDate = range?.from?.toISOString() ?? '';
      const endDate = range?.to?.toISOString() ?? '';

      setDateRangeFilter({
        type: 'static',
        startDate,
        endDate,
      });
    },
    [setDateRangeFilter],
  );

  const fromNow =
    dateRangeFilter?.type === 'dynamic' ? dateRangeFilter.fromNow : undefined;
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

function getSelected(dateRangeFilter: DateRangeFilterType) {
  if (!dateRangeFilter) return undefined;
  if (dateRangeFilter.type === 'dynamic') return undefined;

  const from = dateRangeFilter.startDate
    ? new Date(dateRangeFilter.startDate)
    : undefined;
  const to = dateRangeFilter.endDate
    ? new Date(dateRangeFilter.endDate)
    : undefined;
  const selected = from || to ? { from, to } : undefined;

  return selected;
}

export const fromNowDurations = [
  Temporal.Duration.from({ days: -7 }).toString(),
  Temporal.Duration.from({ days: -14 }).toString(),
  Temporal.Duration.from({ days: -30 }).toString(),
  Temporal.Duration.from({ months: -3 }).toString(),
  Temporal.Duration.from({ months: -6 }).toString(),
  Temporal.Duration.from({ months: -12 }).toString(),
] as const;

function DateRangeFilterFromNowPicker({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const {
    i18n: { language },
  } = useTranslation();
  const { onFromNowSelect } = useDateRangeFilterContext();

  return (
    <div className={clsx('flex flex-col gap-4 p-4', className)}>
      <div className="flex items-center">
        <p className="text-grey-25 text-s font-normal first-letter:capitalize">
          {title}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        {fromNowDurations.map((duration) => (
          <button
            key={duration.toString()}
            onClick={() => {
              onFromNowSelect(duration);
            }}
            className="text-s hover:bg-purple-05 active:bg-purple-10 bg-grey-00 text-grey-100 border-grey-00 flex h-10 items-center rounded border p-2 outline-none hover:text-purple-100 focus:border-purple-100"
          >
            {formatDuration(duration, language)}
          </button>
        ))}
      </div>
    </div>
  );
}

function DateRangeFilterCalendar({ className }: { className?: string }) {
  const {
    i18n: { language },
  } = useTranslation();
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
  const {
    i18n: { language },
  } = useTranslation();
  const { fromNow, calendarSelected } = useDateRangeFilterContext();

  if (fromNow) {
    return (
      <div
        className={clsx(
          'm-4 flex h-10 w-full items-center justify-center',
          className,
        )}
      >
        <span className="text-grey-100">
          {formatDuration(fromNow, language)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'grid grid-cols-[1fr_max-content_1fr] gap-1 p-4',
        className,
      )}
    >
      <FormatStaticDate
        className="justify-self-end"
        date={calendarSelected?.from}
      />
      <span className="text-l self-center">→</span>
      <FormatStaticDate date={calendarSelected?.to} />
    </div>
  );
}

function FormatStaticDate({
  date,
  className,
}: {
  date?: string | Date;
  className?: string;
}) {
  const {
    i18n: { language },
  } = useTranslation();
  return (
    <span
      className={clsx(
        'border-grey-10 h-10 w-fit rounded border p-2',
        date ? 'text-grey-100' : 'text-grey-50',
        className,
      )}
    >
      {date
        ? formatDateTime(date, {
            language,
            timeStyle: undefined,
          })
        : '--/--/----'}
    </span>
  );
}

export const DateRangeFilter = {
  Root: DateRangeFilterRoot,
  FromNowPicker: DateRangeFilterFromNowPicker,
  Calendar: DateRangeFilterCalendar,
  Summary: DateRangeFilterSummary,
};
