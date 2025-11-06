import { v7 as uuidv7 } from 'uuid';

import { type AstNode, type CheckNodeId, type IdLessAstNode, NewUndefinedAstNode } from './ast-node';
import { type KnownOperandAstNode } from './builder-ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

export const isMultipleOfAstNodeName = 'IsMultipleOf';
export interface IsMultipleOfAstNode {
  id: string;
  name: typeof isMultipleOfAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    value: KnownOperandAstNode;
    divider: ConstantAstNode<number>;
  };
}

export function NewIsMultipleOfAstNode(
  value: KnownOperandAstNode = NewUndefinedAstNode(),
  divider: ConstantAstNode<number> = NewConstantAstNode({ constant: 1 }),
): IsMultipleOfAstNode {
  return {
    id: uuidv7(),
    name: isMultipleOfAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      value,
      divider,
    },
  };
}

export function isIsMultipleOf(node: IdLessAstNode | AstNode): node is CheckNodeId<IsMultipleOfAstNode, typeof node> {
  return node.name === isMultipleOfAstNodeName;
}
