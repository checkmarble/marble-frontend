import {
  type AggregationAstNode,
  type LabelledAst,
  NewAggregatorAstNode,
} from '@app-builder/models';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function newAggregatorLabelledAst(
  nodeOrAggregator: string | AggregationAstNode,
): LabelledAst {
  if (typeof nodeOrAggregator === 'string') {
    return {
      name: getAggregatorName(nodeOrAggregator),
      description: '',
      operandType: 'Function',
      //TODO(combobox): infer/get aggregator.dataType
      dataType: 'unknown',
      astNode: NewAggregatorAstNode(nodeOrAggregator),
    };
  }
  return {
    name: getAggregationDisplayName(nodeOrAggregator),
    description: '',
    operandType: 'Function',
    //TODO(combobox): infer/get aggregator.dataType
    dataType: 'unknown',
    astNode: NewAggregatorAstNode(
      nodeOrAggregator.namedChildren.aggregator.constant,
    ),
  };
}

export const allAggregators: string[] = [
  'AVG',
  'COUNT',
  'COUNT_DISTINCT',
  'MAX',
  'MIN',
  'SUM',
];

export function useGetAggregatorName() {
  const { t } = useTranslation(['scenarios']);

  return useCallback(
    (aggregatorName: string) => {
      switch (aggregatorName) {
        case 'AVG':
          return t('scenarios:aggregator.average');
        case 'COUNT':
          return t('scenarios:aggregator.count');
        case 'COUNT_DISTINCT':
          return t('scenarios:aggregator.count_distinct');
        case 'MAX':
          return t('scenarios:aggregator.max');
        case 'MIN':
          return t('scenarios:aggregator.min');
        case 'SUM':
          return t('scenarios:aggregator.sum');
      }

      // eslint-disable-next-line no-restricted-properties
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unhandled aggregator', aggregatorName);
      }
      return aggregatorName;
    },
    [t],
  );
}

//TODO: replace by above localised function
export const getAggregatorName = (aggregatorName: string): string => {
  switch (aggregatorName) {
    case 'AVG':
      return 'Average';
    case 'COUNT':
      return 'Count';
    case 'COUNT_DISTINCT':
      return 'Count distinct';
    case 'MAX':
      return 'Max';
    case 'MIN':
      return 'Min';
    case 'SUM':
      return 'Sum';
    default:
      return aggregatorName;
  }
};

export function getAggregationDisplayName(node: AggregationAstNode): string {
  const { aggregator, label } = node.namedChildren;
  if (label?.constant !== undefined && label?.constant !== '') {
    return label?.constant;
  }
  return getAggregatorName(aggregator?.constant ?? '');
}
