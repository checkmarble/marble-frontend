import { type NodeDto } from 'marble-api';
import * as R from 'remeda';

import {
  type BinaryMainAstOperatorFunction,
  isBinaryMainAstOperatorFunction,
  isMainAstOperatorFunction,
  isUnaryMainAstOperatorFunction,
  type MainAstOperatorFunction,
  type UnaryMainAstOperatorFunction,
  undefinedAstNodeName,
} from './editable-operators';
import {
  defaultEditableFuzzyMatchAlgorithm,
  defaultFuzzyMatchComparatorThreshold,
  type FuzzyMatchAlgorithm,
} from './fuzzy-match';

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

export function NewPayloadAstNode(field: string): PayloadAstNode {
  return {
    name: payloadAstNodeName,
    children: [NewConstantAstNode({ constant: field })],
    namedChildren: {},
  };
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

export type TimestampFieldAstNode =
  | DataAccessorAstNode
  | TimeNowAstNode
  | TimeAddAstNode
  | UndefinedAstNode;

export function isTimestampFieldAstNode(
  node: AstNode,
): node is TimestampFieldAstNode {
  return (
    isDataAccessorAstNode(node) ||
    isTimeNow(node) ||
    isTimeAdd(node) ||
    isUndefinedAstNode(node)
  );
}

export const timestampExtractAstNodeName = 'TimestampExtract';
export const validTimestampExtractParts = [
  'year',
  'month',
  'day_of_month',
  'day_of_week',
  'hour',
] as const;
export type ValidTimestampExtractParts =
  (typeof validTimestampExtractParts)[number];

export interface TimestampExtractAstNode {
  name: typeof timestampExtractAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    timestamp: TimestampFieldAstNode;
    part: ConstantAstNode<ValidTimestampExtractParts>;
  };
}
export function NewTimestampExtractAstNode(
  timestampFieldAstNode: TimestampFieldAstNode = NewUndefinedAstNode(),
  part: ConstantAstNode<ValidTimestampExtractParts> = NewConstantAstNode({
    constant: 'hour',
  }),
): TimestampExtractAstNode {
  return {
    name: timestampExtractAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      timestamp: timestampFieldAstNode,
      part,
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

export const timeNowAstNodeName = 'TimeNow';
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
  algorithm = defaultEditableFuzzyMatchAlgorithm,
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

export const fuzzyMatchAnyOfAstNodeName = 'FuzzyMatchAnyOf';
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
  algorithm = defaultEditableFuzzyMatchAlgorithm,
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
  funcName,
  left,
  right,
  algorithm,
  threshold = defaultFuzzyMatchComparatorThreshold,
}: {
  funcName: typeof fuzzyMatchAnyOfAstNodeName | typeof fuzzyMatchAstNodeName;
  left?: AstNode;
  right?: AstNode;
  algorithm?: FuzzyMatchAlgorithm;
  threshold?: number;
}): FuzzyMatchComparatorAstNode {
  const fuzzyMatch =
    funcName === fuzzyMatchAstNodeName
      ? NewFuzzyMatchAstNode({
          left,
          right,
          algorithm,
        })
      : NewFuzzyMatchAnyOfAstNode({
          left,
          right,
          algorithm,
        });

  return {
    name: '>',
    constant: undefined,
    children: [fuzzyMatch, NewConstantAstNode({ constant: threshold })],
    namedChildren: {},
  };
}

export const isMultipleOfAstNodeName = 'IsMultipleOf';
export interface IsMultipleOfAstNode {
  name: typeof isMultipleOfAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    value: AstNode;
    divider: ConstantAstNode<number>;
  };
}

export function NewIsMultipleOfAstNode(
  value: AstNode = NewUndefinedAstNode(),
  divider: ConstantAstNode<number> = NewConstantAstNode({ constant: 1 }),
): IsMultipleOfAstNode {
  return {
    name: isMultipleOfAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      value,
      divider,
    },
  };
}

export const stringTemplateAstNodeName = 'StringTemplate';
export interface StringTemplateAstNode {
  name: typeof stringTemplateAstNodeName;
  constant?: undefined;
  children: ConstantAstNode<string>[];
  namedChildren: Record<string, AstNode>;
}

export function NewStringTemplateAstNode(
  template: string = '',
  variables: Record<string, AstNode> = {},
): StringTemplateAstNode {
  return {
    name: stringTemplateAstNodeName,
    constant: undefined,
    children: [NewConstantAstNode({ constant: template })],
    namedChildren: variables,
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

export function isTimestampExtract(
  node: AstNode,
): node is TimestampExtractAstNode {
  return node.name === timestampExtractAstNodeName;
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
  if (firstChild === undefined) {
    return false;
  }
  return isFuzzyMatch(firstChild) || isFuzzyMatchAnyOf(firstChild);
}

export function isIsMultipleOf(node: AstNode): node is IsMultipleOfAstNode {
  return node.name === isMultipleOfAstNodeName;
}

export function isStringTemplateAstNode(
  node: AstNode,
): node is StringTemplateAstNode {
  return node.name === stringTemplateAstNodeName;
}

export type EditableAstNode =
  | AggregationAstNode
  | TimeAddAstNode
  | FuzzyMatchComparatorAstNode
  | IsMultipleOfAstNode
  | StringTemplateAstNode;

/**
 * Check if the node is editable in a dedicated modal
 * @param node
 * @returns
 */
export function isEditableAstNode(node: AstNode): node is EditableAstNode {
  return (
    isAggregation(node) ||
    isTimeAdd(node) ||
    isFuzzyMatchComparator(node) ||
    isTimestampExtract(node) ||
    isIsMultipleOf(node) ||
    isStringTemplateAstNode(node)
  );
}

type LeafOperandAstNode = EditableAstNode | TimeNowAstNode;

/**
 * Check if the node is considered as leaf operand
 * @param node
 * @returns
 */
export function isLeafOperandAstNode(
  node: AstNode,
): node is LeafOperandAstNode {
  return isEditableAstNode(node) || isTimeNow(node);
}

export type DataAccessorAstNode = DatabaseAccessAstNode | PayloadAstNode;

export function isDataAccessorAstNode(
  node: AstNode,
): node is DataAccessorAstNode {
  return isDatabaseAccess(node) || isPayload(node);
}

export type KnownOperandAstNode =
  | UndefinedAstNode
  | ConstantAstNode
  | CustomListAccessAstNode
  | DatabaseAccessAstNode
  | LeafOperandAstNode;

/**
 * Check if the node is handled in the Operand UI
 * @param node
 * @returns
 */
export function isKnownOperandAstNode(
  node: AstNode,
): node is KnownOperandAstNode {
  return (
    isUndefinedAstNode(node) ||
    isConstant(node) ||
    isCustomListAccess(node) ||
    isDataAccessorAstNode(node) ||
    isLeafOperandAstNode(node)
  );
}

export interface AndAstNode {
  name: 'And';
  constant: undefined;
  children: AstNode[];
  namedChildren: Record<string, never>;
}

export function isAndAstNode(astNode: AstNode): astNode is AndAstNode {
  if (astNode.name !== 'And') {
    return false;
  }
  if (Object.keys(astNode.namedChildren).length > 0) return false;
  return true;
}

export interface OrWithAndAstNode {
  name: 'Or';
  constant: undefined;
  children: AndAstNode[];
  namedChildren: Record<string, never>;
}

export function isOrWithAndAstNode(
  astNode: AstNode,
): astNode is OrWithAndAstNode {
  if (astNode.name !== 'Or') {
    return false;
  }
  for (const child of astNode.children) {
    if (child.name !== 'And') {
      return false;
    }
  }
  if (Object.keys(astNode.namedChildren).length > 0) return false;
  return true;
}

export interface MainAstNode {
  name: MainAstOperatorFunction;
  constant: undefined;
  children: AstNode[];
  namedChildren: Record<string, never>;
}

export interface MainAstBinaryNode {
  name: BinaryMainAstOperatorFunction;
  constant: undefined;
  children: [AstNode, AstNode];
  namedChildren: Record<string, never>;
}

export interface MainAstUnaryNode {
  name: UnaryMainAstOperatorFunction;
  constant: undefined;
  children: [AstNode];
  namedChildren: Record<string, never>;
}

export function isMainAstNode(astNode: AstNode): astNode is MainAstNode {
  if (isLeafOperandAstNode(astNode)) {
    return false;
  }

  if (Object.keys(astNode.namedChildren).length > 0) {
    return false;
  }
  if (astNode.name == null || !isMainAstOperatorFunction(astNode.name)) {
    return false;
  }

  return true;
}

export function isMainAstUnaryNode(
  astNode: AstNode,
): astNode is MainAstUnaryNode {
  if (!isMainAstNode(astNode)) return false;

  return (
    astNode.children.length === 1 &&
    isUnaryMainAstOperatorFunction(astNode.name)
  );
}

export function isMainAstBinaryNode(
  astNode: AstNode,
): astNode is MainAstBinaryNode {
  if (!isMainAstNode(astNode)) return false;

  return (
    astNode.children.length === 2 &&
    isBinaryMainAstOperatorFunction(astNode.name)
  );
}
