import { toUUID } from '@app-builder/utils/short-uuid';
import { type RouteMatch } from '@remix-run/react';

function toUUIDifDefined(val: string | undefined) {
  return val !== undefined ? toUUID(val) : undefined;
}

export default function getPageviewNameAndProps(thisPage: RouteMatch) {
  if (thisPage.id === 'routes/__builder/scenarios/index') {
    return { name: 'Scenarios', properties: undefined };
  }
  if (
    thisPage.id ===
    'routes/__builder/scenarios/$scenarioId/i/$iterationId/__edit-view/trigger'
  ) {
    const iterationId = toUUIDifDefined(thisPage.params['iterationId']);
    const scenarioId = toUUIDifDefined(thisPage.params['scenarioId']);
    return {
      name: 'Scenario iteration trigger',
      properties: { iterationId, scenarioId },
    };
  }
  if (
    thisPage.id ===
    'routes/__builder/scenarios/$scenarioId/i/$iterationId/__edit-view/rules'
  ) {
    const iterationId = toUUIDifDefined(thisPage.params['iterationId']);
    const scenarioId = toUUIDifDefined(thisPage.params['scenarioId']);
    return {
      name: 'Scenario iteration rules',
      properties: { iterationId, scenarioId },
    };
  }
  if (
    thisPage.id ===
    'routes/__builder/scenarios/$scenarioId/i/$iterationId/__edit-view/decision'
  ) {
    const iterationId = toUUIDifDefined(thisPage.params['iterationId']);
    const scenarioId = toUUIDifDefined(thisPage.params['scenarioId']);
    return {
      name: 'Scenario iteration outcome',
      properties: { iterationId, scenarioId },
    };
  }

  if (thisPage.id === 'routes/__builder/decisions/last-decisions') {
    return { name: 'Decisions', properties: undefined };
  }

  if (thisPage.id === 'routes/__builder/lists/index') {
    return { name: 'Lists', properties: undefined };
  }
  if (thisPage.id === 'routes/__builder/lists/$listId') {
    const listId = toUUIDifDefined(thisPage.params['listId']);
    return { name: 'List', properties: { listId } };
  }

  return null;
}
