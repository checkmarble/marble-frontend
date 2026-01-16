import { type ParseKeys } from 'i18next';
import { type IconName } from 'ui-icons';

export type OperandType =
  | 'Constant'
  | 'CustomList'
  | 'Enum'
  | 'Field'
  | 'Function'
  | 'Undefined'
  | 'Modeling'
  | 'ClientRisk'
  | 'unknown';

export function getOperandTypeIcon(operandType: OperandType): IconName | undefined {
  switch (operandType) {
    case 'CustomList':
      return 'list';
    case 'Field':
      return 'field';
    case 'Function':
      return 'function';
    case 'Enum':
      return 'enum';
    case 'Modeling':
      return 'modeling';
    case 'ClientRisk':
      return 'scan-eye';
    default:
      return undefined;
  }
}

export function getOperandTypeTKey(operandType: OperandType): ParseKeys<'scenarios'> | undefined {
  switch (operandType) {
    case 'CustomList':
      return 'edit_operand.operator_type.list';
    case 'Field':
      return 'edit_operand.operator_type.field';
    case 'Function':
      return 'edit_operand.operator_type.function';
    case 'Enum':
      return 'edit_operand.operator_type.enum';
    case 'Modeling':
      return 'edit_operand.operator_type.modeling';
    case 'ClientRisk':
      return 'edit_operand.operator_type.client_risk';
    default:
      return undefined;
  }
}
