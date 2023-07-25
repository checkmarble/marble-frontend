import { type Identifier } from "@marble-api";

import { adaptNodeDto, type AstNode } from "./ast-node";

export interface EditorIdentifier {
  name: string;
  description: string;
  node: AstNode;
}

export interface EditorIdentifiersByType {
  databaseAccessors: EditorIdentifier[];
  payloadAccessors: EditorIdentifier[];
  customListAccessors: EditorIdentifier[];
}

// helper
export function NewEditorIdentifier({
  name,
  description,
  node,
}: EditorIdentifier): EditorIdentifier {
  return {
    name: name ?? "",
    description: description ?? "",
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