import {
  type AstNode,
  NewEmpytyRuleAstNode,
  NewEmpytyTriggerAstNode,
  type NodeEvaluation,
  type ScenarioIterationRule,
} from '@app-builder/models';
import { type ScenarioRepository } from '@app-builder/repositories/ScenarioRepository';

export interface ScenarioServerService {
  getScenarioIterationTrigger(args: { iterationId: string }): Promise<{
    ast: AstNode;
    validation: NodeEvaluation;
  }>;
  getScenarioIterationRule(args: {
    iterationId: string;
    ruleId: string;
  }): Promise<
    Omit<ScenarioIterationRule, 'formula'> & {
      ast: AstNode;
      validation: NodeEvaluation;
    }
  >;
}

export function makeScenarioServerService(
  scenarioRepository: ScenarioRepository
): ScenarioServerService {
  return {
    getScenarioIterationTrigger: async ({ iterationId }) => {
      const scenarioIteration = await scenarioRepository.getScenarioIteration({
        iterationId,
      });
      const ast = scenarioIteration.trigger ?? NewEmpytyTriggerAstNode();
      const validation =
        await scenarioRepository.validateScenarioIterationTrigger({
          iterationId,
          trigger: ast,
        });

      return {
        ast,
        validation,
      };
    },
    getScenarioIterationRule: async ({ iterationId, ruleId }) => {
      const scenarioIterationRule =
        await scenarioRepository.getScenarioIterationRule({
          ruleId,
        });
      const ast = scenarioIterationRule.formula ?? NewEmpytyRuleAstNode();
      const validation = await scenarioRepository.validateScenarioIterationRule(
        {
          iterationId,
          ruleId,
          rule: ast,
        }
      );

      return {
        ...scenarioIterationRule,
        ast,
        validation,
      };
    },
  };
}
