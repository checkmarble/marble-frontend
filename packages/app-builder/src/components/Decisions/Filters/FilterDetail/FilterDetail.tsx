import { assertNever } from 'typescript-utils';

import { type DecisionFilterName } from '../filters';
import { OutcomeFilter } from './OutcomeFilter';

export function FilterDetail({
  filterName,
}: {
  filterName: DecisionFilterName;
}) {
  switch (filterName) {
    case 'dateRange':
      return 'dateRange';
    case 'scenarioId':
      return 'scenarioId';
    case 'outcome':
      return <OutcomeFilter />;
    case 'triggerObject':
      return 'triggerObject';
    default:
      assertNever('[DecisionFilter] unknwon filter:', filterName);
  }
}
