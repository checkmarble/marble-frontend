import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = (ruleId: string) =>
  getRoute('/ressources/scenario-iteration-rules/:ruleId/generate', {
    ruleId,
  });

export function useGenerateRuleMutation(ruleId: string) {
  return useMutation({
    mutationKey: ['scenario-iteration-rule', 'generate-ast', ruleId],
    mutationFn: async ({ instruction }: { instruction: string }) => {
      const response = await fetch(endpoint(ruleId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate rule');
      }

      return (await response.json()) as { success: boolean };
    },
  });
}
