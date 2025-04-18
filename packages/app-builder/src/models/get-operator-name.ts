import type { TFunction } from 'i18next';
import { assertNever } from 'typescript-utils';

import { undefinedAstNodeName } from './astNode/ast-node';
import { isOperatorOption } from './operator-options';

export function getOperatorName(
  t: TFunction<['common', 'scenarios'], undefined>,
  operatorName: string,
  isAggregationFilter?: boolean,
): string {
  if (isOperatorOption(operatorName)) {
    switch (operatorName) {
      case '+':
        return '+';
      case '-':
        return '-';
      case '<':
        return isAggregationFilter ? t('scenarios:operator.filter_lt') : '<';
      case '=':
        return isAggregationFilter ? t('scenarios:operator.filter_eq') : '=';
      case '≠':
      case '!=':
        return isAggregationFilter ? t('scenarios:operator.filter_neq') : '≠';
      case '>':
        return isAggregationFilter ? t('scenarios:operator.filter_gt') : '>';
      case '>=':
        return isAggregationFilter ? t('scenarios:operator.filter_gte') : '≥';
      case '<=':
        return isAggregationFilter ? t('scenarios:operator.filter_lte') : '≤';
      case '*':
        return '×';
      case '/':
        return '÷';
      case 'IsInList':
        return isAggregationFilter
          ? t('scenarios:operator.filter_is_in')
          : t('scenarios:operator.is_in');
      case 'IsEmpty':
        return isAggregationFilter
          ? t('scenarios:operator.filter_is_empty')
          : t('scenarios:operator.is_empty');
      case 'IsNotEmpty':
        return isAggregationFilter
          ? t('scenarios:operator.filter_is_not_empty')
          : t('scenarios:operator.is_not_empty');
      case 'IsNotInList':
        return isAggregationFilter
          ? t('scenarios:operator.filter_is_not_in')
          : t('scenarios:operator.is_not_in');
      case 'StringContains':
        return isAggregationFilter
          ? t('scenarios:operator.filter_contains')
          : t('scenarios:operator.contains');
      case 'StringNotContain':
        return isAggregationFilter
          ? t('scenarios:operator.filter_does_not_contain')
          : t('scenarios:operator.does_not_contain');
      case 'StringStartsWith':
        return isAggregationFilter
          ? t('scenarios:operator.filter_starts_with')
          : t('scenarios:operator.starts_with');
      case 'StringEndsWith':
        return isAggregationFilter
          ? t('scenarios:operator.filter_ends_with')
          : t('scenarios:operator.ends_with');
      case 'ContainsAnyOf':
        return isAggregationFilter
          ? t('scenarios:operator.filter_contains_any_of')
          : t('scenarios:operator.contains_any_of');
      case 'ContainsNoneOf':
        return isAggregationFilter
          ? t('scenarios:operator.filter_contains_none_of')
          : t('scenarios:operator.contains_none_of');
      case 'FuzzyMatch':
        return isAggregationFilter ? t('scenarios:operator.filter_fuzzy-match') : '≈';
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

  if (process.env.NODE_ENV === 'development') {
    console.warn('Unhandled operator', operatorName);
  }
  return operatorName;
}
