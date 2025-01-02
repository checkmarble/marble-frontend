import {
  defaultEditableFuzzyMatchAlgorithm,
  defaultFuzzyMatchComparatorThreshold,
  type FuzzyMatchAlgorithm,
} from '../fuzzy-match';
import { type AstNode, NewUndefinedAstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

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
