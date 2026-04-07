import { prepareScoringRulesetFn } from '@app-builder/server-fns/scoring';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';

export const usePrepareScoringRulesetMutation = () => {
  const prepareScoringRuleset = useServerFn(prepareScoringRulesetFn);
  const router = useRouter();

  return useMutation({
    mutationKey: ['scoring', 'prepare-ruleset'],
    mutationFn: async (recordType: string) => {
      await prepareScoringRuleset({ data: { recordType } });
    },
    onSuccess: () => {
      router.invalidate();
    },
  });
};
