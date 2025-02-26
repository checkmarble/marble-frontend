import { type AstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

export const customListAccessAstNodeName = 'CustomListAccess';
export interface CustomListAccessAstNode {
  name: typeof customListAccessAstNodeName;
  constant: undefined;
  children: [];
  namedChildren: {
    customListId: ConstantAstNode<string>;
  };
}

export function NewCustomListAstNode(customListId: string): CustomListAccessAstNode {
  return {
    name: customListAccessAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      customListId: NewConstantAstNode({ constant: customListId }),
    },
  };
}

export function isCustomListAccess(node: AstNode): node is CustomListAccessAstNode {
  return node.name === customListAccessAstNodeName;
}
