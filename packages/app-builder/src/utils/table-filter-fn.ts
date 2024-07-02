import { type Row, type RowData } from '@tanstack/react-table';
import { Temporal } from 'temporal-polyfill';

import { type DateRangeFilter } from './schema/filterSchema';

export function dateRangeFilterFn<TData extends RowData>(
  row: Row<TData>,
  columnId: string,
  filterValue?: DateRangeFilter,
) {
  if (!filterValue) return true;
  const date = row.getValue<string>(columnId);
  if (filterValue.type === 'static') {
    if (filterValue.startDate && filterValue.startDate > date) return false;
    if (filterValue.endDate && filterValue.endDate < date) return false;
    return true;
  }
  if (filterValue.type === 'dynamic') {
    const dateInstant = Temporal.Instant.from(date);
    const now = Temporal.Now.instant();
    const durationFromNow = Temporal.Duration.from(filterValue.fromNow);

    return (
      Temporal.Duration.compare(now.until(dateInstant), durationFromNow) >= 0
    );
  }
  return false;
}

export function arrIncludesExactSome<TData extends RowData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string[],
) {
  if (!filterValue) return true;
  const value = row.getValue<string>(columnId);
  return filterValue.some((filter) => filter === value);
}
