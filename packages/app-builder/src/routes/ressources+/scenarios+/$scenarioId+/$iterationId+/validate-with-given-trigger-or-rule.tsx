import { type AstNode } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useCallback } from 'react';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const body = (await request.json()) as TriggerValidationArgs | RuleValidationArgs;

  const iterationId = fromParams(params, 'iterationId');

  if ('rule' in body) {
    const validation = await scenario.validateRule({ iterationId, ...body });

    return validation.ruleEvaluation;
  }

  const validation = await scenario.validateTrigger({ iterationId, ...body });

  return validation.triggerEvaluation;
}

type TriggerValidationArgs = {
  trigger: AstNode;
};

export function useTriggerValidationFetcher(scenarioId: string, iterationId: string) {
  const fetcher = useFetcher<typeof action>();

  const validate = useCallback(
    (ast: AstNode) => {
      const args: TriggerValidationArgs = {
        trigger: ast,
      };
      fetcher.submit(args, {
        method: 'POST',
        encType: 'application/json',
        action: getRoute(
          '/ressources/scenarios/:scenarioId/:iterationId/validate-with-given-trigger-or-rule',
          {
            scenarioId: fromUUIDtoSUUID(scenarioId),
            iterationId: fromUUIDtoSUUID(iterationId),
          },
        ),
      });
    },
    [fetcher, iterationId, scenarioId],
  );

  return {
    validate,
    validation: fetcher.data ?? null,
  };
}

type RuleValidationArgs = {
  rule: AstNode;
  ruleId: string;
};

export function useRuleValidationFetcher(scenarioId: string, iterationId: string, ruleId: string) {
  const fetcher = useFetcher<typeof action>();

  const validate = useCallback(
    (ast: AstNode) => {
      const args: RuleValidationArgs = {
        rule: ast,
        ruleId,
      };
      fetcher.submit(args, {
        method: 'POST',
        encType: 'application/json',
        action: getRoute(
          '/ressources/scenarios/:scenarioId/:iterationId/validate-with-given-trigger-or-rule',
          {
            scenarioId: fromUUIDtoSUUID(scenarioId),
            iterationId: fromUUIDtoSUUID(iterationId),
          },
        ),
      });
    },
    [fetcher, iterationId, scenarioId, ruleId],
  );

  return {
    validate,
    validation: fetcher.data ?? null,
  };
}
