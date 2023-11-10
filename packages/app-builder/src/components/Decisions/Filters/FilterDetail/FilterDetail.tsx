import { assertNever } from 'typescript-utils';

import { type DecisionFilterName } from '../filters';
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
      return 'dateRange';
    case 'scenarioId':
      return <ScenarioFilter />;
    case 'outcome':
      return <OutcomeFilter />;
    case 'triggerObject':
      return <TriggerObjectFilter />;
    default:
      assertNever('[DecisionFilter] unknwon filter:', filterName);
  }
}
