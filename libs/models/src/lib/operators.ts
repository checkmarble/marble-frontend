import {
  type AndOperator,
  type BoolConstantOperator,
  type DbFieldBoolOperator,
  type DbFieldFloatOperator,
  type DbFieldStringOperator,
  type DivideFloatOperator,
  type EqualBoolOperator,
  type EqualFloatOperator,
  type EqualStringOperator,
  type FloatConstantOperator,
  type GreaterFloatOperator,
  type GreaterOrEqualFloatOperator,
  type LesserFloatOperator,
  type LesserOrEqualFloatOperator,
  type Operator,
  type OrOperator,
  type PayloadFieldBoolOperator,
  type PayloadFieldFloatOperator,
  type PayloadFieldStringOperator,
  type ProductFloatOperator,
  type StringConstantOperator,
  type StringIsInListOperator,
  type StringListConstantOperator,
  type SubstractFloatOperator,
  type SumFloatOperator,
} from '@marble-front/api/marble';

/**
 * This file is heavilly based on the actual Operator DTOs from the API.
 *
 * It aims to provide a more convenient way to work with operators.
 * It may be removed once the API is updated to the new AST model
 */

export type DbFieldOperator =
  | DbFieldBoolOperator
  | DbFieldFloatOperator
  | DbFieldStringOperator;

export function isDbFieldOperator(
  operator: Operator
): operator is DbFieldOperator {
  switch (operator.type) {
    case 'DB_FIELD_BOOL':
    case 'DB_FIELD_FLOAT':
    case 'DB_FIELD_STRING':
      return true;
    default:
      return false;
  }
}

export type PayloadFieldOperator =
  | PayloadFieldBoolOperator
  | PayloadFieldStringOperator
  | PayloadFieldFloatOperator;

export function isPayloadFieldOperator(
  operator: Operator
): operator is PayloadFieldOperator {
  switch (operator.type) {
    case 'PAYLOAD_FIELD_BOOL':
    case 'PAYLOAD_FIELD_FLOAT':
    case 'PAYLOAD_FIELD_STRING':
      return true;
    default:
      return false;
  }
}

export type DataFieldOperator = DbFieldOperator | PayloadFieldOperator;

export function isDataFieldOperator(
  operator: Operator
): operator is DataFieldOperator {
  return isDbFieldOperator(operator) || isPayloadFieldOperator(operator);
}

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
