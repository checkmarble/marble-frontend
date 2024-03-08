import { type DataType, type LabelledAst } from '@app-builder/models';
import { type ParseKeys } from 'i18next';
import { type IconName } from 'ui-icons';

export function getDataTypeIcon(dataType?: DataType): IconName | undefined {
  switch (dataType) {
    case 'Timestamp':
      return 'schedule';
    case 'String':
      return 'string';
    case 'Int':
    case 'Float':
      return 'number';
    case 'Bool':
      return 'boolean';
    default:
      return undefined;
  }
}

export function getDataTypeTKey(
  dataType?: DataType,
): ParseKeys<'scenarios'> | undefined {
  switch (dataType) {
    case 'String':
      return 'edit_operand.data_type.string';
    case 'Int':
    case 'Float':
      return 'edit_operand.data_type.number';
    case 'Bool':
      return 'edit_operand.data_type.boolean';
    case 'Timestamp':
      return 'edit_operand.data_type.timestamp';
    default:
      return undefined;
  }
}

export function getOperatorTypeIcon(
  operatorType: LabelledAst['operandType'],
): IconName | undefined {
  switch (operatorType) {
    case 'CustomList':
      return 'list';
    case 'Field':
      return 'field';
    case 'Function':
      return 'function';
    case 'Enum':
      return 'enum';
    default:
      return undefined;
  }
}

export function getOperatorTypeTKey(
  operatorType: LabelledAst['operandType'],
): ParseKeys<'scenarios'> | undefined {
  switch (operatorType) {
    case 'CustomList':
      return 'edit_operand.operator_type.list';
    case 'Field':
      return 'edit_operand.operator_type.field';
    case 'Function':
      return 'edit_operand.operator_type.function';
    case 'Enum':
      return 'edit_operand.operator_type.enum';
    default:
      return undefined;
  }
}

export function getConstantDataTypeTKey(
  dataType?: DataType,
): ParseKeys<'scenarios'> | undefined {
  switch (dataType) {
    case 'String':
      return 'edit_operand.constant.use_data_type.string';
    case 'Int':
    case 'Float':
      return 'edit_operand.constant.use_data_type.number';
    case 'Bool':
      return 'edit_operand.constant.use_data_type.boolean';
    case 'String[]':
      return 'edit_operand.constant.use_data_type.string[]';
    case 'Int[]':
    case 'Float[]':
      return 'edit_operand.constant.use_data_type.number[]';
    case 'Bool[]':
      return 'edit_operand.constant.use_data_type.boolean[]';
    default:
      return undefined;
  }
}
