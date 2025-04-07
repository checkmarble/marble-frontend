import { v7 as uuidv7 } from 'uuid';

import { type AggregatorOperator } from '../modale-operators';
import { type AstNode, type CheckNodeId, type IdLessAstNode } from './ast-node';
import { type KnownOperandAstNode } from './builder-ast-node';
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

export const complexAggregationFilterOperators = ['FuzzyMatch'] as const;

export type ComplexAggregationFilterOperator = (typeof complexAggregationFilterOperators)[number];

export const aggregationFilterOperators = [
  ...binaryAggregationFilterOperators,
  ...unaryAggregationFilterOperators,
  ...complexAggregationFilterOperators,
] as const;
export type AggregationFilterOperator = (typeof aggregationFilterOperators)[number];

export const aggregationFilterAstNodeName = 'Filter';
export type UnaryAggregationFilterAstNode = {
  id: string;
  name: typeof aggregationFilterAstNodeName;
  constant?: undefined;
  children: never[];
  namedChildren: {
    tableName: ConstantAstNode<string | null>;
    fieldName: ConstantAstNode<string | null>;
    operator: ConstantAstNode<(typeof unaryAggregationFilterOperators)[number]>;
  };
};

export type BinaryAggregationFilterAstNode = {
  id: string;
  name: typeof aggregationFilterAstNodeName;
  constant?: undefined;
  children: never[];
  namedChildren: {
    tableName: ConstantAstNode<string | null>;
    fieldName: ConstantAstNode<string | null>;
    operator: ConstantAstNode<(typeof binaryAggregationFilterOperators)[number] | null>;
    value: KnownOperandAstNode;
  };
};

export type ComplexAggregationFilterAstNode = {
  id: string;
  name: typeof aggregationFilterAstNodeName;
  constant?: undefined;
  children: never[];
  namedChildren: {
    tableName: ConstantAstNode<string | null>;
    fieldName: ConstantAstNode<string | null>;
    operator: ConstantAstNode<'FuzzyMatch'>;
    value: KnownOperandAstNode;
    options: {
      id: string;
      name: 'FuzzyMatchOptions';
      constant?: undefined;
      children: [];
      namedChildren: {
        treshold: ConstantAstNode<number>;
        algorithm: ConstantAstNode<string>;
      };
    };
  };
};

export type AggregationFilterAstNode =
  | UnaryAggregationFilterAstNode
  | BinaryAggregationFilterAstNode
  | ComplexAggregationFilterAstNode;

export type GetAggregationFilterOperator<T extends AggregationFilterAstNode> =
  T extends UnaryAggregationFilterAstNode
    ? UnaryAggregationFilterOperator
    : T extends BinaryAggregationFilterAstNode
      ? BinaryAggregationFilterOperator
      : ComplexAggregationFilterOperator;

export const aggregationAstNodeName = 'Aggregator';
export interface AggregationAstNode {
  id: string;
  name: typeof aggregationAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    aggregator: ConstantAstNode<AggregatorOperator>;
    tableName: ConstantAstNode<string>;
    fieldName: ConstantAstNode<string>;
    label: ConstantAstNode<string>;
    filters: {
      id: string;
      name: 'List';
      constant?: undefined;
      children: AggregationFilterAstNode[];
      namedChildren: Record<string, never>;
    };
  };
}

export function NewAggregatorAstNode(aggregatorName: AggregatorOperator): AggregationAstNode {
  return {
    id: uuidv7(),
    name: aggregationAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      aggregator: NewConstantAstNode({ constant: aggregatorName }),
      tableName: NewConstantAstNode({ constant: '' }),
      fieldName: NewConstantAstNode({ constant: '' }),
      label: NewConstantAstNode({ constant: '' }),
      filters: {
        id: uuidv7(),
        name: 'List',
        constant: undefined,
        children: [],
        namedChildren: {},
      },
    },
  };
}

export function NewAggregatorFilterAstNode<T extends AggregationFilterAstNode>({
  namedChildren,
}: {
  namedChildren: T['namedChildren'];
}): T {
  return {
    id: uuidv7(),
    name: 'Filter',
    children: [],
    namedChildren,
  } as T;
}

export function isAggregationFilterOperator(value: string): value is AggregationFilterOperator {
  return (aggregationFilterOperators as ReadonlyArray<string>).includes(value);
}

export function isUnaryAggregationFilterOperator(
  value: string | null,
): value is UnaryAggregationFilterOperator {
  return (unaryAggregationFilterOperators as ReadonlyArray<string | null>).includes(value);
}

export function isUnaryAggregationFilter(
  node: IdLessAstNode<AggregationFilterAstNode> | AggregationFilterAstNode,
): node is CheckNodeId<UnaryAggregationFilterAstNode, typeof node> {
  return (unaryAggregationFilterOperators as ReadonlyArray<string>).includes(
    node.namedChildren.operator.constant as string,
  );
}

export function isBinaryAggregationFilter(
  node: IdLessAstNode<AggregationFilterAstNode> | AggregationFilterAstNode,
): node is CheckNodeId<BinaryAggregationFilterAstNode, typeof node> {
  const operator = node.namedChildren.operator.constant;
  return (
    operator === null ||
    (binaryAggregationFilterOperators as ReadonlyArray<AggregationFilterOperator>).includes(
      operator,
    )
  );
}

export function isAggregation(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<AggregationAstNode, typeof node> {
  return node.name === aggregationAstNodeName;
}
