import { type AstNode } from '@app-builder/models';
import { getRuleDescriptionFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export type RuleDescriptionPayload = {
  scenarioId: string;
  astNode: AstNode;
};

export const useRuleDescriptionMutation = (identifier?: string) => {
  const getRuleDescription = useServerFn(getRuleDescriptionFn);

  return useMutation({
    mutationKey: ['scenario-iteration-rule', 'rule-description', identifier],
    mutationFn: async (payload: RuleDescriptionPayload) => {
      const result = await getRuleDescription({
        data: { scenarioId: payload.scenarioId, astNode: payload.astNode },
      });
      return { success: true as const, data: result };
    },
  });
};
