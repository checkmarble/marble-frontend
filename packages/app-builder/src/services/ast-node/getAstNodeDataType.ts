import {
  type AstNode,
  type DataModel,
  type DataType,
  isConstant,
  isDataAccessorAstNode,
  isFuzzyMatchComparator,
  isIsMultipleOf,
  isTimeAdd,
  isTimeNow,
  isTimestampExtract,
  type TableModel,
} from '@app-builder/models';
import { dateTimeDataTypeSchema } from '@app-builder/utils/schema/dataTypeSchema';
import * as R from 'remeda';

import { getDataAccessorAstNodeField } from './getDataAccessorAstNodeField';

export function getAstNodeDataType(
  astNode: AstNode,
  context: {
    triggerObjectTable: TableModel;
    dataModel: DataModel;
  },
): DataType {
  if (isConstant(astNode)) {
    const { constant } = astNode;
    if (R.isString(constant)) {
      const parsedConstant = dateTimeDataTypeSchema.safeParse(constant);
      if (parsedConstant.success) {
        return 'Timestamp';
      }
      return 'String';
    }

    if (R.isNumber(constant)) {
      return Number.isInteger(constant) ? 'Int' : 'Float';
    }

    if (R.isBoolean(constant)) {
      return 'Bool';
    }

    if (R.isArray(constant)) {
      if (constant.every(R.isString)) return 'String[]';
      if (constant.every(R.isNumber)) {
        return constant.every(Number.isInteger) ? 'Int[]' : 'Float[]';
      }
      if (constant.every(R.isBoolean)) return 'Bool[]';
    }

    return 'unknown';
  }

  if (isDataAccessorAstNode(astNode)) {
    const field = getDataAccessorAstNodeField(astNode, context);
    return field.dataType;
  }

  if (isFuzzyMatchComparator(astNode) || isIsMultipleOf(astNode)) {
    return 'Bool';
  }

  if (isTimestampExtract(astNode)) {
    return 'Int';
  }

  if (isTimeNow(astNode) || isTimeAdd(astNode)) {
    return 'Timestamp';
  }

  return 'unknown';
}
