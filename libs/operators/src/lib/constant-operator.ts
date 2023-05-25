import {
  type FalseOperator,
  type FloatScalarOperator,
  type Operator,
  type StringListConstantOperator,
  type StringScalarOperator,
  type TrueOperator,
} from '@marble-front/api/marble';

export type ConstantOperator =
  | FalseOperator
  | TrueOperator
  | FloatScalarOperator
  | StringScalarOperator
  | StringListConstantOperator;

export function isConstantOperator(
  operator: Operator
): operator is ConstantOperator {
  switch (operator.type) {
    case 'TRUE':
    case 'FALSE':
    case 'FLOAT_SCALAR':
    case 'STRING_SCALAR':
    case 'STRING_LIST_CONSTANT':
      return true;
    default:
      return false;
  }
}
