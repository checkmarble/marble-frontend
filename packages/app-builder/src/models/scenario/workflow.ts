import { type WorkflowRuleDto } from 'marble-api';

export type WorkflowCondition = {
  id: string;
  function: string;
  params: unknown[];
};

export type WorkflowAction = {
  id: string;
  action: string;
  params: Record<string, unknown>;
};

export type WorkflowRule = {
  id: string;
  name: string;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  rules: WorkflowRule[];
};

export function adaptWorkflowRule(dto: WorkflowRuleDto): WorkflowRule {
  return {
    id: dto.id,
    name: dto.name,
    conditions: [],
    actions: [],
  };
}
