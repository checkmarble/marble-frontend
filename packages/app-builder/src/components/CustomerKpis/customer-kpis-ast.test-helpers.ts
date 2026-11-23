import {
  type AggregationAstNode,
  type AggregationFilterAstNode,
  type BinaryAggregationFilterAstNode,
  type BinaryAggregationFilterOperator,
  type FuzzyMatchFilterAstNode,
  type IsMultipleOfFilterAstNode,
  NewAggregatorFilterAstNode,
  type TimestampExtractFilterAstNode,
} from '@app-builder/models/astNode/aggregation';
import { NewUndefinedAstNode } from '@app-builder/models/astNode/ast-node';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';

type UserFilterInput =
  | { fieldName: string; operator?: BinaryAggregationFilterOperator | null; value?: KnownOperandAstNode }
  | { fieldName: string; operator: 'FuzzyMatch'; value: FuzzyMatchFilterAstNode['namedChildren']['value'] }
  | { fieldName: string; operator: 'IsMultipleOf'; value: IsMultipleOfFilterAstNode['namedChildren']['value'] }
  | {
      fieldName: string;
      operator: 'TimestampExtract';
      value: TimestampExtractFilterAstNode['namedChildren']['value'];
    };

function buildUserFilter(tableName: string | null, input: UserFilterInput): AggregationFilterAstNode {
  const common = {
    tableName: NewConstantAstNode({ constant: tableName }),
    fieldName: NewConstantAstNode({ constant: input.fieldName }),
  };
  switch (input.operator) {
    case 'FuzzyMatch':
      return NewAggregatorFilterAstNode<FuzzyMatchFilterAstNode>({
        namedChildren: { ...common, operator: NewConstantAstNode({ constant: input.operator }), value: input.value },
      });
    case 'IsMultipleOf':
      return NewAggregatorFilterAstNode<IsMultipleOfFilterAstNode>({
        namedChildren: { ...common, operator: NewConstantAstNode({ constant: input.operator }), value: input.value },
      });
    case 'TimestampExtract':
      return NewAggregatorFilterAstNode<TimestampExtractFilterAstNode>({
        namedChildren: { ...common, operator: NewConstantAstNode({ constant: input.operator }), value: input.value },
      });
    default:
      return NewAggregatorFilterAstNode<BinaryAggregationFilterAstNode>({
        namedChildren: {
          ...common,
          operator: NewConstantAstNode({ constant: input.operator ?? null }),
          value: input.value ?? NewUndefinedAstNode(),
        },
      });
  }
}

export function addUserFilter(aggregation: AggregationAstNode, input: UserFilterInput): AggregationFilterAstNode {
  const filter = buildUserFilter(aggregation.namedChildren.tableName.constant, input);
  aggregation.namedChildren.filters.children.push(filter);
  return filter;
}
