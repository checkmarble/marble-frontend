import { type AstBuilder } from '@app-builder/services/editor/ast-editor';

import {
  type AstNode,
  type ConstantType,
  type DatabaseAccessAstNode,
  isAggregation,
  isAstNodeUnknown,
  isConstant,
  isCustomListAccess,
  isDatabaseAccess,
  isPayload,
  type PayloadAstNode,
} from './ast-node';
import { type DataModelField } from './data-model';
import {
  type EditorIdentifiersByType,
  getIdentifiersFromAstNode,
} from './identifier';

export interface LabelledAst {
  label: string;
  tooltip: string;
  astNode: AstNode;
  dataModelField: DataModelField | null;
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
    dataModelField: null,
  };
}

export function adaptLabelledAstFromIdentifier(
  identifier: AstNode
): LabelledAst {
  return {
    label: getAstNodeDisplayName(identifier),
    tooltip: '',
    astNode: identifier,
    dataModelField: null,
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
): string;
export function getAstNodeLabelName(
  astNode: AstNode,
  builder: AstBuilder,
  options: { getDefaultDisplayName: (astNode: AstNode) => string }
): string;
export function getAstNodeLabelName(
  astNode: AstNode,
  builder: AstBuilder,
  options: { getDefaultDisplayName: (astNode: AstNode) => string | undefined }
): string | undefined;

export function getAstNodeLabelName(
  astNode: AstNode,
  builder: AstBuilder,
  options: AstNodeDisplayNameOptions = defaultOptions
): string | undefined {
  if (isCustomListAccess(astNode)) {
    const customList = builder.customLists.find(
      (customList) =>
        customList.id === astNode.namedChildren.customListId.constant
    );
    return customList?.name ?? 'Unknown list';
  }

  return getAstNodeDisplayName(astNode, options);
}

export function databaseAccessorDisplayName(
  node: DatabaseAccessAstNode
): string {
  const { path, fieldName } = node.namedChildren;
  return [...path.constant, fieldName.constant].join('.');
}

export function payloadAccessorsDisplayName(node: PayloadAstNode): string {
  return node.children[0].constant;
}

interface AstNodeDisplayNameOptions {
  getDefaultDisplayName: (astNode: AstNode) => string | undefined;
}
const defaultOptions = {
  getDefaultDisplayName: (astNode: AstNode) => astNode.name ?? '??',
};

export function getAstNodeDisplayName(astNode: AstNode): string;
export function getAstNodeDisplayName(
  astNode: AstNode,
  options: { getDefaultDisplayName: (astNode: AstNode) => string }
): string;
export function getAstNodeDisplayName(
  astNode: AstNode,
  options: { getDefaultDisplayName: (astNode: AstNode) => string | undefined }
): string | undefined;

export function getAstNodeDisplayName(
  astNode: AstNode,
  options: AstNodeDisplayNameOptions = defaultOptions
): string | undefined {
  if (isConstant(astNode)) {
    return getConstantDisplayName(astNode.constant);
  }

  if (isDatabaseAccess(astNode)) {
    return databaseAccessorDisplayName(astNode);
  }

  if (isPayload(astNode)) {
    return payloadAccessorsDisplayName(astNode);
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

  return options.getDefaultDisplayName(astNode);
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
