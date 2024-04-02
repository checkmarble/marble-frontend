import { type NodeDto } from 'marble-api';
import * as R from 'remeda';

import {
  type FuzzyMatchAlgorithm,
  undefinedAstNodeName,
} from './editable-operators';

export type AstNode = {
  name: string | null;
  constant?: ConstantType;
  children: AstNode[];
  namedChildren: Record<string, AstNode>;
};

export type ConstantType =
  | number
  | string
  | boolean
  | null
  | Array<ConstantType>
  | { [key: string]: ConstantType };

// helper
export function NewAstNode({
  name,
  constant,
  children,
  namedChildren,
}: Partial<AstNode> = {}): AstNode {
  return {
    name: name ?? null,
    constant: constant,
    children: children ?? [],
    namedChildren: namedChildren ?? {},
  };
}

export function NewUndefinedAstNode({
  children,
  namedChildren,
}: Partial<Omit<AstNode, 'name'>> = {}): UndefinedAstNode {
  return {
    name: undefinedAstNodeName,
    children: children ?? [],
    namedChildren: namedChildren ?? {},
  };
}

export function NewEmptyTriggerAstNode(): AstNode {
  return NewAstNode({
    name: 'And',
  });
}

export function NewEmptyRuleAstNode(): AstNode {
  return NewAstNode({
    name: 'Or',
    children: [],
  });
}

export function adaptAstNode(nodeDto: NodeDto): AstNode {
  return {
    name: nodeDto.name === undefined ? null : nodeDto.name,
    constant: nodeDto.constant,
    children: (nodeDto.children ?? []).map(adaptAstNode),
    namedChildren: R.mapValues(nodeDto.named_children ?? {}, adaptAstNode),
  };
}

export function adaptNodeDto(astNode: AstNode): NodeDto {
  return {
    name: astNode.name ?? undefined,
    constant: astNode.constant,
    children: astNode.children.map(adaptNodeDto),
    named_children: R.mapValues(astNode.namedChildren ?? {}, adaptNodeDto),
  };
}

export interface UndefinedAstNode extends Omit<AstNode, 'name'> {
  name: typeof undefinedAstNodeName;
}

export function isUndefinedAstNode(node: AstNode): node is UndefinedAstNode {
  return node.name === undefinedAstNodeName;
}

export interface ConstantAstNode<T extends ConstantType = ConstantType> {
  name: null;
  constant: T;
  children: [];
  namedChildren: Record<string, never>;
}

export function NewConstantAstNode<T extends ConstantType = ConstantType>({
  constant,
}: {
  constant: T;
}): ConstantAstNode<T> {
  return {
    name: null,
    constant: constant,
    children: [],
    namedChildren: {},
  };
}

export function isConstant(node: AstNode): node is ConstantAstNode {
  return !node.name && node.constant !== undefined;
}

export const databaseAccessAstNodeName = 'DatabaseAccess';
export interface DatabaseAccessAstNode {
  name: typeof databaseAccessAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    fieldName: ConstantAstNode<string>;
    path: ConstantAstNode<string[]>;
    tableName: ConstantAstNode<string>;
  };
}

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

export const payloadAstNodeName = 'Payload';
export interface PayloadAstNode {
  name: typeof payloadAstNodeName;
  constant?: undefined;
  children: [ConstantAstNode<string>];
  namedChildren: Record<string, never>;
}

export const customListAccessAstNodeName = 'CustomListAccess';
export interface CustomListAccessAstNode {
  name: typeof customListAccessAstNodeName;
  constant: undefined;
  children: [];
  namedChildren: {
    customListId: ConstantAstNode<string>;
  };
}

export function NewCustomListAstNode(
  customListId: string,
): CustomListAccessAstNode {
  return {
    name: customListAccessAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      customListId: NewConstantAstNode({ constant: customListId }),
    },
  };
}

export const timeAddAstNodeName = 'TimeAdd';
export interface TimeAddAstNode {
  name: typeof timeAddAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    timestampField: TimestampFieldAstNode;
    sign: ConstantAstNode<string>;
    duration: ConstantAstNode<string>;
  };
}
export type TimestampFieldAstNode =
  | DatabaseAccessAstNode
  | PayloadAstNode
  | TimeNowAstNode
  | UndefinedAstNode;

export function NewTimeAddAstNode(
  timestampFieldAstNode: TimestampFieldAstNode = NewUndefinedAstNode(),
  signAstNode: ConstantAstNode<string> = NewConstantAstNode({
    constant: '',
  }),
  durationAstNode: ConstantAstNode<string> = NewConstantAstNode({
    constant: '',
  }),
): TimeAddAstNode {
  return {
    name: timeAddAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      timestampField: timestampFieldAstNode,
      sign: signAstNode,
      duration: durationAstNode,
    },
  };
}

const timeNowAstNodeName = 'TimeNow';
export interface TimeNowAstNode {
  name: typeof timeNowAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: Record<string, never>;
}

export function NewTimeNowAstNode(): TimeNowAstNode {
  return {
    name: timeNowAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {},
  };
}

export const fuzzyMatchAstNodeName = 'FuzzyMatch';
export interface FuzzyMatchAstNode {
  name: typeof fuzzyMatchAstNodeName;
  constant?: undefined;
  children: [AstNode, AstNode];
  namedChildren: {
    algorithm: ConstantAstNode<FuzzyMatchAlgorithm>;
  };
}

export function NewFuzzyMatchAstNode({
  left = NewUndefinedAstNode(),
  right = NewUndefinedAstNode(),
  algorithm = 'partial_ratio',
}: {
  left?: AstNode;
  right?: AstNode;
  algorithm?: FuzzyMatchAlgorithm;
}): FuzzyMatchAstNode {
  return {
    name: fuzzyMatchAstNodeName,
    constant: undefined,
    children: [left, right],
    namedChildren: {
      algorithm: NewConstantAstNode({ constant: algorithm }),
    },
  };
}

const fuzzyMatchAnyOfAstNodeName = 'FuzzyMatchAnyOf';
export interface FuzzyMatchAnyOfAstNode {
  name: typeof fuzzyMatchAnyOfAstNodeName;
  constant?: undefined;
  children: [AstNode, AstNode];
  namedChildren: {
    algorithm: ConstantAstNode<FuzzyMatchAlgorithm>;
  };
}

export function NewFuzzyMatchAnyOfAstNode({
  left = NewUndefinedAstNode(),
  right = NewUndefinedAstNode(),
  algorithm = 'partial_ratio',
}: {
  left?: AstNode;
  right?: AstNode;
  algorithm?: FuzzyMatchAlgorithm;
}): FuzzyMatchAnyOfAstNode {
  return {
    name: fuzzyMatchAnyOfAstNodeName,
    constant: undefined,
    children: [left, right],
    namedChildren: {
      algorithm: NewConstantAstNode({ constant: algorithm }),
    },
  };
}

export interface FuzzyMatchComparatorAstNode {
  name: '>';
  constant?: undefined;
  children: [
    FuzzyMatchAstNode | FuzzyMatchAnyOfAstNode,
    ConstantAstNode<number>,
  ];
  namedChildren: Record<string, never>;
}

export function NewFuzzyMatchComparatorAstNode({
  fuzzyMatch,
  threshold = 0,
}: {
  fuzzyMatch: FuzzyMatchAstNode | FuzzyMatchAnyOfAstNode;
  threshold?: number;
}): FuzzyMatchComparatorAstNode {
  return {
    name: '>',
    constant: undefined,
    children: [fuzzyMatch, NewConstantAstNode({ constant: threshold })],
    namedChildren: {},
  };
}

export function isDatabaseAccess(node: AstNode): node is DatabaseAccessAstNode {
  return node.name === databaseAccessAstNodeName;
}

export function isAggregation(node: AstNode): node is AggregationAstNode {
  return node.name === aggregationAstNodeName;
}

export function isPayload(node: AstNode): node is PayloadAstNode {
  return node.name === payloadAstNodeName;
}

export function isCustomListAccess(
  node: AstNode,
): node is CustomListAccessAstNode {
  return node.name === customListAccessAstNodeName;
}

export function isTimeAdd(node: AstNode): node is TimeAddAstNode {
  return node.name === timeAddAstNodeName;
}

export function isTimeNow(node: AstNode): node is TimeNowAstNode {
  return node.name === timeNowAstNodeName;
}

export function isFuzzyMatch(node: AstNode): node is FuzzyMatchAstNode {
  return node.name === fuzzyMatchAstNodeName;
}

export function isFuzzyMatchAnyOf(
  node: AstNode,
): node is FuzzyMatchAnyOfAstNode {
  return node.name === fuzzyMatchAnyOfAstNodeName;
}

export function isFuzzyMatchComparator(
  node: AstNode,
): node is FuzzyMatchComparatorAstNode {
  if (node.name !== '>') {
    return false;
  }
  if (node.children.length !== 2) {
    return false;
  }
  const firstChild = node.children[0];
  return isFuzzyMatch(firstChild) || isFuzzyMatchAnyOf(firstChild);
}

type FunctionAstNode =
  | AggregationAstNode
  | TimeAddAstNode
  | TimeNowAstNode
  | FuzzyMatchComparatorAstNode;

// TODO(EditableAstNode): heavy link to EditableAstNode operandType = 'Function'
// Function is considered a special type of operand which require modal to edit
export function isFunctionAstNode(node: AstNode): node is FunctionAstNode {
  return (
    isAggregation(node) ||
    isTimeAdd(node) ||
    isTimeNow(node) ||
    isFuzzyMatchComparator(node)
  );
}

export interface OrAndGroupAstNode {
  name: 'Or';
  constant: undefined;
  children: {
    name: 'And';
    constant: undefined;
    children: AstNode[];
    namedChildren: Record<string, never>;
  }[];
  namedChildren: Record<string, never>;
}

export function isOrAndGroup(astNode: AstNode): astNode is OrAndGroupAstNode {
  if (astNode.name !== 'Or') {
    return false;
  }
  for (const child of astNode.children) {
    if (child.name !== 'And') {
      return false;
    }
  }
  return true;
}
