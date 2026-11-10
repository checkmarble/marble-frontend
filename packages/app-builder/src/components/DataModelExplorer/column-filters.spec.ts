import type { DataModelField } from '@app-builder/models/data-model';
import { describe, expect, it } from 'vitest';
import {
  type ColumnFilterValue,
  getColumnFilterKind,
  isColumnFilterActive,
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
    expect(getColumnFilterKind(field({ dataType: 'Bool' }))).toBeNull();
    expect(getColumnFilterKind(field({ dataType: 'Coords' }))).toBeNull();
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
  });
});

describe('toExplorationFilters', () => {
  it('skips inactive filters', () => {
    expect(toExplorationFilters({ name: { type: 'text', value: '' }, amount: { type: 'number' } })).toEqual([]);
  });

  it('maps each kind of filter to the operators of the list endpoint', () => {
    expect(
      toExplorationFilters({
        name: { type: 'text', value: 'ali' },
        status: { type: 'enum', values: ['open', 2] },
        amount: { type: 'number', min: 0, max: 10 },
      }),
    ).toEqual([
      { fieldName: 'name', operator: 'contains', values: ['ali'] },
      { fieldName: 'status', operator: 'in', values: ['open', 2] },
      { fieldName: 'amount', operator: '>=', values: [0] },
      { fieldName: 'amount', operator: '<=', values: [10] },
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
