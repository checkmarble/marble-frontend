import { assertNever } from 'typescript-utils';

import { type DecisionFilterName } from '../filters';
import { DecisionsDateRangeFilter } from './DecisionsDateRangeFilter';
import { OutcomeFilter } from './OutcomeFilter';
import { ScenarioFilter } from './ScenarioFilter';
import { TriggerObjectFilter } from './TriggerObjectFilter';

export function FilterDetail({
  filterName,
}: {
  filterName: DecisionFilterName;
}) {
  switch (filterName) {
    case 'dateRange':
      return <DecisionsDateRangeFilter />;
    case 'scenarioId':
      return <ScenarioFilter />;
    case 'outcome':
      return <OutcomeFilter />;
    case 'triggerObject':
      return <TriggerObjectFilter />;
    default:
      assertNever('[DecisionFilter] unknown filter:', filterName);
  }
}
