import {
  type AstNode,
  type DatabaseAccessAstNode,
  type PayloadAstNode,
} from './ast-node';

export interface EditorIdentifiersByType {
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
}

// This implementation might be problematic in the future, we might need to standartise each node with something like a hash function
export function getIdentifiersFromAstNode(
  node: AstNode,
  identifiers: EditorIdentifiersByType
) {
  const astString = JSON.stringify(node);
  for (const identifier of identifiers.databaseAccessors) {
    if (astString === JSON.stringify(identifier)) {
      return identifier;
    }
  }

  for (const identifier of identifiers.payloadAccessors) {
    if (astString === JSON.stringify(identifier)) {
      return identifier;
    }
  }

  return null;
}
