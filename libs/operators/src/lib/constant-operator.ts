import {
  type FalseOperator,
  type Operator,
  type TrueOperator,
} from './operators';

export type ConstantOperator = FalseOperator | TrueOperator;

export function isConstantOperator(
  operator: Operator
): operator is ConstantOperator {
  switch (operator.type) {
    case 'TRUE':
    case 'FALSE':
      return true;
    default:
      return false;
  }
}
