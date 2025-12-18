import { type ValidTimestampExtractParts, validTimestampExtractParts } from './astNode/time';

export const aggregatorOperators = [
  'AVG',
  'COUNT',
  'COUNT_DISTINCT',
  'MAX',
  'MIN',
  'SUM',
  'STDDEV',
  'PCTILE',
  'MEDIAN',
] as const;
export type AggregatorOperator = (typeof aggregatorOperators)[number];

export function isAggregatorOperator(value: string): value is AggregatorOperator {
  return (aggregatorOperators as ReadonlyArray<string>).includes(value);
}

export const aggregatorsWithParams = ['PCTILE'] as const;

export function aggregatorHasParams(aggregator: AggregatorOperator): boolean {
  return (aggregatorsWithParams as ReadonlyArray<AggregatorOperator>).includes(aggregator);
}

export const restrictedAggregators = ['STDDEV', 'PCTILE', 'MEDIAN'] as const;

export function isRestrictedAggregator(aggregator: AggregatorOperator): boolean {
  return (restrictedAggregators as ReadonlyArray<AggregatorOperator>).includes(aggregator);
}

export const performanceHeavyAggregators = ['PCTILE', 'MEDIAN'] as const;

export function isPerformanceHeavyAggregator(aggregator: AggregatorOperator): boolean {
  return (performanceHeavyAggregators as ReadonlyArray<AggregatorOperator>).includes(aggregator);
}

export const timeAddOperators = ['+', '-'] as const;
export type TimeAddOperator = (typeof timeAddOperators)[number];

export function isTimeAddOperator(value: string): value is TimeAddOperator {
  return (timeAddOperators as ReadonlyArray<string>).includes(value);
}

export function isTimestampPart(value: string): value is ValidTimestampExtractParts {
  return validTimestampExtractParts.includes(value as ValidTimestampExtractParts);
}
