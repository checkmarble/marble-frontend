import {
  type AstNode,
  isAggregation,
  isConstant,
  isDatabaseAccess,
  isPayload,
  isUndefinedAstNode,
} from '../ast-node';
import { getAggregationDisplayName } from './Aggregator';
import { getConstantDisplayName } from './Constant';
import { getDatabaseAccessorDisplayName } from './DatabaseAccessors';
import { getPayloadAccessorsDisplayName } from './PayloadAccessor';
import { getUndefinedDisplayName } from './Undefined';

export interface AstNodeDisplayNameOptions {
  getDefaultDisplayName: (astNode: AstNode) => string | undefined;
}
export const defaultOptions = {
  getDefaultDisplayName: (astNode: AstNode) => astNode.name ?? '??',
};

export function getAstNodeDisplayName(astNode: AstNode): string;
export function getAstNodeDisplayName(
  astNode: AstNode,
  options: { getDefaultDisplayName: (astNode: AstNode) => string },
): string;
export function getAstNodeDisplayName(
  astNode: AstNode,
  options: { getDefaultDisplayName: (astNode: AstNode) => string | undefined },
): string | undefined;

export function getAstNodeDisplayName(
  astNode: AstNode,
  options: AstNodeDisplayNameOptions = defaultOptions,
): string | undefined {
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
