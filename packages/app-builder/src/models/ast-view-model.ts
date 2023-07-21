import {
  type AstNode,
  type ConstantType,
  isAstNodeEmpty,
  isConstant,
  isDatabaseAccess,
} from './ast-node';

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
