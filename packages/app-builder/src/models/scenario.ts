import {
  type Outcome,
  type ScenarioCreateInputDto,
  type ScenarioDto,
  type ScenarioUpdateInputDto,
} from 'marble-api';

type DecisionToCaseWorkflowType =
  | 'DISABLED'
  | 'CREATE_CASE'
  | 'ADD_TO_CASE_IF_POSSIBLE';

export interface Scenario {
  id: string;
  createdAt: string;
  decisionToCaseInboxId?: string;
  decisionToCaseOutcomes: Outcome[];
  decisionToCaseWorkflowType: DecisionToCaseWorkflowType;
  description: string;
  liveVersionId?: string;
  name: string;
  organizationId: string;
  triggerObjectType: string;
}

export function adaptScenario(dto: ScenarioDto): Scenario {
  return {
    id: dto.id,
    createdAt: dto.createdAt,
    decisionToCaseInboxId: dto.decision_to_case_inbox_id,
    decisionToCaseOutcomes: dto.decision_to_case_outcomes,
    decisionToCaseWorkflowType: dto.decision_to_case_workflow_type,
    description: dto.description,
    liveVersionId: dto.liveVersionId,
    name: dto.name,
    organizationId: dto.organization_id,
    triggerObjectType: dto.triggerObjectType,
  };
}

export interface ScenarioCreateInput {
  name: string;
  description: string;
  triggerObjectType: string;
}

export function adaptScenarioCreateInputDto(
  input: ScenarioCreateInput,
): ScenarioCreateInputDto {
  return {
    name: input.name,
    description: input.description,
    triggerObjectType: input.triggerObjectType,
  };
}

export type ScenarioUpdateWorkflowInput =
  | {
      decisionToCaseWorkflowType: 'DISABLED';
    }
  | {
      decisionToCaseWorkflowType: 'CREATE_CASE' | 'ADD_TO_CASE_IF_POSSIBLE';
      decisionToCaseInboxId: string;
      decisionToCaseOutcomes: Outcome[];
    };

export function adaptScenarioUpdateInputDto(
  input: ScenarioUpdateWorkflowInput,
): ScenarioUpdateInputDto {
  if (input.decisionToCaseWorkflowType === 'DISABLED') {
    return {
      decision_to_case_workflow_type: 'DISABLED',
    };
  }
  return {
    decision_to_case_inbox_id: input.decisionToCaseInboxId,
    decision_to_case_outcomes: input.decisionToCaseOutcomes,
    decision_to_case_workflow_type: input.decisionToCaseWorkflowType,
  };
}
