import { type AstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

export const aggregationAstNodeName = 'Aggregator';
export interface AggregationAstNode {
  name: typeof aggregationAstNodeName;
  constant: undefined;
  children: [];
  namedChildren: {
    aggregator: ConstantAstNode<string>;
    tableName: ConstantAstNode<string>;
    fieldName: ConstantAstNode<string>;
    label: ConstantAstNode<string>;
    filters: {
      name: 'List';
      constant: undefined;
      children: {
        name: 'Filter';
        constant: undefined;
        children: never[];
        namedChildren: {
          tableName: ConstantAstNode<string | null>;
          fieldName: ConstantAstNode<string | null>;
          operator: ConstantAstNode<string | null>;
          value: AstNode;
        };
      }[];
      namedChildren: Record<string, never>;
    };
  };
}

export function NewAggregatorAstNode(
  aggregatorName: string,
): AggregationAstNode {
  return {
    name: aggregationAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      aggregator: NewConstantAstNode({ constant: aggregatorName }),
      tableName: NewConstantAstNode({ constant: '' }),
      fieldName: NewConstantAstNode({ constant: '' }),
      label: NewConstantAstNode({ constant: '' }),
      filters: {
        name: 'List',
        constant: undefined,
        children: [],
        namedChildren: {},
      },
    },
  };
}

export function isAggregation(node: AstNode): node is AggregationAstNode {
  return node.name === aggregationAstNodeName;
}
