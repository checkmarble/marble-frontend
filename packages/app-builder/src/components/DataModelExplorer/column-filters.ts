import type { DateRangeFilterType } from '@app-builder/components/Filters/DateRangeFilter';
import {
  type ClientDataListFilter,
  type DataModelField,
  EnumDataTypes,
  type EnumValue,
} from '@app-builder/models/data-model';
import { isEnumField } from '@app-builder/models/enum-values';
import { add } from 'date-fns/add';
import * as R from 'remeda';
import { Temporal } from 'temporal-polyfill';

export type ColumnFilterValue =
  | { type: 'text'; value: string }
  | { type: 'enum'; values: EnumValue[] }
  | { type: 'number'; min?: number; max?: number }
  | { type: 'date'; range: NonNullable<DateRangeFilterType> };

/** Keyed by `field.name`. */
export type ColumnFilters = Record<string, ColumnFilterValue>;

export function getColumnFilterKind(field: DataModelField): ColumnFilterValue['type'] | null {
  // The list endpoint only accepts a list of values on these data types.
  if (isEnumField(field) && EnumDataTypes.includes(field.dataType)) return 'enum';
  switch (field.dataType) {
    case 'Int':
    case 'Float':
      return 'number';
    case 'Timestamp':
      return 'date';
    case 'String':
    case 'IpAddress':
      return 'text';
    default:
      return null;
  }
}

export function isColumnFilterActive(filter: ColumnFilterValue | undefined): boolean {
  switch (filter?.type) {
    case 'text':
      return filter.value !== '';
    case 'enum':
      return filter.values.length > 0;
    case 'number':
      return filter.min !== undefined || filter.max !== undefined;
    case 'date':
      // The calendar emits empty bounds while a range is being picked or after a deselect.
      return filter.range.type === 'static'
        ? Boolean(filter.range.startDate || filter.range.endDate)
        : Boolean(filter.range.fromNow);
    default:
      return false;
  }
}

/** Sets the filter of a column, or removes it when there is no value. */
export function setColumnFilter(
  filters: ColumnFilters,
  fieldName: string,
  value: ColumnFilterValue | undefined,
): ColumnFilters {
  return value ? { ...filters, [fieldName]: value } : R.omit(filters, [fieldName]);
}

/** Translates the active column filters into the filters of the list endpoint. */
export function toExplorationFilters(filters: ColumnFilters, now: Date = new Date()): ClientDataListFilter[] {
  return Object.entries(filters).flatMap(([fieldName, filter]): ClientDataListFilter[] => {
    if (!isColumnFilterActive(filter)) return [];

    switch (filter.type) {
      case 'text':
        return [{ fieldName, operator: 'contains', values: [filter.value] }];
      case 'enum':
        return [{ fieldName, operator: 'in', values: filter.values }];
      case 'number':
        return [
          ...(filter.min !== undefined ? [{ fieldName, operator: '>=' as const, values: [filter.min] }] : []),
          ...(filter.max !== undefined ? [{ fieldName, operator: '<=' as const, values: [filter.max] }] : []),
        ];
      case 'date': {
        const { range } = filter;
        // `fromNow` is a negative ISO-8601 duration: keep what is more recent than now + fromNow.
        if (range.type === 'dynamic') {
          const start = add(now, Temporal.Duration.from(range.fromNow)).toISOString();
          return [{ fieldName, operator: '>=', values: [start] }];
        }
        // DateRangeFilter stores the end as the day after the one picked, hence the exclusive bound.
        return [
          ...(range.startDate ? [{ fieldName, operator: '>=' as const, values: [range.startDate] }] : []),
          ...(range.endDate ? [{ fieldName, operator: '<' as const, values: [range.endDate] }] : []),
        ];
      }
    }
  });
}
