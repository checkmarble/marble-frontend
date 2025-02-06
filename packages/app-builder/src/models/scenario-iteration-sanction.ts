import { type AstNode } from './astNode/ast-node';

export interface ScenarioIterationSanction {
  id: string;
  scenarioIterationId: string;
  displayOrder: number;
  name: string;
  description: string;
  ruleGroup: string;
  formula: AstNode | null;
  counterPartyName: AstNode[];
  transactionLabel: AstNode[];
  createdAt: string;
}

export interface CreateScenarioIterationSanctionInput {
  scenarioIterationId: string;
  displayOrder: number;
  name: string;
  description: string;
  ruleGroup: string;
  formula: AstNode | null;
  counterPartyName: AstNode[];
  transationLabel: AstNode[];
}

export interface UpdateScenarioIterationSanctionInput {
  sanctionId: string;
  displayOrder?: number;
  name?: string;
  description?: string;
  ruleGroup?: string;
  formula?: AstNode | null;
  counterPartyName?: AstNode[];
  transactionLabel?: AstNode[];
}
