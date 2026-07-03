import { Temporal } from 'temporal-polyfill';
import { assertNever } from 'typescript-utils';

import { type DateRangeFilter } from './schema/filterSchema';

function toInstant(timestamp: string | Date): Temporal.Instant {
  return typeof timestamp === 'string'
    ? Temporal.Instant.from(timestamp)
    : Temporal.Instant.fromEpochMilliseconds(timestamp.getTime());
}

function zdtToDate(zdt: Temporal.ZonedDateTime): Date {
  return new Date(zdt.epochMilliseconds);
}

function formatTime(zdt: Temporal.ZonedDateTime, locale: string, timeZone: string): string {
  return Intl.DateTimeFormat(locale, { timeZone, timeStyle: 'short' }).format(zdtToDate(zdt));
}

function formatDayMonthYear(zdt: Temporal.ZonedDateTime, locale: string, timeZone: string): string {
  return Intl.DateTimeFormat(locale, { timeZone, dateStyle: 'short' }).format(zdtToDate(zdt));
}

/**
 * Formats a timestamp as "Today at {time}" when the date is today in the given
 * timezone, "Yesterday at {time}" when it is yesterday, otherwise
 * "{date} at {time}" using locale-aware date and time formats.
 */
export function formatDateAtTime(
  timestamp: string | Date,
  {
    locale,
    timeZone,
    todayLabel = 'Today',
    yesterdayLabel = 'Yesterday',
    atSeparator = ' at ',
  }: {
    locale: string;
    timeZone: string;
    todayLabel?: string;
    yesterdayLabel?: string;
    atSeparator?: string;
  },
): string {
  const zdt = toInstant(timestamp).toZonedDateTimeISO(timeZone);
  const now = Temporal.Now.zonedDateTimeISO(timeZone);
  const time = formatTime(zdt, locale, timeZone);
  const date = zdt.toPlainDate();

  if (date.equals(now.toPlainDate())) {
    return `${todayLabel}${atSeparator}${time}`;
  }

  if (date.equals(now.toPlainDate().subtract({ days: 1 }))) {
    return `${yesterdayLabel}${atSeparator}${time}`;
  }

  return `${formatDayMonthYear(zdt, locale, timeZone)}${atSeparator}${time}`;
}

function instantToZonedDateTime(
  instant: Temporal.Instant,
  timeZone: string,
  calendar?: Temporal.CalendarLike,
): Temporal.ZonedDateTime {
  let zdt = instant.toZonedDateTimeISO(timeZone);
  if (calendar !== undefined) {
    zdt = zdt.withCalendar(calendar);
  }
  return zdt;
}

export function getDateRangeFilter(
  dateRangeFilter: DateRangeFilter,
  calendarAndTimeZone?: {
    calendar?: Temporal.CalendarLike;
    timeZone?: string;
  },
) {
  return (date: string) => {
    const calendar = calendarAndTimeZone?.calendar;
    const timeZone = calendarAndTimeZone?.timeZone ?? Temporal.Now.timeZoneId();

    if (dateRangeFilter.type === 'static') {
      const parsedDate = instantToZonedDateTime(Temporal.Instant.from(date), timeZone, calendar);

      if (dateRangeFilter.startDate && dateRangeFilter.startDate > date) {
        const startDate = instantToZonedDateTime(Temporal.Instant.from(dateRangeFilter.startDate), timeZone, calendar);

        if (Temporal.ZonedDateTime.compare(parsedDate, startDate) < 0) return false;
      }
      if (dateRangeFilter.endDate) {
        const endDate = instantToZonedDateTime(Temporal.Instant.from(dateRangeFilter.endDate), timeZone, calendar);

        if (Temporal.ZonedDateTime.compare(parsedDate, endDate) > 0) return false;
      }
      return true;
    }
    if (dateRangeFilter.type === 'dynamic') {
      let nowZdt = Temporal.Now.zonedDateTimeISO(timeZone);
      if (calendar !== undefined) {
        nowZdt = nowZdt.withCalendar(calendar);
      }
      const minDate = nowZdt.add(dateRangeFilter.fromNow);

      const parsedDate = instantToZonedDateTime(Temporal.Instant.from(date), timeZone, calendar);

      return Temporal.ZonedDateTime.compare(parsedDate, minDate) >= 0;
    }
    assertNever('[getDateRangeFilter] unknown filter:', dateRangeFilter);
  };
}
