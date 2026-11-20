import { CLIENT_DATA_LIST_MAX_FILTER_VALUES, type DataModelField } from '@app-builder/models/data-model';
import { resolveEnumValues } from '@app-builder/models/enum-values';
import { describe, expect, it } from 'vitest';
import {
  type ColumnFilterValue,
  getCatalogVariants,
  getColumnFilterKind,
  getEnumFilterField,
  getNumberFilterScale,
  isColumnFilterActive,
  MAX_CATALOG_PICKS,
  toEnumFilter,
  toExplorationFilters,
} from './column-filters';

const now = new Date('2026-06-15T12:00:00Z');
const field = (partial: Partial<DataModelField>) => ({ isEnum: false, ...partial }) as DataModelField;
const staticRange = (startDate: string, endDate: string): ColumnFilterValue => ({
  type: 'date',
  range: { type: 'static', startDate, endDate },
});

describe('getColumnFilterKind', () => {
  it('maps a field to its filter kind, enums first', () => {
    expect(getColumnFilterKind(field({ dataType: 'Int', isEnum: true }))).toBe('enum');
    expect(getColumnFilterKind(field({ dataType: 'String', semanticType: 'enum' }))).toBe('enum');
    expect(getColumnFilterKind(field({ dataType: 'Int' }))).toBe('number');
    expect(getColumnFilterKind(field({ dataType: 'Float' }))).toBe('number');
    expect(getColumnFilterKind(field({ dataType: 'Timestamp' }))).toBe('date');
    expect(getColumnFilterKind(field({ dataType: 'String' }))).toBe('text');
    expect(getColumnFilterKind(field({ dataType: 'IpAddress' }))).toBe('text');
    expect(getColumnFilterKind(field({ dataType: 'Bool' }))).toBe('boolean');
    expect(getColumnFilterKind(field({ dataType: 'Bool[]' }))).toBeNull();
    expect(getColumnFilterKind(field({ dataType: 'Coords' }))).toBeNull();
  });

  it('picks country and currency codes from their catalog, as the cells show names', () => {
    expect(getColumnFilterKind(field({ dataType: 'String', semanticType: 'country' }))).toBe('enum');
    expect(getColumnFilterKind(field({ dataType: 'String', semanticType: 'currency_code' }))).toBe('enum');
    // A legacy enum lists its stored values, and a stale sub type of a field that is no longer an enum does not count.
    expect(toEnumFilter(field({ dataType: 'String', semanticType: 'country', isEnum: true }), ['FR'])).toEqual({
      type: 'enum',
      values: ['FR'],
    });
    expect(getColumnFilterKind(field({ dataType: 'String', semanticType: 'text', semanticSubType: 'country' }))).toBe(
      'text',
    );
  });
});

describe('getEnumFilterField', () => {
  it('gives country and currency columns the sub type the enum menu reads its catalog from', () => {
    const country = getEnumFilterField(field({ dataType: 'String', semanticType: 'country' }));
    expect(country.semanticSubType).toBe('country');
    expect(resolveEnumValues(country).values).toContain('FR');
    expect(getEnumFilterField(field({ dataType: 'String', semanticType: 'currency_code' })).semanticSubType).toBe(
      'currency',
    );
    const plain = field({ dataType: 'String', semanticType: 'text' });
    expect(getEnumFilterField(plain)).toBe(plain);
  });
});

describe('getCatalogVariants', () => {
  it('country: alpha-2 and alpha-3, upper and lower case, whatever the format picked', () => {
    expect(getCatalogVariants('country', 'FR')).toEqual(['FR', 'fr', 'FRA', 'fra']);
    expect(getCatalogVariants('country', 'fra')).toEqual(['FR', 'fr', 'FRA', 'fra']);
  });

  it('currency: ISO code in both cases and the numeric code, with and without its leading zeros', () => {
    expect(getCatalogVariants('currency', 'EUR')).toEqual(['EUR', 'eur', '978']);
    expect(getCatalogVariants('currency', '978')).toEqual(['EUR', 'eur', '978']);
    expect(getCatalogVariants('currency', '008')).toEqual(['ALL', 'all', '008', '8']);
  });

  it('keeps a value outside the catalog as it was picked', () => {
    expect(getCatalogVariants('country', 'ZZZ')).toEqual(['ZZZ']);
    expect(getCatalogVariants('currency', 'CUSTOM')).toEqual(['CUSTOM']);
  });
});

describe('toEnumFilter', () => {
  const countryField = field({ dataType: 'String', semanticType: 'country' });
  const countries = resolveEnumValues(getEnumFilterField(countryField)).values;

  it('caps catalog picks so that all their spellings fit in one filter', () => {
    const filter = toEnumFilter(countryField, countries.slice(0, MAX_CATALOG_PICKS + 5));
    expect(filter).toMatchObject({ catalog: 'country', values: countries.slice(0, MAX_CATALOG_PICKS) });
    const [sent] = toExplorationFilters({ country: filter });
    expect(sent?.values.length).toBeLessThanOrEqual(CLIENT_DATA_LIST_MAX_FILTER_VALUES);
  });

  it('stamps the catalog of enums declared as country or currency, on String fields only', () => {
    const currency = field({ dataType: 'String', semanticType: 'enum', semanticSubType: 'currency' });
    expect(toEnumFilter(currency, ['EUR'])).toEqual({ type: 'enum', values: ['EUR'], catalog: 'currency' });
    expect(toEnumFilter({ ...currency, dataType: 'Int' }, [978])).toEqual({ type: 'enum', values: [978] });
  });

  it('caps other enums at the limit of the endpoint', () => {
    const values = Array.from({ length: CLIENT_DATA_LIST_MAX_FILTER_VALUES + 5 }, (_, i) => `v${i}`);
    const filter = toEnumFilter(field({ dataType: 'String', isEnum: true }), values);
    expect(filter).toEqual({ type: 'enum', values: values.slice(0, CLIENT_DATA_LIST_MAX_FILTER_VALUES) });
  });
});

describe('isColumnFilterActive', () => {
  it('is false for empty filters', () => {
    expect(isColumnFilterActive(undefined)).toBe(false);
    expect(isColumnFilterActive({ type: 'text', value: '' })).toBe(false);
    expect(isColumnFilterActive({ type: 'enum', values: [] })).toBe(false);
    expect(isColumnFilterActive({ type: 'number' })).toBe(false);
    expect(isColumnFilterActive(staticRange('', ''))).toBe(false);
  });

  it('is true as soon as one bound is set, 0 included', () => {
    expect(isColumnFilterActive({ type: 'number', min: 0 })).toBe(true);
    expect(isColumnFilterActive(staticRange('2026-06-01T00:00:00Z', ''))).toBe(true);
    expect(isColumnFilterActive({ type: 'date', range: { type: 'dynamic', fromNow: '-P7D' } })).toBe(true);
    expect(isColumnFilterActive({ type: 'boolean', value: false })).toBe(true);
  });
});

describe('getNumberFilterScale', () => {
  it('converts the unit shown in the cells to the stored one', () => {
    expect(getNumberFilterScale(field({ dataType: 'Int', semanticType: 'monetary_amount', currencyExponent: 2 }))).toBe(
      100,
    );
    expect(getNumberFilterScale(field({ dataType: 'Float', semanticType: 'percentage' }))).toBe(0.01);
    expect(getNumberFilterScale(field({ dataType: 'Float', semanticType: 'monetary_amount' }))).toBeUndefined();
    expect(getNumberFilterScale(field({ dataType: 'Int', semanticType: 'number' }))).toBeUndefined();
  });
});

describe('toExplorationFilters', () => {
  it('sends number bounds in the stored unit', () => {
    expect(
      toExplorationFilters({
        amount: { type: 'number', min: 19.99, max: 100, scale: 100 },
        score: { type: 'number', min: 12.5, scale: 0.01 },
      }),
    ).toEqual([
      { fieldName: 'amount', operator: '>=', values: [1999] },
      { fieldName: 'amount', operator: '<=', values: [10000] },
      { fieldName: 'score', operator: '>=', values: [0.125] },
    ]);
  });

  it('skips inactive filters', () => {
    expect(toExplorationFilters({ name: { type: 'text', value: '' }, amount: { type: 'number' } })).toEqual([]);
  });

  it('maps each kind of filter to the operators of the list endpoint', () => {
    expect(
      toExplorationFilters({
        name: { type: 'text', value: 'ali' },
        status: { type: 'enum', values: ['open', 2] },
        amount: { type: 'number', min: 0, max: 10 },
        is_fraud: { type: 'boolean', value: false },
      }),
    ).toEqual([
      { fieldName: 'name', operator: 'contains', values: ['ali'] },
      { fieldName: 'status', operator: 'in', values: ['open', 2] },
      { fieldName: 'amount', operator: '>=', values: [0] },
      { fieldName: 'amount', operator: '<=', values: [10] },
      { fieldName: 'is_fraud', operator: 'in', values: ['false'] },
    ]);
  });

  it('enum: sends the stored spellings of catalog picks, once each', () => {
    expect(
      toExplorationFilters({
        country: { type: 'enum', values: ['FR', 'FRA', 'DE'], catalog: 'country' },
        currency: { type: 'enum', values: ['EUR'], catalog: 'currency' },
      }),
    ).toEqual([
      { fieldName: 'country', operator: 'in', values: ['FR', 'fr', 'FRA', 'fra', 'DE', 'de', 'DEU', 'deu'] },
      { fieldName: 'currency', operator: 'in', values: ['EUR', 'eur', '978'] },
    ]);
  });

  it('date: static range is start inclusive and end exclusive, open bounds are dropped', () => {
    expect(toExplorationFilters({ at: staticRange('2026-06-01T00:00:00.000Z', '2026-06-03T00:00:00.000Z') })).toEqual([
      { fieldName: 'at', operator: '>=', values: ['2026-06-01T00:00:00.000Z'] },
      { fieldName: 'at', operator: '<', values: ['2026-06-03T00:00:00.000Z'] },
    ]);
    expect(toExplorationFilters({ at: staticRange('', '2026-06-03T00:00:00.000Z') })).toEqual([
      { fieldName: 'at', operator: '<', values: ['2026-06-03T00:00:00.000Z'] },
    ]);
  });

  it('date: dynamic range becomes an absolute lower bound', () => {
    expect(toExplorationFilters({ at: { type: 'date', range: { type: 'dynamic', fromNow: '-P7D' } } }, now)).toEqual([
      { fieldName: 'at', operator: '>=', values: ['2026-06-08T12:00:00.000Z'] },
    ]);
  });
});
