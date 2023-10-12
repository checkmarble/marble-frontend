import {
  type AggregationAstNode,
  type LabelledAst,
  NewAggregatorAstNode,
} from '@app-builder/models';

export function newAggregatorLabelledAst(
  nodeOrAggregator: string | AggregationAstNode
): LabelledAst {
  if (typeof nodeOrAggregator === 'string') {
    return {
      name: getAggregatorName(nodeOrAggregator),
      description: '',
      operandType: 'Function',
      //TODO(combobox): infer/get aggregator.dataType
      dataType: 'unknown',
      astNode: NewAggregatorAstNode(nodeOrAggregator),
      isEnum: false,
    };
  }
  return {
    name: getAggregationDisplayName(nodeOrAggregator),
    description: '',
    operandType: 'Function',
    //TODO(combobox): infer/get aggregator.dataType
    dataType: 'unknown',
    astNode: NewAggregatorAstNode(
      nodeOrAggregator.namedChildren.aggregator.constant
    ),
    isEnum: false,
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
