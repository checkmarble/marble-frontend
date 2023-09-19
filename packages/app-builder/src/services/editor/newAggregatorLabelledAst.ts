import {
  aggregationAstNodeName,
  getAggregatorName,
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
