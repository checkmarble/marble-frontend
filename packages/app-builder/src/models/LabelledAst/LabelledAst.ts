import { type AstNode } from '../ast-node';
import { type DataType } from '../data-model';
import {
  type EditorIdentifiersByType,
  getIdentifiersFromAstNode,
} from '../identifier';
import { getAstNodeDisplayName } from './getAstNodeDisplayName';

//TODO(combobox): find a better naming
export interface LabelledAst {
  name: string;
  description?: string;
  operandType?: string;
  dataType: DataType;
  astNode: AstNode;
}

/**
 * @deprecated Only used in Scenario/Formula/*
 */
export function adaptLabelledAstFromAllIdentifiers(
  astNode: AstNode,
  identifiers: EditorIdentifiersByType
): LabelledAst {
  const identifier = getIdentifiersFromAstNode(astNode, identifiers);
  if (identifier) {
    return adaptLabelledAstFromIdentifier(identifier);
  }
  return {
    name: getAstNodeDisplayName(astNode),
    dataType: 'unknown',
    operandType: '',
    astNode,
  };
}

/**
 * @deprecated Only used adaptLabelledAstFromAllIdentifiers
 */
function adaptLabelledAstFromIdentifier(identifier: AstNode): LabelledAst {
  return {
    name: getAstNodeDisplayName(identifier),
    dataType: 'unknown',
    operandType: '',
    astNode: identifier,
  };
}
