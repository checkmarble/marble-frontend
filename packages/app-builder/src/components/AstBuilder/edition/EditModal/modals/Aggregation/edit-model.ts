import {
  type AggregationFilterAstNode,
  type AggregationFilterOperator,
  type BinaryAggregationFilterAstNode,
  type FuzzyMatchFilterAstNode,
  isBinaryAggregationFilter,
  isComplexAggregationFilter,
  isFuzzyMatchFilterOptionsAstNode,
  isTimestampExtractFilterOptionsAstNode,
  NewAggregatorFilterAstNode,
  NewFuzzyMatchFilterOptionsAstNode,
  NewTimestampExtractFilterOptionsAstNode,
  type TimestampExtractFilterAstNode,
  type UnaryAggregationFilterAstNode,
} from '@app-builder/models/astNode/aggregation';
import { NewUndefinedAstNode } from '@app-builder/models/astNode/ast-node';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';

export const timestampExtractParts = ['month', 'day_of_week'] as const;
export type TimestampExtractPart = (typeof timestampExtractParts)[number];
export const timestampExtractTimePart = 'hour';

export type AggregationFilterEditModel = StandardAggregationFilterEditModel | TimestampExtractFilterEditModel;

export type StandardAggregationFilterEditModel = {
  type: 'standard';
  filter: Exclude<AggregationFilterAstNode, TimestampExtractFilterAstNode>;
};

export type TimestampExtractRangeEditModel = {
  part: string;
  range: [number, number];
  source?: TimestampExtractFilterAstNode;
};

export type TimestampExtractFilterEditModel = {
  type: 'timestampExtract';
  tableName: string | null;
  fieldName: string | null;
  ranges: TimestampExtractRangeEditModel[];
  sourceFilters: TimestampExtractFilterAstNode[];
  seed?: AggregationFilterAstNode;
};

export function hasTimestampExtractFilterForField(
  filters: AggregationFilterEditModel[],
  tableName: string | null,
  fieldName: string | null,
  excludedFilterIndex?: number,
) {
  return filters.some(
    (filter, index) =>
      index !== excludedFilterIndex &&
      filter.type === 'timestampExtract' &&
      filter.tableName === tableName &&
      filter.fieldName === fieldName,
  );
}

export function hasEmptyTimestampExtractFilter(filters: AggregationFilterEditModel[]) {
  return filters.some((filter) => filter.type === 'timestampExtract' && filter.ranges.length === 0);
}

export function getTimestampExtractPartRanges(
  filter: TimestampExtractFilterEditModel,
  part: string,
): TimestampExtractRangeEditModel[] {
  return filter.ranges.filter((range) => range.part === part);
}

export function setTimestampExtractPartRanges(
  filter: TimestampExtractFilterEditModel,
  part: string,
  ranges: TimestampExtractRangeEditModel[],
): TimestampExtractFilterEditModel {
  const normalizedRanges = ranges.map((range) => ({
    ...range,
    part,
    source:
      range.source ??
      filter.ranges.find((current) => current.part === part && isSameRange(current.range, range.range))?.source,
  }));
  const nextRanges: TimestampExtractRangeEditModel[] = [];
  let replacedPart = false;

  for (const range of filter.ranges) {
    if (range.part !== part) {
      nextRanges.push(range);
      continue;
    }

    if (!replacedPart) {
      nextRanges.push(...normalizedRanges);
      replacedPart = true;
    }
  }

  if (!replacedPart) nextRanges.push(...normalizedRanges);

  return { ...filter, ranges: nextRanges };
}

export function addTimestampExtractTimeRange(filter: TimestampExtractFilterEditModel): TimestampExtractFilterEditModel {
  return setTimestampExtractPartRanges(filter, timestampExtractTimePart, [
    ...getTimestampExtractPartRanges(filter, timestampExtractTimePart),
    { part: timestampExtractTimePart, range: [0, 0] },
  ]);
}

export function getTimestampExtractSelectedValues(
  ranges: TimestampExtractRangeEditModel[],
  part: TimestampExtractPart,
): number[] {
  const values = new Set<number>();

  for (const range of ranges) {
    if (range.part !== part) continue;

    const [start, end] = range.range[0] <= range.range[1] ? range.range : [range.range[1], range.range[0]];
    for (let value = start; value <= end; value += 1) {
      values.add(value);
    }
  }

  return [...values].sort((left, right) => left - right);
}

export function setTimestampExtractSelectedValues(
  filter: TimestampExtractFilterEditModel,
  part: TimestampExtractPart,
  selectedValues: Iterable<number>,
): TimestampExtractFilterEditModel {
  const ranges = getContiguousRanges(selectedValues).map((range) => ({
    part,
    range,
    source: filter.ranges.find((current) => current.part === part && isSameRange(current.range, range))?.source,
  }));
  return setTimestampExtractPartRanges(filter, part, ranges);
}

export function toAggregationFilterEditModel(filters: AggregationFilterAstNode[]): AggregationFilterEditModel[] {
  const timestampGroups = new Map<string, TimestampExtractFilterEditModel>();
  const model: AggregationFilterEditModel[] = [];

  for (const filter of filters) {
    if (filter.namedChildren.operator.constant !== 'TimestampExtract') {
      model.push({ type: 'standard', filter: filter as StandardAggregationFilterEditModel['filter'] });
      continue;
    }

    const tableName = filter.namedChildren.tableName.constant;
    const fieldName = filter.namedChildren.fieldName.constant;
    const timestampFilter = filter as TimestampExtractFilterAstNode;
    const value = timestampFilter.namedChildren.value;
    const key = `${tableName ?? ''}\u0000${fieldName ?? ''}`;
    let group = timestampGroups.get(key);

    if (!group) {
      group = {
        type: 'timestampExtract',
        tableName,
        fieldName,
        ranges: [],
        sourceFilters: [],
      };
      timestampGroups.set(key, group);
      model.push(group);
    }

    group.sourceFilters.push(timestampFilter);
    if (isTimestampExtractFilterOptionsAstNode(value)) {
      for (const range of getTimestampExtractRanges(value.namedChildren.ranges.constant)) {
        group.ranges.push({
          part: value.namedChildren.part.constant,
          range,
          source: timestampFilter,
        });
      }
    }
  }

  return model;
}

export function toAggregationFilters(model: AggregationFilterEditModel[]): AggregationFilterAstNode[] {
  return model.reduce<AggregationFilterAstNode[]>((filters, filter) => {
    if (filter.type === 'standard') {
      filters.push(filter.filter);
    } else {
      const rangesByPart = new Map<string, TimestampExtractRangeEditModel[]>();
      for (const range of filter.ranges) {
        const ranges = rangesByPart.get(range.part) ?? [];
        ranges.push(range);
        rangesByPart.set(range.part, ranges);
      }
      filters.push(...[...rangesByPart.values()].map((ranges) => createTimestampExtractFilter(filter, ranges)));
    }
    return filters;
  }, []);
}

export function createTimestampExtractEditModel(filter: AggregationFilterAstNode): TimestampExtractFilterEditModel {
  return {
    type: 'timestampExtract',
    tableName: filter.namedChildren.tableName.constant,
    fieldName: filter.namedChildren.fieldName.constant,
    ranges: [],
    sourceFilters: [],
    seed: filter,
  };
}

export function createStandardFilterEditModel(
  filter: AggregationFilterAstNode,
  operator: Exclude<AggregationFilterOperator, 'TimestampExtract'> | null,
): StandardAggregationFilterEditModel {
  const value = getFilterOperand(filter);
  const tableName = filter.namedChildren.tableName;
  const fieldName = filter.namedChildren.fieldName;
  if (operator === 'IsEmpty' || operator === 'IsNotEmpty') {
    return {
      type: 'standard',
      filter: preserveFilterId(
        filter,
        NewAggregatorFilterAstNode<UnaryAggregationFilterAstNode>({
          namedChildren: { tableName, fieldName, operator: NewConstantAstNode({ constant: operator }) },
        }),
      ),
    };
  }

  if (operator === 'IsMultipleOf') {
    return {
      type: 'standard',
      filter: preserveFilterId(
        filter,
        NewAggregatorFilterAstNode({
          namedChildren: {
            tableName,
            fieldName,
            operator: NewConstantAstNode({ constant: 'IsMultipleOf' }),
            value: NewConstantAstNode({ constant: 10 }),
          },
        }),
      ),
    };
  }

  if (operator === 'FuzzyMatch') {
    return {
      type: 'standard',
      filter: preserveFilterId(
        filter,
        NewAggregatorFilterAstNode<FuzzyMatchFilterAstNode>({
          namedChildren: {
            tableName,
            fieldName,
            operator: NewConstantAstNode({ constant: 'FuzzyMatch' }),
            value: NewFuzzyMatchFilterOptionsAstNode({ value }),
          },
        }),
      ),
    };
  }

  return {
    type: 'standard',
    filter: preserveFilterId(
      filter,
      NewAggregatorFilterAstNode<BinaryAggregationFilterAstNode>({
        namedChildren: {
          tableName,
          fieldName,
          operator: NewConstantAstNode({ constant: operator }),
          value,
        },
      }),
    ),
  };
}

export function getFilterOperand(filter: AggregationFilterAstNode): KnownOperandAstNode {
  if (isBinaryAggregationFilter(filter)) return filter.namedChildren.value;
  if (isComplexAggregationFilter(filter) && isFuzzyMatchFilterOptionsAstNode(filter.namedChildren.value)) {
    return filter.namedChildren.value.namedChildren.value;
  }
  return NewUndefinedAstNode();
}

function createTimestampExtractFilter(
  group: TimestampExtractFilterEditModel,
  ranges: TimestampExtractRangeEditModel[],
): TimestampExtractFilterAstNode {
  const [firstRange] = ranges;
  if (!firstRange) throw new Error('TimestampExtract filters require at least one range');

  const source = ranges.find((range) => range.source)?.source ?? group.seed;
  const timestampSource =
    source?.namedChildren.operator.constant === 'TimestampExtract'
      ? (source as TimestampExtractFilterAstNode)
      : undefined;
  const sourceValue =
    timestampSource && isTimestampExtractFilterOptionsAstNode(timestampSource.namedChildren.value)
      ? timestampSource.namedChildren.value
      : undefined;
  const filter = NewAggregatorFilterAstNode<TimestampExtractFilterAstNode>({
    namedChildren: {
      tableName: source
        ? { ...source.namedChildren.tableName, constant: group.tableName }
        : NewConstantAstNode({ constant: group.tableName }),
      fieldName: source
        ? { ...source.namedChildren.fieldName, constant: group.fieldName }
        : NewConstantAstNode({ constant: group.fieldName }),
      operator: NewConstantAstNode({ constant: 'TimestampExtract' }),
      value: sourceValue
        ? {
            ...sourceValue,
            namedChildren: {
              part: { ...sourceValue.namedChildren.part, constant: firstRange.part },
              ranges: { ...sourceValue.namedChildren.ranges, constant: ranges.map((range) => range.range) },
            },
          }
        : NewTimestampExtractFilterOptionsAstNode({
            part: firstRange.part,
            ranges: ranges.map((range) => range.range),
          }),
    },
  });

  return source ? { ...filter, id: source.id } : filter;
}

function preserveFilterId<T extends AggregationFilterAstNode>(source: AggregationFilterAstNode, filter: T): T {
  return { ...filter, id: source.id };
}

function getContiguousRanges(selectedValues: Iterable<number>): [number, number][] {
  const values = [...new Set(selectedValues)].sort((left, right) => left - right);
  if (values.length === 0) return [];

  const ranges: [number, number][] = [];
  let start = values[0]!;
  let end = start;

  for (const value of values.slice(1)) {
    if (value === end + 1) {
      end = value;
      continue;
    }

    ranges.push([start, end]);
    start = value;
    end = value;
  }

  ranges.push([start, end]);
  return ranges;
}

function isSameRange(left: [number, number], right: [number, number]) {
  return left[0] === right[0] && left[1] === right[1];
}

function getTimestampExtractRanges(ranges: [number, number][]): [number, number][] {
  if (Array.isArray(ranges[0])) return ranges;

  return [ranges as unknown as [number, number]];
}
