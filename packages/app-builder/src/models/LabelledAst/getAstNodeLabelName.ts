import { type AstBuilder } from '@app-builder/services/editor/ast-editor';

import {
  type AstNode,
  isAggregation,
  isConstant,
  isCustomListAccess,
  isDatabaseAccess,
  isPayload,
  isUndefinedAstNode,
} from '../ast-node';
import {
  getAggregationDisplayName,
  getConstantDisplayName,
  getDatabaseAccessorDisplayName,
  getPayloadAccessorsDisplayName,
  getUndefinedDisplayName,
} from '.';

export interface AstNodeDisplayNameOptions {
  getDefaultDisplayName: (astNode: AstNode) => string | undefined;
}
export const defaultOptions = {
  getDefaultDisplayName: (astNode: AstNode) => astNode.name ?? '??',
};

export function getAstNodeLabelName(
  astNode: AstNode,
  builder: AstBuilder,
): string;
export function getAstNodeLabelName(
  astNode: AstNode,
  builder: AstBuilder,
  options: { getDefaultDisplayName: (astNode: AstNode) => string },
): string;
export function getAstNodeLabelName(
  astNode: AstNode,
  builder: AstBuilder,
  options: { getDefaultDisplayName: (astNode: AstNode) => string | undefined },
): string | undefined;

export function getAstNodeLabelName(
  astNode: AstNode,
  builder: AstBuilder,
  options: AstNodeDisplayNameOptions = defaultOptions,
): string | undefined {
  if (isCustomListAccess(astNode)) {
    const customList = builder.input.customLists.find(
      (customList) =>
        customList.id === astNode.namedChildren.customListId.constant,
    );
    return customList?.name ?? 'Unknown list';
  }

  if (isConstant(astNode)) {
    return getConstantDisplayName(astNode.constant);
  }

  if (isDatabaseAccess(astNode)) {
    return getDatabaseAccessorDisplayName(astNode);
  }

  if (isPayload(astNode)) {
    return getPayloadAccessorsDisplayName(astNode);
  }

  if (isAggregation(astNode)) {
    return getAggregationDisplayName(astNode);
  }

  if (isUndefinedAstNode(astNode)) {
    return getUndefinedDisplayName();
  }

  return options.getDefaultDisplayName(astNode);
}
