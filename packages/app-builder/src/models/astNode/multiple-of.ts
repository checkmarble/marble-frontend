import { type AstNode, NewUndefinedAstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

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

export function isIsMultipleOf(node: AstNode): node is IsMultipleOfAstNode {
  return node.name === isMultipleOfAstNodeName;
}
