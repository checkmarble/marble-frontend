import {
  type ValidTimestampExtractParts,
  validTimestampExtractParts,
} from './astNode/time';

export const aggregatorOperators = [
  'AVG',
  'COUNT',
  'COUNT_DISTINCT',
  'MAX',
  'MIN',
  'SUM',
] as const;
export type AggregatorOperator = (typeof aggregatorOperators)[number];

export function isAggregatorOperator(
  value: string,
): value is AggregatorOperator {
  return (aggregatorOperators as ReadonlyArray<string>).includes(value);
}

export const aggregationFilterOperators = [
  '=',
  '!=',
  '>',
  '<',
  '>=',
  '<=',
  'IsInList',
  'IsNotInList',
] as const;
export type AggregationFilterOperator =
  (typeof aggregationFilterOperators)[number];

export function isAggregationFilterOperator(
  value: string,
): value is AggregationFilterOperator {
  return (aggregationFilterOperators as ReadonlyArray<string>).includes(value);
}

export const timeAddOperators = ['+', '-'] as const;
export type TimeAddOperator = (typeof timeAddOperators)[number];

export function isTimeAddOperator(value: string): value is TimeAddOperator {
  return (timeAddOperators as ReadonlyArray<string>).includes(value);
}

export function isTimestampPart(
  value: string,
): value is ValidTimestampExtractParts {
  return validTimestampExtractParts.includes(
    value as ValidTimestampExtractParts,
  );
}
