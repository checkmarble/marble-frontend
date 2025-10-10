import { AstNode } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

export type RuleDescriptionPayload = {
  astNode: AstNode;
};

const endpoint = getRoute('/ressources/scenarios/rule-description');

export const useRuleDescriptionMutation = (identifier?: string) => {
  return useMutation({
    mutationKey: ['scenario-iteration-rule', 'rule-description', identifier],
    mutationFn: async (payload: RuleDescriptionPayload) => {
      const response = await fetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      return response.json() as Promise<{ success: true; data: string }>;
    },
  });
};
