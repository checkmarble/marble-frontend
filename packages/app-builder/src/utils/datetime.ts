import { Temporal } from 'temporal-polyfill';
import { assertNever } from 'typescript-utils';

import { type DateRangeFilter } from './schema/filterSchema';

export function getDateRangeFilter(
  dateRangeFilter: DateRangeFilter,
  calendarAndTimeZone?: {
    calendar?: Temporal.CalendarProtocol | Temporal.Calendar;
    timeZone?: string;
  },
) {
  return (date: string) => {
    const calendar =
      calendarAndTimeZone?.calendar ?? Temporal.Calendar.from('iso8601');
    const timeZone = calendarAndTimeZone?.timeZone ?? Temporal.Now.timeZoneId();

    if (dateRangeFilter.type === 'static') {
      const parsedDate = Temporal.Instant.from(date).toZonedDateTime({
        calendar,
        timeZone,
      });

      if (dateRangeFilter.startDate && dateRangeFilter.startDate > date) {
        const startDate = Temporal.Instant.from(
          dateRangeFilter.startDate,
        ).toZonedDateTime({
          calendar,
          timeZone,
        });

        if (Temporal.ZonedDateTime.compare(parsedDate, startDate) < 0)
          return false;
      }
      if (dateRangeFilter.endDate) {
        const endDate = Temporal.Instant.from(
          dateRangeFilter.endDate,
        ).toZonedDateTime({
          calendar,
          timeZone,
        });

        if (Temporal.ZonedDateTime.compare(parsedDate, endDate) > 0)
          return false;
      }
      return true;
    }
    if (dateRangeFilter.type === 'dynamic') {
      const minDate = Temporal.Now.zonedDateTime(calendar, timeZone).add(
        dateRangeFilter.fromNow,
      );

      const parsedDate = Temporal.Instant.from(date).toZonedDateTime({
        calendar,
        timeZone,
      });

      return Temporal.ZonedDateTime.compare(parsedDate, minDate) >= 0;
    }
    assertNever('[getDateRangeFilter] unknown filter:', dateRangeFilter);
  };
}
