import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict';
import { Temporal } from 'temporal-polyfill';
import { assertNever } from 'typescript-utils';

import { type DateRangeFilter } from './schema/filterSchema';

const ISO_DATETIME_WITHOUT_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/;
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Backend may return RFC3339-like strings without a timezone offset. */
export function normalizeTimestampForInstant(timestamp: string): string {
  const normalized = timestamp.trim().replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})/, '$1T$2');

  if (ISO_DATETIME_WITHOUT_OFFSET.test(normalized)) {
    return `${normalized}Z`;
  }
  if (ISO_DATE_ONLY.test(normalized)) {
    return `${normalized}T00:00:00Z`;
  }
  return normalized;
}

export function isUnsetTimestamp(timestamp: string | null | undefined): boolean {
  return !timestamp || timestamp.startsWith('0001-');
}

export type DueDateUrgency = { kind: 'left'; days: 0 | 1 | 2 } | { kind: 'late'; days: number };

export type CalendarDayDistance =
  | { kind: 'today' }
  | { kind: 'yesterday' }
  | { kind: 'tomorrow' }
  | { kind: 'ago'; days: number }
  | { kind: 'in'; days: number };

type CalendarDayOptions = { timeZone?: string; now?: Temporal.ZonedDateTime };

/**
 * Signed calendar-day delta from today to `timestamp` in the given timezone.
 * Positive = future, negative = past, `0` = today. Returns `null` when unset/invalid.
 */
function getSignedCalendarDays(timestamp: string | null | undefined, options?: CalendarDayOptions): number | null {
  if (!timestamp || isUnsetTimestamp(timestamp)) return null;

  try {
    const timeZone = options?.timeZone ?? Temporal.Now.timeZoneId();
    const now = options?.now ?? Temporal.Now.zonedDateTimeISO(timeZone);
    const targetDate = toInstant(timestamp).toZonedDateTimeISO(timeZone).toPlainDate();
    return now.toPlainDate().until(targetDate, { largestUnit: 'day' }).days;
  } catch {
    return null;
  }
}

/**
 * Calendar-day urgency between now and `dueAt` in the given timezone.
 * Returns `left` for 0–2 days remaining, `late` when overdue, otherwise `null`.
 */
export function getDueDateUrgency(
  dueAt: string | null | undefined,
  options?: CalendarDayOptions,
): DueDateUrgency | null {
  const days = getSignedCalendarDays(dueAt, options);
  if (days === null) return null;

  if (days < 0) {
    return { kind: 'late', days: Math.abs(days) };
  }
  if (days <= 2) {
    return { kind: 'left', days: days as 0 | 1 | 2 };
  }
  return null;
}

/**
 * Calendar-day distance from now to `timestamp` for compact relative labels
 * (today / yesterday / tomorrow / Nd ago / in Nd).
 */
export function getCalendarDayDistance(
  timestamp: string | null | undefined,
  options?: CalendarDayOptions,
): CalendarDayDistance | null {
  const days = getSignedCalendarDays(timestamp, options);
  if (days === null) return null;

  if (days === 0) return { kind: 'today' };
  if (days === 1) return { kind: 'tomorrow' };
  if (days === -1) return { kind: 'yesterday' };
  if (days > 1) return { kind: 'in', days };
  return { kind: 'ago', days: Math.abs(days) };
}

function toInstant(timestamp: string | Date): Temporal.Instant {
  return typeof timestamp === 'string'
    ? Temporal.Instant.from(normalizeTimestampForInstant(timestamp))
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

export function formatOptionalDateAtTime(
  timestamp: string | null | undefined,
  options: Parameters<typeof formatDateAtTime>[1],
  fallback = '—',
): string {
  if (!timestamp || isUnsetTimestamp(timestamp)) return fallback;

  try {
    return formatDateAtTime(timestamp, options);
  } catch {
    return fallback;
  }
}

/**
 * Formats the elapsed duration between two timestamps (end - start) in a
 * locale-aware, human readable way (e.g. "250 milliseconds" or "5 minutes").
 * Returns the fallback when either timestamp is missing or unset.
 */
export function formatOptionalDuration(
  start: string | null | undefined,
  end: string | null | undefined,
  options: { locale: string },
  fallback = '—',
): string {
  if (isUnsetTimestamp(start) || isUnsetTimestamp(end)) return fallback;

  try {
    const startInstant = toInstant(start as string);
    const endInstant = toInstant(end as string);
    const durationMilliseconds = Math.abs(endInstant.epochMilliseconds - startInstant.epochMilliseconds);

    if (durationMilliseconds < 1_000) {
      return new Intl.NumberFormat(options.locale, {
        style: 'unit',
        unit: 'millisecond',
        unitDisplay: 'long',
      }).format(durationMilliseconds);
    }

    return formatDistanceStrict(new Date(endInstant.epochMilliseconds), new Date(startInstant.epochMilliseconds), {
      locale: getDateFnsLocale(options.locale),
    });
  } catch {
    return fallback;
  }
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
      const parsedDate = instantToZonedDateTime(
        Temporal.Instant.from(normalizeTimestampForInstant(date)),
        timeZone,
        calendar,
      );

      if (dateRangeFilter.startDate && dateRangeFilter.startDate > date) {
        const startDate = instantToZonedDateTime(
          Temporal.Instant.from(normalizeTimestampForInstant(dateRangeFilter.startDate)),
          timeZone,
          calendar,
        );

        if (Temporal.ZonedDateTime.compare(parsedDate, startDate) < 0) return false;
      }
      if (dateRangeFilter.endDate) {
        const endDate = instantToZonedDateTime(
          Temporal.Instant.from(normalizeTimestampForInstant(dateRangeFilter.endDate)),
          timeZone,
          calendar,
        );

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

      const parsedDate = instantToZonedDateTime(
        Temporal.Instant.from(normalizeTimestampForInstant(date)),
        timeZone,
        calendar,
      );

      return Temporal.ZonedDateTime.compare(parsedDate, minDate) >= 0;
    }
    assertNever('[getDateRangeFilter] unknown filter:', dateRangeFilter);
  };
}
