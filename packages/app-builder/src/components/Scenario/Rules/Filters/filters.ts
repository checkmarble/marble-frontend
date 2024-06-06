import { useTranslation } from 'react-i18next';
import { assertNever } from 'typescript-utils';
import { type IconName } from 'ui-icons';

import { scenarioI18n } from '../../scenario-i18n';

export const rulesFilterNames = ['ruleGroup'] as const;

export type RulesFilterName = (typeof rulesFilterNames)[number];

export function getFilterIcon(filterName: RulesFilterName): IconName {
  switch (filterName) {
    case 'ruleGroup':
      return 'linked-services';
    default:
      assertNever('[RulesFilter] unknown filter:', filterName);
  }
}

export function useFilterLabel(filterName: RulesFilterName) {
  const { t } = useTranslation(scenarioI18n);
  switch (filterName) {
    case 'ruleGroup':
      return t('scenarios:rules.rule_group');
    default:
      assertNever('[RulesFilter] unknown filter:', filterName);
  }
}
