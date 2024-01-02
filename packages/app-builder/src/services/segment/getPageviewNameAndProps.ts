import { type RouteID } from '@app-builder/utils/routes';
import { toUUID } from '@app-builder/utils/short-uuid';
import { type UIMatch } from '@remix-run/react';

function toUUIDifDefined(val: string | undefined) {
  return val !== undefined ? toUUID(val) : undefined;
}

export default function getPageviewNameAndProps(thisPage: UIMatch) {
  switch (thisPage.id as RouteID) {
    case 'routes/_builder+/scenarios+/_index': {
      return { name: 'Scenarios', properties: undefined };
    }
    case 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/trigger': {
      const iterationId = toUUIDifDefined(thisPage.params['iterationId']);
      const scenarioId = toUUIDifDefined(thisPage.params['scenarioId']);
      return {
        name: 'Scenario iteration trigger',
        properties: { iteration_id: iterationId, scenario_id: scenarioId },
      };
    }
    case 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/rules': {
      const iterationId = toUUIDifDefined(thisPage.params['iterationId']);
      const scenarioId = toUUIDifDefined(thisPage.params['scenarioId']);
      return {
        name: 'Scenario iteration rules',
        properties: { iteration_id: iterationId, scenario_id: scenarioId },
      };
    }
    case 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/decision': {
      const iterationId = toUUIDifDefined(thisPage.params['iterationId']);
      const scenarioId = toUUIDifDefined(thisPage.params['scenarioId']);
      return {
        name: 'Scenario iteration outcome',
        properties: { iteration_id: iterationId, scenario_id: scenarioId },
      };
    }
    case 'routes/_builder+/decisions+/_index': {
      return { name: 'Decisions', properties: undefined };
    }
    case 'routes/_builder+/decisions+/$decisionId': {
      const decisionId = toUUIDifDefined(thisPage.params['decisionId']);
      return { name: 'Decision', properties: { decision_id: decisionId } };
    }
    case 'routes/_builder+/scheduled-executions': {
      return { name: 'Scheduled executions', properties: undefined };
    }
    case 'routes/_builder+/cases+/_index': {
      return { name: 'Cases', properties: undefined };
    }
    case 'routes/_builder+/cases+/$caseId': {
      const case_id = toUUIDifDefined(thisPage.params['caseId']);
      return { name: 'Case', properties: { case_id } };
    }
    case 'routes/_builder+/lists+/_index': {
      return { name: 'Lists', properties: undefined };
    }
    case 'routes/_builder+/lists+/$listId': {
      const listId = toUUIDifDefined(thisPage.params['listId']);
      return { name: 'List', properties: { list_id: listId } };
    }
    case 'routes/_builder+/data': {
      return { name: 'Your data', properties: undefined };
    }
    case 'routes/_builder+/api': {
      return { name: 'Marble API', properties: undefined };
    }
    default:
      return null;
  }
}
