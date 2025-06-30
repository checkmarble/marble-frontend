import { Rule } from '@app-builder/models/scenario/workflow';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type CreateRuleInput = {
  scenarioId: string;
  name: string;
  fallthrough: boolean;
};

export function useCreateRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRuleInput): Promise<Rule> => {
      const response = await fetch('/ressources/workflows/rule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario_id: input.scenarioId,
          name: input.name,
          fallthrough: input.fallthrough,
          conditions: [],
          actions: [{ action: 'DISABLED' }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create rule');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the rules query
      queryClient.invalidateQueries({ queryKey: ['workflow-rules', variables.scenarioId] });
    },
  });
}
