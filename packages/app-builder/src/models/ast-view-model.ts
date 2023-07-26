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
} from './identifier';

export interface AstViewModel {
  label: string;
  astNode: AstNode;
}

export function adaptAstNodeToViewModel(astNode: AstNode): AstViewModel {
  return {
    label: getAstNodeDisplayName(astNode),
    astNode,
  };
}

// This implementation might be problematic in the future, we might need to standartise each node with something like a hash function
export function adaptAstNodeToViewModelFromIdentifier(
  astNode: AstNode,
  identifiers: EditorIdentifiersByType
): AstViewModel {
  const astString = JSON.stringify(astNode);
  for (const identifier of identifiers.databaseAccessors) {
    if (astString === JSON.stringify(identifier.node)) {
      return adaptEditorIdentifierToViewModel(identifier);
    }
  }
  for (const identifier of identifiers.customListAccessors) {
    if (astString === JSON.stringify(identifier.node)) {
      return adaptEditorIdentifierToViewModel(identifier);
    }
  }
  for (const identifier of identifiers.payloadAccessors) {
    if (astString === JSON.stringify(identifier.node)) {
      return adaptEditorIdentifierToViewModel(identifier);
    }
  }
  return {
    label: getAstNodeDisplayName(astNode),
    astNode,
  };
}

export function adaptEditorIdentifierToViewModel(
  identifier: EditorIdentifier
): AstViewModel {
  return {
    label: identifier.name,
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
