import { useMutation } from '@tanstack/react-query';

export function useGenerateRuleMutation(ruleId: string) {
  return useMutation({
    mutationFn: async ({ instruction }: { instruction: string }) => {
      const response = await fetch(`/ressources/scenario-iteration-rules/${ruleId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate rule: ${response.statusText}`);
      }
    },
  });
}
