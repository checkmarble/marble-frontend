import {
  type ConstantAstNode,
  type ConstantType,
  type DataType,
  type LabelledAst,
} from '@app-builder/models';
import { isArray, isBoolean, isNil, isNumber, isString } from 'remeda';

export function newConstantLabelledAst(node: ConstantAstNode): LabelledAst {
  return {
    name: getConstantDisplayName(node.constant),
    dataType: getConstantDataType(node.constant),
    operandType: 'Constant',
    astNode: node,
  };
}

export function getConstantDisplayName(constant: ConstantType): string {
  if (isNil(constant)) return '';

  if (isArray(constant)) {
    return `[${constant.map(getConstantDisplayName).join(', ')}]`;
  }

  if (isString(constant)) {
    //TODO(combobox): handle Timestamp here, if we do manipulate them as ISOstring
    return `"${constant.toString()}"`;
  }

  if (isNumber(constant) || isBoolean(constant)) {
    return constant.toString();
  }

  // Handle other cases when needed
  return constant.toString();
}

function getConstantDataType(constant: ConstantType): DataType {
  if (isString(constant)) {
    //TODO(combobox): handle Timestamp here, if we do manipulate them as ISOstring
    return 'String';
  }

  if (isNumber(constant)) {
    return Number.isInteger(constant) ? 'Int' : 'Float';
  }

  if (isBoolean(constant)) {
    return 'Bool';
  }

  if (isArray(constant)) {
    if (constant.every(isString)) return 'String[]';
    if (constant.every(isNumber)) {
      return constant.every(Number.isInteger) ? 'Int[]' : 'Float[]';
    }
    if (constant.every(isBoolean)) return 'Bool[]';
  }

  return 'unknown';
}
