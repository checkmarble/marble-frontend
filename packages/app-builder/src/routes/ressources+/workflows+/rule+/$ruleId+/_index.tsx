import { AstNode } from '@app-builder/models/astNode/ast-node';
import {
  type Rule,
  WorkflowAction,
  WorkflowCondition,
} from '@app-builder/models/scenario/workflow';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const ruleId = params['ruleId'];
  invariant(ruleId, 'ruleId is required');

  if (request.method === 'PUT') {
    const { rule, scenarioId } = (await request.json()) as { rule: Rule; scenarioId: string };
    try {
      // Update the rule basic properties
      await scenario.updateWorkflowRule({
        ruleId,
        name: rule.name,
        fallthrough: rule.fallthrough,
      });

      // Update conditions
      if (rule.conditions) {
        for (const condition of rule.conditions) {
          // Create condition payload based on the function type
          const conditionPayload = (() => {
            switch (condition.function) {
              case 'always':
                return { function: 'always' as const };
              case 'never':
                return { function: 'never' as const };
              case 'outcome_in':
                return {
                  function: 'outcome_in' as const,
                  params: condition.params,
                };
              case 'rule_hit':
                return {
                  function: 'rule_hit' as const,
                  params: condition.params,
                };
              case 'payload_evaluates':
                return {
                  function: 'payload_evaluates' as const,
                  params: condition.params,
                };
            }
          })();

          // Check if condition has a real ID (not a temporary frontend ID)
          const hasRealId = condition.id && !condition.id.startsWith('temp-');
          if (hasRealId) {
            // Update existing condition
            await scenario.updateWorkflowCondition({
              ruleId,
              conditionId: condition.id,
              condition: {
                id: condition.id,
                ...conditionPayload,
              },
            });
          } else {
            // Create new condition
            await scenario.createWorkflowCondition({
              ruleId,
              condition: conditionPayload as WorkflowCondition,
            });
          }
        }
      }

      // Update actions - First get current rule to see existing actions
      const currentWorkflows = await scenario.listWorkflowRules({ scenarioId });
      const currentRuleData = currentWorkflows.find((r) => r.id === ruleId);

      // Delete all existing actions first
      if (currentRuleData?.actions) {
        for (const existingAction of currentRuleData.actions) {
          await scenario.deleteWorkflowAction({
            ruleId,
            actionId: existingAction.id,
          });
        }
      }

      // Create new actions
      if (rule.actions) {
        for (const action of rule.actions) {
          // Create action payload based on the action type
          const actionPayload = (() => {
            switch (action.action) {
              case 'DISABLED':
                return { action: 'DISABLED' as const };
              case 'CREATE_CASE':
                return {
                  action: 'CREATE_CASE' as const,
                  params: action.params as {
                    inboxId: string;
                    anyInbox?: boolean;
                    titleTemplate?: AstNode;
                  },
                };
              case 'ADD_TO_CASE_IF_POSSIBLE':
                return {
                  action: 'ADD_TO_CASE_IF_POSSIBLE' as const,
                  params: action.params as {
                    inboxId: string;
                    anyInbox?: boolean;
                    titleTemplate?: AstNode;
                  },
                };
            }
          })();

          // Always create new action (since we deleted all existing ones)
          await scenario.createWorkflowAction({
            ruleId,
            action: actionPayload as WorkflowAction,
          });
        }
      }

      return Response.json({ success: true });
    } catch (error) {
      console.error('Failed to update workflow rule:', error);
      return Response.json({ error: 'Failed to update rule' }, { status: 500 });
    }
  }

  if (request.method === 'DELETE') {
    try {
      await scenario.deleteWorkflowRule({ ruleId });
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error('Failed to delete workflow rule:', error);
      return Response.json({ error: 'Failed to delete rule' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
