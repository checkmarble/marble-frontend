import { type AstNode } from '@app-builder/models';
import { generateAstFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export interface GenerateRuleResult {
  success: boolean;
  ruleAst?: AstNode;
  validation?: { isValid: boolean; errors: string[]; warnings: string[] };
}

export function useGenerateRuleMutation(scenarioId: string) {
  const generateAst = useServerFn(generateAstFn);

  return useMutation({
    mutationKey: ['scenario', 'generate-ast', scenarioId],
    mutationFn: async ({ ruleId, instruction }: { ruleId: string; instruction: string }) =>
      generateAst({ data: { scenarioId, ruleId, instruction } }) as Promise<GenerateRuleResult>,
  });
}
