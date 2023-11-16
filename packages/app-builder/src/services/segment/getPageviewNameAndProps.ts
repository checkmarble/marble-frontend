import { type RouteIDs } from '@app-builder/utils/routes';
import { toUUID } from '@app-builder/utils/short-uuid';
import { type RouteMatch } from '@remix-run/react';

function toUUIDifDefined(val: string | undefined) {
  return val !== undefined ? toUUID(val) : undefined;
}

export default function getPageviewNameAndProps(thisPage: RouteMatch) {
  switch (thisPage.id as RouteIDs) {
    case 'routes/__builder/scenarios/index': {
      return { name: 'Scenarios', properties: undefined };
    }
    case 'routes/__builder/scenarios/$scenarioId/i/$iterationId/__edit-view/trigger': {
      const iterationId = toUUIDifDefined(thisPage.params['iterationId']);
      const scenarioId = toUUIDifDefined(thisPage.params['scenarioId']);
      return {
        name: 'Scenario iteration trigger',
        properties: { iterationId, scenarioId },
      };
    }
    case 'routes/__builder/scenarios/$scenarioId/i/$iterationId/__edit-view/rules': {
      const iterationId = toUUIDifDefined(thisPage.params['iterationId']);
      const scenarioId = toUUIDifDefined(thisPage.params['scenarioId']);
      return {
        name: 'Scenario iteration rules',
        properties: { iterationId, scenarioId },
      };
    }
    case 'routes/__builder/scenarios/$scenarioId/i/$iterationId/__edit-view/decision': {
      const iterationId = toUUIDifDefined(thisPage.params['iterationId']);
      const scenarioId = toUUIDifDefined(thisPage.params['scenarioId']);
      return {
        name: 'Scenario iteration outcome',
        properties: { iterationId, scenarioId },
      };
    }
    case 'routes/__builder/decisions/index': {
      return { name: 'Decisions', properties: undefined };
    }
    case 'routes/__builder/decisions/$decisionId': {
      const decisionId = toUUIDifDefined(thisPage.params['decisionId']);
      return { name: 'Decision', properties: { decisionId } };
    }
    case 'routes/__builder/scheduled-executions': {
      return { name: 'Scheduled executions', properties: undefined };
    }
    case 'routes/__builder/lists/index': {
      return { name: 'Lists', properties: undefined };
    }
    case 'routes/__builder/lists/$listId': {
      const listId = toUUIDifDefined(thisPage.params['listId']);
      return { name: 'List', properties: { listId } };
    }
    case 'routes/__builder/data': {
      return { name: 'Your data', properties: undefined };
    }
    case 'routes/__builder/api': {
      return { name: 'Marble API', properties: undefined };
    }
    default:
      return null;
  }
}
