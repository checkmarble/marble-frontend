import { v7 as uuidv7 } from 'uuid';

import { type AstNode, type CheckNodeId, type IdLessAstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

export const databaseAccessAstNodeName = 'DatabaseAccess';
export interface DatabaseAccessAstNode {
  id: string;
  name: typeof databaseAccessAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    fieldName: ConstantAstNode<string>;
    path: ConstantAstNode<string[]>;
    tableName: ConstantAstNode<string>;
  };
}

export function isDatabaseAccess(
  node: IdLessAstNode,
): node is CheckNodeId<DatabaseAccessAstNode, typeof node> {
  return node.name === databaseAccessAstNodeName;
}

export const payloadAstNodeName = 'Payload';
export interface PayloadAstNode {
  id: string;
  name: typeof payloadAstNodeName;
  constant?: undefined;
  children: [ConstantAstNode<string>];
  namedChildren: Record<string, never>;
}

export function NewPayloadAstNode(field: string): PayloadAstNode {
  return {
    id: uuidv7(),
    name: payloadAstNodeName,
    children: [NewConstantAstNode({ constant: field })],
    namedChildren: {},
  };
}

export function isPayload(node: IdLessAstNode): node is CheckNodeId<PayloadAstNode, typeof node> {
  return node.name === payloadAstNodeName;
}

export type DataAccessorAstNode = DatabaseAccessAstNode | PayloadAstNode;

export function isDataAccessorAstNode(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<DataAccessorAstNode, typeof node> {
  return isDatabaseAccess(node) || isPayload(node);
}
