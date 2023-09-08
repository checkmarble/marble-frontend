import { type AstBuilder } from '@app-builder/services/editor/ast-editor';
import { type CustomList } from '@marble-api';

import {
  type AstNode,
  type ConstantType,
  isAggregation,
  isAstNodeUnknown,
  isConstant,
  isCustomListAccess,
  isDatabaseAccess,
  isPayload,
  NewCustomListAstNode,
} from './ast-node';
import {
  type EditorIdentifiersByType,
  getIdentifiersFromAstNode,
} from './identifier';

export interface LabelledAst {
  label: string;
  tooltip: string;
  astNode: AstNode;
}

export function adaptLabelledAst(
  astNode: AstNode,
  builder: AstBuilder
): LabelledAst {
  return {
    label: getAstNodeLabelName(astNode, builder),
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

export function adaptLabelledAstFromIdentifier(
  identifier: AstNode
): LabelledAst {
  return {
    label: getAstNodeDisplayName(identifier),
    tooltip: '',
    astNode: identifier,
  };
}

export function adaptLabelledAstFromCustomList(
  customList: CustomList
): LabelledAst {
  return {
    label: customList.name ?? '',
    tooltip: customList.description ?? '',
    astNode: NewCustomListAstNode(customList.id),
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

export function getAstNodeLabelName(
  astNode: AstNode,
  builder: AstBuilder
): string {
  if (isCustomListAccess(astNode)) {
    const customList = builder.customLists.find(
      (customList) =>
        customList.id === astNode.namedChildren.customListId.constant
    );
    return customList?.name ?? 'Unknown list';
  }

  return getAstNodeDisplayName(astNode);
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
    if (label?.constant != undefined && label?.constant != '') {
      return adaptConstantAstNodeToString(label);
    }
    return getAggregatorName(adaptConstantAstNodeToString(aggregator));
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
