import { assertNever } from 'typescript-utils';

import { type RulesFilterName } from '../filters';
import { RuleGroupFilter } from './RuleGroupFilter';

export function FilterDetail({ filterName }: { filterName: RulesFilterName }) {
  switch (filterName) {
    case 'ruleGroup':
      return <RuleGroupFilter />;
    default:
      assertNever('[RulesFilter] unknown filter:', filterName);
  }
}
