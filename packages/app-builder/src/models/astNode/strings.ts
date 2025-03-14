import { v7 as uuidv7 } from 'uuid';

import {
  defaultEditableFuzzyMatchAlgorithm,
  defaultFuzzyMatchComparatorThreshold,
  type FuzzyMatchAlgorithm,
} from '../fuzzy-match';
import {
  type AstNode,
  type CheckNodeId,
  type IdLessAstNode,
  NewUndefinedAstNode,
} from './ast-node';
import { type KnownOperandAstNode } from './builder-ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

////////////////////////
// Fuzzy string matching
////////////////////////

export const fuzzyMatchAstNodeName = 'FuzzyMatch';
export interface FuzzyMatchAstNode {
  id: string;
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
    id: uuidv7(),
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
  id: string;
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
    id: uuidv7(),
    name: fuzzyMatchAnyOfAstNodeName,
    constant: undefined,
    children: [left, right],
    namedChildren: {
      algorithm: NewConstantAstNode({ constant: algorithm }),
    },
  };
}

export interface FuzzyMatchComparatorAstNode {
  id: string;
  name: '>';
  constant?: undefined;
  children: [FuzzyMatchAstNode | FuzzyMatchAnyOfAstNode, ConstantAstNode<number>];
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
    id: uuidv7(),
    name: '>',
    constant: undefined,
    children: [fuzzyMatch, NewConstantAstNode({ constant: threshold })],
    namedChildren: {},
  };
}

export function isFuzzyMatch(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<FuzzyMatchAstNode, typeof node> {
  return node.name === fuzzyMatchAstNodeName;
}

export function isFuzzyMatchAnyOf(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<FuzzyMatchAnyOfAstNode, typeof node> {
  return node.name === fuzzyMatchAnyOfAstNodeName;
}

export function isFuzzyMatchComparator(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<FuzzyMatchComparatorAstNode, typeof node> {
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

////////////////////////
// String templating ///
////////////////////////

export const STRING_TEMPLATE_VARIABLE_REGEXP = /%([a-z0-9_]+)%/gim;
export const STRING_TEMPLATE_VARIABLE_CAPTURE_REGEXP = /(%[a-z0-9_]+%)/gim;

export const stringTemplateAstNodeName = 'StringTemplate';
export interface StringTemplateAstNode {
  id: string;
  name: typeof stringTemplateAstNodeName;
  constant?: undefined;
  children: [ConstantAstNode<string>];
  namedChildren: Record<string, AstNode>;
}

export function NewStringTemplateAstNode(
  template: string = '',
  variables: Record<string, AstNode> = {},
): StringTemplateAstNode {
  return {
    id: uuidv7(),
    name: stringTemplateAstNodeName,
    constant: undefined,
    children: [NewConstantAstNode({ constant: template })],
    namedChildren: variables,
  };
}

export function isStringTemplateAstNode(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<StringTemplateAstNode, typeof node> {
  return node.name === stringTemplateAstNodeName;
}

////////////////////////
// String Concat     ///
////////////////////////

export const stringConcatAstNodeName = 'StringConcat';
export interface StringConcatAstNode {
  id: string;
  name: typeof stringConcatAstNodeName;
  constant?: undefined;
  children: KnownOperandAstNode[];
  namedChildren: {
    with_separator?: ConstantAstNode<boolean>;
    separator?: ConstantAstNode<string>;
  };
}

export function NewStringConcatAstNode(
  children: KnownOperandAstNode[],
  { withSeparator, separator }: { withSeparator?: boolean; separator?: string } = {},
): StringConcatAstNode {
  return {
    id: uuidv7(),
    name: stringConcatAstNodeName,
    constant: undefined,
    children,
    namedChildren: {
      with_separator: withSeparator ? NewConstantAstNode({ constant: withSeparator }) : undefined,
      separator: separator ? NewConstantAstNode({ constant: separator }) : undefined,
    },
  };
}

export function isStringConcatAstNode(node: AstNode): node is StringConcatAstNode {
  return node.name === stringConcatAstNodeName;
}
