import {
  type DbFieldBoolOperator,
  type DbFieldFloatOperator,
  type DbFieldStringOperator,
  type Operator,
  type PayloadFieldBoolOperator,
  type PayloadFieldFloatOperator,
  type PayloadFieldStringOperator,
} from '@marble-front/api/marble';

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

export type DataFieldOperator =
  | DbFieldOperator
  | PayloadFieldOperator
  | PayloadFieldStringOperator;

export function isDataFieldOperator(
  operator: Operator
): operator is DataFieldOperator {
  return isDbFieldOperator(operator) || isPayloadFieldOperator(operator);
}
