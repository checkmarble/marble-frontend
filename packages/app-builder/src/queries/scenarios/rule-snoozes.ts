import { type RuleSnoozeInformation } from '@app-builder/models/rule-snooze';
import { getRuleSnoozeFn } from '@app-builder/server-fns/scenarios';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useRuleSnoozesQuery = (scenarioId: string, iterationId: string) => {
  const getRuleSnooze = useServerFn(getRuleSnoozeFn);

  return useQuery({
    queryKey: ['scenarios', 'iterations', 'ruleSnoozes', scenarioId, iterationId],
    queryFn: async () => getRuleSnooze({ data: { iterationId } }) as Promise<{ ruleSnoozes: RuleSnoozeInformation[] }>,
  });
};
