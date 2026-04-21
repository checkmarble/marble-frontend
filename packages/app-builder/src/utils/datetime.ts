import { Temporal } from 'temporal-polyfill';
import { assertNever } from 'typescript-utils';

import { type DateRangeFilter } from './schema/filterSchema';

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
