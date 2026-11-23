import {
  type AggregationAstNode,
  type AggregationFilterAstNode,
  type AggregationFilterOperator,
  NewAggregatorFilterAstNode,
} from '@app-builder/models/astNode/aggregation';
import { type AstNode, NewUndefinedAstNode } from '@app-builder/models/astNode/ast-node';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';

export function addUserFilter(
  aggregation: AggregationAstNode,
  {
    fieldName,
    operator = null,
    value = NewUndefinedAstNode(),
  }: { fieldName: string; operator?: AggregationFilterOperator | null; value?: AstNode },
): AggregationFilterAstNode {
  const filter = NewAggregatorFilterAstNode<AggregationFilterAstNode>({
    namedChildren: {
      tableName: NewConstantAstNode({ constant: aggregation.namedChildren.tableName.constant }),
      fieldName: NewConstantAstNode({ constant: fieldName }),
      operator: NewConstantAstNode({ constant: operator }),
      value,
    } as AggregationFilterAstNode['namedChildren'],
  });
  aggregation.namedChildren.filters.children.push(filter);
  return filter;
}
