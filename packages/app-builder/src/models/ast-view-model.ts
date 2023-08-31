import {
  type AstNode,
  type ConstantType,
  isAstNodeUnknown,
  isConstant,
  isDatabaseAccess,
} from './ast-node';
import {
  type EditorIdentifier,
  type EditorIdentifiersByType,
  getIdentifiersFromAstNode,
} from './identifier';

export interface LabelledAst {
  label: string;
  tooltip: string;
  astNode: AstNode;
}

export function adaptLabelledAst(astNode: AstNode): LabelledAst {
  return {
    label: getAstNodeDisplayName(astNode),
    tooltip: '',
    astNode,
  };
}

export function adaptLabelledAstFromAllIdentifiers(
  astNode: AstNode,
  identifiers: EditorIdentifiersByType
): LabelledAst {
  const identifier = getIdentifiersFromAstNode(astNode, identifiers);
  if (identifier) {
    return adaptLabelledAstFromIdentifier(identifier);
  }
  return {
    label: getAstNodeDisplayName(astNode),
    tooltip: '',
    astNode,
  };
}

export function adaptLabelledAstFromIdentifier(
  identifier: EditorIdentifier
): LabelledAst {
  return {
    label: identifier.name,
    tooltip: identifier.description,
    astNode: identifier.node,
  };
}

function getConstantDisplayName(constant: ConstantType) {
  if (constant === null) return '';

  if (typeof constant === 'string') {
    return `"${constant}"`;
  }

  if (typeof constant === 'number') {
    return constant.toString();
  }

  // Handle other cases when needed
  return constant.toString();
}

function getAstNodeDisplayName(astNode: AstNode) {
  if (isConstant(astNode)) {
    return getConstantDisplayName(astNode.constant);
  }

  if (isDatabaseAccess(astNode)) {
    const { path, fieldName } = astNode.namedChildren;
    return [...path.constant, fieldName.constant].join('.');
  }

  if (isAstNodeUnknown(astNode)) {
    return '';
  }

  // eslint-disable-next-line no-restricted-properties
  if (process.env.NODE_ENV === 'development') {
    console.warn('Unhandled astNode', astNode);
  }
  return '';
}
