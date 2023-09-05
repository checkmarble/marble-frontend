import {
  type AstNode,
  type ConstantType,
  isAggregation,
  isAstNodeUnknown,
  isConstant,
  isDatabaseAccess,
  isPayload,
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

export const adaptConstantAstNodeToString = (
  astNode: AstNode | null
): string => {
  if (!astNode || !astNode.constant) {
    return '';
  }
  return String(astNode.constant);
};

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

const getEditorIdentifierName = (identifier: EditorIdentifier): string => {
  if (isAggregation(identifier.node)) {
    return getAggregatorName(identifier.name);
  }
  return identifier.name;
};

export function adaptLabelledAstFromIdentifier(
  identifier: EditorIdentifier
): LabelledAst {
  return {
    label: getEditorIdentifierName(identifier),
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

export function getAstNodeDisplayName(astNode: AstNode): string {
  if (isConstant(astNode)) {
    return getConstantDisplayName(astNode.constant);
  }

  if (isDatabaseAccess(astNode)) {
    const { path, fieldName } = astNode.namedChildren;
    return [...path.constant, fieldName.constant].join('.');
  }

  if (isPayload(astNode)) {
    const payload = astNode.children[0].constant;
    return payload;
  }

  if (isAggregation(astNode)) {
    const { aggregator, label } = astNode.namedChildren;
    if (label == undefined || label.constant == undefined) {
      return getAggregatorName(adaptConstantAstNodeToString(aggregator));
    }
    return adaptConstantAstNodeToString(label);
  }

  if (isAstNodeUnknown(astNode)) {
    return '';
  }

  // eslint-disable-next-line no-restricted-properties
  if (process.env.NODE_ENV === 'development') {
    console.warn('Unhandled astNode', astNode);
  }
  return astNode.name ?? '??';
}

export const getAggregatorName = (aggregatorName: string): string => {
  switch (aggregatorName) {
    case 'AVG':
      return 'Average';
    case 'COUNT':
      return 'Count';
    case 'COUNT_DISTINCT':
      return 'Count distinct';
    case 'MAX':
      return 'Max';
    case 'MIN':
      return 'Min';
    case 'SUM':
      return 'Sum';
    default:
      return aggregatorName;
  }
};
