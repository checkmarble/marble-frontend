import {
  type AstNode,
  type DataModel,
  type EnumValue,
  isAggregation,
  isConstant,
  isCustomListAccess,
  isDataAccessorAstNode,
  isFuzzyMatchComparator,
  isIsMultipleOf,
  isStringTemplateAstNode,
  isTimeAdd,
  isTimeNow,
  isTimestampExtract,
  isUndefinedAstNode,
  type TableModel,
} from '@app-builder/models';
import { type OperandType } from '@app-builder/models/operand-type';
import * as R from 'remeda';

export function getAstNodeOperandType(
  astNode: AstNode,
  context: {
    triggerObjectTable: TableModel;
    dataModel: DataModel;
    // To distinguish between Enum and Constant operands
    enumValues?: EnumValue[];
  },
): OperandType {
  if (isConstant(astNode)) {
    const { constant } = astNode;
    if (
      R.isDefined(context.enumValues) &&
      context.enumValues.length > 0 &&
      (R.isNumber(constant) || R.isString(constant)) &&
      context.enumValues.includes(constant)
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

  if (
    isAggregation(astNode) ||
    isTimeAdd(astNode) ||
    isTimeNow(astNode) ||
    isFuzzyMatchComparator(astNode) ||
    isTimestampExtract(astNode) ||
    isIsMultipleOf(astNode) ||
    isStringTemplateAstNode(astNode)
  ) {
    return 'Function';
  }

  if (isUndefinedAstNode(astNode)) {
    return 'Undefined';
  }

  return 'unknown';
}
