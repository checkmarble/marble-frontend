import { type IdentifierDto } from '@marble-api';

import { adaptAstNode, type AstNode } from './ast-node';

export interface EditorIdentifier {
  node: AstNode;
}

export interface EditorIdentifiersByType {
  databaseAccessors: EditorIdentifier[];
  payloadAccessors: EditorIdentifier[];
  customListAccessors: EditorIdentifier[];
  aggregatorAccessors: EditorIdentifier[];
}

export function adaptEditorIdentifier(
  identifier: IdentifierDto
): EditorIdentifier {
  return {
    node: adaptAstNode(identifier.node),
  };
}

// This implementation might be problematic in the future, we might need to standartise each node with something like a hash function
export function getIdentifiersFromAstNode(
  node: AstNode,
  identifiers: EditorIdentifiersByType
) {
  const astString = JSON.stringify(node);
  for (const identifier of identifiers.databaseAccessors) {
    if (astString === JSON.stringify(identifier.node)) {
      return identifier;
    }
  }
  for (const identifier of identifiers.customListAccessors) {
    if (astString === JSON.stringify(identifier.node)) {
      return identifier;
    }
  }
  for (const identifier of identifiers.payloadAccessors) {
    if (astString === JSON.stringify(identifier.node)) {
      return identifier;
    }
  }

  return null;
}

export function getAggregationFromAstNode(
  node: AstNode,
  identifiers: EditorIdentifiersByType
) {
  for (const identifier of identifiers.aggregatorAccessors) {
    if (node.name === identifier.node.name) {
      return identifier;
    }
  }
  return null;
}
