import {
  type AlwaysMatches,
  type IfOutcomeIn,
  type NeverMatches,
  WorkflowActionDto,
  WorkflowConditionDetailDto,
  WorkflowConditionDto,
  type WorkflowRuleDto,
} from 'marble-api';
import { AstNode, adaptAstNode } from '../astNode/ast-node';

export type WorkflowAction = WorkflowActionDto;

export type RuleDto = WorkflowRuleDto & {
  conditions: WorkflowConditionDto[];
  actions: WorkflowActionDto[];
};

export type WorkflowConditionDetail = WorkflowConditionDetailDto;

export type Rule = WorkflowRuleDto & {
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
};

export type WorkflowCondition = {
  id: string;
} & (
  | AlwaysMatches
  | NeverMatches
  | IfOutcomeIn
  | {
      function: 'rule_hit';
      params: {
        /** ID of a rule that must match */
        rule_id: string;
      };
    }
  | {
      function: 'payload_evaluates';
      params: {
        expression: AstNode;
      };
    }
);

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
  if (dto.function === 'payload_evaluates') {
    return {
      id: dto.id,
      function: 'payload_evaluates',
      params: {
        expression: adaptAstNode(dto.params.expression),
      },
    };
  }
  return dto;
}

function adaptWorkflowAction(dto: WorkflowActionDto): WorkflowAction {
  return dto;
}

export type WorkflowFeatureAccess = {
  isCreateInboxAvailable: boolean;
};
