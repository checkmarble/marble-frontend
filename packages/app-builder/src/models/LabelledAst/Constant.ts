import {
  type ConstantAstNode,
  type ConstantType,
  type DataType,
  type LabelledAst,
} from '@app-builder/models';

export function newConstantLabelledAst(node: ConstantAstNode): LabelledAst {
  return {
    name: getConstantDisplayName(node.constant),
    dataType: getConstantDataType(node.constant),
    astNode: node,
  };
}

export function getConstantDisplayName(constant: ConstantType) {
  if (constant === null) return '';

  if (typeof constant === 'string') {
    //TODO(combobox): handle Timestamp here, if we do manipulate them as ISOstring
    return `"${constant}"`;
  }

  if (typeof constant === 'number') {
    return constant.toString();
  }

  // Handle other cases when needed
  return constant.toString();
}

function getConstantDataType(constant: ConstantType): DataType {
  if (typeof constant === 'string') {
    //TODO(combobox): handle Timestamp here, if we do manipulate them as ISOstring
    return 'String';
  }

  if (typeof constant === 'number') {
    return Number.isInteger(constant) ? 'Int' : 'Float';
  }

  if (typeof constant === 'boolean') {
    return 'Bool';
  }

  return 'unknown';
}
