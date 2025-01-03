import { type AggregationAstNode, isAggregation } from './aggregation';
import {
  type AstNode,
  isUndefinedAstNode,
  type UndefinedAstNode,
} from './ast-node';
import {
  type BinaryMainAstOperatorFunction,
  isBinaryMainAstOperatorFunction,
  isMainAstOperatorFunction,
  isUnaryMainAstOperatorFunction,
  type MainAstOperatorFunction,
  type UnaryMainAstOperatorFunction,
} from './builder-ast-node-node-operator';
import { type ConstantAstNode, isConstant } from './constant';
import {
  type CustomListAccessAstNode,
  isCustomListAccess,
} from './custom-list';
import {
  type DatabaseAccessAstNode,
  isDataAccessorAstNode,
} from './data-accessor';
import { isIsMultipleOf, type IsMultipleOfAstNode } from './multiple-of';
import {
  type FuzzyMatchComparatorAstNode,
  isFuzzyMatchComparator,
} from './strings';
import {
  isTimeAdd,
  isTimeNow,
  isTimestampExtract,
  type TimeAddAstNode,
  type TimeNowAstNode,
} from './time';

export type EditableAstNode =
  | AggregationAstNode
  | TimeAddAstNode
  | FuzzyMatchComparatorAstNode
  | IsMultipleOfAstNode;

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
    isIsMultipleOf(node)
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

  if (astNode.name == null) {
    return false;
  }

  return isMainAstOperatorFunction(astNode.name) || isUndefinedAstNode(astNode);
}

export function isMainAstUnaryNode(
  astNode: AstNode,
): astNode is MainAstUnaryNode {
  if (!isMainAstNode(astNode)) return false;

  return (
    isMainAstNode(astNode) &&
    astNode.children.length === 1 &&
    (isUnaryMainAstOperatorFunction(astNode.name) ||
      isUndefinedAstNode(astNode))
  );
}

export function isMainAstBinaryNode(
  astNode: AstNode,
): astNode is MainAstBinaryNode {
  if (!isMainAstNode(astNode)) return false;

  return (
    astNode.children.length === 2 &&
    (isBinaryMainAstOperatorFunction(astNode.name) ||
      isUndefinedAstNode(astNode))
  );
}
