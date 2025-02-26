import { assertNever } from 'typescript-utils';

import { type DecisionFilterName } from '../filters';
import { CaseInboxFilter } from './CaseInboxFilter';
import { DecisionsDateRangeFilter } from './DecisionsDateRangeFilter';
import { HasCaseFilter } from './HasCaseFilter';
import { OutcomeAndReviewStatusFilter } from './OutcomeAndReviewStatusFilter';
import { PivotValueFilter } from './PivotValueFilter';
import { ScenarioFilter } from './ScenarioFilter';
import { ScheduledExecutionFilter } from './ScheduledExecutionFilter';
import { TriggerObjectFilter } from './TriggerObjectFilter';

export function FilterDetail({ filterName }: { filterName: DecisionFilterName }) {
  switch (filterName) {
    case 'dateRange':
      return <DecisionsDateRangeFilter />;
    case 'scenarioId':
      return <ScenarioFilter />;
    case 'caseInboxId':
      return <CaseInboxFilter />;
    case 'outcomeAndReviewStatus':
      return <OutcomeAndReviewStatusFilter />;
    case 'triggerObject':
      return <TriggerObjectFilter />;
    case 'hasCase':
      return <HasCaseFilter />;
    case 'pivotValue':
      return <PivotValueFilter />;
    case 'scheduledExecutionId':
      return <ScheduledExecutionFilter />;
    default:
      assertNever('[DecisionFilter] unknown filter:', filterName);
  }
}
