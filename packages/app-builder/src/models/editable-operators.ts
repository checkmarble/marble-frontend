import { type TFunction } from 'i18next';
import { assertNever } from 'typescript-utils';

import {
  type ValidTimestampExtractParts,
  validTimestampExtractParts,
} from './ast-node';

export const undefinedAstNodeName = 'Undefined';

// order is important for sorting
const orderedMainAstOperatorFunctions = [
  '=',
  '≠',
  '<',
  '<=',
  '>',
  '>=',
  '+',
  '-',
  '*',
  '/',
  'IsInList',
  'IsNotInList',
  'StringContains',
  'StringNotContain',
  'ContainsAnyOf',
  'ContainsNoneOf',
  'IsEmpty',
  'IsNotEmpty',
  undefinedAstNodeName,
] as const;

// define a subset of MainAstOperatorFunction with only unary operators
const unaryMainAstOperatorFunctions = ['IsEmpty', 'IsNotEmpty'] as const;
export type UnaryMainAstOperatorFunction =
  (typeof unaryMainAstOperatorFunctions)[number];

export function isUnaryMainAstOperatorFunction(
  value: string,
): value is UnaryMainAstOperatorFunction {
  return (unaryMainAstOperatorFunctions as ReadonlyArray<string>).includes(
    value,
  );
}

// define a subset of MainAstOperatorFunction with only binary operators
const binaryMainAstOperatorFunctions = [
  '=',
  '≠',
  '<',
  '<=',
  '>',
  '>=',
  '+',
  '-',
  '*',
  '/',
  'IsInList',
  'IsNotInList',
  'StringContains',
  'StringNotContain',
  'ContainsAnyOf',
  'ContainsNoneOf',
  undefinedAstNodeName,
] as const;
export type BinaryMainAstOperatorFunction =
  (typeof binaryMainAstOperatorFunctions)[number];

export function isBinaryMainAstOperatorFunction(
  value: string,
): value is BinaryMainAstOperatorFunction {
  return (binaryMainAstOperatorFunctions as ReadonlyArray<string>).includes(
    value,
  );
}

export function isMainAstOperatorFunction(
  value: string,
): value is MainAstOperatorFunction {
  return (
    isBinaryMainAstOperatorFunction(value) ||
    isUnaryMainAstOperatorFunction(value)
  );
}
export type MainAstOperatorFunction =
  | BinaryMainAstOperatorFunction
  | UnaryMainAstOperatorFunction;

export function sortMainAstOperatorFunctions(
  lhs: MainAstOperatorFunction,
  rhs: MainAstOperatorFunction,
) {
  const lhsIndex = orderedMainAstOperatorFunctions.indexOf(lhs);
  const rhsIndex = orderedMainAstOperatorFunctions.indexOf(rhs);
  return lhsIndex - rhsIndex;
}

export const filterOperators = [
  '=',
  '!=',
  '>',
  '<',
  '>=',
  '<=',
  'IsInList',
  'IsNotInList',
] as const;
export type FilterOperator = (typeof filterOperators)[number];

export function isFilterOperator(value: string): value is FilterOperator {
  return (filterOperators as ReadonlyArray<string>).includes(value);
}

export const timeAddOperators = ['+', '-'] as const;
export type TimeAddOperator = (typeof timeAddOperators)[number];

export function isTimeAddOperator(value: string): value is TimeAddOperator {
  return (timeAddOperators as ReadonlyArray<string>).includes(value);
}

export const aggregatorOperators = [
  'AVG',
  'COUNT',
  'COUNT_DISTINCT',
  'MAX',
  'MIN',
  'SUM',
] as const;
export type AggregatorOperator = (typeof aggregatorOperators)[number];

export function isAggregatorOperator(
  value: string,
): value is AggregatorOperator {
  return (aggregatorOperators as ReadonlyArray<string>).includes(value);
}

export type OperatorFunction =
  | MainAstOperatorFunction
  | FilterOperator
  | TimeAddOperator
  | ValidTimestampExtractParts
  | AggregatorOperator;
export function isOperatorFunction(value: string): value is OperatorFunction {
  return (
    isMainAstOperatorFunction(value) ||
    isFilterOperator(value) ||
    isTimeAddOperator(value) ||
    isAggregatorOperator(value) ||
    isTimestampPart(value)
  );
}

function isTimestampPart(value: string): value is ValidTimestampExtractParts {
  return validTimestampExtractParts.includes(
    value as ValidTimestampExtractParts,
  );
}

export function getOperatorName(
  t: TFunction<['common', 'scenarios'], undefined>,
  operatorName: string,
) {
  if (isOperatorFunction(operatorName)) {
    switch (operatorName) {
      case '+':
        return '+';
      case '-':
        return '-';
      case '<':
        return '<';
      case '=':
        return '=';
      case '≠':
      case '!=':
        return '≠';
      case '>':
        return '>';
      case '>=':
        return '≥';
      case '<=':
        return '≤';
      case '*':
        return '×';
      case '/':
        return '÷';
      case 'IsInList':
        return t('scenarios:operator.is_in');
      case 'IsEmpty':
        return t('scenarios:operator.is_empty');
      case 'IsNotEmpty':
        return t('scenarios:operator.is_not_empty');
      case 'IsNotInList':
        return t('scenarios:operator.is_not_in');
      case 'StringContains':
        return t('scenarios:operator.contains');
      case 'StringNotContain':
        return t('scenarios:operator.does_not_contain');
      case 'ContainsAnyOf':
        return t('scenarios:operator.contains_any_of');
      case 'ContainsNoneOf':
        return t('scenarios:operator.contains_none_of');
      case 'AVG':
        return t('scenarios:aggregator.average');
      case 'COUNT':
        return t('scenarios:aggregator.count');
      case 'COUNT_DISTINCT':
        return t('scenarios:aggregator.count_distinct');
      case 'MAX':
        return t('scenarios:aggregator.max');
      case 'MIN':
        return t('scenarios:aggregator.min');
      case 'SUM':
        return t('scenarios:aggregator.sum');
      case 'year':
        return t('scenarios:timestamp_part.year');
      case 'month':
        return t('scenarios:timestamp_part.month');
      case 'day_of_month':
        return t('scenarios:timestamp_part.day_of_month');
      case 'day_of_week':
        return t('scenarios:timestamp_part.day_of_week');
      case 'hour':
        return t('scenarios:timestamp_part.hour');
      case undefinedAstNodeName:
        return '...';
      default:
        assertNever('Untranslated operator', operatorName);
    }
  }
  // eslint-disable-next-line no-restricted-properties
  if (process.env.NODE_ENV === 'development') {
    console.warn('Unhandled operator', operatorName);
  }
  return operatorName;
}
