import { AstNode, adaptAstNode, adaptNodeDto } from '@app-builder/models/astNode/ast-node';
import {
  ActionDoNothing,
  type AlwaysMatches,
  type IfOutcomeIn,
  type NeverMatches,
  ScenarioRuleLatestVersionDto,
  WorkflowActionDto,
  WorkflowConditionDetailDto,
  WorkflowConditionDto,
  type WorkflowRuleDto,
} from 'marble-api';

export type WorkflowAction = {
  id: string;
} & (
  | ActionDoNothing
  | {
      action: 'CREATE_CASE' | 'ADD_TO_CASE_IF_POSSIBLE';
      params: {
        inboxId: string;
        anyInbox?: boolean;
        titleTemplate?: AstNode;
      };
    }
);

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
        ruleIds: string[];
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

export function adaptWorkflowCondition(dto: WorkflowConditionDto): WorkflowCondition {
  if (dto.function === 'payload_evaluates') {
    return {
      id: dto.id,
      function: 'payload_evaluates',
      params: {
        expression: adaptAstNode(dto.params.expression),
      },
    };
  }
  if (dto.function === 'rule_hit') {
    return {
      id: dto.id,
      function: 'rule_hit',
      params: {
        // Backend returns snake_case 'rule_id', adapt to frontend 'ruleIds'
        ruleIds: dto.params.rule_id,
      },
    };
  }
  return dto;
}

export function transformWorkflowCondition(condition: WorkflowCondition): WorkflowConditionDetailDto {
  if (condition.function === 'payload_evaluates') {
    return {
      function: 'payload_evaluates',
      params: {
        expression: adaptNodeDto(condition.params.expression),
      },
    };
  }
  if (condition.function === 'rule_hit') {
    return {
      function: 'rule_hit',
      params: {
        // Backend expects snake_case 'rule_id'
        rule_id: condition.params.ruleIds,
      },
    };
  }
  return condition;
}

export function adaptWorkflowAction(dto: WorkflowActionDto): WorkflowAction {
  switch (dto.action) {
    case 'CREATE_CASE':
    case 'ADD_TO_CASE_IF_POSSIBLE':
      return {
        ...dto,
        params: {
          inboxId: dto.params.inbox_id,
          anyInbox: dto.params.any_inbox,
          titleTemplate: dto.params.title_template && adaptAstNode(dto.params.title_template),
        },
      };
    default:
      return dto;
  }
}

export function transformWorkflowAction(action: WorkflowAction): WorkflowActionDto {
  switch (action.action) {
    case 'CREATE_CASE':
    case 'ADD_TO_CASE_IF_POSSIBLE':
      return {
        ...action,
        params: {
          inbox_id: action.params.inboxId,
          any_inbox: action.params.anyInbox,
          title_template: action.params.titleTemplate && adaptNodeDto(action.params.titleTemplate),
        },
      };
    case 'DISABLED':
      return {
        id: action.id,
        action: 'DISABLED',
      };
  }
}

export type ScenarioRuleLatestVersion = {
  type: 'rule' | 'screening';
  stableId: string;
  name: string;
  latestVersion: string;
};

export type ScenarioRuleLatestVersionMap = Map<string, ScenarioRuleLatestVersion>;

export function adaptScenarioRulesLatestVersion(dto: ScenarioRuleLatestVersionDto): ScenarioRuleLatestVersion {
  return {
    type: dto.type,
    stableId: dto.stable_id,
    name: dto.name,
    latestVersion: dto.latest_version,
  };
}

export type WorkflowFeatureAccess = {
  isCreateInboxAvailable: boolean;
};
