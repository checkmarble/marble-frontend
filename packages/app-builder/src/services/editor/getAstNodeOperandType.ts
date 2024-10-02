import {
  type AstNode,
  type EnumValue,
  isConstant,
  isCustomListAccess,
  isDataAccessorAstNode,
  isFunctionAstNode,
  isUndefinedAstNode,
} from '@app-builder/models';
import { type OperandType } from '@app-builder/models/editable-ast-node';
import * as R from 'remeda';

interface AstNodeOperandTypeContext {
  enumOptions: EnumValue[];
}

export function getAstNodeOperandType(
  astNode: AstNode,
  context: AstNodeOperandTypeContext,
): OperandType {
  if (isConstant(astNode)) {
    const { constant } = astNode;
    if (
      (R.isNumber(constant) || R.isString(constant)) &&
      context.enumOptions.includes(constant)
    ) {
      return 'Enum';
    }
    return 'Constant';
  }

  if (isCustomListAccess(astNode)) {
    return 'CustomList';
  }

  if (isDataAccessorAstNode(astNode)) {
    return 'Field';
  }

  if (isFunctionAstNode(astNode)) {
    return 'Function';
  }

  if (isUndefinedAstNode(astNode)) {
    return 'Undefined';
  }

  return 'unknown';
}
