import {
  type BoolConstantOperator,
  type FloatConstantOperator,
  type Operator,
  type StringConstantOperator,
  type StringListConstantOperator,
} from '@marble-api';

export type ConstantOperator =
  | BoolConstantOperator
  | FloatConstantOperator
  | StringConstantOperator
  | StringListConstantOperator;

export function isConstantOperator(
  operator: Operator
): operator is ConstantOperator {
  switch (operator.type) {
    case 'BOOL_CONSTANT':
    case 'FLOAT_CONSTANT':
    case 'STRING_CONSTANT':
    case 'STRING_LIST_CONSTANT':
      return true;
    default:
      return false;
  }
}
