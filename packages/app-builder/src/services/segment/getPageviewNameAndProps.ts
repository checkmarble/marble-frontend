import { shortUUIDSchema } from '@app-builder/utils/schema/shortUUIDSchema';
import { type AnyRouteMatch } from '@tanstack/react-router';
import * as z from 'zod/v4';

interface PageViewNameAndProps {
  name: string;
  properties: Record<string, string> | undefined;
}

export function getPageViewNameAndProps(thisPage: AnyRouteMatch): PageViewNameAndProps | undefined {
  switch (thisPage.id) {
    case 'routes/_builder/detection/scenarios/index': {
      return { name: 'Scenarios', properties: undefined };
    }
    case 'routes/_builder/detection/scenarios/$scenarioId/scheduled-executions': {
      const safeParseProperties = z
        .object({
          scenarioId: shortUUIDSchema,
        })
        .safeParse(thisPage.params);
      if (!safeParseProperties.success) return;

      return {
        name: 'Scheduled executions',
        properties: {
          scenario_id: safeParseProperties.data.scenarioId,
        },
      };
    }
    case 'routes/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/trigger': {
      const safeParseProperties = z
        .object({
          iterationId: shortUUIDSchema,
          scenarioId: shortUUIDSchema,
        })
        .safeParse(thisPage.params);
      if (!safeParseProperties.success) return;

      return {
        name: 'Scenario iteration trigger',
        properties: {
          iteration_id: safeParseProperties.data.iterationId,
          scenario_id: safeParseProperties.data.scenarioId,
        },
      };
    }
    case 'routes/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/rules': {
      const safeParseProperties = z
        .object({
          iterationId: shortUUIDSchema,
          scenarioId: shortUUIDSchema,
        })
        .safeParse(thisPage.params);
      if (!safeParseProperties.success) return;

      return {
        name: 'Scenario iteration rules',
        properties: {
          iteration_id: safeParseProperties.data.iterationId,
          scenario_id: safeParseProperties.data.scenarioId,
        },
      };
    }
    case 'routes/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/decision': {
      const safeParseProperties = z
        .object({
          iterationId: shortUUIDSchema,
          scenarioId: shortUUIDSchema,
        })
        .safeParse(thisPage.params);
      if (!safeParseProperties.success) return;

      return {
        name: 'Scenario iteration outcome',
        properties: {
          iteration_id: safeParseProperties.data.iterationId,
          scenario_id: safeParseProperties.data.scenarioId,
        },
      };
    }
    case 'routes/_builder/detection/decisions/index': {
      return { name: 'Decisions', properties: undefined };
    }
    case 'routes/_builder/detection/decisions/$decisionId': {
      const safeParseProperties = z
        .object({
          decisionId: shortUUIDSchema,
        })
        .safeParse(thisPage.params);
      if (!safeParseProperties.success) return;

      return {
        name: 'Decision',
        properties: {
          decision_id: safeParseProperties.data.decisionId,
        },
      };
    }
    case 'routes/_builder/cases/index': {
      return { name: 'Cases', properties: undefined };
    }
    case 'routes/_builder/detection/lists/index': {
      return { name: 'Lists', properties: undefined };
    }
    case 'routes/_builder/detection/lists/$listId': {
      const safeParseProperties = z
        .object({
          listId: shortUUIDSchema,
        })
        .safeParse(thisPage.params);
      if (!safeParseProperties.success) return;

      return {
        name: 'List',
        properties: {
          list_id: safeParseProperties.data.listId,
        },
      };
    }
    case 'routes/_builder/detection/analytics/_layout': {
      return { name: 'Analytics', properties: undefined };
    }
    case 'routes/_builder/data/list': {
      return { name: 'Your data', properties: undefined };
    }
    case 'routes/_builder/settings/api-keys': {
      return { name: 'Marble API', properties: undefined };
    }
  }
}
