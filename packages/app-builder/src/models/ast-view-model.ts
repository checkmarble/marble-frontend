import {
  type AstNode,
  type ConstantType,
  isAstNodeEmpty,
  isConstant,
  isDatabaseAccess,
} from './ast-node';
import {
  type EditorIdentifier,
  type EditorIdentifiersByType,
  getIdentifiersFromAstNode,
} from './identifier';

export interface AstViewModel {
  label: string;
  tooltip: string;
  astNode: AstNode;
}

export function adaptAstNodeToViewModel(astNode: AstNode): AstViewModel {
  return {
    label: getAstNodeDisplayName(astNode),
    tooltip: "",
    astNode,
  };
}

export function adaptAstNodeToViewModelFromIdentifier(
  astNode: AstNode,
  identifiers: EditorIdentifiersByType
): AstViewModel {
  const identifier = getIdentifiersFromAstNode(astNode, identifiers)
  if (identifier) {
    return adaptEditorIdentifierToViewModel(identifier);
  }
  return {
    label: getAstNodeDisplayName(astNode),
    tooltip: "",
    astNode,
  };
}

export function adaptEditorIdentifierToViewModel(
  identifier: EditorIdentifier
): AstViewModel {
  return {
    label: identifier.name,
    tooltip: identifier.description,
    astNode: identifier.node,
  };
}
export function adaptAstViewModelToAstNode(
  astViewModel: AstViewModel
): AstNode {
  return astViewModel.astNode;
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

  if (isAstNodeEmpty(astNode)) {
    return '';
  }

  // eslint-disable-next-line no-restricted-properties
  if (process.env.NODE_ENV === 'development') {
    console.warn('Unhandled astNode', astNode);
  }
  return '';
}
