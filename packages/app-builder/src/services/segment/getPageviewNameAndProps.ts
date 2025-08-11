import { type RouteID } from '@app-builder/utils/routes';
import { shortUUIDSchema } from '@app-builder/utils/schema/shortUUIDSchema';
import { type UIMatch } from '@remix-run/react';
import * as z from 'zod/v4';

interface PageViewNameAndProps {
  name: string;
  properties: Record<string, string> | undefined;
}

export function getPageViewNameAndProps(thisPage: UIMatch): PageViewNameAndProps | undefined {
  switch (thisPage.id as RouteID) {
    case 'routes/_builder+/scenarios+/_index': {
      return { name: 'Scenarios', properties: undefined };
    }
    case 'routes/_builder+/scenarios+/$scenarioId+/scheduled-executions': {
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
    case 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/trigger': {
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
    case 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/rules': {
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
    case 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/decision': {
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
    case 'routes/_builder+/decisions+/_index': {
      return { name: 'Decisions', properties: undefined };
    }
    case 'routes/_builder+/decisions+/$decisionId': {
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
    case 'routes/_builder+/cases+/_index': {
      return { name: 'Cases', properties: undefined };
    }
    case 'routes/_builder+/lists+/_index': {
      return { name: 'Lists', properties: undefined };
    }
    case 'routes/_builder+/lists+/$listId': {
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
    case 'routes/_builder+/analytics': {
      return { name: 'Analytics', properties: undefined };
    }
    case 'routes/_builder+/data+/list': {
      return { name: 'Your data', properties: undefined };
    }
    case 'routes/_builder+/data+/schema': {
      return { name: 'Your data (schema)', properties: undefined };
    }
    case 'routes/_builder+/api': {
      return { name: 'Marble API', properties: undefined };
    }

    // Transfercheck
    case 'routes/transfercheck+/transfers+/_index': {
      return { name: 'Transfers', properties: undefined };
    }
    case 'routes/transfercheck+/transfers+/$transferId': {
      const safeParseProperties = z
        .object({
          transferId: shortUUIDSchema,
        })
        .safeParse(thisPage.params);
      if (!safeParseProperties.success) return;

      return {
        name: 'Transfer',
        properties: {
          transfer_id: safeParseProperties.data.transferId,
        },
      };
    }
  }
}
