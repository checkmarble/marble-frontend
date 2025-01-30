import { type AstNode } from './astNode/ast-node';

export interface ScenarioIterationSanction {
  id: string;
  scenarioIterationId: string;
  name: string;
  description: string;
  ruleGroup: string;
  trigger: AstNode | null;
  createdAt: string;
}

export interface CreateScenarioIterationSanctionInput {
  scenarioIterationId: string;
  name: string;
  description: string;
  ruleGroup: string;
  trigger: AstNode | null;
}

export interface UpdateScenarioIterationSanctionInput {
  sanctionId: string;
  displayOrder?: number;
  name?: string;
  description?: string;
  ruleGroup?: string;
  trigger?: AstNode | null;
}
