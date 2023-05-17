import {
  type FalseOperator,
  type FloatScalarOperator,
  type Operator,
  type TrueOperator,
} from '@marble-front/api/marble';

export type ConstantOperator =
  | FalseOperator
  | TrueOperator
  | FloatScalarOperator;

export function isConstantOperator(
  operator: Operator
): operator is ConstantOperator {
  switch (operator.type) {
    case 'TRUE':
    case 'FALSE':
    case 'FLOAT_SCALAR':
      return true;
    default:
      return false;
  }
}
