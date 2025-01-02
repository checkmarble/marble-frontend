import type { TFunction } from 'i18next';
import { assertNever } from 'typescript-utils';

import { undefinedAstNodeName } from './astNode/ast-node';
import { isOperatorFunction } from './modale-operators';

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
      case 'StringStartsWith':
        return t('scenarios:operator.starts_with');
      case 'StringEndsWith':
        return t('scenarios:operator.ends_with');
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

  if (process.env.NODE_ENV === 'development') {
    console.warn('Unhandled operator', operatorName);
  }
  return operatorName;
}
