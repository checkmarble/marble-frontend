import { type AstNode } from './ast-node';
import { type ConstantAstNode } from './constant';

export const databaseAccessAstNodeName = 'DatabaseAccess';
export interface DatabaseAccessAstNode {
  name: typeof databaseAccessAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    fieldName: ConstantAstNode<string>;
    path: ConstantAstNode<string[]>;
    tableName: ConstantAstNode<string>;
  };
}

export function isDatabaseAccess(node: AstNode): node is DatabaseAccessAstNode {
  return node.name === databaseAccessAstNodeName;
}

export const payloadAstNodeName = 'Payload';
export interface PayloadAstNode {
  name: typeof payloadAstNodeName;
  constant?: undefined;
  children: [ConstantAstNode<string>];
  namedChildren: Record<string, never>;
}

export function isPayload(node: AstNode): node is PayloadAstNode {
  return node.name === payloadAstNodeName;
}

export type DataAccessorAstNode = DatabaseAccessAstNode | PayloadAstNode;

export function isDataAccessorAstNode(
  node: AstNode,
): node is DataAccessorAstNode {
  return isDatabaseAccess(node) || isPayload(node);
}
