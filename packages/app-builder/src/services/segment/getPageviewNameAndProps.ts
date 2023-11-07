import { type RouteMatch } from '@remix-run/react';

export default function getPageviewNameAndProps(thisPage: RouteMatch) {
  if (thisPage.id === 'routes/login') {
    return { name: 'Login', properties: undefined };
  }

  if (thisPage.id === 'routes/__builder/scenarios/index') {
    return { name: 'Scenarios', properties: undefined };
  }
  if (
    thisPage.id ===
    'routes/__builder/scenarios/$scenarioId/i/$iterationId/__edit-view/trigger'
  ) {
    const iterationId = thisPage.params['iterationId'];
    const scenarioId = thisPage.params['scenarioId'];
    return {
      name: 'Scenario iteration trigger',
      properties: { iterationId, scenarioId },
    };
  }
  if (
    thisPage.id ===
    'routes/__builder/scenarios/$scenarioId/i/$iterationId/__edit-view/rules'
  ) {
    const iterationId = thisPage.params['iterationId'];
    const scenarioId = thisPage.params['scenarioId'];
    return {
      name: 'Scenario iteration rules',
      properties: { iterationId, scenarioId },
    };
  }
  if (
    thisPage.id ===
    'routes/__builder/scenarios/$scenarioId/i/$iterationId/__edit-view/decision'
  ) {
    const iterationId = thisPage.params['iterationId'];
    const scenarioId = thisPage.params['scenarioId'];
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
    const listId = thisPage.params['listId'];
    return { name: 'List', properties: { listId } };
  }

  return { name: undefined, properties: undefined };
}
