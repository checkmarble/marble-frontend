import type { Row, RowData } from '@tanstack/react-table';

import { getDateRangeFilter } from './datetime';
import type { DateRangeFilter } from './schema/filterSchema';

export function dateRangeFilterFn<TData extends RowData>(
  row: Row<TData>,
  columnId: string,
  filterValue?: DateRangeFilter,
) {
  if (!filterValue) return true;
  const dateRangeFilter = getDateRangeFilter(filterValue);
  const date = row.getValue<string>(columnId);
  return dateRangeFilter(date);
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
