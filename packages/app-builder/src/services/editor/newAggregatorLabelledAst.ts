import {
  getAggregatorName,
  type LabelledAst,
  NewAggregatorAstNode,
} from '@app-builder/models';

export function newAggregatorLabelledAst(aggregator: string): LabelledAst {
  return {
    label: getAggregatorName(aggregator),
    tooltip: '',
    astNode: NewAggregatorAstNode(aggregator),
    dataModelField: null,
  };
}
