import { v7 as uuidv7 } from 'uuid';

import type { AstNode, CheckNodeId, IdLessAstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

export const customListAccessAstNodeName = 'CustomListAccess';
export interface CustomListAccessAstNode {
  id: string;
  name: typeof customListAccessAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    customListId: ConstantAstNode<string>;
  };
}

export function NewCustomListAstNode(customListId: string): CustomListAccessAstNode {
  return {
    id: uuidv7(),
    name: customListAccessAstNodeName,
    children: [],
    namedChildren: {
      customListId: NewConstantAstNode({ constant: customListId }),
    },
  };
}

export function isCustomListAccess(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<CustomListAccessAstNode, typeof node> {
  return node.name === customListAccessAstNodeName;
}
