import {
  type DbFieldBoolOperator,
  type Operator,
  type PayloadFieldBoolOperator,
} from '@marble-front/api/marble';

export type DbFieldOperator = DbFieldBoolOperator;

export function isDbFieldOperator(
  operator: Operator
): operator is DbFieldOperator {
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

export type DataFieldOperator = DbFieldOperator | PayloadFieldOperator;

export function isDataFieldOperator(
  operator: Operator
): operator is DataFieldOperator {
  return isDbFieldOperator(operator) || isPayloadFieldOperator(operator);
}
