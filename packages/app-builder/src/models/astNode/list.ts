import { v7 as uuidv7 } from 'uuid';

import { type AstNode } from './ast-node';
import { isKnownOperandAstNode, type KnownOperandAstNode } from './builder-ast-node';

export const listAstNodeName = 'List';

export interface ListAstNode<Child extends AstNode = KnownOperandAstNode> {
  id: string;
  name: typeof listAstNodeName;
  constant?: undefined;
  children: Child[];
  namedChildren: Record<string, never>;
}

export function NewListAstNode<Child extends AstNode = KnownOperandAstNode>(
  children: Child[] = [],
): ListAstNode<Child> {
  return {
    id: uuidv7(),
    name: listAstNodeName,
    constant: undefined,
    children,
    namedChildren: {},
  };
}

export function isListAstNode(node: AstNode): node is ListAstNode<AstNode> {
  return node.name === listAstNodeName;
}

export function isKnownOperandListAstNode(node: AstNode): node is ListAstNode<KnownOperandAstNode> {
  return isListAstNode(node) && node.children.every(isKnownOperandAstNode);
}
