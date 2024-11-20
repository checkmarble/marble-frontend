import { type TFunction } from 'i18next';
import { assertNever } from 'typescript-utils';

export const undefinedAstNodeName = 'Undefined';

// order is important for sorting
const mainAstOperatorFunctions = [
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
export type MainAstOperatorFunction = (typeof mainAstOperatorFunctions)[number];

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
  return (mainAstOperatorFunctions as ReadonlyArray<string>).includes(value);
}

export function sortMainAstOperatorFunctions(
  lhs: MainAstOperatorFunction,
  rhs: MainAstOperatorFunction,
) {
  const lhsIndex = mainAstOperatorFunctions.indexOf(lhs);
  const rhsIndex = mainAstOperatorFunctions.indexOf(rhs);
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
  | AggregatorOperator;
export function isOperatorFunction(value: string): value is OperatorFunction {
  return (
    isMainAstOperatorFunction(value) ||
    isFilterOperator(value) ||
    isTimeAddOperator(value) ||
    isAggregatorOperator(value)
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
        return 'IsEmpty'; // TODO add trad
      case 'IsNotEmpty':
        return 'IsNotEmpty'; // TODO add trad
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
