import {
  NewAggregatorFilterAstNode,
  NewTimestampExtractFilterOptionsAstNode,
  type TimestampExtractFilterAstNode,
} from '@app-builder/models/astNode/aggregation';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { describe, expect, it } from 'vitest';

import {
  addTimestampExtractTimeRange,
  getTimestampExtractPartRanges,
  getTimestampExtractSelectedValues,
  hasEmptyTimestampExtractFilter,
  hasTimestampExtractFilterForField,
  setTimestampExtractPartRanges,
  setTimestampExtractSelectedValues,
  timestampExtractTimePart,
  toAggregationFilterEditModel,
  toAggregationFilters,
} from './edit-model';

function timestampFilter({ part, range }: { part: string; range: [number, number] }): TimestampExtractFilterAstNode {
  return NewAggregatorFilterAstNode({
    namedChildren: {
      tableName: NewConstantAstNode({ constant: 'transactions' }),
      fieldName: NewConstantAstNode({ constant: 'occurred_at' }),
      operator: NewConstantAstNode({ constant: 'TimestampExtract' }),
      value: NewTimestampExtractFilterOptionsAstNode({ part, ranges: [range] }),
    },
  });
}

describe('aggregation filter edit model', () => {
  it('identifies existing timestamp filters for a field while excluding the current filter', () => {
    const january = timestampFilter({ part: 'month', range: [1, 1] });
    const model = toAggregationFilterEditModel([january]);

    expect(hasTimestampExtractFilterForField(model, 'transactions', 'occurred_at')).toBe(true);
    expect(hasTimestampExtractFilterForField(model, 'transactions', 'occurred_at', 0)).toBe(false);
    expect(hasTimestampExtractFilterForField(model, 'transactions', 'created_at')).toBe(false);
  });

  it('identifies timestamp filters without a selected range', () => {
    const model = toAggregationFilterEditModel([]);
    model.push({
      type: 'timestampExtract',
      tableName: 'transactions',
      fieldName: 'occurred_at',
      ranges: [],
      sourceFilters: [],
    });

    expect(hasEmptyTimestampExtractFilter(model)).toBe(true);

    model[0] = {
      ...model[0],
      ranges: [{ part: 'month', range: [1, 1] }],
    } as (typeof model)[number];

    expect(hasEmptyTimestampExtractFilter(model)).toBe(false);
  });

  it('groups timestamp filters by field, drops legacy timezones, and expands their exact ranges on save', () => {
    const january = timestampFilter({ part: 'month', range: [1, 1] });
    Object.assign(january.namedChildren.value.namedChildren, {
      timezone: NewConstantAstNode({ constant: 'Europe/Paris' }),
    });
    const monday = timestampFilter({ part: 'day_of_week', range: [1, 1] });
    const standardFilter = NewAggregatorFilterAstNode({
      namedChildren: {
        tableName: NewConstantAstNode({ constant: 'transactions' }),
        fieldName: NewConstantAstNode({ constant: 'status' }),
        operator: NewConstantAstNode({ constant: '=' }),
        value: NewConstantAstNode({ constant: 'paid' }),
      },
    });

    const model = toAggregationFilterEditModel([january, standardFilter, monday]);

    expect(model).toHaveLength(2);
    expect(model[0]).toMatchObject({
      type: 'timestampExtract',
      tableName: 'transactions',
      fieldName: 'occurred_at',
      ranges: [
        { part: 'month', range: [1, 1] },
        { part: 'day_of_week', range: [1, 1] },
      ],
    });

    const filters = toAggregationFilters(model);

    expect(filters).toHaveLength(3);
    expect(filters[0]?.id).toBe(january.id);
    expect(filters[1]?.id).toBe(monday.id);
    expect((filters[0] as TimestampExtractFilterAstNode).namedChildren.value.namedChildren).not.toHaveProperty(
      'timezone',
    );
    expect((filters[1] as TimestampExtractFilterAstNode).namedChildren.value.namedChildren).not.toHaveProperty(
      'timezone',
    );
    expect((filters[1] as TimestampExtractFilterAstNode).namedChildren.value.namedChildren.part.constant).toBe(
      'day_of_week',
    );
    expect((filters[0] as TimestampExtractFilterAstNode).namedChildren.value.namedChildren.ranges.constant).toEqual([
      [1, 1],
    ]);
  });

  it('omits an empty timestamp editor from the persisted filters', () => {
    const model = toAggregationFilterEditModel([]);
    model.push({
      type: 'timestampExtract',
      tableName: 'transactions',
      fieldName: 'occurred_at',
      ranges: [],
      sourceFilters: [],
    });

    expect(toAggregationFilters(model)).toEqual([]);
  });

  it('expands persisted ranges into selected values and preserves an unchanged range source', () => {
    const januaryToMarch = timestampFilter({ part: 'month', range: [1, 3] });
    const model = toAggregationFilterEditModel([januaryToMarch]);
    const filter = model[0];
    if (!filter || filter.type !== 'timestampExtract') throw new Error('Expected a timestamp extract filter');

    expect(getTimestampExtractSelectedValues(filter.ranges, 'month')).toEqual([1, 2, 3]);

    const normalized = setTimestampExtractSelectedValues(filter, 'month', [1, 2, 3]);

    expect(normalized.ranges).toEqual([
      expect.objectContaining({ part: 'month', range: [1, 3], source: januaryToMarch }),
    ]);
    expect(toAggregationFilters([normalized])[0]?.id).toBe(januaryToMarch.id);
  });

  it('merges contiguous selections and splits a range when a value is removed', () => {
    const januaryToApril = timestampFilter({ part: 'month', range: [1, 4] });
    const mondayToWednesday = timestampFilter({ part: 'day_of_week', range: [1, 3] });
    const model = toAggregationFilterEditModel([januaryToApril, mondayToWednesday]);
    const filter = model[0];
    if (!filter || filter.type !== 'timestampExtract') throw new Error('Expected a timestamp extract filter');

    const withMay = setTimestampExtractSelectedValues(filter, 'month', [1, 2, 3, 4, 5]);
    expect(withMay.ranges).toMatchObject([
      { part: 'month', range: [1, 5] },
      { part: 'day_of_week', range: [1, 3] },
    ]);

    const withoutMarch = setTimestampExtractSelectedValues(filter, 'month', [1, 2, 4]);
    expect(withoutMarch.ranges).toMatchObject([
      { part: 'month', range: [1, 2] },
      { part: 'month', range: [4, 4] },
      { part: 'day_of_week', range: [1, 3] },
    ]);
  });

  it('serializes all ranges for a timestamp part in one filter', () => {
    const january = timestampFilter({ part: 'month', range: [1, 1] });
    const marchToApril = timestampFilter({ part: 'month', range: [3, 4] });
    const monday = timestampFilter({ part: 'day_of_week', range: [1, 1] });

    const filters = toAggregationFilters(toAggregationFilterEditModel([january, marchToApril, monday]));

    expect(filters).toHaveLength(2);
    expect((filters[0] as TimestampExtractFilterAstNode).namedChildren.value.namedChildren).toMatchObject({
      part: { constant: 'month' },
      ranges: {
        constant: [
          [1, 1],
          [3, 4],
        ],
      },
    });
    expect((filters[1] as TimestampExtractFilterAstNode).namedChildren.value.namedChildren).toMatchObject({
      part: { constant: 'day_of_week' },
      ranges: { constant: [[1, 1]] },
    });
  });

  it('normalizes a legacy single range tuple while reading', () => {
    const januaryToMarch = timestampFilter({ part: 'month', range: [1, 3] });
    januaryToMarch.namedChildren.value.namedChildren.ranges.constant = [1, 3] as unknown as [number, number][];

    const filters = toAggregationFilters(toAggregationFilterEditModel([januaryToMarch]));

    expect((filters[0] as TimestampExtractFilterAstNode).namedChildren.value.namedChildren.ranges.constant).toEqual([
      [1, 3],
    ]);
  });

  it('adds, updates, and serializes multiple Hour ranges', () => {
    const model = toAggregationFilterEditModel([]);
    model.push({
      type: 'timestampExtract',
      tableName: 'transactions',
      fieldName: 'occurred_at',
      ranges: [],
      sourceFilters: [],
    });
    const filter = model[0];
    if (!filter || filter.type !== 'timestampExtract') throw new Error('Expected a timestamp extract filter');

    const withDefaultRange = addTimestampExtractTimeRange(filter);
    expect(getTimestampExtractPartRanges(withDefaultRange, timestampExtractTimePart)).toMatchObject([
      { range: [0, 0] },
    ]);

    const withTimeRanges = setTimestampExtractPartRanges(withDefaultRange, timestampExtractTimePart, [
      { part: timestampExtractTimePart, range: [6, 8] },
      { part: timestampExtractTimePart, range: [12, 14] },
    ]);
    const filters = toAggregationFilters([withTimeRanges]);

    expect(filters).toHaveLength(1);
    expect((filters[0] as TimestampExtractFilterAstNode).namedChildren.value.namedChildren).toMatchObject({
      part: { constant: 'hour' },
      ranges: {
        constant: [
          [6, 8],
          [12, 14],
        ],
      },
    });
  });
});
