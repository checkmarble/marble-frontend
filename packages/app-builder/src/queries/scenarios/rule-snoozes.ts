import { RuleSnoozeInformation } from '@app-builder/models/rule-snooze';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useQuery } from '@tanstack/react-query';

const endpoint = (scenarioId: string, iterationId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/:iterationId/get-rule-snoozes', {
    scenarioId: fromUUIDtoSUUID(scenarioId),
    iterationId: fromUUIDtoSUUID(iterationId),
  });

export const useRuleSnoozesQuery = (scenarioId: string, iterationId: string) => {
  return useQuery({
    queryKey: ['scenarios', 'iterations', 'ruleSnoozes', scenarioId, iterationId],
    queryFn: async () => {
      const response = await fetch(endpoint(scenarioId, iterationId));
      return response.json() as Promise<{ ruleSnoozes: RuleSnoozeInformation[] }>;
    },
  });
};
