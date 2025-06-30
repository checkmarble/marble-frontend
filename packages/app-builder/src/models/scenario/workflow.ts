import {
  WorkflowActionDto,
  WorkflowConditionDetailDto,
  WorkflowConditionDto,
  type WorkflowRuleDto,
} from 'marble-api';

export type WorkflowAction = WorkflowActionDto;

export type WorkflowConditionDetail = WorkflowConditionDetailDto;

export type RuleDto = WorkflowRuleDto & {
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
};

// export type Rule = Omit<RuleDto, 'id'> & { id?: string };
export type Rule = RuleDto;

export type WorkflowCondition = WorkflowConditionDto;

export function adaptWorkflow(dtos: RuleDto[]): Rule[] {
  return dtos.map((dto) => ({
    id: dto.id,
    name: dto.name,
    fallthrough: dto.fallthrough,
    conditions: dto.conditions.map(adaptWorkflowCondition),
    actions: dto.actions.map(adaptWorkflowAction),
  }));
}

export function adaptWorkflowRule(dto: RuleDto): Rule {
  return {
    id: dto.id,
    name: dto.name,
    fallthrough: dto.fallthrough,
    conditions: dto.conditions.map(adaptWorkflowCondition),
    actions: dto.actions.map(adaptWorkflowAction),
  };
}

function adaptWorkflowCondition(dto: WorkflowConditionDto): WorkflowCondition {
  return dto;
}

function adaptWorkflowAction(dto: WorkflowActionDto): WorkflowAction {
  return dto;
}
