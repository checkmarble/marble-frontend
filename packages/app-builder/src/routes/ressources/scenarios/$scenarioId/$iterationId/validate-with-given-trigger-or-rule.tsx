import {
  adaptNodeDto,
  adaptScenarioValidation,
  type AstNode,
} from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { findRuleValidation } from '@app-builder/services/validation';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type NodeDto } from 'marble-api';
import { useCallback } from 'react';

export async function action({ request, params }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const body = (await request.json()) as {
    trigger_or_rule: NodeDto;
    rule_id: string | null;
  };

  const iterationId = fromParams(params, 'iterationId');

  const validationDto = (
    await apiClient.validateScenarioIterationWithGivenTriggerOrRule(
      iterationId,
      body
    )
  ).scenario_validation;

  const validation = adaptScenarioValidation(validationDto);

  return json(validation);
}

export function useScenarioValidationFetcher(
  scenarioId: string,
  iterationId: string
) {
  const fetcher = useFetcher<typeof action>();

  const validate = useCallback(
    (triggerOrRule: AstNode, ruleId: string | null) => {
      fetcher.submit(
        {
          trigger_or_rule: adaptNodeDto(triggerOrRule),
          rule_id: ruleId,
        },
        {
          method: 'POST',
          encType: 'application/json',
          action: `/ressources/scenarios/${encodeURIComponent(
            scenarioId
          )}/${encodeURIComponent(
            fromUUID(iterationId)
          )}/validate-with-given-trigger-or-rule`,
        }
      );
    },
    [fetcher, iterationId, scenarioId]
  );

  return {
    validate,
    validation: fetcher.data ?? null,
  };
}

export function useTriggerOrRuleValidationFetcher(
  scenarioId: string,
  iterationId: string,
  ruleId: string | null = null
) {
  const { validate, validation: scenarioValidation } =
    useScenarioValidationFetcher(scenarioId, iterationId);

  const validateTriggerOrRule = useCallback(
    (ast: AstNode) => {
      validate(ast, ruleId);
    },
    [ruleId, validate]
  );

  const triggerOrRuleValidation =
    scenarioValidation === null
      ? null
      : ruleId === null
      ? scenarioValidation.trigger.triggerEvaluation
      : findRuleValidation(scenarioValidation, ruleId).ruleEvaluation;

  return {
    validate: validateTriggerOrRule,
    validation: triggerOrRuleValidation,
  };
}
