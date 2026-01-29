import { v7 as uuidv7 } from 'uuid';

import {
  type AstNode,
  type CheckNodeId,
  type IdLessAstNode,
  isUndefinedAstNode,
  NewUndefinedAstNode,
  type UndefinedAstNode,
} from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';
import { type DataAccessorAstNode, isDataAccessorAstNode } from './data-accessor';

export function isIpHasFlag(node: IdLessAstNode | AstNode): node is CheckNodeId<IpHasFlagAstNode, typeof node> {
  return node.name === ipHasFlagAstNodeName;
}

export function isIpFieldAstNode(node: AstNode): node is IpFieldAstNode {
  return isDataAccessorAstNode(node) || isUndefinedAstNode(node);
}

export const ipHasFlagAstNodeName = 'HasIpFlag';
export const validIpFlags = ['abuse', 'vpn', 'tor_exit_node', 'cloud_provider'] as const;
export type ValidIpFlags = (typeof validIpFlags)[number];

export type IpFieldAstNode = DataAccessorAstNode | UndefinedAstNode;

export interface IpHasFlagAstNode {
  id: string;
  name: typeof ipHasFlagAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    ip: IpFieldAstNode;
    flag: ConstantAstNode<ValidIpFlags>;
  };
}
export function NewIpHasFlagAstNode(
  ipFieldAstNode: IpFieldAstNode = NewUndefinedAstNode(),
  flag: ConstantAstNode<ValidIpFlags> = NewConstantAstNode({
    constant: 'abuse',
  }),
): IpHasFlagAstNode {
  return {
    id: uuidv7(),
    name: ipHasFlagAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      ip: ipFieldAstNode,
      flag,
    },
  };
}
