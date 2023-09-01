import { type Identifier } from '@marble-api';

import { adaptNodeDto, type AstNode } from './ast-node';

export interface EditorIdentifier {
  name: string;
  description: string;
  node: AstNode;
}

export interface EditorIdentifiersByType {
  databaseAccessors: EditorIdentifier[];
  payloadAccessors: EditorIdentifier[];
  customListAccessors: EditorIdentifier[];
  aggregatorAccessors: EditorIdentifier[];
}

// helper
export function NewEditorIdentifier({
  name,
  description,
  node,
}: EditorIdentifier): EditorIdentifier {
  return {
    name: name ?? '',
    description: description ?? '',
    node: node ?? null,
  };
}

export function adaptIdentifierDto(identifier: Identifier): EditorIdentifier {
  return NewEditorIdentifier({
    name: identifier.name,
    description: identifier.description,
    node: adaptNodeDto(identifier.node),
  });
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
  for (const identifier of identifiers.aggregatorAccessors) {
    if (astString === JSON.stringify(identifier.node)) {
      return identifier;
    }
  }
  return null;
}
