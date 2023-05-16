import {
  type AndOperator,
  type EqualBoolOperator,
  type Operator,
  type OrOperator,
} from '@marble-front/api/marble';

export type MathOperator = AndOperator | OrOperator | EqualBoolOperator;

export function isMathOperator(operator: Operator): operator is MathOperator {
  switch (operator.type) {
    case 'AND':
    case 'OR':
    case 'EQUAL_BOOL':
      return true;
    default:
      return false;
  }
}
