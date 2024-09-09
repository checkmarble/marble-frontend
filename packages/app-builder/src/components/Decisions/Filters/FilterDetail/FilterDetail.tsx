import { assertNever } from 'typescript-utils';

import { type DecisionFilterName } from '../filters';
import { DecisionsDateRangeFilter } from './DecisionsDateRangeFilter';
import { HasCaseFilter } from './HasCaseFilter';
import { InboxFilter } from './InboxFilter';
import { OutcomeFilter } from './OutcomeFilter';
import { PivotValueFilter } from './PivotValueFilter';
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
    case 'inboxId':
      return <InboxFilter />;
    case 'outcome':
      return <OutcomeFilter />;
    case 'triggerObject':
      return <TriggerObjectFilter />;
    case 'hasCase':
      return <HasCaseFilter />;
    case 'pivotValue':
      return <PivotValueFilter />;
    default:
      assertNever('[DecisionFilter] unknown filter:', filterName);
  }
}
