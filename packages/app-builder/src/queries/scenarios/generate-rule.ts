import { type AstNode } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

export interface GenerateRuleResult {
  success: boolean;
  ruleAst?: AstNode;
  validation?: { isValid: boolean; errors: string[]; warnings: string[] };
}

const endpoint = (scenarioId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/generate-ast', {
    scenarioId,
  });

export function useGenerateRuleMutation(scenarioId: string) {
  return useMutation({
    mutationKey: ['scenario', 'generate-ast', scenarioId],
    mutationFn: async ({ ruleId, instruction }: { ruleId: string; instruction: string }) => {
      const response = await fetch(endpoint(scenarioId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_id: ruleId, instruction }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate rule');
      }

      return (await response.json()) as GenerateRuleResult;
    },
  });
}
