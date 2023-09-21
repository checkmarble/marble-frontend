import { type AstBuilder } from '@app-builder/services/editor/ast-editor';

import { type AstNode, isCustomListAccess } from '../ast-node';
import {
  type AstNodeDisplayNameOptions,
  defaultOptions,
  getAstNodeDisplayName,
} from './getAstNodeDisplayName';

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
