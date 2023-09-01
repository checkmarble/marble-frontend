import { type AstNode } from './ast-node';
import {
  type EditorIdentifiersByType,
  getAggregationFromAstNode,
  getIdentifiersFromAstNode,
} from './identifier';

/**
 * This file is heavilly based on the actual Operator DTOs from the API.
 *
 * It aims to provide a more convenient way to work with operators.
 * It may be removed once the API is updated to the new AST model
 */

export function isConstantNode(node: AstNode) {
  if (node.name === null) {
    return true;
  }
  return false;
}

export function isMathAst(node: AstNode) {
  switch (node.name) {
    case 'And':
    case 'Or':
    case '=':
    case '+':
    case '/':
    case '-':
    case '*':
    case 'IsInList':
    case '>':
    case '<':
      return true;
    default:
      return false;
  }
}

export function isPayload(node: AstNode) {
  if (node.name === 'Payload') return true;
  return false;
}

export function isIdentifier(
  node: AstNode,
  identifiers: EditorIdentifiersByType
) {
  if (getIdentifiersFromAstNode(node, identifiers)) return true;
  return false;
}

export function isAggregationIdentifier(
  node: AstNode,
  identifiers: EditorIdentifiersByType
) {
  if (getAggregationFromAstNode(node, identifiers)) return true;
  return false;
}
