import type { DateRangeFilterType } from '@app-builder/components/Filters/DateRangeFilter';
import {
  CLIENT_DATA_LIST_MAX_FILTER_VALUES,
  type ClientDataListFilter,
  type DataModelField,
  EnumDataTypes,
  type EnumValue,
} from '@app-builder/models/data-model';
import { isEnumField, resolveCountry, resolveCurrency } from '@app-builder/models/enum-values';
import { add } from 'date-fns/add';
import * as R from 'remeda';
import { Temporal } from 'temporal-polyfill';

export type FilterCatalog = 'country' | 'currency';

export type ColumnFilterValue =
  | { type: 'text'; value: string }
  // `catalog` tells toExplorationFilters, which does not see the field, to send the stored spellings of each pick.
  | { type: 'enum'; values: EnumValue[]; catalog?: FilterCatalog }
  // `scale` turns the bounds typed in the unit the cells show into stored values (see getNumberFilterScale).
  | { type: 'number'; min?: number; max?: number; scale?: number }
  | { type: 'date'; range: NonNullable<DateRangeFilterType> }
  | { type: 'boolean'; value: boolean };

/** Keyed by `field.name`. */
export type ColumnFilters = Record<string, ColumnFilterValue>;

/** Each catalog pick is sent with up to 4 spellings (see getCatalogVariants). */
export const MAX_CATALOG_PICKS = CLIENT_DATA_LIST_MAX_FILTER_VALUES / 4;

/**
 * Country and currency columns display names: they are filtered by picking from the catalog of codes.
 * Other enums keep their own values, which are stored spellings.
 */
export function getFilterCatalog(field: DataModelField): FilterCatalog | undefined {
  if (field.dataType !== 'String') return undefined;
  const type = isEnumField(field) ? field.semanticSubType : field.semanticType;
  if (type === 'country') return 'country';
  if (type === 'currency' || type === 'currency_code') return 'currency';
  return undefined;
}

/** The field as the enum menu and tags must see it: they read the catalog from `semanticSubType`. */
export function getEnumFilterField(field: DataModelField): DataModelField {
  const catalog = getFilterCatalog(field);
  return catalog ? { ...field, semanticSubType: catalog } : field;
}

export function getColumnFilterKind(field: DataModelField): ColumnFilterValue['type'] | null {
  // The list endpoint only accepts a list of values on these data types.
  if ((isEnumField(field) && EnumDataTypes.includes(field.dataType)) || getFilterCatalog(field)) return 'enum';
  switch (field.dataType) {
    case 'Int':
    case 'Float':
      return 'number';
    case 'Timestamp':
      return 'date';
    case 'String':
    case 'IpAddress':
      return 'text';
    case 'Bool':
      return 'boolean';
    default:
      return null;
  }
}

/**
 * The cells show amounts divided by 10^currencyExponent and percentages multiplied by 100 (DataField), while
 * the list endpoint compares stored values: the factor from the unit shown to the stored one, if any.
 */
export function getNumberFilterScale(field: DataModelField): number | undefined {
  if (field.semanticType === 'percentage') return 0.01;
  if (field.semanticType === 'monetary_amount' && field.currencyExponent) return 10 ** field.currencyExponent;
  return undefined;
}

// 15 significant digits drop the binary noise of the product (19.99 * 100 = 1998.9999999999998).
const toStoredNumber = (value: number, scale: number | undefined) =>
  scale ? Number((value * scale).toPrecision(15)) : value;

/** How many values a filter on this field can hold: each catalog pick is sent with up to 4 spellings. */
export function getMaxEnumPicks(field: DataModelField): number {
  return getFilterCatalog(field) ? MAX_CATALOG_PICKS : CLIENT_DATA_LIST_MAX_FILTER_VALUES;
}

export function toEnumFilter(field: DataModelField, values: EnumValue[]): ColumnFilterValue {
  const catalog = getFilterCatalog(field);
  return {
    type: 'enum',
    values: values.slice(0, getMaxEnumPicks(field)),
    catalog,
  };
}

/**
 * The spellings a picked code may be stored with: "in" is an exact match, and a column may hold
 * alpha-2 or alpha-3 countries, ISO or numeric currencies, in either case.
 */
export function getCatalogVariants(catalog: FilterCatalog, value: EnumValue): string[] {
  const raw = String(value);
  if (catalog === 'country') {
    const country = resolveCountry(raw);
    return country ? [country.isoAlpha2, country.isoAlpha3].flatMap((code) => [code, code.toLowerCase()]) : [raw];
  }
  const currency = resolveCurrency(raw);
  if (!currency) return [raw];
  // A numeric code ingested from an integer loses its leading zeros ("8" for "008").
  return R.unique([currency.code, currency.code.toLowerCase(), currency.number, String(Number(currency.number))]);
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
    case 'boolean':
      return true;
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
      case 'enum': {
        const { catalog } = filter;
        const values = catalog
          ? R.unique(filter.values.flatMap((value) => getCatalogVariants(catalog, value)))
          : filter.values;
        return [{ fieldName, operator: 'in', values }];
      }
      case 'number': {
        const { min, max, scale } = filter;
        return [
          ...(min !== undefined ? [{ fieldName, operator: '>=' as const, values: [toStoredNumber(min, scale)] }] : []),
          ...(max !== undefined ? [{ fieldName, operator: '<=' as const, values: [toStoredNumber(max, scale)] }] : []),
        ];
      }
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
      case 'boolean':
        // The API values are strings or numbers. A null cell matches neither value.
        return [{ fieldName, operator: 'in', values: [String(filter.value)] }];
    }
  });
}
