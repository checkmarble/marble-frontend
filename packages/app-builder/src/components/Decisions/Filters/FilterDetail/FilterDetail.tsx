import { assertNever } from 'typescript-utils';

import { type DecisionFilterName } from '../filters';
import { DateRangeFilter } from './DateRangeFilter';
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
      return <DateRangeFilter />;
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
