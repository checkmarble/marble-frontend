import { type AggregatorOperator } from './modale-operators';

export type AggregatorDataTypeRequirement = 'any' | 'numeric' | 'numeric-or-timestamp';

export interface AggregatorMetadata {
  /** Translation key for the detailed tooltip description */
  tooltipKey: string;
  /** What data types this aggregator accepts */
  dataTypeRequirement: AggregatorDataTypeRequirement;
}

export const aggregatorMetadata: Record<AggregatorOperator, AggregatorMetadata> = {
  COUNT: {
    tooltipKey: 'scenarios:aggregator.count.tooltip',
    dataTypeRequirement: 'any',
  },
  COUNT_DISTINCT: {
    tooltipKey: 'scenarios:aggregator.count_distinct.tooltip',
    dataTypeRequirement: 'any',
  },
  AVG: {
    tooltipKey: 'scenarios:aggregator.average.tooltip',
    dataTypeRequirement: 'numeric',
  },
  SUM: {
    tooltipKey: 'scenarios:aggregator.sum.tooltip',
    dataTypeRequirement: 'numeric',
  },
  MIN: {
    tooltipKey: 'scenarios:aggregator.min.tooltip',
    dataTypeRequirement: 'numeric-or-timestamp',
  },
  MAX: {
    tooltipKey: 'scenarios:aggregator.max.tooltip',
    dataTypeRequirement: 'numeric-or-timestamp',
  },
  STDDEV: {
    tooltipKey: 'scenarios:aggregator.stddev.tooltip',
    dataTypeRequirement: 'numeric',
  },
  PCTILE: {
    tooltipKey: 'scenarios:aggregator.pctile.tooltip',
    dataTypeRequirement: 'numeric',
  },
  MEDIAN: {
    tooltipKey: 'scenarios:aggregator.median.tooltip',
    dataTypeRequirement: 'numeric',
  },
};
