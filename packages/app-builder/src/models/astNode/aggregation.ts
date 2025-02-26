import { type AstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

export const unaryAggregationFilterOperators = ['IsEmpty', 'IsNotEmpty'] as const;
export type UnaryAggregationFilterOperator = (typeof unaryAggregationFilterOperators)[number];

export const binaryAggregationFilterOperators = [
  '=',
  '!=',
  '>',
  '<',
  '>=',
  '<=',
  'IsInList',
  'IsNotInList',
  'StringStartsWith',
  'StringEndsWith',
] as const;
export type BinaryAggregationFilterOperator = (typeof binaryAggregationFilterOperators)[number];

export const aggregationFilterOperators = [
  ...binaryAggregationFilterOperators,
  ...unaryAggregationFilterOperators,
];
export type AggregationFilterOperator = (typeof aggregationFilterOperators)[number];

export const aggregationFilterAstNodeName = 'Filter';
export type UnaryAggregationFilterAstNode = {
  name: typeof aggregationFilterAstNodeName;
  constant: undefined;
  children: never[];
  namedChildren: {
    tableName: ConstantAstNode<string | null>;
    fieldName: ConstantAstNode<string | null>;
    operator: ConstantAstNode<(typeof unaryAggregationFilterOperators)[number]>;
  };
};

export type BinaryAggregationFilterAstNode = {
  name: typeof aggregationFilterAstNodeName;
  constant: undefined;
  children: never[];
  namedChildren: {
    tableName: ConstantAstNode<string | null>;
    fieldName: ConstantAstNode<string | null>;
    operator: ConstantAstNode<(typeof binaryAggregationFilterOperators)[number] | null>;
    value: AstNode;
  };
};

export type AggregationFilterAstNode =
  | UnaryAggregationFilterAstNode
  | BinaryAggregationFilterAstNode;

export type GetAggregationFilterOperator<T extends AggregationFilterAstNode> =
  T extends UnaryAggregationFilterAstNode
    ? UnaryAggregationFilterOperator
    : BinaryAggregationFilterOperator;

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
      children: AggregationFilterAstNode[];
      namedChildren: Record<string, never>;
    };
  };
}

export function NewAggregatorAstNode(aggregatorName: string): AggregationAstNode {
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

export function isAggregationFilterOperator(value: string): value is AggregationFilterOperator {
  return (aggregationFilterOperators as ReadonlyArray<string>).includes(value);
}

export function isUnaryAggregationFilterOperator(
  value: string | null,
): value is AggregationFilterOperator {
  return (unaryAggregationFilterOperators as ReadonlyArray<string | null>).includes(value);
}

export function isUnaryAggregationFilter(
  node: AggregationFilterAstNode,
): node is UnaryAggregationFilterAstNode {
  return (unaryAggregationFilterOperators as ReadonlyArray<string>).includes(
    node.namedChildren.operator.constant as string,
  );
}

export function isBinaryAggregationFilter(
  node: AggregationFilterAstNode,
): node is BinaryAggregationFilterAstNode {
  const operator = node.namedChildren.operator.constant;
  return (
    operator === null ||
    (binaryAggregationFilterOperators as ReadonlyArray<AggregationFilterOperator>).includes(
      operator,
    )
  );
}

export function isAggregation(node: AstNode): node is AggregationAstNode {
  return node.name === aggregationAstNodeName;
}
