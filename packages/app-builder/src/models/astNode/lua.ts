import { v7 as uuidv7 } from 'uuid';

import { type AstNode, type CheckNodeId, type IdLessAstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

export const luaAstNodeName = 'Lua';
export interface LuaAstNode {
  id: string;
  name: typeof luaAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    code: ConstantAstNode<string>;
  };
}

export function NewLuaAstNode(code: ConstantAstNode<string> = NewConstantAstNode({ constant: '' })): LuaAstNode {
  return {
    id: uuidv7(),
    name: luaAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      code,
    },
  };
}

export function isLua(node: IdLessAstNode | AstNode): node is CheckNodeId<LuaAstNode, typeof node> {
  return node.name === luaAstNodeName;
}
