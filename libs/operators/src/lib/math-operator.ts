import {
  type AndOperator,
  type DivideFloatOperator,
  type EqualBoolOperator,
  type EqualFloatOperator,
  type EqualStringOperator,
  type GreaterFloatOperator,
  type GreaterOrEqualFloatOperator,
  type LesserFloatOperator,
  type LesserOrEqualFloatOperator,
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
  | EqualFloatOperator
  | EqualStringOperator
  | SumFloatOperator
  | DivideFloatOperator
  | SubstractFloatOperator
  | ProductFloatOperator
  | GreaterFloatOperator
  | GreaterOrEqualFloatOperator
  | LesserFloatOperator
  | LesserOrEqualFloatOperator
  | StringIsInListOperator;

export function isMathOperator(operator: Operator): operator is MathOperator {
  switch (operator.type) {
    case 'AND':
    case 'OR':
    case 'EQUAL_BOOL':
    case 'EQUAL_FLOAT':
    case 'EQUAL_STRING':
    case 'SUM_FLOAT':
    case 'DIVIDE_FLOAT':
    case 'SUBTRACT_FLOAT':
    case 'PRODUCT_FLOAT':
    case 'STRING_IS_IN_LIST':
    case 'GREATER_FLOAT':
    case 'GREATER_OR_EQUAL_FLOAT':
    case 'LESSER_FLOAT':
    case 'LESSER_OR_EQUAL_FLOAT':
      return true;
    default:
      return false;
  }
}
