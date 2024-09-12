import { outcomes } from '@app-builder/models/outcome';
import {
  type Scenario,
  type ScenarioUpdateWorkflowInput,
} from '@app-builder/models/scenario';
import * as R from 'remeda';
import { assertNever } from 'typescript-utils';
import * as z from 'zod';

type GlobalError =
  | { type: 'missing-trigger-node' }
  | { type: 'multiple-trigger-nodes' }
  | { type: 'empty-nodes'; nodeId: string }
  | { type: 'graph-loop' };

type NodeError =
  | { type: 'invalid-node-config'; nodeId: string }
  | { type: 'multiple-outgoing-nodes'; nodeId: string }
  | { type: 'missing-outgoing-node'; nodeId: string }
  | { type: 'wrong-outgoing-node'; nodeId: string }
  | { type: 'no-outgoing-node-required'; nodeId: string }
  | {
      type: 'not-connected-to-trigger';
      nodeId: string;
    };

function isNodeError(error: WorkflowError): error is NodeError {
  return (
    error.type === 'invalid-node-config' ||
    error.type === 'not-connected-to-trigger' ||
    error.type === 'multiple-outgoing-nodes' ||
    error.type === 'missing-outgoing-node' ||
    error.type === 'no-outgoing-node-required' ||
    error.type === 'wrong-outgoing-node'
  );
}

export type WorkflowError = GlobalError | NodeError;

export type ValidationPayload<T = undefined> =
  | (T extends undefined ? { isValid: true } : { isValid: true; value: T })
  | { isValid: false; errors: WorkflowError[] };

export interface GlobalChecklistVM {
  hasMissingTriggerNode: boolean;
  hasMultipleTriggerNodes: boolean;
  hasEmptyNodes: boolean;
  hasGraphLoop: boolean;
}

export function adaptGlobalChecklistVM(
  errors: WorkflowError[],
): GlobalChecklistVM {
  const hasMissingTriggerNode = errors.some(
    (error) => error.type === 'missing-trigger-node',
  );
  const hasMultipleTriggerNodes = errors.some(
    (error) => error.type === 'multiple-trigger-nodes',
  );
  const hasEmptyNodes = errors.some((error) => error.type === 'empty-nodes');
  const hasGraphLoop = errors.some((error) => error.type === 'graph-loop');

  return {
    hasMissingTriggerNode,
    hasMultipleTriggerNodes,
    hasEmptyNodes,
    hasGraphLoop,
  };
}

export interface NodeChecklistVM {
  hasInvalidConfig: boolean;
  isNotConnectedToTrigger: boolean;
  hasMultipleOutgoingNode: boolean;
  hasMissingOutgoingNode: boolean;
  hasWrongOutgoinNode: boolean;
  noOutgoingNodeRequired: boolean;
}

export function adaptNodeChecklistVM(
  errors: WorkflowError[],
): Record<string, NodeChecklistVM> {
  return R.pipe(
    errors,
    R.filter(isNodeError),
    R.groupBy((error) => error.nodeId),
    R.mapValues((errors) => ({
      hasInvalidConfig: errors.some(
        (error) => error.type === 'invalid-node-config',
      ),
      isNotConnectedToTrigger: errors.some(
        (error) => error.type === 'not-connected-to-trigger',
      ),
      hasMultipleOutgoingNode: errors.some(
        (error) => error.type === 'multiple-outgoing-nodes',
      ),
      hasMissingOutgoingNode: errors.some(
        (error) => error.type === 'missing-outgoing-node',
      ),
      hasWrongOutgoinNode: errors.some(
        (error) => error.type === 'wrong-outgoing-node',
      ),
      noOutgoingNodeRequired: errors.some(
        (error) => error.type === 'no-outgoing-node-required',
      ),
    })),
  );
}

export const decisionCreatedTriggerSchema = z.object({
  scenarioId: z.string(),
  outcomes: z.array(z.enum(outcomes)).nonempty(),
});
export type ValidDecisionCreatedTrigger = z.infer<
  typeof decisionCreatedTriggerSchema
>;

export const createCaseActionSchema = z.object({
  inboxId: z.string(),
});
export type ValidCreateCaseAction = z.infer<typeof createCaseActionSchema>;

export const addToCaseIfPossibleActionSchema = z.object({
  inboxId: z.string(),
});
export type ValidAddToCaseIfPossibleAction = z.infer<
  typeof addToCaseIfPossibleActionSchema
>;

export type ValidDecisionCreatedWorkflow =
  | {
      type: 'CREATE_CASE';
      trigger: ValidDecisionCreatedTrigger;
      action: ValidCreateCaseAction;
    }
  | {
      type: 'ADD_TO_CASE_IF_POSSIBLE';
      trigger: ValidDecisionCreatedTrigger;
      action: ValidAddToCaseIfPossibleAction;
    };

export type ValidWorkflow = ValidDecisionCreatedWorkflow;

export function adaptValidWorkflow(
  scenario: Scenario,
): ValidWorkflow | undefined {
  switch (scenario.decisionToCaseWorkflowType) {
    case 'DISABLED':
      return undefined;
    case 'CREATE_CASE':
    case 'ADD_TO_CASE_IF_POSSIBLE': {
      if (!scenario.decisionToCaseInboxId) {
        return undefined;
      }
      const firstOutcome = scenario.decisionToCaseOutcomes[0];
      if (!firstOutcome) {
        return undefined;
      }
      return {
        type: scenario.decisionToCaseWorkflowType,
        trigger: {
          scenarioId: scenario.id,
          outcomes: [firstOutcome, ...scenario.decisionToCaseOutcomes.slice(1)],
        },
        action: {
          inboxId: scenario.decisionToCaseInboxId,
        },
      };
    }
    default:
      assertNever(
        'Unknown decisionToCaseWorkflowType',
        scenario.decisionToCaseWorkflowType,
      );
  }
}

export function adaptScenarioUpdateWorkflowInput(
  workflow: ValidWorkflow | undefined,
): ScenarioUpdateWorkflowInput {
  if (!workflow) {
    return {
      decisionToCaseWorkflowType: 'DISABLED',
    };
  }

  return {
    decisionToCaseWorkflowType: workflow.type,
    decisionToCaseInboxId: workflow.action.inboxId,
    decisionToCaseOutcomes: workflow.trigger.outcomes,
  };
}
