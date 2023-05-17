import {
  type AndOperator,
  type DivideFloatOperator,
  type EqualBoolOperator,
  type Operator,
  type OrOperator,
  type ProductFloatOperator,
  type StringIsInListOperator,
  type SubstractFloatOperator,
  type SumFloatOperator,
} from '@marble-front/api/marble';

export type MathOperator =
  | AndOperator
  | OrOperator
  | EqualBoolOperator
  | SumFloatOperator
  | DivideFloatOperator
  | SubstractFloatOperator
  | ProductFloatOperator
  | StringIsInListOperator;

export function isMathOperator(operator: Operator): operator is MathOperator {
  switch (operator.type) {
    case 'AND':
    case 'OR':
    case 'EQUAL_BOOL':
    case 'SUM_FLOAT':
    case 'DIVIDE_FLOAT':
    case 'SUBTRACT_FLOAT':
    case 'PRODUCT_FLOAT':
    case 'STRING_IS_IN_LIST':
      return true;
    default:
      return false;
  }
}
