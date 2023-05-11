import {
  type DBFieldBoolOperator,
  type Operator,
  type PayloadFieldBoolOperator,
} from './operators';

export type DBFieldOperator = DBFieldBoolOperator;

export function isDBFieldOperator(
  operator: Operator
): operator is DBFieldOperator {
  switch (operator.type) {
    case 'DB_FIELD_BOOL':
      return true;
    default:
      return false;
  }
}

export type PayloadFieldOperator = PayloadFieldBoolOperator;

export function isPayloadFieldOperator(
  operator: Operator
): operator is PayloadFieldOperator {
  switch (operator.type) {
    case 'PAYLOAD_FIELD_BOOL':
      return true;
    default:
      return false;
  }
}

export type DataFieldOperator = DBFieldOperator | PayloadFieldOperator;

export function isDataFieldOperator(
  operator: Operator
): operator is DataFieldOperator {
  return isDBFieldOperator(operator) || isPayloadFieldOperator(operator);
}
