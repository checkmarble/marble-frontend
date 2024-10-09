import { hasExactlyTwoElements } from '@app-builder/utils/array';
import { type Tree } from '@app-builder/utils/tree';
import { nanoid } from 'nanoid';
import * as R from 'remeda';

import {
  aggregationAstNodeName,
  type AstNode,
  type ConstantType,
  customListAccessAstNodeName,
  databaseAccessAstNodeName,
  fuzzyMatchAnyOfAstNodeName,
  fuzzyMatchAstNodeName,
  isLeafOperandAstNode,
  payloadAstNodeName,
  timeAddAstNodeName,
  timeNowAstNodeName,
} from './ast-node';
import {
  isTwoLineOperandOperatorFunction,
  type TwoLineOperandOperatorFunction,
  undefinedAstNodeName,
} from './editable-operators';
import { type FuzzyMatchAlgorithm } from './fuzzy-match';
import {
  type EvaluationError,
  NewNodeEvaluation,
  type NodeEvaluation,
  type ReturnValue,
} from './node-evaluation';

export type ValidationViewModel = Tree<{ errors: EvaluationError[] }>;

export type AstNodeViewModel = Tree<{
  name: string | null;
  constant?: ConstantType;
  errors: EvaluationError[];
  returnValue?: ReturnValue;
}>;

export function adaptAstNodeViewModel({
  ast,
  evaluation = NewNodeEvaluation(),
  parent,
}: {
  ast: AstNode;
  evaluation?: NodeEvaluation;
  parent?: AstNodeViewModel;
}): AstNodeViewModel {
  const currentNode: AstNodeViewModel = {
    nodeId: nanoid(),
    parent: parent ?? null,
    name: ast.name,
    constant: ast.constant,
    errors: evaluation.errors,
    children: [],
    namedChildren: {},
    returnValue: evaluation.returnValue,
  };

  currentNode.children = ast.children.map((child, i) =>
    adaptAstNodeViewModel({
      ast: child,
      evaluation: evaluation.children[i],
      parent: currentNode,
    }),
  );
  currentNode.namedChildren = R.mapValues(
    ast.namedChildren,
    (child, namedKey) =>
      adaptAstNodeViewModel({
        ast: child,
        evaluation: evaluation.namedChildren[namedKey],
        parent: currentNode,
      }),
  );

  return currentNode;
}

export function adaptAstNodeFromViewModel(
  viewModel: AstNodeViewModel,
): AstNode {
  return {
    name: viewModel.name,
    constant: viewModel.constant,
    children: viewModel.children.map(adaptAstNodeFromViewModel),
    namedChildren: R.mapValues(
      viewModel.namedChildren,
      adaptAstNodeFromViewModel,
    ),
  };
}

export interface UndefinedAstNodeViewModel
  extends Omit<AstNodeViewModel, 'name'> {
  name: typeof undefinedAstNodeName;
}

export function isUndefinedViewModel(
  node: AstNodeViewModel,
): node is UndefinedAstNodeViewModel {
  return node.name === undefinedAstNodeName;
}

export interface ConstantAstNodeViewModel<
  T extends ConstantType = ConstantType,
> {
  nodeId: string;
  errors: EvaluationError[];
  parent: AstNodeViewModel | null;
  returnValue?: ReturnValue;
  name: null;
  constant: T;
  children: [];
  namedChildren: Record<string, never>;
}

export function isConstantViewModel(
  node: AstNode,
): node is ConstantAstNodeViewModel {
  return !node.name && node.constant !== undefined;
}

export interface DatabaseAccessAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: AstNodeViewModel | null;
  returnValue?: ReturnValue;
  name: typeof databaseAccessAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    fieldName: ConstantAstNodeViewModel<string>;
    path: ConstantAstNodeViewModel<string[]>;
    tableName: ConstantAstNodeViewModel<string>;
  };
}

export interface AggregationAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: AstNodeViewModel | null;
  returnValue?: ReturnValue;
  name: typeof aggregationAstNodeName;
  constant: undefined;
  children: [];
  namedChildren: {
    aggregator: ConstantAstNodeViewModel<string>;
    tableName: ConstantAstNodeViewModel<string>;
    fieldName: ConstantAstNodeViewModel<string>;
    label: ConstantAstNodeViewModel<string>;
    filters: {
      nodeId: string;
      errors: EvaluationError[];
      parent: AstNodeViewModel | null;
      returnValue?: ReturnValue;
      name: 'List';
      constant: undefined;
      children: {
        nodeId: string;
        errors: EvaluationError[];
        parent: AstNodeViewModel | null;
        returnValue?: ReturnValue;
        name: 'Filter';
        constant: undefined;
        children: never[];
        namedChildren: {
          tableName: ConstantAstNodeViewModel<string | null>;
          fieldName: ConstantAstNodeViewModel<string | null>;
          operator: ConstantAstNodeViewModel<string | null>;
          value: AstNodeViewModel;
        };
      }[];
      namedChildren: Record<string, never>;
    };
  };
}

export interface PayloadAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: AstNodeViewModel | null;
  returnValue?: ReturnValue;
  name: typeof payloadAstNodeName;
  constant?: undefined;
  children: [ConstantAstNodeViewModel<string>];
  namedChildren: Record<string, never>;
}

export interface CustomListAccessAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: AstNodeViewModel | null;
  returnValue?: ReturnValue;
  name: typeof customListAccessAstNodeName;
  constant: undefined;
  children: [];
  namedChildren: {
    customListId: ConstantAstNodeViewModel<string>;
  };
}

export interface TimeAddAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: AstNodeViewModel | null;
  returnValue?: ReturnValue;
  name: typeof timeAddAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    timestampField: TimestampFieldAstNodeViewModel;
    sign: ConstantAstNodeViewModel<string>;
    duration: ConstantAstNodeViewModel<string>;
  };
}
export type TimestampFieldAstNodeViewModel =
  | DatabaseAccessAstNodeViewModel
  | PayloadAstNodeViewModel
  | TimeNowAstNodeViewModel
  | UndefinedAstNodeViewModel;

export interface TimeNowAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: AstNodeViewModel | null;
  returnValue?: ReturnValue;
  name: typeof timeNowAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: Record<string, never>;
}

export interface FuzzyMatchAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: AstNodeViewModel | null;
  returnValue?: ReturnValue;
  name: typeof fuzzyMatchAstNodeName;
  constant?: undefined;
  children: [AstNodeViewModel, AstNodeViewModel];
  namedChildren: {
    algorithm: ConstantAstNodeViewModel<FuzzyMatchAlgorithm>;
  };
}

export interface FuzzyMatchAnyOfAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: AstNodeViewModel | null;
  returnValue?: ReturnValue;
  name: typeof fuzzyMatchAnyOfAstNodeName;
  constant?: undefined;
  children: [AstNodeViewModel, AstNodeViewModel];
  namedChildren: {
    algorithm: ConstantAstNodeViewModel<FuzzyMatchAlgorithm>;
  };
}

export interface FuzzyMatchComparatorAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: AstNodeViewModel | null;
  returnValue?: ReturnValue;
  name: '>';
  constant?: undefined;
  children: [
    FuzzyMatchAstNodeViewModel | FuzzyMatchAnyOfAstNodeViewModel,
    ConstantAstNodeViewModel<number>,
  ];
  namedChildren: Record<string, never>;
}

export function isDatabaseAccessViewModel(
  node: AstNodeViewModel,
): node is DatabaseAccessAstNodeViewModel {
  return node.name === databaseAccessAstNodeName;
}

export function isAggregationViewModel(
  node: AstNodeViewModel,
): node is AggregationAstNodeViewModel {
  return node.name === aggregationAstNodeName;
}

export function isPayloadViewModel(
  node: AstNodeViewModel,
): node is PayloadAstNodeViewModel {
  return node.name === payloadAstNodeName;
}

export function isCustomListAccessViewModel(
  node: AstNodeViewModel,
): node is CustomListAccessAstNodeViewModel {
  return node.name === customListAccessAstNodeName;
}

export function isTimeAddViewModel(
  node: AstNodeViewModel,
): node is TimeAddAstNodeViewModel {
  return node.name === timeAddAstNodeName;
}

export function isTimeNowViewModel(
  node: AstNodeViewModel,
): node is TimeNowAstNodeViewModel {
  return node.name === timeNowAstNodeName;
}

export function isFuzzyMatchViewModel(
  node: AstNodeViewModel,
): node is FuzzyMatchAstNodeViewModel {
  return node.name === fuzzyMatchAstNodeName;
}

export function isFuzzyMatchAnyOfViewModel(
  node: AstNodeViewModel,
): node is FuzzyMatchAnyOfAstNodeViewModel {
  return node.name === fuzzyMatchAnyOfAstNodeName;
}

export function isFuzzyMatchComparatorViewModel(
  node: AstNodeViewModel,
): node is FuzzyMatchComparatorAstNodeViewModel {
  if (node.name !== '>') {
    return false;
  }
  if (!hasExactlyTwoElements(node.children)) {
    return false;
  }
  const firstChild = node.children[0];
  return (
    isFuzzyMatchViewModel(firstChild) || isFuzzyMatchAnyOfViewModel(firstChild)
  );
}

type FunctionAstNodeViewModel =
  | AggregationAstNodeViewModel
  | TimeAddAstNodeViewModel
  | TimeNowAstNodeViewModel
  | FuzzyMatchComparatorAstNodeViewModel;

// TODO(EditableAstNode): heavy link to EditableAstNode operandType = 'Function'
// Function is considered a special type of operand which require modal to edit
export function isFunctionAstNodeViewModel(
  node: AstNodeViewModel,
): node is FunctionAstNodeViewModel {
  return (
    isAggregationViewModel(node) ||
    isTimeAddViewModel(node) ||
    isTimeNowViewModel(node) ||
    isFuzzyMatchComparatorViewModel(node)
  );
}

export type DataAccessorAstNodeViewModel =
  | DatabaseAccessAstNodeViewModel
  | PayloadAstNodeViewModel;

export function isDataAccessorAstNodeViewModel(
  node: AstNodeViewModel,
): node is DataAccessorAstNodeViewModel {
  return isDatabaseAccessViewModel(node) || isPayloadViewModel(node);
}

export interface RootAndAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: null;
  name: 'And';
  constant: undefined;
  children: AstNodeViewModel[];
  namedChildren: Record<string, never>;
}

export function isRootAndAstNodeViewModel(
  astNode: AstNodeViewModel,
): astNode is RootAndAstNodeViewModel {
  if (astNode.parent !== null) return false;
  if (astNode.name !== 'And') {
    return false;
  }
  if (Object.keys(astNode.namedChildren).length > 0) return false;
  return true;
}

export interface RootOrWithAndAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: null;
  name: 'Or';
  constant: undefined;
  children: {
    nodeId: string;
    errors: EvaluationError[];
    parent: RootOrWithAndAstNodeViewModel;
    name: 'And';
    constant: undefined;
    children: AstNodeViewModel[];
    namedChildren: Record<string, never>;
  }[];
  namedChildren: Record<string, never>;
}

export function isRootOrWithAndAstNodeViewModel(
  astNode: AstNodeViewModel,
): astNode is RootOrWithAndAstNodeViewModel {
  if (astNode.parent !== null) return false;
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

export interface TwoLineOperandAstNodeViewModel {
  nodeId: string;
  errors: EvaluationError[];
  parent: AstNodeViewModel | null;
  name: TwoLineOperandOperatorFunction;
  constant: undefined;
  children: [AstNodeViewModel, AstNodeViewModel];
  namedChildren: Record<string, never>;
}

export function isTwoLineOperandAstNodeViewModel(
  astNode: AstNodeViewModel,
): astNode is TwoLineOperandAstNodeViewModel {
  if (isLeafOperandAstNode(astNode)) return false;

  if (!hasExactlyTwoElements(astNode.children)) return false;
  if (Object.keys(astNode.namedChildren).length > 0) return false;
  if (astNode.name == null || !isTwoLineOperandOperatorFunction(astNode.name))
    return false;

  return true;
}
