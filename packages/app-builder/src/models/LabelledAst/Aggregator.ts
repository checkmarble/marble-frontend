import {
  type AggregationAstNode,
  aggregationAstNodeName,
  type LabelledAst,
  NewAggregatorAstNode,
} from '@app-builder/models';

export function newAggregatorLabelledAst(aggregator: string): LabelledAst {
  return {
    name: getAggregatorName(aggregator),
    description: '',
    operandType: aggregationAstNodeName,
    //TODO(combobox): infer/get aggregator.dataType
    dataType: 'unknown',
    astNode: NewAggregatorAstNode(aggregator),
  };
}

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
