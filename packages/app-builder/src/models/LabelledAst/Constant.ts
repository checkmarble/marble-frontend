import {
  type ConstantAstNode,
  type ConstantType,
  type DataType,
  type LabelledAst,
} from '@app-builder/models';
import * as R from 'remeda';

export function newConstantLabelledAst(node: ConstantAstNode): LabelledAst {
  return {
    name: getConstantDisplayName(node.constant),
    dataType: getConstantDataType(node.constant),
    operandType: 'Constant',
    astNode: node,
  };
}

export function newEnumConstantLabelledAst(node: ConstantAstNode): LabelledAst {
  return {
    name: getConstantDisplayName(node.constant),
    dataType: getConstantDataType(node.constant),
    operandType: 'Enum',
    astNode: node,
  };
}

export function getConstantDisplayName(constant: ConstantType): string {
  if (R.isNil(constant)) return '';

  if (R.isArray(constant)) {
    return `[${constant.map(getConstantDisplayName).join(', ')}]`;
  }

  if (R.isString(constant)) {
    //TODO(combobox): handle Timestamp here, if we do manipulate them as ISOstring
    return `"${constant.toString()}"`;
  }

  if (R.isNumber(constant) || R.isBoolean(constant)) {
    return constant.toString();
  }

  // Handle other cases when needed
  return JSON.stringify(R.mapValues(constant, getConstantDisplayName));
}

function getConstantDataType(constant: ConstantType): DataType {
  if (R.isString(constant)) {
    //TODO(combobox): handle Timestamp here, if we do manipulate them as ISOstring
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
