import { v7 as uuidv7 } from 'uuid';

import { type AstNode, type CheckNodeId, type ConstantType, type IdLessAstNode } from './ast-node';

export interface ConstantAstNode<T extends ConstantType = ConstantType> {
  id: string;
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
    id: uuidv7(),
    name: null,
    constant: constant,
    children: [],
    namedChildren: {},
  };
}

export function isConstant(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<ConstantAstNode, typeof node> {
  return !node.name && node.constant !== undefined;
}
