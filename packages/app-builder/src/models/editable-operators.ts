import { type TFunction } from 'i18next';
import { assertNever } from 'typescript-utils';

export const undefinedAstNodeName = 'Undefined';

const twoLineOperandOperatorFunctions = [
  undefinedAstNodeName,
  '+',
  '-',
  '<',
  '<=',
  '=',
  '≠',
  '>',
  '>=',
  '*',
  '/',
  'IsInList',
  'IsNotInList',
  'StringContains',
  'StringNotContain',
  'ContainsAnyOf',
  'ContainsNoneOf',
] as const;
export type TwoLineOperandOperatorFunction =
  (typeof twoLineOperandOperatorFunctions)[number];

export function isTwoLineOperandOperatorFunction(
  value: string,
): value is TwoLineOperandOperatorFunction {
  return (twoLineOperandOperatorFunctions as ReadonlyArray<string>).includes(
    value,
  );
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

export const fuzzyMatchAlgorithms = [
  'ratio',
  'partial_ratio',
  'token_sort_ratio',
  'partial_token_sort_ratio',
  'token_set_ratio',
  'partial_token_set_ratio',
] as const;
export type FuzzyMatchAlgorithm = (typeof fuzzyMatchAlgorithms)[number];

export function isFuzzyMatchAlgorithm(
  value: string,
): value is AggregatorOperator {
  return (aggregatorOperators as ReadonlyArray<string>).includes(value);
}

export type OperatorFunction =
  | TwoLineOperandOperatorFunction
  | FilterOperator
  | TimeAddOperator
  | AggregatorOperator
  | FuzzyMatchAlgorithm;
export function isOperatorFunction(value: string): value is OperatorFunction {
  return (
    isTwoLineOperandOperatorFunction(value) ||
    isFilterOperator(value) ||
    isTimeAddOperator(value) ||
    isAggregatorOperator(value) ||
    isFuzzyMatchAlgorithm(value)
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
      case 'ratio':
        return 'ratio';
      case 'partial_ratio':
        return 'partial_ratio';
      case 'token_sort_ratio':
        return 'token_sort_ratio';
      case 'partial_token_sort_ratio':
        return 'partial_token_sort_ratio';
      case 'token_set_ratio':
        return 'token_set_ratio';
      case 'partial_token_set_ratio':
        return 'partial_token_set_ratio';
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
